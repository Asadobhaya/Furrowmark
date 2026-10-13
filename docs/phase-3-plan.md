# Phase 3 Plan: Cart, Pricing, Checkout, Payments, and Orders

## 1. Objectives

Phase 3 implements the commerce transaction core under Section 5 ("Server-Side Price Calculation", "Real Data and Commerce Integrity Rules", "Verified Payment Webhooks"):

1. **Server-Side Pricing Engine (`src/modules/pricing`)**:
   - Single source of truth for all monetary arithmetic. Minor integer units (`bigint`/paisa, never floats).
   - Line price calculations, tax computation (tax-inclusive and tax-exclusive), coupons/discounts, shipping thresholds, and refund upper-bound checks.
   - Recomputation at cart view, checkout submission, and payment confirmation.
2. **Cart Management (`src/modules/cart`)**:
   - Quantity-only storage (no client prices or totals stored in cart).
   - Guest carts (token-hashed) and authenticated customer carts with automatic merge on login.
   - Availability and shelf-life re-validation against active batches.
3. **Checkout & Order State Machine (`src/modules/orders`)**:
   - Order creation with immutable snapshots of item names, prices, tax, shipping, coupon rules, and batch allocations.
   - Atomic FEFO stock reservation upon order creation.
   - Full 14-state transitions according to `docs/architecture.md` state machine diagram (`pending_payment`, `awaiting_confirmation`, `paid`, `processing`, `packed`, `shipped`, `delivered`, `cancelled`, `partially_refunded`, `refunded`).
   - Append-only order event logging.
4. **Payments & Adapters (`src/modules/payments`)**:
   - `PaymentProvider` interface: create session, verify webhook, fetch payment, refund.
   - `SafepayPaymentProvider`: Real implementation using Safepay hosted checkout and constant-time HMAC-SHA256 webhook signature verification (`X-SFPY-SIGNATURE`, `X-SFPY-TIMESTAMP` freshness check, raw buffer HMAC payload `<timestamp>.<raw_body>`).
   - `CashOnDeliveryPaymentProvider`: Transitions order to `awaiting_confirmation` without third-party redirection.
   - `BankTransferPaymentProvider`: Generates deposit instructions, transitions order to `awaiting_confirmation`, and tracks payment reference.
5. **Verified Payment Webhooks**:
   - Replay protection via idempotency table (`webhook_events` with `UNIQUE (provider, event_id)`).
   - Signature verification before reading event body.
   - Safe transition to `paid` upon verified successful payment capture.

---

## 2. Database Schema Additions (`src/modules/commerce/schema.ts`)

Tables to create:

1. `carts`: `id` (uuid), `user_id` (uuid nullable), `guest_token_hash` (text nullable), `created_at`, `updated_at`.
2. `cart_items`: `id` (uuid), `cart_id` (uuid fk), `variant_id` (uuid fk), `quantity` (integer check > 0), `created_at`, `updated_at`. Unique on `(cart_id, variant_id)`.
3. `tax_rates`: `id` (uuid), `code` (text), `rate_bp` (integer basis points, e.g. 1800 for 18%), `inclusive` (boolean), `created_at`, `updated_at`.
4. `shipping_zones`: `id` (uuid), `name` (text), `region_code` (text), `base_fee_minor` (bigint), `free_threshold_minor` (bigint nullable).
5. `coupons`: `id` (uuid), `code` (text unique), `discount_type` (fixed_minor or percentage_bp), `discount_value` (bigint), `min_subtotal_minor` (bigint), `usage_limit` (integer nullable), `times_used` (integer default 0), `valid_from` (timestamptz), `valid_until` (timestamptz), `active` (boolean).
6. `orders`: `id` (uuid), `public_ref` (text unique), `user_id` (uuid nullable), `customer_email` (text), `customer_phone` (text), `shipping_address` (jsonb), `billing_address` (jsonb), `state` (text enum), `payment_method` (safepay, cod, bank_transfer), `currency` (text default 'PKR'), `subtotal_minor` (bigint), `discount_minor` (bigint), `tax_minor` (bigint), `shipping_minor` (bigint), `total_minor` (bigint), `pricing_snapshot` (jsonb), `created_at`, `updated_at`.
7. `order_lines`: `id` (uuid), `order_id` (uuid fk), `variant_id` (uuid fk), `product_name_snapshot` (text), `variant_sku_snapshot` (text), `unit_price_minor` (bigint), `quantity` (integer), `tax_minor` (bigint), `total_minor` (bigint).
8. `order_line_allocations`: `id` (uuid), `order_line_id` (uuid fk), `batch_id` (uuid fk), `quantity` (integer).
9. `order_events`: `id` (uuid), `order_id` (uuid fk), `from_state` (text nullable), `to_state` (text), `actor_id` (uuid nullable), `actor_type` (customer, staff, system, gateway), `reason` (text nullable), `created_at` (timestamptz). Append-only with trigger protection.
10. `payments`: `id` (uuid), `order_id` (uuid fk), `provider` (text), `provider_reference` (text nullable), `amount_minor` (bigint), `currency` (text), `status` (pending, completed, failed, refunded), `created_at`, `updated_at`.
11. `webhook_events`: `id` (uuid), `provider` (text), `event_id` (text), `event_type` (text), `payload_hash` (text), `processed_at` (timestamptz), `outcome` (text). Unique on `(provider, event_id)`.
12. `refunds`: `id` (uuid), `payment_id` (uuid fk), `order_id` (uuid fk), `amount_minor` (bigint), `reason` (text), `provider_refund_id` (text nullable), `created_at`.

