# Deployment outline (draft)

## Environments

| Environment | Database                   | Payment keys | Data              |
| ----------- | -------------------------- | ------------ | ----------------- |
| local       | Docker Postgres            | gateway test | labelled fixtures |
| ci          | ephemeral Postgres         | none (fakes) | fixtures          |
| staging     | managed Postgres, separate | gateway test | fixtures          |
| production  | managed Postgres           | gateway live | empty at start    |

## Hosting recommendation (owner said "recommend")

Requirements: Node runtime for the app and a long running worker, managed PostgreSQL with point in time recovery and extensions `pg_trgm`, private S3 compatible object storage, a CDN with WAF, scheduled jobs, in the owner's country or a nearby region, and ability to accept the chosen payment gateway.

Recommendation: a container host (single app container and single worker container) plus a managed Postgres provider and a CDN with WAF in front. The specific vendors depend on the owner's country (latency, data residency law, gateway availability), so the vendor choice is NOT DECIDED and is blocked on owner input 3. A serverless only host is not recommended because the worker, long running jobs, and transactional row locking suit a persistent process.

## Required environment variables (names only, values never in the repo)

Defined fully in `.env.example` in Phase 1. Groups: `DATABASE_URL`, `DATABASE_MIGRATOR_URL`, `SESSION_SECRET`, `FIELD_ENCRYPTION_KEY`, `STORAGE_*`, `PAYMENT_*`, `CARRIER_*`, `EMAIL_*`, `SMS_*`, `WHATSAPP_*`, `CHAT_MODEL_API_KEY`, `CHAT_MODEL_NAME`, `CHAT_DAILY_SPEND_LIMIT`, `CHAT_RETENTION_DAYS`, `TURNSTILE_*`, `PUBLIC_BASE_URL`, `ERROR_TRACKING_DSN`, `ALERT_EMAIL`. The app validates all of them with Zod at start and refuses to boot in production when a required one is missing.

## CI and CD (Phase 1)

On every push: install from lockfile, lint, typecheck, unit and integration tests with Postgres service, build, `npm audit`, OSV scan, gitleaks, Semgrep, SBOM generation. On merge to main: deploy to staging, run Playwright, axe, ZAP baseline. Production deploy is a manual approval of a tested release. Branch protection and required review are repository settings that the owner must enable (cannot be done from code).

## Domain, DNS, TLS (details in Phase 10)

Exact records depend on the host and the domain, so they are generated in Phase 10. Expected set: apex and `www` records, redirect of one to the other, CAA, SPF, DKIM, DMARC (enforcing), DNSSEC where the registrar supports it, HSTS with preload eligibility after the redirect works.

## Release checklist and rollback

Release: green pipeline, migration reviewed, staging verified, backup taken, deploy, smoke test, watch error rate. Rollback: redeploy previous image; migrations follow expand then contract, so the previous image works with the new schema; if a migration must be undone, restore procedure in `docs/recovery.md`.

## Go-live order (full list in Phase 10)

1. Owner inputs complete. 2. Provider accounts created. 3. Production secrets generated and stored. 4. Infrastructure applied. 5. Migrations applied. 6. First owner account and MFA. 7. Real catalog entered and published through the gate. 8. DNS and TLS. 9. Email authentication verified. 10. Live low value payment and refund. 11. Pre-launch gate script passes. 12. Owner reads all documents. 13. Launch.
