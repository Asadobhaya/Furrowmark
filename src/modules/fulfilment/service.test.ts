import { describe, it, expect, beforeAll } from "vitest";
import { getRuntimeDb } from "../database";
import { FulfilmentService } from "./service";
import { ReturnsService } from "../returns/service";
import { ReportingService } from "../reporting/service";
import {
  categories,
  brands,
  products,
  variants,
  batches,
} from "../catalog/schema";
import { orders, orderLines, orderLineAllocations } from "../commerce/schema";
import { returnRequests } from "../returns/schema";
import { users } from "../database/schema";
import { eq } from "drizzle-orm";

describe("Phase 6 Fulfilment, Returns, and Reporting", () => {
  let testUserId: string;
  let staffUserId: string;
  let testCategoryId: string;
  let testBrandId: string;
  let pesticideProductId: string;
  let seedProductId: string;
  let pesticideVariantId: string;
  let seedVariantId: string;
  let seedBatchId: string;

  beforeAll(async () => {
    const db = getRuntimeDb();

    // 1. Setup users
    const [customer] = await db
      .insert(users)
      .values({
        email: `phase6_cust_${Date.now()}@example.com`,
        passwordHash: "dummyhash",
        role: "customer",
      })
      .returning();
    testUserId = customer!.id;

    const [staff] = await db
      .insert(users)
      .values({
        email: `phase6_staff_${Date.now()}@example.com`,
        passwordHash: "dummyhash",
        role: "staff",
      })
      .returning();
    staffUserId = staff!.id;

    // 2. Setup category and brand
    const [cat] = await db
      .insert(categories)
      .values({
        slug: `cat-phase6-${Date.now()}`,
        name: "Crop Protection",
      })
      .returning();
    testCategoryId = cat!.id;

    const [brand] = await db
      .insert(brands)
      .values({
        name: `Brand-P6-${Date.now()}`,
      })
      .returning();
    testBrandId = brand!.id;

    // 3. Pesticide product
    const [pestProd] = await db
      .insert(products)
      .values({
        categoryId: testCategoryId,
        brandId: testBrandId,
        name: "Delta Agro Pesticide EC",
        slug: `delta-pesticide-${Date.now()}`,
        class: "pesticide",
        status: "published",
        description: "Regulated insecticide",
        countryOfOrigin: "Pakistan",
        authoredBy: staffUserId,
      })
      .returning();
    pesticideProductId = pestProd!.id;

    const [pestVar] = await db
      .insert(variants)
      .values({
        productId: pesticideProductId,
        sku: `SKU-PEST-${Date.now()}`,
        packSize: "1 L",
        packSizeValue: 1000,
        packSizeUnit: "ml",
        priceMinor: 250000, // 2500 PKR
      })
      .returning();
    pesticideVariantId = pestVar!.id;

    await db.insert(batches).values({
      variantId: pesticideVariantId,
      lotNumber: `LOT-PEST-${Date.now()}`,
      manufacturedOn: new Date("2026-01-01"),
      expiresOn: new Date("2026-12-31"),
      receivedQuantity: 50,
      onHand: 50,
      reserved: 0,
      quarantined: 0,
      status: "available",
    });

    // 4. Seed product
    const [seedProd] = await db
      .insert(products)
      .values({
        categoryId: testCategoryId,
        brandId: testBrandId,
        name: "Super Wheat Seeds 50kg",
        slug: `super-wheat-${Date.now()}`,
        class: "seed",
        status: "published",
        description: "Certified hybrid seed",
        countryOfOrigin: "Pakistan",
        authoredBy: staffUserId,
      })
      .returning();
    seedProductId = seedProd!.id;

    const [seedVar] = await db
      .insert(variants)
      .values({
        productId: seedProductId,
        sku: `SKU-SEED-${Date.now()}`,
        packSize: "50 kg",
        packSizeValue: 50,
        packSizeUnit: "kg",
        priceMinor: 400000, // 4000 PKR
      })
      .returning();
    seedVariantId = seedVar!.id;

    const [seedBatch] = await db
      .insert(batches)
      .values({
        variantId: seedVariantId,
        lotNumber: `LOT-SEED-${Date.now()}`,
        manufacturedOn: new Date("2026-01-01"),
        expiresOn: new Date("2026-11-30"),
        receivedQuantity: 20,
        onHand: 20,
        reserved: 0,
        quarantined: 0,
        status: "available",
      })
      .returning();
    seedBatchId = seedBatch!.id;
  });

  it("automatically splits hazardous agrochemical lines from general seeds into separate parcels", async () => {
    const db = getRuntimeDb();

    // Create an order containing both pesticide and seed lines
    const [order] = await db
      .insert(orders)
      .values({
        publicRef: `FM-TEST-SPLIT-${Date.now().toString().slice(-4)}`,
        userId: testUserId,
        customerEmail: "farmer@test.com",
        customerPhone: "03001234567",
        shippingAddress: { city: "Multan" },
        billingAddress: { city: "Multan" },
        state: "processing",
        paymentMethod: "advance_payment",
        subtotalMinor: 650000,
        totalMinor: 650000,
        pricingSnapshot: { lines: [], quote: {} },
      })
      .returning();

    await db.insert(orderLines).values({
      orderId: order!.id,
      variantId: pesticideVariantId,
      productNameSnapshot: "Delta Agro Pesticide EC",
      variantSkuSnapshot: "SKU-PEST",
      unitPriceMinor: 250000,
      quantity: 1,
      taxMinor: 0,
      totalMinor: 250000,
    });

    await db.insert(orderLines).values({
      orderId: order!.id,
      variantId: seedVariantId,
      productNameSnapshot: "Super Wheat Seeds 50kg",
      variantSkuSnapshot: "SKU-SEED",
      unitPriceMinor: 400000,
      quantity: 1,
      taxMinor: 0,
      totalMinor: 400000,
    });

    // Call createOrderShipments
    const res = await FulfilmentService.createOrderShipments(order!.id);

    expect(res.shipments).toHaveLength(2);
    const hazardousParcel = res.shipments.find(
      (s) => s.parcelType === "hazardous_agrochemical",
    );
    const generalParcel = res.shipments.find((s) => s.parcelType === "general");

    expect(hazardousParcel).toBeDefined();
    expect(generalParcel).toBeDefined();
    expect(hazardousParcel?.shipmentNumber).toMatch(/^FM-SHP-/);
  });

  it("transitions order through packing, dispatch, and delivery lifecycle", async () => {
    const db = getRuntimeDb();

    const [order] = await db
      .insert(orders)
      .values({
        publicRef: `FM-CYCLE-${Date.now().toString().slice(-4)}`,
        userId: testUserId,
        customerEmail: "farmer@test.com",
        customerPhone: "03001234567",
        shippingAddress: { city: "Bahawalpur" },
        billingAddress: { city: "Bahawalpur" },
        state: "processing",
        paymentMethod: "cash_on_delivery",
        subtotalMinor: 400000,
        totalMinor: 400000,
        pricingSnapshot: { lines: [], quote: {} },
      })
      .returning();

    await db.insert(orderLines).values({
      orderId: order!.id,
      variantId: seedVariantId,
      productNameSnapshot: "Super Wheat Seeds",
      variantSkuSnapshot: "SKU-SEED",
      unitPriceMinor: 400000,
      quantity: 1,
      taxMinor: 0,
      totalMinor: 400000,
    });

    const { shipments } = await FulfilmentService.createOrderShipments(
      order!.id,
    );
    expect(shipments).toHaveLength(1);
    const shpId = shipments[0]!.id;

    // 1. Pack shipment
    await FulfilmentService.packShipment(shpId, staffUserId);
    const [packedOrder] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, order!.id));
    expect(packedOrder?.state).toBe("packed");

    // 2. Dispatch shipment
    await FulfilmentService.dispatchShipment({
      shipmentId: shpId,
      carrierName: "Trax Logistics",
      trackingNumber: "TRX-998877",
      actorId: staffUserId,
    });

    const [shippedOrder] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, order!.id));
    expect(shippedOrder?.state).toBe("shipped");

    // 3. Deliver shipment
    await FulfilmentService.deliverShipment(shpId, staffUserId);

    const [deliveredOrder] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, order!.id));
    expect(deliveredOrder?.state).toBe("delivered");
  });

  it("enforces return policy: rejects opened chemical items", async () => {
    const db = getRuntimeDb();

    const [order] = await db
      .insert(orders)
      .values({
        publicRef: `FM-RMA-REJ-${Date.now().toString().slice(-4)}`,
        userId: testUserId,
        customerEmail: "farmer@test.com",
        customerPhone: "03001234567",
        shippingAddress: { city: "Lahore" },
        billingAddress: { city: "Lahore" },
        state: "delivered",
        paymentMethod: "advance_payment",
        subtotalMinor: 250000,
        totalMinor: 250000,
        pricingSnapshot: { lines: [], quote: {} },
      })
      .returning();

    const [line] = await db
      .insert(orderLines)
      .values({
        orderId: order!.id,
        variantId: pesticideVariantId,
        productNameSnapshot: "Delta Agro Pesticide EC",
        variantSkuSnapshot: "SKU-PEST",
        unitPriceMinor: 250000,
        quantity: 1,
        taxMinor: 0,
        totalMinor: 250000,
      })
      .returning();

    // Trying to return opened pesticide should throw
    await expect(
      ReturnsService.requestReturn({
        orderId: order!.id,
        customerId: testUserId,
        reason: "Wrong crop requirement",
        items: [
          {
            orderLineId: line!.id,
            quantity: 1,
            condition: "opened",
          },
        ],
      }),
    ).rejects.toThrow(/Opened agrochemical product.*is not returnable/);
  });

  it("handles valid RMA inspection, routes restock into batch quarantine, and issues store credit", async () => {
    const db = getRuntimeDb();

    const [order] = await db
      .insert(orders)
      .values({
        publicRef: `FM-RMA-OK-${Date.now().toString().slice(-4)}`,
        userId: testUserId,
        customerEmail: "farmer@test.com",
        customerPhone: "03001234567",
        shippingAddress: { city: "Lahore" },
        billingAddress: { city: "Lahore" },
        state: "delivered",
        paymentMethod: "advance_payment",
        subtotalMinor: 400000,
        totalMinor: 400000,
        pricingSnapshot: { lines: [], quote: {} },
      })
      .returning();

    const [line] = await db
      .insert(orderLines)
      .values({
        orderId: order!.id,
        variantId: seedVariantId,
        productNameSnapshot: "Super Wheat Seeds 50kg",
        variantSkuSnapshot: "SKU-SEED",
        unitPriceMinor: 400000,
        quantity: 1,
        taxMinor: 0,
        totalMinor: 400000,
      })
      .returning();

    await db.insert(orderLineAllocations).values({
      orderLineId: line!.id,
      batchId: seedBatchId,
      quantity: 1,
    });

    const rma = await ReturnsService.requestReturn({
      orderId: order!.id,
      customerId: testUserId,
      reason: "Surplus bags ordered",
      items: [
        {
          orderLineId: line!.id,
          quantity: 1,
          condition: "sealed",
        },
      ],
    });

    expect(rma.rmaNumber).toMatch(/^RMA-/);

    // Fetch return line
    const [rLine] = await db
      .select()
      .from(returnRequests)
      .where(eq(returnRequests.id, rma.id));
    expect(rLine?.status).toBe("requested");

    // Inspect and resolve with store credit
    await ReturnsService.inspectAndResolveReturn({
      returnRequestId: rma.id,
      staffId: staffUserId,
      resolution: "store_credit",
      staffNotes: "Bag intact with original seal",
      inspectedItems: [
        {
          returnLineId: rma.id, // inspected lines mapping
          restockable: true,
          inspectionNotes: "Verified tamper-evident tag intact",
        },
      ],
    });

    // Check store credit
    const balance = await ReturnsService.getCustomerCreditBalance(testUserId);
    expect(balance).toBe(400000n);

    // Verify batch quarantined count increased
    const [updatedBatch] = await db
      .select()
      .from(batches)
      .where(eq(batches.id, seedBatchId));
    expect(updatedBatch?.quarantined).toBeGreaterThanOrEqual(1);
  });

  it("generates statutory pesticide regulatory sales register and revenue summary", async () => {
    const register = await ReportingService.getPesticideRegulatoryRegister();
    expect(Array.isArray(register)).toBe(true);

    const revenue = await ReportingService.getRevenueSummary();
    expect(Array.isArray(revenue)).toBe(true);
    expect(revenue.length).toBeGreaterThan(0);

    const expiryReport = await ReportingService.getBatchExpiryReport(365);
    expect(Array.isArray(expiryReport)).toBe(true);
  });
});
