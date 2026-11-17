# Week 03: Identify who may act, and on what

The airline's engineer can read a public repository but needs to know whether
an identity may change it. You will distinguish the current actor, the
requested action and the target resource, then propose narrow access for a
different actor. A local app control is not GitHub authorization.

## Before class

- **Owner and facilitator:** Confirm the approved `wre-v1` SHA and the
  public repository target. Use an existing authorized account if available;
  prepare a private way to compare account names without projecting them.
  Do not create credentials or change permissions for this lesson.
- **Learner, required for the full hosted investigation:** A browser, an
  existing authorized GitHub account, and the GitHub CLI `gh`. Public source
  reading can continue without an account or CLI, but account-specific CLI
  evidence is then **BLOCKED**. No previous week, repository write access,
  admin role or permission expansion is needed.
- **Optional:** Git 2.23+ and a fresh clone for local source or
  Git-configuration inspection. Node, an application server and a learner
  branch are not needed for the ordinary read-only task.

Read [shared setup and evidence](sessions.md). In a terminal, if `gh` is
available, run:

<pre tabindex="0"><code>gh --version
gh auth status --help
</code></pre>

Only if help lists **both** `--active` and `--no-refresh`, run
`gh auth status --active --no-refresh --hostname github.com` privately.
Otherwise skip it and record CLI status as unknown. Do not display tokens or
use a token-display option. If already authorized, this read identifies the
CLI actor; run it privately, not on a shared screen:

<pre tabindex="0"><code>gh api user --jq '.login'
</code></pre>

If it fails, do not log in as someone else or broaden a credential. Record the
actual error without secrets; use the public browser route and mark the CLI
actor **BLOCKED**. Keep an evidence note outside any clone with UTC time,
target, account **role** rather than private account details, command or URL,
actual result and limitation.

### Optional: inspect a local clone

From a parent you own, replace `YOUR-ID` with a non-sensitive unique handle
and attempt suffix using only letters, digits and hyphens, such as `river-a1`:

<pre tabindex="0"><code>git clone https://github.com/msfttoler/wre-flight-deck.git wre-w03-YOUR-ID
</code></pre>

Only if that succeeds, enter the new directory:

<pre tabindex="0"><code>cd wre-w03-YOUR-ID
</code></pre>

If `cd` fails, stop before Git. Otherwise check the target and tag:

<pre tabindex="0"><code>git remote -v
git status --short --branch
git rev-parse 'wre-v1^{commit}'
</code></pre>

Compare both origin URLs with `msfttoler/wre-flight-deck` without exposing
credentials and the tag commit with the owner's approved SHA. A different
target, dirty clone, missing tag or mismatch is **BLOCKED**. For optional
read-only local source inspection, select the tag:

<pre tabindex="0"><code>git switch --detach wre-v1
</code></pre>

