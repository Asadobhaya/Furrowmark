import { describe, it, expect, beforeAll } from "vitest";
import { getDb } from "../database";
import { users } from "../database/schema";
import { hashPassword } from "./crypto";
import { TokenService, hashAuthToken } from "./tokens";

describe("TokenService", () => {
  let testUserId: string;

  beforeAll(async () => {
    const db = getDb();
    const passwordHash = await hashPassword("ValidPassword123#Secure");
    const [user] = await db
      .insert(users)
      .values({
        email: `token_test_${Date.now()}@example.com`,
        passwordHash,
        role: "customer",
        status: "active",
      })
      .returning();
    testUserId = user!.id;
  });

  it("issues high-entropy token and securely stores only hash", async () => {
    const issued = await TokenService.issueToken({
      userId: testUserId,
      purpose: "password_reset",
    });

    expect(issued.rawToken).toHaveLength(64); // 32 bytes hex
    expect(issued.purpose).toBe("password_reset");
    expect(issued.expiresAt.getTime()).toBeGreaterThan(Date.now());

    // Validates successfully
    const validated = await TokenService.validateToken({
      rawToken: issued.rawToken,
      expectedPurpose: "password_reset",
    });

    expect(validated).not.toBeNull();
    expect(validated?.userId).toBe(testUserId);
  });

  it("rejects token when expected purpose does not match", async () => {
    const issued = await TokenService.issueToken({
      userId: testUserId,
      purpose: "password_reset",
    });

    const validated = await TokenService.validateToken({
      rawToken: issued.rawToken,
      expectedPurpose: "email_verification",
    });

    expect(validated).toBeNull();
  });

  it("atomically consumes token and prevents reuse", async () => {
    const issued = await TokenService.issueToken({
      userId: testUserId,
      purpose: "email_verification",
    });

    const firstConsume = await TokenService.consumeToken({
      rawToken: issued.rawToken,
      expectedPurpose: "email_verification",
    });
    expect(firstConsume).not.toBeNull();
    expect(firstConsume?.userId).toBe(testUserId);

    // Second consumption must fail (single-use enforced)
    const secondConsume = await TokenService.consumeToken({
      rawToken: issued.rawToken,
      expectedPurpose: "email_verification",
    });
    expect(secondConsume).toBeNull();
  });

  it("rejects expired tokens", async () => {
    const issued = await TokenService.issueToken({
      userId: testUserId,
      purpose: "password_reset",
      customTtlSeconds: -10, // already expired
    });

    const validated = await TokenService.validateToken({
      rawToken: issued.rawToken,
      expectedPurpose: "password_reset",
    });
    expect(validated).toBeNull();

    const consumed = await TokenService.consumeToken({
      rawToken: issued.rawToken,
      expectedPurpose: "password_reset",
    });
    expect(consumed).toBeNull();
  });

  it("hashing function produces 64-char sha256 output", () => {
    const h = hashAuthToken("sample_secret_token");
    expect(h).toHaveLength(64);
    expect(h).toBe(hashAuthToken("sample_secret_token"));
  });
});
