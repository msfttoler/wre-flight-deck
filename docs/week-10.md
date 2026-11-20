# Week 10: Assess workflow drift against a recorded baseline

The airline's repository maintainer needs to know whether automation still
matches an agreed baseline. Compare real workflow revisions and explain the
effect of a difference. A difference is not automatically a defect, and a
source comparison is not proof of hosted enforcement.

**By the end:** name two immutable revisions, compare an actual workflow,
evaluate one agreed invariant, and distinguish observed execution from a
predicted impact.

## Before class: establish the comparison

1. Read [shared setup and evidence rules](sessions.md). The owner supplies
   an **approved workflow baseline SHA**, its intended invariant, an
   accessible current revision, and—if available—an existing same-repository
   proposal with an approval record for its exact head SHA. Also ask for a
   second invariant for independent practice. The `wre-v1` source tag is a
   candidate baseline only if the owner approved it for this comparison. Do
   not turn a tag, PR state, or today's `main` into approval.
2. The normal route needs a browser and Git. Use a bash-compatible terminal
   such as Git Bash on Windows. Node, an app server, a learner branch,
   administrator rights, and hosted writes are not required for this
   read-only comparison. GitHub CLI is optional.
3. Make an independent clone. `river-a1` is an example; replace it in every
   command with your own non-sensitive, unused attempt name:

   ```bash
   cd ~
   git clone https://github.com/msfttoler/wre-flight-deck.git wre-w10-river-a1
   ```

   If cloning fails or the folder exists, stop and choose another name.
   After a successful clone:

   ```bash
   cd ~/wre-w10-river-a1
   git remote -v
   git status --short --branch
   git rev-parse 'wre-v1^{commit}'
   git rev-parse 'origin/main^{commit}'
   ```

   Confirm both remote URLs name `msfttoler/wre-flight-deck`. Do not share
   a URL containing credentials. The `##` status line is a branch header;
   other lines indicate changes. Stop and preserve any unexpected changes.
   Record the available full SHAs as observations: neither is automatically
   the owner's approved workflow baseline. If the `wre-v1` tag is missing
   but `origin/main` resolves, continue with the current-only inventory and
   request an approved baseline.
4. Ask the owner which actual SHA and invariant to use and whether an
   existing approved proposal is in scope. If the baseline or invariant is
   missing, mark that approval **BLOCKED**. If no qualifying proposal exists,
   record that gap and continue with the baseline-to-current source read;
   do not create a branch, PR, approval, or proposed output for the demo.

