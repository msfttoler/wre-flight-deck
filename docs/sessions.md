# WRE Flight Deck sessions

These are application companions for twelve independent Well Rounded Engineer
sessions, not a replacement course, slide pack, certification or exam.
The illustrative customer is a regional airline's software team. Its engineers
need to change route planning, pricing, reservations and dispatch without losing
track of what was tested and who may act. The application is original fictional
software, not live aviation information or a real booking service.

## Choose one session

| Week | Capability | Evidence that matters |
|---|---|---|
| [01](week-01.md) | Recover a useful Git change without discarding other work | Diff, commit and recovered branch |
| [02](week-02.md) | Distinguish application tests from a required merge check | Assertion, exact run and current merge requirements |
| [03](week-03.md) | Separate identity, repository access and application exposure | Current actor, target and visible permission limits |
| [04](week-04.md) | Investigate an actual Actions run | Event, checkout revision, job and first actionable cause |
| [05](week-05.md) | Verify a release's actual provenance | Downloaded bytes, digest, attestation and trusted producer |
| [06](week-06.md) | Triage a genuine CodeQL result, if present | Actual alert path and analysis revision; otherwise BLOCKED |
| [07](week-07.md) | Turn a Copilot-assisted feature request into a reviewed change | Request, plan, diff, tests and personal review |
| [08](week-08.md) | Use source-grounded MCP context within tool boundaries | Exact source revision, real tool calls and verification |
| [09](week-09.md) | Trace a real GitHub App integration | Installation scope, delivery and receiver evidence |
| [10](week-10.md) | Assess workflow drift against a recorded baseline | Baseline SHA, current diff and execution impact |
| [11](week-11.md) | Inventory a repository before a migration decision | Source/settings inventory, unknowns and acceptance plan |
| [12](week-12.md) | Make an evidence-bounded release-candidate decision | One candidate SHA and a complete evidence/unknowns record |

No previous week, completed lab, existing learner branch or persistent app state
is a prerequisite. Week 01 and Week 02 are included here as new app entry points.
The published Week 02 course remains unchanged; this companion does not inherit
its approval or claim an equivalent required-check gate.

## Choose the setup your task needs

Weeks 03 and 04 can start with read-only GitHub investigation; neither needs
an application server, Node, a learner branch or a clone just to inspect hosted
evidence. Follow the week's guide for the actual target and permission. Hosted
reads need existing authorized access; a public browser view does not prove a
particular account's permissions.

Check `gh --version` and `gh auth status --help` when the task uses GitHub CLI.
If help lists both `--active` and `--no-refresh`, use
`gh auth status --active --no-refresh --hostname github.com` to inspect only
the active account without refreshing it during that status check. Otherwise
skip the status command and record that status as unknown. Do not paste account
metadata or credentials, use token-display options, or expand token scopes.

## For application or local-edit work, use a fresh clone

App work needs Node.js 24 or later, npm, Git and a browser. Check
`node --version`, `npm --version` and `git --version`; read
[the API contract](api-contract.md) before changing behavior. A read-only
source investigation can clone without creating a branch or starting the app.

When a guide calls for a local edit, run its clone and branch commands from a
parent directory you own. Replace `YOUR-ID` with a non-sensitive unique handle
and attempt suffix, for example `river-a1`. Choose a new directory and branch
for every attempt. These names select workspaces; they do not provision access.

`git switch -c ... wre-v1` creates a learner branch from the same intended tag,
not from another learner's work. Record `git rev-parse HEAD` and
`git rev-parse 'wre-v1^{commit}'`. On 2026-11-16, `wre-v1` resolved to
`59fae25ea3f18068e2140240d2fb606f35041974`; confirm the owner's approved
baseline before class because a tag can move. If absent or mismatched, mark
entry **BLOCKED**; do not silently substitute `main`, invent a SHA or create a
replacement tag. A published tag is not permission to move it.

When the week's application task requires it, run `npm test` from the clone
root for the real native Node test suite. Start `npm start` in a separate
terminal only when the task needs the app, and visit `http://127.0.0.1:3000`.
Stop your own server with Ctrl-C. Expected behavior is not recorded execution.
`npm start` does not reload backend edits. Before browser checks after API
changes, stop your own server with Ctrl-C, confirm the intended clone and record
`git rev-parse HEAD`, then restart `npm start` from that clone and reload the
browser. Stop the server before switching revisions and start it from the
intended checkout. For pricing changes, request a **new quote**: existing quotes
retain their earlier persisted prices. Keep `.data/` intact.
If the package, entry point or UI is missing, runtime work is **BLOCKED**.
There is no lesson setup, solution or grading script.

