import { eq, and, sql, or } from "drizzle-orm";
import { getRuntimeDb } from "../database";
import { products, variants, batches, categories } from "../catalog/schema";
import { orders } from "../commerce/schema";
import { supportTickets } from "./schema";
import crypto from "node:crypto";

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export const CHATBOT_TOOLS: ToolDefinition[] = [
  {
    name: "search_catalog",
    description:
      "Search agricultural products by keyword (pesticides, seeds, fertilisers)",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search keyword e.g. wheat seed, delta pesticide",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "get_product_details",
    description:
      "Get detailed regulatory, safety, and pack information for a product",
    parameters: {
      type: "object",
      properties: {
        productId: { type: "string", description: "Product UUID" },
      },
      required: ["productId"],
    },
  },
  {
    name: "check_stock",
    description:
      "Check live warehouse availability and unexpired stock count for a variant",
    parameters: {
      type: "object",
      properties: {
        variantId: { type: "string", description: "Variant UUID" },
      },
      required: ["variantId"],
    },
  },
  {
    name: "get_order_status",
    description:
      "Check the status of an order. Requires proof of ownership (order number + phone or email).",
    parameters: {
      type: "object",
      properties: {
        orderRef: {
          type: "string",
          description: "Public order reference e.g. FM-2026-XXXX-XXXX",
        },
        identifier: {
          type: "string",
          description:
            "Customer phone number or email address for ownership proof",
        },
      },
      required: ["orderRef", "identifier"],
    },
  },
  {
    name: "get_store_policies",
    description:
      "Retrieve return rules, payment account coordinates, and shipping policies",
    parameters: {
      type: "object",
      properties: {
        topic: {
          type: "string",
          enum: ["returns", "payments", "shipping"],
          description: "Policy topic to inquire about",
        },
      },
      required: ["topic"],
    },
  },
  {
    name: "create_support_ticket",
    description:
      "Escalate an issue to human warehouse / customer service staff",
    parameters: {
      type: "object",
      properties: {
        customerName: { type: "string", description: "Customer full name" },
        customerPhone: { type: "string", description: "Contact phone number" },
        customerEmail: { type: "string", description: "Contact email address" },
        subject: { type: "string", description: "Ticket subject summary" },
        message: { type: "string", description: "Detailed customer request" },
      },
      required: ["customerName", "customerPhone", "subject", "message"],
    },
  },
];

export class ChatbotTools {
  static async searchCatalog(query: string) {
    const db = getRuntimeDb();
    const cleanQuery = `%${query.trim().toLowerCase()}%`;

    const results = await db
      .select({
        id: products.id,
        name: products.name,
        class: products.class,
        description: products.description,
        category: categories.name,
      })
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .where(
        and(
          eq(products.status, "published"),
          or(
            sql`lower(${products.name}) LIKE ${cleanQuery}`,
            sql`lower(${products.description}) LIKE ${cleanQuery}`,
          ),
        ),
      )
      .limit(5);

    return results;
  }

  static async getProductDetails(productId: string) {
    const db = getRuntimeDb();
    const [prod] = await db
      .select()
      .from(products)
      .where(and(eq(products.id, productId), eq(products.status, "published")));

    if (!prod) return { error: "Product not found or not published" };

    const vars = await db
      .select()
      .from(variants)
      .where(
        and(eq(variants.productId, productId), eq(variants.isActive, true)),
      );

    return {
      id: prod.id,
      name: prod.name,
      class: prod.class,
      description: prod.description,
      countryOfOrigin: prod.countryOfOrigin,
      variants: vars.map((v) => ({
        id: v.id,
        sku: v.sku,
        packSize: v.packSize,
        pricePKR: (v.priceMinor / 100).toFixed(2),
      })),
    };
  }

  static async checkStock(variantId: string) {
    const db = getRuntimeDb();
    const now = new Date();

    const activeBatches = await db
      .select({
        onHand: batches.onHand,
        reserved: batches.reserved,
        quarantined: batches.quarantined,
        expiresOn: batches.expiresOn,
      })
      .from(batches)
      .where(
        and(
          eq(batches.variantId, variantId),
          eq(batches.status, "available"),
          sql`${batches.expiresOn} > ${now}`,
        ),
      );

    const availableUnits = activeBatches.reduce(
      (acc, b) => acc + (b.onHand - b.reserved - b.quarantined),
      0,
    );

    return {
      variantId,
      inStock: availableUnits > 0,
      availableUnits,
    };
  }

