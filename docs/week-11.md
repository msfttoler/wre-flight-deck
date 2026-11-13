# Week 11: Inventory before recommending a migration

The airline's platform engineer is assessing a repository move. Produce a
source-and-settings inventory, name what Git history will not establish and
define acceptance before recommending a migration. No actual move is performed.

## Preparation and independent entry

Read [shared setup and evidence rules](sessions.md). The primary target is
`msfttoler/wre-flight-deck` only. The owner provides the proposed destination
constraints and any authorized settings evidence. Without them, migration
feasibility remains a bounded proposal, not approval.

```bash
git clone https://github.com/msfttoler/wre-flight-deck.git wre-w11-YOUR-ID
cd wre-w11-YOUR-ID
git switch -c learner/w11-YOUR-ID wre-v1
git rev-parse HEAD
npm test
npm start
```

Use Node 24+ and your unique `YOUR-ID`. Missing tag/runtime blocks app entry.
Inspect planning, a quote and local persistence in the real UI. The ignored
`.data/` directory belongs to a local development instance, not repository
history or a dataset to upload. Learners need no destination admin permission.

## Mental model and facilitator demo

Use the [85-minute route](sessions.md#shared-85-minute-delivery): demo 12-30,
individual practice 35-70 and self-check/debrief 70-83.

A repository includes Git objects and hosted metadata/configuration. A clone
does not establish that issues, rules, secrets, App installations, releases,
attestations or Actions history will transfer. Actual migration behavior
depends on the chosen source, destination and supported method.

1. Record the source repository and immutable baseline. Use `git remote -v`,
   `git branch -a`, `git tag --list` and `git ls-files` to inventory what this
   clone actually exposes. A normal clone is not proof every server-side ref
   or large-file object has been captured.
2. Read package/runtime and the actual workflow files, if present. Inventory
   test command, Node 24+ requirement, path assumptions, package dependencies
   and release producer references without inventing absent files.
3. In GitHub, inspect accessible issues/PRs, Releases, Actions and repository
   settings evidence. Record visible counts/identities only at an observation
   time, and mark inaccessible secrets/rules/integrations **BLOCKED**. Do not
   copy secret values or infer a hidden setting is absent.
4. Separate tracked source, hosted metadata, access/policy, integrations and
   local runtime data. For each, name the destination dependency, owner and
   post-move acceptance check.
5. Define rollback and decision authority before an effectful migration.
   This session does not transfer, mirror-push, import or change remotes.

Say: "A successful clone proves access to some Git content, not a complete
migration. We need an acceptance plan for the things outside that clone."
Ask who would verify that the new release producer is still trusted.

## Independent practice: change the destination constraint

Choose one: the destination requires a different Actions runner policy, or it
cannot assume the current GitHub App installation and release-producer trust.
Assess the single primary repository against that constraint.

Build an inventory with: item, source evidence/revision, destination assumption,
status, owner, acceptance check and rollback concern. Inspect at least one real
workflow/runtime dependency and one hosted or unavailable dependency.
Recommend ready/not ready/unknown for the chosen move, explaining the next
fact that would change your decision. Do not make up a destination policy.

Optional read-only reference: inspect `msfttoler/wre-week-02` in the browser or
with `gh repo view msfttoler/wre-week-02`. If useful, compare one observed
dependency with the primary repo. Access is not guaranteed and no consequential
difference is assumed. Do not edit that repository, copy its course, rely on
previous sessions or turn the exercise into a mandatory two-repository migration.

## Failure, recovery and tradeoff

- Missing destination requirement: write a conditional recommendation and ask
  the owner; do not claim readiness against an invented target.
- Hidden settings: record a specific redacted evidence request and responsible
  role. The ordinary route does not require opening admin settings.
- Source moves during inspection: preserve the recorded SHA and timestamps;
  separate later observations instead of blending them into one snapshot.

A smaller move is easier to validate, but omitting hosted policy or provenance
can change security behavior even when every application test still passes.

## Retrieval, self-check and transfer

Manual **Live Quiz Sprint**: Does clone include secrets/settings? Does local
state belong in source migration? Is a destination assumption evidence?
Facilitator key: no to all. **Read, Rule Out, Return**: read the destination
constraint, rule out Git-only completeness, return to acceptance and owner.

At 70-83, self-check each inventory status and the conditional recommendation.
Transfer: give the customer a decision-ready dependency inventory, not a claim
that a mirror push completes migration. Actual migration is unperformed;
inaccessible evidence is **BLOCKED**, and rehearsal is **UNREVIEWED**.
