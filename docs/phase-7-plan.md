# Phase 7 Plan: Customer Support Chatbot, Safety Controls, and Policy Guardrails

## 1. Objectives

Phase 7 implements the AI support chatbot under Section 8 ("Chatbot and Assisted Discovery") and Decision 0008 ("Chatbot uses read-only tools plus one write"):

1. **Security & Safety Guardrails (Emergency Refusal)**:
   - Poison control / emergency handling: immediate canned emergency response when chemical ingestion, pesticide exposure, spills, or poisoning are mentioned.
   - Refusal to fabricate medical advice or unregistered pesticide dosage off-label recommendations.
   - Grounded tool execution: answering questions only through verified internal tools.

2. **Read-Only Discovery Tools & Support Action (Decision 0008)**:
   - `search_catalog`: Semantic / keyword product search with category filters.
   - `get_product_details`: Verified regulatory and safety metadata (PHI days, REI hours, active ingredients, dosage rates, SDS).
   - `check_stock`: Live batch availability and unexpired stock count.
   - `get_order_status`: Order lookup requiring proof of ownership (order number + customer phone or email).
   - `get_store_policies`: Returns, shipping zones, and Meezan Bank / Easypaisa payment policy details.
   - `create_support_ticket`: The single permitted write operation (escalation to human staff).

3. **Cost, Privacy & Rate Limiting Controls**:
   - `chat_conversations` and `chat_messages`: Redacted storage with 30-day retention.
   - `chat_spend_daily`: Daily API expenditure cap in USD/cents to prevent resource exhaustion attacks.
   - Sliding-window IP and session rate limiter on chat endpoints.

4. **Storefront Interactive Widget**:
   - Customer support widget with lazy loading (loads only upon clicking the "Help & Advice" trigger button per Conflict C11).
   - Clean, accessible interface complying with WCAG 2.2 AA.

---

## 2. Database Schema Additions (`src/modules/chatbot/schema.ts`)

Tables to create:

1. `chat_conversations`: `id` (uuid), `session_token_hash` (text), `user_id` (uuid nullable), `status` (active, closed, escalated), `created_at`, `updated_at`.
2. `chat_messages`: `id` (uuid), `conversation_id` (uuid fk), `role` (user, assistant, tool, system), `content` (text), `tool_calls` (jsonb nullable), `created_at`.
3. `chat_spend_daily`: `date` (date primary key), `token_count` (integer), `estimated_cost_cents` (integer), `hard_limit_cents` (integer default 500).
4. `support_tickets`: `id` (uuid), `ticket_number` (text unique), `conversation_id` (uuid nullable), `customer_name` (text), `customer_phone` (text), `customer_email` (text), `subject` (text), `message` (text), `status` (open, in_progress, resolved), `created_at`.

---

## 3. Implementation Steps

1. **Schema & Migration**:
   - Create schema definitions in `src/modules/chatbot/schema.ts`.
   - Update `scripts/migrate.ts` and apply migrations to both `furrowmark_dev` and `furrowmark_test`.
2. **Tool Execution Engine (`src/modules/chatbot/tools.ts`)**:
   - Implement read-only tools: `searchCatalog`, `getProductDetails`, `checkStock`, `getOrderStatus`, `getStorePolicies`.
   - Implement single write tool: `createSupportTicket`.
3. **Safety & Policy Guardrails (`src/modules/chatbot/safety.ts`)**:
   - Poison control keyword detector triggering emergency protocols.
   - Refusal rules for unapproved off-label mixing.
4. **Chatbot Service Core (`src/modules/chatbot/service.ts`)**:
   - Context building, budget check against `chat_spend_daily`, mock/pluggable LLM provider adapter, tool loop execution, and conversation logging.
5. **API & Client Interface**:
   - Route handler `POST /api/chat`.
   - UI component for lazy-loaded customer assistance widget in storefront layout.
6. **Automated Test Suite**:
   - Vitest suite covering emergency safety refusal, tool invocation, proof of ownership on orders, budget caps, and ticket generation.
7. **Verification & Quality Gate**:
   - Run complete verification gate (audit, tsc, eslint, prettier, banned scan, vitest, next build).
