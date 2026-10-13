# Phase 3 Report: Cart, Server-Side Pricing, Payments, and Orders

## 1. Summary of Changes

Phase 3 implemented the full commerce execution lifecycle: persistent cart sessions (guest and authenticated), server-side pricing engine in minor integer units (paisa), payment gateway adapters and webhook ingestion for Pakistan (Safepay, Cash on Delivery, Bank Transfer), an atomic 14-state order machine with First-Expired, First-Out (FEFO) inventory reservation, and a verifiable refund calculation engine.

Key components delivered:

1. **Commerce Domain Schema and Migrations (`src/modules/commerce/schema.ts`)**:
   - Tables added: `carts`, `cart_items`, `tax_rates`, `shipping_zones`, `coupons`, `orders`, `order_lines`, `order_line_allocations`, `order_events`, `payments`, `webhook_events`, and `refunds`.
   - Immutable audit trigger: `trg_order_events_immutable` preventing modifications or deletions to `order_events`.
   - Foreign key integrity and unique constraints preventing duplicate active carts per customer or duplicate coupon redemptions.

2. **Server-Side Pricing Engine (`src/modules/pricing/service.ts`)**:
   - Zero floating point arithmetic: all values represented in integer minor units (`bigint`/paisa).
   - Tax engine supporting both tax-inclusive and tax-exclusive calculation with regional rates.
   - Coupon discounts supporting fixed amounts and basis points (`percentage_bp`), validating minimum spend thresholds and maximum discount caps.
   - Flat rate shipping with configurable free-delivery thresholds.
   - Refund validation: mathematical upper-bound enforcement ensuring total refunded amount cannot exceed amount paid minus earlier refunds.

3. **Cart Service (`src/modules/cart/service.ts`)**:
   - Full support for anonymous guest carts via secure session tokens.
   - Cart merging upon customer login, consolidating quantities while checking live batch availability.
   - Real-time stock availability verification preventing checkout of quarantined, expired, or out-of-stock inventory.
   - Server-side quote generation computing up-to-date itemized breakdowns.

4. **Order Service and 14-State Transition Engine (`src/modules/orders/service.ts`)**:
   - Atomic order creation from cart within a PostgreSQL transaction (`SELECT ... FOR UPDATE` row locks).
   - FEFO batch reservation linking allocated quantities directly to `order_line_allocations`.
   - Frozen immutable quote and price snapshots stored on `orders` and `order_lines`.
   - 14-state lifecycle machine (`pending_payment`, `awaiting_confirmation`, `paid`, `processing`, `packed`, `shipped`, `delivered`, `cancelled`, `partially_refunded`, `refunded`, etc.).
   - Automated stock reservation release back to batch `on_hand` upon order cancellation.

5. **Payment Gateway Adapters and Webhooks (`src/modules/payments/service.ts`)**:
   - Standardized `PaymentProvider` interface.
   - Safepay adapter: HMAC-SHA256 signature verification using `crypto.timingSafeEqual`, 5-minute timestamp freshness window to prevent replay attacks.
   - Cash on Delivery (COD) adapter: immediate order placement with pending payment status.
   - Bank Transfer adapter: manual verification workflow with reference numbers and payment instruction generator.
   - Idempotent webhook processing: deduplication via `webhook_events` table and atomic transition of orders to `paid`.
   - Multi-tier refund execution: partial and full refunds updating order status to `partially_refunded` or `refunded`.

6. **Documentation and Operational Guides**:
   - Updated `docs/admin-guide.md` with Section 4 covering the order state machine, payment gateway operations, webhook troubleshooting, and refund procedures.
   - Updated `CHANGELOG.md` with the complete Phase 3 changelog.
   - Updated `VERIFICATION.md` with the Phase 3 verification index.

---

## 2. Verification and Test Results

All verification checks were run against `furrowmark_test` and verified passing with zero warnings or errors. Evidence is stored in `docs/evidence/phase-3/verification.txt`:

1. **Dependency Security Scan**:
   - `npm audit`: 0 vulnerabilities.
2. **TypeScript Strict Type Check**:
   - `tsc --noEmit`: 0 errors.
3. **ESLint Static Analysis**:
   - `eslint .`: 0 errors, 0 warnings.
4. **Prettier Formatting**:
   - `prettier --check .`: 100% matched code style.
5. **Content and Vocabulary Scanner**:
   - `scripts/scan-banned-content.ts`: 93 repository files verified clean of banned marketing words, em/en dashes, emojis, and styling gradients.
6. **Automated Test Suite**:
   - 13 test suites, 71 passing tests, 0 failures.
   - Overall statement coverage: 86.13% (target >= 85%).
   - Orders module statement coverage: 90.76% (target >= 85%).
   - Payments module statement coverage: 88.42% (target >= 85%).
   - Pricing module statement coverage: 88.75% (target >= 85%).
   - Inventory module line coverage: 90.00%.
   - Catalog service statement coverage: 93.33%.
   - Auth crypto statement coverage: 95.74%.
   - Design tokens: 100% (WCAG 2.2 AA contrast verified).

---

## 3. Owner Inputs Required (Unresolved Business Facts)

Under Operating Rule 4, no business facts, credentials, or bank details were fabricated. The following configuration items require store owner values prior to production deployment:

1. **Safepay Production Credentials**:
   - `SAFEPAY_API_KEY`: Production merchant API key.
   - `SAFEPAY_WEBHOOK_SECRET`: Production webhook shared secret for HMAC-SHA256 signature verification.
   - `SAFEPAY_ENVIRONMENT`: Set to `production` (currently configured for `sandbox`).
2. **Official Bank Transfer Account Details**:
   - Bank Name: e.g. Meezan Bank Limited.
   - Account Title: Store legal entity name.
   - Account IBAN: 24-character Pakistani IBAN.
   - Branch Code: Branch identification code for customer wire instructions.
3. **Shipping Rates and Carrier Thresholds**:
   - Provincial flat rate fees (Punjab, Sindh, Khyber Pakhtunkhwa, Balochistan, Islamabad).
   - Free shipping qualification threshold (e.g. orders over PKR 15,000).
4. **Sales Tax Registration Numbers**:
   - Federal Board of Revenue (FBR) National Tax Number (NTN) and Sales Tax Registration Number (STRN).
   - Provincial revenue authority registration numbers (PRA / SRB) to print on customer tax invoices.

---

## 4. Next Phase Readiness

Phase 3 is fully implemented, verified, and clean. Ready to proceed to **Phase 4: Customer Storefront, Product Detail Page, Cart and Checkout UI** upon approval.
