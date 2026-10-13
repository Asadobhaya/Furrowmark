# Phase 6 Plan: Fulfilment, Returns (RMA), Operations & Reporting

## 1. Objectives

Phase 6 implements the order fulfillment lifecycle, returns management (RMA), warehouse operations, and operational reporting under Section 6 ("Fulfillment and Returns") and Section 10 ("Operational Reporting"):

1. **Fulfilment & Split Shipments (`src/modules/fulfilment`)**:
   - Agrochemical vs non-agrochemical safety parcel splitting (preventing hazardous agricultural chemicals from contaminating seeds/fertilizer or violating transport regulations).
   - Order packing workflow (`processing` -> `packed`).
   - Carrier handover and shipment creation (`packed` -> `shipped`) with courier name, tracking reference, and tracking URL.
   - Carrier delivery events (`shipped` -> `delivered`, `out_for_delivery`, `delivery_failed`).
   - COD cash collection tracking (`cod_collections` and courier remittance reconciliation).

2. **Returns & RMA Workflow (`src/modules/returns`)**:
   - Strict return policy enforcement: sealed items returnable within 7 days of delivery; opened agrochemical bottles/cans or unsealed seed bags strictly non-returnable.
   - Return state machine: `requested` -> `approved` / `rejected` -> `awaiting_item` -> `received` -> `inspected` -> (`refund` / `replacement` / `store_credit` / `closed_no_action`).
   - Returned stock quarantined in `batches` under original lot number via append-only `stock_ledger` movement.
   - Store credit ledger (`store_credit_ledger`) for store credit resolutions.

3. **Operational Reporting & Auditing (`src/modules/reporting`)**:
   - Stock and batch expiry risk report: identifies batches near expiry (30/60/90 days) and quarantined stock.
   - Pesticide regulatory sales register: audit log of all pesticide purchases (date, buyer name, phone, CNIC/licence if provided, registration number, batch/lot number, quantity).
   - Sales, tax, and revenue ledger report in integer minor units (paisa).
   - Audit trail and export logger (`report_exports`).

4. **Staff UI Portals**:
   - Warehouse dispatch & fulfillment console (`/staff/fulfilment`).
   - RMA inspections and return approvals console (`/staff/returns`).
   - Executive operations & compliance reporting dashboard (`/staff/reports`).

---

## 2. Database Schema Additions (`src/modules/fulfilment/schema.ts`, `src/modules/returns/schema.ts`, `src/modules/reporting/schema.ts`)

Tables to create:

1. `shipments`: `id` (uuid), `order_id` (uuid), `shipment_number` (text), `carrier_name` (text), `tracking_number` (text), `tracking_url` (text), `status` (pending, packed, handed_to_carrier, in_transit, out_for_delivery, delivered, delivery_failed, returned_to_sender), `shipped_at`, `delivered_at`, `created_at`.
2. `shipment_items`: `id` (uuid), `shipment_id` (uuid fk), `order_line_id` (uuid fk), `quantity` (integer).
3. `shipment_events`: `id` (uuid), `shipment_id` (uuid fk), `status` (text), `location` (text nullable), `details` (text nullable), `created_at`.
4. `cod_collections`: `id` (uuid), `order_id` (uuid), `amount_due_minor` (bigint), `amount_collected_minor` (bigint), `status` (pending, collected, remitted), `collected_at`, `remitted_at`.
5. `return_requests`: `id` (uuid), `order_id` (uuid), `rma_number` (text unique), `customer_id` (uuid nullable), `reason` (text), `status` (requested, approved, rejected, awaiting_item, received, inspected, closed), `resolution` (refund, replacement, store_credit, closed_no_action), `created_at`, `updated_at`.
6. `return_lines`: `id` (uuid), `return_request_id` (uuid fk), `order_line_id` (uuid fk), `quantity` (integer), `condition` (sealed, opened, damaged), `restockable` (boolean).
7. `store_credit_ledger`: `id` (uuid), `user_id` (uuid), `amount_minor` (bigint), `balance_after_minor` (bigint), `reason` (text), `created_at`. Append-only with trigger protection.
8. `report_exports`: `id` (uuid), `staff_id` (uuid), `report_type` (text), `parameters` (jsonb), `created_at`.

---

## 3. Implementation Steps

1. **Schema & Migration**:
   - Create schema files with Drizzle ORM definitions.
   - Update `scripts/migrate.ts` and run against `furrowmark_dev` and `furrowmark_test`.
   - Add database trigger to prevent `UPDATE`/`DELETE` on `store_credit_ledger`.
2. **Fulfilment Service (`src/modules/fulfilment/service.ts`)**:
   - `createShipments(orderId)`: Inspects product categories on order lines. Automatically groups agrochemical lines into hazardous transport parcels and seed/fertilizer lines into general parcels.
   - `packShipment(shipmentId)`
   - `dispatchShipment(shipmentId, carrier, trackingNumber)`: Transitions order to `shipped` and fires `order_dispatched` notification.
   - `deliverShipment(shipmentId)`: Transitions order to `delivered`.
   - `recordCodCollection(orderId, amountCollectedMinor)`
3. **Returns Service (`src/modules/returns/service.ts`)**:
   - `requestReturn(orderId, items, reason)`: Validates delivery date <= 7 days and condition. Rejects opened agrochemicals per Section 6 policy.
   - `approveReturn(returnId, staffId)` / `rejectReturn(returnId, reason, staffId)`
   - `inspectReturn(returnId, outcomes, staffId)`: Routes restockable goods into quarantined batches under their original batch ID.
4. **Reporting Service (`src/modules/reporting/service.ts`)**:
   - `getBatchExpiryReport()`
   - `getPesticideRegulatoryRegister(startDate, endDate)`
   - `getRevenueSummary(startDate, endDate)`
5. **Staff UI Pages**:
   - `/staff/fulfilment`: List processing/packed orders, generate shipment packages, assign tracking numbers, mark dispatched/delivered.
   - `/staff/returns`: Process pending RMA requests, conduct inspection checklists, record restock/credit resolution.
   - `/staff/reports`: Visual dashboard + download tables for compliance, inventory aging, and financial ledgers.
6. **Automated Test Suite**:
   - Full vitest coverage for parcel splitting, RMA validation, quarantine restock, and reporting aggregation.
7. **Verification & Quality Gate**:
   - Zero audit vulnerabilities, zero TypeScript errors, zero lint warnings, Prettier clean, banned-content scan clean, Next.js build clean.
