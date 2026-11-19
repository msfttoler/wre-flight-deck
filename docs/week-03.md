# Week 03: Who needs permission to do what?

The airline's team wants engineers to inspect Flight Deck, CI to test changes,
and release automation to publish approved source packages. Does everyone need
write access? Work through three customer questions using this repository's
actual files and existing GitHub Actions runs.

These are illustrative customer questions, not reported incidents. We resolve
them by inspecting working controls and rejecting unnecessary grants. We do
not manufacture a failed push or pretend to repair a broken release.

1. **"I can clone it. Can I push?"** Inspect public source, the CLI actor and
   reported repository permission. A read is not proof of write authority.
2. **"Our tests need write access, right?"** Inspect `ci.yml` and an existing
   CI job's token-permission log. Testing does not justify repository write access.
3. **"Release needs to publish. Should every job be a writer?"** Inspect
   `release.yml` and its existing job log. Grant the needed authority to the
   release job, not every job.

## Before class: one fresh clone

You need Git, a terminal, a browser and an existing authenticated GitHub CLI
for account-specific evidence. Browser logs also require an existing GitHub
sign-in. No administrator role, new token, application server, Node install
or repository write access is needed. The public browser fallback is described
below; it does not establish a missing account's permissions.

Keep this version of the guide open in your browser. Inspect application/workflow
source at `wre-v1`; that older tag intentionally does not contain this updated guide.

### 1. Clone the named repository

On a narrow screen, use GitHub's code-copy button and paste into a plain-text
editor with line wrapping to read a complete command before running it.

Open a terminal in a parent directory you own. Run `pwd` to see where you are.
For example, on a Mac, `cd ~/Downloads` selects your Downloads folder. If that
folder is unavailable, choose another existing folder you own.

Check that Git is available:

```bash
git --version
```

Then clone once:

```bash
git clone https://github.com/msfttoler/wre-flight-deck.git wre-week03
```

Only if the clone succeeds, enter it:

```bash
cd wre-week03
```

If that directory already exists, stop and choose a new unused directory name
in both commands. If `cd` fails, stop. Do not reset, delete or reuse somebody
else's workspace.

### 2. Confirm the source

Run these from the new clone root:

```bash
git remote get-url origin
git status --short --branch
git rev-parse 'wre-v1^{commit}'
```

The origin must be `https://github.com/msfttoler/wre-flight-deck.git`.
The working tree must have no changed files. The approved tag resolves to:

```
59fae25ea3f18068e2140240d2fb606f35041974
```

Stop on a different target, changed files, missing tag or SHA mismatch. Ask the
owner to confirm the intended source; do not move the tag or substitute `main`.
Select the verified source for this read-only investigation:

```bash
git switch --detach wre-v1
git rev-parse HEAD
```

Confirm the same full SHA. Detached HEAD is expected: we are reading a recorded
revision, not preparing a push. No learner branch or local edit is required.

### 3. Identify the CLI actor privately

```bash
gh --version
gh api --hostname github.com user --jq '.login'
```

Compare the returned account with your intended CLI account. Stop that
account-specific investigation if it differs or the request fails. Do not
switch to somebody else's account or broaden a credential for class.

The commands below name the GitHub host and repository explicitly, so a
different `GH_REPO` setting does not silently select another target. There is
no `PRACTICE_REPO` assignment. Browser, Git transport and `gh` can use different
credentials. A personal-token settings page does not necessarily describe the
OAuth or environment credential used by `gh`.

If credential diagnosis is needed, privately read `gh auth status --help`.
Only when it lists both `--active` and `--no-refresh`, use
`gh auth status --active --no-refresh --hostname github.com`. Otherwise skip
that status command. Do not display tokens or change authentication settings.

### 4. Prepare the real GitHub pages

The facilitator opens these before delivery:

