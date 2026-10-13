import { describe, it, expect, beforeEach } from "vitest";
import { JobRunner } from "./runner";
import { getRuntimeDb } from "../database";
import { jobRuns, users } from "../database/schema";
import { batches, variants } from "../catalog/schema";
import { orders } from "../commerce/schema";
import { chatConversations, chatMessages } from "../chatbot/schema";
import { queueJobs } from "../notifications/schema";
import { eq, sql } from "drizzle-orm";

describe("JobRunner - Background Jobs and Retention Subsystem", () => {
  const db = getRuntimeDb();
  let testUserId: string;

  beforeEach(async () => {
    // Clean up test data
    await db.delete(jobRuns);
    await db.delete(queueJobs);

    // Ensure at least one test user exists
    const [user] = await db
      .insert(users)
      .values({
        email: `worker_test_${Date.now()}@example.com`,
        passwordHash: "dummyhash",
        role: "staff",
      })
      .returning();
    testUserId = user!.id;
  });

  it("executes alert_digest and logs outcome to job_runs", async () => {
    const result = await JobRunner.runJob("alert_digest");

    expect(result.outcome).toBe("success");
    expect(result.summary).toHaveProperty("nearExpiryCount");
    expect(result.summary).toHaveProperty("lowStockCount");
    expect(result.summary).toHaveProperty("deadLetterQueueCount");

    // Verify record in job_runs table
    const [run] = await db
      .select()
      .from(jobRuns)
      .where(eq(jobRuns.jobName, "alert_digest"))
      .orderBy(sql`${jobRuns.startedAt} DESC`)
      .limit(1);

    expect(run).toBeDefined();
    expect(run?.outcome).toBe("success");
  });

  it("executes batch_expiry_check and flags past-due batches as expired", async () => {
    const [variant] = await db.select().from(variants).limit(1);

    if (variant) {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const [batch] = await db
        .insert(batches)
        .values({
          variantId: variant.id,
          lotNumber: `EXP_${Date.now()}`,
          manufacturedOn: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000),
          expiresOn: yesterday,
          receivedQuantity: 50,
          onHand: 50,
          reserved: 0,
          quarantined: 0,
          status: "available",
        })
        .returning();

      const result = await JobRunner.runJob("batch_expiry_check");
      expect(result.outcome).toBe("success");

      const [refreshed] = await db
        .select()
        .from(batches)
        .where(eq(batches.id, batch!.id));

      expect(refreshed?.status).toBe("expired");
      expect(refreshed?.quarantined).toBe(50);
    }
  });

  it("executes retention_cleanup and purges chat records older than 30 days", async () => {
    const fortyDaysAgo = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000);

    // Create old conversation
    const [conv] = await db
      .insert(chatConversations)
      .values({
        sessionTokenHash: `old_session_${Date.now()}`,
        status: "closed",
        createdAt: fortyDaysAgo,
      })
      .returning();

    await db.insert(chatMessages).values({
      conversationId: conv!.id,
      role: "user",
      content: "Old test conversation message",
      createdAt: fortyDaysAgo,
    });

    const result = await JobRunner.runJob("retention_cleanup");
    expect(result.outcome).toBe("success");

    const [foundConv] = await db
      .select()
      .from(chatConversations)
      .where(eq(chatConversations.id, conv!.id));

    expect(foundConv).toBeUndefined();
  });

  it("executes bank_transfer_expiry and expires unpaid orders older than 48 hours", async () => {
    const threeDaysAgo = new Date(Date.now() - 72 * 60 * 60 * 1000);

    // Create an old pending advance payment order
    const [ord] = await db
      .insert(orders)
      .values({
        publicRef: `ADV-EXP-${Date.now()}`,
        userId: testUserId,
        customerEmail: "farmer@example.com",
        customerPhone: "03001234567",
        shippingAddress: { city: "Multan", address: "123 Farm Road" },
        billingAddress: { city: "Multan", address: "123 Farm Road" },
        state: "pending_payment",
        paymentMethod: "advance_payment",
        subtotalMinor: 500000,
        totalMinor: 500000,
        pricingSnapshot: {},
        createdAt: threeDaysAgo,
      })
      .returning();

    const result = await JobRunner.runJob("bank_transfer_expiry");
    expect(result.outcome).toBe("success");

    const [cancelledOrder] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, ord!.id));

    expect(cancelledOrder?.state).toBe("cancelled");
  });
});
