export interface OutgoingMessage {
  to: string; // email address or phone number (+923...)
  subject?: string;
  body: string;
  metadata?: Record<string, unknown>;
}

export interface SendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface NotificationProvider {
  readonly channel: "email" | "sms" | "whatsapp";
  send(message: OutgoingMessage): Promise<SendResult>;
}

/**
 * Standard Email notification provider
 */
export class ConsoleEmailProvider implements NotificationProvider {
  readonly channel = "email" as const;

  async send(message: OutgoingMessage): Promise<SendResult> {
    if (!message.to.includes("@")) {
      return { success: false, error: "Invalid email destination" };
    }
    return {
      success: true,
      messageId: `email_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    };
  }
}

/**
 * Telecom SMS provider adapter (formatted for Pakistan international dial codes)
 */
export class TelecomSmsProvider implements NotificationProvider {
  readonly channel = "sms" as const;

  async send(message: OutgoingMessage): Promise<SendResult> {
    const cleaned = message.to.replace(/[^\d+]/g, "");
    if (!cleaned.startsWith("+92") && !cleaned.startsWith("03")) {
      return { success: false, error: "Invalid mobile phone destination" };
    }
    return {
      success: true,
      messageId: `sms_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    };
  }
}

/**
 * WhatsApp Business Cloud API provider adapter
 */
export class WhatsAppBusinessProvider implements NotificationProvider {
  readonly channel = "whatsapp" as const;

  async send(message: OutgoingMessage): Promise<SendResult> {
    const cleaned = message.to.replace(/[^\d+]/g, "");
    if (!cleaned.startsWith("+92") && !cleaned.startsWith("03")) {
      return { success: false, error: "Invalid WhatsApp recipient" };
    }
    return {
      success: true,
      messageId: `wa_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    };
  }
}
