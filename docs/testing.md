# Test strategy (draft)

## Layers

| Layer                    | Tool                                                          | Scope                                                                                 | Database                                                         |
| ------------------------ | ------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Unit                     | Vitest                                                        | Pricing, tax, refunds, state machines, eligibility, expiry logic, permission registry | None                                                             |
| Integration              | Vitest                                                        | Services and repos, allocation concurrency, webhooks, jobs, authorisation             | Real PostgreSQL, one schema per test file, migrated from scratch |
| End to end               | Playwright                                                    | Customer and admin journeys                                                           | Real PostgreSQL with labelled fixtures                           |
| Accessibility            | axe via Playwright, plus manual keyboard checklist            | Every route type, light and reduced motion                                            |                                                                  |
| Security                 | Vitest and Playwright                                         | Auth bypass, IDOR, CSRF, injection, rate limits, webhook forgery, upload abuse        |                                                                  |
| Chatbot                  | Vitest evaluation harness                                     | 60 or more conversations with written pass criteria                                   |                                                                  |
| Performance              | Lighthouse CI, k6 load test                                   | Home, listing, product, checkout; browse, search, checkout load                       |                                                                  |
| Static and dynamic scans | Semgrep, gitleaks, OSV scanner, npm audit, OWASP ZAP baseline | Whole repo, running staging                                                           |                                                                  |

Mocking rule: no mocking of the database. Third party providers are replaced by fakes that implement the adapter interface, and webhook tests use real gateway test mode payload shapes with real signature algorithms.

## Coverage targets

Critical modules (`pricing`, `payments`, `inventory`, `returns`, `refunds`, `rbac`, `auth`) at least 90 percent lines and branches, enforced in CI. Other modules have a reported floor (proposed 80 percent lines). Tests must assert behaviour. Mutation testing (Stryker) is run on `pricing` and `inventory` at Phase 9 to check that assertions are meaningful.

## Critical scenarios (minimum)

1. Rounding, tax inclusive and exclusive, coupon limits, shipping thresholds, partial refund cap, multi currency edge cases if enabled.
2. Two or more simultaneous checkouts for the last unit: exactly one succeeds.
3. Webhook: success, failure, duplicate, replay outside tolerance, forged signature, wrong amount, wrong currency, wrong order reference, refund event, out of order event.
4. Every pair in the order, shipment, return, and batch transition tables: allowed pairs succeed, others are rejected.
5. Publish gate: each missing required pesticide field rejects publish; author cannot publish own product; safety field edit creates a new unapproved version and the live version remains in force.
6. Expired and recalled batches are never allocated; shelf life rule against delivery estimate.
7. Return eligibility per product class, window, override with reason, quarantine on receipt.
8. Cross account and cross role access for every object type.
9. Opt in only: no marketing message without a consent record; unsubscribe link works in one request.
10. Reports against a known dataset with expected values written in the test.

## Test data rules

Fixtures live only under `tests/fixtures/` and `scripts/fixtures/`, are named as fixtures, and use obviously non-real contact data (reserved example domains and reserved phone ranges). Fixtures never run against production. Gateway test keys only.

## Evidence

Each phase writes to `docs/evidence/phase-N/`: raw test output with counts and timestamps, coverage reports, scan reports, screenshots or recordings. `VERIFICATION.md` has one row per requirement with the evidence path or "NOT VERIFIED" and a reason. A failing test is never edited to pass without an explanation in the phase report.

## How to run (defined in Phase 1)

Commands will be fixed when the `package.json` exists: `test:unit`, `test:integration`, `test:e2e`, `test:a11y`, `test:security`, `test:chatbot`, `lint`, `typecheck`, `audit`. This section is updated then.

## Known gaps (Phase 0)

Nothing is implemented, so nothing is tested. All requirements are NOT VERIFIED except the documentation checks in `docs/evidence/phase-0/`.
