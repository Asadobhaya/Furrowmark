import { eq, sql, desc } from "drizzle-orm";
import { getRuntimeDb } from "../database";
import { reportExports } from "./schema";
import { batches, products, variants } from "../catalog/schema";
import { orders, orderLines, orderLineAllocations } from "../commerce/schema";

export interface BatchExpiryRow {
  batchId: string;
  lotNumber: string;
  productName: string;
  sku: string;
  expiresOn: Date;
  onHand: number;
  reserved: number;
  quarantined: number;
  status: string;
  daysRemaining: number;
}

export interface PesticideRegisterRow {
  orderRef: string;
  orderedAt: Date;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  productName: string;
  sku: string;
  lotNumber: string;
  quantity: number;
  totalMinor: number;
}

export interface RevenueSummaryRow {
  paymentMethod: string;
  orderCount: number;
  subtotalMinor: bigint;
  taxMinor: bigint;
  shippingMinor: bigint;
  discountMinor: bigint;
  totalRevenueMinor: bigint;
}

export class ReportingService {
  /**
   * Generates batch expiry risk report highlighting near-expiry batches (<= threshold days)
   * and currently quarantined lots.
   */
  static async getBatchExpiryReport(
    daysThreshold: number = 90,
  ): Promise<BatchExpiryRow[]> {
    const db = getRuntimeDb();
    const now = new Date();
    const thresholdDate = new Date(
      now.getTime() + daysThreshold * 24 * 60 * 60 * 1000,
    );

    const rows = await db
      .select({
        batchId: batches.id,
        lotNumber: batches.lotNumber,
        productName: products.name,
        sku: variants.sku,
        expiresOn: batches.expiresOn,
        onHand: batches.onHand,
        reserved: batches.reserved,
        quarantined: batches.quarantined,
        status: batches.status,
      })
      .from(batches)
      .innerJoin(variants, eq(batches.variantId, variants.id))
      .innerJoin(products, eq(variants.productId, products.id))
      .where(
        sql`${batches.expiresOn} <= ${thresholdDate} OR ${batches.status} = 'quarantined'`,
      )
      .orderBy(batches.expiresOn);

    return rows.map((r) => {
      const diffMs = r.expiresOn.getTime() - now.getTime();
      const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      return {
        ...r,
        daysRemaining,
      };
    });
  }

  /**
   * Generates statutory pesticide regulatory sales register
   * Required for agricultural authorities: tracks all pesticide transactions,
   * buyer info, product name, lot numbers, and quantities.
   */
  static async getPesticideRegulatoryRegister(
    _startDate?: Date,
    _endDate?: Date,
  ): Promise<PesticideRegisterRow[]> {
    const db = getRuntimeDb();

    const query = db
      .select({
        orderRef: orders.publicRef,
        orderedAt: orders.createdAt,
        customerName: orders.customerEmail, // or email if name not split
        customerPhone: orders.customerPhone,
        customerEmail: orders.customerEmail,
        productName: orderLines.productNameSnapshot,
        sku: orderLines.variantSkuSnapshot,
        lotNumber: batches.lotNumber,
        quantity: orderLineAllocations.quantity,
        totalMinor: orderLines.totalMinor,
      })
      .from(orderLineAllocations)
      .innerJoin(
        orderLines,
        eq(orderLineAllocations.orderLineId, orderLines.id),
      )
      .innerJoin(orders, eq(orderLines.orderId, orders.id))
      .innerJoin(batches, eq(orderLineAllocations.batchId, batches.id))
      .innerJoin(variants, eq(batches.variantId, variants.id))
      .innerJoin(products, eq(variants.productId, products.id))
      .where(eq(products.class, "pesticide"));

    const rows = await query.orderBy(desc(orders.createdAt));
    return rows;
  }

  /**
   * Generates comprehensive financial revenue ledger grouped by payment method
   * Computes subtotal, tax, shipping, discount, and total in minor units (paisa).
   */
  static async getRevenueSummary(): Promise<RevenueSummaryRow[]> {
    const db = getRuntimeDb();

    const rows = await db
      .select({
        paymentMethod: orders.paymentMethod,
        orderCount: sql<number>`count(*)::int`,
        subtotalMinor: sql<bigint>`coalesce(sum(${orders.subtotalMinor}), 0)::bigint`,
        taxMinor: sql<bigint>`coalesce(sum(${orders.taxMinor}), 0)::bigint`,
        shippingMinor: sql<bigint>`coalesce(sum(${orders.shippingMinor}), 0)::bigint`,
        discountMinor: sql<bigint>`coalesce(sum(${orders.discountMinor}), 0)::bigint`,
        totalRevenueMinor: sql<bigint>`coalesce(sum(${orders.totalMinor}), 0)::bigint`,
      })
      .from(orders)
      .where(sql`${orders.state} NOT IN ('cancelled', 'refunded')`)
      .groupBy(orders.paymentMethod);

    return rows;
  }

  /**
   * Records an export audit log entry.
   */
  static async logReportExport(params: {
    staffId: string;
    reportType: string;
    parameters?: Record<string, unknown>;
    recordCount?: string;
  }): Promise<void> {
    const db = getRuntimeDb();
    await db.insert(reportExports).values({
      staffId: params.staffId,
      reportType: params.reportType,
      parameters: params.parameters ?? {},
      recordCount: params.recordCount ?? null,
    });
  }
}
