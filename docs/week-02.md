# Week 02: Tell a useful test from a required check

The airline's pricing engineer must protect a fare promise, not merely obtain
a green badge. You will trace a bag-inclusion boundary from the contract to a
test, then decide what an available PR check actually establishes. This Flight
Deck companion is independent of, and does not replace or inherit approval
from, the separately published Week 02 course.

## Before class

- **Owner and facilitator:** Confirm the approved `wre-v1` SHA and prepare a
  separate facilitator clone. If available, supply a real PR URL and
  read-only access to its check and target-branch requirements. Do not assume
  a check name, PR, rule or enforced gate; missing hosted evidence is
  **BLOCKED**, not a reason to create a PR or alter rules.
- **Learner, required for the local route:** Git 2.23+ with `git switch`,
  Node.js 24+, npm, a browser and a new directory you can write to. No
  previous week or GitHub write, admin or reviewer access is required.
- **Optional:** An already authorized GitHub account and `gh` for inspecting
  an actual PR. Source reading and the local test plan can continue without
  them. No hosted check is then claimed.

Read [shared setup and evidence](sessions.md) and
[the pricing contract](api-contract.md). Replace `YOUR-ID` with a
non-sensitive unique handle and attempt suffix using only letters, digits
and hyphens, such as `river-a1`. From a parent directory you own, run:

```bash
git --version
node --version
npm --version
git clone https://github.com/msfttoler/wre-flight-deck.git wre-w02-YOUR-ID
```

Only if cloning succeeds, enter the new directory:

```bash
cd wre-w02-YOUR-ID
```

If `cd` fails, stop before Git. Otherwise check the target:

```bash
git remote -v
git status --short --branch
git rev-parse 'wre-v1^{commit}'
```

Compare both origin URLs with `msfttoler/wre-flight-deck` without exposing
credentials. Compare the resolved tag commit with the owner's approved SHA.
A different target, dirty clone, missing tag or mismatch is **BLOCKED**; do
not use `main` instead.

Create a new local branch:

```bash
git switch -c learner/w02-YOUR-ID wre-v1
```

If it fails, choose an unused name and stop before editing. Only after it
succeeds, run `git rev-parse HEAD` and confirm it equals the approved tag.
Run `npm test` from the clone root and record the actual baseline result.

To see the product, run `npm start` from that root. Wait for your terminal
to print `Flight Deck: http://127.0.0.1:3000` and stay running before opening
that address. Under **Plan a journey**, choose actual **From** and
**To** airports and a passenger count, then **Find flights**. Select
**Review fare** for an available itinerary, choose **1 bag / passenger**
under **Checked bags**, and select **Calculate fare**. Read the base fare,
bag line and total. If the schedule has suitable choices, repeat with a
different fare; do not change flight data to create a boundary. A quote is
local fictional data, not evidence of CI or a merge rule. Stop your server
with Ctrl-C when finished.

If no route is available, mark the quote comparison **BLOCKED** and use the
source and tests for the boundary investigation. If the port is already in
use, do not browse the unknown service or stop another person's process.
After your failed start exits, if no process is using this clone's `.data`,
try `PORT=3001 npm start`;
open `http://127.0.0.1:3001` only if that start succeeds. Use another unused
port if needed, one process per state directory, and never delete state.

Keep a note outside the clone with the target, role, baseline SHA, UTC time,
commands/URLs, actual results and limits. Do not copy credentials or raw
private account data.

## 00-05: The customer problem

**Say:** "A correct fare matters to the airline even if a badge is green.
We'll check the actual price assertion, then ask whether this PR is required
to pass that check before merge."

Ask: "If one passenger's base fare is below the inclusion threshold, should
adding more passengers make their first bag free?" No: the rule is per
passenger, not the party's combined subtotal.

## 05-12: Model and setup

The current contract includes one bag when the sum of an itinerary's base
fares **per passenger** is at least 25000 cents, before the passenger
multiplier or coupon. A charged bag is 2500 cents per passenger per
itinerary. `FIRSTFLIGHT` discounts base fares, not bag charges; tax is
calculated once after the discount using the documented integer rounding.

