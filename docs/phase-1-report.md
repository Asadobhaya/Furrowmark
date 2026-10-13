# Phase 1 Report: Foundation

## 1. What was built

Phase 1 (Foundation) has been fully implemented, verified, and grounded with automated tests and evidence:

1. **Toolchain & Environment**:
   - Node.js LTS (v24.21.0) and PostgreSQL 17.10 installed locally under user space without elevated root daemon vulnerabilities.
   - Pinned exact dependency versions in `package.json` with **0 vulnerabilities** reported by `npm audit`.
   - Strict TypeScript configuration (`noUncheckedIndexedAccess`, `strict`, `noEmit`).
   - Flat ESLint configuration (`typescript-eslint`) and Prettier formatting passing cleanly.
   - Continuous banned content scanning script (`scripts/scan-banned-content.ts`) enforcing zero em/en-dashes, zero emoji, zero gradients, zero AI builder badges, and zero placeholder words.

2. **Database & Migrations**:
   - Provisioned `furrowmark_dev` and `furrowmark_test` databases with `pg_trgm`, `unaccent`, and `uuid-ossp` extensions.
   - Dual-role database security model: `app_migrator` (DDL migrations) vs least-privilege `app_runtime` (DML only, no DDL).
   - Core tables migrated: `users`, `sessions`, `mfa_credentials`, `auth_tokens`, `login_attempts`, `audit_log`, `config_settings`, `job_runs`.
   - Hardened `audit_log` with an immutable PostgreSQL trigger (`BEFORE UPDATE OR DELETE`) and revoked `UPDATE`/`DELETE` permissions from `app_runtime`.

3. **Design Tokens & Accessibility**:
   - `src/design/tokens.ts` containing solid palette: deep green primary (`#1c4d25`), earth accent (`#8b5a2b`), and neutral greys.
   - Automated WCAG 2.2 AA contrast tests verifying button texts (>= 4.5:1) and body texts (>= 7.0:1) on white and neutral backgrounds.

4. **Security & Cryptography**:
   - Argon2id password hashing with OWASP recommended cost parameters.
   - Breached password detection using HaveIBeenPwned k-anonymity SHA-1 range lookups.
   - AES-256-GCM authenticated field encryption for sensitive tokens and MFA secrets.
   - RFC 6238 TOTP multi-factor authentication generation and validation.
   - Strict HTTP security headers builder (`src/modules/security/headers.ts`) generating nonce-based CSP without unsafe-inline or unsafe-eval, HSTS with preload, `nosniff`, `X-Frame-Options: DENY`, and strict Permissions-Policy.

5. **Server-Side Session Management & RBAC**:
   - Database-backed server sessions with cryptographic SHA-256 token hashing.
   - Separate cookies: `__Host-sid` (Lax) for customers and `__Host-asid` (Strict) for staff.
   - Idle timeout (2 hours) and absolute timeouts (12 hours staff, 14 days customer) with immediate single and bulk user revocation.
   - Deny-by-default RBAC matrix (`src/modules/rbac/permissions.ts`) enforcing granular permissions per role (`owner`, `manager`, `staff`, `support`, `customer`).

## 2. Evidence

All commands and test runs have been executed and recorded in `docs/evidence/phase-1/verification.txt`:

- `npm audit`: 0 vulnerabilities
- `tsc --noEmit`: 0 errors
- `eslint .`: 0 errors, 0 warnings
- `prettier --check .`: Clean across all files
- `scan-banned-content.ts`: 54 files clean
- `vitest run --coverage`: 6 test suites, 33 tests passed (100%), with **90.08% overall statement coverage** (auth: 97.43%, session: 100%, security: 100%, audit: 100%, design: 100%).

## 3. Documents updated

- `CHANGELOG.md`: Phase 1 milestone logged.
- `VERIFICATION.md`: Updated requirement to evidence mapping.
- `SECURITY.md`: Incident response checklist and vulnerability reporting policy added.
- `docs/asvs-map.md`: OWASP ASVS Level 2/3 controls mapped to implementation and tests.
- `docs/evidence/phase-1/verification.txt`: Raw command outputs and test coverage report.

## 4. Owner inputs required (Upcoming for Phase 2)

Phase 2 covers Catalog, Publishing Rules, and Inventory:

1. **Restricted Agrochemicals**: Does the business sell restricted or licensed pesticides in Pakistan? If yes, provide the licence number and issuing authority (e.g. Department of Plant Protection / Provincial Agriculture Extension).
2. **Second Staff Account**: To satisfy the four-eyes publishing rule (author cannot publish own pesticide products), an additional staff or manager account email will be needed for testing the publishing approval gate.
3. **Pesticide / Seed / Fertiliser Data**: Real product pack details, label text, application rates, pre-harvest intervals, safety data sheet PDFs, and real packaging photos.

## 5. Open risks

- Real merchant accounts and payment gateways will be validated in Phase 3.
- Brand name "Furrowmark" trademark availability in Pakistan requires legal confirmation before public launch.

---

**Operating Rule 1 & 2 checkpoint**: Phase 1 is complete. Per the rules, I stop here and wait for your explicit input:
**"Approved: Phase 1"** before proceeding to plan Phase 2.
