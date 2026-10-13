# Verification index

Each requirement maps to an evidence file or NOT VERIFIED with a reason.

## Phase 0

| Requirement                                              | Status              | Evidence or reason                       |
| -------------------------------------------------------- | ------------------- | ---------------------------------------- |
| No application code in Phase 0                           | VERIFIED            | `docs/evidence/phase-0/doc-scan.txt`     |
| No em or en dashes in documents                          | VERIFIED            | `docs/evidence/phase-0/doc-scan.txt`     |
| No emoji in documents                                    | VERIFIED            | `docs/evidence/phase-0/doc-scan.txt`     |
| No placeholder tags, placeholder text, banned copy words | VERIFIED            | `docs/evidence/phase-0/doc-scan.txt`     |
| Architecture, adapters, state machines, jobs             | VERIFIED as present | `docs/architecture.md`                   |
| ER diagram and data dictionary draft                     | VERIFIED as present | `docs/database.md`                       |
| Route and permission map                                 | VERIFIED as present | `docs/routes-and-permissions.md`         |
| Threat model draft                                       | VERIFIED as present | `docs/threat-model.md`                   |
| Test strategy                                            | VERIFIED as present | `docs/testing.md`                        |
| Deployment and recovery outline                          | VERIFIED as present | `docs/deployment.md`, `docs/recovery.md` |
| Tooling choices                                          | VERIFIED as present | `docs/tooling.md`                        |

## Phase 1 (Foundation)

| Requirement                                                                       | Status       | Evidence or reason                                                                                                       |
| --------------------------------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------ |
| Node.js & PostgreSQL environment setup                                            | VERIFIED     | Node v24.21.0, PostgreSQL 17.10 running locally                                                                          |
| Pinned exact dependencies with zero vulnerabilities                               | VERIFIED     | `docs/evidence/phase-1/verification.txt` (`npm audit`: 0 vulnerabilities)                                                |
| Strict TypeScript (noUncheckedIndexedAccess, noEmit)                              | VERIFIED     | `docs/evidence/phase-1/verification.txt` (`tsc --noEmit`: 0 errors)                                                      |
| ESLint flat config with zero warnings and zero errors                             | VERIFIED     | `docs/evidence/phase-1/verification.txt` (`eslint .`: 0 errors, 0 warnings)                                              |
| Prettier code style check across entire repository                                | VERIFIED     | `docs/evidence/phase-1/verification.txt` (`prettier --check .`: all match)                                               |
| Banned content scanner (em/en dashes, emoji, gradients, banned words)             | VERIFIED     | `docs/evidence/phase-1/verification.txt` (`scan-banned-content.ts`: 54 files clean)                                      |
| Database migrations & schema setup                                                | VERIFIED     | `scripts/migrate.ts` executed on `furrowmark_dev` & `furrowmark_test` with extensions `pg_trgm`, `unaccent`, `uuid-ossp` |
| Least-privilege runtime role & append-only audit_log                              | VERIFIED     | `src/modules/audit/service.test.ts` (Trigger prevents UPDATE/DELETE; runtime user revoked)                               |
| Design tokens defined in one file with WCAG 2.2 AA contrast                       | VERIFIED     | `src/design/tokens.ts`, tested in `src/design/tokens.test.ts` (all >= 4.5:1, body >= 7:1)                                |
| Strict security headers (CSP nonce, HSTS preload, nosniff, frame-ancestors none)  | VERIFIED     | `src/modules/security/headers.ts`, tested in `src/modules/security/headers.test.ts`                                      |
| Argon2id password hashing & breached password check                               | VERIFIED     | `src/modules/auth/crypto.ts`, tested in `src/modules/auth/crypto.test.ts`                                                |
| RFC 6238 TOTP Multi-factor authentication                                         | VERIFIED     | `src/modules/auth/crypto.ts`, tested in `src/modules/auth/crypto.test.ts`                                                |
| AES-256-GCM authenticated field encryption                                        | VERIFIED     | `src/modules/auth/crypto.ts`, tested in `src/modules/auth/crypto.test.ts`                                                |
| Server-side database sessions (__Host-sid, __Host-asid, idle timeout, revocation) | VERIFIED     | `src/modules/auth/session.ts`, tested in `src/modules/auth/session.test.ts`                                              |
| Deny-by-default RBAC permission matrix                                            | VERIFIED     | `src/modules/rbac/permissions.ts`, tested in `src/modules/rbac/permissions.test.ts`                                      |
| Critical test coverage target (auth >= 90%, rbac >= 75%)                          | VERIFIED     | `docs/evidence/phase-1/verification.txt` (All files 90.08%, auth 97.43%, session 100%)                                   |
| Domain and trademark availability of proposed name                                | NOT VERIFIED | Requires official trademark lookup in Pakistan                                                                           |

