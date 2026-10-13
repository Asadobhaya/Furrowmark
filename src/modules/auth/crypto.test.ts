import { describe, it, expect, vi, afterEach } from "vitest";
import * as OTPAuth from "otpauth";
import {
  hashPassword,
  verifyPassword,
  encryptField,
  decryptField,
  generateTotpSecret,
  verifyTotpToken,
  isPasswordBreached,
} from "./crypto";

describe("Auth Crypto and Security Primitives", () => {
  it("Rejects passwords shorter than MIN_PASSWORD_LENGTH (12)", async () => {
    await expect(hashPassword("Short123!")).rejects.toThrowError(
      /at least 12 characters/,
    );
  });

  it("Correctly hashes and verifies valid password with Argon2id", async () => {
    const pwd = "Correct-Horse-Battery-Staple-2026!";
    const hashed = await hashPassword(pwd);
    expect(hashed).toMatch(/^\$argon2id\$/);

    const isValid = await verifyPassword(pwd, hashed);
    expect(isValid).toBe(true);

    const isInvalid = await verifyPassword("WrongPassword12345!", hashed);
    expect(isInvalid).toBe(false);
  });

  it("Encrypts and decrypts sensitive field data using AES-256-GCM", () => {
    const plainText = "JBSWY3DPEHPK3PXP"; // Base32 test secret
    const encrypted = encryptField(plainText);
    expect(encrypted).toContain(":");

    const decrypted = decryptField(encrypted);
    expect(decrypted).toBe(plainText);
  });

  it("Throws error when decrypting malformed cipher text", () => {
    expect(() => decryptField("invalid-cipher-text")).toThrowError(
      /Malformed cipher text/,
    );
  });

  it("Generates and verifies valid TOTP tokens", () => {
    const { secret, uri } = generateTotpSecret("farmer@example.com");
    expect(secret.length).toBeGreaterThanOrEqual(16);
    expect(uri).toContain("otpauth://totp/Furrowmark:farmer%40example.com");

    // Generate valid token with OTPAuth
    const totp = new OTPAuth.TOTP({
      issuer: "Furrowmark",
      secret: OTPAuth.Secret.fromBase32(secret),
    });
    const token = totp.generate();

    const verified = verifyTotpToken(secret, token);
    expect(verified).toBe(true);

    const invalidVerified = verifyTotpToken(secret, "000000");
    if (token !== "000000") {
      expect(invalidVerified).toBe(false);
    }
  });

  describe("isPasswordBreached (k-anonymity check)", () => {
    const originalFetch = globalThis.fetch;

    afterEach(() => {
      globalThis.fetch = originalFetch;
    });

    it("Identifies breached password when suffix is returned by HIBP API", async () => {
      // password: "Password1234!"
      // sha1: 37804F97BD9984F61610A4D11B1D1FF312D8E15D
      // prefix: 37804, suffix: F97BD9984F61610A4D11B1D1FF312D8E15D
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        text: async () => "F97BD9984F61610A4D11B1D1FF312D8E15D:42\nOTHERHASH:1",
      } as Response);

      const breached = await isPasswordBreached("Password1234!");
      expect(breached).toBe(true);
    });

    it("Returns false when password suffix is not in breached response", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        text: async () => "DIFFERENTSUFFIX12345:10",
      } as Response);

      const breached = await isPasswordBreached(
        "SuperUniquePasswordThatWasNeverLeaked2026!",
      );
      expect(breached).toBe(false);
    });

    it("Fails open (returns false) if HIBP API responds with error or network fails", async () => {
      globalThis.fetch = vi.fn().mockRejectedValue(new Error("Network error"));
      const breached = await isPasswordBreached("AnyPassword!");
      expect(breached).toBe(false);
    });
  });
});
