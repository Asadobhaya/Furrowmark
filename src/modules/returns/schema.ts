import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  bigint,
  timestamp,
} from "drizzle-orm/pg-core";
import { orders, orderLines } from "../commerce/schema";
import { users } from "../database/schema";

export const returnRequests = pgTable("return_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id),
  rmaNumber: text("rma_number").notNull().unique(),
  customerId: uuid("customer_id").references(() => users.id),
  reason: text("reason").notNull(),
  status: text("status").notNull().default("requested"), // 'requested' | 'approved' | 'rejected' | 'awaiting_item' | 'received' | 'inspected' | 'closed'
  resolution: text("resolution"), // 'refund' | 'replacement' | 'store_credit' | 'closed_no_action'
  staffNotes: text("staff_notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const returnLines = pgTable("return_lines", {
  id: uuid("id").primaryKey().defaultRandom(),
  returnRequestId: uuid("return_request_id")
    .notNull()
    .references(() => returnRequests.id, { onDelete: "cascade" }),
  orderLineId: uuid("order_line_id")
    .notNull()
    .references(() => orderLines.id),
  quantity: integer("quantity").notNull(),
  condition: text("condition").notNull(), // 'sealed' | 'opened' | 'damaged'
  restockable: boolean("restockable").notNull().default(false),
  inspectionNotes: text("inspection_notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const storeCreditLedger = pgTable("store_credit_ledger", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  amountMinor: bigint("amount_minor", { mode: "bigint" }).notNull(),
  balanceAfterMinor: bigint("balance_after_minor", {
    mode: "bigint",
  }).notNull(),
  reason: text("reason").notNull(),
  referenceId: text("reference_id"), // e.g. RMA number or order ID
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