## Phase 2 (Catalog, Publishing Rules, and Inventory)

| Requirement                                                                   | Status       | Evidence or reason                                                                                          |
| ----------------------------------------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------- |
| Zero vulnerability pinned dependencies                                        | VERIFIED     | `docs/evidence/phase-2/verification.txt` (`npm audit`: 0 vulnerabilities)                                   |
| Strict TypeScript check (0 errors)                                            | VERIFIED     | `docs/evidence/phase-2/verification.txt` (`tsc --noEmit`: 0 errors)                                         |
| Strict ESLint check (0 errors, 0 warnings)                                    | VERIFIED     | `docs/evidence/phase-2/verification.txt` (`eslint .`: 0 errors)                                             |
| Prettier code style check across entire repository                            | VERIFIED     | `docs/evidence/phase-2/verification.txt` (`prettier --check .`: all clean)                                  |
| Content scanner (no em/en dashes, emoji, gradients, banned marketing copy)    | VERIFIED     | `docs/evidence/phase-2/verification.txt` (`scan-banned-content.ts`: 71 files verified clean)                |
| Four-Eyes product publishing workflow (different author and publisher)        | VERIFIED     | `src/modules/publishing/service.ts`, tested in `src/modules/publishing/service.test.ts`                     |
| Real packshot image enforcement prior to publishing                           | VERIFIED     | `src/modules/publishing/service.ts`, tested in `src/modules/publishing/service.test.ts`                     |
| Category regulatory validation (pesticides, seeds, fertilisers completeness)  | VERIFIED     | `src/modules/publishing/service.ts`, tested in `src/modules/publishing/service.test.ts`                     |
| FEFO (First-Expired, First-Out) batch allocation with pessimistic row locking | VERIFIED     | `src/modules/inventory/service.ts`, tested in `src/modules/inventory/service.test.ts`                       |
| Immediate batch quarantine and emergency product recall                       | VERIFIED     | `src/modules/inventory/service.ts`, tested in `src/modules/inventory/service.test.ts`                       |
| Append-only stock ledger with database trigger preventing UPDATE/DELETE       | VERIFIED     | `scripts/migrate.ts` trigger `stock_ledger_no_modify_tg`, tested in `src/modules/inventory/service.test.ts` |
| Typo-tolerant trigram search and zero-result query analytics                  | VERIFIED     | `src/modules/catalog/service.ts`, tested in `src/modules/catalog/service.test.ts`                           |
| Overall test coverage >= 85% with inventory >= 90%                            | VERIFIED     | `docs/evidence/phase-2/verification.txt` (All files 88.84%, inventory 93.75%, catalog 93.33%)               |
| Requirements of sections 7 to 14 (Cart, Checkout, Fulfilment, Chatbot, etc.)  | NOT VERIFIED | Scheduled for Phases 3 through 10                                                                           |

## Phase 3 (Cart, Server-Side Pricing, Payments, and Orders)

