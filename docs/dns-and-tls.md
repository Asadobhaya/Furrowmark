# Domain, DNS, and TLS Production Configuration Guide

This guide specifies exact DNS records and TLS certificate directives required for deploying Furrowmark to production.

---

## 1. Domain Architecture

- Primary Canonical Domain: `https://furrowmark.pk` (or configured custom apex)
- Subdomain: `https://www.furrowmark.pk`
- Canonical Redirect: All HTTP traffic redirects to HTTPS. The `www` subdomain permanently redirects (HTTP 301) to the canonical apex domain.

---

## 2. DNS Zone Records Specification

| Type  | Host / Name     | Value / Target                                                 | TTL  | Purpose                                         |
| ----- | --------------- | -------------------------------------------------------------- | ---- | ----------------------------------------------- |
| A     | `@` (apex)      | `<PRODUCTION_APP_INGRESS_IP>`                                  | 300  | Primary production application ingress          |
| AAAA  | `@` (apex)      | `<PRODUCTION_APP_INGRESS_IPV6>`                                | 300  | IPv6 ingress                                    |
| CNAME | `www`           | `furrowmark.pk.`                                               | 300  | Redirect alias to canonical apex                |
| CAA   | `@`             | `0 issue "letsencrypt.org"`                                    | 3600 | Restricts certificate issuance to Let's Encrypt |
| CAA   | `@`             | `0 issuewild ";"`                                              | 3600 | Prohibits wildcard certificate issuance         |
| CAA   | `@`             | `0 iodef "mailto:security@furrowmark.pk"`                      | 3600 | Security violation reporting                    |
| TXT   | `@`             | `"v=spf1 include:_spf.furrowmark.pk ~all"`                     | 3600 | SPF transactional email authentication          |
| TXT   | `_dmarc`        | `"v=DMARC1; p=reject; rua=mailto:dmarc-reports@furrowmark.pk"` | 3600 | Enforcing DMARC reject policy                   |
| TXT   | `s1._domainkey` | `"v=DKIM1; k=rsa; p=<PUBLIC_DKIM_KEY_DATA>"`                   | 3600 | DKIM signature verification for notifications   |

---

## 3. TLS / HTTPS & Security Headers

1. **Certificate Management**:
   - Automated TLS via Let's Encrypt / ACME with HTTP-01 or DNS-01 validation.
   - Minimum TLS Protocol: TLS 1.3 (fallback TLS 1.2 with strong AEAD ciphers).

2. **HTTP Strict Transport Security (HSTS)**:
   - Header: `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
   - Configured in `src/modules/security/headers.ts` and verified with automated test suites.

3. **Content Security Policy (CSP)**:
   - Dynamic per-request cryptographic nonces (`'nonce-...'`).
   - `frame-ancestors 'none'` prohibiting clickjacking.
   - Strict ban on `'unsafe-inline'` script evaluation.
