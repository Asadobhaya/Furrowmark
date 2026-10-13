import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  integer,
  boolean,
  index,
} from "drizzle-orm/pg-core";
import { users } from "../database/schema";

export const channelEnum = ["email", "sms", "whatsapp"] as const;
export type NotificationChannel = (typeof channelEnum)[number];

export const messageStatusEnum = [
  "queued",
  "sent",
  "failed",
  "suppressed",
] as const;
export type MessageStatus = (typeof messageStatusEnum)[number];

// 1. Notification Preferences
export const notificationPreferences = pgTable(
  "notification_preferences",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    channel: text("channel").notNull(), // 'email', 'sms', 'whatsapp'
    enabled: boolean("enabled").default(true).notNull(),
    quietHoursStart: text("quiet_hours_start"), // e.g. "22:00"
    quietHoursEnd: text("quiet_hours_end"), // e.g. "07:00"
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("idx_notif_prefs_user").on(table.userId)],
);

// 2. Suppressions (bounced emails, opted-out phone numbers)
export const suppressions = pgTable(
  "suppressions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    channel: text("channel").notNull(),
    destination: text("destination").notNull(), // email address or phone number
    reason: text("reason").notNull(), // 'bounce', 'complaint', 'opt_out'
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("idx_suppressions_dest").on(table.destination)],
);

// 3. Message Log
export const messageLog = pgTable(
  "message_log",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    channel: text("channel").notNull(),
    recipient: text("recipient").notNull(),
    templateId: text("template_id").notNull(),
    status: text("status").notNull(), // queued, sent, failed, suppressed
    subject: text("subject"),
    body: text("body").notNull(),
    metadata: jsonb("metadata"),
    error: text("error"),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_message_log_status").on(table.status),
    index("idx_message_log_created_at").on(table.createdAt),
  ],
);

// 4. Postgres-Backed Queue Jobs
export const queueJobs = pgTable(
  "queue_jobs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    queue: text("queue").default("default").notNull(),
    payload: jsonb("payload").notNull(),
    attempts: integer("attempts").default(0).notNull(),
    maxAttempts: integer("max_attempts").default(5).notNull(),
    availableAt: timestamp("available_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    reservedAt: timestamp("reserved_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    lastError: text("last_error"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("idx_queue_jobs_poll").on(table.queue, table.availableAt)],
);
