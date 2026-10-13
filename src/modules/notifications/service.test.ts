import { describe, it, expect, beforeAll } from "vitest";
import { getMigratorDb } from "../database";
import { suppressions, messageLog, queueJobs } from "./schema";
import { NotificationService } from "./service";
import { TemplateRegistry } from "./templates";
import {
  ConsoleEmailProvider,
  TelecomSmsProvider,
  WhatsAppBusinessProvider,
} from "./adapters";

describe("Notifications Engine, Adapters & Queue Dispatch", () => {
  beforeAll(async () => {
    // Clear test tables
    const { db } = getMigratorDb();
    await db.delete(messageLog);
    await db.delete(queueJobs);
    await db.delete(suppressions);
  });

  describe("Channel Adapters", () => {
    it("ConsoleEmailProvider sends valid email destinations", async () => {
      const emailProvider = new ConsoleEmailProvider();
      const res = await emailProvider.send({
        to: "customer@example.com",
        subject: "Test Subject",
        body: "Test Body",
      });
      expect(res.success).toBe(true);
      expect(res.messageId).toContain("email_");

      const invalid = await emailProvider.send({
        to: "invalid-email-address",
        body: "Test Body",
      });
      expect(invalid.success).toBe(false);
      expect(invalid.error).toBe("Invalid email destination");
    });

    it("TelecomSmsProvider handles valid Pakistan mobile numbers", async () => {
      const smsProvider = new TelecomSmsProvider();
      const res = await smsProvider.send({
        to: "+923001234567",
        body: "Your order has been confirmed.",
      });
      expect(res.success).toBe(true);
      expect(res.messageId).toContain("sms_");

      const localFormat = await smsProvider.send({
        to: "031301151563",
        body: "Your order has been confirmed.",
      });
      expect(localFormat.success).toBe(true);

      const invalid = await smsProvider.send({
        to: "+14155552671",
        body: "Test",
      });
      expect(invalid.success).toBe(false);
      expect(invalid.error).toBe("Invalid mobile phone destination");
    });

    it("WhatsAppBusinessProvider handles valid recipients", async () => {
      const waProvider = new WhatsAppBusinessProvider();
      const res = await waProvider.send({
        to: "+923004634494",
        body: "Order update via WhatsApp",
      });
      expect(res.success).toBe(true);
      expect(res.messageId).toContain("wa_");
    });
  });

  describe("Template Registry", () => {
    it("renders order_created_advance with Meezan and Easypaisa accounts", () => {
      const t = TemplateRegistry.render("order_created_advance", {
        orderRef: "FM-2026-TEST-001",
        totalPkr: "PKR 15,000.00",
      });
      expect(t.subject).toContain("FM-2026-TEST-001");
      expect(t.body).toContain("Meezan Bank");
      expect(t.body).toContain("03130115156301");
      expect(t.body).toContain("Easypaisa");
      expect(t.body).toContain("03004634494");
      expect(t.body).toContain("Muhammad Asad");
    });

    it("renders payment_confirmed template", () => {
      const t = TemplateRegistry.render("payment_confirmed", {
        orderRef: "FM-2026-TEST-002",
        transactionRef: "EP-987654",
      });
      expect(t.subject).toContain("Payment Verified");
      expect(t.body).toContain("EP-987654");
    });

    it("throws on unrecognized template", () => {
      expect(() =>
        TemplateRegistry.render("non_existent_template", { orderRef: "X" }),
      ).toThrow("Unknown notification template");
    });
  });

  describe("Queue Enqueueing and Processing", () => {
    it("enqueues notification and processes it through the background queue", async () => {
      const { jobId } = await NotificationService.enqueueNotification({
        channel: "email",
        recipient: "farmer@furrowmark.test",
        templateId: "order_created_cod",
        context: {
          orderRef: "FM-2026-COD-999",
          totalPkr: "PKR 4,500.00",
        },
      });

      expect(jobId).toBeDefined();

      // Process batch
      const outcome = await NotificationService.processPendingQueue(10);
      expect(outcome.processed).toBeGreaterThanOrEqual(1);

      // Verify message_log entry
      const { db } = getMigratorDb();
      const logs = await db.select().from(messageLog);
      const match = logs.find((l) => l.recipient === "farmer@furrowmark.test");
      expect(match).toBeDefined();
      expect(match!.status).toBe("sent");
      expect(match!.templateId).toBe("order_created_cod");
    });

    it("respects recipient suppressions", async () => {
      const { db } = getMigratorDb();
      await db.insert(suppressions).values({
        channel: "email",
        destination: "bounced@example.com",
        reason: "hard_bounce",
      });

      const res = await NotificationService.sendImmediate({
        channel: "email",
        recipient: "bounced@example.com",
        body: "Hello",
      });

      expect(res.status).toBe("suppressed");

      const logs = await db.select().from(messageLog);
      const suppressedLog = logs.find(
        (l) => l.recipient === "bounced@example.com",
      );
      expect(suppressedLog).toBeDefined();
      expect(suppressedLog!.status).toBe("suppressed");
    });
  });
});
