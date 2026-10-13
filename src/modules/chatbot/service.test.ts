import { describe, it, expect, beforeAll } from "vitest";
import { getRuntimeDb } from "../database";
import { ChatbotService } from "./service";
import { ChatbotTools } from "./tools";
import { checkEmergencyInput } from "./safety";
import {
  categories,
  brands,
  products,
  variants,
  batches,
} from "../catalog/schema";
import { orders } from "../commerce/schema";
import { chatSpendDaily } from "./schema";
import { users } from "../database/schema";
import { eq } from "drizzle-orm";

describe("Phase 7 Customer Support Chatbot & Safety Guardrails", () => {
  let testUserId: string;
  let sampleOrderRef: string;

  beforeAll(async () => {
    const db = getRuntimeDb();

    // 1. Setup user
    const [user] = await db
      .insert(users)
      .values({
        email: `farmer_chat_${Date.now()}@example.com`,
        passwordHash: "dummyhash",
        role: "customer",
      })
      .returning();
    testUserId = user!.id;

    // 2. Setup category, brand, product, variant, batch
    const [cat] = await db
      .insert(categories)
      .values({
        slug: `cat-chat-${Date.now()}`,
        name: "Bio Fungicides",
      })
      .returning();

    const [brand] = await db
      .insert(brands)
      .values({
        name: `Brand-Chat-${Date.now()}`,
      })
      .returning();

    const [prod] = await db
      .insert(products)
      .values({
        categoryId: cat!.id,
        brandId: brand!.id,
        name: "BioShield Organic Fungicide",
        slug: `bioshield-fungicide-${Date.now()}`,
        class: "pesticide",
        status: "published",
        description: "Controls rust and powdery mildew",
        countryOfOrigin: "Pakistan",
        authoredBy: testUserId,
      })
      .returning();

    const [v] = await db
      .insert(variants)
      .values({
        productId: prod!.id,
        sku: `SKU-FUNG-${Date.now()}`,
        packSize: "500 mL",
        packSizeValue: 500,
        packSizeUnit: "ml",
        priceMinor: 150000,
      })
      .returning();

    await db.insert(batches).values({
      variantId: v!.id,
      lotNumber: `LOT-FUNG-${Date.now()}`,
      manufacturedOn: new Date("2026-01-01"),
      expiresOn: new Date("2026-12-31"),
      receivedQuantity: 30,
      onHand: 30,
      reserved: 0,
      quarantined: 0,
      status: "available",
    });

    // 3. Setup test order
    sampleOrderRef = `FM-2026-CH01-${Date.now().toString().slice(-4)}`;
    await db.insert(orders).values({
      publicRef: sampleOrderRef,
      userId: testUserId,
      customerEmail: "chat_order@example.com",
      customerPhone: "03009988776",
      shippingAddress: { city: "Faisalabad" },
      billingAddress: { city: "Faisalabad" },
      state: "shipped",
      paymentMethod: "advance_payment",
      subtotalMinor: 150000,
      totalMinor: 150000,
      pricingSnapshot: { lines: [], quote: {} },
    });
  });

  it("strictly intercepts chemical ingestion emergencies and delivers immediate poison protocols", async () => {
    const res1 = checkEmergencyInput(
      "Help! Child swallowed pesticide spray by accident!",
    );
    expect(res1.isEmergency).toBe(true);
    expect(res1.message).toContain("1122 (Rescue 1122)");
    expect(res1.message).toContain("National Poison Control Centre");

    const reply = await ChatbotService.processMessage({
      message: "Worker drank chemical insecticide, is vomiting",
      sessionTokenHash: "test-hash-emergency",
    });
    expect(reply.isEmergency).toBe(true);
    expect(reply.response).toContain("EMERGENCY MEDICAL WARNING");
  });

  it("searches catalog and retrieves product details through grounded tools", async () => {
    const searchRes = await ChatbotTools.searchCatalog("BioShield");
    expect(searchRes.length).toBeGreaterThan(0);
    expect(searchRes[0]?.name).toBe("BioShield Organic Fungicide");

    const details = await ChatbotTools.getProductDetails(searchRes[0]!.id);
    expect("variants" in details).toBe(true);
    if ("variants" in details && details.variants) {
      expect(details.variants.length).toBeGreaterThan(0);
    }
  });

  it("enforces proof of ownership for order status lookups", async () => {
    // 1. Incorrect identifier
    const badLookup = await ChatbotTools.getOrderStatus(
      sampleOrderRef,
      "wrong@example.com",
    );
    expect("error" in badLookup).toBe(true);

    // 2. Correct phone
    const phoneLookup = await ChatbotTools.getOrderStatus(
      sampleOrderRef,
      "03009988776",
    );
    expect("status" in phoneLookup).toBe(true);
    if ("status" in phoneLookup) {
      expect(phoneLookup.status).toBe("shipped");
    }

    // 3. Via ChatbotService Turn
    const chatTurn = await ChatbotService.processMessage({
      message: `order status ${sampleOrderRef} for chat_order@example.com`,
      sessionTokenHash: "test-session-order",
    });
    expect(chatTurn.toolExecuted).toBe("get_order_status");
    expect(chatTurn.response).toContain("SHIPPED");
  });

  it("retrieves store policies directly surfacing Meezan Bank and Easypaisa details", async () => {
    const policies = ChatbotTools.getPaymentsPolicy();
    expect(policies.methods.some((m) => m.includes("03130115156301"))).toBe(
      true,
    );
    expect(policies.methods.some((m) => m.includes("03004634494"))).toBe(true);

    const returns = ChatbotTools.getReturnsPolicy();
    expect(returns.rules.some((r) => r.includes("NON-RETURNABLE"))).toBe(true);
  });

  it("allows customer escalation to human staff via support tickets", async () => {
    const ticketRes = await ChatbotTools.createSupportTicket({
      customerName: "Ahmad Farmer",
      customerPhone: "03121234567",
      subject: "Bulk spray purchase enquiry",
      message: "Need 200 bottles for sugarcane orchard next week",
    });

    expect(ticketRes.ticketNumber).toMatch(/^TICK-2026-/);
    expect(ticketRes.status).toBe("open");
  });

  it("blocks requests when daily spend limit is exceeded", async () => {
    const db = getRuntimeDb();
    const today = new Date().toISOString().split("T")[0]!;

    // Set daily spend to exceed limit
    await db
      .insert(chatSpendDaily)
      .values({
        date: today,
        tokenCount: 500000,
        estimatedCostCents: 600, // over 500 cents
        hardLimitCents: 500,
      })
      .onConflictDoUpdate({
        target: chatSpendDaily.date,
        set: { estimatedCostCents: 600 },
      });

    const reply = await ChatbotService.processMessage({
      message: "search pesticide",
      sessionTokenHash: "over-budget-test",
    });

    expect(reply.budgetExceeded).toBe(true);
    expect(reply.response).toContain(
      "temporarily paused due to daily system volume limits",
    );

    // Reset spend back for healthy system state
    await db
      .update(chatSpendDaily)
      .set({ estimatedCostCents: 10 })
      .where(eq(chatSpendDaily.date, today));
  });
});
