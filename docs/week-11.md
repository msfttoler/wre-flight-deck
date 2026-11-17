# Week 11: Inventory before recommending a migration

The airline's platform engineer is considering a repository move. Identify
what is visible in Git, what depends on hosted configuration, and what the
destination must accept before recommending a move. This session does not
perform a migration.

**By the end:** produce an evidence-backed inventory, a conditional
recommendation, and a specific request for the facts an owner must supply.

## Before class: set the source and access boundary

1. Read [shared setup and evidence rules](sessions.md). The primary source is
   `msfttoler/wre-flight-deck`. The owner supplies any actual destination
   constraints and authorized, redacted settings evidence. An absent
   destination requirement remains **unknown**, not an invented policy.
2. The normal route needs a browser and Git. Use a bash-compatible terminal
   such as Git Bash on Windows. Node, a running app, a learner branch,
   destination administrator access, and an earlier session are not required.
   Existing read-only GitHub access may reveal additional metadata.
3. Create a fresh source clone. `river-a1` is an example; replace it in every
   command with your own non-sensitive, unused attempt name:

   ```bash
   cd ~
   git clone https://github.com/msfttoler/wre-flight-deck.git wre-w11-river-a1
   ```

   If cloning fails or the folder exists, stop and choose another name.
   After a successful clone:

   ```bash
   cd ~/wre-w11-river-a1
   git remote -v
   git status --short --branch
   git rev-parse 'wre-v1^{commit}'
   git rev-parse HEAD
   ```

   Confirm both remote URLs name `msfttoler/wre-flight-deck`. Do not share a
   URL containing credentials. The `##` line is a branch header; other
   status lines indicate changes. Stop and preserve unexpected work.
   Record the approved `wre-v1` source SHA and your actual `HEAD` separately:
   a fresh clone may open a newer default branch. For baseline claims,
   compare the tag SHA with the owner's approved SHA. A missing/mismatched
   tag blocks baseline-specific claims; do not silently substitute `main`.
4. Open a local note outside tracked app files. Make columns:
   **item**, **source and revision/time**, **destination requirement**,
   **status**, **owner**, **acceptance check**, and **rollback concern**.
   Do not include secret values or personal account information.

