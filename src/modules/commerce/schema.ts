import {
  pgTable,
  uuid,
  text,
  integer,
  bigint,
  boolean,
  timestamp,
  jsonb,
  uniqueIndex,
  index,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "../database/schema";
import { variants, batches } from "../catalog/schema";

export const orderStateEnum = [
  "pending_payment",
  "awaiting_confirmation",
  "paid",
  "processing",
  "packed",
  "shipped",
  "delivered",
  "cancelled",
  "partially_refunded",
  "refunded",
] as const;

export type OrderState = (typeof orderStateEnum)[number];

export const paymentMethodEnum = [
  "cash_on_delivery",
  "advance_payment",
] as const;

export type PaymentMethod = (typeof paymentMethodEnum)[number];

export const couponDiscountTypeEnum = ["fixed_minor", "percentage_bp"] as const;

export type CouponDiscountType = (typeof couponDiscountTypeEnum)[number];

export const paymentStatusEnum = [
  "pending",
  "completed",
  "failed",
  "refunded",
] as const;

export type PaymentStatus = (typeof paymentStatusEnum)[number];

// 1. Carts
export const carts = pgTable(
  "carts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
    guestTokenHash: text("guest_token_hash"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_carts_user_id").on(table.userId),
    index("idx_carts_guest_token_hash").on(table.guestTokenHash),
  ],
);

// 2. Cart Items
export const cartItems = pgTable(
  "cart_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    cartId: uuid("cart_id")
      .references(() => carts.id, { onDelete: "cascade" })
      .notNull(),
    variantId: uuid("variant_id")
      .references(() => variants.id, { onDelete: "cascade" })
      .notNull(),
    quantity: integer("quantity").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("uq_cart_items_cart_variant").on(table.cartId, table.variantId),
    check("chk_cart_item_quantity_positive", sql`${table.quantity} > 0`),
  ],
);

