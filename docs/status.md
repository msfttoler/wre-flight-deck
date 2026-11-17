# Delivery and evidence status

Flight Deck separates a working application from the hosted evidence required
by a particular session. A source tag cannot manufacture the second.

## Application

The application is original teaching software with fictional schedule data,
real business-rule tests, an HTTP API and a browser client. Runtime requires
Node.js 24+ only. Developer browser tooling is declared and locked separately.
See the actual [Actions runs](https://github.com/msfttoler/wre-flight-deck/actions)
for revision-specific hosted results, not a copied success statement.

## Weekly readiness boundaries

| Weeks | Local application available | Hosted prerequisite |
| --- | --- | --- |
| 01 | Actual commit history | A clean history-preserving clone; lost-commit recovery only if actually observed |
| 02 | Native pricing and inventory tests | Actual PR/check and independently verified required-check configuration |
| 03 | No application mutation required | Actual signed-in account and effective access |
| 04 | Committed CI workflow | A visible actual run, event and checkout |
| 05 | Source packaging workflow | An existing downloadable release and successful signer-bound verification |
| 06 | CodeQL workflow, no intentional vulnerable code | An accessible actual finding/path; otherwise finding investigation is blocked |
| 07 | Working app and native tests | Existing Copilot access and an accepted bounded change request |
| 08 | Same working baseline as 07, not its completed work | Approved MCP server, exact tool inventory and usable existing access |
| 09 | Real local domain event journal | Actual GitHub App/bot evidence; local app events do not prove webhook delivery |
| 10 | Versioned workflow source | An accepted baseline and an independently authorized comparison |
| 11 | Source, history and collaboration inventory | A real destination requirement and a consequential comparison source |
| 12 | Working source and CI artifacts | Actual PR/run/checkout/artifact linkage for each inspected candidate |

Installing software or logging in does not establish a Copilot entitlement.
An authored workflow is not an executed workflow. A green check is not an
enforced merge gate. An attestation is not a production approval.

## Scoped read-only pilot

On 2026-11-16, an agent investigated Weeks 03 and 04 against revision
`59fae25ea3f18068e2140240d2fb606f35041974` with the repository owner's
ADMIN access. A same-repository issues API read succeeded; a misspelled path
returned 404 and the corrected path succeeded. The 404 was not a permission
denial. A [completed push run](https://github.com/msfttoler/wre-flight-deck/actions/runs/43515740797)
and its job checkout were inspected at that revision. All inspected jobs
already had timeouts, so no timeout was changed.

This was not an ordinary-learner permission test, UI rehearsal, classroom
pilot, PR-merge check or hosted change. The instructions changed afterward;
their complete delivery remains unreviewed.

## Existing WRE materials

These are new application entry points. They do not silently replace the
approved Week 02 classroom repository or rewrite the existing course's slides,
runbooks and companions. The new flight-oriented application and the older
checkout-oriented course wording need an explicit synchronized course update
before being presented as the same delivery route.

## Accessibility

The engineering target is WCAG 2.2 AA. See [accessibility](accessibility.md) for
the assessed formats, actual automation and remaining human review. No legal
certification, complete conformance or classroom rehearsal is claimed.
