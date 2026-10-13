"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/modules/database";
import { users } from "@/modules/database/schema";
import {
  hashPassword,
  verifyPassword,
  isPasswordBreached,
} from "@/modules/auth/crypto";
import { checkRateLimit, recordAttempt } from "@/modules/auth/ratelimit";
import {
  CUSTOMER_COOKIE,
  STAFF_COOKIE,
  createSession,
  revokeSession,
} from "@/modules/auth/session";
import { CartService } from "@/modules/cart/service";
import { OrderService } from "@/modules/orders/service";
import { CheckoutInputSchema, placeOrder } from "@/modules/orders/checkout";
import { PaymentService } from "@/modules/payments/service";
import { logAudit } from "@/modules/audit/service";
import {
  GUEST_COOKIE,
  clearCookie,
  getCartId,
  getClientMeta,
  getCustomerSession,
  getRawCookie,
  hashToken,
  requireStaffPermission,
  setCookie,
} from "@/modules/web/session";

function str(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v : "";
}

/** Only allow same-site relative redirects. */
function safeNext(next: string, fallback: string): string {
  return next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}

function fail(path: string, message: string, extra = ""): never {
  redirect(`${path}?error=${encodeURIComponent(message)}${extra}`);
}

// ---------- Cart ----------

const CartItemInputSchema = z.object({
  variantId: z.string().uuid("Invalid variant ID"),
  quantity: z.coerce.number().int().min(1).max(500),
});

const CartUpdateInputSchema = z.object({
  variantId: z.string().uuid("Invalid variant ID"),
  quantity: z.coerce.number().int().min(0).max(500),
});

export async function addToCartAction(formData: FormData) {
  const back = safeNext(str(formData, "back"), "/products");
  const parsed = CartItemInputSchema.safeParse({
    variantId: str(formData, "variantId"),
    quantity: str(formData, "quantity"),
  });
  if (!parsed.success) {
    fail(back, "Invalid product or quantity specified");
  }

  try {
    const cartId = await getCartId(true);
    await CartService.addItem({
      cartId: cartId!,
      variantId: parsed.data.variantId,
      quantity: parsed.data.quantity,
    });
  } catch (e) {
    fail(back, e instanceof Error ? e.message : "Could not add to cart");
  }
  redirect("/cart");
}

export async function updateCartAction(formData: FormData) {
  const parsed = CartUpdateInputSchema.safeParse({
    variantId: str(formData, "variantId"),
    quantity: str(formData, "quantity"),
  });
  if (!parsed.success) {
    fail("/cart", "Invalid product or quantity specified");
  }

  try {
    const cartId = await getCartId(true);
    if (parsed.data.quantity <= 0) {
      await CartService.removeItem(cartId!, parsed.data.variantId);
    } else {
      await CartService.updateItemQuantity({
        cartId: cartId!,
        variantId: parsed.data.variantId,
        quantity: parsed.data.quantity,
      });
    }
  } catch (e) {
    fail("/cart", e instanceof Error ? e.message : "Could not update cart");
  }
  redirect("/cart");
}

// ---------- Customer auth ----------

const CredentialsSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),
  password: z.string().min(1),
});

async function startCustomerSession(userId: string) {
  const { rawToken } = await createSession(userId, "customer");
  await setCookie(CUSTOMER_COOKIE, rawToken, 14 * 24 * 60 * 60);
  const guestToken = await getRawCookie(GUEST_COOKIE);
  if (guestToken) {
    await CartService.mergeGuestCart({
      guestTokenHash: hashToken(guestToken),
      userId,
    });
    await clearCookie(GUEST_COOKIE);
  }
}

