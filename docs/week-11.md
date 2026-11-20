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
2. The normal route needs a browser, Git and an existing authenticated
   GitHub CLI for GitHub metadata reads. Git LFS is needed only for its
   optional inventory branch. Use a bash-compatible terminal such as Git
   Bash on Windows. Node, a running app, a learner branch,
   destination administrator access, and an earlier session are not required.
   Existing read-only GitHub access may reveal additional metadata.
3. Create a fresh source clone. `river-a1` is an example; replace it in every
   command with your own non-sensitive, unused attempt name:

   ```bash
   cd ~
   git clone --no-checkout https://github.com/msfttoler/wre-flight-deck.git wre-w11-river-a1
   ```

   If cloning fails or the folder exists, stop and choose another name.
   After a successful clone:

   ```bash
   cd ~/wre-w11-river-a1
   git remote -v
   git rev-parse 'wre-v1^{commit}'
   git rev-parse HEAD
   ```

   Confirm both remote URLs name `msfttoler/wre-flight-deck`. Do not share a
   URL containing credentials. A no-checkout clone has not populated its
   working tree; status may show files as deleted. Do not repair or reset it
   for this read-only inventory.
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

## 00-10: Frame the customer question

**00-03 — Customer problem.** The airline's platform engineer is considering
a repository move. A source clone is not proof that the destination will
preserve the service's complete history or operating context.

**03-05 — Three questions.** Ask learners to predict:

1. Can this local clone represent the source's full Git history?
2. Does a small Git LFS pointer mean the large asset will arrive?
3. What collaboration history can we see, and what would need verification
   after a move?

**05-07 — Flash Rewind.** Git objects, hosted metadata, identities, and
integrations have different migration boundaries.

**07-10 — Mental model and setup.** The target is the actual
`msfttoler/wre-flight-deck` source named in the guide; destination details
come from the owner's approved migration plan. Use Git and GitHub.com
read-only. A missing destination requirement is **UNKNOWN**, not a guess.
The inventory does not perform an import or prove the destination is ready.

## 10-28: One facilitator investigation

1. **10-16 — Compare history and refs.** In your clone, run:

   ```bash
   git remote -v
   git rev-parse HEAD
   git rev-parse --is-shallow-repository
   git for-each-ref --format='%(refname)%09%(objectname)%09%(objecttype)' \
     refs/heads refs/remotes refs/tags
   git ls-remote origin --heads --tags
   ```

   First confirm both origin URLs are the approved source. Stop remote reads
   on a mismatch. Compare local refs with advertised heads and tags; record
   the source, observed `HEAD`, shallow status, refs, and time. A ref list
   does not establish that every object or every in-scope ref is present.
   Do not copy credential-bearing URLs into the inventory.
2. **16-21 — Separate LFS pointers from payloads.** From the clone root:

   ```bash
   git lfs version
   ```

   Only if Git LFS is available, run:

   ```bash
   git lfs ls-files --all --long
   ```

   Record actual paths, OIDs and markers; `-` denotes a pointer and `*` a
   full local object. This lists references in the local clone. It does not
   fetch payloads or establish destination availability. If LFS is missing,
   mark this inventory **BLOCKED**, not empty.
3. **21-26 — Inspect visible collaboration metadata.** With existing
   authorized GitHub CLI access, run:

   ```bash
   gh api 'repos/msfttoler/wre-flight-deck/pulls?state=all&per_page=100' \
     --paginate --jq 'length'
   gh api 'repos/msfttoler/wre-flight-deck/issues?state=all&per_page=100' \
     --paginate --jq '[.[] | select(has("pull_request") | not)] | length'
   ```

   Each command prints one count per page. Add counts only when every page
   succeeds; record the endpoint, filter, visible identity, page count and
   time. Open a relevant visible issue or pull request and record its link.
   A count alone cannot show whether its content or attribution will survive.
   If access fails, record the missing evidence, not zero.
4. **26-28 — Connect the inventory to a decision.** Choose the required
   fidelity: snapshot, history, or history plus metadata. Note actual
   history, LFS, identity, integration and destination gaps. Use only
   approved redacted settings evidence; never open or copy secret values.
   Name the owner and later acceptance check. Do not transfer a repository,
   change a remote, or mirror-push.

Ask: "Who will verify that the destination still trusts the release
producer?" A clone and a passing local test cannot answer that by themselves.

## 28-35: Retrieval and handoff

**28-31 - Manual Live Quiz Sprint.** Accept written, finger, or chat answers:

1. Can a shallow clone omit history needed for a migration?
2. Does an LFS pointer prove that its payload is available at the destination?
3. Do equal metadata counts prove that the same records and attribution arrived?

