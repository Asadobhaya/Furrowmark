import crypto from "node:crypto";
import { cookies, headers } from "next/headers";
import {
  CUSTOMER_COOKIE,
  STAFF_COOKIE,
  validateSession,
  type SessionData,
} from "../auth/session";
import { CartService } from "../cart/service";
import { hasPermission, type Permission } from "../rbac/permissions";

export const GUEST_COOKIE = "guest-cart";
const isProd = process.env.NODE_ENV === "production";

/** `__Host-` cookies require Secure, which plain-http dev servers cannot set. */
export function cookieName(base: string): string {
  return isProd ? base : base.replace(/^__Host-/, "");
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function setCookie(
  name: string,
  value: string,
  maxAgeSeconds: number,
): Promise<void> {
  const jar = await cookies();
  jar.set(cookieName(name), value, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeSeconds,
  });
}

export async function clearCookie(name: string): Promise<void> {
  const jar = await cookies();
  jar.delete(cookieName(name));
}

export async function getRawCookie(name: string): Promise<string | undefined> {
  const jar = await cookies();
  return jar.get(cookieName(name))?.value;
}

export async function getCustomerSession(): Promise<SessionData | null> {
  const token = await getRawCookie(CUSTOMER_COOKIE);
  return token ? validateSession(token, "customer") : null;
}

export async function getStaffSession(): Promise<SessionData | null> {
  const token = await getRawCookie(STAFF_COOKIE);
  if (!token) return null;
  const session = await validateSession(token, "staff");
  return session && session.role !== "customer" ? session : null;
}

export async function requireStaffPermission(
  permission: Permission,
): Promise<SessionData | null> {
  const session = await getStaffSession();
  return session && hasPermission(session.role, permission) ? session : null;
}

export async function getClientMeta(): Promise<{
  ip: string;
  userAgent: string;
}> {
  const h = await headers();
  return {
    ip: h.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown",
    userAgent: h.get("user-agent") ?? "",
  };
}

/**
 * Resolves the current cart id (customer cart, or guest cart by cookie token).
 * Cookies can only be created inside server actions / route handlers, so pass
 * `create: true` only from those.
 */
export async function getCartId(create: boolean): Promise<string | null> {
  const session = await getCustomerSession();
  if (session) {
    return (await CartService.getOrCreateCart({ userId: session.userId })).id;
  }
  let token = await getRawCookie(GUEST_COOKIE);
  if (!token) {
    if (!create) return null;
    token = crypto.randomBytes(32).toString("hex");
    await setCookie(GUEST_COOKIE, token, 30 * 24 * 60 * 60);
  }
  return (
    await CartService.getOrCreateCart({ guestTokenHash: hashToken(token) })
  ).id;
}
