# Phase 7 Report: Customer Support Chatbot, Safety Controls & Policy Guardrails

**Status:** Completed
**Date:** 2026-10-13
**Evidence Artifact:** [verification.txt](file:///mnt/c/Users/Malik%20Bahawal%20Shair/Desktop/Agricultural%20Buissness/docs/evidence/phase-7/verification.txt)

---

## 1. Executive Summary

Phase 7 delivered the AI customer assistance subsystem under Section 8 and Decision 0008. The system strictly guards against prompt injection, off-label pesticide recommendations, and hazardous misinformation by grounding all responses in read-only tools and a dedicated support ticket write tool.

Critically, the chatbot implements an immediate emergency poison-control interception mechanism: queries mentioning chemical ingestion, eye contact, spray inhalation, or pesticide poisoning bypass standard conversational processing and deliver actionable first aid guidance alongside emergency helplines:

- Rescue 1122 (Pakistan National Emergency Helpline)
- JPMC Karachi National Poison Control Centre (`021-99205058`)
- AFIP Rawalpindi (`051-9270682`)

---

## 2. Key Deliverables & Implementation Summary

### A. Database Schemas (`src/modules/chatbot/schema.ts`)

1. `chat_conversations`: Session tracking, anonymous user token hashes, and lifecycle state (`active`, `closed`, `escalated`).
2. `chat_messages`: Turn-by-turn conversational history with role and tool execution tracking.
3. `chat_spend_daily`: Daily API expenditure cap in USD/cents with automated enforcement.
4. `support_tickets`: Human escalation ticket generation with collision-resistant references (`TICK-2026-XXXXXX`).

### B. Safety & Guardrails (`src/modules/chatbot/safety.ts`)

- `checkEmergencyInput`: Pattern matching engine identifying chemical exposure emergencies and delivering immediate first-aid advice.
- `sanitizeChatText`: Automated PII and credential sanitization (redacting CNIC patterns and credit card numbers).

### C. Grounded Tool Execution (`src/modules/chatbot/tools.ts`)

In accordance with Decision 0008, all knowledge retrieval uses isolated internal tools:

- `searchCatalog`: Verified published product search.
- `getProductDetails`: Pack size, active ingredient, and safety sheet lookup.
- `checkStock`: Live unexpired available batch inventory inquiry.
- `getOrderStatus`: Enforces strict **proof of ownership** (order reference + matching customer phone number or email address).
- `getPaymentsPolicy` / `getReturnsPolicy` / `getShippingPolicy`: Dynamically surface Meezan Bank (`03130115156301`), Easypaisa (`03004634494`), and opened chemical non-returnability rules.
- `createSupportTicket`: The single allowed write operation connecting farmers with staff.

### D. Storefront UI Component (`src/app/components/ChatWidget.tsx`)

- Lazy-loaded floating assistant trigger button ("Ask Furrowmark Assistant") mounted in `RootLayout`.
- Preserves Core Web Vitals and Lighthouse 90+ score by initializing conversation interface only upon user interaction (Conflict C11).
- Connected to streaming-ready backend handler at `/api/chat`.

---

## 3. Verification & Quality Gates

All seven verification gates executed and passed with zero errors:

| Check                      | Tool / Command                   | Result                                                  |
| -------------------------- | -------------------------------- | ------------------------------------------------------- |
| Dependency Vulnerabilities | `npm audit`                      | 0 vulnerabilities                                       |
| Static Typing              | `tsc --noEmit`                   | Clean (0 errors)                                        |
| Linting                    | `eslint .`                       | Clean (0 warnings or errors)                            |
| Formatting                 | `prettier --check .`             | 100% matched code style                                 |
| Content Hygiene            | `scripts/scan-banned-content.ts` | Clean: 157 files verified against banned patterns/words |
| Unit & Integration Tests   | `vitest run`                     | 17 test files passed, 92/92 tests passed (100%)         |
| Production Build           | `next build`                     | Optimized production build generated successfully       |

---

## 4. Payment & Security Integrity Confirmation

- Maintained manual payment verification model for Meezan Bank (`03130115156301`) and Easypaisa (`03004634494`) under account title `Muhammad Asad`.
- Daily token limit and hard financial cap enforced via `chat_spend_daily`.
- Proof of ownership validated for order lookups.