| Requirement                                                                    | Status       | Evidence or reason                                                                                            |
| ------------------------------------------------------------------------------ | ------------ | ------------------------------------------------------------------------------------------------------------- |
| Pinned exact dependencies with zero vulnerabilities                            | VERIFIED     | `docs/evidence/phase-3/verification.txt` (`npm audit`: 0 vulnerabilities)                                     |
| Strict TypeScript (noUncheckedIndexedAccess, noEmit)                           | VERIFIED     | `docs/evidence/phase-3/verification.txt` (`tsc --noEmit`: 0 errors)                                           |
| ESLint rules check with zero errors and zero warnings                          | VERIFIED     | `docs/evidence/phase-3/verification.txt` (`eslint .`: 0 errors, 0 warnings)                                   |
| Prettier formatting check across all files                                     | VERIFIED     | `docs/evidence/phase-3/verification.txt` (`prettier --check .`: all matched files)                            |
| Banned content scanner (em/en dashes, emoji, gradients, banned marketing copy) | VERIFIED     | `docs/evidence/phase-3/verification.txt` (`scan-banned-content.ts`: 93 files clean)                           |
| Server-side pricing engine with integer minor units (paisa, no float)          | VERIFIED     | `src/modules/pricing/service.ts`, tested in `src/modules/pricing/service.test.ts` (9/9 passed)                |
| Tax calculation in inclusive and exclusive modes                               | VERIFIED     | `src/modules/pricing/service.ts`, tested in `src/modules/pricing/service.test.ts`                             |
| Coupon discount engine (fixed minor and percentage basis points)               | VERIFIED     | `src/modules/pricing/service.ts`, tested in `src/modules/pricing/service.test.ts`                             |
| Cart service with guest sessions, auth merge, and stock checks                 | VERIFIED     | `src/modules/cart/service.ts`, tested in `src/modules/cart/service.test.ts` (4/4 passed)                      |
| Atomic FEFO batch allocation on order checkout                                 | VERIFIED     | `src/modules/orders/service.ts`, tested in `src/modules/orders/service.test.ts` (4/4 passed)                  |
| Immutable order line snapshots and pricing quote retention                     | VERIFIED     | `src/modules/orders/service.ts`, tested in `src/modules/orders/service.test.ts`                               |
| 14-state order machine with transition enforcement                             | VERIFIED     | `src/modules/orders/service.ts`, tested in `src/modules/orders/service.test.ts`                               |
| Automatic stock reservation release on order cancellation                      | VERIFIED     | `src/modules/orders/service.ts`, tested in `src/modules/orders/service.test.ts`                               |
| Append-only order event audit trail (database trigger protection)              | VERIFIED     | `scripts/migrate.ts` trigger `trg_order_events_immutable`, tested in `src/modules/orders/service.test.ts`     |
| Safepay adapter with HMAC-SHA256 constant-time verification & 5-min freshness  | VERIFIED     | `src/modules/payments/service.ts`, tested in `src/modules/payments/service.test.ts` (6/6 passed)              |
| Cash on delivery and bank transfer payment adapters                            | VERIFIED     | `src/modules/payments/service.ts`, tested in `src/modules/payments/service.test.ts`                           |
| Webhook idempotency and replay protection via deduplicated audit events        | VERIFIED     | `src/modules/payments/service.ts`, tested in `src/modules/payments/service.test.ts`                           |
| Refund engine with integer upper-bound enforcement (no over-refunds)           | VERIFIED     | `src/modules/payments/service.ts`, tested in `src/modules/payments/service.test.ts`                           |
| Vitest test suite with 100% pass rate and coverage (overall >= 85%)            | VERIFIED     | `docs/evidence/phase-3/verification.txt` (71/71 passed, overall 86.13% stmts, orders 90.76%, payments 88.42%) |
| Production Safepay live merchant keys and production bank credentials          | NOT VERIFIED | Requires store owner configuration (documented under Owner inputs required)                                   |
| Requirements of sections 7 to 14 (Shipping carriers, Notifications, UI, etc.)  | NOT VERIFIED | Scheduled for Phases 4 through 10                                                                             |
