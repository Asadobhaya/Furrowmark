import { eq, and, sql, lte } from "drizzle-orm";
import { getRuntimeDb } from "../database";
import { jobRuns } from "../database/schema";
import { batches, stockLedger, searchQueries } from "../catalog/schema";
import { orders, carts } from "../commerce/schema";
import { sessions, loginAttempts } from "../database/schema";
import { chatConversations, chatMessages } from "../chatbot/schema";
import { queueJobs } from "../notifications/schema";
import { OrderService } from "../orders/service";
import { NotificationService } from "../notifications/service";

export type JobName =
  | "reservation_expiry"
  | "batch_expiry_check"
  | "notification_dispatch"
  | "retention_cleanup"
  | "alert_digest"
  | "bank_transfer_expiry";

export interface JobExecutionResult {
  jobName: JobName;
  startedAt: Date;
  endedAt: Date;
  outcome: "success" | "failure";
  summary: Record<string, unknown>;
  error?: string;
}

export class JobRunner {
  /**
   * Executes a registered background job, recording its run and summary in job_runs.
   */
  static async runJob(name: JobName): Promise<JobExecutionResult> {
    const db = getRuntimeDb();
    const startedAt = new Date();
    let outcome: "success" | "failure" = "success";
    let summary: Record<string, unknown>;
    let errorMsg: string | undefined;

    try {
      switch (name) {
        case "reservation_expiry":
          summary = await this.executeReservationExpiry();
          break;
        case "batch_expiry_check":
          summary = await this.executeBatchExpiryCheck();
          break;
        case "notification_dispatch":
          summary = await this.executeNotificationDispatch();
          break;
        case "retention_cleanup":
          summary = await this.executeRetentionCleanup();
          break;
        case "alert_digest":
          summary = await this.executeAlertDigest();
          break;
        case "bank_transfer_expiry":
          summary = await this.executeBankTransferExpiry();
          break;
        default:
          throw new Error(`Unknown job name: ${name}`);
      }
    } catch (err) {
      outcome = "failure";
      errorMsg = err instanceof Error ? err.message : String(err);
      summary = { error: errorMsg };
    }

    const endedAt = new Date();

    try {
      await db.insert(jobRuns).values({
        jobName: name,
        startedAt,
        endedAt,
        outcome,
        summary,
      });
    } catch (logErr) {
      // Do not mask original failure if job run logging fails
      console.error("Failed to persist job_runs record:", logErr);
    }

    return {
      jobName: name,
      startedAt,
      endedAt,
      outcome,
      summary,
      error: errorMsg,
    };
  }

  /**
   * 1. reservation_expiry:
   * Identifies orphaned or timed-out orders in pending_payment state that have exceeded
   * their validity window, releasing their stock reservations back to batches.
   */
  static async executeReservationExpiry(): Promise<Record<string, unknown>> {
    const db = getRuntimeDb();
    const now = new Date();
    // Orders in pending_payment older than 24 hours are expired
    const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const expiredOrders = await db
      .select({ id: orders.id, publicRef: orders.publicRef })
      .from(orders)
      .where(
        and(eq(orders.state, "pending_payment"), lte(orders.createdAt, cutoff)),
      );

    let releasedCount = 0;
    for (const ord of expiredOrders) {
      try {
        await OrderService.transitionOrderState({
          orderId: ord.id,
          toState: "cancelled",
          actorId: null,
          actorType: "system",
          reason:
            "Payment window expired (24h timeout). Stock reservation released.",
        });
        releasedCount++;
      } catch (err) {
        console.error(`Error cancelling expired order ${ord.id}:`, err);
      }
    }

    return {
      scannedOrders: expiredOrders.length,
      releasedOrders: releasedCount,
    };
  }

  /**
   * 2. batch_expiry_check:
   * Sets status = 'expired' on batches where expires_on <= now() and status = 'available'.
   * Quarantines expired stock to prevent sale.
   */
  static async executeBatchExpiryCheck(): Promise<Record<string, unknown>> {
    const db = getRuntimeDb();
    const now = new Date();

    const expiredBatches = await db
      .select()
      .from(batches)
      .where(and(eq(batches.status, "available"), lte(batches.expiresOn, now)));

    let updatedCount = 0;
    for (const b of expiredBatches) {
      await db.transaction(async (tx) => {
        await tx
          .update(batches)
          .set({
            status: "expired",
            quarantined: b.onHand,
          })
          .where(eq(batches.id, b.id));

        // System user or fallback null for system actions
        const [systemUser] = await tx
          .select({ id: sql<string>`id` })
          .from(sql`users`)
          .limit(1);

        if (systemUser?.id) {
          await tx.insert(stockLedger).values({
            batchId: b.id,
            movementType: "return_quarantine",
            quantity: b.onHand,
            actorId: systemUser.id,
            reason: `Automated batch expiry check: batch ${b.lotNumber} passed expiration date`,
          });
        }
      });
      updatedCount++;
    }

    return {
      expiredBatchesCount: expiredBatches.length,
      updatedCount,
    };
  }

  /**
   * 3. notification_dispatch:
   * Processes queued email, SMS, and WhatsApp messages with retry backoff.
   */
  static async executeNotificationDispatch(): Promise<Record<string, unknown>> {
    const result = await NotificationService.processPendingQueue(25);
    return {
      processed: result.processed,
      failed: result.failed,
    };
  }