// 3. Tax Rates
export const taxRates = pgTable("tax_rates", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  rateBp: integer("rate_bp").notNull(), // Basis points: 1800 = 18%
  inclusive: boolean("inclusive").default(false).notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// 4. Shipping Zones
export const shippingZones = pgTable("shipping_zones", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  regionCode: text("region_code").notNull().unique(), // e.g. 'PK-PB' for Punjab, 'PK-SD' for Sindh
  baseFeeMinor: bigint("base_fee_minor", { mode: "number" }).notNull(),
  freeThresholdMinor: bigint("free_threshold_minor", { mode: "number" }),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// 5. Coupons
export const coupons = pgTable(
  "coupons",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    code: text("code").notNull().unique(),
    discountType: text("discount_type").notNull(), // 'fixed_minor' or 'percentage_bp'
    discountValue: bigint("discount_value", { mode: "number" }).notNull(),
    minSubtotalMinor: bigint("min_subtotal_minor", { mode: "number" })
      .default(0)
      .notNull(),
    usageLimit: integer("usage_limit"),
    timesUsed: integer("times_used").default(0).notNull(),
    validFrom: timestamp("valid_from", { withTimezone: true }).notNull(),
    validUntil: timestamp("valid_until", { withTimezone: true }).notNull(),
    active: boolean("active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    check(
      "chk_coupon_discount_value_positive",
      sql`${table.discountValue} > 0`,
    ),
    check("chk_coupon_times_used_non_negative", sql`${table.timesUsed} >= 0`),
  ],
);

// 6. Orders
export const orders = pgTable(
  "orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    publicRef: text("public_ref").notNull().unique(),
    userId: uuid("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    customerEmail: text("customer_email").notNull(),
    customerPhone: text("customer_phone").notNull(),
    shippingAddress: jsonb("shipping_address").notNull(),
    billingAddress: jsonb("billing_address").notNull(),
    state: text("state").notNull(),
    paymentMethod: text("payment_method").notNull(),
    currency: text("currency").default("PKR").notNull(),
    subtotalMinor: bigint("subtotal_minor", { mode: "number" }).notNull(),
    discountMinor: bigint("discount_minor", { mode: "number" })
      .default(0)
      .notNull(),
    taxMinor: bigint("tax_minor", { mode: "number" }).default(0).notNull(),
    shippingMinor: bigint("shipping_minor", { mode: "number" })
      .default(0)
      .notNull(),
    totalMinor: bigint("total_minor", { mode: "number" }).notNull(),
    pricingSnapshot: jsonb("pricing_snapshot").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_orders_user_id").on(table.userId),
    index("idx_orders_state").on(table.state),
    index("idx_orders_created_at").on(table.createdAt),
    check("chk_order_total_non_negative", sql`${table.totalMinor} >= 0`),
  ],
);

// 7. Order Lines
export const orderLines = pgTable("order_lines", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id")
    .references(() => orders.id, { onDelete: "cascade" })
    .notNull(),
  variantId: uuid("variant_id")
    .references(() => variants.id, { onDelete: "restrict" })
    .notNull(),
  productNameSnapshot: text("product_name_snapshot").notNull(),
  variantSkuSnapshot: text("variant_sku_snapshot").notNull(),
  unitPriceMinor: bigint("unit_price_minor", { mode: "number" }).notNull(),
  quantity: integer("quantity").notNull(),
  taxMinor: bigint("tax_minor", { mode: "number" }).default(0).notNull(),
  totalMinor: bigint("total_minor", { mode: "number" }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// 8. Order Line Allocations (Batch supply traceability)
export const orderLineAllocations = pgTable("order_line_allocations", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderLineId: uuid("order_line_id")
    .references(() => orderLines.id, { onDelete: "cascade" })
    .notNull(),
  batchId: uuid("batch_id")
    .references(() => batches.id, { onDelete: "restrict" })
    .notNull(),
  quantity: integer("quantity").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// 9. Order Events (Append-only audit trail)
export const orderEvents = pgTable("order_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id")
    .references(() => orders.id, { onDelete: "cascade" })
    .notNull(),
  fromState: text("from_state"),
  toState: text("to_state").notNull(),
  actorId: uuid("actor_id"),
  actorType: text("actor_type").notNull(), // 'customer', 'staff', 'system', 'gateway'
  reason: text("reason"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// 10. Payments
export const payments = pgTable(
  "payments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .references(() => orders.id, { onDelete: "cascade" })
      .notNull(),
    provider: text("provider").notNull(), // 'cash_on_delivery', 'advance_payment'
    providerReference: text("provider_reference"), // e.g. customer-supplied transaction ID (manually verified)
    amountMinor: bigint("amount_minor", { mode: "number" }).notNull(),
    currency: text("currency").default("PKR").notNull(),
    status: text("status").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_payments_order_id").on(table.orderId),
    index("idx_payments_provider_ref").on(table.providerReference),
  ],
);

// 11. Webhook Events (Idempotency and raw request audit)
export const webhookEvents = pgTable(
  "webhook_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    provider: text("provider").notNull(),
    eventId: text("event_id").notNull(),
    eventType: text("event_type").notNull(),
    payloadHash: text("payload_hash").notNull(),
    processedAt: timestamp("processed_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    outcome: text("outcome").notNull(), // 'success', 'ignored', 'failed'
  },
  (table) => [
    uniqueIndex("uq_webhook_events_provider_event").on(
      table.provider,
      table.eventId,
    ),
  ],
);

// 12. Refunds
export const refunds = pgTable(
  "refunds",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    paymentId: uuid("payment_id")
      .references(() => payments.id, { onDelete: "restrict" })
      .notNull(),
    orderId: uuid("order_id")
      .references(() => orders.id, { onDelete: "cascade" })
      .notNull(),
    amountMinor: bigint("amount_minor", { mode: "number" }).notNull(),
    reason: text("reason").notNull(),
    providerRefundId: text("provider_refund_id"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    check("chk_refund_amount_positive", sql`${table.amountMinor} > 0`),
  ],
);
