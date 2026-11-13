# Accessibility review scope

Target: WCAG 2.2 A/AA for the browser application and learner documents.
Publication is report-only during remediation. This is an engineering target,
not a finding about the legal applicability of an ADA rule to this project.

Current official guidance was retrieved November 13, 2026:
- https://www.w3.org/TR/WCAG22/
- https://www.ada.gov/resources/web-guidance/
- https://www.ada.gov/resources/2024-03-08-web-rule/

## Inventory

| Asset | Verified criterion coverage | Failures | Unreviewed | Status |
| --- | --- | --- | --- | --- |
| Browser application, light/dark, desktop/mobile | Not established by an automated scan | See exact-revision browser report | Full A/AA assessment, screen reader and human usability | Review incomplete |
| GitHub-rendered README and weekly Markdown | Not established | No complete document audit performed | Reading order, link context and assistive-technology journey | Unreviewed |
| Application route map | Not established | See browser report | Full equivalent-experience assessment | Review incomplete |

The Playwright suite contains actual browser journey checks and axe automated
checkpoints. Run `npm run test:e2e` after installing the declared development
tools. Its report is bound to the code tested; a passing run is not a full
criterion review. Re-run after UI changes.

## Human review still required

Use the application with an appropriate screen reader, keyboard only, zoom,
text spacing overrides and high contrast settings. Check the full quote,
booking, cancellation, stale-update and error paths, both themes, and all
weekly document links. Review projected legibility and accommodation options
with actual facilitators and learners.

No human or assistive-technology review has been invented. Unknown criteria
remain unreviewed rather than passing by default.
