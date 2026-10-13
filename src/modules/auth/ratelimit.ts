import crypto from "node:crypto";
import { and, eq, gt, sql } from "drizzle-orm";
import { getDb } from "../database";
import { loginAttempts } from "../database/schema";

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds?: number;
}

/**
 * Generates an obfuscated identifier key for rate limiting.
 */
export function hashRateLimitKey(identifier: string): string {
  return crypto
    .createHash("sha256")
    .update(`ratelimit:${identifier.trim().toLowerCase()}`)
    .digest("hex");
}

/**
 * Checks and records rate limit attempts using a sliding window.
 * Default for login: 5 failed attempts in 15 minutes (900 seconds).
 */
export async function checkRateLimit(params: {
  key: string;
  maxAttempts?: number;
  windowSeconds?: number;
}): Promise<RateLimitResult> {
  const db = getDb();
  const maxAttempts = params.maxAttempts ?? 5;
  const windowSeconds = params.windowSeconds ?? 15 * 60;
  const keyHash = hashRateLimitKey(params.key);
  const cutoff = new Date(Date.now() - windowSeconds * 1000);

  const [row] = await db
    .select({
      count: sql<number>`count(*)`,
      oldest: sql<Date | null>`min(${loginAttempts.at})`,
    })
    .from(loginAttempts)
    .where(
      and(
        eq(loginAttempts.keyHash, keyHash),
        eq(loginAttempts.outcome, "failure"),
        gt(loginAttempts.at, cutoff),
      ),
    );

  const failedCount = Number(row?.count ?? 0);
  if (failedCount >= maxAttempts) {
    const oldestTime = row?.oldest
      ? new Date(row.oldest).getTime()
      : Date.now();
    const elapsedSeconds = Math.floor((Date.now() - oldestTime) / 1000);
    const retryAfter = Math.max(1, windowSeconds - elapsedSeconds);
    return {
      allowed: false,
      retryAfterSeconds: retryAfter,
    };
  }

  return { allowed: true };
}

/**
 * Records an attempt outcome (success or failure) for a key.
 */
export async function recordAttempt(params: {
  key: string;
  outcome: "success" | "failure";
}): Promise<void> {
  const db = getDb();
  const keyHash = hashRateLimitKey(params.key);
  await db.insert(loginAttempts).values({
    keyHash,
    outcome: params.outcome,
  });
}
