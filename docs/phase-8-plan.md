# Phase 8 Plan: Background Workers, Data Retention, Backups, and Legal / Privacy Compliance

## Objective

Establish the production operations subsystem for Furrowmark:

1. **Background Job Runner & Schedulers (`src/modules/jobs/`)**:
   - Resilient runner executing tasks from `job_runs` and `queue_jobs`.
   - `reservation_expiry`: Release expired unfinalized stock reservations through `stock_ledger`.
   - `batch_expiry_check`: Flag batches nearing expiry and update status to `expired` once past `expires_on`.
   - `notification_dispatch`: Process pending transactional email, SMS, and WhatsApp queue jobs with exponential backoff retries.
   - `bank_transfer_expiry`: Automatically expire and cancel orders in `pending_payment` older than 48 hours, releasing stock back into available inventory.
   - `retention_cleanup`: Enforce privacy data retention policy (delete chat messages >30 days, guest carts >30 days, expired sessions >30 days, search queries >90 days, login attempts >90 days).
   - `alert_digest`: Aggregate operational warnings (low stock <10 units, batches expiring within 30 days, failed queue jobs) and record digest into `job_runs`.
2. **Encrypted Database Backup & Restore Automation (`scripts/backup-db.sh`, `scripts/restore-db.sh`)**:
   - Automated dump script utilizing `pg_dump` with OpenSSL AES-256-CBC encryption and checksum validation.
   - Point-in-time test restore verification script ensuring backups can be decrypted and loaded safely.
3. **Statutory Agricultural Commerce & Privacy Legal Suite (`src/app/(legal)/*`)**:
   - `/privacy`: Privacy Policy detailing data retention schedules, customer rights under Pakistani electronic commerce standards, and emergency contact protection.
   - `/terms`: Terms of Service covering regulated agrochemical purchases, customer advisory acknowledgement, and COD handling.
   - `/shipping-policy`: Delivery policy explaining parcel segregation (hazardous agrochemicals vs general goods) and delivery timelines.
   - `/return-policy`: Return & Refund policy adhering to the 7-day rule, strict non-returnability of unsealed pesticides/chemicals, and store credit ledger disbursement.
   - Footer added to `src/app/layout.tsx` linking to all statutory pages.
4. **Comprehensive Quality & Compliance Gates**:
   - Strict TypeScript (`tsc --noEmit`), ESLint (`eslint .`), Prettier (`prettier --check .`), Banned Content Scanner (`scripts/scan-banned-content.ts`), Unit & Integration Test Suite (`vitest run`), and Production Build (`next build`).
