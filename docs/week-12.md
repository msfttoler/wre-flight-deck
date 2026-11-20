# Week 12: Make a release-candidate decision from evidence

The airline's release engineer needs a defensible decision for one candidate,
not a collection of unrelated green badges. Assemble source, behavior, checks,
security, and provenance evidence around one immutable candidate. Record
**release**, **hold**, or **unknown** as a recommendation, not an actual
deployment or production approval.

**By the end:** make a one-page, evidence-bound decision and identify who
owns each unresolved condition. WRE has no exam or required earlier lab.

## Before class: prepare a candidate and evidence

1. Read [shared setup and evidence rules](sessions.md). The owner supplies
   the approved `wre-v1` source SHA and, if available, one actual candidate
   SHA, its PR/run links, relevant security analysis, and its release
   artifact and approved producer. If available, provide the independently
   approved asset SHA-256 through an approved independent channel for
   practice. No hosted candidate, check, alert, or attestation is assumed.
2. The local portion needs Git, Node.js 24 or later, a browser, and a
   bash-compatible terminal such as Git Bash on Windows. Artifact
   verification also needs an already available GitHub CLI and authorized
   read access; check `gh --version` without displaying a token. If either is
   unavailable, that verification is **BLOCKED**. Learners do not publish,
   merge, dispatch workflows, change settings, or need another person's
   approval.
3. Make a fresh clone. `river-a1` is an example; replace it in every command
   with your own non-sensitive, unused attempt name:

   ```bash
   cd ~
   git clone https://github.com/msfttoler/wre-flight-deck.git wre-w12-river-a1
   ```

   If cloning fails or the folder exists, stop and choose another name.
   After a successful clone:

   ```bash
   cd ~/wre-w12-river-a1
   git remote -v
   git status --short --branch
   git rev-parse 'wre-v1^{commit}'
   ```

   Confirm both remote URLs name `msfttoler/wre-flight-deck`, the worktree
   is clean, and the tag SHA matches the owner's approved SHA. The `##`
   line is a branch header; other status lines indicate changes. Do not
   share a remote URL containing credentials. If the tag is absent or
   mismatched, baseline entry is **BLOCKED**; do not substitute `main`.
4. Select the clean baseline without creating a shared branch:

   ```bash
   git switch --detach wre-v1
   ```

   If switching fails, stop. Only after it succeeds:

   ```bash
   git rev-parse HEAD
   ```

   Stop if `HEAD` differs from the approved SHA. Otherwise run:

   ```bash
   npm test
   ```

   Record the actual result. A test failure is evidence to investigate, not
   permission to skip the condition. If no hosted candidate was supplied,
   label this SHA a **local assessment candidate**, not a published release.
5. Prepare a local note outside tracked app files with these columns:
   **criterion**, **candidate SHA or artifact digest**, **source and
   observation time**, **status**, **limitation**, and **next owner/action**.
   Add rows for source, native tests, UI behavior, hosted checks/rules,
   security analysis, and artifact/provenance. Leave unobserved rows
   **UNREVIEWED**; label unavailable evidence **BLOCKED**.

## 00-10: Opening, frame, rewind, and model

### 00-03: Opening

Say: "We are combining familiar engineering moves to decide whether one
candidate has enough evidence. A hold can be the right result." Name the
actual candidate and acceptance conditions if the owner supplied them.
Otherwise name the local baseline candidate and mark the hosted release
decision **BLOCKED**.

### 03-05: Frame three customer questions

Ask learners to predict:

1. Which exact candidate does the release owner want assessed?
2. Does the available check prove that this candidate's code ran?
3. If an artifact exists, does it match the owner's accepted bytes and
   producer policy?

### 05-07: Flash Rewind

Choose the beats needed for this decision; explain unfamiliar ones without
assuming anyone attended earlier weeks.

| Week | Useful beat | Trap to avoid |
| --- | --- | --- |
| 01 | Preserve recoverable work | Local reflog is not remote backup |
| 02 | Inspect actual required checks | A passing test is not a merge rule |
| 03 | Identify actor and target | Authentication is not authorization |
| 04 | Trace event and checkout | A different SHA can be a valid test merge |
| 05 | Bind artifact bytes and producer | A signature alone is not trust policy |
| 06 | Require actual security analysis | No displayed alert is not proof of no risk |
| 07 | Own the request and review | Model agreement is not correctness |
| 08 | Verify source and tool scope | Retrieved text is not authority |
| 09 | Correlate delivery and receiver | A local journal is not webhook proof |
| 10 | Compare an approved baseline | Not every difference is harmful drift |
| 11 | Inventory hosted dependencies | A clone is not a complete migration |
| 12 | Bind evidence to one candidate | Unrelated green runs do not add up |

