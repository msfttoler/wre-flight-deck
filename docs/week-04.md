# Week 04: Investigate the run that actually happened

An airline engineer needs to decide whether an Actions failure implicates the
application, the workflow or its environment. Trace one real run to its event,
checkout and first actionable cause before proposing a repair.

## Preparation and independent entry

Read [shared setup and evidence rules](sessions.md). The owner supplies actual
Actions configuration and an accessible run URL when available; a failure is
not guaranteed. The initial investigation needs existing read-only Actions
access, not a local branch, Node, an app server, rerun or settings permission.

```bash
gh run list --repo msfttoler/wre-flight-deck --limit 10
```

You can instead inspect available runs in GitHub Actions in the browser. If a
local source comparison or approved edit is useful, choose an unused directory
in a parent you own and replace `YOUR-ID` with your unique attempt:

```bash
git clone https://github.com/msfttoler/wre-flight-deck.git wre-w04-YOUR-ID
```

Only if the clone succeeds, enter it:

```bash
cd wre-w04-YOUR-ID
```

If `cd` fails, stop before any Git command; do not continue from the parent.
Otherwise inspect its target:

```bash
git remote -v
```

Before using the clone, compare both origin URLs with the approved Flight Deck
repository and confirm the `wre-v1` SHA against the owner's approved baseline in
[sessions.md](sessions.md):

```bash
git status --short
git rev-parse 'wre-v1^{commit}'
```

Stop if the target differs, the worktree is dirty, or the tag is absent or
mismatched. List workflow paths from that approved tag, not from whatever
branch the clone happened to open:

```bash
git ls-tree -r --name-only wre-v1 -- .github/workflows
```

Only an authorized local edit needs a learner branch. For one, replace
`YOUR-ID` with an unused name and create the branch:

```bash
git switch -c learner/w04-YOUR-ID wre-v1
```

If branch creation fails, stop before editing; preserve the existing work and
select another unused name. Only after it succeeds, confirm the branch starts
at the approved SHA:

```bash
git rev-parse HEAD
```

If it differs from the approved SHA, stop before editing.

For an optional app test or UI read without a local edit, switch the clean clone
to the approved tag instead:

```bash
git switch --detach wre-v1
```

If switching fails, stop. Only after it succeeds, check the selected commit:

```bash
git rev-parse HEAD
```

Stop if it differs from the approved SHA. If you already created the verified
learner branch for an authorized edit, stay on that branch; do not discard work.

Follow the [application setup](sessions.md#for-application-or-local-edit-work-use-a-fresh-clone)
if app tests or the UI are relevant. Missing Node or a tag blocks that optional
app path, not an available hosted read.

## Mental model and facilitator demo

Use the [85-minute route](sessions.md#shared-85-minute-delivery), preserving
35-70 individual practice and 70-83 self-check/debrief.

An eligible event can trigger a workflow, subject to its filters and conditions;
its jobs run steps on a runner. The workflow-source revision is a separate
question from the run's head SHA and the code a job checks out. The checkout may
be a PR test merge rather than the PR head. A later failure can be a consequence
of an earlier failed step.

1. In GitHub Actions, choose an observed run, not an invented number. Read the
   trigger event, workflow, branch, revision, attempt, timestamps and conclusion.
   `gh run list --repo msfttoler/wre-flight-deck --limit 10` is an optional read.
2. Open the job and actual logs. Use `gh run view RUN_ID --repo
   msfttoler/wre-flight-deck --log` only after replacing `RUN_ID` with the
   observed numeric ID. Record the setup/runtime and checkout step evidence.
3. Find the first actionable error. Separate a failing assertion from runner
   provisioning, dependency retrieval, permission refusal or cancellation.
   A successful run can teach tracing, but is not a failure investigation.
4. Compare the workflow file at the run's workflow-source revision with the
   approved `wre-v1` baseline. In GitHub, open repository > Code > branch/tag
   selector > Tags > `wre-v1` > `.github/workflows` > the selected file. Inspect
   the run's source revision separately if it can be identified; otherwise mark
   that comparison unknown. Do not assume the run's head or checkout SHA is the
   workflow-source revision, or that today's `main` contains the executed file.
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
If there are no accessible runs, mark hosted investigation **BLOCKED**. In the
browser, use repository > Code > branch/tag selector > Tags > `wre-v1` >
`.github/workflows` > a selected workflow, or inspect the approved tag in the
local clone, then propose which event/log evidence is needed.
If no workflow exists either, do not invent one; report owner preparation missing.

### If using this repository for the course timeout exercise

At the recorded `wre-v1` revision, the CI, CodeQL and release jobs already
have job-level timeouts. Do not remove one to manufacture an eligible edit.
Inspect a selected job and compare its limit with actual completed runs. For
an observed numeric run ID, the following read shows job timestamps:

```bash
RUN_ID='PASTE_ACTUAL_RUN_ID'
gh run view "$RUN_ID" --repo msfttoler/wre-flight-deck \
  --json jobs --jq '.jobs[] | {name,status,startedAt,completedAt,conclusion}'
```

Use a duration only for a completed, non-skipped job with valid start and end
timestamps. Pending, skipped or missing timestamps are not duration evidence;
a failed or canceled job may not represent normal runtime. One run is a sample,
not a duration distribution. Retaining the limit or asking its owner for more
operating evidence can be the right decision; do not describe a no-change
decision as an executed hosted repair.

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
