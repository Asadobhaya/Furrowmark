# Routes and permissions (draft)

Deny by default. Every route, server action, and API handler declares its required permission in one registry (`src/modules/rbac/permissions.ts`, Phase 1). A test fails the build if any handler is not in the registry. Object level checks (owner of order, return, wishlist) are separate from role checks and tested separately.

Roles: `owner`, `manager`, `staff`, `support`. Customers have no staff role. Staff and customers use different cookies (see conflict C7).

## Public and customer routes

| Route                                                                                                                                                                                    | Auth                                    | Notes                                                           |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | --------------------------------------------------------------- |
| `/`                                                                                                                                                                                      | none                                    | Plain statement of what is sold, search, category links         |
| `/c/[...category]`                                                                                                                                                                       | none                                    | Listing, filters, sort, pagination in URL                       |
| `/p/[slug]`                                                                                                                                                                              | none                                    | Product page, label data, variants                              |
| `/search`                                                                                                                                                                                | none                                    | Typo tolerant, no result queries recorded without personal data |
| `/cart`                                                                                                                                                                                  | none                                    | Quantities only, server quote                                   |
| `/checkout`                                                                                                                                                                              | none or customer                        | Guest or account, challenge, restricted checks                  |
| `/order/[ref]/confirmation`                                                                                                                                                              | order access token                      | Read only status                                                |
| `/track`                                                                                                                                                                                 | none                                    | Order number plus email or phone, throttled, challenge          |
| `/wishlist`                                                                                                                                                                              | customer, or browser storage for guests | Merge at login                                                  |
| `/account`, `/account/orders`, `/account/orders/[ref]`, `/account/returns`, `/account/returns/new`, `/account/addresses`, `/account/notifications`, `/account/security`, `/account/data` | customer                                | Object level checks on every id                                 |
| `/login`, `/signup`, `/reset`, `/verify`, `/unsubscribe/[token]`                                                                                                                         | none                                    | Uniform responses, throttled                                    |
| `/shipping`, `/returns`, `/contact`, `/about`, `/privacy`, `/terms`                                                                                                                      | none                                    | Content from pages table and real data                          |
| `/sitemap.xml`, `/robots.txt`, `/.well-known/security.txt`                                                                                                                               | none                                    |                                                                 |
| `/404`, `/500`                                                                                                                                                                           | none                                    | Custom                                                          |

## API and webhook routes

| Route                                    | Auth                                   | Notes                             |
| ---------------------------------------- | -------------------------------------- | --------------------------------- |
| `POST /api/webhooks/payments/[provider]` | signature                              | Raw body verification, idempotent |
| `POST /api/webhooks/carriers/[carrier]`  | signature                              | Same rules                        |
| `POST /api/chat`                         | session plus rate limit plus challenge | Server side model calls           |
| `POST /api/chat/verify-order`            | rate limit                             | Sends one time code               |
| `POST /api/uploads/return-photo`         | customer, owner of return              | Magic byte check, re-encode       |
| `GET /api/files/[id]`                    | signed URL, object check               | Never public                      |
| `GET /api/health`                        | none                                   | No internal detail                |

## Admin routes (`/admin/...`)

Staff cookie, mandatory MFA, Strict SameSite. Admin pages disallowed in `robots.txt` and sent with `noindex`.

| Area                  | Route prefix                                                                                                            |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Dashboard and queues  | `/admin` , `/admin/queues/*`                                                                                            |
| Catalog               | `/admin/products`, `/admin/categories`, `/admin/brands`, `/admin/crops`, `/admin/targets`, `/admin/documents`           |
| Inventory             | `/admin/batches`, `/admin/stock-takes`, `/admin/recalls`                                                                |
| Sales                 | `/admin/orders`, `/admin/shipments`, `/admin/returns`, `/admin/refunds`, `/admin/payments`                              |
| Commerce config       | `/admin/shipping`, `/admin/carriers`, `/admin/coupons`, `/admin/tax`                                                    |
| Customers and content | `/admin/customers`, `/admin/pages`, `/admin/reviews`, `/admin/templates`                                                |
| Operations            | `/admin/webhooks`, `/admin/jobs`, `/admin/imports`, `/admin/reports`, `/admin/audit`, `/admin/users`, `/admin/settings` |

## Permission matrix

R read, W create or edit, A approve or publish, X execute special action. Blank means denied. The matrix is a proposal and is the contract that the permission tests assert.

| Capability                                         | owner | manager | staff | support |
| -------------------------------------------------- | ----- | ------- | ----- | ------- |
| Products and variants: draft and edit              | W     | W       | W     | R       |
| Safety fields: edit (creates new version)          | W     | W       | W     |         |
| Publish or approve safety version (not the author) | A     | A       |       |         |
| Categories, brands, crops, targets                 | W     | W       | R     | R       |
| Price changes                                      | W     | W       |       |         |
| Batches: receive, view                             | W     | W       | W     | R       |
| Batch release from quarantine, write off           | X     | X       |       |         |
| Stock adjustment and stock take approval           | X     | X       |       |         |
| Recall: start                                      | X     | X       |       |         |
| Orders: view                                       | R     | R       | R     | R       |
| Orders: confirm, pack, transition                  | X     | X       | X     |         |
| Orders: cancel with reason                         | X     | X       | X     | X       |
| Shipments: create, dispatch, record attempt        | X     | X       | X     |         |
| Returns: review, approve, inspect                  | X     | X       | X     | R       |
| Return eligibility override                        | X     | X       |       |         |
| Refunds: issue                                     | X     | X       |       |         |
| Refund above configured limit                      | X     |         |       |         |
| COD settlement                                     | X     | X       |       |         |
| Coupons, shipping, tax, carriers                   | W     | W       |       |         |
| Customers: view limited fields                     | R     | R       |       | R       |
| Customer data export or deletion on request        | X     | X       |       |         |
| Notification templates                             | W     | W       |       |         |
| Reviews moderation                                 | W     | W       |       | W       |
| Pages                                              | W     | W       |       |         |
| CSV import and export                              | X     | X       |       |         |
| Reports (all)                                      | R     | R       |       |         |
| Webhook log and manual retry                       | X     | X       |       |         |
| Staff users: create, change role, reset MFA        | X     |         |       |         |
| Audit log                                          | R     | R       |       |         |
| System settings and secrets rotation record        | W     |         |       |         |

Support sees customer contact data only for the order or request being handled, and each view of personal fields is audit logged.
