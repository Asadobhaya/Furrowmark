# Recovery outline (draft)

Status: outline only. Step by step procedures and drill results are filled in Phase 9. No restore has been performed, so every claim of recoverability is NOT VERIFIED.

## Backups

| Item                                                          | Method                                                           | Frequency                            | Encryption                                                        | Location                                    |
| ------------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------ | ----------------------------------------------------------------- | ------------------------------------------- |
| Database                                                      | Logical dump plus point in time recovery if the host supports it | Nightly dump, continuous log archive | Encrypted before upload with a key held outside the database host | Separate account or region from the primary |
| Object storage                                                | Versioned bucket with replication                                | Continuous                           | Server side encryption                                            | Second location                             |
| Configuration and infrastructure definitions                  | Git                                                              | On change                            | n/a                                                               | Repository                                  |
| Secrets inventory (names, owners, rotation dates, not values) | Document                                                         | On change                            | n/a                                                               | This file                                   |

## Objectives (proposed, owner to confirm)

Recovery point objective: 24 hours at worst with nightly dumps, 15 minutes or better if point in time recovery is available. Recovery time objective: 4 hours. These are targets, not measured values.

## Disaster scenarios

| Scenario                                     | First response                                                                                             | Owner of action    |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------ |
| Database loss or corruption                  | Stop writes, restore latest backup to a new instance, replay logs, verify counts, switch connection        | Owner or delegate  |
| Provider outage (payment, email, SMS, model) | Adapters queue and retry; announce via banner on the site; use manual methods                              | Manager            |
| Leaked secret                                | Rotate that secret, revoke sessions, review audit and provider logs, record in incident log                | Owner              |
| Compromised admin account                    | Disable account, revoke sessions, review audit log, reset MFA, check for changes to prices and safety data | Owner              |
| Bad deployment                               | Roll back to previous image, check migrations                                                              | Whoever deploys    |
| Data breach                                  | Follow `SECURITY.md` incident checklist, notify regulator and customers as law requires                    | Owner with counsel |

## Restore drill log

| Date     | Scenario | Backup age | Time to restore | Result | Notes |
| -------- | -------- | ---------- | --------------- | ------ | ----- |
| none yet |          |            |                 |        |       |
