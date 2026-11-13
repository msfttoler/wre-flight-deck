# Week 01: Recover the change you meant to keep

The airline's engineer needs to recover useful work without discarding a second
change. By the end, recover a local commit onto the intended branch and explain
which content lives in the working tree, index and history. This is real Git
work, not a staged application defect.

## Preparation and independent entry

Read [session setup, timing and evidence rules](sessions.md). No earlier week
is needed. The owner supplies the app and published `wre-v1` tag; learners need
only local write access, Git and Node 24+. Replace `YOUR-ID` as explained there.

```bash
git clone https://github.com/msfttoler/wre-flight-deck.git wre-w01-YOUR-ID
cd wre-w01-YOUR-ID
git switch -c learner/w01-YOUR-ID wre-v1
git rev-parse HEAD
npm test
npm start
```

In the local browser, inspect a route and quote to understand the product whose
work you are protecting. Stop the server before the Git demonstration.
Missing tag/runtime means **BLOCKED**, not permission to use another baseline.

## Mental model and facilitator demo

Use the [85-minute route](sessions.md#shared-85-minute-delivery): 12-30 is this
demo, 35-70 is independent practice and 70-83 is self-check/debrief.

Say: "Git can recover a commit when we still have its identity. An uncommitted
edit has different recovery options. First we will preserve both."

1. On a separate facilitator clone/branch, add an original, accurate observation
   to `docs/week-01.md`, such as what the route search displays. Inspect
   `git diff` before staging. This is useful documentation work, not a bug.
2. Stage only that file with `git add docs/week-01.md`, inspect
   `git diff --cached`, then locally `git commit -m "Document route inspection"`.
   Record `git rev-parse HEAD` as the commit to recover.
3. Switch to a new local branch from the tag:
   `git switch -c recovery/w01-YOUR-ID wre-v1`.
   The useful commit is now absent from this branch, not deleted.
4. Run `git log --oneline --all -8` and `git reflog -8`. Explain branch history
   versus this clone's local record of reference movement.
5. Run `git cherry-pick COMMIT_SHA`, replacing `COMMIT_SHA` with the full recorded
   commit. Inspect `git show --stat HEAD`, `git diff wre-v1..HEAD` and `npm test`.
   GitHub's repository commit view can corroborate the published baseline,
   but the recovered local commit is not on GitHub unless separately published.

Ask: "Would restoring a file from the tag preserve our new observation?"
It would not. File restoration and commit recovery solve different problems.
Cherry-pick gives the change a new commit identity; it is not evidence that
the original branch was merged.

## Independent practice: preserve the unrelated edit

Choose a meaningful observation about a quote or reservation and make a local
documentation commit on your learner branch. Record its SHA. Separately edit
another paragraph without committing it. The changed condition is valuable
uncommitted work that must survive switching to a fresh recovery branch.

Inspect `git status --short` and `git diff`. Choose to commit the second change
separately or preserve it with `git stash push -m "w01 unrelated observation"`.
If stashing, inspect `git stash list` and `git stash show -p 'stash@{0}'`.
Create your own `recovery/w01-YOUR-ID` from `wre-v1`, then recover only the
intended commit. If appropriate, restore saved work with `git stash apply`
without dropping its backup until the diff is verified.

Submit a local evidence note: original and recovered SHAs, selected diff,
where the unrelated edit remains, actual test result and why your method did
not require `reset --hard` or a force-push. No push or merge is needed.

## Failure, recovery and tradeoff

- Switch refused due to local edits: inspect the diff; preserve it before
  continuing. Do not use a destructive switch or clean command.
- Cherry-pick conflict: read `git status`, resolve only understood content,
  stage it and `git cherry-pick --continue`; otherwise use
  `git cherry-pick --abort` to return to the pre-pick state.
- Missing commit: inspect this clone's reflog and other local branches.
  Reflog is local and can expire; a fresh clone cannot recover an unpushed
  commit from another machine. Stop before guessing a destructive repair.

## Retrieval, self-check and transfer

At 30-33, use the manual **Live Quiz Sprint**: Is reflog remote backup? Does a
green test recover text? Does cherry-pick preserve commit identity?
Facilitator key: no; no; generally no. At 33-35 use **Read, Rule Out, Return**:
read which work must survive, rule out destructive commands, return to the
smallest recovery.

At 70-83, verify both changes remain available, the intended diff alone was
recovered and test results are recorded. Transfer: before recovering a customer
repository, identify what is committed, what is only local and who owns shared
history. Local recovery proves no hosted approval. Rehearsal is **UNREVIEWED**.
