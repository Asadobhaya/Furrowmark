import crypto from "node:crypto";
import { getDb } from "../database";
import { auditLog } from "../database/schema";

export interface AuditEntry {
  actorId?: string;
  action: string;
  entity: string;
  entityId?: string;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  ip: string;
  userAgent?: string;
}

export function hashIp(ip: string): string {
  // Anonymize IP via SHA-256 with salt prefix
  return crypto
    .createHash("sha256")
    .update(`ip-salt:${ip.trim()}`)
    .digest("hex");
}

export async function logAudit(entry: AuditEntry): Promise<void> {
  const db = getDb();
  await db.insert(auditLog).values({
    actorId: entry.actorId ?? null,
    action: entry.action,
    entity: entry.entity,
    entityId: entry.entityId ?? null,
    before: entry.before ?? null,
    after: entry.after ?? null,
    ipHash: hashIp(entry.ip),
    userAgent: entry.userAgent ?? null,
  });
}