export async function loginAction(formData: FormData) {
  const next = safeNext(str(formData, "next"), "/products");
  const parsed = CredentialsSchema.safeParse({
    email: str(formData, "email"),
    password: str(formData, "password"),
  });
  if (!parsed.success) fail("/login", "Enter a valid email and password");

  const meta = await getClientMeta();
  const limitKey = `cust:${parsed.data.email}:${meta.ip}`;
  const rateCheck = await checkRateLimit({
    key: limitKey,
    maxAttempts: 5,
    windowSeconds: 900,
  });
  if (!rateCheck.allowed) {
    await logAudit({
      action: "security.rate_limit_exceeded",
      entity: "auth_customer",
      entityId: parsed.data.email,
      ...meta,
    });
    fail(
      "/login",
      `Too many failed attempts. Please try again in ${Math.ceil((rateCheck.retryAfterSeconds ?? 900) / 60)} minutes.`,
    );
  }

  const [user] = await getDb()
    .select()
    .from(users)
    .where(eq(users.email, parsed.data.email));
  const ok =
    user &&
    user.role === "customer" &&
    user.status === "active" &&
    (await verifyPassword(parsed.data.password, user.passwordHash));

  if (!ok) {
    await recordAttempt({ key: limitKey, outcome: "failure" });
    await logAudit({
      action: "auth.login_failed",
      entity: "user",
      entityId: parsed.data.email,
      ...meta,
    });
    fail("/login", "Invalid email or password");
  }

  await recordAttempt({ key: limitKey, outcome: "success" });
  await logAudit({
    actorId: user!.id,
    action: "auth.login_success",
    entity: "user",
    entityId: user!.id,
    ...meta,
  });
  await startCustomerSession(user!.id);
  redirect(next);
}

export async function registerAction(formData: FormData) {
  const meta = await getClientMeta();

  // Rate limit: 5 account creations per 15 minutes per IP to prevent mass bot registration
  const registerLimitKey = `register:${meta.ip}`;
  const rateCheck = await checkRateLimit({
    key: registerLimitKey,
    maxAttempts: 5,
    windowSeconds: 900,
  });
  if (!rateCheck.allowed) {
    await logAudit({
      action: "security.rate_limit_exceeded",
      entity: "auth_register",
      ...meta,
    });
    fail(
      "/register",
      `Too many registration attempts from this network. Please try again in ${Math.ceil((rateCheck.retryAfterSeconds ?? 900) / 60)} minutes.`,
    );
  }

  const parsed = CredentialsSchema.safeParse({
    email: str(formData, "email"),
    password: str(formData, "password"),
  });
  if (!parsed.success) fail("/register", "Enter a valid email and password");

  // ASVS L2: Check for breached password
  const breached = await isPasswordBreached(parsed.data.password);
  if (breached) {
    await recordAttempt({ key: registerLimitKey, outcome: "failure" });
    fail(
      "/register",
      "This password has appeared in a known public data breach. Please choose a different, more secure password.",
    );
  }

  let userId: string;
  try {
    const passwordHash = await hashPassword(parsed.data.password);
    const [created] = await getDb()
      .insert(users)
      .values({ email: parsed.data.email, passwordHash, role: "customer" })
      .returning();
    userId = created!.id;
  } catch (e) {
    await recordAttempt({ key: registerLimitKey, outcome: "failure" });
    const msg = e instanceof Error ? e.message : "";
    fail(
      "/register",
      msg.startsWith("Password must")
        ? msg
        : "Could not create account (email may already be registered)",
    );
  }

  await recordAttempt({ key: registerLimitKey, outcome: "success" });
  await logAudit({
    actorId: userId,
    action: "auth.register_success",
    entity: "user",
    entityId: userId,
    ...meta,
  });
  await startCustomerSession(userId);
  redirect("/products");
}

export async function logoutAction() {
  const session = await getCustomerSession();
  const token = await getRawCookie(CUSTOMER_COOKIE);
  if (token) await revokeSession(token);
  await clearCookie(CUSTOMER_COOKIE);
  if (session) {
    const meta = await getClientMeta();
    await logAudit({
      actorId: session.userId,
      action: "auth.logout",
      entity: "user",
      entityId: session.userId,
      ...meta,
    });
  }
  redirect("/login");
}

// ---------- Checkout ----------

export async function submitOrderAction(formData: FormData) {
  const session = await getCustomerSession();
  if (!session) redirect("/login?next=/checkout");

  const parsed = CheckoutInputSchema.safeParse({
    shipping: {
      name: str(formData, "name"),
      address: str(formData, "address"),
      city: str(formData, "city"),
      province: str(formData, "province"),
      postalCode: str(formData, "postalCode"),
      country: str(formData, "country"),
    },
    phone: str(formData, "phone"),
    method: str(formData, "method"),
    transactionReference: str(formData, "transactionReference") || undefined,
  });
  if (!parsed.success) {
    fail(
      "/checkout",
      parsed.error.issues[0]?.message ?? "Invalid checkout details",
    );
  }

  let orderId: string;
  try {
    orderId = (await placeOrder(session.userId, parsed.data)).id;
  } catch (e) {
    fail("/checkout", e instanceof Error ? e.message : "Could not place order");
  }
  redirect(`/orders/${orderId}`);
}

