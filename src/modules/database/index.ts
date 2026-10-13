import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";
import { getEnv } from "../config/env";

let runtimePool: Pool | null = null;
let migratorPool: Pool | null = null;

export function getDb() {
  const env = getEnv();
  if (!runtimePool) {
    runtimePool = new Pool({
      connectionString: env.DATABASE_URL,
      max: 10,
    });
  }
  return drizzle(runtimePool, { schema });
}

export const getRuntimeDb = getDb;

export type AppDb = ReturnType<typeof getDb>;
export type AppTransaction = Parameters<Parameters<AppDb["transaction"]>[0]>[0];

export function getMigratorDb() {
  const env = getEnv();
  if (!migratorPool) {
    migratorPool = new Pool({
      connectionString: env.DATABASE_MIGRATOR_URL,
      max: 2,
    });
  }
  return { pool: migratorPool, db: drizzle(migratorPool, { schema }) };
}

export async function closePools() {
  if (runtimePool) {
    await runtimePool.end();
    runtimePool = null;
  }
  if (migratorPool) {
    await migratorPool.end();
    migratorPool = null;
  }
}
