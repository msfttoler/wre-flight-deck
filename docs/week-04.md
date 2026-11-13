# Week 04: Investigate the run that actually happened

An airline engineer needs to decide whether an Actions failure implicates the
application, the workflow or its environment. Trace one real run to its event,
checkout and first actionable cause before proposing a repair.

## Preparation and independent entry

Read [shared setup and evidence rules](sessions.md). The owner supplies actual
Actions configuration and an accessible run URL when available; a failure is
not guaranteed. Learners need local write and existing read-only Actions access,
not rerun or settings permission.

```bash
git clone https://github.com/msfttoler/wre-flight-deck.git wre-w04-YOUR-ID
cd wre-w04-YOUR-ID
git switch -c learner/w04-YOUR-ID wre-v1
git rev-parse HEAD
npm test
npm start
```

Use Node 24+ and your unique `YOUR-ID`. Missing tag/runtime blocks app entry.
Inspect one route/quote in the UI, so a failed assertion has product meaning.

## Mental model and facilitator demo

Use the [85-minute route](sessions.md#shared-85-minute-delivery), preserving
35-70 individual practice and 70-83 self-check/debrief.

An event selects a workflow revision and starts jobs; jobs run steps on a
runner. The checkout may be a PR test merge rather than the PR head. A later
failure can be a consequence of an earlier failed step.

1. In GitHub Actions, choose an observed run, not an invented number. Read the
   trigger event, workflow, branch, revision, attempt, timestamps and conclusion.
   `gh run list --repo msfttoler/wre-flight-deck --limit 10` is an optional read.
2. Open the job and actual logs. Use `gh run view RUN_ID --repo
   msfttoler/wre-flight-deck --log` only after replacing `RUN_ID` with the
   observed numeric ID. Record the setup/runtime and checkout step evidence.
3. Find the first actionable error. Separate a failing assertion from runner
   provisioning, dependency retrieval, permission refusal or cancellation.
   A successful run can teach tracing, but is not a failure investigation.
4. Compare the workflow file at the run's revision with your `wre-v1` checkout.
   Run `git ls-files .github/workflows` locally to locate actual files. Do not
   assume today's `main` contains the workflow that executed.
5. If the run's code is available and safe to inspect, compare it in GitHub at
   its SHA. A local `npm test` at another SHA is baseline evidence only, not a
   reproduction. Propose the smallest next diagnostic with its authority needs.

Say: "Read the first useful error before changing the app. A failed checkout
step cannot tell us whether pricing tests pass."
Ask what evidence would distinguish a bad test from an unavailable runner.

## Independent practice: change the investigative hypothesis

Choose a different job/step in the real run, or a second real run if one exists.
Investigate a different hypothesis from the facilitator: for example event
filters versus runtime mismatch, or checkout selection versus an assertion.
Do not manufacture a failure or trigger a workflow.

Create a short cause chain: event -> workflow revision -> checkout -> first
error/result -> effect on the release decision. Include one plausible cause
you ruled out and the evidence that ruled it out. If a repair is warranted,
make a bounded local proposal or edit/test it on your branch; no hosted repair
is claimed.

If only successful runs exist, assess what they cover and what they do not.
If there are no accessible runs, mark hosted investigation **BLOCKED**, inspect
the actual local workflow and propose which event/log evidence is needed.
If no workflow exists either, do not invent one; report owner preparation missing.

## Failure, recovery and tradeoff

- Logs unavailable/expired: retain run metadata and request authorized retained
  evidence. A guessed error message is not a substitute.
- CLI exits nonzero: distinguish auth/network failure from a failed run.
  Preserve the actual error without secrets.
- PR SHA differs from checkout: inspect event, merge parents and checkout ref
  before calling it stale. Do not rerun merely to get a simpler explanation.

Local reproduction is fast and controlled but cannot prove runner identity,
hosted token permissions or event filtering.

## Retrieval, self-check and transfer

Manual **Live Quiz Sprint**: Does cancellation mean failed assertion? Does
current workflow YAML prove what ran yesterday? Is a test-merge SHA inherently
stale? Facilitator key: no to all. **Read, Rule Out, Return**: read the first
actionable error, rule out unrelated green runs, return to the cause chain.

At 70-83, verify your run/attempt/revision links and separate observation from
hypothesis. Transfer: give a customer an actionable next owner and diagnostic,
not "rerun until green." Hosted evidence absent means **BLOCKED**; authored
rehearsal remains **UNREVIEWED**.
