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

## Independent source clarity review

All twelve weekly Markdown entry points and the contributing guide were
reviewed. One substantive lifecycle omission was fixed: stop/restart the
server after backend changes, bind candidate checks to the actual SHA, and
request a new quote after a pricing change. Bounded re-review closed that
finding. This was source-text review, not a human classroom trial.

## What remains distinct

Native tests do not prove GitHub enforcement. Browser automation does not prove
screen-reader usability. A CodeQL analysis does not prove an absence of
vulnerabilities. An asset attestation does not approve deployment. Copilot/MCP
execution depends on actual learner access, active tools and policy, and is
not claimed as rehearsed here.

For current release results, inspect the exact tag's workflows and verify its
actual downloadable asset against the independently selected signer workflow.
