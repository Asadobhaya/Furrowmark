import {
  pgTable,
  uuid,
  text,
  integer,
  bigint,
  timestamp,
} from "drizzle-orm/pg-core";
import { orders, orderLines } from "../commerce/schema";

export const shipments = pgTable("shipments", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id),
  shipmentNumber: text("shipment_number").notNull().unique(),
  parcelType: text("parcel_type").notNull().default("general"), // 'general' | 'hazardous_agrochemical'
  carrierName: text("carrier_name").notNull().default("ManualDispatch"),
  trackingNumber: text("tracking_number"),
  trackingUrl: text("tracking_url"),
  status: text("status").notNull().default("pending"), // 'pending' | 'packed' | 'handed_to_carrier' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'delivery_failed' | 'returned_to_sender' | 'cancelled'
  shippedAt: timestamp("shipped_at", { withTimezone: true }),
  deliveredAt: timestamp("delivered_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const shipmentItems = pgTable("shipment_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  shipmentId: uuid("shipment_id")
    .notNull()
    .references(() => shipments.id, { onDelete: "cascade" }),
  orderLineId: uuid("order_line_id")
    .notNull()
    .references(() => orderLines.id),
  quantity: integer("quantity").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const shipmentEvents = pgTable("shipment_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  shipmentId: uuid("shipment_id")
    .notNull()
    .references(() => shipments.id, { onDelete: "cascade" }),
  status: text("status").notNull(),
  location: text("location"),
  details: text("details"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const codCollections = pgTable("cod_collections", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id),
  amountDueMinor: bigint("amount_due_minor", { mode: "bigint" }).notNull(),
  amountCollectedMinor: bigint("amount_collected_minor", {
    mode: "bigint",
  }).notNull(),
  status: text("status").notNull().default("pending"), // 'pending' | 'collected' | 'remitted'
  collectedAt: timestamp("collected_at", { withTimezone: true }),
  remittedAt: timestamp("remitted_at", { withTimezone: true }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