  static async getOrderStatus(orderRef: string, identifier: string) {
    const db = getRuntimeDb();
    const cleanId = identifier.trim().toLowerCase();

    // Enforce proof of ownership: orderRef + phone OR email
    const [order] = await db
      .select({
        publicRef: orders.publicRef,
        state: orders.state,
        totalMinor: orders.totalMinor,
        paymentMethod: orders.paymentMethod,
        createdAt: orders.createdAt,
        customerEmail: orders.customerEmail,
        customerPhone: orders.customerPhone,
      })
      .from(orders)
      .where(eq(orders.publicRef, orderRef.trim()));

    if (!order) {
      return { error: "Order reference not found" };
    }

    const matchesEmail = order.customerEmail.toLowerCase() === cleanId;
    const matchesPhone =
      order.customerPhone.replace(/\D/g, "") === cleanId.replace(/\D/g, "");

    if (!matchesEmail && !matchesPhone) {
      return {
        error:
          "Verification failed: email or phone does not match order record",
      };
    }

    return {
      orderRef: order.publicRef,
      status: order.state,
      totalPKR: (order.totalMinor / 100).toFixed(2),
      paymentMethod: order.paymentMethod,
      orderDate: order.createdAt.toISOString().split("T")[0],
    };
  }

  static getReturnsPolicy(): { policy: string; rules: string[] } {
    return {
      policy: "Returns Policy",
      rules: [
        "Sealed, undamaged goods are returnable within 7 days of delivery.",
        "Opened chemical or pesticide containers are STRICTLY NON-RETURNABLE per national safety regulations.",
        "Approved returns can be compensated via Store Credit or Bank Refund.",
      ],
    };
  }

  static getPaymentsPolicy(): { policy: string; methods: string[] } {
    return {
      policy: "Accepted Payment Methods",
      methods: [
        "1. Verified Advance Bank Transfer (IBFT via 1Link): Receiving bank details are displayed securely on your order confirmation screen upon checkout.",
        "2. Easypaisa Mobile Wallet: Instructions provided on your post-checkout order summary.",
        "3. Cash on Delivery (COD): Available across Pakistan for eligible orders up to Rs. 25,000 (under 10 kg).",
        "Official bank receiving coordinates are presented securely after order placement to protect buyers from fraud.",
      ],
    };
  }

  static getShippingPolicy(): { policy: string; rules: string[] } {
    return {
      policy: "Shipping & Delivery Policy",
      rules: [
        "Hazardous agrochemicals are shipped in separate safety-compliant transport parcels.",
        "Standard delivery time across Pakistan is 2-4 business days.",
        "Tracking details are shared via SMS and email upon courier dispatch.",
      ],
    };
  }

  static getStorePolicies(topic: "returns" | "payments" | "shipping") {
    switch (topic) {
      case "returns":
        return this.getReturnsPolicy();
      case "payments":
        return this.getPaymentsPolicy();
      case "shipping":
        return this.getShippingPolicy();
    }
  }

  static async createSupportTicket(params: {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    subject: string;
    message: string;
    conversationId?: string;
  }) {
    const db = getRuntimeDb();
    const hex = crypto.randomBytes(3).toString("hex").toUpperCase();
    const ticketNumber = `TICK-${new Date().getFullYear()}-${hex}`;

    const [ticket] = await db
      .insert(supportTickets)
      .values({
        ticketNumber,
        conversationId: params.conversationId ?? null,
        customerName: params.customerName,
        customerPhone: params.customerPhone,
        customerEmail: params.customerEmail ?? null,
        subject: params.subject,
        message: params.message,
        status: "open",
      })
      .returning();

    return {
      ticketNumber: ticket!.ticketNumber,
      status: ticket!.status,
      message:
        "Support ticket created. Our team will contact you within business hours.",
    };
  }
}