// ---------- Staff ----------

export async function staffLoginAction(formData: FormData) {
  const parsed = CredentialsSchema.safeParse({
    email: str(formData, "email"),
    password: str(formData, "password"),
  });
  if (!parsed.success) fail("/staff/login", "Enter a valid email and password");

  const meta = await getClientMeta();
  const limitKey = `staff:${parsed.data.email}:${meta.ip}`;
  const rateCheck = await checkRateLimit({
    key: limitKey,
    maxAttempts: 5,
    windowSeconds: 900,
  });
  if (!rateCheck.allowed) {
    await logAudit({
      action: "security.rate_limit_exceeded",
      entity: "auth_staff",
      entityId: parsed.data.email,
      ...meta,
    });
    fail(
      "/staff/login",
      `Too many failed attempts. Please try again in ${Math.ceil((rateCheck.retryAfterSeconds ?? 900) / 60)} minutes.`,
    );
  }

  const [user] = await getDb()
    .select()
    .from(users)
    .where(eq(users.email, parsed.data.email));
  const ok =
    user &&
    user.role !== "customer" &&
    user.status === "active" &&
    (await verifyPassword(parsed.data.password, user.passwordHash));

  if (!ok) {
    await recordAttempt({ key: limitKey, outcome: "failure" });
    await logAudit({
      action: "auth.staff_login_failed",
      entity: "staff",
      entityId: parsed.data.email,
      ...meta,
    });
    fail("/staff/login", "Invalid credentials");
  }

  await recordAttempt({ key: limitKey, outcome: "success" });
  await logAudit({
    actorId: user!.id,
    action: "auth.staff_login_success",
    entity: "staff",
    entityId: user!.id,
    ...meta,
  });
  const { rawToken } = await createSession(user!.id, "staff");
  await setCookie(STAFF_COOKIE, rawToken, 12 * 60 * 60);
  redirect("/staff/orders");
}

export async function staffLogoutAction() {
  const token = await getRawCookie(STAFF_COOKIE);
  if (token) await revokeSession(token);
  await clearCookie(STAFF_COOKIE);
  redirect("/staff/login");
}

/** Staff confirm an advance payment arrived in the owner's account. */
export async function confirmPaymentAction(formData: FormData) {
  const staff = await requireStaffPermission("orders:process");
  if (!staff) redirect("/staff/login");

  const parsed = z
    .object({
      orderId: z.string().uuid("Invalid order ID"),
      transactionReference: z.string().trim().max(100).optional(),
    })
    .safeParse({
      orderId: str(formData, "orderId"),
      transactionReference: str(formData, "transactionReference") || undefined,
    });
  if (!parsed.success) {
    fail("/staff/orders", "Invalid payment confirmation details");
  }

  const { orderId, transactionReference } = parsed.data;
  try {
    const result = await PaymentService.confirmManualPayment({
      orderId,
      actorId: staff.userId,
      transactionReference: transactionReference || undefined,
    });
    const meta = await getClientMeta();
    await logAudit({
      actorId: staff.userId,
      action: "order.payment_confirmed",
      entity: "order",
      entityId: orderId,
      after: { outcome: result.outcome, transactionReference },
      ...meta,
    });
  } catch (e) {
    fail(
      "/staff/orders",
      e instanceof Error ? e.message : "Could not confirm payment",
    );
  }
  redirect("/staff/orders");
}

/** Staff accept a Cash-on-Delivery order for processing. */
export async function acceptCodOrderAction(formData: FormData) {
  const staff = await requireStaffPermission("orders:process");
  if (!staff) redirect("/staff/login");

  const parsed = OrderIdInputSchema.safeParse({
    orderId: str(formData, "orderId"),
  });
  if (!parsed.success) {
    fail("/staff/orders", "Invalid order ID");
  }

  const { orderId } = parsed.data;
  try {
    await OrderService.transitionOrderState({
      orderId,
      toState: "processing",
      actorType: "staff",
      actorId: staff.userId,
      reason: "COD order accepted by staff",
    });
    const meta = await getClientMeta();
    await logAudit({
      actorId: staff.userId,
      action: "order.cod_accepted",
      entity: "order",
      entityId: orderId,
      ...meta,
    });
  } catch (e) {
    fail(
      "/staff/orders",
      e instanceof Error ? e.message : "Could not accept order",
    );
  }
  redirect("/staff/orders");
}

