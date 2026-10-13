import {
  pgTable,
  uuid,
  text,
  integer,
  date,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core";
import { users } from "../database/schema";

export const chatConversations = pgTable("chat_conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionTokenHash: text("session_token_hash").notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  status: text("status").notNull().default("active"), // 'active' | 'closed' | 'escalated'
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const chatMessages = pgTable("chat_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  conversationId: uuid("conversation_id")
    .notNull()
    .references(() => chatConversations.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // 'user' | 'assistant' | 'tool' | 'system'
  content: text("content").notNull(),
  toolCalls: jsonb("tool_calls").$type<unknown>(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const chatSpendDaily = pgTable("chat_spend_daily", {
  date: date("date").primaryKey(),
  tokenCount: integer("token_count").notNull().default(0),
  estimatedCostCents: integer("estimated_cost_cents").notNull().default(0),
  hardLimitCents: integer("hard_limit_cents").notNull().default(500), // $5.00 daily safety cap
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const supportTickets = pgTable("support_tickets", {
  id: uuid("id").primaryKey().defaultRandom(),
  ticketNumber: text("ticket_number").notNull().unique(),
  conversationId: uuid("conversation_id").references(
    () => chatConversations.id,
    { onDelete: "set null" },
  ),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerEmail: text("customer_email"),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("open"), // 'open' | 'in_progress' | 'resolved'
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
