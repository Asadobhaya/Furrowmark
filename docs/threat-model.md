# Threat model (draft)

Method: STRIDE per trust boundary. Status: Phase 0 draft. Review schedule: at the end of every phase, and before launch. Mitigation IDs (M) map to tests (T) that are written in the phase noted.

## 1. Assets

| ID  | Asset                                                | Why it matters                                   |
| --- | ---------------------------------------------------- | ------------------------------------------------ |
| A1  | Customer personal data (name, phone, address, email) | Privacy law, harm if leaked                      |
| A2  | Credentials, sessions, MFA secrets                   | Account takeover                                 |
| A3  | Payment integrity (order paid state, refunds)        | Direct financial loss                            |
| A4  | Product safety data (label text, rates, intervals)   | Wrong dose causes crop, health, or legal harm    |
| A5  | Stock and batch integrity, recall data               | Overselling, selling expired or recalled product |
| A6  | Admin capabilities                                   | Full control                                     |
| A7  | Secrets (gateway, model API, database, signing keys) | Total compromise                                 |
| A8  | Chatbot budget and output                            | Cost abuse, harmful advice                       |
| A9  | Backups                                              | Data leak or loss                                |
| A10 | Brand and domain                                     | Phishing and defacement                          |

## 2. Trust boundaries

1. Internet to CDN and WAF.
2. CDN to application.
3. Application to database.
4. Application to object storage.
5. Application to third party providers (gateway, email, SMS, WhatsApp, carrier, model).
6. Third party webhooks to application.
7. Customer role to staff role inside the application.
8. Chatbot model output to the user and to tools.

## 3. STRIDE analysis

| Boundary | Threat                                                      | Category | Mitigation                                                                                    | Test (phase)                 |
| -------- | ----------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------- | ---------------------------- |
| 1        | Credential stuffing on login                                | S, D     | Rate limit, backoff lockout, breached password check, challenge, MFA for staff                | auth abuse tests (1)         |
| 1        | Account enumeration                                         | I        | Uniform messages and timing                                                                   | enumeration test (1)         |
| 1        | DDoS                                                        | D        | CDN and WAF, per route limits                                                                 | load test (9)                |
| 2        | Direct origin access bypassing WAF                          | S        | Origin accepts only CDN traffic                                                               | deployment check (10)        |
| 2        | Header downgrade, clickjacking, XSS                         | T, I     | Strict nonce CSP, HSTS, frame-ancestors none                                                  | header test (1)              |
| 3        | SQL injection                                               | T        | Parameterised queries only, lint ban on raw string SQL                                        | injection tests (1, 2)       |
| 3        | Runtime database user abuse                                 | E        | Least privilege role, no DDL, no update on ledgers                                            | privilege test (1)           |
| 3        | Concurrent last unit purchase                               | T        | Row locks, check constraints                                                                  | concurrency test (2)         |
| 4        | Private file exposure                                       | I        | Private bucket, short signed URLs, object checks                                              | file access tests (2, 4)     |
| 4        | Malicious upload (polyglot, SVG script, oversized)          | T, D, E  | Type allowlist, magic bytes, re-encode, strip metadata, size and count limits                 | upload abuse tests (2, 4)    |
| 5        | SSRF through server side fetch                              | I        | Allowlist of hosts, private range block                                                       | SSRF test (3)                |
| 5        | Provider outage                                             | D        | Adapters, queues with retry, manual dispatch                                                  | failure injection (3 to 6)   |
| 6        | Forged payment webhook                                      | S, E     | Signature on raw body, timestamp tolerance, source verification                               | forgery test (3)             |
| 6        | Replayed webhook                                            | R, T     | Event ID store, idempotent handlers                                                           | replay test (3)              |
| 6        | Wrong amount or currency or order ref                       | T        | Reject and flag                                                                               | mismatch test (3)            |
| 6        | Out of order events                                         | T        | State aware handlers, fetch from gateway when unsure                                          | ordering test (3)            |
| 7        | IDOR on orders, returns, wishlists, files                   | I, E     | Object level checks in every repo function                                                    | cross-account tests (1 to 5) |
| 7        | Privilege escalation across roles                           | E        | Permission registry, server checks, tests per matrix cell                                     | role matrix tests (1)        |
| 7        | CSRF                                                        | T        | Origin check plus token, SameSite                                                             | CSRF tests (1)               |
| 7        | Compromised admin                                           | E, R     | Mandatory MFA, audit log, short sessions, alerts on permission change and bulk export         | audit tests (1, 6)           |
| 7        | Staff repudiation                                           | R        | Immutable audit log with actor and origin                                                     | audit tests (1)              |
| 8        | Prompt injection through user text, catalog text, documents | T, E     | Untrusted input framing, read only tools, Zod tool arguments, no write except support request | chatbot evaluation (7)       |
| 8        | Fabricated dosage                                           | T        | Quote only stored label data, otherwise decline and offer human                               | evaluation cases (7)         |
| 8        | Cross-customer order disclosure                             | I        | One time code proof, scoped tool                                                              | evaluation cases (7)         |
| 8        | Unsafe rendering of model output                            | T        | Plain text or tiny markdown, no raw HTML, link allowlist                                      | rendering test (7)           |
| 8        | Spend abuse                                                 | D        | Per IP and session limit, token cap, daily limit                                              | limit tests (7)              |

## 4. Abuse cases

- **Returns fraud:** return of used product claimed as unopened; repeated claims; reuse of a photo. Controls: eligibility rules per product class, photo upload limits, staff inspection, quarantine, no auto restock, per customer return rate visible to staff, override requires a reason.
- **Coupon abuse:** brute force of codes, stacking. Controls: rate limit, per customer and global limits, server side rule tests.
- **Refund abuse by staff:** Controls: server computed cap, limit above which owner approval is required, audit log.
- **Checkout stock hoarding:** reservation with short expiry, per IP and per account limits on active reservations.
- **Webhook flooding:** signature check before any heavy work, rate limit by source.
- **Order lookup enumeration:** long random references, throttling, challenge, uniform failures.
- **Publishing unsafe product data:** server enforced publish gate, four-eyes, versioning, tested rejection cases.
- **Selling restricted product to blocked region:** checks at checkout and again at packing.
- **Chatbot jailbreak for dose advice:** see boundary 8.
- **Supply chain attack:** pinned versions, lockfile, audit and OSV scan, typosquat check, minimal dependencies, SBOM.

## 5. Mitigation to control mapping

Controls map to OWASP ASVS level 2, with level 3 for authentication, admin, and payments where feasible. The ASVS requirement by requirement mapping table is created in Phase 1 (authentication) and extended each phase, and stored in `docs/asvs-map.md`. OWASP API Top 10 and LLM Top 10 coverage is tracked in the same table.

## 6. Residual risks (current)

- No independent penetration test yet. One is recommended before launch.
- Third party provider compromise cannot be fully mitigated by this application.
- Staff social engineering.
- Legal exposure from sale of regulated products depends on owner licence and local law (see `docs/legal-review.md`, created in Phase 8).
- Model provider behaviour changes between versions, so the evaluation set must be rerun on every model change.

## 7. Review schedule

End of each phase, after any change to a trust boundary, and quarterly after launch.
