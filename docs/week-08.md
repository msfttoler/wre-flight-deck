# Week 08: Read-only MCP investigation of a pricing boundary

The pricing owner asks whether `FIRSTFLIGHT` should require at least 20,000
cents of combined party **base fare**, excluding bags and tax. Inspect the
request and the pinned source; do not implement it. The source at `wre-v1`
does not already enforce this proposed minimum. A prior bag-inclusive lab
policy is a distinct, incompatible counterexample, not Issue 2's acceptance.

**By the end:** compare the issue's 19,999/20,000-cent boundary with the
source, then analyze the separate question of whether a 19,000-cent base fare
plus a 2,500-cent bag meets a base-fare-only minimum. Establish each statement
with a real read-only MCP trace and native Git corroboration, or record the
MCP work **BLOCKED**. This session makes no code, application-state, server,
or hosted changes.

**Product request:** [Issue 2: FIRSTFLIGHT minimum combined base fare](https://github.com/msfttoler/wre-flight-deck/issues/2).
The request is proposed behavior, not a defect already present at the pinned
baseline. The bag-inclusive threshold question is a distinct counterexample:
Issue 2 excludes bags, so a charged bag cannot turn 19,000 cents of base fare
into 20,000 eligible base-fare cents.

## Target, role, tools, and effects

- **Target:** `msfttoler/wre-flight-deck` at the owner's approved full `wre-v1`
  SHA. GitHub.com is for reading Issue 2 and its acceptance. An already
  authorized, read-only MCP tool must retrieve the same repository and exact
  SHA. Native Git `show` corroborates the returned files.
- **Role:** repository and issue reader only. No administrator, owner,
  reviewer, app write, workflow dispatch, PR, issue comment, or hosted
  mutation is needed or authorized.
- **MCP:** use only an already configured and authorized client/server.
  Inspect its actual tool inventory and effective allowlist, including the
  official GitHub MCP read-only route. Do not install or configure a server,
  create credentials, expand scopes, or infer a tool name. If the read-only
  boundary, target repository, or immutable SHA cannot be verified, do not
  call the tool; record MCP **BLOCKED**.
- **Effects:** read Issue 2, the pinned source and tests; record a private
  learning note. Do not edit files, create a branch, run tests, start an app,
  create quotes, or change local/remote state. A read-only native Git
  comparison is partial evidence, not an MCP trace.

## Before class: verify a read-only target

1. The owner confirms the approved full `wre-v1` SHA and the already
   authorized MCP server, client, read tools, target restrictions, and
   observable tool-call history. Check the actual signed-in identity,
   entitlement, policy, installed client version and help. For Copilot CLI,
   if installed, inspect `copilot --version`, `copilot --help`, and the
   available MCP/tool controls. Do not sign in, install a client/server,
   change policy, or assume a plan/model/feature. If any boundary is unclear,
   mark that assisted step **BLOCKED**.
2. Read [shared setup and evidence rules](sessions.md). In a parent directory
   you own, make a clean clone and inspect the tag; do not create a branch:

   ```bash
   cd ~
   git clone https://github.com/msfttoler/wre-flight-deck.git wre-w08-river-a1
   ```

   If cloning fails or the destination exists, stop and choose an unused
   name. Only after it succeeds, enter the new directory and inspect it:

   ```bash
   cd ~/wre-w08-river-a1
   ```

   If `cd` fails, stop before running Git. Otherwise:

   ```bash
   git remote -v
   git status --short --branch
   git rev-parse 'wre-v1^{commit}'
   git --version
   ```

   Replace `river-a1` with a unique, non-sensitive attempt name. Confirm the
   origin, clean worktree, and full tag SHA against the owner's approved
   value. A missing/mismatched tag is **BLOCKED**; do not substitute `main`.
   Do not copy credential-bearing remote URLs or private tool output into
   shared materials.
3. Keep the exercise read-only after cloning. Do not run `npm install`,
   `npm test`, `npm start`, or an application flow. No learner needs a prior
   week's workspace or another learner's notes.

## 00-10: Frame the question

**00-03 — Customer problem.** A coupon policy needs a clear minimum that
doesn't count baggage or tax as base fare. Issue 2 proposes 20,000 cents;
the pinned source is not presumed to implement it.

**03-05 — Three questions.** Ask learners to predict:

1. What exact amount does Issue 2 count toward eligibility?
2. Does 19,999 cents pass, and what changes at 20,000 cents?
3. Does 19,000 cents of base fare plus a 2,500-cent bag pass a
   base-fare-only minimum?

**05-07 — Flash Rewind.** Retrieved text is evidence only when its repository,
revision and path are known. MCP access is not permission to write or execute.

**07-10 — Mental model.** GitHub.com displays the customer request. MCP
provides a source read only within its actual authority. Native Git reads the
same pinned commit independently. Keep the requested policy separate from
what current code and tests actually establish. Predictions are not
observations.

## 10-28: One facilitator demonstration

Use the facilitator's own clean clone. Learners do not share the facilitator's
tool session, credentials, or workspace.

1. **10-13 — Read the request and verify the tool boundary.** In GitHub.com,
   open Issue 2 and record the exact acceptance and its exclusions. In the
   already-authorized MCP client's actual tool inventory, verify the read
   tool, target restriction, and that no write, command, arbitrary URL,
   delegation or alternate-server route is available to this investigation.
   Check the effective credential scope separately; a read-only server is
   not proof of a read-only credential. Record the client version,
   server/tool names and effective controls without recording credentials.
   If any control, credential scope, or tool-call history cannot be
   verified, stop the MCP route and label it **BLOCKED**. An injection
   exercise is not performed here; record exposure **NOT OBSERVED**, not a
   successful defense or denied tool call.
2. **13-18 — Ask the first pinned-source question.** Only if the preceding
   control checks succeeded, use the approved MCP read tool to retrieve
   only `src/pricing.mjs`,
   `test/pricing.test.mjs`, and, if needed, `docs/api-contract.md` from
   `msfttoler/wre-flight-deck` at the exact approved full SHA. Ask:

   > At this exact repository and commit, does the source enforce Issue 2's
   > FIRSTFLIGHT minimum on combined party base fare, excluding baggage and
   > tax? Trace the pricing calculation and existing tests. Report the exact
   > tool arguments, repository, commit, paths, and line references. This is
   > a read-only investigation: do not edit, execute, browse another target,
   > or use credentials.

   Capture the actual MCP server/tool name, arguments (including repository,
   ref and paths), result/error, and timestamp. Do not invent a transcript or
   substitute a prompt for an observed tool call. If the call omits or cannot
   bind the immutable SHA, stop and mark the MCP read **BLOCKED**.
3. **18-22 — Corroborate the first answer with native Git.** From the clean
   clone, substitute the full verified SHA:

   ```bash
   BASE_SHA='PASTE_APPROVED_FULL_WRE_V1_SHA'
   git show "${BASE_SHA}:src/pricing.mjs"
   git show "${BASE_SHA}:test/pricing.test.mjs"
   git show "${BASE_SHA}:docs/api-contract.md"
   ```

   Compare the exact paths and evidence, not just the summary. At the
   inspected `wre-v1` baseline the pricing source calculates base fare,
   baggage, discount, tax and total but contains no 20,000-cent minimum;
   the pricing tests cover other pricing rules, not Issue 2's boundary. This
   is a source observation, not an executed test or a runtime result. If
   native Git and MCP disagree, report the discrepancy and stop short of a
   conclusion.
4. **22-26 — Investigate the independent counterexample.** If the MCP
   boundary is verified, make a second read-only MCP call, still pinned to
   the same SHA, for the pricing source,
   API contract and only the tests needed to check the separate
   bag-inclusive policy:

   > Compare two hypothetical party fares against Issue 2's base-fare-only
   > 20,000-cent minimum: (A) 19,000 cents base fare plus a 2,500-cent
   > charged bag, and (B) 20,000 cents base fare with no bag. Does baggage
   > change eligibility under Issue 2? Distinguish the requested rule from
   > current code, cite exact source paths/lines, and make no edits or calls
   > beyond read-only source retrieval.

   Capture the actual call and result separately. Corroborate the same
   source paths with native `git show` at `BASE_SHA`. The acceptance-based
   conclusion is that A is below the requested base-fare minimum and B is at
   it; do not claim the pinned application actually rejects or accepts
   either quote, because the rule is absent. The older bag-inclusive lab
   policy is a different, conflicting proposal.
5. **26-28 — State the finding and limits.** Identify what the issue asks,
   what the source and tests show, and what the source does not establish.
   If MCP was unavailable, a native read can still support a source
   assessment, but label MCP evidence **BLOCKED**. No actual MCP result means
   no claim that MCP was exercised. Do not run code or infer runtime
   behavior.

## 28-35: Retrieval and handoff

**28-31 — Manual Live Quiz Sprint.**

1. Does a 2,500-cent bag make 19,000 cents of base fare meet Issue 2's
   threshold? **No.**
2. Does the source's lack of a minimum prove that a live quote was rejected?
   **No; no such runtime check was performed.**
3. Does a native `git show` prove an MCP tool call occurred? **No.**

**31-33 — Read, Rule Out, Return.** Read the acceptance; rule out a bag or tax
as base fare and a source read as runtime evidence; return to the actual
MCP trace and pinned Git source.

**33-35 — Handoff.** The independent exercise changes the boundary input and
asks learners to substantiate the comparison without editing. Start at
minute 35 even if MCP is **BLOCKED**; use native reads only as explicitly
partial evidence.

## 35-70: Independent read-only practice — inspect bag inclusion

When your core work is on track, use the [Week 08 investigation challenge](sessions.md#make-the-practice-time-useful).

Use your own clean clone, approved SHA, and independently authorized
read-only MCP session. Do not inherit the facilitator's trace. Issue 2 also
requires preserving existing bag inclusion. Investigate that separate source
question: how does one requested bag change at **24,999 versus 25,000 cents
per passenger**, and does the coupon change that inclusion threshold?

1. **35-40:** In GitHub.com, reread Issue 2's preserved baggage requirement. Predict
   the inclusion result at each per-passenger amount and whether the coupon
   changes it. A prediction is not an application observation.
2. **40-46:** In your own clone root, assign your own approved full SHA and resolve it:

   ```bash
   BASE_SHA='PASTE_APPROVED_FULL_WRE_V1_SHA'
   git rev-parse --verify "${BASE_SHA}^{commit}"
   git rev-parse 'wre-v1^{commit}'
   ```

   Stop before any source read if the value is blank, either command fails,
   or the full results do not match the owner's approved SHA. Verify the
   target, client version, effective read-only MCP controls and credential
   scope using the demo's checks. If the tool cannot be restricted to the
   repository and immutable commit, do not call it; record **BLOCKED**.
3. **46-52:** If the MCP boundary is verified, make one actual MCP read for the source
   and tests that decide the question; otherwise skip it and record
   **BLOCKED**. Capture the real tool/server, arguments, full pinned ref,
   returned paths, result/error, and UTC observation time. No command
   execution, implementation, or file writes.
4. **52-59:** Corroborate with native Git only:

   ```bash
   git show "${BASE_SHA}:src/pricing.mjs"
   git show "${BASE_SHA}:test/pricing.test.mjs"
   git show "${BASE_SHA}:docs/api-contract.md"
   ```

   Do not run tests or the app. If the MCP read is unavailable or
   uninspectable, these commands are partial source evidence only.
5. **59-65:** Record the source-backed bag-inclusion conclusion and cite the source and
   existing tests you actually read. At the pinned baseline, inclusion is
   based on fare per passenger before the coupon, with the first bag included
   at 25,000 cents. This source observation does not establish an executed
   quote or a test run. Keep Issue 2's proposed minimum separate from the
   existing bag-inclusion rule.
6. **65-70:** Save a brief note outside the clone's tracked files: approved SHA, issue
   acceptance, actual MCP trace or **BLOCKED** reason, native paths read,
   both comparisons, limits, and next owner. Do not save credentials or
   copy private/internal tool data into public artifacts.

### Progressive hints

1. Follow the price fields separately; do not treat subtotal as base fare.
2. Keep the issue's requested rule distinct from the current pricing code.
3. If an MCP call cannot prove its target and pinned ref, stop that route;
   a native source read is useful but not a substitute trace.

## 70-83: Self-check and debrief

**70-75:** Compare your predictions with the issue text, actual MCP trace,
and native source at the recorded SHA. Label missing tool evidence
**BLOCKED** and any unavailable source comparison **UNREVIEWED**.

**75-81:** Discuss why baggage is not base fare, why a missing source rule
does not predict a runtime result, and what owner decision would be needed
before proposing implementation. An MCP read never authorizes a write.

**81-83:** Record the finding, next owner, and evidence still needed. If a
file was accidentally changed, stop and preserve the diff; do not reset,
delete, or conceal it.

## 83-85: Transfer and close

Transfer the issue acceptance, pinned-source observations, two fare
comparisons, actual MCP evidence or blocker, and next owner. No app, tests,
saved quotes, or hosted effects were performed by this lab. Do not claim
runtime enforcement, classroom rehearsal, or hosted behavior.
