# Phase 0 report

## Built

Planning and documentation only. No application scaffold, no dependencies, no code.

## Evidence

`docs/evidence/phase-0/doc-scan.txt` (dash, emoji, banned word, and no-code checks). Index in `VERIFICATION.md`.

## Documents created

README.md, CHANGELOG.md, VERIFICATION.md, docs/architecture.md, docs/database.md, docs/routes-and-permissions.md, docs/threat-model.md, docs/testing.md, docs/deployment.md, docs/recovery.md, docs/tooling.md, docs/conflicts.md, docs/owner-inputs.md, docs/naming.md, docs/decisions/README.md.

## Documents scheduled for later phases

| Document                                          | Created in                          |
| ------------------------------------------------- | ----------------------------------- |
| `.env.example`, `SECURITY.md`, `docs/asvs-map.md` | Phase 1                             |
| `docs/api.md`                                     | Phase 3, extended in 4 and 7        |
| `docs/admin-guide.md`                             | Phase 2, extended each phase        |
| `docs/runbook.md`                                 | Phase 3, completed in Phase 6 and 9 |
| `docs/reporting.md`                               | Phase 6                             |
| `docs/chatbot.md`                                 | Phase 7                             |
| `docs/legal-review.md`                            | Phase 8                             |

## Name

Proposed working name: **Furrowmark** (details and alternatives in `docs/naming.md`). Availability NOT VERIFIED.

## Decisions I need from you (see `docs/conflicts.md`)

1. C1: how to handle four-eyes publishing with a small team (recommended: require two staff accounts).
2. C5: charge shipping per shipment or one combined fee.
3. C6: accept that listings use a default delivery estimate and checkout may still reject on shelf life.
4. C8: name the payment gateway (blocks Phase 3), and tell me the country.
5. C2 and C7: accept the recommended handling for the bot challenge and the two cookie design.
6. C9: confirm the recommended return and cancellation defaults, or give your own.

## Assumptions

- Modular monolith with a worker (decision records 0001 and 0002).
- Retention periods in `docs/database.md` are proposals pending counsel and local law.
- Permission matrix is a proposal.
- ORM, auth library, queue library, fonts, and icon set are decided in Phase 1 after reading installed documentation. Drizzle is my proposal.

## Owner inputs required

All 19 items in `docs/owner-inputs.md`. The ones that block the next phases: country and currency, languages and RTL, time zone, hosting preference, brand colours (Phase 1); restricted pesticide licence details, second staff account, real product data (Phase 2); named payment gateway, tax rules, delivery regions (Phase 3).

## Open risks

- Phase 3 is blocked until a gateway and country are named.
- Nothing is tested or running, so all functional claims are NOT VERIFIED.
- The legal position on selling regulated agrochemicals and on return rules depends on your country and needs a lawyer.
- Mermaid diagrams were not rendered in a viewer.

## Stop

Waiting for "Approved: Phase 0". Phase 1 (foundation) will start only after that, and its plan will be written before any code.
