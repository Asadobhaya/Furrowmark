# Phase 1 plan: Foundation

Status: PLAN ONLY. Implementation has not started because the build environment cannot run the code (see "Blocker").

## Blocker

The machine I work on has no Node.js, npm, Docker, or PostgreSQL (checked 2026-10-13: `node`, `npm`, `docker`, `psql` all report "command not found"; Ubuntu 26.04, `sudo` and `apt-get` exist). Rule 6 forbids claiming code works without running it, and Phase 1 needs lint, typecheck, tests, and a real database to pass. Writing a code base I cannot run would break rule 3.

Needed from you, one of:

- (a) Allow me to install them here with network access: Node.js LTS, PostgreSQL (server plus `postgresql-contrib` for `pg_trgm`), via `apt-get` or nodesource, which needs `sudo` and will ask for your approval. Docker is optional if PostgreSQL is installed directly.
- (b) You install them yourself and tell me.

Note: the project folder is on a Windows drive (`/mnt/c/...`). `npm install` works there but is slow and file permissions are weak. If speed is a problem I suggest moving the repository into the Linux home folder. Tell me if you want that.

## Scope (from section 17)

Repository, CI, strict TypeScript, lint, formatting, environment handling, database and migrations, design tokens, security headers, authentication, MFA, roles and permissions, audit log, error pages, base documentation updates.

## Work breakdown

1. **Repo and tooling:** Next.js current stable (version looked up and pinned exactly), TypeScript strict, ESLint with import boundary rules, Prettier, Vitest, Playwright, gitleaks and Semgrep config, committed lockfile, `.env.example`, banned content scan script (dashes, emoji, gradients, banned words, placeholder tags, generator strings).
2. **Config:** Zod validated environment loader that refuses to boot in production when a required value is missing. Store settings (name, locale en, time zone Asia/Karachi, currency PKR pending confirmation) read from configuration, not hard coded.
3. **Database:** Drizzle versus Prisma final choice after reading the installed docs. Roles `app_migrator` and `app_runtime`. First migrations: `users`, `sessions`, `mfa_credentials`, `auth_tokens`, `login_attempts`, `audit_log`, `config_settings`, `job_runs`. Append only enforcement on `audit_log` (revoked UPDATE and DELETE plus trigger), tested.
4. **Design tokens:** one tokens file (colours, spacing on 8 px grid, radius, type scale), self-hosted fonts (two families at most, licence checked), one SVG icon set, automated contrast test for every text and background pair against WCAG 2.2 AA.
5. **Security headers:** nonce based CSP without unsafe-inline or unsafe-eval, HSTS, frame-ancestors none, nosniff, referrer policy, permissions policy, COOP, CORP, closed CORS. Header tests.
6. **Authentication:** Argon2id, minimum length 12, breached password check using k-anonymity, uniform messages, hashed single use tokens, rate limiting, lockout with backoff, database sessions with `__Host-sid` (Lax) for customers and `__Host-asid` (Strict) for staff, rotation on login and privilege change, idle and absolute timeouts, revocation, CSRF protection on every state changing request.
7. **MFA:** mandatory TOTP for all staff (passkeys later if the library review supports it, recorded as a decision), optional for customers, recovery codes hashed.
8. **Authorisation:** permission registry matching `docs/routes-and-permissions.md`, deny by default, a test that fails if any handler is unregistered, cross role tests for every matrix cell that exists in this phase, object level check helper.
9. **Audit log:** write helper used by every staff action, immutable, includes actor, action, entity, time, origin.
10. **Pages:** custom 404 and 500, minimal staff login and account security pages (no storefront yet), staff bootstrap command that creates the first owner with a one-time expiring token. No default accounts.
11. **Bot challenge:** adapter interface and a fake for tests. The real Turnstile hookup waits for conflict C2 to be answered and for your Turnstile keys.
12. **CI:** lint, typecheck, unit, integration against a Postgres service, build, npm audit, OSV scan, gitleaks, Semgrep, SBOM.
13. **Docs updated:** architecture, database (full dictionary for the new tables), routes and permissions, testing (real commands), deployment (variables), threat model, tooling (pinned versions), new `SECURITY.md`, `docs/asvs-map.md`, `.env.example`, decision records, CHANGELOG, VERIFICATION.

## Exit criteria (all must be true)

- Lint, typecheck, unit, integration tests pass, with counts and dates saved in `docs/evidence/phase-1/`.
- Coverage for `auth` and `rbac` at least 90 percent lines and branches.
- Tests exist and pass for: login enumeration, brute force limit, session rotation and revocation, CSRF rejection, cookie attributes, unauthenticated and cross role access, audit log immutability, runtime database role privileges, CSP and other headers, secret absence.
- Semgrep, gitleaks, npm audit, and OSV have no unresolved high or medium findings.
- Banned content scan passes.
- A browser check with screenshots of login, MFA enrolment, and error pages, and an axe run with zero serious or critical issues on those pages.
- Anything not verified is listed as NOT VERIFIED with a reason.

## Questions I still need answered

1. Environment: option (a) or (b) above, and whether to move the repo to the Linux home folder.
2. Confirm currency PKR.
3. Conflict C2 and C7 recommendations accepted? (Turnstile only on sensitive forms, plus two session cookies.) I will proceed with the recommendations unless you say otherwise.
4. Brand colours: none given, so I will use a deep green primary and neutral scale unless you supply a logo or colours.

## Architecture change check

This plan does not change the approved architecture. The only open technical choices (ORM, auth library, queue library) were already listed as Phase 1 decisions.
