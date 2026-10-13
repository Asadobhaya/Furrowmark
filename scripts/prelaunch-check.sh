#!/usr/bin/env bash
set -euo pipefail

# Furrowmark Production Pre-Launch Verification Gate
# Runs all checks required for deployment approval.

echo "============================================================"
echo "RUNNING FURROWMARK PRE-LAUNCH CHECKLIST & GATES"
echo "============================================================"

# 1. Pinned Dependencies Security Audit
echo "1. Checking npm audit for dependency vulnerabilities..."
npm audit --audit-level=moderate

# 2. Strict TypeScript Typecheck
echo "2. Running TypeScript static typecheck (tsc --noEmit)..."
npm run typecheck

# 3. ESLint Static Analysis
echo "3. Running ESLint..."
npm run lint

# 4. Prettier Formatting
echo "4. Checking code formatting (prettier --check)..."
npm run format

# 5. Banned Words & Banned Characters Scanner
echo "5. Scanning codebase for banned words, em-dashes, and emoji..."
npm run scan:content

# 6. Automated Unit, Service & Worker Test Suite
echo "6. Running automated test suite (vitest run)..."
npm run test

# 7. Production Next.js Build Verification
echo "7. Verifying Next.js optimized production build (next build)..."
npm run build

echo "============================================================"
echo "ALL PRE-LAUNCH PRODUCTION GATES PASSED SUCCESSFULLY!"
echo "System is verified for live deployment."
echo "============================================================"
