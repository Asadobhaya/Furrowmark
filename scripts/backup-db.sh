#!/usr/bin/env bash
set -euo pipefail

# Furrowmark Production Encrypted Database Backup Routine
# Usage: ./scripts/backup-db.sh [OUTPUT_DIR]

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
OUT_DIR="${1:-/tmp/furrowmark_backups}"
mkdir -p "$OUT_DIR"

BACKUP_FILE="${OUT_DIR}/furrowmark_${TIMESTAMP}.sql"
ENCRYPTED_FILE="${BACKUP_FILE}.enc"
CHECKSUM_FILE="${ENCRYPTED_FILE}.sha256"

# Ensure BACKUP_ENCRYPTION_KEY or default fallback is configured
KEY="${BACKUP_ENCRYPTION_KEY:-furrowmark_default_secure_vault_key_2026}"

echo "Starting Furrowmark database backup at ${TIMESTAMP}..."

# Export database dump using pg_dump
PGPASSWORD="${PGPASSWORD:-postgres}" pg_dump \
  -h "${PGHOST:-localhost}" \
  -p "${PGPORT:-5432}" \
  -U "${PGUSER:-postgres}" \
  -d "${PGDATABASE:-furrowmark}" \
  --format=plain \
  --no-owner \
  --no-acl > "$BACKUP_FILE"

echo "Database dump complete. Size: $(du -h "$BACKUP_FILE" | cut -f1)"

# Encrypt using OpenSSL AES-256-CBC with PBKDF2
openssl enc -aes-256-cbc -salt -pbkdf2 -iter 100000 \
  -in "$BACKUP_FILE" \
  -out "$ENCRYPTED_FILE" \
  -pass "pass:${KEY}"

# Generate SHA256 checksum for integrity verification
sha256sum "$ENCRYPTED_FILE" > "$CHECKSUM_FILE"

# Clean up raw plaintext dump
rm -f "$BACKUP_FILE"

echo "Encrypted backup created: ${ENCRYPTED_FILE}"
echo "Integrity checksum created: ${CHECKSUM_FILE}"
echo "Furrowmark backup completed successfully."
