# Staff Admin Guide

This guide describes operational workflows for managing catalog publishing, safety compliance, inventory batches, and product recalls in Furrowmark.

## 1. Product Publishing (Four-Eyes Workflow)

Under Section 6 requirements, no single staff member can create and publish an agricultural product alone. Every product requires two distinct staff members:

1. **Authoring (Drafting)**:
   - A staff member with `catalog:write` creates the product draft.
   - The draft specifies brand, category, title, description, and at least one variant.
   - The draft must attach at least one genuine packshot image (`is_packshot: true`). Generic stock imagery or placeholder images are rejected.
   - Depending on the product category, regulatory metadata must be provided:
     - **Pesticides**: Registration number, active ingredient, concentration, formulation, WHO toxicity class, pre-harvest interval (PHI) in days, re-entry interval (REI) in hours, and approved target crops.
     - **Seeds**: Germination rate percentage, physical purity percentage, moisture percentage, lot number, test date, and certification class.
     - **Fertilisers**: Nitrogen percentage, phosphorus percentage, potassium percentage (NPK ratio), form (granular, liquid, powder), and application method.
   - Safety information: Safety data sheet (SDS) URL or file, signal word (Caution, Warning, Danger), and hazard statements.

2. **Approval and Publishing**:
   - A second staff member with `catalog:publish` reviews the product draft.
   - The publishing system verifies that the reviewer's user ID differs from the creator's user ID (`creator_id !== publisher_id`). If the same user attempts to publish, the request is rejected with `CANNOT_SELF_PUBLISH`.
   - The publishing system verifies that all category validation checks and required packshots are satisfied.
   - Once published, the product status becomes `published` and is visible in customer catalog search.

## 2. Inventory and Batch Management (FEFO)

Agricultural inputs degrade over time and must be handled with strict batch controls:

1. **Batch Intake**:
   - Every received shipment is logged under a supplier batch with manufacturing date, expiry date, initial quantity, cost price, and storage location.
   - Batches cannot be sold past their expiration date. Batches within their configured safety margin (for example, 30 days before expiry) are excluded from standard allocation.

2. **First-Expired, First-Out (FEFO) Allocation**:
   - When orders are placed, the inventory service queries available batches ordered by `expiry_date ASC`.
   - Allocation uses PostgreSQL row-level locks (`SELECT ... FOR UPDATE`) inside an isolated transaction to prevent overselling or race conditions.
   - Reserved stock counts are updated immediately on the matching batches.
   - Every stock movement (intake, allocation reservation, release, quarantine, adjustment) is recorded in the append-only `stock_ledger`.

3. **Append-Only Stock Ledger**:
   - Database triggers prevent any `UPDATE` or `DELETE` operations on `stock_ledger`.
   - Adjustments and corrections are made via new compensating ledger entries with an explicit reason.

## 3. Quarantines and Emergency Product Recalls

When a manufacturer issues a recall or regulatory authorities flag a pesticide or seed batch:

1. **Batch Quarantine**:
   - Authorized staff (`inventory:quarantine`) can instantly quarantine a batch or multiple batches.
   - Quarantined batches cannot be allocated to new orders.

2. **Emergency Recall**:
   - Staff with `inventory:recall` initiate an emergency recall specifying the product ID, batch IDs, recall reason, and issuing authority.
   - The service automatically:
     - Sets the product status to `archived` or unpublishes it so no new purchases occur.
     - Places all associated batches into quarantine.
     - Cancels active pending reservations and restores available quantities.
     - Records the recall record in `recalls` for compliance auditing.
     - Emits audit log entries detailing the recalled batches.

## 4. Orders, Payments, Webhooks, and Refunds

### 4.1 Order State Machine (14 States)

Orders progress through a strict, deterministic 14-state machine:

- `pending_payment`: Initial state for digital gateway orders (e.g. Safepay). Batch inventory is reserved under FEFO.
- `awaiting_confirmation`: Initial state for manual methods (Cash on Delivery, Bank Transfer).
- `paid`: Triggered automatically upon receiving a cryptographically verified gateway webhook or staff confirmation.
- `processing`: Warehouse is preparing the order lines.
- `packed`: Order has been packed into dispatch parcel. Customer self-cancellation is disallowed past this point.
- `shipped`: Handed over to courier with tracking reference.
- `delivered`: Courier confirms physical receipt by farmer.
- `cancelled`: Can be cancelled by customer before packing, or by staff at any stage before dispatch. Automatically releases reserved stock back to the batches in the stock ledger.
- `partially_refunded`: Issued when a portion of order value is returned (for example, return of 1 bag from a 4-bag order).
- `refunded`: Order is 100% refunded.

Every transition writes an immutable event into `order_events` guarded by the database trigger `trg_order_events_immutable`.

### 4.2 Payment Verification and Webhook Ingestion

1. **Safepay Gateway**:
   - Inbound webhook requests arrive at `/api/webhooks/safepay`.
   - The handler extracts headers `x-sfpy-signature` and `x-sfpy-timestamp`.
   - Replay protection: Rejects requests where timestamp age exceeds 5 minutes (300,000 ms).
   - Cryptographic verification: Calculates HMAC-SHA256 over `${timestamp}.${rawBody}` using the secret key. Verification is evaluated using constant-time comparison to prevent timing side-channel attacks.
   - Idempotency: Webhook events are deduplicated in `webhook_events` by `(provider, event_id)`. Replays return HTTP 200 without duplicate state transitions or double-charging.

2. **Cash on Delivery (COD)**:
   - Starts in `awaiting_confirmation`. Dispatch is verified by staff telephone confirmation. Payment is marked `completed` upon driver collection confirmation.

3. **Bank Transfer**:
   - Customer deposits funds into company bank account (Meezan Bank Ltd). Staff inspect bank statement, match reference, and transition order to `paid`.

### 4.3 Refund Operations

1. **Refund Upper-Bound Validation**:
   - Server-side validation enforces that cumulative refunds (`priorRefunds + requestedRefund`) can never exceed the total amount paid.
   - Floating-point arithmetic is strictly prohibited; minor integer units (paisa) are used exclusively.
2. **Refund Execution**:
   - Staff with `orders:refund` issue the refund request with an explicit business reason.
   - For digital payments, the payment provider adapter dispatches a refund request to Safepay.
   - The refund record is inserted into `refunds`.
   - The order state automatically transitions to `partially_refunded` or `refunded`.
