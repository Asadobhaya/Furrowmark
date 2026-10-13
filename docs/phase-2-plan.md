# Phase 2 Plan: Catalog, Publishing Rules, and Inventory

Status: PLAN. Implementation starts after plan review.

## 1. Scope (from section 17)

Products, variants, documents, versioned safety fields, four-eyes publishing gate, batches, stock ledger, expiry checks, search (trigram + full-text), listing and product pages data models/services, and admin product management.

## 2. Work Breakdown

1. **Schema & Database Migrations**:
   - `categories`, `brands`, `manufacturers`, `crops`, `targets`, `active_ingredients`
   - `products`, `variants`, `price_history`
   - `safety_versions`, `product_documents`, `product_images`
   - Class-specific tables: `seed_details`, `fertiliser_details`, `pesticide_details`
   - Join tables: `product_crops`, `product_targets`, `product_ingredients`
   - `suppliers`, `batches`, `stock_ledger`, `reservations`, `recalls`, `recall_batches`
   - Check constraints: `on_hand >= 0`, `reserved >= 0`, `quarantined >= 0`, `reserved + quarantined <= on_hand`
   - Append-only immutability trigger for `stock_ledger` and privilege revocation from `app_runtime`
   - PostgreSQL trigram (`pg_trgm`) index on product names/brands and tsvector index on search fields

2. **Publishing Gate (Four-Eyes Rule & Versioning)**:
   - Server-enforced validation for product classes:
     - Pesticides: complete label text, label PDF, SDS PDF, registration/approval number, active ingredient and concentration, formulation, hazard class and signal word, label crops and targets, application rate and method, pre-harvest interval, re-entry interval, storage and handling, first aid, restricted-use flag, and verified real image.
     - Fertilisers: nutrient analysis, net weight, manufacturer, registration number, handling/storage, real image.
     - Seeds: variety, lot number, germination percentage, purity, test date, expiry, treatment status (warning for treated seed), recommended season/region, real image.
   - Four-eyes rule: the user who approves/publishes a product must differ from the author (`published_by != authored_by`).
   - Safety fields versioning: any edit creates a new version requiring independent approval; current approved version remains active. Old versions are immutable.

3. **Inventory, Batches, and Append-Only Stock Ledger**:
   - Batch tracking: lot number, supplier, manufacture date, expiry date, received, on hand, reserved, quarantined, status (`available`, `quarantined`, `expired`, `recalled`, `written_off`).
   - FEFO (First-Expiry-First-Out) allocation algorithm: only unexpired batches exceeding minimum delivery shelf life are eligible.
   - Row-level locking with concurrency control (`SELECT ... FOR UPDATE`) to guarantee no overselling on concurrent checkout for the last unit.
   - Batch status state machine transitions: quarantined -> available, available -> expired (nightly job logic), available -> recalled (admin immediate block).
   - Stock ledger movement logging: receipt, reservation, release, shipment, return, quarantine, adjustment, write-off.

4. **Search and Catalog Services**:
   - Full-text search with trigram fuzzy matching for typo tolerance (`pg_trgm`).
   - Catalog filtering service: category, crop, target pest/weed, active ingredient, brand, pack size, price range, availability.
   - Record zero-result queries without personal data for catalog demand analysis.

5. **Automated Verification & Tests**:
   - Concurrency stress test: parallel simultaneous allocations for the last unit of stock to prove 0 overselling.
   - Publishing gate rejection tests: missing label text, missing SDS PDF, missing hazard class, self-approval attempt (four-eyes violation), safety field update creating unapproved version.
   - Stock ledger immutability test: database rejects UPDATE or DELETE on `stock_ledger`.
   - FEFO allocation test: selects earliest expiring eligible batch; ignores expired or shelf-life-violating batches.
   - Recall workflow test: marking batch as recalled immediately halts eligibility in allocation.
   - Search test: exact match, typo-tolerant match, crop and pest match, zero-result recording.

## 3. Exit Criteria

- Unit & integration tests pass with $\ge 90\%$ line and branch coverage on inventory and publishing modules.
- Zero TypeScript, ESLint, Prettier, or banned content scanner errors.
- Database check constraints and triggers verified against tampered ledger operations.
- Evidence saved under `docs/evidence/phase-2/verification.txt`.
- Admin guide updated in `docs/admin-guide.md` covering product publishing, versioning, and inventory batches.