Optional: the [Flight Deck quick start](../README.md#get-airborne) explains
the local app. Its ignored `.data/` is local development state, not Git
history or a dataset to upload for this exercise.

## 00-12: Open and explain the task

1. **00-05 - Open the problem.** Say: "The team can clone the repository.
   Before moving it, we must know what else the service depends on and who
   will accept the result." Ask whether a successful clone proves the
   destination's rules and integrations are ready. It does not.
2. **05-12 - Explain the inventory.** Separate Git content and history from
   hosted issues, pull requests, releases, Actions history, settings,
   secrets, rules, and App installations. A migration tool may transfer
   some metadata, but the result depends on the selected migration path;
   a normal clone alone does not establish those transfers.
3. Show the blank inventory columns. Explain **observed** versus
   **unknown** and why the destination owner and acceptance check matter.

## 12-30: Facilitator demonstration

1. **12-16 - Identify the source snapshot.** In your clone, run:

   ```bash
   git remote -v
   git rev-parse HEAD
   git branch -a
   git tag --list
   ```

   Record the source repository, observed `HEAD`, visible branch/tag names,
   and observation time. A normal clone does not prove that every
   server-side ref or large-file object was captured. Do not copy
   credential-bearing URLs into the inventory.
2. **16-20 - Inventory tracked implementation.** From the clone root, run:

   ```bash
   git ls-files
   git ls-files .github/workflows
   ```

   Open `package.json` and one path actually listed under
   `.github/workflows`. Record the actual runtime requirement, native test
   command, workflow trigger, and any runner or producer dependency you can
   see. These files are evidence at your recorded `HEAD`, not proof that
   a workflow ran or that a destination has the same settings.
3. **20-25 - Inspect hosted items separately.** Open
   [Flight Deck on GitHub](https://github.com/msfttoler/wre-flight-deck).
   Select **Issues**, then **Pull requests**, then **Actions**. Return to
   **Code** and open **Releases** from the repository page if visible.
   Record only the items or counts you can actually see, with the time and
   source. Do not assume a count is permanent or that the clone includes it.
4. If the owner supplied a redacted rules, integration, or secret-*existence*
   record, add its source and limitation. Never open or copy secret values.
   Inaccessible settings, integrations, or release details are **BLOCKED**,
   not proof that they are absent. Do not require learners to open Settings.
5. **25-30 - Connect the inventory to a decision.** Add a destination
   requirement, responsible role, acceptance check, and rollback concern
   for one tracked workflow and one hosted or unavailable dependency.
   Say which claim is observed and which still needs an owner answer.
   Do not transfer a repository, change a remote, or mirror-push.

Ask: "Who will verify that the destination still trusts the release
producer?" A clone and a passing local test cannot answer that by themselves.

## 30-35: Retrieval and handoff

**30-33 - Manual Live Quiz Sprint.** Accept written, finger, or chat answers:

1. Does a Git clone include the repository's secret values and settings?
2. Is the local `.data/` directory automatically part of source history?
3. Is an assumption about the destination the same as observed evidence?

Facilitator key: **no** to all three. A particular migration tool can have
additional capabilities; check the actual migration path rather than
assuming them from the word "clone."

**33-35 - Read, Rule Out, Return.** Read the destination constraint; rule out
Git-only completeness; return to the missing acceptance evidence and owner.
Start independent work at minute 35 even if settings are unavailable.

## 35-70: Independent practice - one destination constraint

1. Choose one question:
   - Does the destination support the observed Actions runner requirements?
   - Can the integration and release producer be trusted at the destination?

   Use an owner-supplied requirement if available. Otherwise write the
   question as a condition, not as a claimed destination policy.
2. Record your source repository, `git rev-parse HEAD`, and observation time.
   Use `git ls-files .github/workflows` and open at least one actual workflow.
   Record a concrete source dependency relevant to your chosen question.
3. Inspect the accessible GitHub **Issues**, **Pull requests**, **Actions**,
   or **Releases** view relevant to your question. Record its link and what
   you actually see. If the needed view is unavailable, mark it **BLOCKED**
   and name the redacted evidence an authorized owner could provide.
4. Fill at least these inventory rows: tracked source/workflow; one hosted
   item or unavailable setting; destination requirement; and the local
   `.data/` boundary. For the last row, open `.gitignore` and run these
   commands from the clone root:

   ```bash
   git ls-files -- .data
   git check-ignore -v .data/state.json
   ```

   Record the actual tracked-file listing and ignore rule separately. An
   ignore rule alone does not prove that no matching file was already tracked.
   For each row, fill the evidence, status, owner, acceptance check, and
   rollback concern. Use **unknown** when the owner has not supplied the
   destination fact.
5. Recommend **ready**, **not ready**, or **unknown** only for your
   stated condition. Explain the observation that supports the recommendation
   and the next fact that could change it. A conditional recommendation is
   valid; it is not permission to move anything.
6. Save the inventory and a short customer handoff outside tracked app
   files. Name the source SHA, one required acceptance check, one rollback
   concern, and the next responsible owner. Do not copy secret values,
   change repository settings, or upload local application data.

Optional read-only comparison: open
[`msfttoler/wre-week-02`](https://github.com/msfttoler/wre-week-02) if
accessible and compare one actually observed dependency. It is not a
prerequisite or a second migration target; do not edit or copy that course.

## 70-85: Self-check, recovery, and close

**70-75:** Check each inventory row for a real source, revision or time,
and an honest status. A hidden setting is not an absent setting.

**75-81:** Discuss how a destination runner policy or missing integration
could change the recommendation even when application tests pass. If the
source moved during inspection, preserve the original SHA and time and
record the newer observation separately.

**81-83:** Write the smallest request for the destination or integration
owner, including the acceptance evidence needed without secret values.

**83-85:** Transfer the inventory to a customer move: agree what must be
preserved, who checks it, and how to roll back before proposing an effectful
migration. No move or classroom rehearsal is claimed.

Reference: [GitHub's current migration-planning guidance](https://docs.github.com/en/migrations/overview/planning-your-migration-to-github).
