# Phase 10 Plan: Launch Preparation, Production Hardening & Pre-Flight Checklist

## Objective

Finalize launch readiness and pre-flight validation for Furrowmark:

1. **Production Pre-Launch Verification Script (`scripts/prelaunch-check.sh`)**:
   - Single automated command orchestrating all quality, security, and build checks.
2. **Domain, DNS & TLS Specification (`docs/dns-and-tls.md`)**:
   - Explicit zone records: Apex A/AAAA, CAA, enforcing SPF, DMARC (`p=reject`), and DKIM.
   - HSTS preload configuration and TLS certificate directives.
3. **Environment & Configuration Validation (`src/modules/config/env.test.ts`)**:
   - Unit test asserting that mandatory production environment variables are properly defined and validated via Zod.
4. **Final Repository Quality & Compliance Pass**:
   - Zero vulnerability audit, strict typecheck, linter, formatting, banned content scan, and 100% test suite pass rate.
