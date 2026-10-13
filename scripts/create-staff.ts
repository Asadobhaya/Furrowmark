/**
 * Creates a staff/owner account.
 * Usage: STAFF_EMAIL=... STAFF_PASSWORD=... [STAFF_ROLE=owner|manager|staff|support] npx tsx scripts/create-staff.ts
 * (needs DATABASE_URL etc. in the environment, e.g. `set -a; . ./.env.local; set +a`)
 */
import { getDb, closePools } from "../src/modules/database";
import { users } from "../src/modules/database/schema";
import { hashPassword } from "../src/modules/auth/crypto";

const email = process.env.STAFF_EMAIL?.trim().toLowerCase();
const password = process.env.STAFF_PASSWORD;
const role = (process.env.STAFF_ROLE ?? "owner") as
  "owner" | "manager" | "staff" | "support";

async function main() {
  if (!email || !password) {
    throw new Error("STAFF_EMAIL and STAFF_PASSWORD are required");
  }
  const passwordHash = await hashPassword(password);
  await getDb().insert(users).values({ email, passwordHash, role });
  console.log(`Created ${role} account for ${email}`);
}

main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(closePools);