// ---------- Phase 6: Fulfilment & RMA Actions ----------

const OrderIdInputSchema = z.object({
  orderId: z.string().uuid("Invalid order ID"),
});

const ShipmentIdInputSchema = z.object({
  shipmentId: z.string().uuid("Invalid shipment ID"),
});

const DispatchInputSchema = z.object({
  shipmentId: z.string().uuid("Invalid shipment ID"),
  carrierName: z.string().trim().min(1).max(50),
  trackingNumber: z.string().trim().min(1).max(100),
  trackingUrl: z.string().url().max(500).optional().or(z.literal("")),
});

const ReturnResolveInputSchema = z.object({
  returnRequestId: z.string().uuid("Invalid return request ID"),
  resolution: z.enum([
    "refund",
    "replacement",
    "store_credit",
    "closed_no_action",
  ]),
  restockable: z.boolean(),
  staffNotes: z.string().max(1000).default(""),
});

export async function createOrderShipmentsAction(formData: FormData) {
  const staff = await requireStaffPermission("orders:process");
  if (!staff) redirect("/staff/login");

  const parsed = OrderIdInputSchema.safeParse({
    orderId: str(formData, "orderId"),
  });
  if (!parsed.success) {
    fail("/staff/fulfilment", "Invalid order ID specified");
  }

  try {
    const { FulfilmentService } = await import("@/modules/fulfilment/service");
    await FulfilmentService.createOrderShipments(parsed.data.orderId);
  } catch (e) {
    fail(
      "/staff/fulfilment",
      e instanceof Error ? e.message : "Could not create shipments",
    );
  }
  redirect("/staff/fulfilment");
}

export async function packShipmentAction(formData: FormData) {
  const staff = await requireStaffPermission("orders:process");
  if (!staff) redirect("/staff/login");

  const parsed = ShipmentIdInputSchema.safeParse({
    shipmentId: str(formData, "shipmentId"),
  });
  if (!parsed.success) {
    fail("/staff/fulfilment", "Invalid shipment ID specified");
  }

  try {
    const { FulfilmentService } = await import("@/modules/fulfilment/service");
    await FulfilmentService.packShipment(parsed.data.shipmentId, staff.userId);
  } catch (e) {
    fail(
      "/staff/fulfilment",
      e instanceof Error ? e.message : "Could not pack shipment",
    );
  }
  redirect("/staff/fulfilment");
}

export async function dispatchShipmentAction(formData: FormData) {
  const staff = await requireStaffPermission("orders:process");
  if (!staff) redirect("/staff/login");

  const parsed = DispatchInputSchema.safeParse({
    shipmentId: str(formData, "shipmentId"),
    carrierName: str(formData, "carrierName") || "ManualDispatch",
    trackingNumber: str(formData, "trackingNumber"),
    trackingUrl: str(formData, "trackingUrl") || undefined,
  });
  if (!parsed.success) {
    fail("/staff/fulfilment", "Invalid tracking or shipment information");
  }

  try {
    const { FulfilmentService } = await import("@/modules/fulfilment/service");
    await FulfilmentService.dispatchShipment({
      shipmentId: parsed.data.shipmentId,
      carrierName: parsed.data.carrierName,
      trackingNumber: parsed.data.trackingNumber,
      trackingUrl: parsed.data.trackingUrl || undefined,
      actorId: staff.userId,
    });
  } catch (e) {
    fail(
      "/staff/fulfilment",
      e instanceof Error ? e.message : "Could not dispatch shipment",
    );
  }
  redirect("/staff/fulfilment");
}

export async function deliverShipmentAction(formData: FormData) {
  const staff = await requireStaffPermission("orders:process");
  if (!staff) redirect("/staff/login");

  const parsed = ShipmentIdInputSchema.safeParse({
    shipmentId: str(formData, "shipmentId"),
  });
  if (!parsed.success) {
    fail("/staff/fulfilment", "Invalid shipment ID specified");
  }

  try {
    const { FulfilmentService } = await import("@/modules/fulfilment/service");
    await FulfilmentService.deliverShipment(
      parsed.data.shipmentId,
      staff.userId,
    );
  } catch (e) {
    fail(
      "/staff/fulfilment",
      e instanceof Error ? e.message : "Could not mark delivered",
    );
  }
  redirect("/staff/fulfilment");
}

