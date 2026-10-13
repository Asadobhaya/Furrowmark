import { eq, and, gt, sql } from "drizzle-orm";
import { getDb, AppTransaction } from "../database";
import {
  batches,
  stockLedger,
  recalls,
  recallBatches,
} from "../catalog/schema";

export interface BatchAllocationRequest {
  variantId: string;
  quantity: number;
  actorId: string;
  referenceId: string;
  minRemainingShelfDays?: number;
}

export interface AllocationResult {
  batchId: string;
  lotNumber: string;
  quantity: number;
  expiresOn: Date;
}

// FEFO (First-Expiry-First-Out) Batch Allocation with Row Locking
export async function allocateStockFefo(
  req: BatchAllocationRequest,
): Promise<AllocationResult[]> {
  const db = getDb();
  const minShelfDays = req.minRemainingShelfDays ?? 30;
  const minExpiryDate = new Date(
    Date.now() + minShelfDays * 24 * 60 * 60 * 1000,
  );

  // Execute in serializable/row-locked transaction
  return await db.transaction(async (tx) => {
    // Lock matching available batches ordered by earliest expiry (FEFO)
    const availableBatches = await tx
      .select()
      .from(batches)
      .where(
        and(
          eq(batches.variantId, req.variantId),
          eq(batches.status, "available"),
          gt(batches.expiresOn, minExpiryDate),
          sql`${batches.onHand} - ${batches.reserved} - ${batches.quarantined} > 0`,
        ),
      )
      .orderBy(batches.expiresOn)
      .for("update");

    let remainingNeeded = req.quantity;
    const allocations: AllocationResult[] = [];

    for (const batch of availableBatches) {
      if (remainingNeeded <= 0) break;

      const unreserved = batch.onHand - batch.reserved - batch.quarantined;
      if (unreserved <= 0) continue;

      const allocateQty = Math.min(remainingNeeded, unreserved);

      // Reserve stock on the batch record
      await tx
        .update(batches)
        .set({
          reserved: sql`${batches.reserved} + ${allocateQty}`,
        })
        .where(eq(batches.id, batch.id));

      // Append immutable record to stock ledger
      await tx.insert(stockLedger).values({
        batchId: batch.id,
        movementType: "reservation",
        quantity: allocateQty,
        actorId: req.actorId,
        reason: "Order checkout reservation",
        referenceId: req.referenceId,
      });

      allocations.push({
        batchId: batch.id,
        lotNumber: batch.lotNumber,
        quantity: allocateQty,
        expiresOn: batch.expiresOn,
      });

      remainingNeeded -= allocateQty;
    }

    if (remainingNeeded > 0) {
      // Insufficient available unexpired stock: rollback transaction
      throw new Error(
        `Insufficient available unexpired stock for variant ${req.variantId}. Needed: ${req.quantity}, unallocated: ${remainingNeeded}.`,
      );
    }

    return allocations;
  });
}

// Immediate Batch Recall: Stops all sales and quarantines inventory
export async function recallBatch(
  batchId: string,
  actorId: string,
  reason: string,
  severity: string,
): Promise<string> {
  const db = getDb();

  return await db.transaction(async (tx) => {
    const [batch] = await tx
      .select()
      .from(batches)
      .where(eq(batches.id, batchId))
      .for("update");

    if (!batch) {
      throw new Error(`Batch ${batchId} not found.`);
    }

    // Available unreserved units are quarantined immediately
    const availableToQuarantine = batch.onHand - batch.reserved;

    await tx
      .update(batches)
      .set({
        status: "recalled",
        quarantined: sql`${batches.quarantined} + ${availableToQuarantine}`,
      })
      .where(eq(batches.id, batchId));

    // Record recall
    const [recall] = await tx
      .insert(recalls)
      .values({
        initiatedBy: actorId,
        reason,
        severity,
        status: "active",
      })
      .returning();

    await tx.insert(recallBatches).values({
      recallId: recall!.id,
      batchId: batch.id,
      quarantinedQuantity: availableToQuarantine,
    });

    // Append to stock ledger
    await tx.insert(stockLedger).values({
      batchId: batch.id,
      movementType: "return_quarantine",
      quantity: availableToQuarantine,
      actorId,
      reason: `Emergency Recall: ${reason}`,
      referenceId: recall!.id,
    });

    return recall!.id;
  });
}

