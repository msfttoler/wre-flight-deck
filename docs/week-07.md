# Week 07: Plan, inspect, then decide whether a feature needs changing

Support needs to find a reservation without scanning the full list. Use the
existing status-filter request to connect a customer need to an actual baseline.
The independent callsign-filter case changes the query and its acceptance
questions. Neither is a staged defect.

**By the end:** use GitHub.com to understand the request and ask for a plan;
inspect the pinned code and tests; then make a bounded local change only if the
baseline misses the request and the owner has authorized that effect. Otherwise
record an evidence-backed no-change decision or the exact blocker.

**Facilitator case:** [Issue 1: filter confirmed and cancelled reservations](https://github.com/msfttoler/wre-flight-deck/issues/1).
**Independent case:** the callsign filter below is a separate proposed
requirement, not part of Issue 1. It needs its own owner-approved scope before
any edit.

## Target, role, tools, and effects

- **Target:** `msfttoler/wre-flight-deck`, at the owner's approved full `wre-v1`
  SHA. Each learner uses an independent clone. GitHub.com is for reading Issue
  1 and Copilot Chat planning; native Git and the project's Node test runner
  inspect the pinned baseline and any local candidate.
- **Role:** existing read access to the repository and issue; local edit access
  only to the learner's own clone after the owner confirms the exercise's
  local-only scope. No administrator role, peer approval, issue write, PR,
  commit, push, merge, or release is needed or authorized.
- **Copilot:** confirm the signed-in identity, actual seat/entitlement, policy,
  available surface, and effective tools before using it. A login or installed
  CLI is not proof of access. Do not assume a model, feature, or plan mode.
  If the surface cannot be kept to planning, do not send it the task; record
  Copilot as **BLOCKED** and continue only with clearly labeled manual work.
- **Runtime:** Git, Node.js 24+, npm, and a browser are needed for baseline
  tests and any authorized local change. Do not start the app during setup.
  Start your own server only if a warranted change needs a local UI check.

## Before class: prepare a clean, independent clone

Read [shared setup and evidence](sessions.md) and the
[booking API contract](api-contract.md). Use a bash-compatible terminal; on
Windows, Git Bash is one option. From a parent directory you own, replace
`river-a1` with a unique, non-sensitive attempt name:

```bash
cd ~
git clone https://github.com/msfttoler/wre-flight-deck.git wre-w07-river-a1
```

Only after cloning succeeds, enter the new directory and check the target:

```bash
cd ~/wre-w07-river-a1
```

If `cd` fails, stop before running Git. Otherwise:

```bash
git remote -v
git status --short --branch
git rev-parse 'wre-v1^{commit}'
git --version
node --version
npm --version
```

Confirm the origin is `msfttoler/wre-flight-deck`, the worktree is clean, and
the tag matches the owner's approved SHA. Do not share a credential-bearing
remote URL. Do not create a branch yet: the baseline may already meet the
approved request. A missing or mismatched target is **BLOCKED**; do not
substitute `main`. Record the full SHA, UTC time, account role without
credentials, and any access or runtime limitation outside tracked files.

Check `copilot --version` and `copilot --help` only if that client is installed.
Do not install it, sign in, expand scopes, or change policy for this session.
The owner confirms which planning and implementation surfaces are actually
available. If the required AI surface is unavailable, its step is **BLOCKED**;
a manual plan or edit is not Copilot completion.

## 00-10: Frame the customer question

**00-03 — Customer problem.** Support needs to find a booking without
scanning the full reservations list. The facilitator's status-filter request
is a proposal; the existing application is not a staged defect.

**03-05 — Three questions.** Ask learners to predict:

1. What does support need to find in the list?
2. Does hiding a booking stop someone from reading it? **No; a filter is not
   authorization.**
3. What evidence would show that the filter changes the actual API result
   without changing the saved booking?

**05-07 — Flash Rewind.** A proposed plan is not a code change, and a
generated test is not independent proof.

**07-10 — Mental model and setup.** The Reservations view reads
`GET /api/bookings`. A server filter changes the response; a browser-only hide
changes only what is displayed. The issue supplies proposed acceptance
criteria, not proof of implementation. Confirm the target and approved full
baseline SHA. No branch exists until the source and tests show a needed,
authorized local change. If Copilot is unavailable, manual work is not Copilot
completion.

## 10-28: One facilitator demonstration

Use the facilitator's independent clone. Start with the issue because it
defines the request; then inspect the exact baseline before deciding whether
to edit. Do not touch learner workspaces.

1. **10-13 - Read the request and ask for a plan.** In GitHub.com, open Issue
   1 and read its acceptance and scope. If the currently available Copilot
   Chat surface can be kept to a plan-only interaction, ask it to plan an
   optional `status` query for `GET /api/bookings`, preserving omitted-filter
   ordering, rejecting unsupported values, leaving inventory/events/bookings
   unchanged, and adding a labeled control plus empty state. Ask for actual
   source and test paths. Do not assign an agent, request a PR, comment, or
   ask for an edit. If the surface exposes write/action tools that cannot be
   held out of this interaction, do not submit the case; write the plan
   manually and mark the Copilot step **BLOCKED**.
2. **13-18 - Inspect the actual baseline.** Replace the placeholder with the
   full owner-approved SHA already checked against `wre-v1`:

   ```bash
   BASE_SHA='PASTE_APPROVED_FULL_WRE_V1_SHA'
   git rev-parse --verify "${BASE_SHA}^{commit}"
   git status --short --branch
   git grep -n -e 'api/bookings' -e 'bookings()' "$BASE_SHA" -- \
     src/server.mjs src/service.mjs web/app.js test/http.test.mjs
   git show "${BASE_SHA}:src/server.mjs"
   git show "${BASE_SHA}:src/service.mjs"
   git show "${BASE_SHA}:web/app.js"
   git show "${BASE_SHA}:test/http.test.mjs"
   ```

   Compare the plan with the code, not just its citations. At the inspected
   `wre-v1` source, the GET route returns the full `service.bookings()` list;
   the service reverses that list, the UI requests it without a filter, and
   existing HTTP tests cover booking/cancellation but not status filtering.
   Treat that as a source observation, not an executed test or hosted result.
   If the approved SHA differs, inspect that exact SHA instead of assuming
   the same gap. If any command fails or the worktree is dirty, stop and
   preserve it.
3. **18-21 - Run the native baseline and decide.** From the verified clone
   root, if `HEAD` differs from the verified `BASE_SHA`, switch only your
   clean, disposable clone to that exact commit:

   ```bash
   git rev-parse HEAD
   git switch --detach "$BASE_SHA"
   git rev-parse HEAD
   ```

   Skip the switch when `HEAD` already equals `BASE_SHA`. Stop if switching
   fails or the final full SHA differs. Only then run `npm test` and record
   the actual command, result, and exit code before any edit. A baseline failure is not evidence that the filter caused
   it. If the source already meets the approved request, record **no change**
   with the relevant paths and actual baseline test result; do not make a
   branch. If the requirement is missing, verify that the owner authorized
   only local work in this disposable clone. Missing authorization, scope,
   or a resolvable baseline failure means stop or mark the change **BLOCKED**.
4. **21-24 - Make only a warranted local change.** Only after an observed
   gap and owner authorization, create a unique local branch from the same
   SHA:

   ```bash
   git switch -c learner/w07-river-a1 "$BASE_SHA"
   git rev-parse HEAD
   ```

   Keep the change within the approved status-filter behavior. Use Copilot
   CLI only if its installed help, signed-in entitlement, policy, and
   session tool approvals support the authorized local edit. Check
   `copilot --help` for the supported tool-allowlist and denial options.
   Use the installed client's documented inventory or an owner-supplied,
   verified inventory to identify the exact tools for approved local reads
   and edits. The CLI help alone does not establish those identifiers. If
   they cannot be discovered and verified, mark the AI edit **BLOCKED**.
   Otherwise replace the placeholder with those exact identifiers, using
   the installed client's documented format:

   ```bash
   WRITE_TOOLS='REPLACE_WITH_VERIFIED_TOOL_IDENTIFIERS'
   copilot --available-tools="$WRITE_TOOLS" --deny-tool=shell
   ```

   Check the installed help before launch and inspect the effective tool
   inventory and permissions before submitting the
   request; disable unrelated MCP servers using current help. If the
   allowlist or denial options are unavailable, identifiers are unknown, or
   extra servers or capabilities remain, exit and mark the AI edit
   **BLOCKED**. Run tests separately in your own shell. Do not approve shell,
   URL, credential, hosted
   write, or unrelated file requests. Manual edits are allowed only within
   the same owner-approved local scope. No commit, push, issue edit, PR, or
   release.
5. **24-28 - Inspect actual evidence.** If edited, inspect the full
   unstaged/staged diff and status; preserve unexpected work. From the clone
   root, run:

   ```bash
   git status --short
   git diff --check
   git diff
   git diff --cached --check
   git diff --cached
   npm test
   ```

   Open every untracked file listed by status and expand any listed
   directory. Check the
   requested cases: omitted filter and order, `confirmed`, `cancelled`,
   unsupported input, empty results, and unchanged inventory, versions,
   events, and stored bookings. If an app change warrants a UI check, only
   then start your own server from this clone, using a fresh owned data
   directory:

   ```bash
   npm start
   ```

   Wait for its startup message, use fictional callsigns, and stop only that
   server with Ctrl-C. A port conflict is not permission to stop or browse
   another process. Record actual UI and test results, or **BLOCKED** /
   **UNREVIEWED**. If no edit was warranted, do not start a server or invent
   a UI result.

At minute 28, pause even if the implementation is incomplete. Say what was
actually observed and move the room to retrieval.

## 28-35: Retrieval and handoff

**28-31 - Manual Live Quiz Sprint.** Ask for a written answer, a show of
fingers, or chat; no quiz service or speed ranking is needed.

1. Does a generated assertion independently prove the generated code correct?
2. Does a status filter restrict who can read bookings?
3. Does an accepted plan mean the change has been implemented?

Facilitator key: **no** to all three. Explain that expected behavior must be
checked against the request, not just against the implementation.

**31-33 - Read, Rule Out, Return.** Read the acceptance condition; rule out a
browser-only filter as evidence of server filtering; return to the actual API
response and diff.

**33-35 — Handoff.** The independent case changes the query from status to
callsign and needs its own acceptance decision. Start at minute 35 even if
the facilitator's Copilot or UI evidence is blocked.

## 35-70: Independent practice - filter by callsign

When your core work is on track, use the [Week 07 investigation challenge](sessions.md#make-the-practice-time-useful).

Use a fresh independent clone at the approved `wre-v1` SHA, not the
facilitator's source changes or another learner's work. The callsign filter
is a proposed separate case, not an accepted extension of Issue 1. Ask the
task owner to confirm its acceptance and local-only edit scope. Without that
confirmation, complete the source-based assessment and write a proposal only;
do not edit.

1. **35-40:** In GitHub.com, read the approved owner request or the written proposed
   acceptance. If Copilot Chat supports a plan-only route, ask it to plan an
   optional exact callsign filter; otherwise record the AI plan as **BLOCKED**
   and write the plan manually.
2. **40-48:** In your own clone root, assign your own `BASE_SHA` to the owner-approved
   full SHA as shown in demo step 2. Resolve it and compare it with your
   approved `wre-v1` tag. Stop if it is blank, missing, mismatched, or the
   worktree is dirty. Inspect that SHA with the demo's `git grep` and
   `git show` commands. Before `npm test`, follow demo step 3 to ensure
   `HEAD` equals that SHA; stop on a failed switch or mismatch. Record
   whether source/tests already satisfy the confirmed requirement.
3. **48-54:** Decide the case semantics with the owner: exact or case-insensitive
   matching, blank and omitted parameters, no-match response, ordering, and
   unchanged bookings/inventory. A plausible proposal is exact matching,
   blank as no filter, omission as the full list, and no matches as an empty
   list; it is not an approved requirement until the owner confirms it.
   This filter is not the course's approved below/at/above boundary case.
   Until the owner binds such a distinct real case and counterexample, record
   canonical boundary-case transfer **BLOCKED**, not completed.
4. **54-60:** If the observed baseline misses the approved requirement and local edits
   are authorized, create your own branch at `BASE_SHA`, then make only that
   bounded filter and its focused tests. Use the same Copilot/tool limits as
   the demo or edit manually within the authorization. If no change is needed,
   record **no change** and the actual baseline test result. If authorization
   or evidence is missing, mark the edit **BLOCKED**.
5. **60-66:** Inspect the real diff and run `git diff --check` and `npm test` after an
   edit. Start your own app server with fresh local state only if an actual UI
   change needs checking. Record actual results; do not delete `.data/` or
   claim an unperformed UI check.
6. **66-70:** Save a short note outside tracked app files: issue or owner-approved
   request, baseline SHA, decisions, source/test paths, plan, actual diff or
   no-change evidence, commands and results, limitations, and next owner.
   Do not copy credentials, private payloads, or an invented transcript.

### Progressive hints

1. Read the owner-approved acceptance before asking for a plan.
2. Compare that plan with the exact source and tests at `BASE_SHA`.
3. Edit only if the observed gap and local authorization both exist; otherwise
   record no change or the specific block.

## 70-83: Self-check and debrief

**70-75:** Check your request against the diff, test output, and UI
observation. Label an unrun check **UNREVIEWED** and an unavailable tool
**BLOCKED**. Do not call a local diff a pull request.

**75-81:** Discuss: Which assertion would catch a server returning every
booking? What would still be needed to establish authorization? If tests
pass but the UI fails, inspect the actual request and rendering; neither
result erases the other.

**81-83:** Record the decision and the next owner/action. If an assistant
edited unrelated work, stop, inspect the diff, and preserve that work before
making any correction; do not reset the branch.

## 83-85: Transfer and close

Transfer the method to a customer's change: provide the scoped
request, independently checked diff, actual test result, and remaining gaps.
Stop only your own server with Ctrl-C. Hosted checks, classroom rehearsal,
and any unperformed assisted steps remain unreviewed.

Reference: [GitHub's current VS Code agent-mode instructions](https://docs.github.com/en/copilot/how-tos/copilot-in-your-ide/use-copilot-agents/use-agent-mode?tool=vscode).