---

## 3. Implementation Steps

1. **Schema & Migration**:
   - Add `src/modules/commerce/schema.ts` defining all commerce tables with strict types and Drizzle schemas.
   - Update `scripts/migrate.ts` to apply commerce tables and append-only trigger on `order_events`.
   - Run migrations against test and dev databases.
2. **Pricing Engine (`src/modules/pricing/service.ts`)**:
   - `calculateLineTotal(unitPriceMinor, quantity)`
   - `applyDiscounts(subtotalMinor, coupon)`
   - `calculateTax(taxableMinor, rateBp, inclusive)`
   - `quoteOrderTotals(params)`: full calculation producing immutable pricing breakdown.
   - Write comprehensive unit tests in `src/modules/pricing/service.test.ts`.
3. **Cart Service (`src/modules/cart/service.ts`)**:
   - Create guest cart, add item, update quantity, remove item, merge guest cart into user cart.
   - Validate items against batch availability and shelf life.
   - Unit and integration tests in `src/modules/cart/service.test.ts`.
4. **Order Service & State Machine (`src/modules/orders/service.ts`)**:
   - `createOrderFromCart`: Quote totals, atomic FEFO batch reservation, write order, lines, allocations, and initial order event.
   - `transitionOrderState`: Strict transition table checking allowed source/target states. Appends to `order_events`.
   - Comprehensive state transition tests in `src/modules/orders/service.test.ts` testing every state pair in the matrix.
5. **Payment Adapters & Webhook Verification (`src/modules/payments/`)**:
   - `interface PaymentProvider`: `createCheckoutSession`, `verifyWebhook`, `fetchPaymentStatus`, `processRefund`.
   - `SafepayPaymentProvider`: Official HMAC-SHA256 signature verification with timestamp tolerance and raw payload hash.
   - `CashOnDeliveryPaymentProvider` & `BankTransferPaymentProvider`.
   - `WebhookService`: Idempotent processing using `webhook_events` table; transitions order to `paid` upon verified event.
   - Tests in `src/modules/payments/service.test.ts`.

---

## 4. Verification Criteria

1. Zero vulnerabilities (`npm audit`).
2. Strict TypeScript compiles without errors (`tsc --noEmit`).
3. Zero ESLint errors or warnings (`eslint .`).
4. Prettier code formatting 100% compliant (`prettier --check .`).
5. Zero banned words, emojis, em/en-dashes, or gradients (`scan-banned-content.ts`).
6. All automated tests pass (100% pass rate).
7. Critical coverage targets met: Pricing module >= 95%, Order state machine >= 95%, Payments module >= 90%, overall >= 85%.
8. Evidence saved in `docs/evidence/phase-3/verification.txt`.
