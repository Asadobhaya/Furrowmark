import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb, closePools } from "../database";
import { users, sessions } from "../database/schema";
import {
  createSession,
  validateSession,
  revokeSession,
  revokeAllUserSessions,
  CUSTOMER_COOKIE,
  STAFF_COOKIE,
} from "./session";
import { hashPassword } from "./crypto";
import { eq } from "drizzle-orm";

describe("Server Side Session Management Integration Tests", () => {
  let customerUserId: string;
  let staffUserId: string;

  beforeAll(async () => {
    const db = getDb();
    const pwHash = await hashPassword("SampleValidPassword123!");

    await db
      .delete(users)
      .where(eq(users.email, "test_customer@furrowmark.test"));
    await db.delete(users).where(eq(users.email, "test_staff@furrowmark.test"));

    const [cUser] = await db
      .insert(users)
      .values({
        email: "test_customer@furrowmark.test",
        passwordHash: pwHash,
        role: "customer",
      })
      .returning();
    customerUserId = cUser!.id;

    const [sUser] = await db
      .insert(users)
      .values({
        email: "test_staff@furrowmark.test",
        passwordHash: pwHash,
        role: "staff",
      })
      .returning();
    staffUserId = sUser!.id;
  });

  afterAll(async () => {
    const db = getDb();
    if (customerUserId)
      await db.delete(users).where(eq(users.id, customerUserId));
    if (staffUserId) await db.delete(users).where(eq(users.id, staffUserId));
    await closePools();
  });

  it("Creates customer session with __Host-sid cookie and validates successfully", async () => {
    const { rawToken, cookieName } = await createSession(
      customerUserId,
      "customer",
    );
    expect(cookieName).toBe(CUSTOMER_COOKIE);

    const session = await validateSession(rawToken, "customer");
    expect(session).not.toBeNull();
    expect(session?.userId).toBe(customerUserId);
    expect(session?.kind).toBe("customer");
  });

  it("Creates staff session with __Host-asid cookie and validates successfully", async () => {
    const { rawToken, cookieName } = await createSession(staffUserId, "staff");
    expect(cookieName).toBe(STAFF_COOKIE);

    const session = await validateSession(rawToken, "staff");
    expect(session).not.toBeNull();
    expect(session?.userId).toBe(staffUserId);
    expect(session?.kind).toBe("staff");
  });

  it("Rejects validation when cookie kind is mismatched (isolation between staff and customer)", async () => {
    const { rawToken } = await createSession(staffUserId, "staff");
    const session = await validateSession(rawToken, "customer");
    expect(session).toBeNull();
  });

  it("Revokes session immediately upon logout", async () => {
    const { rawToken } = await createSession(customerUserId, "customer");
    expect(await validateSession(rawToken, "customer")).not.toBeNull();

    await revokeSession(rawToken);
    expect(await validateSession(rawToken, "customer")).toBeNull();
  });

  it("Revokes all user sessions when requested (e.g. password reset / privilege change)", async () => {
    const s1 = await createSession(customerUserId, "customer");
    const s2 = await createSession(customerUserId, "customer");

    expect(await validateSession(s1.rawToken, "customer")).not.toBeNull();
    expect(await validateSession(s2.rawToken, "customer")).not.toBeNull();

    await revokeAllUserSessions(customerUserId);

    expect(await validateSession(s1.rawToken, "customer")).toBeNull();
    expect(await validateSession(s2.rawToken, "customer")).toBeNull();
  });

  it("Rejects session when idle timeout has elapsed (2 hours)", async () => {
    const { rawToken } = await createSession(customerUserId, "customer");
    const db = getDb();

    // Artificially move lastSeenAt back by 3 hours
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
    const crypto = await import("node:crypto");
    const idHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    await db
      .update(sessions)
      .set({ lastSeenAt: threeHoursAgo })
      .where(eq(sessions.idHash, idHash));

    const validated = await validateSession(rawToken, "customer");
    expect(validated).toBeNull();
  });
});
