# How Flight Deck fits together

## One process, useful boundaries

The browser and JSON API are served by one Node.js process. The domain
modules can be tested independently. This is intentionally not a fleet of
microservices: distribution would add operational setup without improving the
engineering decisions these sessions teach.

| Boundary | Owns | Important failure |
| --- | --- | --- |
| Network and planning | Airport graph, flight schedules, legal connections | A short connection is not a valid itinerary |
| Pricing | USD cents, discount scope, baggage threshold, total tax | A passing happy boundary can miss the value just below it |
| Reservations | Quote expiry, all-leg availability, idempotency | Retrying a request must not allocate seats twice |
| Operations | Gates, state transitions, revision checks | Two operators cannot silently overwrite the same revision |
| Persistence | Atomic state replacement in an isolated data directory | A failed write must not become a reported success |
| Event journal | Local business events and request correlation | An app event is not a GitHub webhook delivery receipt |

## Money is data, not floating-point display math

Use integer cents at API and storage boundaries. `FIRSTFLIGHT` discounts base
fares, not bags. The first bag is included when the base fare per passenger
reaches 25000 cents. The fictional service tax is 750 basis points, rounded
half up once on the final taxable total. The policy is deliberately explicit
so learners can reason about boundaries. It is not a claim about real airline
pricing, payment settlement or a jurisdiction's tax law.

## A quote is not a seat hold

The price is recorded for 15 minutes. A confirmed booking must recheck capacity
on every leg and allocate all legs together. An idempotency key distinguishes
an identical network retry from a new booking attempt. A stale operations
version is a conflict, not permission to overwrite another change.

## Independent weeks

All twelve entry points use the same `wre-v1` source tag. Learners start clean
and make their own branches. Choosing another unused data directory gives the
application independent local state without undoing source work. A branch or
tag does not copy GitHub issues, runs, releases, alerts, rulesets or approvals.
Those are inspected on their actual source repository and revision.

## What this architecture does not provide

No authentication, multi-tenant isolation, real ticket issuance, external
flight feeds, payment processing, durable distributed transactions or
multi-process database. Filesystem persistence is appropriate only for this
local single-process application. Production work would need an authenticated
service boundary, transactional database, retention/privacy decisions, real
provider integrations and operational ownership.
