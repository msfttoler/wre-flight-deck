# Week 02: Tell a useful test from a required check

A checkout team promises free shipping on orders of $50 or more. A change to
that threshold can make a $49 order free. Trace the customer rule to the
assertion and the merge check, then propose how the team should assess a new
$60 policy.

**By the end:** explain what a failing test and a required check each establish,
and write a test-and-code proposal for a changed business requirement without
claiming it was implemented.

## Scope and target

This is the approved Week 02 checkout case, hosted in the Flight Deck learner
guide. The exercise target is the separate public classroom repository
[`msfttoler/wre-week-02`](https://github.com/msfttoler/wre-week-02), not the
Flight Deck app's unrelated baggage-fare boundary. The two pricing examples
are not equivalent and must not be presented as parity.

The learner route is read-only. Learners need browser access to the public
repository; `gh` is optional and uses only already-authorized reads. The
facilitator may make the bounded correction to PR #2 only if the repository
owner has authorized that ordinary write and the actual starting state is
preflighted. No learner edits the shared repository. No one changes branch
rules, reruns a workflow, merges, or depends on a second person's approval.
The customer's data-residency question is a separate architecture decision:
this public repository cannot prove where a customer's data is stored.

## Before class

- The owner and facilitator confirm that `msfttoler/wre-week-02` is the
  approved target and inspect the current state of PR #2, the `Checkout tests`
  check, and the target branch's required-check status. A URL or an old
  observation is not current execution evidence. If the starting failure or
  merge gate is absent, mark that part **BLOCKED**; do not recreate it.
- If a presenter correction is planned, the owner separately authorizes that
  one ordinary write to the existing demo branch. Otherwise the demonstration
  remains read-only and the correction is **BLOCKED**.
- Learners use their actual GitHub account with public read access only.
  Record role as read-only or unknown; a public page does not reveal the
  account's private permissions. An installed `gh` is optional. Do not
  request broader credentials.
- Keep any evidence note outside the repository. Record the observed target,
  role, URL, full SHA when available, UTC time, actual result, and limits.
  Do not copy tokens, private account details, or raw sensitive payloads.

## 00-12: Customer questions and mental model

### 00-05: Three customer questions

Frame one checkout decision with three questions:

1. **Where does the customer's data live?** This public class repository
   cannot answer that; the customer needs separate deployment and data-flow
   evidence from its authorized owners.
2. **What protects this change?** A useful test checks the promised price;
   a configured required check can make that result a merge condition.
3. **What evidence supports the decision?** The actual assertion, run for the
   current proposed revision, and visible merge requirement answer different
   parts of the question.

The first question is deliberately out of scope for the checkout demo. Do not
turn it into a second scenario or claim that repository visibility proves
residency.

### 05-12: The mechanism

The original promise is free shipping from $50. An assertion just below the
boundary can catch a threshold that is too low; a check matters to merge only
when the target branch actually requires it. A template describes useful
context, and `CODEOWNERS` identifies responsibility; neither alone enforces
approval.

Open the approved repository and its PR only after confirming the target.
The demonstration may use GitHub.com for the decision and the optional CLI
reads below to inspect the same PR. No command output or current result is
assumed in this guide.

## 12-30: One facilitator demonstration

Use the real PR #2 at
[`msfttoler/wre-week-02/pull/2`](https://github.com/msfttoler/wre-week-02/pull/2).
If its current source or check differs from the approved starting case, stop
at the difference and report it; do not recreate a failure.

1. **12-14 — Bind the customer promise.** In GitHub, read PR #2's description
   and the actual change on `demo/free-shipping` targeting `main`. Identify
   the stated $50 boundary and predict the result for $49 and $50 before
   opening the check.
2. **14-17 — Read the assertion and gate.** Open **Checks** > the actual
   `Checkout tests` run and inspect the first relevant assertion. If a
   failure is present, record its exact input, expected and actual result,
   run URL, attempt, and PR head SHA. Then return to the PR overview and read
   its current merge status and unmet required check. If the current failure
   or gate cannot be seen, mark it **BLOCKED**; do not rely on an older run.

   Optional native reads, from any directory with existing authorized
   `gh` access:

   ```bash
   gh pr checks 2 --repo msfttoler/wre-week-02
   gh pr view 2 --repo msfttoler/wre-week-02 \
     --json url,headRefOid,baseRefName,statusCheckRollup,mergeStateStatus
   ```

   A nonzero command exit is not by itself a diagnosis. Read the returned
   check state and, in GitHub, inspect the actual job and assertion.
3. **17-20 — Find the responsible line.** In **Files changed**, connect the
   threshold in `shipping.py` to the test and stated promise. Read the base
   branch's `.github/CODEOWNERS` entry for that path. Explain that ownership
   routing is separate from required approval; this case does not require a
   second reviewer.
4. **20-23 — Apply the approved demonstration change, if authorized.** Only
   the pre-authorized presenter may change the threshold on the existing
   `demo/free-shipping` branch from 4000 to 5000 cents. Leave the assertion,
   rules, and unrelated files unchanged. If authorization or the actual
   preflighted state is missing, do not edit; mark the change **BLOCKED**.
5. **23-27 — Check the new candidate.** If the correction was made, inspect
   the new run on that PR head, its complete relevant test result, and the
   current merge status. Queued or running is **PENDING**, not passed. If
   no authorized correction occurred, do not describe a new run. Never merge.
6. **27-30 — State the evidence boundary.** Record what the assertion,
   workflow result, and branch requirement each establish. A passing result
   covers the executed tests on that revision; it is not proof of every
   order amount, data residency, or production readiness.

**Question:** If the $50 case passes, what would distinguish a threshold that
is too low? The adjacent lower case can expose it; the actual current test and
merge status still need to be read.

## 30-35: Retrieval and handoff

### 30-33: Live Quiz Sprint

Use paper, fingers, chat, or a written answer without ranking by speed.

1. Does a passing application test by itself prove the branch requires it?
   **No.**
2. Does `CODEOWNERS` by itself require an approval? **No.**
3. Does an old green run prove the current PR head passed? **No.**

### 33-35: Read, Rule Out, Return

**Read** the stated boundary, the actual assertion, and the current merge
condition. **Rule out** an unrelated run or an assumption that ownership
enforces approval. **Return** to the first missing link and name its owner.
The independent task now changes the business rule, not the demo defect.

## 35-70: Independent practice — assess the $60 requirement

When your core work is on track, use the [Week 02 investigation challenge](sessions.md#make-the-practice-time-useful).

The business now proposes free shipping at $60 or more, retaining the $5 fee
below the threshold and existing negative-input behavior. This is the
approved independent practice. It is not the Flight Deck baggage-pricing
proposal, and learners do not edit or push to the shared repository.

Start from the correct `main` baseline identified by the approved case:
[`daedf31ac8d5fa4be8e4a3d37330bf2faf558a20`](https://github.com/msfttoler/wre-week-02/tree/daedf31ac8d5fa4be8e4a3d37330bf2faf558a20).
Confirm the repository and full SHA in GitHub before using it. If the ref,
files, or approved starting point do not match, stop and mark the affected
comparison **BLOCKED**; do not silently substitute another branch.

1. **35-40 — Predict first.** Read `test_shipping.py` and list its existing
   cases before opening `shipping.py`. Choose an order amount not already
   covered. Write the current expected fee and the fee required by the new
   policy, and explain why this input can distinguish the two.
2. **40-48 — Trace current behavior.** Read `shipping.py` at the same
   immutable revision. Follow your selected amount through the actual
   condition. Compare that result with your prediction; preserve both in
   your notes. Do not infer the new behavior from the old green suite.
3. **48-54 — Challenge the old evidence.** Inspect the actual baseline tests
   and, if available, the Actions run associated with that baseline. Identify
   which current assertions describe the old $50 promise and which should
   remain unchanged. If the run or a log is unavailable, mark that evidence
   **BLOCKED**; source reading is not a recorded test.
4. **54-60 — Propose the smallest coherent change.** Write the new assertion
   for your independently chosen input, the smallest implementation change,
   and any existing expected fees that must change because the business rule
   changed. Keep unrelated behavior and the required check intact. This is a
   proposal, not an edit or test execution.
5. **60-66 — Name the verification.** State which native test command should
   run after an authorized implementation, what result would support the
   proposal, and which check must report for the current PR before a merge
   decision. Do not claim either ran for this new policy.
6. **66-70 — Hand off.** Record the target, full source SHA, chosen input,
   prediction, observed source behavior, proposed assertion and code change,
   available baseline evidence, missing evidence, and responsible owner.

### Progressive hints

1. List the existing inputs before choosing yours.
2. Trace your input through the real condition; do not start by editing.
3. A changed requirement may justify changing an old expectation. Explain
   why before proposing it.

## If something fails

- **PR #2 or the expected failure is missing:** Record the current page and
  state, mark that demonstration step **BLOCKED**, and continue with the
  independent source reading only if its approved immutable ref is available.
- **The check is pending, skipped, or unreadable:** Preserve that state; it
  is not a pass. Ask the owner for the exact run or rule evidence needed.
- **The required check is not visible:** Do not infer that no rule exists.
  Name the target branch and ask its owner for the relevant read-only
  evidence.
- **The selected main ref or files differ:** Stop using the old comparison.
  Preserve the observed SHA and ask the case owner to confirm a new approved
  baseline.

## 70-83: Self-check and debrief

- **70-75 — Self-check:** Can another engineer reproduce your selected
  input, follow the current implementation, and tell which evidence was
  actually observed versus proposed?
- **75-81 — Discuss:** Which assertion would distinguish a $50 policy from
  the new $60 policy? Contrast that test with a required merge check and with
  a check from another revision. The local and historical evidence cannot
  establish the new rule was tested.
- **81-83 — Record:** Write the decision, the first unresolved condition,
  and the owner who can provide the next authorized evidence.

## 83-85: Transfer and close

Tell the customer which behavior was tested, which revision the check
covered, and whether the target branch actually requires it. Keep the $60
change proposal separate from the observed $50 case. The data-residency
question remains outside this repository's evidence. No learner change,
merge, or hosted execution is claimed.
