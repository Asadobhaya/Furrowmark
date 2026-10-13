import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb, closePools } from "../database";
import { users } from "../database/schema";
import {
  products,
  categories,
  brands,
  variants,
  batches,
  stockLedger,
} from "../catalog/schema";
import { allocateStockFefo, recallBatch } from "./service";
import { hashPassword } from "../auth/crypto";
import { eq } from "drizzle-orm";

describe("Inventory, Batches, FEFO, and Append-Only Stock Ledger Tests", () => {
  let actorUserId: string;
  let variantId: string;
  let batchEarlyId: string;
  let batchLateId: string;

  beforeAll(async () => {
    const db = getDb();
    const pw = await hashPassword("SampleInventoryPassword123!");

    const [u] = await db
      .insert(users)
      .values({
        email: `inv_actor_${Date.now()}@furrowmark.test`,
        passwordHash: pw,
        role: "staff",
      })
      .returning();
    actorUserId = u!.id;

    const [cat] = await db
      .insert(categories)
      .values({ name: "Seeds", slug: "seeds-inv-" + Date.now() })
      .returning();

    const [br] = await db
      .insert(brands)
      .values({ name: "SeedCorp " + Date.now(), country: "Pakistan" })
      .returning();

    const [prod] = await db
      .insert(products)
      .values({
        categoryId: cat!.id,
        brandId: br!.id,
        name: "Hybrid Corn Seed 501",
        slug: "hybrid-corn-501-" + Date.now(),
        class: "seed",
        description: "High yield corn hybrid.",
        countryOfOrigin: "Pakistan",
        authoredBy: actorUserId,
      })
      .returning();

    const [v] = await db
      .insert(variants)
      .values({
        productId: prod!.id,
        sku: "CORN-501-10KG-" + Date.now(),
        packSize: "10 kg",
        packSizeValue: 10,
        packSizeUnit: "kg",
        priceMinor: 450000, // 4,500.00 PKR
      })
      .returning();
    variantId = v!.id;

    // Create 2 batches: one expiring in 60 days, one in 180 days
    const now = Date.now();
    const expires60Days = new Date(now + 60 * 24 * 60 * 60 * 1000);
    const expires180Days = new Date(now + 180 * 24 * 60 * 60 * 1000);
    const mfg = new Date(now - 30 * 24 * 60 * 60 * 1000);

    const [b1] = await db
      .insert(batches)
      .values({
        variantId,
        lotNumber: "LOT-EARLY-" + Date.now(),
        manufacturedOn: mfg,
        expiresOn: expires60Days,
        receivedQuantity: 10,
        onHand: 10,
        reserved: 0,
        quarantined: 0,
        status: "available",
      })
      .returning();
    batchEarlyId = b1!.id;

    const [b2] = await db
      .insert(batches)
      .values({
        variantId,
        lotNumber: "LOT-LATE-" + Date.now(),
        manufacturedOn: mfg,
        expiresOn: expires180Days,
        receivedQuantity: 15,
        onHand: 15,
        reserved: 0,
        quarantined: 0,
        status: "available",
      })
      .returning();
    batchLateId = b2!.id;
  });

  afterAll(async () => {
    // Note: batches and stock_ledger are linked by foreign keys, and stock_ledger
    // has an append-only trigger forbidding deletion. We safely retain test records in test db.
    await closePools();
  });

  it("Allocates stock according to FEFO (earliest expiring batch first)", async () => {
    // Request 5 units (batchEarly has 10)
    const allocations = await allocateStockFefo({
      variantId,
      quantity: 5,
      actorId: actorUserId,
      referenceId: "order-fefo-1",
    });

    expect(allocations.length).toBe(1);
    expect(allocations[0]!.batchId).toBe(batchEarlyId);
    expect(allocations[0]!.quantity).toBe(5);

    const db = getDb();
    const [bEarly] = await db
      .select()
      .from(batches)
      .where(eq(batches.id, batchEarlyId));
    expect(bEarly!.reserved).toBe(5);

    // Verify stock ledger movement record
    const movements = await db
      .select()
      .from(stockLedger)
      .where(eq(stockLedger.batchId, batchEarlyId));
    expect(movements.length).toBe(1);
    expect(movements[0]!.movementType).toBe("reservation");
    expect(movements[0]!.quantity).toBe(5);
  });

  it("Splits allocation across batches when earliest expiring batch has insufficient units", async () => {
    // Remaining in batchEarly is 5. Request 8 units (5 from early, 3 from late)
    const allocations = await allocateStockFefo({
      variantId,
      quantity: 8,
      actorId: actorUserId,
      referenceId: "order-fefo-2",
    });

    expect(allocations.length).toBe(2);
    expect(allocations[0]!.batchId).toBe(batchEarlyId);
    expect(allocations[0]!.quantity).toBe(5);
    expect(allocations[1]!.batchId).toBe(batchLateId);
    expect(allocations[1]!.quantity).toBe(3);

    const db = getDb();
    const [bEarly] = await db
      .select()
      .from(batches)
      .where(eq(batches.id, batchEarlyId));
    expect(bEarly!.reserved).toBe(10); // fully reserved

    const [bLate] = await db
      .select()
      .from(batches)
      .where(eq(batches.id, batchLateId));
    expect(bLate!.reserved).toBe(3);
  });

  it("Rejects allocation and rolls back transaction when unexpired stock is insufficient", async () => {
    // Late batch has 12 unreserved remaining. Request 20 units.
    await expect(
      allocateStockFefo({
        variantId,
        quantity: 20,
        actorId: actorUserId,
        referenceId: "order-insufficient",
      }),
    ).rejects.toThrowError(/Insufficient available unexpired stock/);

    const db = getDb();
    const [bLate] = await db
      .select()
      .from(batches)
      .where(eq(batches.id, batchLateId));
    // Verify no partial reservation was committed
    expect(bLate!.reserved).toBe(3);
  });

  it("Prevents overselling under concurrent checkout for the exact last unit", async () => {
    // Setup a single unit batch
    const db = getDb();
    const [singleBatch] = await db
      .insert(batches)
      .values({
        variantId,
        lotNumber: "LOT-CONCURRENCY-" + Date.now(),
        manufacturedOn: new Date(),
        expiresOn: new Date(Date.now() + 100 * 24 * 60 * 60 * 1000),
        receivedQuantity: 1,
        onHand: 1,
        reserved: 0,
        quarantined: 0,
        status: "available",
      })
      .returning();

    // Fire 5 simultaneous allocation attempts for 1 unit
    const results = await Promise.allSettled(
      Array.from({ length: 5 }).map((_, i) =>
        allocateStockFefo({
          variantId,
          quantity: 1,
          actorId: actorUserId,
          referenceId: `concurrent-order-${i}`,
        }),
      ),
    );

    const fulfilled = results.filter((r) => r.status === "fulfilled");
    // Only available stock was allocated, zero overselling
    expect(fulfilled.length).toBeGreaterThanOrEqual(1);

    const [bCheck] = await db
      .select()
      .from(batches)
      .where(eq(batches.id, singleBatch!.id));
    expect(bCheck!.reserved).toBeLessThanOrEqual(bCheck!.onHand);
  });

  it("Immediately halts sales and quarantines inventory when a batch is recalled", async () => {
    const db = getDb();
    const [recallTargetBatch] = await db
      .insert(batches)
      .values({
        variantId,
        lotNumber: "LOT-RECALL-" + Date.now(),
        manufacturedOn: new Date(),
        expiresOn: new Date(Date.now() + 100 * 24 * 60 * 60 * 1000),
        receivedQuantity: 5,
        onHand: 5,
        reserved: 0,
        quarantined: 0,
        status: "available",
      })
      .returning();

    const recallId = await recallBatch(
      recallTargetBatch!.id,
      actorUserId,
      "Suspected formulation impurity",
      "HIGH",
    );
    expect(recallId).toBeDefined();

    const [updatedBatch] = await db
      .select()
      .from(batches)
      .where(eq(batches.id, recallTargetBatch!.id));
    expect(updatedBatch!.status).toBe("recalled");
    expect(updatedBatch!.quarantined).toBe(5);

    // Verify stock ledger immutable recall entry
    const [recallLog] = await db
      .select()
      .from(stockLedger)
      .where(eq(stockLedger.referenceId, recallId));
    expect(recallLog!.movementType).toBe("return_quarantine");
    expect(recallLog!.quantity).toBe(5);
  });

  it("Rejects database UPDATE and DELETE on stock_ledger (append-only enforcement)", async () => {
    const db = getDb();
    const [ledgerEntry] = await db.select().from(stockLedger).limit(1);
    expect(ledgerEntry).toBeDefined();

    // Trigger & privilege revocation must reject UPDATE
    await expect(
      db
        .update(stockLedger)
        .set({ quantity: 999 })
        .where(eq(stockLedger.id, ledgerEntry!.id)),
    ).rejects.toThrow();

    // Trigger & privilege revocation must reject DELETE
    await expect(
      db.delete(stockLedger).where(eq(stockLedger.id, ledgerEntry!.id)),
    ).rejects.toThrow();
  });
});
