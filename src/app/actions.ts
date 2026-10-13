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

export async function addToCartAction(formData: FormData) {
  const variantId = str(formData, "variantId");
  const quantity = Number.parseInt(str(formData, "quantity"), 10);
  const back = safeNext(str(formData, "back"), "/products");
  try {
    const cartId = await getCartId(true);
    await CartService.addItem({ cartId: cartId!, variantId, quantity });
  } catch (e) {
    fail(back, e instanceof Error ? e.message : "Could not add to cart");
  }
  redirect("/cart");
}

export async function updateCartAction(formData: FormData) {
  const variantId = str(formData, "variantId");
  const quantity = Number.parseInt(str(formData, "quantity"), 10);
  try {
    const cartId = await getCartId(true);
    if (Number.isNaN(quantity) || quantity <= 0) {
      await CartService.removeItem(cartId!, variantId);
    } else {
      await CartService.updateItemQuantity({
        cartId: cartId!,
        variantId,
        quantity,
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
    fail("/login", "Invalid email or password");
  }

  await recordAttempt({ key: limitKey, outcome: "success" });
  await startCustomerSession(user!.id);
  redirect(next);
}

export async function registerAction(formData: FormData) {
  const parsed = CredentialsSchema.safeParse({
    email: str(formData, "email"),
    password: str(formData, "password"),
  });
  if (!parsed.success) fail("/register", "Enter a valid email and password");

  // ASVS L2: Check for breached password
  const breached = await isPasswordBreached(parsed.data.password);
  if (breached) {
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
    const msg = e instanceof Error ? e.message : "";
    fail(
      "/register",
      msg.startsWith("Password must")
        ? msg
        : "Could not create account (email may already be registered)",
    );
  }
  await startCustomerSession(userId);
  redirect("/products");
}

export async function logoutAction() {
  const token = await getRawCookie(CUSTOMER_COOKIE);
  if (token) await revokeSession(token);
  await clearCookie(CUSTOMER_COOKIE);
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
    fail("/staff/login", "Invalid credentials");
  }

  await recordAttempt({ key: limitKey, outcome: "success" });
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

  const orderId = str(formData, "orderId");
  const transactionReference = str(formData, "transactionReference").trim();
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

  const orderId = str(formData, "orderId");
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

export async function createOrderShipmentsAction(formData: FormData) {
  const staff = await requireStaffPermission("orders:process");
  if (!staff) redirect("/staff/login");
  const orderId = str(formData, "orderId");
  try {
    const { FulfilmentService } = await import("@/modules/fulfilment/service");
    await FulfilmentService.createOrderShipments(orderId);
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
  const shipmentId = str(formData, "shipmentId");
  try {
    const { FulfilmentService } = await import("@/modules/fulfilment/service");
    await FulfilmentService.packShipment(shipmentId, staff.userId);
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
  const shipmentId = str(formData, "shipmentId");
  const carrierName = str(formData, "carrierName") || "ManualDispatch";
  const trackingNumber = str(formData, "trackingNumber");
  const trackingUrl = str(formData, "trackingUrl") || undefined;
  if (!trackingNumber) {
    fail("/staff/fulfilment", "Tracking number is required");
  }
  try {
    const { FulfilmentService } = await import("@/modules/fulfilment/service");
    await FulfilmentService.dispatchShipment({
      shipmentId,
      carrierName,
      trackingNumber,
      trackingUrl,
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
  const shipmentId = str(formData, "shipmentId");
  try {
    const { FulfilmentService } = await import("@/modules/fulfilment/service");
    await FulfilmentService.deliverShipment(shipmentId, staff.userId);
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
  const returnRequestId = str(formData, "returnRequestId");
  const resolution = str(formData, "resolution") as
    "refund" | "replacement" | "store_credit" | "closed_no_action";
  const restockable = str(formData, "restockable") === "true";
  const staffNotes = str(formData, "staffNotes");

  try {
    const { ReturnsService } = await import("@/modules/returns/service");
    await ReturnsService.inspectAndResolveReturn({
      returnRequestId,
      staffId: staff.userId,
      resolution,
      staffNotes,
      inspectedItems: [
        {
          returnLineId: returnRequestId,
          restockable,
          inspectionNotes: staffNotes,
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
