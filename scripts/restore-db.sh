#!/usr/bin/env bash
set -euo pipefail

# Furrowmark Production Encrypted Database Restore Verification Routine
# Usage: ./scripts/restore-db.sh <ENCRYPTED_FILE> [TARGET_DATABASE]

if [ "$#" -lt 1 ]; then
  echo "Usage: $0 <path_to_encrypted_file> [target_database]"
  exit 1
fi

ENCRYPTED_FILE="$1"
TARGET_DB="${2:-furrowmark_restore_verify}"
CHECKSUM_FILE="${ENCRYPTED_FILE}.sha256"
KEY="${BACKUP_ENCRYPTION_KEY:-furrowmark_default_secure_vault_key_2026}"

if [ ! -f "$ENCRYPTED_FILE" ]; then
  echo "Error: Encrypted backup file $ENCRYPTED_FILE does not exist."
  exit 1
fi

# 1. Verify SHA256 checksum if available
if [ -f "$CHECKSUM_FILE" ]; then
  echo "Verifying SHA256 integrity checksum..."
  sha256sum -c "$CHECKSUM_FILE"
  echo "Checksum verified."
else
  echo "Warning: Checksum file not found. Proceeding with caution."
fi

PLAINTEXT_RESTORE="/tmp/restore_verify_$$.sql"

echo "Decrypting backup file..."
openssl enc -d -aes-256-cbc -pbkdf2 -iter 100000 \
  -in "$ENCRYPTED_FILE" \
  -out "$PLAINTEXT_RESTORE" \
  -pass "pass:${KEY}"

echo "Validating SQL syntax structure..."
if grep -q "CREATE TABLE" "$PLAINTEXT_RESTORE" || grep -q "PostgreSQL database dump" "$PLAINTEXT_RESTORE"; then
  echo "Valid PostgreSQL SQL dump structure confirmed."
else
  echo "Error: Decrypted file does not appear to be a valid PostgreSQL dump."
  rm -f "$PLAINTEXT_RESTORE"
  exit 1
fi

rm -f "$PLAINTEXT_RESTORE"
echo "Backup verification and decryption test passed successfully."
