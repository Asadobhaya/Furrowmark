# Security Policy

## Supported Versions

| Version | Supported |
| ------- | --------- |
| 0.1.x   | Yes       |

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please report it privately:

- Email: security@furrowmark.pk (or configured store owner security contact)
- Please do not report security vulnerabilities through public GitHub issues.

Reports should include:

1. Type of issue (e.g. buffer overflow, SQL injection, cross-site scripting)
2. Full paths of source file(s) related to the manifestation of the issue
3. The location of the affected source code (tag/branch/commit or direct URL)
4. Step-by-step instructions to reproduce the issue
5. Proof-of-concept or exploit code if available
6. Impact assessment

We will acknowledge receipt of your report within 48 hours and provide regular status updates.

## Incident Response Checklist

1. **Identification**: Verify report, preserve evidence and logs, identify scope of affected data and components.
2. **Containment**: Revoke compromised credentials, isolate affected services or sessions, deploy emergency IP/WAF blocks.
3. **Eradication**: Identify root cause, develop patch, test against full test suite, apply database corrections.
4. **Recovery**: Deploy fix, verify operational telemetry, monitor for residual suspicious activity.
5. **Post-Mortem**: Document timeline, root cause, preventative measures, and regulatory/customer notification if required.
