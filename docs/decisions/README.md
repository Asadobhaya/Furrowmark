# Decision records

Format: context, decision, reason, consequences. Status is "Proposed" until the owner writes "Approved: Phase 0".

## 0001 Modular monolith with one worker

Context: transactional stock, order, and payment logic. Decision: one codebase, one database, one web process, one worker process. Reason: simple operations and atomic transactions. Consequence: module boundaries are enforced by lint rules instead of network boundaries.

## 0002 Postgres backed job queue

Decision: queue tables in the main database using `FOR UPDATE SKIP LOCKED`. Reason: no extra service, jobs can be enqueued inside the business transaction. Consequence: throughput is limited to what Postgres handles, which is ample for this scale.

## 0003 Integer minor units for money

Decision: `bigint` minor units plus currency code, rounding rules in one pricing module with documented mode (proposed half away from zero per line, confirmed against tax law in Phase 3). Reason: avoid float error.

## 0004 Append only ledgers

Decision: stock ledger, audit log, consent records, order events, store credit ledger are append only, enforced by privileges and triggers. Reason: traceability and tamper evidence.

## 0005 Server side sessions, two cookies

Decision: customer cookie `__Host-sid` (Lax), staff cookie `__Host-asid` (Strict), both stored hashed in the database. Reason: revocation and the brief's cookie rules. Related conflict: C7.

## 0006 Payment confirmation only from server verified events

Decision: order becomes paid only from a verified webhook or a server to server fetch. Redirect pages are read only.

## 0007 Hosted payment page

Decision: no card fields on our pages. Reason: SAQ A scope.

## 0008 Chatbot uses read only tools plus one write

Decision: tools are catalog search, product details, stock, shipping and policy lookup, order status after proof of ownership, and create support request. Reason: limits damage from prompt injection.

## 0009 Cookieless analytics

Decision: privacy friendly, cookieless, first party aggregate analytics or none. Choice deferred to Phase 8. Reason: avoid consent banner.

## 0010 Payment gateway for Pakistan: Safepay (provisional)

Context: the owner asked for the most secure payment method in Pakistan. No gateway can be proven most secure from desk research, so the choice rests on checkable properties: hosted card page (card data never reaches our servers, SAQ A scope), a signed webhook verifiable on the raw body, a server to server payment fetch, test mode, and a refund API.

Decision: Safepay as the single real PaymentProvider, with cash on delivery and bank transfer as order methods.

Reason: web research summaries (secondary sources, not vendor documents) describe Safepay as using hosted checkout and HMAC-SHA256 signed webhooks, which fits sections 5 and 13 of the brief. The same summaries describe JazzCash and Easypaisa as using older parameter concatenation hash schemes, and PayFast as using notification posts. These descriptions are NOT VERIFIED against official documentation.

Conditions before this is final (checked at the start of Phase 3, before any adapter code):

1. Read Safepay's official developer documentation and confirm hosted checkout, webhook signature algorithm and header, replay protection, payment fetch endpoint, refund API, and test mode.
2. Confirm the owner's business can open a merchant account (requirements are set by Safepay and Pakistani regulation, not assumed here).
3. If any check fails, fall back to PayFast, then a wallet gateway, and ask the owner again.

Consequence: the PaymentProvider interface stays gateway neutral. Raast based bank payments can be added as another adapter later.

## 0011 Locale and time zone

Decision: default locale en (left to right), time zone Asia/Karachi for display, reports, and cut-off times. All timestamps stored in UTC. Message files use a locale keyed structure so Urdu (right to left) can be added without refactoring. Currency PKR is inferred from the country and must be confirmed.
