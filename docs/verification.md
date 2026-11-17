# Verification record

Observed November 13, 2026. These are engineering checks, not a classroom
rehearsal, production approval or complete accessibility assessment.

## Initial application revision

Source: `39cc0d2eae225e38459a0a64b9e83424c0d3d307`.

| Check | Actual result |
| --- | --- |
| `npm test` locally | 108 passed |
| `npm run check` locally | Passed |
| Initial `npm run test:e2e` locally | 10 desktop/mobile journeys passed |
| Hosted Flight checks | Native tests on Node 24/26 and browser job succeeded |
| Hosted CodeQL analysis | Succeeded, reported three findings; scan success is not a clean finding count |

Hosted records:
- https://github.com/msfttoler/wre-flight-deck/actions/runs/43512675981
- https://github.com/msfttoler/wre-flight-deck/actions/runs/43512676079

The findings concern a static-file check/read race and two regular-expression
locations used to extract the application's own theme script. They were not
intentionally introduced or fabricated for Week 06. Findings and subsequent
fix status remain visible in GitHub code scanning.

## Repaired application revision

Source: `135af7786bbce9d8ba372455ae520e9c9323efea`.

| Check | Actual result |
| --- | --- |
| `npm test` locally | 113 passed, including new static-file descriptor and theme-byte tests |
| `npm run check` locally | Passed |
| Expanded `npm run test:e2e` locally | 12 desktop/mobile journeys passed |
| Fresh GitHub clone, no `node_modules`, `npm start` | Health endpoint passed; 8 airports and 18 flights available |
| Hosted Flight checks | Native tests on Node 24/26 and browser job succeeded |
| Hosted CodeQL | Analysis succeeded; zero open findings returned after the repair scan |

Hosted records:
- https://github.com/msfttoler/wre-flight-deck/actions/runs/43513567299
- https://github.com/msfttoler/wre-flight-deck/actions/runs/43513567014

The static-file fix opens without following a final symlink and validates and
reads the same descriptor. The theme hash uses the application's literal
script boundaries rather than a general HTML-filtering expression. No finding
was dismissed to obtain the clean scan.

## Polished interface revision

Source: `1df77c8e8cbe95b47871608555b3bf30cea7834e`.

`npm run check` and all 12 desktop/mobile Playwright journeys passed after the
focus, contrast and typography changes. The journeys now assert that the next
booking and departure-edit controls are actually inside the viewport, before
an automated fill action can scroll them into view.

Hosted Flight checks passed again on Node 24/26, including the browser job,
and CodeQL analysis succeeded:
- https://github.com/msfttoler/wre-flight-deck/actions/runs/43514755011
- https://github.com/msfttoler/wre-flight-deck/actions/runs/43514754967

## Independent source clarity review

This section records the November 13 review. The later weekly-guide rewrites
changed those files, so the earlier review does not certify their current text.

All twelve weekly Markdown entry points and the contributing guide were
reviewed. One substantive lifecycle omission was fixed: stop/restart the
server after backend changes, bind candidate checks to the actual SHA, and
request a new quote after a pricing change. Bounded re-review closed that
finding. This was source-text review, not a human classroom trial.

## Rendered interface review

The initial review inspected all five views at 1440, 375 and 320 pixels in
both themes. It identified off-screen next-step focus, low-contrast dark
badges and form boundaries, undersized metadata and three related minor
patterns. Source-level fixes were independently rechecked. Enlarging the map
labels exposed one collision, corrected by moving the SLC label pair rather
than shrinking it.

The final bounded recheck closed all findings from that review. It measured
the dark confirmed badge at 6.62:1 and enabled dark form boundaries at 4.62:1.
Mobile map codes measured 16.98px at 320 and 20.44px at 375. No map-label
intersections remained in the checked desktop/mobile views. This is a
scoped technical review, not complete WCAG conformance or physical projection
testing.

Reviewed final `web/app.js` SHA-256:
`9186bbbba156de4ccefc7eda948cbea8d26a1586fd75bad46f3638b79bd09f7d`.
The README image is an actual screenshot of this interface, not a mockup.
The map-only repair also passed `npm run check` and both theme/reflow
Playwright tests.

## What remains distinct

Native tests do not prove GitHub enforcement. Browser automation does not prove
screen-reader usability. A CodeQL analysis does not prove an absence of
vulnerabilities. An asset attestation does not approve deployment. Copilot/MCP
execution depends on actual learner access, active tools and policy, and is
not claimed as rehearsed here.

For current release results, inspect the exact tag's workflows and verify its
actual downloadable asset against the independently selected signer workflow.
