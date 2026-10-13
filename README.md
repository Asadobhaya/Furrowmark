# Furrowmark (working name)

Online store for agricultural inputs: seeds, fertilisers, crop protection products, plant nutrients, and farm tools.

Status: Phase 0 (planning and documentation). There is no application code yet. See `docs/phase-0-report.md`.

"Furrowmark" is a proposed working name. It is not final until the owner approves it and a domain and trademark check is done (see `docs/naming.md`).

## Repository map

| Path                             | Content                                                          |
| -------------------------------- | ---------------------------------------------------------------- |
| `docs/phase-0-report.md`         | What Phase 0 produced, assumptions, risks, owner inputs required |
| `docs/owner-inputs.md`           | Every owner input, its status, and which phase needs it          |
| `docs/architecture.md`           | System design, adapters, state machines, jobs, key decisions     |
| `docs/database.md`               | Entity relationship diagram, draft data dictionary, policies     |
| `docs/routes-and-permissions.md` | Route map and role permission matrix                             |
| `docs/threat-model.md`           | STRIDE threat model draft                                        |
| `docs/testing.md`                | Test strategy and evidence rules                                 |
| `docs/deployment.md`             | Deployment outline                                               |
| `docs/recovery.md`               | Backup and recovery outline                                      |
| `docs/tooling.md`                | Tooling choices and version policy                               |
| `docs/conflicts.md`              | Requirement conflicts that need an owner decision                |
| `docs/naming.md`                 | Name proposal                                                    |
| `docs/decisions/`                | Decision records                                                 |
| `docs/evidence/phase-0/`         | Evidence for Phase 0                                             |
| `VERIFICATION.md`                | Requirement to evidence index                                    |
| `CHANGELOG.md`                   | Change history                                                   |

Documents listed in section 15 of the brief that are not in this table (runbook, reporting, chatbot, admin guide, API reference, legal review, SECURITY.md, .env.example) are created in the phase that introduces the behaviour they describe. `docs/phase-0-report.md` lists which phase creates each one.

## Writing rules

No em dashes or en dashes, no emoji, no gradients. Hyphens inside words and numeric ranges written with the word "to" are fine.
