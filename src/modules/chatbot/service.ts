import { eq, sql } from "drizzle-orm";
import { getRuntimeDb } from "../database";
import { chatConversations, chatMessages, chatSpendDaily } from "./schema";
import { checkEmergencyInput, sanitizeChatText } from "./safety";
import { ChatbotTools } from "./tools";

export interface ChatMessageInput {
  role: "user" | "assistant" | "system" | "tool";
  content: string;
}

export interface ChatbotResponse {
  conversationId: string;
  response: string;
  isEmergency: boolean;
  toolExecuted?: string;
  budgetExceeded?: boolean;
}

export class ChatbotService {
  /**
   * Checks daily LLM budget against the hard limit.
   */
  static async checkDailyBudget(): Promise<boolean> {
    const db = getRuntimeDb();
    const today = new Date().toISOString().split("T")[0]!;

    const [spend] = await db
      .select()
      .from(chatSpendDaily)
      .where(eq(chatSpendDaily.date, today));

    if (!spend) return true;
    return spend.estimatedCostCents < spend.hardLimitCents;
  }

  /**
   * Increments daily token and spend accounting.
   */
  static async recordUsage(
    tokens: number,
    estimatedCents: number,
  ): Promise<void> {
    const db = getRuntimeDb();
    const today = new Date().toISOString().split("T")[0]!;

    await db
      .insert(chatSpendDaily)
      .values({
        date: today,
        tokenCount: tokens,
        estimatedCostCents: estimatedCents,
        hardLimitCents: 500,
      })
      .onConflictDoUpdate({
        target: chatSpendDaily.date,
        set: {
          tokenCount: sql`${chatSpendDaily.tokenCount} + ${tokens}`,
          estimatedCostCents: sql`${chatSpendDaily.estimatedCostCents} + ${estimatedCents}`,
          updatedAt: new Date(),
        },
      });
  }