export async function resolveReturnAction(formData: FormData) {
  const staff = await requireStaffPermission("orders:process");
  if (!staff) redirect("/staff/login");

  const parsed = ReturnResolveInputSchema.safeParse({
    returnRequestId: str(formData, "returnRequestId"),
    resolution: str(formData, "resolution"),
    restockable: str(formData, "restockable") === "true",
    staffNotes: str(formData, "staffNotes"),
  });
  if (!parsed.success) {
    fail("/staff/returns", "Invalid return resolution data");
  }

  try {
    const { ReturnsService } = await import("@/modules/returns/service");
    await ReturnsService.inspectAndResolveReturn({
      returnRequestId: parsed.data.returnRequestId,
      staffId: staff.userId,
      resolution: parsed.data.resolution,
      staffNotes: parsed.data.staffNotes,
      inspectedItems: [
        {
          returnLineId: parsed.data.returnRequestId,
          restockable: parsed.data.restockable,
          inspectionNotes: parsed.data.staffNotes,
        },
      ],
    });
  } catch (e) {
    fail(
      "/staff/returns",
      e instanceof Error ? e.message : "Could not resolve return",
    );
  }
  redirect("/staff/returns");
}

// ---------- Staff Product Administration ----------

const CreateProductSchema = z.object({
  name: z.string().trim().min(2, "Product name must be at least 2 characters"),
  className: z.enum(["seed", "fertiliser", "nutrient", "pesticide", "tool"]),
  categoryName: z.string().trim().min(2, "Category name is required"),
  brandName: z.string().trim().min(2, "Brand name is required"),
  packSize: z.string().trim().min(1, "Pack size is required"),
  priceMinor: z.coerce.number().int().min(1, "Price must be at least 1 PKR"),
  description: z.string().trim().min(5, "Description must be at least 5 characters"),
  status: z.enum(["draft", "published"]).default("published"),
});

export async function createProductAction(formData: FormData) {
  const staff = await requireStaffPermission("catalog:write");
  if (!staff) redirect("/staff/login");

  const parsed = CreateProductSchema.safeParse({
    name: str(formData, "name"),
    className: str(formData, "className"),
    categoryName: str(formData, "categoryName"),
    brandName: str(formData, "brandName"),
    packSize: str(formData, "packSize"),
    priceMinor: str(formData, "priceMinor"),
    description: str(formData, "description"),
    status: str(formData, "status") || "published",
  });

  if (!parsed.success) {
    fail(
      "/staff/products",
      parsed.error.issues[0]?.message ?? "Invalid product details",
    );
  }

  try {
    const { createStaffProduct } = await import("@/modules/catalog/service");
    await createStaffProduct(parsed.data, staff.userId);
  } catch (e) {
    fail(
      "/staff/products",
      e instanceof Error ? e.message : "Could not create product",
    );
  }
  redirect("/staff/products");
}

export async function updateProductStatusAction(formData: FormData) {
  const staff = await requireStaffPermission("catalog:write");
  if (!staff) redirect("/staff/login");

  const productId = str(formData, "productId");
  const status = str(formData, "status") as "draft" | "published" | "archived";

  if (!productId || !status) {
    fail("/staff/products", "Missing product ID or status");
  }

  try {
    const { updateProductStatus } = await import("@/modules/catalog/service");
    await updateProductStatus(productId, status);
  } catch (e) {
    fail(
      "/staff/products",
      e instanceof Error ? e.message : "Could not update status",
    );
  }
  redirect("/staff/products");
}

export async function deleteProductAction(formData: FormData) {
  const staff = await requireStaffPermission("catalog:write");
  if (!staff) redirect("/staff/login");

  const productId = str(formData, "productId");
  if (!productId) {
    fail("/staff/products", "Missing product ID");
  }

  try {
    const { deleteStaffProduct } = await import("@/modules/catalog/service");
    const res = await deleteStaffProduct(productId);
    if (res.archived) {
      redirect(
        "/staff/products?error=" +
          encodeURIComponent("Item has order history and was archived instead of deleted."),
      );
    }
  } catch (e) {
    fail(
      "/staff/products",
      e instanceof Error ? e.message : "Could not delete product",
    );
  }
  redirect("/staff/products");
}

