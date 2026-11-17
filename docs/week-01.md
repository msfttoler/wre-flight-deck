# Week 01: Recover the change you meant to keep

The airline's engineer needs a useful documentation change on the right
branch without losing a second edit. You will make and recover a real local
commit, preserve the uncommitted edit, and explain what the evidence proves.
This is Git recovery, not an application defect or a GitHub merge.

## Before class

- **Owner and facilitator:** Confirm the approved `wre-v1` commit with the
  owner, and prepare a separate facilitator clone. Do not move or recreate
  the tag. Have an editor, terminal and a way to show text at a readable size.
- **Learner, required for the complete route:** Git 2.23+ with `git switch`,
  Node.js 24+, npm, a browser, an approved local Git author identity, and
  write access to your own new directory. No previous week, GitHub write
  access, PR, peer approval or admin role is needed. A clone/network failure
  blocks the starting point; without Node, Git recovery can continue but the
  app and tests are **BLOCKED**.
- **Optional:** A read-only GitHub view of the published baseline. The
  recovered commit and app state stay local unless separately published.

Read [shared setup and evidence](sessions.md). `YOUR-ID` below is a unique,
non-sensitive handle plus attempt suffix using only letters, digits and
hyphens, such as `river-a1`; use it in both directory and branch names.
In a terminal, from a parent directory you own, check the tools and create
a fresh clone:

```bash
git --version
node --version
npm --version
git clone https://github.com/msfttoler/wre-flight-deck.git wre-w01-YOUR-ID
```

Only if the clone succeeds, enter it:

```bash
cd wre-w01-YOUR-ID
```

If `cd` fails, stop before running Git. Otherwise inspect the clone:

```bash
git remote -v
git status --short --branch
git rev-parse 'wre-v1^{commit}'
```

Compare the origin fetch and push URLs with `msfttoler/wre-flight-deck`,
without sharing credentials. Compare the resolved tag commit with the owner's
approved SHA. A different target, dirty clone, missing tag or mismatch is
**BLOCKED**; do not substitute `main`. Create an unused branch only after
those checks:

```bash
git switch -c learner/w01-YOUR-ID wre-v1
```

If branch creation fails, stop and choose another unused name; do not edit an
existing branch. Only after success, run `git rev-parse HEAD` and confirm it
equals the approved tag commit. Check
`git config --get user.name` and `git config --get user.email` privately;
if an approved author identity is missing, ask the owner how to configure it.
These commit fields are not GitHub authentication. Do not display the email
in the shared evidence.

From the clone root, run `npm test` and record the actual result. A failing
baseline can still support Git recovery, but it is not a passing test.
For the product context, run `npm start`, open `http://127.0.0.1:3000`,
and select **Plan a journey**. Choose actual **From** and **To** airports and
**Passengers**, then **Find flights**. On an available itinerary, select
**Review fare**, choose **Checked bags**, and select **Calculate fare**.
Read the quote; do not enter real passenger data. Stop your own server with
Ctrl-C before switching branches. The fictional local app is not hosted
GitHub evidence. If it cannot start, record the error and continue the Git
work only if the verified clone is available. If there are no available
itineraries, try another displayed route; if none works, mark the preview
**BLOCKED** without inventing flight data.

If the port is already in use, do not browse the unknown service or stop
someone else's process. If no process is using this clone's `.data`, try
`PORT=3001 npm start` and open `http://127.0.0.1:3001` only if that start
succeeds. Choose another unused port if needed; never run two servers against
the same state directory or delete state to make room.

Keep a plain-text evidence note outside the clone: target, approved baseline
SHA, UTC time, role, commands, actual results and limits. Do not put credentials
or private account details in it.

## 00-05: The customer problem

**Say:** "A useful change exists on one branch, but another edit has not been
committed. We need the first change on a recovery branch without losing the
second."

Ask: "Which piece would you protect first if the branch switch were refused?"
The uncommitted edit has no commit ID yet. A local recovery is not a push,
merge or customer release.

## 05-12: Model and setup

