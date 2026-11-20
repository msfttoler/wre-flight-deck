# Week 04: Investigate the run that actually happened

The airline's engineer needs a workflow that tests the intended change without
running longer than necessary. You will connect the workflow definition to an
actual run and its checkout, then assess a job's timeout using real evidence.
A successful run can teach tracing but is not a fabricated failure.

## Before class

- **Owner and facilitator:** Approve `msfttoler/wre-flight-deck` as the
  exercise target, confirm the approved `wre-v1` SHA and provide an
  accessible, actual Actions run URL if one exists. Without target approval,
  the target-dependent investigation is **BLOCKED**. A failure is not
  guaranteed. If no run is visible, prepare to inspect the baseline workflow
  and mark hosted investigation **BLOCKED**; do not trigger or rerun one.
- **Learner, required for the full hosted route:** A browser and existing
  read-only access to the selected run and logs. No previous week, local app,
  Node, learner branch, repository write or admin role is required.
- **Optional:** An already authorized `gh` for run reads, and Git 2.23+ and
  a new clone for local source comparison. No local edit or app is needed.

Read [shared setup and evidence](sessions.md). If using `gh`, run
`gh --version` and `gh auth status --help`. Only if help lists both
`--active` and `--no-refresh`, privately use
`gh auth status --active --no-refresh --hostname github.com`; otherwise record
CLI status as unknown. Do not display tokens or expand credentials. List
actual runs with:

```bash
gh run list --repo msfttoler/wre-flight-deck --limit 10
```

Alternatively, open `https://github.com/msfttoler/wre-flight-deck` >
**Actions** and read the available list. No accessible run means hosted
execution evidence is **BLOCKED**, not that CI never ran. Keep a note outside
any clone with the target, role, UTC time, run URL, attempt, actual commands
or UI observations, result and limits. Redact secrets and private log content.

### Optional: inspect source in a fresh clone

From a parent you own, replace `YOUR-ID` with a unique, non-sensitive handle
and attempt suffix using only letters, digits and hyphens, such as `river-a1`:

```bash
git clone https://github.com/msfttoler/wre-flight-deck.git wre-w04-YOUR-ID
```

Only if cloning succeeds, enter it:

```bash
cd wre-w04-YOUR-ID
```

If `cd` fails, stop before running Git. Otherwise check the target and tag:

```bash
git remote -v
git status --short --branch
git rev-parse 'wre-v1^{commit}'
```

Compare both origin URLs with `msfttoler/wre-flight-deck` without exposing
credentials and compare the tag commit with the owner's approved SHA. A
different target, dirty clone, missing tag or mismatch is **BLOCKED**. List
workflow files from the verified tag, not the clone's default branch:

```bash
git ls-tree -r --name-only wre-v1 -- .github/workflows
```

This investigation reads the tag directly; it does not need a learner branch,
application server or local edit. A local app is not an Actions runner or
hosted evidence.

## 00-03: The customer problem

**Say:** "A green check is useful only if it tested the change we care about.
And a timeout is useful only if it gives normal work enough time to finish."

## 03-05: Three questions, one investigation

Write a prediction for each question before opening the evidence:

1. What events, permissions and checkout does the workflow declare?
2. Which event and source does an actual run report?
3. Did the run test the intended change, and how long did its job take?
   Use an actual completed, non-skipped job's duration, or record it as
   **unknown**, before deciding whether its timeout is justified.

## 05-07: Flash Rewind

An event, the workflow definition and the code checked out are related, but
they are not interchangeable. A green badge alone does not identify each one.

## 07-10: Model and setup

An eligible **event**, subject to filters and conditions, can start a
workflow. Its **permissions** constrain the job token; **checkout** selects
the code the job uses. A run contains jobs; jobs contain steps on a runner.
The workflow-source revision, run head SHA and checked-out code are separate
questions. A pull request may test a merge commit, not the PR head.

Show the actual run list or, if unavailable, the baseline workflow source.
State whether a failure, a successful run or no run is available. Do not call
an expected observation a recorded result. Before timeout analysis, read the
duration of an actual completed, non-skipped job from its timestamps or mark
duration **unknown**; do not estimate from the workflow run's total time.

## 10-28: One facilitator investigation

1. In GitHub, open **Code** > branch/tag selector > **Tags** > `wre-v1`.
   Open the displayed commit and compare its full SHA with the owner's
   approved baseline. If it is unavailable or mismatched, mark the baseline
   comparison **BLOCKED**. Otherwise open `.github/workflows` and the
   selected workflow. Inspect its triggers, workflow and job permissions,
   and checkout step, including any explicit ref. If permissions are omitted,
   record effective defaults and policy as unknown. This baseline does not
   establish which workflow revision executed.
