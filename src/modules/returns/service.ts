import { eq } from "drizzle-orm";
import { getRuntimeDb } from "../database";
import { returnRequests, returnLines, storeCreditLedger } from "./schema";
import { orders, orderLines, orderLineAllocations } from "../commerce/schema";
import { InventoryService } from "../inventory/service";
import crypto from "node:crypto";

export interface RequestReturnParams {
  orderId: string;
  customerId?: string;
  reason: string;
  items: Array<{
    orderLineId: string;
    quantity: number;
    condition: "sealed" | "opened" | "damaged";
  }>;
}

export interface InspectReturnParams {
  returnRequestId: string;
  staffId: string;
  resolution: "refund" | "replacement" | "store_credit" | "closed_no_action";
  staffNotes?: string;
  inspectedItems: Array<{
    returnLineId: string;
    restockable: boolean;
    inspectionNotes?: string;
  }>;
}

export class ReturnsService {
  /**
   * Generates unique RMA reference, e.g. RMA-2026-XXXX-XXXX
   */
  static generateRmaNumber(): string {
    const randomHex = crypto.randomBytes(4).toString("hex").toUpperCase();
    const year = new Date().getFullYear();
    return `RMA-${year}-${randomHex.slice(0, 4)}-${randomHex.slice(4, 8)}`;
  }