export async function releaseStockReservation(
  batchId: string,
  quantity: number,
  reason: string,
  actorId: string,
  options?: { tx?: AppTransaction },
): Promise<void> {
  const runner = async (tx: AppTransaction) => {
    await tx
      .update(batches)
      .set({
        reserved: sql`GREATEST(0, ${batches.reserved} - ${quantity})`,
      })
      .where(eq(batches.id, batchId));

    await tx.insert(stockLedger).values({
      batchId,
      movementType: "release",
      quantity,
      actorId,
      reason: `Reservation released: ${reason}`,
    });
  };

  if (options?.tx) {
    await runner(options.tx);
  } else {
    const db = getDb();
    await db.transaction(runner);
  }
}

export async function restockQuarantine(
  batchId: string,
  quantity: number,
  actorId: string,
  reason: string,
  referenceId?: string,
  options?: { tx?: AppTransaction },
): Promise<void> {
  const runner = async (tx: AppTransaction) => {
    await tx
      .update(batches)
      .set({
        onHand: sql`${batches.onHand} + ${quantity}`,
        quarantined: sql`${batches.quarantined} + ${quantity}`,
      })
      .where(eq(batches.id, batchId));

    await tx.insert(stockLedger).values({
      batchId,
      movementType: "return_quarantine",
      quantity,
      actorId,
      reason: `Returned goods quarantined: ${reason}`,
      referenceId: referenceId ?? null,
    });
  };

  if (options?.tx) {
    await runner(options.tx);
  } else {
    const db = getDb();
    await db.transaction(runner);
  }
}

export const InventoryService = {
  allocateStockFEFO: async (
    variantId: string,
    quantity: number,
    options: {
      actorId: string;
      referenceId?: string;
      minRemainingShelfDays?: number;
      tx?: AppTransaction;
    },
  ) => {
    const runner = async (tx: AppTransaction) => {
      const minShelfDays = options?.minRemainingShelfDays ?? 30;
      const minExpiryDate = new Date(
        Date.now() + minShelfDays * 24 * 60 * 60 * 1000,
      );

      const availableBatches = await tx
        .select()
        .from(batches)
        .where(
          and(
            eq(batches.variantId, variantId),
            eq(batches.status, "available"),
            gt(batches.expiresOn, minExpiryDate),
            sql`${batches.onHand} - ${batches.reserved} - ${batches.quarantined} > 0`,
          ),
        )
        .orderBy(batches.expiresOn)
        .for("update");

      let remainingNeeded = quantity;
      const allocations: { batchId: string; quantity: number }[] = [];

      for (const batch of availableBatches) {
        if (remainingNeeded <= 0) break;
        const unreserved = batch.onHand - batch.reserved - batch.quarantined;
        if (unreserved <= 0) continue;

        const allocateQty = Math.min(remainingNeeded, unreserved);
        await tx
          .update(batches)
          .set({
            reserved: sql`${batches.reserved} + ${allocateQty}`,
          })
          .where(eq(batches.id, batch.id));

        await tx.insert(stockLedger).values({
          batchId: batch.id,
          movementType: "reservation",
          quantity: allocateQty,
          actorId: options.actorId,
          reason: "Order checkout reservation",
          referenceId: options.referenceId,
        });

        allocations.push({
          batchId: batch.id,
          quantity: allocateQty,
        });

        remainingNeeded -= allocateQty;
      }

      if (remainingNeeded > 0) {
        throw new Error(
          `Insufficient available unexpired stock for variant ${variantId}. Needed: ${quantity}, unallocated: ${remainingNeeded}.`,
        );
      }

      return allocations;
    };

    if (options?.tx) {
      return await runner(options.tx);
    } else {
      const db = getDb();
      return await db.transaction(runner);
    }
  },
  releaseStockReservation,
  recallBatch,
  restockQuarantine,
};
