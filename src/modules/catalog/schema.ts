import {
  pgTable,
  text,
  timestamp,
  uuid,
  pgEnum,
  integer,
  boolean,
  check,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "../database/schema";

export const productClassEnum = pgEnum("product_class", [
  "seed",
  "fertiliser",
  "nutrient",
  "pesticide",
  "tool",
]);

export const productStatusEnum = pgEnum("product_status", [
  "draft",
  "in_review",
  "published",
  "archived",
]);

export const batchStatusEnum = pgEnum("batch_status", [
  "available",
  "quarantined",
  "expired",
  "recalled",
  "written_off",
]);

export const ledgerMovementTypeEnum = pgEnum("ledger_movement_type", [
  "receipt",
  "reservation",
  "release",
  "shipment",
  "return_quarantine",
  "quarantine_release",
  "adjustment",
  "write_off",
]);

export const documentKindEnum = pgEnum("document_kind", [
  "label_pdf",
  "safety_data_sheet",
  "technical_bulletin",
]);

// Categories tree
export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  parentId: uuid("parent_id"),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  position: integer("position").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Brands & Manufacturers
export const brands = pgTable("brands", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
  country: text("country"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const manufacturers = pgTable("manufacturers", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
  country: text("country"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Agronomic reference data: Crops, Targets, Active Ingredients
export const crops = pgTable("crops", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
});

export const targets = pgTable("targets", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
  kind: text("kind").notNull(), // weed, insect, fungal_disease, rodent, etc.
});

export const activeIngredients = pgTable("active_ingredients", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
});

// Products Master
export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => categories.id),
  brandId: uuid("brand_id")
    .notNull()
    .references(() => brands.id),
  manufacturerId: uuid("manufacturer_id").references(() => manufacturers.id),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  class: productClassEnum("class").notNull(),
  status: productStatusEnum("status").notNull().default("draft"),
  description: text("description").notNull(),
  countryOfOrigin: text("country_of_origin").notNull(),
  authoredBy: uuid("authored_by")
    .notNull()
    .references(() => users.id),
  publishedBy: uuid("published_by").references(() => users.id),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  currentSafetyVersionId: uuid("current_safety_version_id"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Product Variants (SKUs & Pack sizes)
export const variants = pgTable("variants", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  sku: text("sku").notNull().unique(),
  packSize: text("pack_size").notNull(), // e.g. "1 L", "500 mL", "10 kg"
  packSizeValue: integer("pack_size_value").notNull(), // numeric unit quantity (e.g. 1000 for 1000ml)
  packSizeUnit: text("pack_size_unit").notNull(), // ml, l, g, kg
  priceMinor: integer("price_minor").notNull(), // integer minor units (PKR paisas or whole PKR)
  currency: text("currency").notNull().default("PKR"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Price History (every price change stored immutably with timestamp)
export const priceHistory = pgTable("price_history", {
  id: uuid("id").defaultRandom().primaryKey(),
  variantId: uuid("variant_id")
    .notNull()
    .references(() => variants.id, { onDelete: "cascade" }),
  priceMinor: integer("price_minor").notNull(),
  currency: text("currency").notNull().default("PKR"),
  changedBy: uuid("changed_by")
    .notNull()
    .references(() => users.id),
  validFrom: timestamp("valid_from", { withTimezone: true })
    .notNull()
    .defaultNow(),
  validTo: timestamp("valid_to", { withTimezone: true }),
});

// Versioned Safety-Critical Fields (Pesticides & Regulated Agrochemicals)
export const safetyVersions = pgTable(
  "safety_versions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    versionNumber: integer("version_number").notNull(),
    labelText: text("label_text").notNull(),
    applicationRate: text("application_rate").notNull(),
    applicationMethod: text("application_method").notNull(),
    preHarvestIntervalDays: integer("pre_harvest_interval_days").notNull(),
    reentryIntervalHours: integer("reentry_interval_hours").notNull(),
    hazardClass: text("hazard_class").notNull(), // WHO Class Ia, Ib, II, III, U
    signalWord: text("signal_word").notNull(), // DANGER, WARNING, CAUTION
    registrationNumber: text("registration_number").notNull(),
    firstAid: text("first_aid").notNull(),
    storageAndHandling: text("storage_and_handling").notNull(),
    isRestrictedUse: boolean("is_restricted_use").notNull().default(false),
    authoredBy: uuid("authored_by")
      .notNull()
      .references(() => users.id),
    approvedBy: uuid("approved_by").references(() => users.id),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    isApproved: boolean("is_approved").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("idx_product_safety_version").on(
      table.productId,
      table.versionNumber,
    ),
  ],
);

// Product Documents (Label PDFs, Safety Data Sheets)
export const productDocuments = pgTable("product_documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  safetyVersionId: uuid("safety_version_id").references(
    () => safetyVersions.id,
  ),
  kind: documentKindEnum("kind").notNull(),
  title: text("title").notNull(),
  storageKey: text("storage_key").notNull(),
  fileSizeBytes: integer("file_size_bytes").notNull(),
  sha256: text("sha256").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Product Images (Strict: Verified Real Packaging Pack Shots Only)
export const productImages = pgTable("product_images", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  storageKey: text("storage_key").notNull(),
  source: text("source").notNull(), // Manufacturer pack shot or verified photographer
  permissionNote: text("permission_note").notNull(),
  altText: text("alt_text").notNull(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  isPrimary: boolean("is_primary").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Product Specific Class Details
export const seedDetails = pgTable("seed_details", {
  productId: uuid("product_id")
    .primaryKey()
    .references(() => products.id, { onDelete: "cascade" }),
  variety: text("variety").notNull(),
  germinationRatePercent: integer("germination_rate_percent").notNull(),
  purityPercent: integer("purity_percent").notNull(),
  isTreated: boolean("is_treated").notNull().default(false),
  treatmentWarning: text("treatment_warning"),
  recommendedSeason: text("recommended_season").notNull(),
  recommendedRegion: text("recommended_region").notNull(),
});

export const fertiliserDetails = pgTable("fertiliser_details", {
  productId: uuid("product_id")
    .primaryKey()
    .references(() => products.id, { onDelete: "cascade" }),
  nutrientAnalysis: text("nutrient_analysis").notNull(), // e.g. NPK 10-20-20
  netWeightKg: integer("net_weight_kg").notNull(),
  registrationNumber: text("registration_number").notNull(),
  storageHandling: text("storage_handling").notNull(),
});

// Product Relationships
export const productCrops = pgTable(
  "product_crops",
  {
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    cropId: uuid("crop_id")
      .notNull()
      .references(() => crops.id, { onDelete: "cascade" }),
  },
  (table) => [
    uniqueIndex("idx_product_crop").on(table.productId, table.cropId),
  ],
);

export const productTargets = pgTable(
  "product_targets",
  {
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    targetId: uuid("target_id")
      .notNull()
      .references(() => targets.id, { onDelete: "cascade" }),
  },
  (table) => [
    uniqueIndex("idx_product_target").on(table.productId, table.targetId),
  ],
);

export const productIngredients = pgTable(
  "product_ingredients",
  {
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    ingredientId: uuid("ingredient_id")
      .notNull()
      .references(() => activeIngredients.id, { onDelete: "cascade" }),
    concentration: text("concentration").notNull(), // e.g. "480 g/L"
  },
  (table) => [
    uniqueIndex("idx_product_ingredient").on(
      table.productId,
      table.ingredientId,
    ),
  ],
);

// Inventory: Suppliers & Batches
export const suppliers = pgTable("suppliers", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
  contactInfo: text("contact_info"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const batches = pgTable(
  "batches",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    variantId: uuid("variant_id")
      .notNull()
      .references(() => variants.id),
    lotNumber: text("lot_number").notNull(),
    supplierId: uuid("supplier_id").references(() => suppliers.id),
    manufacturedOn: timestamp("manufactured_on", {
      withTimezone: true,
    }).notNull(),
    expiresOn: timestamp("expires_on", { withTimezone: true }).notNull(),
    receivedQuantity: integer("received_quantity").notNull(),
    onHand: integer("on_hand").notNull().default(0),
    reserved: integer("reserved").notNull().default(0),
    quarantined: integer("quarantined").notNull().default(0),
    status: batchStatusEnum("status").notNull().default("available"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("idx_batch_lot_variant").on(table.variantId, table.lotNumber),
    check("chk_on_hand_non_negative", sql`${table.onHand} >= 0`),
    check("chk_reserved_non_negative", sql`${table.reserved} >= 0`),
    check("chk_quarantined_non_negative", sql`${table.quarantined} >= 0`),
    check(
      "chk_allocation_limit",
      sql`${table.reserved} + ${table.quarantined} <= ${table.onHand}`,
    ),
  ],
);

// Immutable Stock Ledger (Audit Trail of every physical unit move)
export const stockLedger = pgTable("stock_ledger", {
  id: uuid("id").defaultRandom().primaryKey(),
  batchId: uuid("batch_id")
    .notNull()
    .references(() => batches.id),
  movementType: ledgerMovementTypeEnum("movement_type").notNull(),
  quantity: integer("quantity").notNull(), // positive or negative delta
  actorId: uuid("actor_id")
    .notNull()
    .references(() => users.id),
  reason: text("reason").notNull(),
  referenceId: text("reference_id"), // order id, return id, stock take id
  at: timestamp("at", { withTimezone: true }).notNull().defaultNow(),
});

// Recalls
export const recalls = pgTable("recalls", {
  id: uuid("id").defaultRandom().primaryKey(),
  initiatedBy: uuid("initiated_by")
    .notNull()
    .references(() => users.id),
  reason: text("reason").notNull(),
  severity: text("severity").notNull(),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const recallBatches = pgTable(
  "recall_batches",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    recallId: uuid("recall_id")
      .notNull()
      .references(() => recalls.id, { onDelete: "cascade" }),
    batchId: uuid("batch_id")
      .notNull()
      .references(() => batches.id),
    quarantinedQuantity: integer("quarantined_quantity").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("idx_recall_batch").on(table.recallId, table.batchId),
  ],
);

// Search Queries Analytics (No personal data)
export const searchQueries = pgTable(
  "search_queries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    normalizedQuery: text("normalized_query").notNull(),
    resultsCount: integer("results_count").notNull(),
    at: timestamp("at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("idx_search_queries_count").on(table.resultsCount)],
);