### 07-10: Mental model

The candidate, run, checked-out tree, analysis, artifact, and release
authority are separate links. Evidence for one link cannot fill an unknown
one elsewhere. Show the blank evidence matrix and state the actual target,
account role, available tools, and allowed read-only effects. A missing
hosted record remains **BLOCKED**.

## 10-13: Manual Live Quiz Sprint

Use paper, fingers, or chat; written answers are equally valid. Ask:

1. Can a previous candidate's test run automatically approve this one?
2. Can missing provenance be marked passed?
3. Does a read-only recommendation publish a release?

Facilitator key: **no** to all three. Invite learners to state the missing
relationship, not just the answer.

## 13-15: Strategy — Read, Rule Out, Return

Read the owner's acceptance condition. Rule out evidence from a different
candidate or an unrelated artifact. Return to the first unresolved link and
name its owner. Use this method throughout the existing clinic.

## 15-33: Engineering Strategy Clinic

Use **Read, Rule Out, Return** throughout: read the actual acceptance
condition, rule out evidence that does not establish it, and return to the
first unresolved decision.

### 15-18: Bind the candidate

1. Open the owner's actual candidate or PR link in GitHub, if supplied.
   Record the full candidate SHA, base SHA, link, and observation time.
   Inspect the actual changed files. If there is no candidate, use your
   recorded `wre-v1` SHA only as a **local assessment candidate**.
2. In your clone, set the candidate to the full observed SHA. Replace the
   text inside the quotes; it is a placeholder, not a commit:

   ```bash
   CANDIDATE_SHA='PASTE_OBSERVED_FULL_SHA'
   git rev-parse --verify "${CANDIDATE_SHA}^{commit}"
   ```

   If Git cannot resolve it locally, mark the local candidate test
   **BLOCKED** and ask for an authorized accessible ref. Do not treat the
   baseline test as a pass for a different candidate.

### 18-23: Check local behavior at that SHA

1. If your server is running, stop **your** server with Ctrl-C before
   switching revisions. From the clone root, run `git status --short
   --branch`. The `##` line is only a header; if other lines show work,
   stop and preserve it rather than switching or resetting.
2. After confirming the candidate commit exists and the worktree is clean:

   ```bash
   git switch --detach "$CANDIDATE_SHA"
   ```

   If the switch fails, stop. Only after it succeeds:

   ```bash
   git rev-parse HEAD
   ```

   Confirm the full SHA equals the candidate. Then run `npm test` and record
   the actual result against that SHA. If it differs, do not claim a
   candidate test.
3. For an independent UI observation, choose an unused data directory for
   this candidate. In a second terminal, replace `river-a1` with your own
   attempt name:

   ```bash
   cd ~/wre-w12-river-a1
   test ! -e "$HOME/wre-w12-data-river-a1"
   ```

   The `test` command prints nothing on success. If it fails, choose a new
   unused data-directory name; do not delete the existing directory. Then:

   ```bash
   DATA_DIR="$HOME/wre-w12-data-river-a1" npm start
   ```

   Wait for your terminal to print `Flight Deck: http://127.0.0.1:3000`
   and stay running before opening that address. If port 3000 is occupied,
   do not stop another process or browse its listener. After your failed
   start has exited, use the same owned data directory with
   `DATA_DIR="$HOME/wre-w12-data-river-a1" PORT=3001 npm start`. Open port
   3001 only after your server reports that it started. Remember the selected
   port for restarts; never point two running servers at the same data directory.
4. Open `http://127.0.0.1:3000` or your chosen port. Select **SEA · Seattle**
   to **DEN · Denver**, **1 passenger**, and **Find flights**. Choose **Review fare**,
   then **Calculate fare**. Enter a unique fictional team callsign, choose
   **Confirm fictional booking**, and open **View reservations**. Record
   what the UI actually showed at the candidate SHA. If no flight appears,
   try another destination. Never enter real passenger or payment details.
   A UI observation is not a substitute for tests or hosted checks.

