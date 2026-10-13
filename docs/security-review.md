# Senior Security Engineering Audit & Hardening Report

## Executive Summary

This document reports on the comprehensive security review, vulnerability assessment, and hardening pass executed for Furrowmark in accordance with OWASP ASVS Level 2 guidelines and production-grade security standards.

---

## 1. Authentication System Hardening

- **Secure Password Hashing:** All user and staff passwords continue to be hashed using Argon2id with memory cost of 64MB, 3 iterations, and 4 degrees of parallelism in [src/modules/auth/crypto.ts](file:///mnt/c/Users/Malik%20Bahawal%20Shair/Desktop/Agricultural%20Buissness/src/modules/auth/crypto.ts).
- **Breached Password Screening:** Customer registration automatically verifies new passwords against HaveIBeenPwned's 5-character SHA-1 k-anonymity API in [src/modules/auth/crypto.ts](file:///mnt/c/Users/Malik%20Bahawal%20Shair/Desktop/Agricultural%20Buissness/src/modules/auth/crypto.ts), rejecting compromised credentials.
- **Session Management & Expiration:** Server-side sessions stored in PostgreSQL in [src/modules/auth/session.ts](file:///mnt/c/Users/Malik%20Bahawal%20Shair/Desktop/Agricultural%20Buissness/src/modules/auth/session.ts) enforce:
  - Strict 2-hour idle timeout.
  - Absolute timeout: 14 days for customers, 12 hours for staff.
  - Token hashing: Raw session tokens are never stored; only their SHA-256 digests (`id_hash`) are persisted.
  - HttpOnly, SameSite=Lax, Secure `__Host-` cookies.
- **Token Service Implementation:** Implemented [src/modules/auth/tokens.ts](file:///mnt/c/Users/Malik%20Bahawal%20Shair/Desktop/Agricultural%20Buissness/src/modules/auth/tokens.ts) for email verification and password reset tokens:
  - Cryptographically generated using 32 random bytes (64-character hex strings).
  - Single-use atomic invalidation (`usedAt`) with database transactions.
  - Strict TTLs: 15 minutes for password resets, 24 hours for email verification, 1 hour for staff bootstrap.
  - Raw tokens are never stored in the database; only SHA-256 digests (`token_hash`) are persisted.

---

## 2. API & Database Authorization (IDOR Defense)

- **Order Details Inspection:** In [src/app/orders/[id]/page.tsx](file:///mnt/c/Users/Malik%20Bahawal%20Shair/Desktop/Agricultural%20Buissness/src/app/orders/%5Bid%5D/page.tsx), requests strictly verify that `order.userId === session.userId`. Any request attempting to inspect an order belonging to another customer triggers a 404 Not Found response.
- **RMA & Return Requests:** Hardened [src/modules/returns/service.ts](file:///mnt/c/Users/Malik%20Bahawal%20Shair/Desktop/Agricultural%20Buissness/src/modules/returns/service.ts) to verify that `order.userId === params.customerId` before generating return authorizations or inspecting line items.
- **Cart Access & Scoping:** Scoped to the authenticated user ID (`carts.user_id`) or secure HMAC guest cart cookie (`carts.guest_token_hash`) via [src/modules/web/session.ts](file:///mnt/c/Users/Malik%20Bahawal%20Shair/Desktop/Agricultural%20Buissness/src/modules/web/session.ts). No client-provided cart ID can mutate or inspect an arbitrary customer's cart.
- **Staff RBAC Enforcements:** All administrative and staff mutations in [src/app/actions.ts](file:///mnt/c/Users/Malik%20Bahawal%20Shair/Desktop/Agricultural%20Buissness/src/app/actions.ts) (`confirmPaymentAction`, `acceptCodOrderAction`, `dispatchShipmentAction`, `resolveReturnAction`) require explicit staff sessions and granular role permissions (`orders:process`).

---

## 3. Abuse Protection & Rate Limiting

- **Login Brute-Force Throttling:** Sliding-window rate limiter in [src/modules/auth/ratelimit.ts](file:///mnt/c/Users/Malik%20Bahawal%20Shair/Desktop/Agricultural%20Buissness/src/modules/auth/ratelimit.ts) enforces a limit of 5 failed attempts per 15 minutes per email and IP address.
- **Account Registration Flood Protection:** Enforced sliding-window rate limiting on [registerAction](file:///mnt/c/Users/Malik%20Bahawal%20Shair/Desktop/Agricultural%20Buissness/src/app/actions.ts) (maximum 5 registrations per 15 minutes per IP) to prevent bot-driven mass account creation.
- **AI Chatbot Rate Limiting & Compute Abuse Protection:** Enforced in [src/app/api/chat/route.ts](file:///mnt/c/Users/Malik%20Bahawal%20Shair/Desktop/Agricultural%20Buissness/src/app/api/chat/route.ts):
  - Max 20 requests per minute per IP address.
  - Strict length clamping: messages must not exceed 2,000 characters.
  - Daily spend budget caps and hard stop thresholds ($5.00/day) in [src/modules/chatbot/service.ts](file:///mnt/c/Users/Malik%20Bahawal%20Shair/Desktop/Agricultural%20Buissness/src/modules/chatbot/service.ts).
- **Order Creation Throttling:** Maximum 10 order creation requests per minute per authenticated customer in [src/app/api/orders/route.ts](file:///mnt/c/Users/Malik%20Bahawal%20Shair/Desktop/Agricultural%20Buissness/src/app/api/orders/route.ts).

---

## 4. Input Validation & Injection Defense

- **Strict Zod Schemas:** Every entrypoint in [src/app/actions.ts](file:///mnt/c/Users/Malik%20Bahawal%20Shair/Desktop/Agricultural%20Buissness/src/app/actions.ts) validates input formats (UUIDs for identifiers, integers for quantities, URLs for tracking links, bounded lengths for text).
- **SQL Injection Prevention:** 100% of queries use Drizzle ORM parameterized queries or tagged `sql` template literals. No string concatenation is used in SQL operations.
- **Redaction of Sensitive Identifiers:** [src/modules/chatbot/safety.ts](file:///mnt/c/Users/Malik%20Bahawal%20Shair/Desktop/Agricultural%20Buissness/src/modules/chatbot/safety.ts) scrubs Pakistani CNIC numbers and payment card numbers from AI chat logs.

---

## 5. Security & Audit Logging

- Security events (failed logins, rate limit breaches, unauthorized actions, and login successes) are logged to the immutable `audit_log` table via [src/modules/audit/service.ts](file:///mnt/c/Users/Malik%20Bahawal%20Shair/Desktop/Agricultural%20Buissness/src/modules/audit/service.ts).
- Client IP addresses are stored using salted SHA-256 hashes (`ip_hash`) to preserve privacy while maintaining forensic traceability.

---

## 6. Secret Management & Frontend Exposure Audit

- All configuration is validated at runtime through Zod in [src/modules/config/env.ts](file:///mnt/c/Users/Malik%20Bahawal%20Shair/Desktop/Agricultural%20Buissness/src/modules/config/env.ts).
- Secret scan confirms zero credentials, API keys, or private keys are exposed to the client or committed to the repository.
- No `NEXT_PUBLIC_` environment variables expose sensitive data.

---

## 7. Verification Summary

- **Unit & Integration Tests:** 20 test files, 102/102 tests passing.
- **Typecheck:** Zero TypeScript errors (`tsc --noEmit`).
- **Linter & Formatter:** Zero ESLint errors, 100% Prettier compliant.
- **Content Banned Scan:** 204 files verified; zero banned tokens, emojis, or en/em-dashes.
- **Production Build:** Optimized Next.js compilation succeeded cleanly.
