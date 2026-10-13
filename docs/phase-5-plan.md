# Phase 5 Plan: Notifications Engine, Multichannel Adapters, and Dispatch Queue

## 1. Objectives

Phase 5 implements the customer communication and event-driven notifications infrastructure specified in `docs/architecture.md` (Sections 1, 3, 5, 6) and `docs/database.md`:

1. **Multichannel Notification Adapters (`src/modules/notifications/adapters/`)**:
   - `NotificationChannel`: `email`, `sms`, `whatsapp`.
   - `NotificationProvider` interface: `send(message: OutgoingMessage): Promise<SendResult>`.
   - Implementations:
     - `EmailProvider` (e.g. SMTP/Console mock adapter for test/staging).
     - `SmsProvider` (telecom SMS API adapter with test mock).
     - `WhatsAppProvider` (WhatsApp Business Cloud API adapter with test mock).
2. **Notification Service Core (`src/modules/notifications/service.ts`)**:
   - Channel routing and recipient resolution.
   - Message templates (Order created, Advance payment instructions, Payment confirmed, Order dispatched, Order delivered, Order cancelled).
   - Quiet hours respect and suppression list checking (bounces, unsubscribes).
   - Delivery logging into `message_log` table.
3. **Queue-Backed Dispatch System**:
   - Schema additions in `src/modules/notifications/schema.ts` (`notification_preferences`, `suppressions`, `message_templates`, `message_log`, `queue_jobs`).
   - Transactional dispatch queue: Messages are enqueued atomically alongside order events and processed by the worker.
4. **Order State Machine Integration**:
   - Wire notifications into state transitions:
     - `pending_payment` -> sends advance payment instructions with Meezan Bank & Easypaisa account numbers.
     - `paid` -> sends payment received confirmation.
     - `processing` / `shipped` -> sends dispatch update.
5. **Testing & Verification**:
   - 100% test coverage for notification service, queue processing, and template rendering.
   - Zero violations on banned patterns, linting, and formatting.
