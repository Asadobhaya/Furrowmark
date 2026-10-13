# OWASP ASVS 4.0 Verification Mapping

Target: Level 2 across application, Level 3 for Authentication, Admin, and Payments where feasible.

| ASVS Section | Control Description                                           | Implemented In                    | Test / Evidence                                                          |
| ------------ | ------------------------------------------------------------- | --------------------------------- | ------------------------------------------------------------------------ |
| V2.1.1       | Minimum password length >= 12 characters                      | `src/modules/auth/crypto.ts`      | `src/modules/auth/crypto.test.ts` (Rejects < 12)                         |
| V2.1.2       | Breached password check (k-anonymity API)                     | `src/modules/auth/crypto.ts`      | `src/modules/auth/crypto.test.ts` (Mocked & verified)                    |
| V2.1.7       | Password hashing using Argon2id                               | `src/modules/auth/crypto.ts`      | `src/modules/auth/crypto.test.ts` (Argon2id prefix verified)             |
| V2.8.1       | Multi-factor authentication (TOTP RFC 6238)                   | `src/modules/auth/crypto.ts`      | `src/modules/auth/crypto.test.ts` (TOTP generation and validation)       |
| V3.2.1       | Server-side session tokens in database                        | `src/modules/auth/session.ts`     | `src/modules/auth/session.test.ts` (PostgreSQL `sessions` table)         |
| V3.2.3       | Cookie prefixes `__Host-` and HttpOnly/Secure/SameSite        | `src/modules/auth/session.ts`     | `src/modules/auth/session.test.ts` (`__Host-sid`, `__Host-asid`)         |
| V3.3.1       | Session idle timeout (2 hours) and absolute timeouts          | `src/modules/auth/session.ts`     | `src/modules/auth/session.test.ts` (Idle timeout test)                   |
| V3.3.4       | Explicit session revocation on logout and privilege change    | `src/modules/auth/session.ts`     | `src/modules/auth/session.test.ts` (Revoke single & all)                 |
| V4.1.1       | Deny-by-default role-based access control registry            | `src/modules/rbac/permissions.ts` | `src/modules/rbac/permissions.test.ts` (Deny by default for customer)    |
| V4.1.2       | Enforcement of access control rules server-side               | `src/modules/rbac/permissions.ts` | `src/modules/rbac/permissions.test.ts` (`assertPermission` checks)       |
| V7.1.1       | Sensitive data at rest encrypted via AES-256-GCM              | `src/modules/auth/crypto.ts`      | `src/modules/auth/crypto.test.ts` (AES-256-GCM authenticated encryption) |
| V8.1.1       | Immutable audit logging of administrative and security events | `src/modules/audit/service.ts`    | `src/modules/audit/service.test.ts` (Trigger prevents UPDATE/DELETE)     |
| V14.4.1      | Strict Content-Security-Policy with nonce                     | `src/modules/security/headers.ts` | `src/modules/security/headers.test.ts` (CSP without unsafe-inline)       |
| V14.4.2      | HTTP Strict Transport Security (HSTS) with preload            | `src/modules/security/headers.ts` | `src/modules/security/headers.test.ts` (max-age 63072000 preload)        |
| V14.4.3      | X-Content-Type-Options: nosniff                               | `src/modules/security/headers.ts` | `src/modules/security/headers.test.ts` (nosniff header checked)          |
| V14.4.4      | X-Frame-Options: DENY and frame-ancestors none                | `src/modules/security/headers.ts` | `src/modules/security/headers.test.ts` (Clickjacking defense verified)   |
