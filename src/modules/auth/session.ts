import crypto from "node:crypto";
import { eq, and, gt, isNull } from "drizzle-orm";
import { getDb } from "../database";
import { sessions, users, type userRoleEnum } from "../database/schema";

export const CUSTOMER_COOKIE = "__Host-sid";
export const STAFF_COOKIE = "__Host-asid";

// Idle timeout: 2 hours. Absolute timeout: 14 days for customer, 12 hours for staff.
const IDLE_TIMEOUT_MS = 2 * 60 * 60 * 1000;
const CUSTOMER_ABSOLUTE_TIMEOUT_MS = 14 * 24 * 60 * 60 * 1000;
const STAFF_ABSOLUTE_TIMEOUT_MS = 12 * 60 * 60 * 1000;

export interface SessionData {
  sessionId: string;
  userId: string;
  role: (typeof userRoleEnum.enumValues)[number];
  kind: "customer" | "staff";
}

function hashSessionToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function createSession(
  userId: string,
  kind: "customer" | "staff",
): Promise<{ rawToken: string; cookieName: string }> {
  const db = getDb();
  const rawToken = crypto.randomBytes(32).toString("hex");
  const idHash = hashSessionToken(rawToken);

  const now = new Date();
  const absoluteExpiry = new Date(
    now.getTime() +
      (kind === "staff"
        ? STAFF_ABSOLUTE_TIMEOUT_MS
        : CUSTOMER_ABSOLUTE_TIMEOUT_MS),
  );

  await db.insert(sessions).values({
    idHash,
    userId,
    kind,
    createdAt: now,
    lastSeenAt: now,
    absoluteExpiresAt: absoluteExpiry,
    revokedAt: null,
  });

  return {
    rawToken,
    cookieName: kind === "staff" ? STAFF_COOKIE : CUSTOMER_COOKIE,
  };
}

export async function validateSession(
  rawToken: string,
  expectedKind: "customer" | "staff",
): Promise<SessionData | null> {
  const db = getDb();
  const idHash = hashSessionToken(rawToken);
  const now = new Date();

  const found = await db
    .select({
      idHash: sessions.idHash,
      userId: sessions.userId,
      kind: sessions.kind,
      lastSeenAt: sessions.lastSeenAt,
      absoluteExpiresAt: sessions.absoluteExpiresAt,
      revokedAt: sessions.revokedAt,
      userRole: users.role,
      userStatus: users.status,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(
      and(
        eq(sessions.idHash, idHash),
        eq(sessions.kind, expectedKind),
        isNull(sessions.revokedAt),
        gt(sessions.absoluteExpiresAt, now),
        eq(users.status, "active"),
      ),
    );

  const session = found[0];
  if (!session) {
    return null;
  }

  // Check idle timeout
  const idleElapsed = now.getTime() - session.lastSeenAt.getTime();
  if (idleElapsed > IDLE_TIMEOUT_MS) {
    // Revoke idle expired session
    await db
      .update(sessions)
      .set({ revokedAt: now })
      .where(eq(sessions.idHash, idHash));
    return null;
  }

  // Update last seen
  await db
    .update(sessions)
    .set({ lastSeenAt: now })
    .where(eq(sessions.idHash, idHash));

  return {
    sessionId: session.idHash,
    userId: session.userId,
    role: session.userRole,
    kind: session.kind,
  };
}

export async function revokeSession(rawToken: string): Promise<void> {
  const db = getDb();
  const idHash = hashSessionToken(rawToken);
  await db
    .update(sessions)
    .set({ revokedAt: new Date() })
    .where(eq(sessions.idHash, idHash));
}

export async function revokeAllUserSessions(userId: string): Promise<void> {
  const db = getDb();
  await db
    .update(sessions)
    .set({ revokedAt: new Date() })
    .where(eq(sessions.userId, userId));
}