If the switch succeeds, run `git rev-parse HEAD` and confirm the approved
SHA. If it fails, stop; do not discard work. Only a separately authorized
local edit needs a branch: from a clean approved clone, use
`git switch -c learner/w03-YOUR-ID wre-v1`, then confirm `HEAD`. An existing
branch name or mismatch means stop and choose a new attempt. The optional
local app setup is in [sessions](sessions.md#for-application-or-local-edit-work-use-a-fresh-clone);
it is not needed to establish repository permissions.

## 00-05: The customer problem

**Say:** "A public read tells us very little about who can publish a change.
We'll name the actor, action and resource before deciding what access is
needed."

Ask: "Does being able to read a public repository prove that your account can
push?" No. Some public reads can succeed without an authenticated account.

## 05-12: Model and setup

**Authentication** identifies the actor presenting a credential.
**Authorization** decides whether that actor may perform an action on a
particular resource. Browser, `gh` and Git transport can use different
credentials. Local Git author and committer fields identify a commit's
recorded authors; they do not authenticate a GitHub push. A commit signature,
if used, is a separate verification.

Show the repository target and, privately, the facilitator's available browser
and CLI contexts. A missing account or CLI does not prevent a public source
read; it does block claims about that missing identity. Explain that the app
is local-only and unauthenticated, not a model of GitHub access.

## 12-30: Facilitator demo

1. Open `https://github.com/msfttoler/wre-flight-deck` in the browser. Under
   **Code**, confirm the owner and repository name. If signed in, open the
   profile menu and privately note the browser account. A visible public page
   proves only that this browser could read that page.
2. Compare the browser identity with the private `gh api user --jq '.login'`
   result from preparation. They may differ. If either is unavailable, record
   that comparison as **BLOCKED**, not as evidence of denial.
3. If `gh` is authorized, run this read for the exact target:

   <pre tabindex="0"><code>gh repo view msfttoler/wre-flight-deck --json nameWithOwner,isPrivate,viewerPermission
   </code></pre>

   Note the actual visible permission value, or unknown if it is absent.
   A repository role is context, not proof that a particular token, branch
   rule or action will permit a push.
4. Compare two readable resources **within the same repository**:

   <pre tabindex="0"><code>PRACTICE_REPO='msfttoler/wre-flight-deck'
   gh api "repos/$PRACTICE_REPO/contents" --jq type
   gh api "repos/$PRACTICE_REPO/issues" --jq type
   </code></pre>

   `PRACTICE_REPO` is the explicit repository target; the commands read the
   root contents and issues endpoints and print only the response type.
   Record each actual result or redacted error. A successful read does not
   establish a write permission, and this is not a cross-repository test.
5. In **Code**, open `docs/api-contract.md` and read **Runtime and
   boundaries**. It describes an unauthenticated local app; reading that
   contract is not a runtime test. If an approved local clone exists,
   `git remote -v` shows its Git target and transport, not its effective
   GitHub permissions. Otherwise mark local Git configuration unobserved.
6. Make a small matrix with **actor**, **resource**, **action**, **observation**
   and **unknown**. Include public source read, repository push, rules change
   and local app write. Do not attempt a push or settings change to fill in
   an unknown.

**Ask:** "Whose identity is in a commit, and what authenticates the push?"
The local author/committer record and transport credential answer different
questions. A valid credential can still lack authority for the action.

## 30-33: Live Quiz Sprint

Read aloud; learners may use paper, fingers, chat or private written answers,
with additional response time and no speed ranking.

1. Does a public read prove push access? **No.**
2. Does Git `user.email` authenticate `gh`? **No.**
3. Is the local app a production authentication system? **No.**

## 33-35: Read, Rule Out, Return

**Read** the exact actor, action and repository. **Rule out** an identity-only
or public-read observation as proof of write authority. **Return** to the
least authority the action needs and the evidence still missing. Start
individual work at minute 35, even if an account-specific read is blocked.

## 35-70: Independent practice

Investigate a different actor from the human account in the demo: a proposed
build workflow that must read Flight Deck source and run tests, but must not
publish releases. This is a proposal, not a new token or workflow execution.

1. **35-40:** In your note, name the target
   `msfttoler/wre-flight-deck`, the proposed workflow actor and its two
   intended actions: read source and run the project's tests. Add a third
   action, publish a release, and mark it **not needed**. A local test
   process and a GitHub repository operation are different resources.
2. **40-48:** In GitHub, open **Code** > branch/tag selector > **Tags** >
   `wre-v1`. At the repository root, open the displayed commit and compare
   the full SHA in its URL with the owner's approved baseline. Then open
   `.github` > `workflows` > `ci.yml`. If the file or full baseline SHA is
   unavailable or mismatched, mark the approved-source comparison **BLOCKED**
   and do not treat that file as the approved baseline. In a verified file,
   find the declared `permissions`, checkout step and test command. If you
   have the verified clone, an alternative is
   `git show wre-v1:.github/workflows/ci.yml`.
3. **48-54:** Create an action matrix with one row per action. For each,
   write the resource, proposed minimum authority, source evidence and
   unknowns. For example, assess whether the file declares
   `contents: read` for checkout; do not infer an observed token's complete
   permissions from the declaration. Running local tests does not itself need
   repository write access.
4. **54-60:** Check the workflow's job-level overrides and event context as
   visible in the selected file. Note that organization policy, token type,
   fork/event restrictions and runtime conditions can change what actually
   works. Reject an overbroad release-publishing grant for this task and
   explain which action would require separate authority.
5. **60-65:** Record your own current-actor observation from the browser and,
   if available, the `gh` reads in the demo. Separate a successfully observed
   source read from any untested push or rules change. If Settings or
   account-specific evidence is inaccessible, mark that fact **BLOCKED**;
   do not request broader credentials for class.
6. **65-70:** Write a customer handoff: the proposed actor and resource,
   minimum read need, rejected grant, actual observation, unknown effective
   permissions and the exact redacted evidence an authorized owner could
   provide. Keep identities and credentials out of the shared note.

## If something fails

- **`gh` is missing or unauthenticated:** Continue with the public browser
  source if available. The CLI actor and account-specific API reads remain
  **BLOCKED**; do not switch to another person's account.
- **Either status flag is absent:** Skip the status command and record status
  unknown. Do not use a token-display flag as a substitute.
- **403, 404 or inaccessible Settings:** Verify the exact target and current
  actor. A hidden private resource, policy or misspelled path can look alike;
  do not infer deletion or deliberately try a write to test permission.
- **Browser and CLI identities differ:** Record the separate contexts and use
  only the one already authorized for each read. A narrower grant reduces
  impact but may omit an action; resolve that with an action inventory, not
  an automatic write grant.

## 70-83: Self-check and debrief

- **70-75, self-check:** Does every permission claim name an actor, action,
  target and actual observation or explicit unknown? Is the proposed workflow
  distinct from your current human account?
- **75-81, facilitator discussion:** Ask, "What changes if the same workflow
  runs for a forked PR?" and "What would a public read fail to establish?"
  Do not claim a particular policy outcome without event-specific evidence.
- **81-83, record:** State the recommended narrow access and the owner
  question. A matrix is not an applied permission change.

## 83-85: Transfer and close

For a customer, separate repository, deployment and end-user authorization.
Provide the action/resource matrix rather than a blanket grant. No hosted
change was performed by this authored route; inaccessible settings are
**BLOCKED** and native/classroom rehearsal is **UNREVIEWED**.
