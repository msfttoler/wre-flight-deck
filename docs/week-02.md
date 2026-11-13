# Week 02: Tell a useful test from a required check

The airline's pricing engineer must protect a fare promise, not merely produce
a green badge. Trace a bag-inclusion boundary from the contract through a real
test and, only when available, the current PR's check and merge requirements.
This new app entry does not replace or inherit approval from published Week 02.

## Preparation and independent entry

Read [shared setup and evidence rules](sessions.md) and [pricing](api-contract.md).
The owner separately prepares actual CI and any intended branch rules. No
required-check name, active rule, PR or enforced gate is assumed here.
Learners use local write/read-only GitHub access, never repository administration.

```bash
git clone https://github.com/msfttoler/wre-flight-deck.git wre-w02-YOUR-ID
cd wre-w02-YOUR-ID
git switch -c learner/w02-YOUR-ID wre-v1
git rev-parse HEAD
npm test
npm start
```

Use Node 24+. A missing tag/runtime blocks entry. Read the schedule in the UI;
compare quotes with a bag for routes below and at/above the included-bag threshold
if available. Do not alter fictional flight data just to produce a demo.

## Mental model and facilitator demo

Follow the [85-minute route](sessions.md#shared-85-minute-delivery), including
35 minutes of individual practice and 13 minutes of self-check/debrief.

Say: "A test asks whether the price is right. An Actions job runs tests on a
particular revision. A required check determines whether that result matters
before merge. We need evidence for each link."

1. Read the contract: base fare per passenger of at least 25000 cents includes
   one bag. The threshold is not the whole party's subtotal or tax-inclusive
   total. Inspect `src/pricing.mjs` and locate actual tests with `git ls-files`.
2. Read the actual assertions and run `npm test`. Compare coverage of 24999,
   25000 and a multi-passenger case. Missing coverage is a candidate improvement,
   not proof that the app is defective.
3. In GitHub, open an owner-supplied real PR, then Files changed and Checks.
   Record its actual head, base and run. If none exists, mark this link **BLOCKED**.
4. For available evidence, read the assertion/job result and the PR's current
   merge requirements. Optional reads: `gh pr view PR_NUMBER --repo
   msfttoler/wre-flight-deck --json headRefOid,baseRefName,statusCheckRollup,mergeStateStatus`
   and `gh pr checks PR_NUMBER --repo msfttoler/wre-flight-deck`.
   Replace `PR_NUMBER` only with an observed PR number; neither command runs CI.
5. Explain whether the check is actually required. If policy details are hidden,
   report the limit. A passed job and an empty requirements view are not proof
   of enforcement. Do not rerun, edit rules or merge.

Ask why a test only at 25000 misses a wrong lower boundary. A correct boundary
test is valuable even if no branch rule requires it.

## Independent practice: change the commercial condition

Choose one proposed requirement: move the included-bag threshold to 30000 cents,
or include a first bag only on non-discounted fares at the existing threshold.
These are new product requests, not claims about current defects.

Write the precise per-passenger rule, select adjacent boundary and party-size
cases, then inspect implementation/tests. Either implement the proposal locally
with tests and a clearly identified proposed contract delta, or prepare a
line-specific change proposal if time is short. Preserve unrelated pricing,
discount and tax behavior. Run `npm test` for any implemented change and inspect
the diff. Do not claim an unimplemented proposal passed tests.

Independently assess the available real PR/check evidence. Record separately:
local behavior result, hosted job result and required-gate status. With no hosted
data, submit the local/proposed change plus **BLOCKED: hosted gate unverified**.
Do not create a fake exercise record or deliberately break main to fill this gap.

## Failure, recovery and tradeoff

- Tests pass but a proposed case is absent: add a genuine assertion, not a
  forced failure. A passing existing suite only covers what it checks.
- Check pending/skipped/missing: read event, workflow filters and revision;
  preserve the state rather than treating it as pass or starting a rerun.
- Check SHA differs from PR head: inspect the event and test-merge parents/
  checkout before declaring it stale. No authority for rules means proposal only.

## Retrieval, self-check and transfer

Manual **Live Quiz Sprint**: Is a workflow file enforcement? Does CODEOWNERS
alone require approval? Does a green baseline prove this PR?
Facilitator key: no to all three. **Read, Rule Out, Return**: read the fare
promise, rule out evidence for a different revision, return to the actual gate.

At 70-83, self-check your boundary arithmetic, test scope and three separate
statuses. Transfer: ask a customer for the actual check identity and target
branch rule before promising a merge block. Hosted enforcement is **BLOCKED**
until observed; this route's rehearsal remains **UNREVIEWED**.
