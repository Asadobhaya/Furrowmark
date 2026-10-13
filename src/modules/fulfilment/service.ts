import { eq } from "drizzle-orm";
import { getRuntimeDb, AppTransaction } from "../database";
import {
  shipments,
  shipmentItems,
  shipmentEvents,
  codCollections,
} from "./schema";
import { orders, orderLines } from "../commerce/schema";
import { products, variants } from "../catalog/schema";
import { OrderService } from "../orders/service";
import { NotificationService } from "../notifications/service";
import crypto from "node:crypto";

export interface CreateShipmentsResult {
  orderId: string;
  shipments: Array<{
    id: string;
    shipmentNumber: string;
    parcelType: "general" | "hazardous_agrochemical";
    itemCount: number;
  }>;
}

export class FulfilmentService {
  /**
   * Generates a collision-resistant unique shipment tracking number.
   * e.g. FM-SHP-2026-XXXX-XXXX
   */
  static generateShipmentNumber(): string {
    const randomHex = crypto.randomBytes(4).toString("hex").toUpperCase();
    const year = new Date().getFullYear();
    return `FM-SHP-${year}-${randomHex.slice(0, 4)}-${randomHex.slice(4, 8)}`;
  }

  /**
   * Automatically splits order lines into hazardous agrochemical parcels vs general parcels
   * according to Section 6 safety rules, creates shipment records, and links lines.
   */
  static async createOrderShipments(
    orderId: string,
    opts?: { tx?: AppTransaction },
  ): Promise<CreateShipmentsResult> {
    const db = opts?.tx ?? getRuntimeDb();

    // 1. Fetch order and verify state
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId));
    if (!order) {
      throw new Error("Order not found");
    }

    // Check if shipments already exist
    const existingShipments = await db
      .select()
      .from(shipments)
      .where(eq(shipments.orderId, orderId));
    if (existingShipments.length > 0) {
      return {
        orderId,
        shipments: existingShipments.map((s) => ({
          id: s.id,
          shipmentNumber: s.shipmentNumber,
          parcelType: s.parcelType as "general" | "hazardous_agrochemical",
          itemCount: 0,
        })),
      };
    }

    // 2. Fetch order lines joined with products to detect product class
    const lines = await db
      .select({
        lineId: orderLines.id,
        quantity: orderLines.quantity,
        variantId: orderLines.variantId,
        productClass: products.class,
      })
      .from(orderLines)
      .innerJoin(variants, eq(orderLines.variantId, variants.id))
      .innerJoin(products, eq(variants.productId, products.id))
      .where(eq(orderLines.orderId, orderId));

    if (lines.length === 0) {
      throw new Error("No order lines found to fulfill");
    }

    // 3. Partition lines into hazardous agrochemicals (pesticides) vs general goods
    const hazardousLines: typeof lines = [];
    const generalLines: typeof lines = [];

    for (const line of lines) {
      if (line.productClass === "pesticide") {
        hazardousLines.push(line);
      } else {
        generalLines.push(line);
      }
    }

    const createdShipments: Array<{
      id: string;
      shipmentNumber: string;
      parcelType: "general" | "hazardous_agrochemical";
      itemCount: number;
    }> = [];

    const executeCreate = async (tx: AppTransaction) => {
      // Create Hazardous parcel if applicable
      if (hazardousLines.length > 0) {
        const shipmentNumber = this.generateShipmentNumber();
        const [shipment] = await tx
          .insert(shipments)
          .values({
            orderId,
            shipmentNumber,
            parcelType: "hazardous_agrochemical",
            carrierName: "ManualDispatch",
            status: "pending",
          })
          .returning();

        for (const line of hazardousLines) {
          await tx.insert(shipmentItems).values({
            shipmentId: shipment!.id,
            orderLineId: line.lineId,
            quantity: line.quantity,
          });
        }

        await tx.insert(shipmentEvents).values({
          shipmentId: shipment!.id,
          status: "pending",
          details: "Hazardous agrochemical parcel created and pending packing",
        });

        createdShipments.push({
          id: shipment!.id,
          shipmentNumber,
          parcelType: "hazardous_agrochemical",
          itemCount: hazardousLines.reduce((acc, l) => acc + l.quantity, 0),
        });
      }

      // Create General parcel if applicable
      if (generalLines.length > 0) {
        const shipmentNumber = this.generateShipmentNumber();
        const [shipment] = await tx
          .insert(shipments)
          .values({
            orderId,
            shipmentNumber,
            parcelType: "general",
            carrierName: "ManualDispatch",
            status: "pending",
          })
          .returning();

        for (const line of generalLines) {
          await tx.insert(shipmentItems).values({
            shipmentId: shipment!.id,
            orderLineId: line.lineId,
            quantity: line.quantity,
          });
        }

        await tx.insert(shipmentEvents).values({
          shipmentId: shipment!.id,
          status: "pending",
          details:
            "General agricultural goods parcel created and pending packing",
        });

        createdShipments.push({
          id: shipment!.id,
          shipmentNumber,
          parcelType: "general",
          itemCount: generalLines.reduce((acc, l) => acc + l.quantity, 0),
        });
      }

      // If COD, prepare cod_collections record
      if (order.paymentMethod === "cash_on_delivery") {
        const existingCod = await tx
          .select()
          .from(codCollections)
          .where(eq(codCollections.orderId, orderId));
        if (existingCod.length === 0) {
          await tx.insert(codCollections).values({
            orderId,
            amountDueMinor: BigInt(order.totalMinor),
            amountCollectedMinor: 0n,
            status: "pending",
          });
        }
      }
    };

    if (opts?.tx) {
      await executeCreate(opts.tx);
    } else {
      const mainDb = getRuntimeDb();
      await mainDb.transaction(async (tx) => {
        await executeCreate(tx);
      });
    }

    return {
      orderId,
      shipments: createdShipments,
    };
  }

  /**
   * Packs an individual shipment package. Once all shipments for an order are packed,
   * the order automatically transitions to 'packed'.
   */
  static async packShipment(
    shipmentId: string,
    actorId?: string,
  ): Promise<void> {
    const db = getRuntimeDb();

    await db.transaction(async (tx) => {
      const [shipment] = await tx
        .select()
        .from(shipments)
        .where(eq(shipments.id, shipmentId))
        .for("update");
      if (!shipment) {
        throw new Error("Shipment not found");
      }

      await tx
        .update(shipments)
        .set({ status: "packed", updatedAt: new Date() })
        .where(eq(shipments.id, shipmentId));

      await tx.insert(shipmentEvents).values({
        shipmentId,
        status: "packed",
        details: "Shipment parcel sealed and packed by warehouse staff",
      });

      // Check all shipments for this order
      const allShipments = await tx
        .select()
        .from(shipments)
        .where(eq(shipments.orderId, shipment.orderId));
      const allPacked = allShipments.every(
        (s) =>
          s.status === "packed" ||
          s.status === "handed_to_carrier" ||
          s.status === "in_transit" ||
          s.status === "delivered",
      );

      if (allPacked) {
        const [order] = await tx
          .select()
          .from(orders)
          .where(eq(orders.id, shipment.orderId));
        if (order && order.state === "processing") {
          await OrderService.transitionOrderState({
            orderId: order.id,
            toState: "packed",
            actorId: actorId ?? null,
            actorType: "staff",
            reason: "All parcels packed and verified",
            tx,
          });
        }
      }
    });
  }

  /**
   * Dispatches a shipment with carrier and tracking details.
   * If all order shipments are dispatched, moves order state to 'shipped'
   * and queues an 'order_dispatched' notification to the customer.
   */
  static async dispatchShipment(params: {
    shipmentId: string;
    carrierName: string;
    trackingNumber: string;
    trackingUrl?: string;
    actorId?: string;
  }): Promise<void> {
    const db = getRuntimeDb();

    await db.transaction(async (tx) => {
      const [shipment] = await tx
        .select()
        .from(shipments)
        .where(eq(shipments.id, params.shipmentId))
        .for("update");
      if (!shipment) {
        throw new Error("Shipment not found");
      }

      const now = new Date();
      await tx
        .update(shipments)
        .set({
          status: "handed_to_carrier",
          carrierName: params.carrierName,
          trackingNumber: params.trackingNumber,
          trackingUrl: params.trackingUrl ?? null,
          shippedAt: now,
          updatedAt: now,
        })
        .where(eq(shipments.id, params.shipmentId));

      await tx.insert(shipmentEvents).values({
        shipmentId: params.shipmentId,
        status: "handed_to_carrier",
        details: `Handed over to carrier ${params.carrierName}. Tracking: ${params.trackingNumber}`,
      });

      // Check all shipments
      const allShipments = await tx
        .select()
        .from(shipments)
        .where(eq(shipments.orderId, shipment.orderId));
      const allDispatched = allShipments.every(
        (s) =>
          s.status === "handed_to_carrier" ||
          s.status === "in_transit" ||
          s.status === "delivered",
      );

      if (allDispatched) {
        const [order] = await tx
          .select()
          .from(orders)
          .where(eq(orders.id, shipment.orderId));
        if (order && order.state === "packed") {
          await OrderService.transitionOrderState({
            orderId: order.id,
            toState: "shipped",
            actorId: params.actorId ?? null,
            actorType: "staff",
            reason: `Dispatched via ${params.carrierName} (${params.trackingNumber})`,
            tx,
          });

          // Enqueue dispatch notification to customer
          const customerPhone = order.customerPhone;
          const customerEmail = order.customerEmail;
          const context = {
            orderId: order.id,
            orderRef: order.publicRef,
            amount: (order.totalMinor / 100).toFixed(2),
            trackingNumber: params.trackingNumber,
            trackingUrl: params.trackingUrl,
            carrierName: params.carrierName,
          };

          if (customerPhone) {
            await NotificationService.enqueueNotification({
              channel: "sms",
              recipient: customerPhone,
              templateId: "order_dispatched",
              context,
              metadata: { orderId: order.id },
            });
          }
          if (customerEmail) {
            await NotificationService.enqueueNotification({
              channel: "email",
              recipient: customerEmail,
              templateId: "order_dispatched",
              context,
              metadata: { orderId: order.id },
            });
          }
        }
      }
    });
  }

  /**
   * Marks a shipment as delivered. Once all parcels are delivered,
   * transitions the order to 'delivered'.
   */
  static async deliverShipment(
    shipmentId: string,
    actorId?: string,
  ): Promise<void> {
    const db = getRuntimeDb();

    await db.transaction(async (tx) => {
      const [shipment] = await tx
        .select()
        .from(shipments)
        .where(eq(shipments.id, shipmentId))
        .for("update");
      if (!shipment) {
        throw new Error("Shipment not found");
      }

      const now = new Date();
      await tx
        .update(shipments)
        .set({
          status: "delivered",
          deliveredAt: now,
          updatedAt: now,
        })
        .where(eq(shipments.id, shipmentId));

      await tx.insert(shipmentEvents).values({
        shipmentId,
        status: "delivered",
        details: "Shipment confirmed delivered to recipient",
      });

      const allShipments = await tx
        .select()
        .from(shipments)
        .where(eq(shipments.orderId, shipment.orderId));
      const allDelivered = allShipments.every((s) => s.status === "delivered");

      if (allDelivered) {
        const [order] = await tx
          .select()
          .from(orders)
          .where(eq(orders.id, shipment.orderId));
        if (order && order.state === "shipped") {
          await OrderService.transitionOrderState({
            orderId: order.id,
            toState: "delivered",
            actorId: actorId ?? null,
            actorType: "staff",
            reason: "All shipment packages confirmed delivered",
            tx,
          });
        }
      }
    });
  }

  /**
   * Records cash collection for a COD order.
   */
  static async recordCodCollection(params: {
    orderId: string;
    amountCollectedMinor: bigint;
    notes?: string;
  }): Promise<void> {
    const db = getRuntimeDb();
    const now = new Date();

    await db
      .update(codCollections)
      .set({
        amountCollectedMinor: params.amountCollectedMinor,
        status: "collected",
        collectedAt: now,
        notes: params.notes ?? null,
      })
      .where(eq(codCollections.orderId, params.orderId));
  }

  /**
   * Retrieves shipment details along with items and events for an order.
   */
  static async getOrderShipments(orderId: string) {
    const db = getRuntimeDb();
    const list = await db
      .select()
      .from(shipments)
      .where(eq(shipments.orderId, orderId));

    const result = [];
    for (const shp of list) {
      const items = await db
        .select({
          id: shipmentItems.id,
          orderLineId: shipmentItems.orderLineId,
          quantity: shipmentItems.quantity,
          productName: orderLines.productNameSnapshot,
          sku: orderLines.variantSkuSnapshot,
        })
        .from(shipmentItems)
        .innerJoin(orderLines, eq(shipmentItems.orderLineId, orderLines.id))
        .where(eq(shipmentItems.shipmentId, shp.id));

      const events = await db
        .select()
        .from(shipmentEvents)
        .where(eq(shipmentEvents.shipmentId, shp.id));

      result.push({
        ...shp,
        items,
        events,
      });
    }

    return result;
  }
}
