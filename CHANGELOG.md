# Changelog

## Phase 10 (Launch Preparation, Production Hardening & Pre-Flight Checklist) (2026-10-14)

- Created automated pre-launch orchestration script in `scripts/prelaunch-check.sh` executing dependency audit, TypeScript typechecking, ESLint analysis, Prettier checks, banned content scan, 97-test automated verification, and production Next.js build.
- Created production DNS and TLS specification in `docs/dns-and-tls.md` covering apex A/AAAA, CAA directives, enforcing DMARC (`p=reject`), SPF, DKIM, and HSTS preload.
- Added environment configuration unit test suite in `src/modules/config/env.test.ts`.
- Verified quality gates across all 201 repository files.
- Full verification: zero npm audit vulnerabilities, zero TypeScript errors, zero ESLint warnings, 100% Prettier compliant, clean banned-content scan, and clean production Next.js build.

## Phase 9 (End-to-End Verification, Performance & Operational Readiness) (2026-10-14)

- Configured Playwright end-to-end testing suite in `playwright.config.ts`.
- Created comprehensive E2E customer and staff journey specs in `tests/e2e/storefront.spec.ts` covering catalog browsing, cart operations, advance payment instructions (Meezan Bank & Easypaisa to Muhammad Asad), COD payment selection, and staff route protection.
- Created production operations runbook in `docs/runbook.md` detailing payment verification workflows, emergency chemical recall execution, encrypted database backups, and security secret rotation.
- Verified test coverage and quality gates across all 195 repository files.
- Full verification: zero npm audit vulnerabilities, zero TypeScript errors, zero ESLint warnings, 100% Prettier compliant, clean banned-content scan, and clean production Next.js build.

## Phase 8 (Background Workers, Data Retention, Backups & Legal Compliance) (2026-10-13)

- Implemented background job runner in `src/modules/jobs/runner.ts` and scheduler in `src/modules/jobs/worker.ts`.
- Integrated automated execution of core operational jobs with `job_runs` metrics logging:
  - `reservation_expiry`: Automatically cancels expired unfinalized orders and restores FEFO batch stock reservations.
  - `batch_expiry_check`: Detects batches past expiry dates, automatically marks status as `expired`, and moves inventory to quarantine.
  - `notification_dispatch`: Processes queued Email, SMS, and WhatsApp alerts with exponential retry backoff.
  - `retention_cleanup`: Enforces GDPR/consumer privacy retention schedules (30 days for chat and guest carts, 90 days for search analytics and login rate-limiter logs).
  - `alert_digest`: Aggregates near-expiry stock, low-inventory batches, and dead-letter queue failures.
  - `bank_transfer_expiry`: Cancels unpaid advance bank transfer / Easypaisa orders after 48 hours and releases reserved inventory.
- Created automated encrypted database backup and verification scripts in `scripts/backup-db.sh` and `scripts/restore-db.sh` utilizing OpenSSL AES-256-CBC PBKDF2 and SHA-256 checksums.
- Created statutory agricultural ecommerce policy pages:
  - `/privacy`: Data retention schedules, customer data access and deletion rights, and emergency poison control data protection.
  - `/terms`: Agrochemical regulatory licensing compliance, user acknowledgement of SDS application guidelines, and COD payment terms.
  - `/shipping-policy`: Hazardous chemical segregation protocols (leak-proof placards) and national delivery timelines.
  - `/return-policy`: Statutory 7-day return window, strict non-returnability of unsealed/opened chemical formulations, and store credit ledger allocation.
- Updated `src/app/layout.tsx` with a responsive footer linking to all statutory policies.
- Expanded automated test suite to 18 test suites and 96 passing tests (100% pass rate).
- Full verification: zero npm audit vulnerabilities, zero TypeScript errors, zero ESLint warnings, 100% Prettier compliant, clean banned-content scan, and clean production Next.js build.

## Phase 7 (Customer Support Chatbot, Safety Controls & Policy Guardrails) (2026-10-13)

- Implemented chatbot and safety schemas in `src/modules/chatbot/schema.ts` (`chat_conversations`, `chat_messages`, `chat_spend_daily`, `support_tickets`).
- Built emergency poison-control interception engine in `src/modules/chatbot/safety.ts` giving immediate first aid guidance and national emergency helplines (Rescue 1122, JPMC Poison Control, AFIP).
- Implemented read-only knowledge discovery tools in `src/modules/chatbot/tools.ts`: `searchCatalog`, `getProductDetails`, `checkStock`, `getOrderStatus` (with phone/email proof of ownership), and store policy accessors.
- Implemented human escalation write tool `createSupportTicket` for customer issues.
- Implemented daily token budget and spend caps in `src/modules/chatbot/service.ts`.
- Created lazy-loaded customer assistance widget in `src/app/components/ChatWidget.tsx` mounted in `RootLayout`.
- Created conversational API handler at `POST /api/chat`.
- Expanded automated test coverage to 17 test suites and 92 passing tests (100% pass rate).
- Full verification: zero npm audit vulnerabilities, zero TypeScript errors, zero ESLint warnings, 100% Prettier compliant, clean banned-content scan, and clean production Next.js build.

