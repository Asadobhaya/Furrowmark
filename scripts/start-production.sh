#!/usr/bin/env bash
set -euo pipefail

# Furrowmark Production Deployment & Service Runner
# This script loads .env.production and starts the Next.js server

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$DIR"

echo "============================================================"
echo "STARTING FURROWMARK PRODUCTION SERVICE"
echo "============================================================"

if [ ! -f .env.production ]; then
  echo "Error: .env.production file missing!"
  exit 1
fi

set -a
# shellcheck disable=SC1091
source .env.production
set +a

# Ensure node on PATH
if [ -f "/home/malik_bahawal_shair/.local/env.sh" ]; then
  # shellcheck disable=SC1091
  source /home/malik_bahawal_shair/.local/env.sh
fi

echo "Verifying database migrations..."
npx tsx scripts/migrate.ts

echo "Launching Next.js production server on port 3000..."
exec npm start
