import crypto from "node:crypto";
import { and, eq, gt, isNull } from "drizzle-orm";
import { getDb } from "../database";
import { authTokens, users, type tokenPurposeEnum } from "../database/schema";

export type TokenPurpose = (typeof tokenPurposeEnum.enumValues)[number];

// Password reset: 15 minutes. Email verification: 24 hours. Staff bootstrap: 1 hour.
export const TOKEN_EXPIRATION_SECONDS: Record<TokenPurpose, number> = {
  password_reset: 15 * 60,
  email_verification: 24 * 60 * 60,
  staff_bootstrap: 60 * 60,
};

export interface IssuedToken {
  rawToken: string;
  expiresAt: Date;
  purpose: TokenPurpose;
}

export interface ValidatedToken {
  id: string;
  userId: string;
  purpose: TokenPurpose;
}

export function hashAuthToken(token: string): string {
  return crypto.createHash("sha256").update(token.trim()).digest("hex");
}

export class TokenService {
  /**
   * Issues a high-entropy, cryptographically secure token.
   * Only the SHA-256 digest is stored in the database.
   */
  static async issueToken(params: {
    userId: string;
    purpose: TokenPurpose;
    customTtlSeconds?: number;
  }): Promise<IssuedToken> {
    const db = getDb();
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashAuthToken(rawToken);

    const ttl =
      params.customTtlSeconds ?? TOKEN_EXPIRATION_SECONDS[params.purpose];
    const expiresAt = new Date(Date.now() + ttl * 1000);

    // Invalidate any existing unused tokens of the same purpose for this user
    await db
      .update(authTokens)
      .set({ usedAt: new Date() })
      .where(
        and(
          eq(authTokens.userId, params.userId),
          eq(authTokens.purpose, params.purpose),
          isNull(authTokens.usedAt),
        ),
      );

    await db.insert(authTokens).values({
      tokenHash,
      purpose: params.purpose,
      userId: params.userId,
      expiresAt,
      usedAt: null,
    });

    return {
      rawToken,
      expiresAt,
      purpose: params.purpose,
    };
  }

  /**
   * Validates a token without consuming it.
   */
  static async validateToken(params: {
    rawToken: string;
    expectedPurpose: TokenPurpose;
  }): Promise<ValidatedToken | null> {
    const db = getDb();
    const tokenHash = hashAuthToken(params.rawToken);
    const now = new Date();

    const [record] = await db
      .select({
        id: authTokens.id,
        userId: authTokens.userId,
        purpose: authTokens.purpose,
        userStatus: users.status,
      })
      .from(authTokens)
      .innerJoin(users, eq(authTokens.userId, users.id))
      .where(
        and(
          eq(authTokens.tokenHash, tokenHash),
          eq(authTokens.purpose, params.expectedPurpose),
          isNull(authTokens.usedAt),
          gt(authTokens.expiresAt, now),
          eq(users.status, "active"),
        ),
      );

    if (!record) {
      return null;
    }

    return {
      id: record.id,
      userId: record.userId,
      purpose: record.purpose,
    };
  }

  /**
   * Atomically verifies and consumes a single-use token.
   * Returns the token details if valid, or null if expired/used/invalid.
   */
  static async consumeToken(params: {
    rawToken: string;
    expectedPurpose: TokenPurpose;
  }): Promise<ValidatedToken | null> {
    const db = getDb();
    const tokenHash = hashAuthToken(params.rawToken);
    const now = new Date();

    return await db.transaction(async (tx) => {
      const [record] = await tx
        .select({
          id: authTokens.id,
          userId: authTokens.userId,
          purpose: authTokens.purpose,
          userStatus: users.status,
        })
        .from(authTokens)
        .innerJoin(users, eq(authTokens.userId, users.id))
        .where(
          and(
            eq(authTokens.tokenHash, tokenHash),
            eq(authTokens.purpose, params.expectedPurpose),
            isNull(authTokens.usedAt),
            gt(authTokens.expiresAt, now),
            eq(users.status, "active"),
          ),
        );

      if (!record) {
        return null;
      }

      await tx
        .update(authTokens)
        .set({ usedAt: now })
        .where(eq(authTokens.id, record.id));

      return {
        id: record.id,
        userId: record.userId,
        purpose: record.purpose,
      };
    });
  }
}
