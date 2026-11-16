# Week 03: Identify who may act, and on what

The airline's engineer can read a public repository but needs to know whether
that identity may change it. Determine the current actor, target and visible
access limits without changing credentials or confusing GitHub access with
application security.

## Preparation and independent entry

Read [setup, timing and evidence rules](sessions.md). Learners need no admin
role; use an existing authorized account and redact identifying details.
For the read-only investigation, use GitHub and the existing GitHub CLI; no
clone, Node installation, learner branch or application server is required.

```bash
gh --version
gh auth status --help
gh api user --jq '.login'
```

If the help lists both `--active` and `--no-refresh`, run
`gh auth status --active --no-refresh --hostname github.com`; otherwise skip
that status check and record it as unknown. Never show tokens or copy raw
account metadata. If the CLI identity cannot be checked, a public browser
read may continue, but the account-specific observation is **BLOCKED**.

An application checkout and local UI are optional for this identity task.
If you choose to inspect them, confirm the approved baseline and follow the
[application setup](sessions.md#for-application-or-local-edit-work-use-a-fresh-clone).
From a parent you own, replace `YOUR-ID` with a unique attempt and use a new
directory and branch:

```bash
git clone https://github.com/msfttoler/wre-flight-deck.git wre-w03-YOUR-ID
cd wre-w03-YOUR-ID
git switch -c learner/w03-YOUR-ID wre-v1
git rev-parse HEAD
```

Local planning and dispatch controls are not GitHub authorization.

## Mental model and facilitator demo

Use the [85-minute route](sessions.md#shared-85-minute-delivery): demo 12-30,
individual practice 35-70, self-check/debrief 70-83.

Authentication establishes identity. Authorization permits a particular action
against a particular resource. A public read might succeed anonymously. Git's
local commit author is not necessarily the authenticated GitHub account.

1. Open the public repository and identify its owner and name. If you already
   have an approved clone, `git remote -v` shows its target and transport;
   otherwise mark local Git transport and commit-author configuration unobserved.
2. Compare the CLI actor with GitHub's browser account menu. The browser, `gh`
   and Git transport can use different credentials. Do not assume one
   authenticates another or copy a private email address into class evidence.
3. Read the repository in GitHub and run
   `gh repo view msfttoler/wre-flight-deck --json nameWithOwner,isPrivate,viewerPermission`.
   Record what this actor can actually see. Missing permission metadata is an
   unknown, not denial or approval.
   Compare two readable resources within this repository:

   ```bash
   PRACTICE_REPO='msfttoler/wre-flight-deck'
   gh api "repos/$PRACTICE_REPO/contents" --jq type
   gh api "repos/$PRACTICE_REPO/issues" --jq type
   ```

   Record the actual result or error; this is not a cross-repository test.
4. Read the [contract's runtime boundary](api-contract.md#runtime-and-boundaries).
   It states the local app has no authentication; reading the contract is not
   a runtime test. Local dispatch controls are not a production identity model.
5. Write an action matrix: local edit, public source read, repository push,
   rules change and local app write. For each, name the identity/resource and
   whether evidence establishes permission or leaves it unknown.

Say: "A valid credential can still lack permission for this action. We can
identify the missing authority without trying a destructive operation."
Ask which identity signs a local commit and which would authenticate a push.

## Independent practice: a different actor boundary

Choose either a proposed read-only build integration or a contributor who
needs to inspect failures but not publish releases. Build an action/resource
matrix for that actor, different from the demo's current human account.

Inspect available repository/workflow configuration in GitHub read-only views.
If you have a clone, `git ls-files` is another way to locate local files.
Separate declared workflow permissions from observed
token capabilities and organization policy. Propose the minimum authority for
the selected actions; do not create a token, install an App or change settings.
Identify which facts require an owner answer and exactly what redacted evidence
would resolve them.

Submit your current-actor observation, proposed actor matrix, one rejected
overbroad grant and a customer handoff. If settings are inaccessible, label
them **BLOCKED**, with the visible source/configuration facts kept distinct.

## Failure, recovery and tradeoff

- `gh` reports unauthenticated: public browser reading can continue, but
  identity-specific evidence is blocked. Do not log in as someone else.
- The client lacks either status flag: skip that status command and record
  status unknown; do not use a token-display option.
- 403/404 or missing Settings: verify the exact target and current actor.
  Private-resource hiding and policy can look similar; do not infer deletion.
- Browser and CLI disagree: record both contexts; use only the authorized one.
  Do not broaden scopes or retry write operations to discover the boundary.

Narrow grants reduce impact but can exclude needed operations. The answer is
an explicit action inventory, not "give write access so class can continue."

## Retrieval, self-check and transfer

Manual **Live Quiz Sprint**: Does public clone prove write access? Does
`user.email` authenticate `gh`? Is the local app production-authenticated?
Facilitator key: no to all. **Read, Rule Out, Return**: read the target action,
rule out identity-only evidence, return to the required resource permission.

At 70-83, check every permission claim has an actor, target and observation or
an explicit unknown. Transfer: distinguish repository access, deployment access
and end-user authorization in a customer architecture. Hosted changes are not
performed; unavailable settings are **BLOCKED** and rehearsal is **UNREVIEWED**.