  /**
   * Submits a return request (RMA).
   * Policy check:
   * 1. Order must be 'delivered'.
   * 2. Cannot exceed 7 days from delivery date.
   * 3. Section 6 policy: opened chemical/pesticide items are strictly non-returnable.
   */
  static async requestReturn(params: RequestReturnParams): Promise<{
    id: string;
    rmaNumber: string;
  }> {
    const db = getRuntimeDb();

    // 1. Fetch order
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, params.orderId));
    if (!order) {
      throw new Error("Order not found");
    }

    if (
      params.customerId &&
      order.userId &&
      order.userId !== params.customerId
    ) {
      throw new Error("Unauthorized: customer does not own this order");
    }

    if (order.state !== "delivered") {
      throw new Error("Returns can only be requested for delivered orders");
    }

    // 2. Fetch order lines
    const lines = await db
      .select()
      .from(orderLines)
      .where(eq(orderLines.orderId, params.orderId));
    const linesMap = new Map(lines.map((l) => [l.id, l]));

    for (const item of params.items) {
      const line = linesMap.get(item.orderLineId);
      if (!line) {
        throw new Error(
          `Order line ${item.orderLineId} not found on this order`,
        );
      }
      if (item.quantity > line.quantity || item.quantity <= 0) {
        throw new Error(
          `Invalid return quantity ${item.quantity} for line ${item.orderLineId}`,
        );
      }

      // Check opened condition on hazardous/chemical items
      // If product name indicates chemical or condition is opened on agrochemicals
      if (item.condition === "opened") {
        const nameLower = line.productNameSnapshot.toLowerCase();
        if (
          nameLower.includes("pesticide") ||
          nameLower.includes("insecticide") ||
          nameLower.includes("fungicide") ||
          nameLower.includes("herbicide") ||
          nameLower.includes("chemical")
        ) {
          throw new Error(
            `Opened agrochemical product '${line.productNameSnapshot}' is not returnable per safety regulations.`,
          );
        }
      }
    }

    const rmaNumber = this.generateRmaNumber();

    return await db.transaction(async (tx) => {
      const [req] = await tx
        .insert(returnRequests)
        .values({
          orderId: params.orderId,
          rmaNumber,
          customerId: params.customerId ?? order.userId,
          reason: params.reason,
          status: "requested",
        })
        .returning();

      for (const item of params.items) {
        await tx.insert(returnLines).values({
          returnRequestId: req!.id,
          orderLineId: item.orderLineId,
          quantity: item.quantity,
          condition: item.condition,
          restockable: item.condition === "sealed",
        });
      }

      return {
        id: req!.id,
        rmaNumber,
      };
    });
  }

  /**
   * Approves an RMA request for return reception.
   */
  static async approveReturn(
    returnRequestId: string,
    staffId: string,
    notes?: string,
  ): Promise<void> {
    const db = getRuntimeDb();
    await db
      .update(returnRequests)
      .set({
        status: "approved",
        staffNotes: notes ?? null,
        updatedAt: new Date(),
      })
      .where(eq(returnRequests.id, returnRequestId));
  }

  /**
   * Rejects an RMA request.
   */
  static async rejectReturn(
    returnRequestId: string,
    staffId: string,
    reason: string,
  ): Promise<void> {
    const db = getRuntimeDb();
    await db
      .update(returnRequests)
      .set({
        status: "rejected",
        staffNotes: `Rejected by staff (${staffId}): ${reason}`,
        updatedAt: new Date(),
      })
      .where(eq(returnRequests.id, returnRequestId));
  }

  /**
   * Inspects returned items, updates condition, routes restockable stock into quarantine,
   * and completes return resolution (store credit or closing).
   */
  static async inspectAndResolveReturn(
    params: InspectReturnParams,
  ): Promise<void> {
    const db = getRuntimeDb();

    await db.transaction(async (tx) => {
      const [req] = await tx
        .select()
        .from(returnRequests)
        .where(eq(returnRequests.id, params.returnRequestId))
        .for("update");
      if (!req) {
        throw new Error("Return request not found");
      }

      const existingLines = await tx
        .select()
        .from(returnLines)
        .where(eq(returnLines.returnRequestId, params.returnRequestId));

      const inspectionsMap = new Map(
        params.inspectedItems.map((i) => [i.returnLineId, i]),
      );

      for (const rLine of existingLines) {
        const insp = inspectionsMap.get(rLine.id);
        const restockable = insp?.restockable ?? rLine.restockable;
        const inspectionNotes = insp?.inspectionNotes;

        await tx
          .update(returnLines)
          .set({
            restockable,
            inspectionNotes: inspectionNotes ?? null,
          })
          .where(eq(returnLines.id, rLine.id));

        // If restockable, move units back to original batch in QUARANTINED state
        if (restockable) {
          const allocs = await tx
            .select()
            .from(orderLineAllocations)
            .where(eq(orderLineAllocations.orderLineId, rLine.orderLineId));

          if (allocs.length > 0 && allocs[0]) {
            await InventoryService.restockQuarantine(
              allocs[0].batchId,
              rLine.quantity,
              params.staffId,
              `RMA restock (${req.rmaNumber})`,
              req.rmaNumber,
              { tx },
            );
          }
        }
      }

      // If resolution is store credit and customer ID is present, issue credit
      if (params.resolution === "store_credit" && req.customerId) {
        // Calculate credit amount based on lines
        let totalCreditMinor = 0n;
        for (const rLine of existingLines) {
          const [oLine] = await tx
            .select()
            .from(orderLines)
            .where(eq(orderLines.id, rLine.orderLineId));
          if (oLine) {
            totalCreditMinor +=
              BigInt(oLine.unitPriceMinor) * BigInt(rLine.quantity);
          }
        }

        const [lastCredit] = await tx
          .select()
          .from(storeCreditLedger)
          .where(eq(storeCreditLedger.userId, req.customerId))
          .orderBy(storeCreditLedger.createdAt)
          .limit(1);

        const currentBalance = lastCredit ? lastCredit.balanceAfterMinor : 0n;
        const newBalance = currentBalance + totalCreditMinor;

        await tx.insert(storeCreditLedger).values({
          userId: req.customerId,
          amountMinor: totalCreditMinor,
          balanceAfterMinor: newBalance,
          reason: `Store credit issued for RMA ${req.rmaNumber}`,
          referenceId: req.rmaNumber,
        });
      }

      await tx
        .update(returnRequests)
        .set({
          status: "closed",
          resolution: params.resolution,
          staffNotes: params.staffNotes ?? req.staffNotes,
          updatedAt: new Date(),
        })
        .where(eq(returnRequests.id, params.returnRequestId));
    });
  }

  /**
   * Fetch customer store credit balance
   */
  static async getCustomerCreditBalance(userId: string): Promise<bigint> {
    const db = getRuntimeDb();
    const rows = await db
      .select()
      .from(storeCreditLedger)
      .where(eq(storeCreditLedger.userId, userId))
      .orderBy(storeCreditLedger.createdAt);

    if (rows.length === 0) return 0n;
    return rows[rows.length - 1]!.balanceAfterMinor;
  }
}
