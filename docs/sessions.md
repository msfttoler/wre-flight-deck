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
| [03](week-03.md) | Compare human, CI and release authority | Pinned workflow source, actual job-token logs and a least-access decision |
| [04](week-04.md) | Investigate an Actions run and assess a job timeout | Event, checkout revision, actual durations and timeout decision |
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
The published Week 02 course remains unchanged. This companion points learners
to its approved checkout case in `msfttoler/wre-week-02`; it does not move that
source into Flight Deck or claim that a current check or merge gate was
observed. The Flight Deck baggage-fare example is a different scenario and is
not equivalent.
These Flight Deck guides are standalone companions, not replacements for the
existing WRE decks, notes or labs. In particular, the existing Week 07/08
materials use a different scenario. Do not mix the routes until the course
owner has aligned the materials.

## Choose the setup your task needs

Week 03 starts with a fresh clone and three customer questions; its public
browser fallback remains available. Week 04 can start with read-only GitHub
investigation. Neither needs an application server, Node or a learner branch
for the ordinary read-only work. Follow the week's guide for its actual target
and permission. Hosted
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
Use a bash-compatible terminal; on Windows, Git Bash is one option. Run the
commands in the stated order, and stop if a prerequisite fails. Git may open
long output in a pager; press `q` to return to the prompt. Shell variables set
in one terminal are not automatically available in another. On a narrow
screen, GitHub may horizontally scroll a command block. Use its **Copy code
to clipboard** button and paste into a plain-text editor with line wrapping
to read the entire command before substituting placeholders or running it.

`git switch -c ... wre-v1` creates a learner branch from the same intended tag,
not from another learner's work. Record `git rev-parse HEAD` and
`git rev-parse 'wre-v1^{commit}'`. On 2026-11-16, `wre-v1` resolved to
`59fae25ea3f18068e2140240d2fb606f35041974`; confirm the owner's approved
baseline before class because a tag can move. If absent or mismatched, mark
entry **BLOCKED**; do not silently substitute `main`, invent a SHA or create a
replacement tag. A published tag is not permission to move it.

When the week's application task requires it, run `npm test` from the clone
root for the real native Node test suite. Start `npm start` in a separate
terminal only when the task needs the app. Wait for your own server's
startup message before visiting its reported local address; do not browse
an unknown listener if the port is occupied. Stop your own server with
Ctrl-C. Expected behavior is not recorded execution.
`npm start` does not reload backend edits. Before browser checks after API
changes, stop your own server with Ctrl-C, confirm the intended clone and record
`git rev-parse HEAD`, then restart on the same selected port from that clone.
Reload the browser only after your server reports that it started. Stop the
server before switching revisions and start it from the intended checkout.
For pricing changes, request a **new quote**. Saved quote bytes retain their
recorded prices, but a changed rule can cause the app to reject old state
during startup. Keep `.data/` intact. Use a new, unused data directory only
for a separately labeled UI check; it does not prove old-state compatibility.
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

Weeks 04-11 use one common route: 00-10 customer framing, rewind and mental
model; one existing facilitator investigation from 10-28; retrieval, quiz,
strategy and handoff from 28-35; individual practice from 35-70;
self-check/debrief from 70-83; transfer and close from 83-85. Weeks 04-06
and 10 divide 28-35 into quiz 28-31, **Read, Rule Out, Return** 31-33 and
handoff 33-35. Weeks 07-09 and 11 put the same retrieval/strategy/handoff
sequence within 28-35.

Weeks 01 and 02 retain the opening and demonstration timings in their own
guides. Week 02 frames its approved checkout case at 00-12, investigates the
existing `wre-week-02` target at 12-30, uses retrieval/handoff at 30-35, and
keeps individual practice, debrief and close in the shared final windows.
Week 03 follows the aligned course timings in its own guide: three customer
questions before minute 11, worked demonstrations at 11-23, quiz at 23-28,
strategy at 28-32 and handoff at 32-35.

Week 12 uses its own final-session order: opening/frame/rewind/model 00-10,
manual quiz 10-13, strategy 13-15, the existing investigation/strategy clinic
15-33, handoff 33-35, capstone practice 35-70, debrief 70-83 and close
83-85. It adds no new demonstration.

Use paper, fingers or chat for the quiz; no quiz backend or speed ranking is
needed. Offer written answers and time accommodations. Read the requirement,
rule out an explanation using evidence, then return to the unresolved decision.
This is engineering retrieval, not exam preparation.

At 35 minutes, start independent work even if CI is pending. Protect all 35
practice minutes. During 70-83, spend five minutes checking your own evidence,
six on facilitator discussion and two recording the decision and remaining gap.
No peer review or approval dependency is part of the lab.

### Make the practice time useful

The checkpoints are planning estimates, not evidence that a session has
actually lasted 85 minutes. At 43 and 55 minutes, check the learner's target,
prediction, available evidence and next decision. Plan four to six minutes
inside practice for the relevant challenge below only when enough time remains
to finish the core decision and handoff before minute 70. Otherwise skip it
and prioritize that decision and handoff. A
written answer is enough; do not extend a blocked product step,
invent a result, change shared resources, or require another learner's review.

| Week | Further investigation using the same case |
|---|---|
| 01 | Compare the original and recovered commit's file snapshots and parent histories. Explain why matching content does not mean they are the same commit, and what happens to the saved edit if the original machine is lost. |
| 02 | For the proposed $60 rule, independently trace $59.99, $60 and $60.01 through the existing code and proposed assertion. Identify which old expectations would change. This is a source-based proposal, not a test result. |
| 03 | For each matrix row, name one action the actor needs and one broader permission that is unnecessary. Explain what an actual runtime log could add and what the source alone cannot prove. |
| 04 | Compare two accessible completed job durations for the same selected job, if available. Explain why a single fast run is not enough to set a timeout; if a second run is missing, name the exact additional evidence needed. |
| 05 | For the selected asset, distinguish matching bytes, a verified statement, and an approved producer. Explain which decision changes if the independently supplied digest is unavailable or differs; do not alter the asset. |
| 06 | For the actual alert, identify any input covered by available evidence and an uncovered or unknown input. For the body-limit fallback, compare the inputs in the existing tests. Explain what a local test would establish and why it would not itself establish a hosted scan result. |
| 07 | For the callsign request, write acceptance examples for an omitted, blank and unmatched filter. Compare them with an owner-approved callsign request if one exists; otherwise label the semantics as proposed and compare them with the observed source. Do not substitute this for the blocked boundary case. |
| 08 | Trace the one-bag decision at 24,999 and 25,000 cents through the pinned source, separately from the proposed coupon rule. Cite the line or test for each conclusion and state what a source read cannot prove about runtime or an MCP trace. |
| 09 | For the actual evidence chain, distinguish a delivered response from receiver processing and the business effect. Write the smallest redacted record request that could resolve the first missing link. |
| 10 | Compare the chosen invariant at the approved baseline and current revision, then describe one proposed change that would affect it. Without an approved baseline or invariant, use the current-only inventory, mark the comparison **BLOCKED** and name the owner evidence needed. Separate an actual diff from the proposal. |
| 11 | Choose a second inventory category from the same authorized source and explain how its acceptance check differs from the first. This is additional source analysis, not a substitute for the blocked second-repository transfer. |
| 12 | Challenge the same candidate with one other existing acceptance condition. Bind available evidence to the same SHA or artifact and explain whether the recommendation changes; keep missing conditions blocked. |

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