Optional product context: the [Flight Deck quick start](../README.md#get-airborne)
shows the booking flow the tests support. Running the local app is not
evidence that a hosted workflow or branch rule executed.

## 00-10: Open and explain the task

1. **00-05 - Open the problem.** Say: "A workflow changed. Before restoring
   the old file, we need to know what the team agreed to protect and what
   the change actually affects." Ask whether every difference is harmful.
   Invite learners to predict:
   - Can we resolve the recorded approval to a real commit here?
   - What changed since approval?
   - Does the difference affect checkout behavior, permissions or presentation?
2. **05-07 - Flash Rewind.** A workflow file describes configuration; it is
   not proof that a hosted run or branch rule enforced it.
3. **07-10 - Explain the layers.** A Git diff compares file contents at two
   commits. A workflow run shows what happened for a particular event and
   checkout. A branch rule is separate hosted configuration. A match in one
   layer does not prove the others match.
4. Show the owner's baseline SHA and invariant if supplied. If either is
   missing, say so and demonstrate the bounded current-source inventory
   instead of inventing an approved comparison.

## 10-28: One facilitator investigation

**If the approved baseline or invariant is missing:** In the same terminal,
replace the placeholder with the full observed current SHA recorded during
preparation:

```bash
CURRENT_SHA='PASTE_OBSERVED_FULL_SHA'
git rev-parse --verify "${CURRENT_SHA}^{commit}"
git ls-tree -r --name-only "$CURRENT_SHA" -- .github/workflows
```

If the SHA does not resolve, stop and request an accessible immutable ref.
If the listing contains `.github/workflows/ci.yml`, open that actual current
file with:

```bash
git show "${CURRENT_SHA}:.github/workflows/ci.yml"
```

Record its trigger, checkout and test command. If the file is absent, open
another listed workflow or mark the source read **BLOCKED**. This inventory
does not establish drift. Skip demo steps 1-3 and continue at step 4; keep
the missing approval **BLOCKED**.

1. **10-13 - Bind the two revisions.** In your clone, use the full SHA
   approved by the owner as the baseline and the full SHA of the actual
   current revision you intend to examine. In the assignments below, replace
   the text between quotes with those observed SHAs; do not type placeholders
   as if they were commits.

   ```bash
   BASELINE_SHA='PASTE_APPROVED_FULL_SHA'
   CURRENT_SHA='PASTE_OBSERVED_FULL_SHA'
   ```

   Confirm each commit exists locally:

   ```bash
   git rev-parse --verify "${BASELINE_SHA}^{commit}"
   git rev-parse --verify "${CURRENT_SHA}^{commit}"
   ```

   Each command should print a full commit SHA. If either fails, stop the
   local comparison and ask for an accessible ref or use the owner's
   authorized immutable GitHub view. Do not substitute another branch.
2. **13-17 - Find the real files and diff.** Run:

   ```bash
   git ls-tree -r --name-only "$BASELINE_SHA" -- .github/workflows
   git ls-tree -r --name-only "$CURRENT_SHA" -- .github/workflows
   git diff "$BASELINE_SHA" "$CURRENT_SHA" -- .github/workflows
   ```

   Read the path list before naming a file. If no workflow is present at a
   required revision, mark that comparison **BLOCKED** and ask the owner
   whether the target is correct. If the diff is empty, confirm both SHAs
   and paths before saying no source difference was found.
3. **17-21 - Interpret one invariant.** Open the relevant files at each
   commit. For example, if both path lists include
   `.github/workflows/ci.yml`, run:

   ```bash
   git show "${BASELINE_SHA}:.github/workflows/ci.yml"
   git show "${CURRENT_SHA}:.github/workflows/ci.yml"
   ```

   Check the actual trigger/filter, checkout, runtime, test command,
   permissions, and job/check names as relevant to the owner's invariant.
   State the exact observed difference and its possible consequence. A
   newer runtime may be approved; a missing test command may reduce coverage.
   Do not call either a defect without the applicable requirement.
4. **21-25 - Inspect an existing approved proposal.** Only if the owner
   supplied an existing proposal in this repository, replace the placeholders
   below with its actual repository, PR number, and base branch. If no
   eligible proposal was supplied, skip these reads and record the proposal
   comparison **BLOCKED**.

   ```bash
   OWNER='msfttoler'
   REPO='wre-flight-deck'
   PR='PASTE_EXISTING_APPROVED_PR_NUMBER'
   BASE='PASTE_OBSERVED_BASE_BRANCH'
   gh pr view "$PR" --repo "$OWNER/$REPO" \
     --json url,state,headRefName,headRefOid,baseRefName,baseRefOid,reviewDecision
   gh pr diff "$PR" --repo "$OWNER/$REPO" --color never
   gh api "repos/$OWNER/$REPO/branches/$BASE" --jq '.commit.sha'
   ```

   In GitHub, open that same PR and inspect **Files changed** for the selected
   workflow and **Conversation** for the actual review state. Confirm the
   owner record names this repository and the exact observed PR head SHA.
   Read the PR patch; a green summary or review-state label alone does not
   establish that the specific changed setting was approved.
5. **25-28 - Refresh moving refs and separate execution.** Re-read the
   current base before using the comparison. If a proposal was inspected,
   also re-read its head/base below; otherwise skip the PR command. If a ref
   moved or a read fails, mark the old comparison **STALE** or freshness
   **UNKNOWN**, then repeat only with a coherent set of actual SHAs.

   ```bash
   gh api "repos/$OWNER/$REPO/branches/$BASE" --jq '.commit.sha'
   gh pr view "$PR" --repo "$OWNER/$REPO" \
     --json headRefOid,baseRefOid,reviewDecision,url
   ```

   If a real Actions run is available, open it in GitHub and record the
   event, attempt, conclusion, and checkout step separately. A run head and
   the job's checked-out code can differ; a test-merge SHA is not
   automatically stale. If no run or logs are available, record that gap.
   Workflow source, accepted proposal, and execution are separate evidence.

If GitHub Actions access or logs are unavailable, mark execution evidence
**BLOCKED** and continue with the available source comparison or the
current-only inventory.

## 28-35: Retrieval and handoff

**28-31 - Manual Live Quiz Sprint.** Use paper, fingers, or chat:

1. Is all workflow drift harmful?
2. Does matching YAML prove matching branch settings?
3. Does a local `npm test` prove a path-filtered workflow ran?

Facilitator key: **no** to all three.

**31-33 - Read, Rule Out, Return.** Read the approved invariant or, if absent,
the proposed condition; rule out an unapproved baseline. If the comparison
found a difference, return to that difference and its possible consequence.
If it found none, report the scoped empty diff. If no comparison was
performed, summarize the current inventory and request the missing approval
or accessible revision.

**33-35 - Handoff.** Choose a different invariant and identify the first
source you will inspect. Ask whether an existing approved proposal is
available for that case; do not make one. Start independent work at minute
35 even if hosted evidence is unavailable.

## 35-70: Independent practice - assess another invariant

When your core work is on track, use the [Week 10 investigation challenge](sessions.md#make-the-practice-time-useful).

1. **35-40:** Pick one invariant different from the facilitator's: test execution,
   token permissions, trigger coverage, or the release producer. Write the
   exact condition the owner expects. If no second invariant was approved,
   label yours a **proposal** and its approval **BLOCKED**.
2. **40-44:** In your own clone, set `CURRENT_SHA` to the observed full SHA and verify
   it using the current-only commands above. If an approved baseline exists,
   also set `BASELINE_SHA` to the owner's actual full SHA and verify it.
   Record the repository and available SHAs outside tracked app files.
3. **44-51:** If both commits resolve and the baseline is approved, list their workflow
   files and run the two-revision `git diff` from the demonstration. Open the
   actual affected file at each revision. Record its path, observed difference
   or confirmed empty diff, and the invariant it could affect. Otherwise use
   the current-only inventory above, mark the comparison **BLOCKED**, and
   write the exact baseline decision you need.
4. **51-55:** In GitHub **Actions**, open a real accessible run if one exists. Record
   the run URL, event, conclusion, revision, and actual checkout when its
   log establishes it. If the run or checkout is unavailable, mark that
   execution evidence **BLOCKED** or **UNREVIEWED**.
5. **55-59:** Decide **accepted**, **requires owner decision**, or **unknown** for
   each observation. Name the downstream check, rule, event, or producer
   that could be affected, and separate a predicted consequence from an
   observed result. A proposed invariant remains **BLOCKED** for approval;
   do not accept it as an owner-approved requirement.
6. **59-64:** If an existing approved PR is available, verify its repository, full
   head/base SHAs, review state, and changed workflow lines in GitHub and
   with `gh pr view` / `gh pr diff`. Refresh the base and PR refs before
   handoff; if they moved, mark the comparison stale and repeat it. If no
   approved PR exists, keep that evidence **BLOCKED** and do not invent one.
7. **64-66:** If you compared the revisions and found no source difference, report that
   scoped result. Describe one clearly labeled *proposed* change, such as
   narrowing a trigger, and explain what its owner would need to check. Do
   not edit or push a workflow merely to manufacture drift.
8. **66-70:** Save the available SHAs, file-specific observations, actual run link or
   blocked cell, decision, and one precise owner question. If the approved
   baseline is missing, submit a current-source inventory and evidence
   request as partial work, not a drift verdict.

### Progressive hints

1. Verify the owner-approved baseline before calling any change drift.
2. Read the actual changed workflow lines against one named invariant.
3. Keep source, review, hosted run, and branch-rule evidence as separate
   cells; unavailable cells stay blocked.

## 70-83: Self-check and debrief

**70-75:** Check that every supplied SHA resolves to the intended commit and
every claim identifies its file or run. If the approved baseline or invariant
is missing, keep the relevant approval **BLOCKED**. An empty diff does not
establish that a job ran or that settings are unchanged.

**75-81:** Discuss one observed or proposed difference. If a repair would
restore an older runtime or pin, check current requirements before
recommending it; blindly reverting can reintroduce a risk.

**81-83:** Record the decision, unknowns, and owner action. If the current
revision moved during the exercise, preserve the original SHA and time,
then label any later observation separately.

## 83-85: Transfer and close

Transfer the method: a customer needs an owned baseline and
acceptance process, not a label of "noncompliant" for every difference.
Hosted enforcement and classroom rehearsal remain unreviewed unless
actually checked.

Reference: [GitHub's current comparison guidance](https://docs.github.com/en/pull-requests/how-tos/commit-changes/comparing-commits).