  /**
   * Main conversational turn processor.
   * Enforces emergency poison control, budget limits, proof-of-ownership,
   * tool execution, and message history persistence.
   */
  static async processMessage(params: {
    message: string;
    sessionTokenHash: string;
    conversationId?: string;
    userId?: string;
  }): Promise<ChatbotResponse> {
    const db = getRuntimeDb();
    const cleanUserText = sanitizeChatText(params.message);

    // 1. Immediate Safety & Poison Control check
    const emergencyCheck = checkEmergencyInput(cleanUserText);
    if (emergencyCheck.isEmergency) {
      return {
        conversationId: params.conversationId ?? "emergency",
        response: emergencyCheck.message!,
        isEmergency: true,
      };
    }

    // 2. Budget verification
    const budgetOk = await this.checkDailyBudget();
    if (!budgetOk) {
      return {
        conversationId: params.conversationId ?? "over_budget",
        response:
          "Our automated assistance is temporarily paused due to daily system volume limits. Please contact support directly or use our customer support ticket form.",
        isEmergency: false,
        budgetExceeded: true,
      };
    }

    // 3. Conversation session persistence
    let convId = params.conversationId;
    if (!convId) {
      const [conv] = await db
        .insert(chatConversations)
        .values({
          sessionTokenHash: params.sessionTokenHash,
          userId: params.userId ?? null,
          status: "active",
        })
        .returning();
      convId = conv!.id;
    }

    // Save user message
    await db.insert(chatMessages).values({
      conversationId: convId,
      role: "user",
      content: cleanUserText,
    });

    // 4. Intent & Tool Router (Simulated / Deterministic Tool Loop)
    let botReply: string;
    let toolExecuted: string | undefined;

    const lower = cleanUserText.toLowerCase();

    if (
      lower.includes("mix") ||
      lower.includes("tank mix") ||
      lower.includes("compatibility") ||
      lower.includes("mixing")
    ) {
      botReply =
        "Tank-Mixing Safety Directive:\nAlways consult the official manufacturer label before tank-mixing two agricultural chemicals. Perform a jar test (mix small proportional amounts in a clean glass jar) to verify physical stability. Never mix organophosphates with alkaline sprays or copper fungicides. Observe the stricter pre-harvest interval (PHI) between products. If unsure, file an advisory ticket at /contact or consult our agronomist.";
      toolExecuted = "agronomic_safety_check";
    } else if (
      lower.includes("dosage") ||
      lower.includes("dose") ||
      lower.includes("rate") ||
      lower.includes("per acre")
    ) {
      botReply =
        "Agronomic Dosage Directive:\nDosage must strictly follow Department of Plant Protection (DPP) label specifications:\n- Coragen 20 SC: 50 mL in 100-120 L water per acre for bollworms/armyworms.\n- Virtako 0.6% GR: 4 kg per acre broadcast in standing paddy water.\n- Bayer Nativo 75 WG: 65 g in 100 L water per acre for blast/rust.\n- Engro DAP: 50-75 kg/acre basal application.\n- Sona Urea: 50-100 kg/acre split vegetative dressing.\nNever exceed registered rates and always wear protective gloves and mask.";
      toolExecuted = "agronomic_dosage_lookup";
    } else if (
      lower.includes("policy") ||
      lower.includes("return") ||
      lower.includes("refund")
    ) {
      const policies = ChatbotTools.getReturnsPolicy();
      botReply = `Returns Policy Summary:\n- ${policies.rules.join("\n- ")}`;
      toolExecuted = "get_store_policies";
    } else if (
      lower.includes("payment") ||
      lower.includes("account") ||
      lower.includes("bank") ||
      lower.includes("easypaisa")
    ) {
      const paymentPolicy = ChatbotTools.getPaymentsPolicy();
      botReply = `Payment Accounts & Policy:\n${paymentPolicy.methods.join("\n")}`;
      toolExecuted = "get_store_policies";
    } else if (
      lower.includes("shipping") ||
      lower.includes("delivery") ||
      lower.includes("courier")
    ) {
      const shipPolicy = ChatbotTools.getShippingPolicy();
      botReply = `Shipping Information:\n- ${shipPolicy.rules.join("\n- ")}`;
      toolExecuted = "get_store_policies";
    } else if (lower.includes("order") && lower.includes("status")) {
      // Order status pattern: "order status FM-2026-XXXX-XXXX for 03001234567"
      const refMatch = cleanUserText.match(/FM-\d{4}-[A-Z0-9]{4}-[A-Z0-9]{4}/i);
      const phoneOrEmailMatch = cleanUserText.match(
        /\b(\d{11}|\+92\d{10}|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})\b/,
      );

      if (refMatch && phoneOrEmailMatch) {
        const orderData = await ChatbotTools.getOrderStatus(
          refMatch[0],
          phoneOrEmailMatch[0],
        );
        if ("error" in orderData) {
          botReply = `Could not verify order: ${orderData.error}`;
        } else {
          botReply = `Order ${orderData.orderRef} is currently: ${orderData.status.toUpperCase()}.\nTotal: Rs ${orderData.totalPKR} (${orderData.paymentMethod}). Placed on: ${orderData.orderDate}.`;
        }
        toolExecuted = "get_order_status";
      } else {
        botReply =
          "To check your order status, please provide both your Order Reference (e.g. FM-2026-XXXX-XXXX) and your verified phone number or email.";
      }
    } else if (
      lower.includes("search") ||
      lower.includes("pesticide") ||
      lower.includes("seed") ||
      lower.includes("fertiliser") ||
      lower.includes("wheat")
    ) {
      const term = cleanUserText
        .replace(/^(search|find|show me|look for)\s+/i, "")
        .trim();
      const results = await ChatbotTools.searchCatalog(term || "agro");
      if (results.length === 0) {
        botReply = `No products found matching '${term}'. You can browse all products at /products.`;
      } else {
        botReply = `Found products:\n${results.map((r) => `- ${r.name} (${r.class}): ${r.description.slice(0, 80)}...`).join("\n")}`;
      }
      toolExecuted = "search_catalog";
    } else if (
      lower.includes("human") ||
      lower.includes("agent") ||
      lower.includes("ticket") ||
      lower.includes("help me speak")
    ) {
      botReply =
        "I can connect you to our team. Please provide your name, phone number, and brief issue description so I can open a support ticket.";
    } else {
      botReply =
        "Welcome to Furrowmark Agricultural Support. I can help you search crops and products, check stock, verify order status, or explain our store policies (advance payments & COD). How can I help your farm today?";
    }

    // Save assistant reply
    await db.insert(chatMessages).values({
      conversationId: convId,
      role: "assistant",
      content: botReply,
    });

    // Record modest accounting usage (e.g. 150 tokens, 1 cent)
    await this.recordUsage(150, 1);

    return {
      conversationId: convId,
      response: botReply,
      isEmergency: false,
      toolExecuted,
    };
  }
}
