import { hash, verify } from "@node-rs/argon2";
import crypto from "node:crypto";
import * as OTPAuth from "otpauth";
import { getEnv } from "../config/env";

// Minimum length 12 as required by OWASP ASVS Level 2
export const MIN_PASSWORD_LENGTH = 12;

export async function hashPassword(password: string): Promise<string> {
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
    );
  }
  // Argon2id with OWASP recommended parameters
  return hash(password, {
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });
}

export async function verifyPassword(
  password: string,
  passwordHash: string,
): Promise<boolean> {
  try {
    return await verify(passwordHash, password);
  } catch {
    return false;
  }
}

// Breached password check using HaveIBeenPwned k-anonymity API
export async function isPasswordBreached(password: string): Promise<boolean> {
  const sha1 = crypto
    .createHash("sha1")
    .update(password)
    .digest("hex")
    .toUpperCase();
  const prefix = sha1.slice(0, 5);
  const suffix = sha1.slice(5);

  try {
    const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: { "User-Agent": "Furrowmark-Security-Check" },
    });
    if (!res.ok) {
      return false; // Fail open gracefully if external API is unreachable
    }
    const text = await res.text();
    const lines = text.split("\n");
    for (const line of lines) {
      const [hashSuffix] = line.split(":");
      if (hashSuffix && hashSuffix.trim() === suffix) {
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}

// AES-256-GCM field encryption for sensitive data (MFA secrets, etc.)
export function encryptField(plainText: string): string {
  const env = getEnv();
  const key = Buffer.from(env.FIELD_ENCRYPTION_KEY.slice(0, 64), "hex");
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  let enc = cipher.update(plainText, "utf8", "hex");
  enc += cipher.final("hex");
  const tag = cipher.getAuthTag().toString("hex");
  return `${iv.toString("hex")}:${tag}:${enc}`;
}

export function decryptField(cipherText: string): string {
  const env = getEnv();
  const key = Buffer.from(env.FIELD_ENCRYPTION_KEY.slice(0, 64), "hex");
  const [ivHex, tagHex, dataHex] = cipherText.split(":");
  if (!ivHex || !tagHex || !dataHex) {
    throw new Error("Malformed cipher text.");
  }
  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  let dec = decipher.update(dataHex, "hex", "utf8");
  dec += decipher.final("utf8");
  return dec;
}

// TOTP implementation using standard RFC 6238
export function generateTotpSecret(userEmail: string): {
  secret: string;
  uri: string;
} {
  const totp = new OTPAuth.TOTP({
    issuer: "Furrowmark",
    label: userEmail,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: new OTPAuth.Secret({ size: 20 }),
  });
  return {
    secret: totp.secret.base32,
    uri: totp.toString(),
  };
}

export function verifyTotpToken(secretBase32: string, token: string): boolean {
  const totp = new OTPAuth.TOTP({
    issuer: "Furrowmark",
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secretBase32),
  });
  const delta = totp.validate({ token, window: 1 });
  return delta !== null;
}
