import { describe, it, expect } from "vitest";
import { checkRateLimit, recordAttempt, hashRateLimitKey } from "./ratelimit";

describe("Rate Limiting Service", () => {
  it("computes reproducible hash keys", () => {
    const k1 = hashRateLimitKey("User@Example.COM");
    const k2 = hashRateLimitKey("user@example.com");
    expect(k1).toBe(k2);
    expect(k1).toHaveLength(64);
  });

  it("allows requests when under attempt threshold", async () => {
    const testKey = `test_allowed_${Date.now()}`;
    const res = await checkRateLimit({
      key: testKey,
      maxAttempts: 3,
      windowSeconds: 60,
    });
    expect(res.allowed).toBe(true);
  });

  it("blocks requests when failure threshold is exceeded and reports retry window", async () => {
    const testKey = `test_blocked_${Date.now()}`;

    // Record failures up to threshold
    await recordAttempt({ key: testKey, outcome: "failure" });
    await recordAttempt({ key: testKey, outcome: "failure" });
    await recordAttempt({ key: testKey, outcome: "failure" });

    const check = await checkRateLimit({
      key: testKey,
      maxAttempts: 3,
      windowSeconds: 60,
    });
    expect(check.allowed).toBe(false);
    expect(check.retryAfterSeconds).toBeGreaterThan(0);
    expect(check.retryAfterSeconds).toBeLessThanOrEqual(60);
  });

  it("ignores successful attempts when calculating failure threshold", async () => {
    const testKey = `test_success_${Date.now()}`;

    await recordAttempt({ key: testKey, outcome: "success" });
    await recordAttempt({ key: testKey, outcome: "success" });
    await recordAttempt({ key: testKey, outcome: "success" });

    const check = await checkRateLimit({
      key: testKey,
      maxAttempts: 3,
      windowSeconds: 60,
    });
    expect(check.allowed).toBe(true);
  });
});