After any backend edit, stop your own server and run `git status --short`
and `git rev-parse HEAD` from the clone root. A changed or untracked file means
the working tree is not the unchanged candidate, even if `HEAD` is the same.
Either test a clean candidate or label the result **candidate plus local
changes**, with the changed files. Restart on the same selected port and reload
the browser only after your server starts. For pricing changes request a
**new quote**. Saved quote bytes retain their prices, but a new rule can cause
startup to reject old state. Preserve the data directory; use a new, unused
one only for separately labeled further UI checks. Never treat another
instance's state as candidate evidence.

### 23-30: Inspect hosted checks, security, and artifact

1. Open the actual candidate's PR, if supplied. Select **Checks** and record
   each relevant real check's name, status, conclusion, run link, and
   revision. Inspect the event and checkout when possible: a PR test merge
   may legitimately differ from the PR head. Missing logs or requirements
   remain **BLOCKED** or **UNREVIEWED**, not passed.
2. Open the available **Security** view or owner-supplied analysis record.
   Record the analysis revision and visible result. If it is inaccessible
   or absent, mark it **BLOCKED**. An empty alert list is not proof of no
   vulnerabilities.
3. If an actual release asset, candidate SHA, and independently approved
   signer are available, open the owner's release link. Under **Assets**,
   download the exact file selected by the owner and note its absolute
   local path. Do not select an automatically generated source archive
   unless that is the asset the owner intends to verify.
4. The following example is valid **only if** the owner approved
   `msfttoler/wre-flight-deck/.github/workflows/release.yml` as the signer.
   In the terminal where `CANDIDATE_SHA` is set, replace the text inside the
   quotes with the downloaded file's actual absolute path if it contains no
   single quote:

   ```bash
   ASSET='/ABSOLUTE/PATH/TO/DOWNLOADED/ASSET'
   test -f "$ASSET"
   ```

   If the path contains a single quote, instead type `ASSET=` without
   pressing Enter, begin the absolute path and use the shell's Tab filename
   completion to escape it. Inspect the completed path, then press Enter and
   run `test -f "$ASSET"`. The test prints nothing on success; if it fails,
   stop and correct the path.

   Read the file's SHA-256 with `shasum -a 256 "$ASSET"`, or use
   `sha256sum "$ASSET"` if `shasum` is unavailable. If the command fails or
   neither exists, mark the separate digest read **BLOCKED**. Record the
   actual digest for the later independent comparison.

   Run `gh attestation verify --help` and confirm that `--repo`,
   `--signer-workflow`, `--source-digest`, `--format`, and `--jq` are
   available. If a needed option is absent, mark verification **BLOCKED**
   rather than dropping a check. Otherwise run:

   ```bash
   gh attestation verify "$ASSET" \
     --repo msfttoler/wre-flight-deck \
     --signer-workflow msfttoler/wre-flight-deck/.github/workflows/release.yml \
     --source-digest "$CANDIDATE_SHA" \
     --format json --jq '.[].verificationResult.statement.subject[] | {name,digest}'
   ```

   Record the actual result and verified subject digest. Success binds the
   file to the specified source and signer checks; it does not itself
   approve a deployment. If the file, attestation, signer approval, or
   necessary access is missing, mark provenance **BLOCKED**. A matching
   filename or a signature from an unapproved producer is not sufficient.
   If the owner's policy also requires a source ref, confirm `--source-ref`
   is available. Replace the placeholder below with the independently
   approved full ref, such as `refs/tags/v1.0.0` only if that ref was
   approved. Do not paste a value containing a single quote into the
   assignment. Then run:

   ```bash
   SOURCE_REF='PASTE_APPROVED_FULL_SOURCE_REF'
   gh attestation verify "$ASSET" \
     --repo msfttoler/wre-flight-deck \
     --signer-workflow msfttoler/wre-flight-deck/.github/workflows/release.yml \
     --source-digest "$CANDIDATE_SHA" --source-ref "$SOURCE_REF" \
     --format json --jq '.[].verificationResult.statement.subject[] | {name,digest}'
   ```

   If the ref or option is missing, mark that policy condition **BLOCKED**.
   Do not claim the earlier command enforced a ref.

### 30-33: Choose a bounded recommendation

1. Fill the evidence matrix with the actual observations and blocked cells.
   For each row, say what it proves and what it does not.
