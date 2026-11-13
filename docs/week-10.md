# Week 10: Assess workflow drift against a recorded baseline

The airline's repository maintainer needs to know whether its automation still
matches an agreed baseline. Compare real revisions and explain the consequence
of a difference without assuming every difference is a defect or that source
comparison proves hosted enforcement.

## Preparation and independent entry

Read [shared setup and evidence rules](sessions.md). The owner identifies an
approved workflow baseline SHA, its actual file paths and intended invariants,
plus an accessible current revision. `wre-v1` can be that baseline only if it
actually contains the approved workflows. A tag name without recorded content
is not sufficient. No workflow path or intentional drift is assumed.

```bash
git clone https://github.com/msfttoler/wre-flight-deck.git wre-w10-YOUR-ID
cd wre-w10-YOUR-ID
git switch -c learner/w10-YOUR-ID wre-v1
git rev-parse HEAD
npm test
npm start
```

Use Node 24+ and your unique `YOUR-ID`. Missing tag/runtime blocks app entry.
Inspect one quote in the UI to connect the workflow's tests to product behavior.
Local write/read-only GitHub access is enough; no settings changes are needed.

## Mental model and facilitator demo

Use the [85-minute route](sessions.md#shared-85-minute-delivery): demo 12-30,
individual practice 35-70 and self-check/debrief 70-83.

Drift is a difference from a named baseline, not automatically a failure.
Workflow source, actual runs and branch policy are separate layers. A local
diff is deterministic; its operational meaning depends on events, permissions
and consumers of job/check names.

1. Record your entry SHA, then run `git ls-files .github/workflows`. Identify
   actual workflow files; no files means workflow comparison is **BLOCKED**.
2. Resolve `BASELINE_SHA` and `CURRENT_SHA` to full observed commit IDs.
   These placeholders select the approved and observed revisions; do not paste
   literal placeholder text into commands. If not locally available, use
   GitHub's immutable file/compare views, not an unapproved branch substitution.
3. Run `git diff BASELINE_SHA CURRENT_SHA -- .github/workflows` when both commits
   are local. Inspect the baseline and current files too; an empty diff without
   confirming the selected target is weak evidence.
4. Compare triggers/filters, checkout, Node version, test command, permissions,
   job/check names, dependency pins and release producer assumptions as relevant.
   Tie each observed difference to an intended invariant or explicit owner
   decision. Do not claim a rule was changed because YAML changed.
5. Inspect a real current run if available. Explain which difference actually
   executed and which impact is still predicted. Retain the run/checkout SHA.

Say: "A newer runtime may be an approved update. A missing test invocation may
remove coverage. The diff tells us what changed, not whether to accept it."
Ask how a check-name change could affect a rule that still expects its old name.

## Independent practice: change the baseline assumption

Choose one invariant different from the demo: test execution, token permissions,
trigger coverage or release producer identity. Assess it against the real
baseline/current comparison and available run evidence.

If there is no actual drift, report that scoped result and evaluate a clearly
labeled proposed local change, such as renaming a job or narrowing a path filter.
Do not present the proposal as observed repository drift or push it. Explain
which downstream rule/consumer must be checked before approval.

Deliver the two immutable SHAs, file-specific comparison, accepted/unaccepted/
unknown changes, a bounded repair or acceptance proposal and an owner question.
If the recorded baseline is absent, mark drift assessment **BLOCKED** and
inventory the current source for a future owner baseline decision. Do not
silently declare today's source approved.

## Failure, recovery and tradeoff

- Unknown baseline SHA: ask for the recorded baseline and rationale; do not
  guess from `main` or create an approval record.
- No diff: confirm both revisions and paths; absence of source drift does not
  establish settings consistency or that a job ran.
- Proposed repair restores an obsolete pin/runtime: compare current product
  requirements before restoring. Reverting every difference can reintroduce
  an older risk. Keep changes local pending authorized review.

## Retrieval, self-check and transfer

Manual **Live Quiz Sprint**: Is all drift harmful? Does matching YAML prove
matching settings? Does `npm test` locally prove a path-filtered workflow ran?
Facilitator key: no to all. **Read, Rule Out, Return**: read the invariant,
rule out unbound baselines, return to the exact difference and consequence.

At 70-83, self-check baseline identity, evidence versus prediction and downstream
dependencies. Transfer: agree a customer's baseline ownership and change process
before calling a difference noncompliance. Missing baseline/runs are **BLOCKED**;
hosted enforcement and learner rehearsal remain **UNREVIEWED**.