Read the live schedule rather than assuming a calendar date, flight ID or seat
count. Use the browser to plan a route, inspect a quote and, where useful, make
or cancel a fictional reservation in your own local app. Use a fictional team
callsign, never passenger information. Application state persists in ignored
`.data/`; a fresh clone gives an independent workspace. Tests use isolated
temporary directories. Never delete someone else's data to reset a lesson.

The app is local-only, single-process development software without authentication.
Do not expose it publicly, enter real booking data or turn off browser-origin
checks. `/api/events` is an application journal, **not** GitHub webhook evidence.

## One-time owner preparation, not learner prerequisites

Before delivery, the owner must confirm the real app/test/UI baseline and
approved `wre-v1` SHA. Configure and verify any intended
CI, CodeQL and release-provenance workflows against actual revisions. Record
check names, run URLs, analysis availability and release assets only after they
exist. Workflow YAML alone does not establish a required check or successful run.

Where applicable, supply authorized read-only access to rules/checks and a
real GitHub App's delivery/receiver records, with secrets removed. App integration
may remain unavailable; do not add a substitute local webhook service for class.
Document the selected Copilot surface and approved MCP server, available tools,
entitlement and policy before Weeks 07/08. Learners do not install an App, alter
repository rules, administer an organization or obtain a peer's approval.

Hosted mutations, pushes, PR creation, reruns, workflow dispatch, installations,
merges and publication require separate permission for the exact target/effect.
The ordinary route works with local branches and read-only hosted investigation.
Record blocked effects rather than trying them to obtain a denial.

## Shared 85-minute delivery

Weeks 01-11 use: 00-05 customer problem; 05-12 mental model and setup;
12-30 facilitator demonstration; 30-33 manual **Live Quiz Sprint**;
33-35 **Read, Rule Out, Return** and handoff; 35-70 individual practice;
70-83 self-check/debrief; 83-85 transfer and close.
Week 12 retains the six-part final-session route shown in its guide.

Use paper, fingers or chat for the quiz; no quiz backend or speed ranking is
needed. Offer written answers and time accommodations. Read the requirement,
rule out an explanation using evidence, then return to the unresolved decision.
This is engineering retrieval, not exam preparation.

At 35 minutes, start independent work even if CI is pending. Protect all 35
practice minutes. During 70-83, spend five minutes checking your own evidence,
six on facilitator discussion and two recording the decision and remaining gap.
No peer review or approval dependency is part of the lab.

## Evidence and status

Keep a small local note outside tracked app files. Record repository/target,
baseline and candidate SHAs, UTC observation time, account role (no credentials),
UI URL or exact command, actual result, evidence location and limitation.
For local work, include diff and actual test result. For hosted work, include
the event, run/attempt, checkout revision and conclusion. Preserve pending,
skipped, denied and unavailable states.

- **PASS:** the named check actually ran and met its stated criterion.
- **FAIL:** observed evidence contradicts that criterion.
- **BLOCKED:** needed access, data, tool or hosted effect is unavailable.
- **UNREVIEWED:** the step or review has not been performed.

An application test is not a ruleset. An authenticated actor is not automatically
authorized. A signed statement is not approval of its producer. A plan or proposed
repair is not an executed change. Neither a model response nor a green summary
proves native UI rehearsal, classroom effectiveness or production readiness.

## Delivery state

These are authored instructions, not run transcripts. A scoped historical
read-only pilot is recorded in [delivery status](status.md); it is not a full
rehearsal or ordinary-learner permission test. Hosted-dependent steps are
**BLOCKED pending the relevant actual evidence**. Full UI, accessibility and
classroom reviews are **UNREVIEWED**. Check current official guidance and client
help before delivery; UI labels and tool availability can change.

Use [GitHub Docs](https://docs.github.com/), the installed `gh help`, and
[Node test runner documentation](https://nodejs.org/api/test.html) to resolve
current behavior. Links are reference starting points, not a claim that current
guidance or this journey has been independently verified.
