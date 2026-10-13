import { eq, and, sql } from "drizzle-orm";
import { getDb, getRuntimeDb } from "../database";
import {
  suppressions,
  messageLog,
  queueJobs,
  type NotificationChannel,
  type MessageStatus,
} from "./schema";
import {
  ConsoleEmailProvider,
  TelecomSmsProvider,
  WhatsAppBusinessProvider,
  type NotificationProvider,
  type OutgoingMessage,
} from "./adapters";
import { TemplateRegistry, type TemplateContext } from "./templates";

export interface EnqueueNotificationParams {
  channel: NotificationChannel;
  recipient: string;
  templateId: string;
  context: TemplateContext;
  metadata?: Record<string, unknown>;
}

export class NotificationService {
  private static providers: Map<NotificationChannel, NotificationProvider> =
    new Map<NotificationChannel, NotificationProvider>([
      ["email", new ConsoleEmailProvider()],
      ["sms", new TelecomSmsProvider()],
      ["whatsapp", new WhatsAppBusinessProvider()],
    ]);

  static getProvider(channel: NotificationChannel): NotificationProvider {
    const provider = this.providers.get(channel);
    if (!provider) {
      throw new Error(`Unsupported notification channel: ${channel}`);
    }
    return provider;
  }

  static registerProvider(
    channel: NotificationChannel,
    provider: NotificationProvider,
  ): void {
    this.providers.set(channel, provider);
  }

  /**
   * Enqueues a notification into queue_jobs for reliable background delivery.
   */
  static async enqueueNotification(
    params: EnqueueNotificationParams,
  ): Promise<{ jobId: string }> {
    const db = getRuntimeDb();
    const rendered = TemplateRegistry.render(params.templateId, params.context);

    const [job] = await db
      .insert(queueJobs)
      .values({
        queue: "notifications",
        payload: {
          channel: params.channel,
          recipient: params.recipient,
          templateId: params.templateId,
          subject: rendered.subject,
          body: rendered.body,
          metadata: params.metadata ?? {},
        },
      })
      .returning();

    return { jobId: job!.id };
  }

  /**
   * Checks if a destination is suppressed (opted out or bounced).
   */
  static async isSuppressed(
    channel: NotificationChannel,
    destination: string,
  ): Promise<boolean> {
    const db = getDb();
    const [row] = await db
      .select({ id: suppressions.id })
      .from(suppressions)
      .where(
        and(
          eq(suppressions.channel, channel),
          eq(suppressions.destination, destination.trim().toLowerCase()),
        ),
      );
    return !!row;
  }

  /**
   * Directly sends a notification with suppression check and message log auditing.
   */
  static async sendImmediate(params: {
    channel: NotificationChannel;
    recipient: string;
    subject?: string;
    body: string;
    templateId?: string;
    metadata?: Record<string, unknown>;
  }): Promise<{ status: MessageStatus; messageId?: string; error?: string }> {
    const db = getRuntimeDb();
    const templateId = params.templateId ?? "custom";

    // 1. Suppression verification
    const suppressed = await this.isSuppressed(
      params.channel,
      params.recipient,
    );
    if (suppressed) {
      await db.insert(messageLog).values({
        channel: params.channel,
        recipient: params.recipient,
        templateId,
        status: "suppressed",
        subject: params.subject ?? null,
        body: params.body,
        metadata: params.metadata ?? null,
        sentAt: null,
      });
      return { status: "suppressed" };
    }

    // 2. Dispatch via channel adapter
    const provider = this.getProvider(params.channel);
    const outgoing: OutgoingMessage = {
      to: params.recipient,
      subject: params.subject,
      body: params.body,
      metadata: params.metadata,
    };

    const res = await provider.send(outgoing);

    // 3. Log delivery
    await db.insert(messageLog).values({
      channel: params.channel,
      recipient: params.recipient,
      templateId,
      status: res.success ? "sent" : "failed",
      subject: params.subject ?? null,
      body: params.body,
      metadata: params.metadata ?? null,
      error: res.error ?? null,
      sentAt: res.success ? new Date() : null,
    });

    return {
      status: res.success ? "sent" : "failed",
      messageId: res.messageId,
      error: res.error,
    };
  }

  /**
   * Processes pending notifications from the PostgreSQL queue.
   */
  static async processPendingQueue(
    batchSize = 10,
  ): Promise<{ processed: number; failed: number }> {
    const db = getRuntimeDb();
    let processed = 0;
    let failed = 0;

    const jobs = await db
      .select()
      .from(queueJobs)
      .where(
        and(
          eq(queueJobs.queue, "notifications"),
          sql`${queueJobs.completedAt} IS NULL`,
          sql`${queueJobs.availableAt} <= now()`,
        ),
      )
      .limit(batchSize);

    for (const job of jobs) {
      const payload = job.payload as {
        channel: NotificationChannel;
        recipient: string;
        subject?: string;
        body: string;
        templateId?: string;
        metadata?: Record<string, unknown>;
      };

      try {
        const result = await this.sendImmediate(payload);
        if (result.status === "sent" || result.status === "suppressed") {
          await db
            .update(queueJobs)
            .set({ completedAt: new Date() })
            .where(eq(queueJobs.id, job.id));
          processed++;
        } else {
          await db
            .update(queueJobs)
            .set({
              attempts: job.attempts + 1,
              lastError: result.error ?? "Failed sending",
              availableAt: new Date(Date.now() + 60 * 1000), // Backoff retry after 1 min
            })
            .where(eq(queueJobs.id, job.id));
          failed++;
        }
      } catch (err) {
        await db
          .update(queueJobs)
          .set({
            attempts: job.attempts + 1,
            lastError: err instanceof Error ? err.message : String(err),
            availableAt: new Date(Date.now() + 60 * 1000),
          })
          .where(eq(queueJobs.id, job.id));
        failed++;
      }
    }

    return { processed, failed };
  }
}
