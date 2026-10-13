import { describe, it, expect } from "vitest";
import { getEnv } from "./env";

describe("Production Environment Validation", () => {
  it("successfully validates current environment settings", () => {
    const env = getEnv();
    expect(env.STORE_NAME).toBe("Furrowmark");
    expect(env.STORE_CURRENCY).toBe("PKR");
    expect(env.STORE_TIME_ZONE).toBe("Asia/Karachi");
    expect(env.SESSION_SECRET.length).toBeGreaterThanOrEqual(32);
    expect(env.FIELD_ENCRYPTION_KEY.length).toBeGreaterThanOrEqual(32);
  });
});