2. With the already-authorized CLI, list actual runs:

   ```bash
   gh run list --repo msfttoler/wre-flight-deck --limit 10
   ```

   Browser-only fallback: open **Actions** > an actual workflow or **All
   workflows**. If no run is accessible, mark run evidence **BLOCKED**, skip
   steps 3-5 and explain what the source alone cannot answer. Otherwise
   choose the current attempt of an observed run; do not start a new one.
   Record its URL, workflow, event, branch, head SHA, attempt, time and
   conclusion wherever displayed. If a field is not visible, record unknown.
3. Select an actual job under **Jobs**, then expand its checkout, setup and
   test steps as available. Record the step outcome and checkout ref/SHA
   shown in the logs. The run's displayed head SHA is not automatically
   the code checked out. If logs are missing or expired, retain the
   metadata and mark checkout and cause **BLOCKED**.
   For the CLI route, replace `RUN_ID` with the actual numeric run ID:

   ```bash
   gh run view RUN_ID --repo msfttoler/wre-flight-deck --json databaseId,attempt,event,headBranch,headSha,status,conclusion,workflowName,url,jobs
   gh run view RUN_ID --repo msfttoler/wre-flight-deck --json jobs \
     --jq '.jobs[] | {name,status,startedAt,completedAt,conclusion}'
   gh run view RUN_ID --repo msfttoler/wre-flight-deck --log
   ```

   From that same selected run attempt, record the actual job name, status,
   conclusion, `startedAt` and `completedAt`. Calculate elapsed time only
   when that job is completed, is not skipped, and both timestamps are
   valid, nonzero and in order; otherwise record duration **unknown**. A
   failed or cancelled job may have an actual elapsed duration, but label it
   non-representative of normal successful work. Do not use the workflow
   run's total duration as a job duration. Inspect logs privately and record
   only redacted evidence. For an older attempt, replace `ATTEMPT_NUMBER`
   with the actual attempt shown in the run history and select it explicitly:

   ```bash
   gh run view RUN_ID --attempt ATTEMPT_NUMBER --repo msfttoler/wre-flight-deck \
     --json databaseId,attempt,event,headBranch,headSha,status,conclusion,workflowName,url,jobs
   gh run view RUN_ID --attempt ATTEMPT_NUMBER --repo msfttoler/wre-flight-deck \
     --json jobs --jq '.jobs[] | {name,status,startedAt,completedAt,conclusion}'
   gh run view RUN_ID --attempt ATTEMPT_NUMBER --repo msfttoler/wre-flight-deck --log
   ```

   If CLI access is unavailable, inspect the same available evidence in
   GitHub instead.
4. If there is a failing step, read its first actionable error and preceding
   context. Distinguish an assertion from runner provisioning, dependency
   retrieval, checkout, permission refusal or cancellation. A warning or
   later cascading error is not automatically the cause. If the run
   succeeded, describe its actual trace and say failure diagnosis is
   **BLOCKED: no failing run supplied**.
5. Inspect the executed workflow-source revision separately if it can be
   identified. Today's default branch, the run head and the checkout SHA
   are not automatically that revision. Mark an unavailable comparison
   unknown. If the checked-out commit is visible, replace `CHECKOUT_SHA` in
   `https://github.com/msfttoler/wre-flight-deck/tree/CHECKOUT_SHA` with that
   actual full SHA and open the relevant source path. For a test-merge
   checkout, open `https://github.com/msfttoler/wre-flight-deck/commit/CHECKOUT_SHA`
   and examine its actual parent links before declaring a mismatch stale. If
   the commit or parents are inaccessible, mark them unknown. Before
   proposing a timeout decision, answer the third question: compare the
   actual checkout with the intended change and record the selected
   completed, non-skipped job's elapsed time, or **unknown**. Name the answer
   to all three questions using only observed evidence. Name the smallest
   next read, its owner and authority needs. A local `npm test` at the
   baseline is evidence about that local revision only.

**Ask:** "What would distinguish a failing assertion from an unavailable
runner?" Look for the step that actually started and the error it reported.
Practice now asks a separate question: do observed job durations justify
its timeout?

## 28-31: Live Quiz Sprint

Read aloud; use paper, fingers, chat or private written responses. Allow
additional response time and do not rank by speed.

