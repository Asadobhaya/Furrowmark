# Requirement conflicts and open decisions

Per operating rule 8, none of these has been silently resolved. Each has a recommendation, but the recommendation is not applied until the owner answers.

## C1. Four-eyes publishing vs a small team

Section 6 requires the publisher to differ from the author. A one-person business cannot publish anything.
Options: (a) require at least two active staff accounts before any pesticide product can be published (recommended); (b) allow the owner to self-approve with a recorded reason, which weakens the control.
Needed by Phase 2.

## C2. Bot challenge vs "no consent banner" and Lighthouse 90

Cloudflare Turnstile (section 13) loads a third-party script and may set storage. The brief also wants cookieless analytics with no consent banner, a CSP with no unsafe-inline, and Lighthouse mobile 90 or more on checkout.
Recommendation: load the challenge only on the forms that need it (not on home, listing, product), after interaction where possible, and have counsel confirm it counts as strictly necessary. If counsel disagrees, a consent mechanism is built before it ships. Needed by Phase 1.

## C3. Order lookup by order number plus email or phone vs enumeration

Section 9 asks for a public tracking page. Section 13 asks for enumeration protection. Resolution is design, not a conflict: long random order references, per-IP and per-reference rate limits, uniform failure messages, and a challenge. Listed so it is tested. No decision needed unless the owner wants short order numbers (not recommended).

## C4. "Opened chemicals not returnable" vs consumer law

Some countries give statutory return rights that override a store policy. The policy text will follow the brief. Counsel must confirm it is lawful in the owner's country. Needed by Phase 8.

## C5. Automatic parcel splitting vs shipping cost

Splitting agrochemicals from seeds creates multiple shipments, and carriers charge per parcel. Decision needed: charge shipping per shipment, or one combined fee with the store absorbing extra cost. Needed by Phase 3.

## C6. "In stock" depends on delivery date

Section 6 says in stock needs an unexpired batch. Section 7 says a batch cannot be sold if it expires before the estimated delivery date plus minimum shelf life. Listing pages have no address yet. Proposal: listings use a default delivery estimate from configuration, and checkout rechecks with the real address. A product can therefore show in stock and still fail at checkout, with a clear message. Needs owner acceptance. Needed by Phase 2.

## C7. Admin cookie strictness vs `__Host-` prefix

`__Host-` cookies must be host-only with path `/`. Strict SameSite for admin means links from email into admin lose the session once. Proposal: admin and storefront on the same origin, two separate cookies (`__Host-sid` Lax for customers, `__Host-asid` Strict for staff), admin never linked from email. Needed by Phase 1.

## C8. Payment gateway (provisionally resolved by decision 0010: Safepay, conditions apply)

The brief says one real implementation "for the gateway I name". No gateway is named. Phase 3 cannot start without it. Gateways differ by country, so the country input is also needed.

## C9. Return window and cut-off (owner wrote "recommend")

Recommendation, to be confirmed against local law: return window of 7 days from delivery for sealed items; customer cancellation allowed until the order is packed; unpaid bank transfer orders expire after a configurable number of days (proposed 3). These are configuration values, not code.

## C10. Hosting

Recommendation in `docs/deployment.md`. Final choice depends on country (latency, data residency law, gateway availability).

## C11. Lighthouse and the chatbot widget

The widget must not hurt the performance score on home, listing, product, and checkout. Plan: load the widget code on user request only (a "Chat" button, no auto-open). No decision needed, recorded as a design constraint.