A **test** checks an assertion. A workflow **job** executes steps for a
particular event and revision. A **required check** is a merge condition on a
target branch. None automatically proves the other. Show the separate
facilitator clone's approved SHA; if the clone or runtime is unavailable,
mark that local work **BLOCKED** rather than showing invented results. If the
approved source is accessible in GitHub, learners can still read the contract
and test file there and prepare the proposed boundary table; no local test or
edit is then claimed.

## 12-30: Facilitator demo

1. In the verified facilitator clone, open `docs/api-contract.md` at
   **Write endpoints**, then `src/pricing.mjs` and
   `test/pricing.test.mjs` in an editor. Or locate files from the clone root
   with `git ls-files 'src/*pricing*' 'test/*pricing*'`. Find where the
   per-passenger fares are summed, where the inclusion comparison occurs,
   and which price line holds bag charges.
2. Read the actual assertions for 24999 and 25000 cents, passenger count
   and a connecting itinerary. Predict the bag charge for two passengers,
   each with one bag, on either side of the current boundary. Run `npm test`
   and record the actual result and revision. A passing suite establishes
   only what its executed assertions cover; it is not a PR gate.
3. If an owner-supplied PR is visible, open
   `https://github.com/msfttoler/wre-flight-deck`, select **Pull requests**,
   and open that PR. In **Files changed**, identify the affected files. On
   **Overview** (called **Conversation** in some versions), inspect the
   target branch and visible **Merge status** or expanded checks. The status
   may not be at the bottom of the page. Open **Commits** and the latest
   commit link for its full SHA if needed. Record the PR URL, head SHA and
   base branch actually shown. If no PR is accessible, record
   **BLOCKED: PR/check evidence** and continue to step 5.
4. On that PR, select **Checks**, then an actual check/job and its details.
   Record the run URL, event, conclusion and checkout revision if visible.
   Compare the check with the current merge requirements shown on the PR.
   If required-rule details or the exact checkout are not visible, record
   them as unknown. Do not rerun, change settings, approve or merge.

   As an optional read, replace `PR_NUMBER` with the observed numeric PR
   number:

   ```bash
   gh pr view PR_NUMBER --repo msfttoler/wre-flight-deck --json url,headRefOid,baseRefName,statusCheckRollup,mergeStateStatus
   gh pr checks PR_NUMBER --repo msfttoler/wre-flight-deck
   ```

   These commands do not run CI. A nonzero checks command can reflect a
   pending or failing check; read its actual state.
5. In GitHub **Code**, select **Tags** > `wre-v1`, then open
   `.github/workflows/ci.yml` if present. Its declared triggers and jobs are
   source configuration, not evidence that a particular run happened or that
   a branch requires it. If the file or hosted data is absent, identify the
   owner-supplied PR, run and rule evidence needed next.

**Ask:** "Why does a test only at 25000 miss the wrong lower boundary?"
The check at 24999 distinguishes `>=` from a boundary that includes too much.
Even a useful test cannot establish which merge gate is enforced.

## 30-33: Live Quiz Sprint

Read aloud and offer paper, fingers, chat or private written responses; allow
additional response time without a speed ranking.

1. Does a workflow file by itself enforce a merge gate? **No.**
2. Does `CODEOWNERS` alone establish required approval? **No.**
3. Does a green local baseline prove the current PR passed? **No.**

## 33-35: Read, Rule Out, Return

**Read** the per-passenger fare promise and the PR target. **Rule out** a
test result from a different revision as proof of this PR. **Return** to the
actual assertion, run and visible merge condition. Start the independent task
at minute 35 even if hosted evidence is unavailable.

## 35-70: Independent practice

Work in your own verified clone. The changed condition is a **proposed**, not
approved, increase of the first-bag threshold to 30000 cents per passenger.
Keep the current `wre-v1` tag, pricing contract and behavior unchanged unless
the owner separately approves a product change. A proposal is not an
implemented feature.

If the clone is blocked, use GitHub **Code** > branch/tag selector > **Tags**,
then select `wre-v1`. At the repository root, open the displayed commit and compare its
full URL SHA with the owner's approved baseline before reading the three
files in step 1. If the SHA is missing or mismatched, the approved-source
read is **BLOCKED**. With the verified browser source, complete the proposal
and hosted reads that are available, but mark local edits and tests **BLOCKED**.

