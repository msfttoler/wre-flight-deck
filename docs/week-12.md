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
   artifact and approved producer. No hosted candidate, check, alert, or
   attestation is assumed.
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

## 00-05: Opening

1. Say: "We are combining familiar engineering moves to decide whether one
   candidate has enough evidence. A hold can be the right result."
2. Name the actual candidate and acceptance conditions if the owner supplied
   them. Otherwise name the local baseline candidate and explicitly mark the
   hosted release decision **BLOCKED**.
3. Ask: "If a test passed on a different commit, what would we need to know
   before using it for this candidate?" Take one answer or allow a written
   response.

## 05-10: Flash Rewind

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

## 10-14: Manual Live Quiz Sprint

Use paper, fingers, or chat; written answers are equally valid. Ask:

1. Can a previous candidate's test run automatically approve this one?
2. Can missing provenance be marked passed?
3. Does a read-only recommendation publish a release?

Facilitator key: **no** to all three. Invite learners to state the missing
relationship, not just the answer.

## 14-35: Engineering Strategy Clinic

Use **Read, Rule Out, Return** throughout: read the actual acceptance
condition, rule out evidence that does not establish it, and return to the
first unresolved decision.

### 14-19: Bind the candidate

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

### 19-25: Check local behavior at that SHA

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

   If port 3000 is occupied, do not stop another process. After your failed
   start has exited, use the same owned data directory with
   `DATA_DIR="$HOME/wre-w12-data-river-a1" PORT=3001 npm start` and open
   port 3001. Never point two running servers at the same data directory.
4. Open `http://127.0.0.1:3000` or your chosen port. Select **SEA · Seattle**
   to **DEN · Denver**, **1 passenger**, and **Find flights**. Choose **Review fare**,
   then **Calculate fare**. Enter a unique fictional team callsign, choose
   **Confirm fictional booking**, and open **View reservations**. Record
   what the UI actually showed at the candidate SHA. If no flight appears,
   try another destination. Never enter real passenger or payment details.
   A UI observation is not a substitute for tests or hosted checks.

After any backend edit, stop your own server, confirm the clone and SHA,
restart it, and reload the browser. For pricing changes request a **new
quote**; existing quotes keep their earlier prices. Preserve all data
directories and never treat another instance's state as candidate evidence.

### 25-32: Inspect hosted checks, security, and artifact

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
   quotes with the downloaded file's actual absolute path:

   ```bash
   ASSET='/ABSOLUTE/PATH/TO/DOWNLOADED/ASSET'
   test -f "$ASSET"
   ```

   The test prints nothing on success. If it fails, stop and correct the
   path. Run `gh attestation verify --help` and confirm that
   `--signer-workflow` and `--source-digest` are available. If either is
   absent, mark this verification **BLOCKED** rather than dropping a check.
   Otherwise run:

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

### 32-35: Make the handoff

1. Fill the evidence matrix with the actual observations and blocked cells.
   For each row, say what it proves and what it does not.
2. Say: "A passing local test cannot fill an unavailable provenance cell."
   Ask which owner can resolve the first missing condition.
3. At minute 35, start individual work even if hosted checks are pending.

## 35-70: Independent Capstone Lab

Work from your own fresh clone and one candidate record, not another week's
solution. Choose **one** changed acceptance condition:

- The consumer requires an approved producer and digest-bound provenance,
  not only passing application tests.
- A proposed pricing or booking-filter feature changes the acceptance rule;
  determine whether existing tests cover the new behavior.
- A workflow or permission differs from an approved baseline; its operational
  impact must be resolved.

1. Write the chosen condition and the full candidate SHA. If there is no
   hosted candidate, label `wre-v1` as a local assessment candidate and
   keep hosted release evidence **BLOCKED**.
2. Identify the source or file relevant to your condition. Open it at the
   candidate revision. Record the path and one concrete observation; do not
   assume a proposed feature was implemented.
3. Record the actual candidate-bound `npm test` result and any UI
   observation you performed using the clinic steps. If a candidate cannot
   be checked out, leave those cells **BLOCKED** instead of transferring the
   baseline's result.
4. Inspect the relevant real hosted check, analysis, workflow comparison,
   or artifact if accessible. Record its link, revision or digest, result,
   and limitation. If the needed evidence is absent, name the exact owner
   and redacted record required.
5. Rule out one plausible but insufficient claim. Examples: a previous run
   tested a different commit; the same filename has different bytes; a
   workflow file exists but has no observed run; or a feature is only a plan.
6. Make a **release**, **hold**, or **unknown** recommendation for the
   stated condition. Explain the evidence that supports it, the unresolved
   risk, and the next responsible owner/action. Do not publish, change
   policy, or dispatch a workflow to force a result.
7. Save a one-page local decision outside tracked app files: candidate SHA,
   condition, matrix, real test/UI observations, links or blocked cells,
   counterexample, decision, and owner action. A proposal is not implemented
   evidence unless you actually made and tested the change.

## 70-85: Close

**70-75 - Self-check:** Verify every claimed pass is bound to the candidate
or actual artifact and was performed. For mismatched SHAs, inspect the event,
merge parents, and actual checkout before rejecting or accepting the
relationship.

**75-81 - Facilitator debrief:** Ask which evidence changed a decision and
which cell remains uncertain. If the runtime failed, retain the first
useful error without secrets and mark behavior verification incomplete.
If provenance is missing, hold that condition and name its owner; do not
weaken the criterion.

**81-83 - Record:** Save the recommendation and the exact next owner/action.
No automated score or peer approval substitutes for the learner's reasoning.

**83-85 - Transfer and recognition:** Explain how the same record would help
a customer distinguish authored quality from hosted validation. Recognize
the completed investigation without claiming mastery or a release. Stop
only your own server with Ctrl-C. Optional certification scheduling is
separate from WRE; classroom rehearsal remains **UNREVIEWED**.