1. [Flight Deck source at the approved commit](https://github.com/msfttoler/wre-flight-deck/tree/59fae25ea3f18068e2140240d2fb606f35041974).
2. [CI workflow at the approved commit](https://github.com/msfttoler/wre-flight-deck/blob/59fae25ea3f18068e2140240d2fb606f35041974/.github/workflows/ci.yml).
3. [CI run 43515740797](https://github.com/msfttoler/wre-flight-deck/actions/runs/43515740797).
4. [Release workflow at the approved commit](https://github.com/msfttoler/wre-flight-deck/blob/59fae25ea3f18068e2140240d2fb606f35041974/.github/workflows/release.yml).
5. [Release run 43515739191](https://github.com/msfttoler/wre-flight-deck/actions/runs/43515739191).

On the CI run, open **Native tests (Node 24) > Set up job > GITHUB_TOKEN
Permissions**. On the release run, open **release > Set up job > GITHUB_TOKEN
Permissions**. Leave both blocks ready. If browser logs require sign-in, use an
existing authorized session or the CLI alternatives below.

If the CLI is authenticated, verify the run revisions before class. Each
backslash continues the command on the next line; copy the whole block:

```bash
gh run view 43515740797 \
  --repo github.com/msfttoler/wre-flight-deck \
  --json headSha,status,conclusion,url
```

```bash
gh run view 43515739191 \
  --repo github.com/msfttoler/wre-flight-deck \
  --json headSha,status,conclusion,url
```

Check each `headSha` against the full approved SHA in step 2. A missing,
inaccessible or different-revision run cannot corroborate this baseline:
use the source-only fallback below and record that runtime evidence is missing.

Both named runs are historical examples for commit
`59fae25ea3f18068e2140240d2fb606f35041974`, not claims about the newest run.
They were inspected on November 19, 2026 UTC. The CI jobs reported
`Contents: read` and `Metadata: read`; the release job reported
`Contents: write`, `Attestations: write` and `Metadata: read`.
Those are recorded observations. Read what the actual page or command returns
today; logs can expire or become unavailable.

Keep a private note outside the clone with source SHA, run URL, UTC observation
time, account role, action, actual result and remaining unknown. Do not record
credentials, private account details or unrelated log content.

## If using the matching Week 03 deck

The steps below also work without slides. With the WRE Week 03 deck, keep
speaker notes and this guide off the shared screen. Use these cues:

- **00-11:** Slides 1-2 introduce the customer; slide 3 frames the questions;
  slide 4 collects a prediction; slide 5 explains the actor/action model.
- **11-17:** Show slide 6, then switch to the prepared source and terminal for
  the public-clone question.
- **17-23:** Show slide 7, then switch to CI source/run and release source/run.
  Slide 8 is an optional recap within this same time.
- **23-35:** Use slides 9-11 for the quiz, slide 12 for the decision clinic
  and slide 13 for the independent-practice handoff.
- **35-70:** Leave slide 14 visible during individual practice.
- **70-85:** Use slide 15 for self-check and debrief, then slide 16 to close.

In the matching HTML deck, click the slide area and press **O** for the
numbered overview; select a slide to jump to it. Arrow keys move between
slides. Leave **Reference slides: skipped** selected; slides 17-20 are optional.
If the deck is unavailable, use the timed prompts below and run the quiz
manually.

## 00-03: One team, three questions

**Say:** "The airline wants engineers to inspect the code, tests to run, and
one release job to publish. Those are different actions. We will check the
authority each one needs rather than give everything write access."

Show the three questions in the opening list. Ask learners to predict which
actor, if any, needs to write repository contents.

## 03-05: Decide what would count as evidence

Make three columns in a note: **actor**, **action on a resource**, **evidence**.
A person reading public source, a CI job checking out source and a release job
publishing an asset are not the same actor or operation.

**Ask:** "Would seeing your own repository role tell us the release job's
permissions?" No. The workflow job has its own token.

## 05-08: Flash Rewind

**Ask:** "Which statement have you heard: 'I can sign in, so I have access,' or
'the tests passed, so the bot can publish'?"

Take a written prediction. Authentication identifies who is acting;
authorization concerns an action on a resource. A local Git author/email
records authorship, not the credential that authenticates a GitHub push.

## 08-11: The mental model

Explain three checks before running commands:

1. **Name the actor.** Your human account and an Actions job token differ.
2. **Name the operation and resource.** Reading source, uploading analysis and
   publishing a release need different authority.
3. **Compare declaration with observation.** YAML describes intended token
   permissions. An existing job log describes that run. Neither proves an
   unperformed push or permission change.

Repository roles, credential limits, rules and applicable policy can all
constrain an action. A successful public clone does not identify which
credential was used or prove that an authenticated account can write.

## 11-17: Question 1 - "I can clone it. Can I push?"

1. In GitHub.com, open the pinned source page from preparation. Under **Code**,
   confirm `msfttoler/wre-flight-deck` and commit `59fae25`. The source is public.
2. From the verified clone root, run:

   ```bash
   gh repo view github.com/msfttoler/wre-flight-deck \
     --json nameWithOwner,isPrivate,viewerPermission,url
   ```

3. Confirm the returned name is `msfttoler/wre-flight-deck`; stop on a different
   target. Then read the actual visibility and permission value. Different
   accounts can legitimately report different roles. Do not supply an expected
   role or treat a missing value as a proven denial.
4. Compare the private actor observation from preparation with this request.
   The signed-in browser may use a different account; keep those contexts
   separate.
5. Record: "I observed a public source read and this CLI-reported permission.
   I have not tested a push or inventoried every access path."

**Resolve the customer's question:** cloning does not establish push authority.
Do not grant extra access merely because a future action has not been tested.
If a real write task is needed, name the task and ask its owner about the
smallest applicable grant. Do not attempt a push to manufacture a refusal.

## 17-20: Question 2 - "Our tests need write access, right?"

1. Open the prepared **CI workflow** tab. Alternatively, on the pinned source
   page, open **.github > workflows > ci.yml**. In the terminal, show the same
   file:

   ```bash
   git --no-pager show HEAD:.github/workflows/ci.yml
   ```

2. Find `permissions: contents: read`, the checkout step,
   `persist-credentials: false` and the native test commands. Explain that
   running tests is not the same operation as changing repository contents.
   Uploading a run artifact is not publishing a GitHub release.
3. Open the prepared **Flight checks** run. Confirm its commit, select
   **Native tests (Node 24)** and expand **Set up job > GITHUB_TOKEN Permissions**.
   Read the actual entries. No repository Settings screen is needed.
4. The CLI alternative reads the same historical run and selects just its
   token-permission blocks:

   ```bash
   gh run view 43515740797 \
     --repo github.com/msfttoler/wre-flight-deck \
     --log | grep -A 3 'GITHUB_TOKEN Permissions'
   ```

   `grep` filters the displayed log, not the job or token. If the command errors
   or no block is returned, record the observation as unavailable; absence is
   not proof that the job lacked permission.

**Resolve the customer's question:** the existing source and observed run
support retaining read-only contents access for these tests. No permission
repair is needed. Do not claim that a passing test proves all writes would be
refused, or that `persist-credentials: false` removes the job's token.

## 20-23: Question 3 - "Should every job be a writer?"

1. Open the prepared **Release workflow** tab. Alternatively, on the pinned
   source page, open **.github > workflows > release.yml**. In the same
   terminal, run:

   ```bash
   git --no-pager show HEAD:.github/workflows/release.yml
   ```

2. Compare workflow-level `contents: read` with the release job's own
   `permissions` block. `contents: write` supports release publishing;
   `attestations: write` supports storing attestations; `id-token: write`
   permits requesting an OIDC identity token. These are different capabilities,
   not three ways of granting repository administration.
3. Open the prepared **Release provenance** run. Confirm the same commit,
   select **release**, then expand **Set up job > GITHUB_TOKEN Permissions**.
   The CLI alternative is:

   ```bash
   gh run view 43515739191 \
     --repo github.com/msfttoler/wre-flight-deck \
     --log | grep -A 3 'GITHUB_TOKEN Permissions'
   ```

4. Compare actual contents/attestations entries with the declaration.
   The recorded token-permission block did not list `id-token`; do not claim
   it independently proved that capability. The workflow declaration and
   individual step evidence answer different questions.

**Resolve the customer's question:** keep the additional authority on the job
that needs it. Do not make all CI jobs writers to support one release action.
We inspected an existing release; we did not create one, trigger a workflow,
change permissions or approve promotion. Applicable event restrictions and
policy still matter.

## 23-28: Live Quiz Sprint

Use fingers, paper, chat or private written answers. Allow thinking time; do
not rank learners by speed.

1. Does cloning a public repository prove push access? **No.**
2. Does your human repository role describe the CI job token? **No.**
3. One release job needs to publish. Should the default for all jobs become
   `contents: write`? **No; justify authority for the particular job/action.**

Ask for the observation that ruled out the tempting answer.

## 28-32: Read, Rule Out, Return

**Read** the actor, action and resource. **Rule out** public-read success, a
human role or a YAML declaration as proof of every allowed action.
**Return** to the smallest required authority and the actual evidence.

Use a counterexample: a fine-grained token can narrow a person's private
repository access even when the account has a suitable role. Public reads do
not demonstrate that restriction. A 404 can mean a hidden private resource or
a wrong path; it does not diagnose revocation.

## 32-35: Handoff to a different operation

**Say:** "You have seen source reads and release publishing. Now investigate
uploading security analysis. Does that operation need release authority?"

Use the same verified clone and tag, not a second repository or somebody
else's workspace. The CodeQL task below is a source-based permissions review,
not an instruction to enable scanning, obtain alerts or run a scan.

## 35-70: Independent practice - analysis is not a release

1. **35-40:** Predict which authority the analysis job needs. Start an
   action/resource matrix with four rows: human public clone/potential push,
   CI validation, release publishing, and CodeQL analysis upload. Distinguish
   the person's credential from each job's token.
2. **40-48:** In GitHub.com at `wre-v1`, open
   **.github > workflows > codeql.yml**. From the clone root, run:

   ```bash
   git --no-pager show HEAD:.github/workflows/codeql.yml
   ```

   Locate workflow-level defaults, the analysis job's override, the checkout
   step and analysis action. Record the source SHA and exact declarations.
3. **48-55:** Use the official
   [workflow permissions reference](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#permissions)
   to explain `security-events: write` versus `contents: write`.
   Recommend whether to retain or change the declared authority. An observed,
   justified no-change decision is valid; do not invent a defect to repair.
4. **55-62:** Reject this proposed shortcut: "Give every job `contents: write`
   so uploads work." Explain which permission addresses analysis upload,
   which addresses release publishing and why the shortcut is not equivalent.
   Account for event/policy restrictions without assuming a particular
   forked-PR result. Do not run a scan, push or edit hosted settings.
5. **62-67:** Check the human row against your clone and role observations,
   and each job row against its workflow declarations and any inspected log.
   Mark runtime analysis permissions **unobserved** unless you inspect an
   accessible real run for that source and event. A YAML declaration is not
   that observation; no alert or security-administrator access is required.
6. **67-70:** Write a short customer handoff: the actor and action, minimum
   proposed authority, rejected broader grant, exact source, actual
   observations and unresolved owner question. Mark any proposed change
   **unperformed**. Keep the note private and outside tracked files.

## If something fails

- **Clone directory exists or files are changed:** confirm the intended new
  path and `git status`. Use a separate unused directory; never discard work.
- **Tag, SHA or remote differs:** compare with preparation. Stop source
  comparison and ask the owner; do not move a tag.
- **CLI is missing, unauthenticated or using the wrong account:** check the
  actual error and intended identity privately. Read public source in the
  browser; account-specific evidence remains **BLOCKED**.
- **Browser asks for sign-in to view logs:** use an existing authorized
  browser sign-in or the already-authorized CLI read. If neither is available,
  mark logs **BLOCKED**.
- **Run/log is unavailable or has expired:** confirm repository, run ID and
  source SHA. Retain source-only analysis, not a claim about runtime authority.
- **A read returns 403/404:** record the exact target and status. Ask the
  appropriate owner; do not infer cause, broaden credentials or attempt a write.

If a historical run is no longer available, the facilitator can inspect
**Actions > Flight checks** or **Actions > Release provenance** for an existing,
authorized example and name its actual source revision. Do not silently pair
its logs with `wre-v1` source. A source-only comparison is useful but leaves
runtime behavior unobserved. Do not dispatch a replacement run for class.

## 70-83: Self-check and debrief

- **70-75:** Check your matrix individually. Does each conclusion name the
  actor, operation, resource, source revision and actual observation or unknown?
- **75-81:** Discuss: "Why does analysis upload differ from release
  publication?" and "What could an event or policy change about this job?"
  Keep the human account separate from job-token authority.
- **81-83:** Save the corrected customer answer and one unresolved evidence
  request. No peer approval or applied permission change is required.

## 83-85: Transfer and close

**Say:** "Don't start with 'give the bot write access.' Start with the action
it needs. We kept test jobs read-only, located release authority on its own
job, and assessed a different upload permission. Existing working controls
can answer the customer without changing production access."

Read-only CLI/source/run observations are not a denied-operation test,
offboarding review, executed access change or release approval. Native
PowerPoint, screen-reader and classroom rehearsal remain **UNREVIEWED** until
separately recorded. Shared evidence boundaries are in [sessions](sessions.md).

## Official references

- [Use GITHUB_TOKEN for authentication in workflows](https://docs.github.com/en/actions/tutorials/authenticate-with-github_token)
- [Workflow syntax and permissions](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#permissions)
- [Managing personal access tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)
- [GitHub CLI environment and credential selection](https://cli.github.com/manual/gh_help_environment)
