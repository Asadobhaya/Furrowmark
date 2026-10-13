import { NextResponse } from "next/server";
import { CheckoutInputSchema, placeOrder } from "@/modules/orders/checkout";
import { getCustomerSession, getClientMeta } from "@/modules/web/session";
import { checkRateLimit } from "@/modules/auth/ratelimit";

/**
 * POST /api/orders - create an order from the signed-in customer's cart.
 * Body: { shipping: {...}, phone, method: "advance_payment" | "cash_on_delivery", transactionReference? }
 */
export async function POST(request: Request) {
  // CSRF defence in depth (cookies are also SameSite=Lax): require same-origin.
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== request.headers.get("host")) {
    return NextResponse.json(
      { error: "Cross-origin request rejected" },
      { status: 403 },
    );
  }

  const session = await getCustomerSession();
  if (!session) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );
  }

  const meta = await getClientMeta();
  const rateLimitKey = `order_create:${session.userId}:${meta.ip}`;
  const rateCheck = await checkRateLimit({
    key: rateLimitKey,
    maxAttempts: 10,
    windowSeconds: 60,
  });
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: "Too many order requests. Please wait a moment." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = CheckoutInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 422 },
    );
  }

  try {
    const order = await placeOrder(session.userId, parsed.data);
    return NextResponse.json(order, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Could not create order" },
      { status: 409 },
    );
  }
}
