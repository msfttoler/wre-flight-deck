# Week 04: Investigate the run that actually happened

The airline's engineer needs to decide whether an Actions failure implicates
the application, workflow or environment. You will trace an actual run to
its event, checkout and first actionable result, then propose a bounded next
diagnostic. A successful run can teach tracing but is not a fabricated failure.

## Before class

- **Owner and facilitator:** Confirm the approved `wre-v1` SHA and provide an
  accessible, actual Actions run URL if one exists. A failure is not
  guaranteed. If no run is visible, prepare to inspect the baseline workflow
  and mark hosted investigation **BLOCKED**; do not trigger or rerun one.
- **Learner, required for the full hosted route:** A browser and existing
  read-only access to the selected run and logs. No previous week, local app,
  Node, learner branch, repository write or admin role is required.
- **Optional:** An already authorized `gh` for run reads; Git 2.23+ and a
  new clone for local source comparison; Node and npm only for an optional
  local test. A local test cannot reproduce hosted permissions or runner
  conditions.

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

For an optional local edit, create an unused branch with
`git switch -c learner/w04-YOUR-ID wre-v1`. If that fails, stop before
editing. Only after success, use `git rev-parse HEAD` and confirm the approved
SHA. For read-only local app or test work instead, use
`git switch --detach wre-v1` in the clean clone, check `HEAD`, then follow
[application setup](sessions.md#for-application-or-local-edit-work-use-a-fresh-clone).
Do not switch away from existing work. The app is local and is not an Actions
runner or hosted evidence.

## 00-05: The customer problem

**Say:** "A failed run is a clue, not yet a diagnosis. If checkout failed,
we still do not know whether the pricing tests would pass."

Ask: "What would you need before telling the airline to change application
code?" A specific error and its context, not merely a red summary.

## 05-12: Model and setup

An eligible **event**, subject to filters and conditions, can start a
workflow. A run contains jobs; jobs contain steps on a runner. Record the run
attempt as well as the job and step. The workflow-source revision, run head
SHA and checked-out code are separate questions. A pull request may test a
merge commit, not the PR head. A later error may follow an earlier failure.

Show the actual run list or, if unavailable, the baseline workflow source.
State whether a failure, a successful run or no run is available. Do not call
an expected observation a recorded result.

## 12-30: Facilitator demo

1. In GitHub, open **Actions** > an actual workflow or **All workflows** >
   an observed run. In its summary, record the run URL, workflow, event,
   branch, head SHA, attempt, time and conclusion wherever displayed. If a
   field is not visible, record unknown. Choose the current attempt; do not
   start a new one.
2. Select an actual job under **Jobs**, then expand its checkout, setup and
   test steps as available. Record the step outcome and checkout ref/SHA
   shown in the logs. The run's displayed head SHA is not automatically
   the code checked out. If logs are missing or expired, retain the
   metadata and mark checkout and cause **BLOCKED**.
3. If there is a failing step, read its first actionable error and preceding
   context. Distinguish an assertion from runner provisioning, dependency
   retrieval, checkout, permission refusal or cancellation. A warning or
   later cascading error is not automatically the cause. If the run
   succeeded, describe its actual trace and say failure diagnosis is
   **BLOCKED: no failing run supplied**.
4. Compare workflow source only when its revision is established. In GitHub,
   open **Code** > branch/tag selector > **Tags** > `wre-v1`. At the
   repository root, open the displayed commit and compare the full SHA in its
   URL with the owner's approved baseline; if unavailable or mismatched,
   baseline comparison is **BLOCKED** and you must not treat the file as
   approved. Otherwise open `.github/workflows` > the relevant file. Inspect
   the executed workflow-source revision separately if it can be identified.
   Today's default branch, the run head and the checkout SHA are not
   automatically that revision. Mark an unavailable comparison unknown.
5. If the checked-out commit is visible, replace `CHECKOUT_SHA` in
   `https://github.com/msfttoler/wre-flight-deck/tree/CHECKOUT_SHA` with that
   actual full SHA and open the relevant source path. For a test-merge
   checkout, open `https://github.com/msfttoler/wre-flight-deck/commit/CHECKOUT_SHA`
   and examine its actual parent links before declaring a mismatch stale. If
   the commit or parents are inaccessible, mark them unknown. Name the
   smallest next read or local diagnostic, its owner and authority needs. A
   local `npm test` at the baseline is evidence about that local revision only.

For an optional CLI read, replace `RUN_ID` with the numeric ID of the actual
run; it is not a fixed course ID:

```bash
gh run view RUN_ID --repo msfttoler/wre-flight-deck --json databaseId,attempt,event,headBranch,headSha,status,conclusion,workflowName,url,jobs
gh run view RUN_ID --repo msfttoler/wre-flight-deck --log
```

The log can contain sensitive details: inspect it privately and record only
redacted evidence. If investigating an older attempt, consult
`gh run view --help` and select the observed attempt explicitly.

**Ask:** "What would distinguish a failing assertion from an unavailable
runner?" Look for the step that actually started and the error it reported.
The next task changes the hypothesis, not the run.

## 30-33: Live Quiz Sprint

Read aloud; use paper, fingers, chat or private written responses. Allow
additional response time and do not rank by speed.

1. Does a cancelled job prove a failed assertion? **No.**
2. Does today's workflow file prove what ran in an older run? **No.**
3. Is a test-merge SHA inherently stale? **No**; inspect event and parents.

## 33-35: Read, Rule Out, Return

**Read** the actual event and actionable result. **Rule out** an unrelated
green run or an assumption about the checkout. **Return** to the cause chain
and smallest safe diagnostic. Begin practice at minute 35 even without a run.

## 35-70: Independent practice

Choose a different job or step in the actual run, or a second real run if one
is available. Investigate a different hypothesis from the demo, such as a
runtime mismatch rather than a checkout failure. Do not manufacture a failure.

1. **35-40:** In **Actions**, open the chosen real run and write its URL,
   event, branch, head, attempt and conclusion as displayed. If no run is
   accessible, mark **BLOCKED: hosted run** and go to step 4.
2. **40-48:** Open the selected job and expand the relevant setup, checkout
   and execution steps. Record actual step names, checkout ref/SHA, runtime
   evidence and the first actionable error **or successful result**. If the
   logs do not establish one of these, write unknown; do not infer it from
   a job name.
3. **48-54:** Write a cause chain: event -> workflow-source revision ->
   checkout -> observed step result -> effect on the release decision.
   Identify one competing explanation and the evidence that rules it out;
   if no evidence rules it out, keep it as an open hypothesis. With a
   successful run, describe coverage and limits rather than claiming a
   failure investigation.
4. **54-60:** In **Code** > branch/tag selector > **Tags** > `wre-v1`, open
   `.github/workflows` and the selected workflow, or use the verified local
   clone. If no run was selected, use `.github/workflows/ci.yml` as the
   source-only example, after verifying the tag SHA; if it is unavailable,
   mark that read **BLOCKED**. Read its triggers, conditions, checkout and
   relevant job. Compare it with the executed source only if that source
   revision is known. If neither run nor workflow is available, mark both
   **BLOCKED** and name the owner preparation needed.
5. **60-66:** If the course asks about a job timeout, inspect the selected
   job's actual `timeout-minutes` at the approved tag. The recorded baseline
   already contains job-level timeouts in the CI, CodeQL and release
   workflows; confirm the selected file instead of removing one. For an
   observed numeric run ID, this optional read lists job timestamps:

   ```bash
   RUN_ID='PASTE_ACTUAL_RUN_ID'
   gh run view "$RUN_ID" --repo msfttoler/wre-flight-deck --json jobs --jq '.jobs[] | {name,status,startedAt,completedAt,conclusion}'
   ```

   Replace the placeholder with the ID from the actual run page. Calculate a
   duration only for a completed, non-skipped job with valid start and end
   timestamps. A failed or cancelled job may not represent normal runtime;
   one run is not a distribution. Retaining the limit or requesting more
   evidence can be the right decision. Without timestamps, record unknown.
   If a timeout is not relevant, use these minutes to name the exact log step
   or artifact that could test your remaining hypothesis and the role needed
   to read it; mark unavailable evidence **BLOCKED**.
6. **66-70:** Record the actual run/attempt, source and checkout revisions,
   relevant log evidence, ruled-out or open hypothesis, proposed next
   diagnostic and responsible owner. If a repair is justified, describe the
   smallest local proposal; do not claim a hosted repair. An authorized local
   edit must be tested and reported separately.

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

- **70-75, self-check:** Can another engineer follow your run URL, attempt,
  job, actual checkout and first actionable result? Mark every unobserved
  link unknown rather than copying the run head into it.
- **75-81, facilitator discussion:** Ask, "Which evidence would make you
  change the application instead of the workflow?" Contrast an assertion
  failure with a checkout or runner failure. Local reproduction is useful
  but does not prove hosted token permissions or event filtering.
- **81-83, record:** State the next diagnostic, its owner and whether the
  run or failure investigation is blocked.

## 83-85: Transfer and close

Give the customer a revision-bound cause chain and a next owner, not "rerun
until green." A local app or source file is not proof of a hosted run.
Missing run evidence is **BLOCKED**; native and classroom rehearsal of this
guide remain **UNREVIEWED**.
