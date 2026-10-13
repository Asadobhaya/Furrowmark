# Runbook & Operational Procedures

This runbook documents production procedures for administrators, operators, and support engineers managing Furrowmark.

---

## 1. Environment & Architecture Overview

Furrowmark is a modular monolith application running with a Next.js App Router web process, PostgreSQL database, and background job worker.

### Critical Ports & Services:

- Web Application: Port `3000` (Next.js Node runtime)
- Database: Port `5432` (PostgreSQL 17+ with `pg_trgm`, `unaccent`, `uuid-ossp`)
- Background Worker: `BackgroundWorker` executing `reservation_expiry`, `batch_expiry_check`, `notification_dispatch`, `retention_cleanup`, `alert_digest`, and `bank_transfer_expiry`.

---

## 2. Payment Operations & Manual Verification

Furrowmark accepts only two payment methods:

1. **Advance Payment**:
   - Meezan Bank Ltd: Account Number `03130115156301`, Title: `Muhammad Asad`
   - Easypaisa: Account Number `03004634494`, Title: `Muhammad Asad`
2. **Cash on Delivery (COD)**

### Step-by-Step Payment Verification:

1. Navigate to `/staff/orders` and authenticate using staff credentials.
2. Filter orders by status `pending_payment`.
3. Inspect the transaction ID submitted by the customer against the bank or Easypaisa account statement.
4. Verify the exact total amount in PKR.
5. Click **Verify Advance Payment**.
   - The order state atomically transitions to `paid`.
   - A customer confirmation notification is enqueued to `queue_jobs`.
   - The warehouse is instructed to pick and pack the order under First-Expired, First-Out (FEFO) batch allocation.

---

## 3. Quarantines & Emergency Chemical Recalls

When a batch of regulated pesticides, herbicides, or seeds is flagged by an agricultural inspectorate or manufacturer:

1. **Immediate Quarantine**:
   - Access `/staff/returns` or execute `InventoryService.recallBatch`.
   - Physical units on hand are immediately moved from `available` to `quarantined`.
   - Further catalog sales and order allocations for the batch lot are halted instantly.
2. **Stock Ledger Audit**:
   - Check `stock_ledger` for movement type `return_quarantine` or `quarantine`.
   - The ledger is append-only and cannot be modified or deleted.

---

## 4. Database Backup & Restore Drills

### Taking a Backup:

```bash
# Run the automated backup script
./scripts/backup-db.sh /var/backups/furrowmark
```

- Dumps database structure and records.
- Encrypts via OpenSSL AES-256-CBC with PBKDF2 (100,000 iterations).
- Emits SHA-256 checksum file `furrowmark_<timestamp>.sql.enc.sha256`.

### Verifying or Restoring a Backup:

```bash
./scripts/restore-db.sh /var/backups/furrowmark/furrowmark_<timestamp>.sql.enc
```

- Verifies SHA-256 cryptographic integrity.
- Decrypts and tests PostgreSQL dump structure.

---

## 5. Security Incident & Secret Rotation

If credentials or keys are exposed:

1. Immediately rotate `SESSION_SECRET` and `FIELD_ENCRYPTION_KEY` in environment configuration.
2. Revoke active customer and staff sessions:
   ```sql
   UPDATE sessions SET revoked_at = NOW() WHERE revoked_at IS NULL;
   ```
3. Restart the web and worker processes.
4. Review the immutable `audit_log` table for unauthorized actions.