2. Choose **release**, **hold**, or **unknown** for the stated condition.
   Keep the recommendation bounded by the evidence actually available.

## 33-35: Handoff

Say: "A passing local test cannot fill an unavailable provenance cell."
Name the owner who can resolve the first missing condition. Start individual
work at minute 35 even if hosted checks are pending.

## 35-70: Independent Capstone Lab

When your core work is on track, use the [Week 12 investigation challenge](sessions.md#make-the-practice-time-useful).

Work from your own fresh clone and one candidate record, not another week's
solution. Choose **one** changed acceptance condition:

- The consumer requires an independently approved expected artifact digest
  in addition to the clinic's producer, source and provenance checks.
- A proposed pricing or booking-filter feature changes the acceptance rule;
  determine whether existing tests cover the new behavior.
- A workflow or permission differs from an approved baseline; its operational
  impact must be resolved.

1. **35-40:** Write the chosen condition and the full candidate SHA. If you chose the
   expected-digest condition, request the expected SHA-256 from the owner
   through an approved independent channel; do not derive it from the file
   you are evaluating. If it is unavailable, mark that condition **BLOCKED**.
   If there is no hosted candidate, label `wre-v1` as a local assessment
   candidate and keep hosted release evidence **BLOCKED**.
2. **40-46:** Identify the source or file relevant to your condition. Open it at the
   candidate revision. Record the path and one concrete observation; do not
   assume a proposed feature was implemented.
3. **46-52:** Record the actual candidate-bound `npm test` result and any UI
   observation you performed using the clinic steps. If a candidate cannot
   be checked out, leave those cells **BLOCKED** instead of transferring the
   baseline's result.
4. **52-59:** Inspect the relevant real hosted check, analysis, workflow comparison,
   or artifact if accessible. For the expected-digest condition, compare
   the owner's expected SHA-256 with both the downloaded file's digest and
   the verified subject digest; a mismatch is a failed condition, not a pass.
   Record the link, revision or digest, result, and limitation. If the needed
   evidence is absent, name the exact owner and redacted record required.
5. **59-63:** Rule out one plausible but insufficient claim. Examples: a previous run
   tested a different commit; the same filename has different bytes; a
   workflow file exists but has no observed run; or a feature is only a plan.
6. **63-66:** Make a **release**, **hold**, or **unknown** recommendation for the
   stated condition. Explain the evidence that supports it, the unresolved
   risk, and the next responsible owner/action. Do not publish, change
   policy, or dispatch a workflow to force a result.
7. **66-70:** Save a one-page local decision outside tracked app files: candidate SHA,
   condition, matrix, real test/UI observations, links or blocked cells,
   counterexample, decision, and owner action. A proposal is not implemented
   evidence unless you actually made and tested the change.

### Progressive hints

1. Bind every result to the candidate SHA or exact artifact before judging
   it.
2. If a PR check and candidate differ, inspect the event and actual checkout;
   do not infer staleness from the SHA alone.
3. Compare an artifact only with the acceptance conditions its owner actually
   supplied; otherwise hold or mark the condition unknown.

## 70-83: Debrief

**70-75 - Self-check:** Verify every claimed pass is bound to the candidate
or actual artifact and was performed. For mismatched SHAs, inspect the event
and actual checkout. If the observed checkout commit is available in your
clone, replace the placeholder with its full SHA and inspect its parents:

```bash
CHECKOUT_SHA='PASTE_OBSERVED_FULL_CHECKOUT_SHA'
git show -s --format='%H %P' "$CHECKOUT_SHA"
```

If it is unavailable, mark the parent relationship **BLOCKED** rather than
guessing whether a test merge is valid.

**75-81 - Facilitator debrief:** Ask which evidence changed a decision and
which cell remains uncertain. If the runtime failed, retain the first
useful error without secrets and mark behavior verification incomplete.
If provenance is missing, hold that condition and name its owner; do not
weaken the criterion.

**81-83 - Record:** Save the recommendation and the exact next owner/action.
No automated score or peer approval substitutes for the learner's reasoning.

## 83-85: Close

Explain how the same record would help
a customer distinguish authored quality from hosted validation. Recognize
the completed investigation without claiming mastery or a release. Stop
only your own server with Ctrl-C. Optional certification scheduling is
separate from WRE; classroom rehearsal remains **UNREVIEWED**.
