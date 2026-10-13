import { describe, it, expect, afterAll } from "vitest";
import { getDb, closePools } from "../database";
import { auditLog } from "../database/schema";
import { logAudit, hashIp } from "./service";
import { eq } from "drizzle-orm";

describe("Audit Log Append-Only Immutability Tests", () => {
  afterAll(async () => {
    await closePools();
  });

  it("Allows writing audit records successfully", async () => {
    const actionName = "test_audit_action_" + Date.now();
    await logAudit({
      action: actionName,
      entity: "system",
      ip: "192.168.1.100",
      after: { test: true },
    });

    const db = getDb();
    const rows = await db
      .select()
      .from(auditLog)
      .where(eq(auditLog.action, actionName));
    expect(rows.length).toBe(1);
    expect(rows[0]?.action).toBe(actionName);
    expect(rows[0]?.ipHash).toBe(hashIp("192.168.1.100"));
  });

  it("Rejects UPDATE on audit_log via revoked permissions and trigger enforcement", async () => {
    const actionName = "immutable_test_" + Date.now();
    await logAudit({
      action: actionName,
      entity: "system",
      ip: "127.0.0.1",
    });

    const db = getDb();
    const [entry] = await db
      .select()
      .from(auditLog)
      .where(eq(auditLog.action, actionName));
    expect(entry).toBeDefined();

    // Must be rejected by database (permission denied / append-only trigger)
    await expect(
      db
        .update(auditLog)
        .set({ action: "tampered_action" })
        .where(eq(auditLog.id, entry!.id)),
    ).rejects.toThrow();
  });

  it("Rejects DELETE on audit_log via revoked permissions and trigger enforcement", async () => {
    const actionName = "immutable_delete_test_" + Date.now();
    await logAudit({
      action: actionName,
      entity: "system",
      ip: "127.0.0.1",
    });

    const db = getDb();
    const [entry] = await db
      .select()
      .from(auditLog)
      .where(eq(auditLog.action, actionName));
    expect(entry).toBeDefined();

    // Must be rejected by database (permission denied / append-only trigger)
    await expect(
      db.delete(auditLog).where(eq(auditLog.id, entry!.id)),
    ).rejects.toThrow();
  });
});