  /**
   * 4. retention_cleanup:
   * Strictly enforces GDPR/statutory data retention policies:
   * - Chat messages > 30 days
   * - Guest carts > 30 days
   * - Expired sessions > 30 days
   * - Search queries > 90 days
   * - Login attempts > 90 days
   */
  static async executeRetentionCleanup(): Promise<Record<string, unknown>> {
    const db = getRuntimeDb();
    const now = new Date();

    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    // 1. Chat messages & conversations older than 30 days
    const oldConvs = await db
      .select({ id: chatConversations.id })
      .from(chatConversations)
      .where(lte(chatConversations.createdAt, thirtyDaysAgo));

    let deletedMessages = 0;
    let deletedConversations = 0;

    if (oldConvs.length > 0) {
      for (const conv of oldConvs) {
        const deletedMsgs = await db
          .delete(chatMessages)
          .where(eq(chatMessages.conversationId, conv.id))
          .returning();
        deletedMessages += deletedMsgs.length;

        await db
          .delete(chatConversations)
          .where(eq(chatConversations.id, conv.id));
        deletedConversations++;
      }
    }

    // 2. Guest carts older than 30 days
    const deletedCarts = await db
      .delete(carts)
      .where(
        and(sql`${carts.userId} IS NULL`, lte(carts.updatedAt, thirtyDaysAgo)),
      )
      .returning();

    // 3. Expired sessions older than 30 days past absolute expiration
    const deletedSessions = await db
      .delete(sessions)
      .where(lte(sessions.absoluteExpiresAt, thirtyDaysAgo))
      .returning();

    // 4. Search queries older than 90 days
    const deletedSearchQueries = await db
      .delete(searchQueries)
      .where(lte(searchQueries.at, ninetyDaysAgo))
      .returning();

    // 5. Login attempts older than 90 days
    const deletedLoginAttempts = await db
      .delete(loginAttempts)
      .where(lte(loginAttempts.at, ninetyDaysAgo))
      .returning();

    return {
      deletedMessages,
      deletedConversations,
      deletedGuestCarts: deletedCarts.length,
      deletedSessions: deletedSessions.length,
      deletedSearchQueries: deletedSearchQueries.length,
      deletedLoginAttempts: deletedLoginAttempts.length,
    };
  }

  /**
   * 5. alert_digest:
   * Aggregates key system alerts:
   * - Low stock (batches with available on_hand - reserved < 10)
   * - Batches expiring within 30 days
   * - High queue job failure count
   */
  static async executeAlertDigest(): Promise<Record<string, unknown>> {
    const db = getRuntimeDb();
    const now = new Date();
    const thirtyDaysFromNow = new Date(
      now.getTime() + 30 * 24 * 60 * 60 * 1000,
    );

    // Near expiry batches
    const nearExpiryBatches = await db
      .select({
        id: batches.id,
        lotNumber: batches.lotNumber,
        expiresOn: batches.expiresOn,
        onHand: batches.onHand,
      })
      .from(batches)
      .where(
        and(
          eq(batches.status, "available"),
          lte(batches.expiresOn, thirtyDaysFromNow),
        ),
      );

    // Low stock batches
    const lowStockBatches = await db
      .select({
        id: batches.id,
        lotNumber: batches.lotNumber,
        onHand: batches.onHand,
        reserved: batches.reserved,
      })
      .from(batches)
      .where(
        and(
          eq(batches.status, "available"),
          sql`${batches.onHand} - ${batches.reserved} < 10`,
        ),
      );

    // Failed queue jobs
    const failedJobs = await db
      .select({
        id: queueJobs.id,
        lastError: queueJobs.lastError,
        attempts: queueJobs.attempts,
      })
      .from(queueJobs)
      .where(sql`${queueJobs.attempts} >= ${queueJobs.maxAttempts}`);

    return {
      nearExpiryCount: nearExpiryBatches.length,
      lowStockCount: lowStockBatches.length,
      deadLetterQueueCount: failedJobs.length,
      generatedAt: now.toISOString(),
    };
  }

  /**
   * 6. bank_transfer_expiry:
   * Cancels unpaid advance bank transfer / Easypaisa orders older than 48 hours.
   */
  static async executeBankTransferExpiry(): Promise<Record<string, unknown>> {
    const db = getRuntimeDb();
    const now = new Date();
    const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    const expiredAdvanceOrders = await db
      .select({ id: orders.id, publicRef: orders.publicRef })
      .from(orders)
      .where(
        and(
          eq(orders.paymentMethod, "advance_payment"),
          eq(orders.state, "pending_payment"),
          lte(orders.createdAt, fortyEightHoursAgo),
        ),
      );

    let cancelledCount = 0;
    for (const ord of expiredAdvanceOrders) {
      try {
        await OrderService.transitionOrderState({
          orderId: ord.id,
          toState: "cancelled",
          actorId: null,
          actorType: "system",
          reason:
            "Advance payment expired (48h bank transfer window elapsed without staff payment verification).",
        });
        cancelledCount++;
      } catch (err) {
        console.error(`Error expiring bank transfer order ${ord.id}:`, err);
      }
    }

    return {
      scannedCount: expiredAdvanceOrders.length,
      cancelledCount,
    };
  }
}