The **working tree** is the files you edit. The **index** is the next commit's
staged snapshot. A **commit** is a named snapshot and history entry; branches
point to commits. The **reflog** records local reference movements in this
clone, not a remote backup. A stash can save tracked uncommitted edits without
adding them to a branch's history.

Show the verified facilitator branch and `git status --short --branch`.
Point out the local app observation you will document. Ask learners to keep
their own clone separate. If the tag or clone is blocked, do not invent a
history; use the model and mark the hands-on recovery **BLOCKED**.

## 12-30: Facilitator demo

Use the facilitator's own clean clone and learner branch, not a learner's
workspace. The following commands run from that clone's root.

1. In `docs/architecture.md`, add one short, accurate observation from the
   app or contract, such as what a quote does not reserve. Save the file.
   Run `git status --short` and `git diff -- docs/architecture.md`. The diff
   is an unstaged working-tree change, not a commit.
2. Run `git add docs/architecture.md`, then
   `git diff --cached -- docs/architecture.md`. Commit only that observation:

   ```bash
   git commit -m "Document quote observation"
   ```

   If Git refuses the commit, keep the edit and resolve the author/signing
   requirement through the owner; do not disable a required signing policy.
   Only after it succeeds, run `git rev-parse HEAD` and
   `git show --stat --oneline HEAD`. Verify the intended file is in that
   commit and record its full SHA as `COMMIT_SHA`.
3. Stop the local app if it is running. Create a different local branch from
   the approved tag:

   ```bash
   git switch -c recovery/w01-YOUR-ID wre-v1
   ```

   If the switch fails, stop before cherry-picking. After success, confirm
   `git branch --show-current` names your recovery branch, then run:

   ```bash
   git log --oneline --all -8
   git reflog -8
   ```

   The commit is absent from the recovery branch, but is still reachable from
   the original branch. The reflog is this clone's record and can expire.
4. Replace `COMMIT_SHA` with the full SHA actually recorded in step 2:

   ```bash
   git cherry-pick COMMIT_SHA
   ```

   If cherry-pick stops or fails, use the failure guidance below before
   continuing. Only after it succeeds, run:

   ```bash
   git rev-parse HEAD
   git show --stat --oneline HEAD
   git diff wre-v1..HEAD -- docs/architecture.md
   npm test
   ```

   Read the actual diff and test result. Cherry-pick applies the commit's
   change to the selected branch; its resulting SHA may differ because parent
   or metadata can differ. It does not merge the original branch. A test
   result does not itself prove the intended documentation was recovered.

**Ask:** "Would restoring this file from the tag keep the new observation?"
No: the tag has the baseline file. The next exercise adds a second, uncommitted
edit, so learners must preserve it before changing branches.

## 30-33: Live Quiz Sprint

Offer paper, fingers, chat or a private written answer; read the questions
aloud and allow written or additional-time responses without a speed ranking.

1. Is the reflog a remote backup? **No**, it belongs to this clone.
2. Does a green test recover missing text? **No**, inspect the recovered diff.
3. Does cherry-pick promise the original SHA? **No**; compare actual commits.

## 33-35: Read, Rule Out, Return

**Read** which change must move and which must survive. **Rule out** a hard
reset or a file restore that would discard useful work. **Return** to the
smallest safe recovery and its evidence. Hand over the separate learner clone;
start practice at minute 35 even if the demo encountered a block.

## 35-70: Independent practice

Work in your verified `wre-w01-YOUR-ID` clone, not the facilitator's. The
changed condition is a second, uncommitted edit. Do not push.

1. **35-40:** Confirm `git status --short --branch` shows your learner branch
   and no unexpected changes. Read `docs/architecture.md` and the
   [API contract](api-contract.md). Add one accurate, original observation
   about a quote or reservation to `docs/architecture.md`; save it.
2. **40-45:** Run `git diff -- docs/architecture.md`. Stage that file with
   `git add docs/architecture.md`, inspect `git diff --cached`, and run
   `git commit -m "Document reservation observation"`. If the commit fails,
   preserve the edit and use the failure guidance below. Only after success,
   run `git rev-parse HEAD` and `git show --stat --oneline HEAD`. Verify the
   intended file is in that commit and copy the full SHA as `COMMIT_SHA`.