Facilitator key: **yes, no, no**. Check the actual migration path and
representative objects rather than assuming fidelity from a count.

**31-33 - Read, Rule Out, Return.** Read the destination constraint; rule out
Git-only completeness; return to the missing acceptance evidence and owner.

**33-35 — Handoff.** Practice changes the selected evidence category or
destination condition. Start at minute 35 even if settings are unavailable.

## 35-70: Independent practice - investigate one migration risk

When your core work is on track, use the [Week 11 investigation challenge](sessions.md#make-the-practice-time-useful).

1. **35-43 — Bind your source.** Choose a second real repository from the
   owner's approved scope and an authorized local clone. If none is
   available, mark the second-repository case **BLOCKED**. You may repeat
   an independent read of Flight Deck as a clearly labeled partial fallback;
   it is not a second source. Choose one actual history, LFS or collaboration
   metadata condition that could change acceptance. A different repository
   name or count alone is not a meaningful contrast. If there is no
   decision-changing contrast, mark independent transfer **BLOCKED** even
   when a second repository is available.
2. In your own shell, replace these placeholders with your approved clone and,
   for a GitHub metadata investigation, its actual owner and repository:

   ```bash
   LAB_DIR='/replace/with/your/approved/clone'
   LAB_OWNER='replace-with-owner'
   LAB_REPO='replace-with-repository'
   git -C "$LAB_DIR" remote get-url origin
   git -C "$LAB_DIR" remote get-url --push origin
   ```

   Privately compare both origins with the approved source. Stop remote reads
   if either is missing or different. For a GitHub metadata read, also
   compare `LAB_OWNER/LAB_REPO` with that approved GitHub origin; stop if it
   differs or cannot be verified. Preserve existing work.
3. **43-52 — Inspect your selected risk.** Use only the relevant branch:

   - **History:** run `git -C "$LAB_DIR" rev-parse --is-shallow-repository`,
     then `git -C "$LAB_DIR" for-each-ref --format='%(refname)%09%(objectname)%09%(objecttype)' refs/heads refs/remotes refs/tags`
     and `git -C "$LAB_DIR" ls-remote origin --heads --tags`. Keep the actual
     relevant ref and explain what the comparison does not prove.
   - **LFS:** run `git lfs version`; only if it succeeds, run
     `git -C "$LAB_DIR" lfs ls-files --all --long`. Keep an actual relevant
     OID, or mark its absence or unavailable tool honestly. A pointer is not
     proof of a payload at either destination.
   - **Metadata:** for the actual GitHub source only, run:

     ```bash
     gh api "repos/$LAB_OWNER/$LAB_REPO/issues?state=all&per_page=100" \
       --paginate --jq '[.[] | select(has("pull_request") | not)] | length'
     ```

     Open a relevant actual issue or pull request and retain its link.
     Record visibility, filters, page counts and total only after all pages
     succeed. Use an approved native read for another host. Equal totals do
     not prove equal objects.
4. **52-61 — Connect evidence to acceptance.** Compare your real ref, OID or
   object with the owner's actual fidelity requirement. Write one specific
   check for a later owner-led dry run, or name the exact missing read.
   Do not infer payload availability, complete history or matching records.
5. **61-70 — Save the handoff.** Mark uninvestigated history, LFS,
   collaboration metadata, identity/access and integration categories
   **UNKNOWN**. For a partially inspected category, name the remaining gap.
   Identify each owner or record that the owner needs identification. Hold
   cutover pending the missing evidence and a later authorized dry run; do not
   claim overall readiness, perform an import or change access.

### Progressive hints

1. Separate Git refs and tracked files from hosted items and account access.
2. Choose one pre-existing condition that could change the migration's
   acceptance, rather than counting every repository feature.
3. Turn the observation into a later owner-led check; do not treat an
   inventory as a migration or a readiness approval.

## 70-83: Self-check and debrief

**70-75:** Check each inventory row for a real source, revision or time,
and an honest status. A hidden setting is not an absent setting.

**75-81:** Discuss how a destination runner policy or missing integration
could change the recommendation even when application tests pass. If the
source moved during inspection, preserve the original SHA and time and
record the newer observation separately.

**81-83:** Write the smallest request for the destination or integration
owner, including the acceptance evidence needed without secret values.

## 83-85: Transfer and close

Transfer the inventory to a customer move: agree what must be
preserved, who checks it, and how to roll back before proposing an effectful
migration. No move or classroom rehearsal is claimed.

Reference: [GitHub's current migration-planning guidance](https://docs.github.com/en/migrations/overview/planning-your-migration-to-github).