## Phase 6 (Fulfilment, Returns RMA, Operations & Reporting) (2026-10-13)

- Implemented warehouse fulfilment schemas in `src/modules/fulfilment/schema.ts` (`shipments`, `shipment_items`, `shipment_events`, `cod_collections`).
- Implemented returns & RMA schemas in `src/modules/returns/schema.ts` (`return_requests`, `return_lines`, `store_credit_ledger`) with immutable trigger protection on `store_credit_ledger`.
- Implemented operational reporting schema in `src/modules/reporting/schema.ts` (`report_exports`).
- Built `FulfilmentService` with automatic separation of hazardous agrochemicals into dedicated transport parcels, multi-parcel packing, tracking dispatch, delivery confirmation, and COD collection tracking.
- Built `ReturnsService` with strict 7-day return policy enforcement, strict prohibition on opened chemical returns, restock routing into batch quarantine, and store credit ledger balancing.
- Built `ReportingService` generating real-time batch expiry and quarantine aging risk, statutory pesticide sales registers, and minor-unit revenue aggregation.
- Created staff operational portals at `/staff/fulfilment`, `/staff/returns`, and `/staff/reports`.
- Expanded test suite to 16 test suites and 86 tests (100% pass rate).
- Full verification: zero npm audit vulnerabilities, zero TypeScript errors, zero ESLint warnings, 100% Prettier compliant, clean banned-content scan, and clean production Next.js build.

## Phase 5 (Notifications Engine, Multichannel Adapters & Dispatch Queue) (2026-10-13)

- Implemented asynchronous notification schemas in `src/modules/notifications/schema.ts` (`notification_preferences`, `suppressions`, `message_log`, `queue_jobs`).
- Created multichannel adapters in `src/modules/notifications/adapters.ts`: `ConsoleEmailProvider`, `TelecomSmsProvider`, and `WhatsAppBusinessProvider`.
- Created template rendering engine in `src/modules/notifications/templates.ts` supporting `order_placed_advance`, `order_placed_cod`, `payment_confirmed`, and `order_dispatched`.
- Notification templates dynamically include verified owner account coordinates (Meezan Bank: `03130115156301`, Easypaisa: `03004634494`, Title: Muhammad Asad).
- Implemented queue service in `src/modules/notifications/service.ts` with atomic queue processing using `FOR UPDATE SKIP LOCKED`.
- Wired notification dispatch hooks into checkout order creation and staff manual payment verification.
- Expanded automated test coverage to 15 test suites and 81 passing tests (100% pass rate).
- Full verification: zero npm audit vulnerabilities, zero TypeScript errors, zero ESLint warnings, 100% Prettier compliant, clean banned-content scan, and clean production Next.js build.

## Phase 4 (Storefront, Cart, Checkout & Manual Payments) (2026-10-13)

- Implemented customer storefront pages: product catalog (`/products`), product details with multi-variant selection (`/products/[id]`), interactive cart (`/cart`), and checkout (`/checkout`).
- Enforced strict owner payment policy: eliminated automated payment gateways, supporting only direct Advance Payments and Cash on Delivery.
- Implemented Customer and Staff authentication portals (`/login`, `/register`, `/staff/login`).
- Added Staff Order Management portal (`/staff/orders`) with one-click manual payment confirmation and COD acceptance.
- Added Order Confirmation page (`/orders/[id]`) showing Meezan Bank and Easypaisa transfer instructions for advance payments.
- Strengthened security and integrity: added sliding-window brute-force rate limiter on login attempts and breached-password verification on customer registration.

## Phase 3 (Cart, Server-Side Pricing, Payments, and Orders) (2026-10-13)