3. **45-50:** Add a different accurate observation to the tracked `README.md`.
   Leave it uncommitted. Run `git status --short` and `git diff -- README.md`.
   Note why this second change is not contained in `COMMIT_SHA`.
4. **50-55:** Preserve just that tracked edit, then identify the actual stash:

   ```bash
   git stash push -m "w01 unrelated observation" -- README.md
   ```

   If that fails, stop and preserve the edit. After success, run
   `git stash list` and find the entry with that message. Replace `N` in
   the next command with its observed number, keeping the quotes, and check
   its contents:

   ```bash
   git stash show -p 'stash@{N}'
   git status --short
   ```

   If there is no matching entry or its patch does not contain your README
   edit, stop before switching. This path-limited stash does not save
   unrelated or untracked files. If unexpected work remains, preserve it
   before switching; do not discard it.
5. **55-60:** Create `recovery/w01-YOUR-ID` from `wre-v1` with
   `git switch -c recovery/w01-YOUR-ID wre-v1`. If the name exists or the
   switch is refused, stop and use the recovery guidance. After success,
   confirm `git branch --show-current` names your recovery branch. Run
   `git cherry-pick COMMIT_SHA`, replacing the placeholder with your recorded
   full SHA. Only after the pick succeeds, run `git rev-parse HEAD` and record
   the recovered SHA.
6. **60-65:** Inspect `git diff wre-v1..HEAD -- docs/architecture.md` and
   `git show --stat --oneline HEAD`. To compare the file with the original
   commit, run `git diff COMMIT_SHA HEAD -- docs/architecture.md` using your
   real SHA. An empty diff means those file snapshots match; it does not
   establish a merge. Run `git stash list` again and identify the same saved
   edit; its number can change. Apply it without dropping its backup:

   ```bash
   git stash apply 'stash@{N}'
   ```

   Replace `N` with the entry's current observed number. If apply reports a
   conflict, use the failure guidance before claiming success. Otherwise run:

   ```bash
   git status --short
   git diff -- README.md
   ```

   Verify the README edit is present and the recovered commit still contains
   only the intended change.
7. **65-70:** Run `npm test` and `git diff --check`; record actual results or
   **BLOCKED** if the runtime is unavailable. Leave the stash backup in place.
   In your note, include both full SHAs, the two file paths and observed diffs,
   the test result, and why no hard reset or force-push was needed.

## If something fails

- **Switch refused:** Read `git status --short` and the relevant `git diff`.
  Save or separately commit your own work before retrying. Never force the
  switch or clean the directory.
- **Cherry-pick conflict:** Run `git status`. Resolve only content you
  understand, `git add` the resolved file, then `git cherry-pick --continue`.
  Otherwise use `git cherry-pick --abort` to return to the pre-pick state.
  Record the conflict and do not claim recovery until the diff is checked.
- **Stash apply conflict:** Keep the stash, inspect `git status` and the
  conflicted file, and resolve only understood content. If unsure, stop and
  ask for help; do not drop the stash or reset away the conflict.
- **Commit missing:** Inspect `git log --oneline --all -8` and `git reflog -8`
  in the original clone. A fresh clone cannot recover an unpushed commit from
  another machine. Stop rather than guessing a destructive repair.

## 70-83: Self-check and debrief

- **70-75, self-check:** Can you locate the original commit, the recovered
  commit and the still-available README edit? Does the selected diff show the
  intended change? Are test results actual, failed or blocked?
- **75-81, facilitator discussion:** Ask, "What would be lost if the original
  machine disappeared before a push?" and "What is the tradeoff of keeping a
  stash backup?" A stash helps local recovery but is not a remote backup.
- **81-83, record:** Write your decision, any unresolved conflict and the next
  owner. No learner peer review or approval is required.

## 83-85: Transfer and close

Before recovering a customer's work, identify the clone, committed and
uncommitted changes, and who controls shared history. Share the minimal diff
and remaining risk with that owner. This local exercise proves no hosted
approval; native and classroom rehearsal of this guide remain **UNREVIEWED**.
