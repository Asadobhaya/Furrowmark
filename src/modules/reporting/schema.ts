import { pgTable, uuid, text, jsonb, timestamp } from "drizzle-orm/pg-core";
import { users } from "../database/schema";

export const reportExports = pgTable("report_exports", {
  id: uuid("id").primaryKey().defaultRandom(),
  staffId: uuid("staff_id")
    .notNull()
    .references(() => users.id),
  reportType: text("report_type").notNull(), // 'batch_expiry' | 'pesticide_registry' | 'revenue_ledger'
  parameters: jsonb("parameters").$type<Record<string, unknown>>().default({}),
  recordCount: text("record_count"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