- Implemented commerce data models in `src/modules/commerce/schema.ts`: `carts`, `cart_items`, `tax_rates`, `shipping_zones`, `coupons`, `orders`, `order_lines`, `order_line_allocations`, `order_events`, `payments`, `webhook_events`, `refunds`.
- Added database migrations with `trg_order_events_immutable` trigger to guarantee an append-only order history audit log.
- Implemented Server-Side Pricing Engine (`src/modules/pricing/service.ts`) operating entirely in integer minor units (paisa), supporting inclusive and exclusive tax modes, fixed minor and percentage basis point coupons, tiered shipping thresholds, and refund upper-bound validation.
- Implemented Cart Service (`src/modules/cart/service.ts`) supporting guest sessions, authenticated carts, cart item merging on customer authentication, live stock availability verification, and server-side quote generation.
- Implemented Order Service (`src/modules/orders/service.ts`) featuring atomic FEFO batch reservation, immutable line & pricing snapshot capture, and a 14-state transition engine (`pending_payment`, `awaiting_confirmation`, `paid`, `processing`, `packed`, `shipped`, `delivered`, `cancelled`, `partially_refunded`, `refunded`) with automated reservation release on cancellation.
- Implemented Payment Providers (`src/modules/payments/service.ts`) with Safepay gateway integration for Pakistan (HMAC-SHA256 signature validation with constant-time equality and 5-minute replay tolerance window), Cash on Delivery, and Bank Transfer adapters.
- Implemented Webhook Ingestion Service (`PaymentService.handleWebhook`) with cryptographic verification, idempotency deduplication via `webhook_events`, and atomic transaction transition to `paid`.
- Implemented Refund Engine (`PaymentService.refundOrder`) enforcing that cumulative refunds can never exceed total order amount minus earlier refunds, automatically transitioning orders to `partially_refunded` or `refunded`.
- Expanded test suite to 71 passing tests across 13 test files (0 failures, 86.13% statement coverage, 86.38% line coverage, with orders at 90.76% and payments at 88.42%).
- Full verification: zero vulnerabilities, zero TypeScript errors, zero ESLint warnings, 100% Prettier compliant, and 93 files clean of banned words and patterns.

## Phase 2 (Catalog, Publishing Rules, and Inventory) (2026-10-13)

- Implemented catalog data models in `src/modules/catalog/schema.ts`: categories, brands, products, variants, price history, safety data sheets, regulatory details (pesticides, seeds, fertilisers), suppliers, batches, stock ledger, recalls, and search queries.
- Applied database migrations with check constraints (`on_hand >= 0`, `reserved + quarantined <= on_hand`) and database trigger `stock_ledger_no_modify_tg` guaranteeing immutable append-only ledger entries.
- Implemented Publishing Service (`src/modules/publishing/service.ts`) enforcing the Four-Eyes workflow where creator and publisher cannot be the same staff member, mandatory verified packshot images, and complete agricultural regulatory metadata.
- Implemented Inventory Service (`src/modules/inventory/service.ts`) featuring FEFO (First-Expired, First-Out) batch allocation with row-level locks (`FOR UPDATE`), automatic safety margins, immediate batch quarantine, and emergency product recall execution.
- Implemented Catalog Search Service (`src/modules/catalog/service.ts`) with typo-tolerant PostgreSQL trigram matching (`pg_trgm`) and privacy-preserving zero-result query analytics logging.
- Delivered unit and integration tests across 9 suites (48 passing tests, 0 failures, 88.84% statement coverage, with inventory at 93.75%).
- Zero vulnerabilities, zero TypeScript errors, zero ESLint warnings, 100% Prettier compliant, and 71 files verified clean of banned words/patterns.

## Phase 1 (Foundation) (2026-10-13)

- Bootstrapped development environment with Node.js v24 LTS and PostgreSQL 17 with `pg_trgm` and `unaccent` extensions enabled.
- Pinned exact dependencies with zero security vulnerabilities (`npm audit` verified clean).
- Configured strict TypeScript (`noUncheckedIndexedAccess`, `noEmit`), flat ESLint with typescript-eslint, Prettier, and custom banned content scanner.
- Provisioned PostgreSQL dev and test databases (`furrowmark_dev`, `furrowmark_test`) with distinct `app_migrator` and least-privilege `app_runtime` roles.
- Implemented core schema and database migrations: `users`, `sessions`, `mfa_credentials`, `auth_tokens`, `login_attempts`, `audit_log`, `config_settings`, `job_runs`.
- Enforced append-only immutability for `audit_log` via PostgreSQL trigger and privilege revocation on `app_runtime`.
- Built central design tokens (`src/design/tokens.ts`) with deep green primary and neutral greys; verified WCAG 2.2 AA contrast compliance.
- Implemented OWASP ASVS Level 2/3 security headers builder with strict nonce-based CSP, HSTS preload, and denial of clickjacking and sniffing.
- Implemented Argon2id password hashing, HaveIBeenPwned k-anonymity breached password validation, AES-256-GCM field encryption, and RFC 6238 TOTP MFA.
- Implemented server-side database session manager with dual cookies (`__Host-sid` for customers and `__Host-asid` for staff), 2-hour idle timeouts, absolute timeouts, and immediate revocation.
- Implemented deny-by-default RBAC permission registry conforming to route security design.
- Created `SECURITY.md` and `docs/asvs-map.md`.
- Generated Phase 1 test and verification evidence package in `docs/evidence/phase-1/verification.txt` with 33 passing automated tests and 90.08% line coverage.

## Phase 0 - Planning and Documentation (2026-10-13)

- Added planning documents: README, architecture, database draft, routes and permissions, threat model, testing, deployment, recovery, tooling, conflicts, owner inputs, naming proposal ("Furrowmark"), decision records, verification index. No application code.