1. Does a cancelled job prove a failed assertion? **No.**
2. Does today's workflow file prove what ran in an older run? **No.**
3. Is a test-merge SHA inherently stale? **No**; inspect event and parents.

## 31-33: Read, Rule Out, Return

**Read** the actual event and result, or record that they are unavailable.
**Rule out** an unrelated green run or an assumption about the checkout.
**Return** to the evidence and smallest safe next read.

## 33-35: Handoff to a timeout decision

The demo traced what the available evidence can tell us about tested code.
Now investigate a separate question in a job: is its timeout justified?
Start practice at minute 35 even if run evidence is unavailable.

## 35-70: Independent practice

When your core work is on track, use the [Week 04 investigation challenge](sessions.md#make-the-practice-time-useful).

Work independently on a normal job with `runs-on`. Decide whether to retain
its timeout or ask the owner to investigate; do not remove or change an
existing limit. A supported hold is a valid result.

1. **35-40:** On the verified `wre-v1` tag, open `.github/workflows` and
   select a workflow and job. If no run is available, use
   `.github/workflows/ci.yml` as a source-only example. Record the path, job,
   event, checkout and `timeout-minutes`, or mark unavailable source
   **BLOCKED**.
2. **40-48:** Find actual completed runs for the selected workflow and job
   if accessible. Record the run URLs, attempts, conclusions, workflow
   revisions and relevant workloads. If no run is available, mark duration
   evidence **BLOCKED**; do not invent a number.
3. **48-54:** Compare valid start and completion times with the existing
   limit. For an observed numeric run ID, this optional read lists job
   timestamps:

   ```bash
   RUN_ID='PASTE_ACTUAL_RUN_ID'
   gh run view "$RUN_ID" --repo msfttoler/wre-flight-deck --json jobs --jq '.jobs[] | {name,status,startedAt,completedAt,conclusion}'
   ```

   Replace the placeholder with the ID from the actual run page. Calculate a
   duration only for a completed, non-skipped job with valid start and end
   timestamps (not empty or zero-time placeholders). Failed or cancelled
   jobs may not represent normal runtime; one run is not a distribution.
   Record unknown where evidence is missing.
4. **54-60:** Compare the observed durations, current limit and operating
   needs. If the approved workflow already has a timeout, do not remove it
   for practice. Decide
   whether to retain the limit or ask the owner to investigate. Explain both
   the cost of runaway work and the risk of cancelling legitimate work.
5. **60-66:** If evidence is insufficient, name the additional normal runs,
   workload context and owner tolerance needed. If recommending a future
   change, describe how an authorized sandbox could validate the event,
   checkout and timeout, including runner and cost approval. A plan is not a
   successful hosted run.
6. **66-70:** Record the selected job, source revision, real run links and
   durations or gaps, decision, owner and next authorized check. Keep the
   existing limit intact and do not dispatch a workflow.

### Progressive hints

1. First bind the exact workflow and job to an approved source revision.
2. Count a duration only from a completed job with valid start and end times.
3. One short run is not a typical-runtime estimate; name the missing owner
   tolerance or additional workload evidence instead of guessing.

## If something fails

- **Logs unavailable or expired:** Keep the run metadata and request
  authorized retained logs. Do not supply a guessed error.
- **CLI exits nonzero:** Read the actual message; distinguish an auth/network
  problem from a failed run. The browser may still provide an authorized
  read. Do not expose secrets or change scopes.
- **PR head and checkout differ:** Inspect the event and the actual merge
  parents/ref. Do not rerun merely to obtain a simpler SHA.
- **No failing run:** Trace a successful run if available and mark the failure
  investigation **BLOCKED**. Baseline YAML shows configuration, not that
  a runner executed it.

## 70-83: Self-check and debrief

- **70-75, self-check:** Can another engineer follow the job, current limit,
  observed durations and run links, or see exactly what is unknown?
- **75-81, facilitator discussion:** Ask, "What evidence would justify a
  different timeout?" Contrast stopping runaway work with cancelling a
  legitimate long run. A single run cannot establish a typical duration.
- **81-83, record:** State retain or investigate, the owner and any missing
  evidence. Keep a proposed sandbox check separate from an observed run.

## 83-85: Transfer and close

Give the customer a revision-bound explanation and a next owner, not "rerun
until green." A source file is not proof of a hosted run. Missing run evidence
is **BLOCKED**; native and classroom rehearsal remain **UNREVIEWED**.

References: [GitHub CLI `gh run view` manual](https://cli.github.com/manual/gh_run_view);
[REST API workflow-job fields](https://docs.github.com/en/rest/actions/workflow-jobs).