1. **35-40:** In `docs/api-contract.md`, write down the current threshold,
   bag price, coupon scope and tax treatment. In `src/pricing.mjs`, identify
   the expression that applies the threshold. In `test/pricing.test.mjs`,
   locate the existing below/at-threshold and multi-passenger assertions.
   Note the approved SHA and any actual baseline `npm test` result.
2. **40-48:** Write the proposed rule in your own words: sum the itinerary
   base fare per passenger before coupon and passenger multiplication; include
   the first bag only at or above 30000 cents. Keep the existing coupon and
   rounding rules. Independently choose a fare not covered by the existing
   cases that would distinguish the two policies; record your current and
   proposed predictions before checking them. For **two passengers with one
   bag each**, also calculate the total bag charge under both rules at 24999,
   25000, 29999 and 30000 cents. These are expected values for a proposal,
   not observed app outputs.
3. **48-54:** Design two boundary tests using real `priceItinerary` inputs:
   one two-leg itinerary totaling 29999 cents per passenger and another
   totaling 30000. After recording your predictions, check the proposed-rule
   arithmetic: the first charges 5000 cents for two bags and the second zero.
   Include a `FIRSTFLIGHT` case and explain why the threshold is checked
   before discount. Identify which existing assertions would need a deliberate
   update if the proposal were approved; do not simply remove failing tests.
4. **54-60:** If you have the verified clone and Node, optionally add an
   assertion for the **current** contract to `test/pricing.test.mjs`: use two
   legs totaling 24999 cents, two passengers, one bag each and `FIRSTFLIGHT`;
   inspect the existing tests for the import and assertion style. The current
   expected bag line is 5000 cents. Run `npm test`, `git diff --check` and
   `git diff` from the clone root. Record the actual result. If you did not
   edit or could not run the suite, label the assertion proposal or execution
   **UNREVIEWED** or **BLOCKED** as appropriate; do not say it passed.
5. **60-66:** Independently inspect the real PR from the demo, or another
   owner-supplied PR, using **Pull requests** > the PR > **Overview**
   (or **Conversation**) and **Checks**. Note its actual head/base, check,
   run, event, checkout and visible required status. If no PR or rule
   evidence is accessible, inspect the `wre-v1` workflow source instead and
   write exactly what an owner must supply; mark the hosted gate **BLOCKED**.
6. **66-70:** Finish a note with three separate rows: **local test and SHA**;
   **hosted job, run and revision**; **required-gate status and evidence**.
   Include the proposed boundary table, the decision-changing test cases,
   any actual diff and the remaining unknowns. No push, PR creation or review
   by another learner is needed.

## If something fails

- **Tests pass but a case is absent:** A passing suite does not cover every
  input. Propose or add a genuine assertion; never force a failure to make
  the lesson interesting.
- **Tests fail:** Preserve the diff and actual error. Compare the failing
  assertion with the unchanged contract; do not weaken the test to get green.
- **Check missing, pending or skipped:** Record that state. Inspect the event,
  workflow filters and revision if visible; do not call it a pass or rerun it.
- **Checkout SHA differs from PR head:** It may be a PR test merge. Inspect
  the event, actual checkout and merge parents before calling it stale.
  Inaccessible rule settings mean a precise owner question, not an admin
  prerequisite or a claim that no rule exists.

## 70-83: Self-check and debrief

- **70-75, self-check:** Check the per-passenger arithmetic, adjacent cases,
  actual test result and all three evidence rows. A proposed 30000-cent rule
  is not current product behavior.
- **75-81, facilitator discussion:** Ask, "Which evidence would change your
  merge decision?" Contrast a useful test, a check on a different revision
  and a verified required gate. Discuss the cost of a stricter threshold
  without silently changing the customer's commercial contract.
- **81-83, record:** State the local decision, hosted unknown and who can
  provide the missing PR or rule evidence.

## 83-85: Transfer and close

Ask a customer for the actual test assertion, check identity, candidate
revision and target-branch rule before promising a merge block. A local app
quote or test does not prove hosted enforcement. Missing hosted evidence is
**BLOCKED**; native and classroom rehearsal remain **UNREVIEWED**.
