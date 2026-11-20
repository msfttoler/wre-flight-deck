# Week 05: Verify the bytes and their producer

The airline's release consumer needs to know where a downloaded application
asset came from. You will verify actual downloaded bytes against an available
attestation and a recorded producer policy. A release page, a local app and a
valid signature alone are not production approval.

## Before class

- **Owner and facilitator:** Confirm the approved `wre-v1` learning baseline.
  If they exist, supply an actual release URL, exact asset name, source SHA,
  build-run URL and expected producer policy, including the approved workflow
  and source ref. If available, provide the independently approved asset
  SHA-256 through an approved independent channel for practice. Supply
  existing read/download access. Do not create a release, attestation or
  policy merely for class.
- **Learner, required for actual verification:** A browser, an empty directory
  you own outside any clone, network/read access to the actual release and
  attestation, and a `gh` version supporting release download and attestation
  verification. No previous week, GitHub write access, admin role or reviewer
  is needed. If any verification input is absent, mark that check **BLOCKED**
  and use the workflow-source investigation below.
- **Optional:** Git 2.23+, Node.js 24+, npm and a local app clone for product
  context. They are not needed to verify release bytes. The local app is not
  the downloaded asset, and its behavior is not hosted provenance evidence.

Read [shared setup and evidence](sessions.md). `wre-v1` is the learning
baseline; an actual release may have a different tag and source SHA. Never
move, recreate or silently replace `wre-v1`.

If `gh` is installed, check its actual help before using it:

```bash
gh --version
gh release download --help
gh attestation verify --help
```

If using an authenticated CLI, follow the conditional `gh auth status` check
in [sessions](sessions.md#choose-the-setup-your-task-needs). Do not display
tokens or expand credentials. If the installed client lacks a needed command
or option, record its version and **BLOCKED**; an approved update is owner
preparation, not permission to change access.

Create a new evidence directory outside a clone. Replace `YOUR-ID` with a
unique, non-sensitive handle and attempt suffix using only letters, digits
and hyphens, such as `river-a1`:

```bash
EVIDENCE_DIR="$HOME/wre-w05-evidence-YOUR-ID"
mkdir "$EVIDENCE_DIR"
```

If `mkdir` reports that it exists or fails, stop and choose another new path;
do not overwrite or delete someone else's files. Keep a plain-text note
outside both the empty download directory and any clone, with the target,
role, UTC time, release and run URLs, actual commands, results, policy
comparisons and limits. Redact credentials, signatures and private payloads
before sharing. Use the same terminal for the download; in a new terminal,
assign `EVIDENCE_DIR` again to that same directory. Check
`printf '%s\n' "$EVIDENCE_DIR"` and `ls -ld "$EVIDENCE_DIR"`; if the path is
blank or unavailable, stop before downloading.

### Optional: see the local product

From a parent directory you own, use a separate unused name:

```bash
git clone https://github.com/msfttoler/wre-flight-deck.git wre-w05-YOUR-ID
```

Only if the clone succeeds, enter the new directory:

```bash
cd wre-w05-YOUR-ID
```

If `cd` fails, stop before Git. Run `git remote -v`,
`git status --short --branch` and `git rev-parse 'wre-v1^{commit}'`.
Compare both origin URLs with
`msfttoler/wre-flight-deck` without exposing credentials and the tag commit
with the owner's approved SHA. A different target, dirty clone, missing tag
or mismatch blocks this optional path. In the clean clone, run
`git switch --detach wre-v1`; if successful, confirm `git rev-parse HEAD`
equals the approved SHA. From that root, run `npm start`. Wait for your
terminal to print `Flight Deck: http://127.0.0.1:3000` and stay running
before opening that address. Under **Plan a journey**, choose actual airports
and passengers, select **Find flights**, **Review fare** and **Calculate
fare**. Stop your own server with Ctrl-C. Do not enter real passenger data.
If the app cannot start or no route is available, mark only this optional
preview **BLOCKED**. For a port conflict, do not browse the unknown service
or stop another process. After your failed start exits, if no server is using
this clone's `.data`, try `PORT=3001 npm start` and open
`http://127.0.0.1:3001` only after a successful start. Never run two servers
against the same state directory.

## 00-03: The customer problem

**Say:** "A consumer needs the exact file the airline intended to publish.
We'll verify its bytes and then ask whether the producer matches the
consumer's policy."

## 03-05: Three questions, one investigation

Ask learners to predict:

1. Does a release title alone identify the producer?
2. What did the verifier check against the owner's policy?
3. What changes if the same bytes came from an unapproved producer?

## 05-07: Flash Rewind

The file, the statement and the producer policy answer different questions.
An authentic statement from a different workflow may still fail the policy.

## 07-10: Model and setup

A **digest** is a fingerprint of bytes. An **attestation** is a signed
statement about an artifact and its build. Verification binds the downloaded
file's digest to a verified statement under the verifier's trust policy.
The consumer must also check the expected repository, producer workflow,
source and ref. A valid statement does not prove that tests are sufficient,
that the application is safe or that deployment is approved.

Show the actual owner-provided policy and release, or say which is missing.
The release's source revision is not automatically `wre-v1`. Do not unpack
or execute a downloaded asset during this read-only exercise.

## 10-28: One facilitator investigation

1. In `https://github.com/msfttoler/wre-flight-deck`, open **Releases**
   from the repository's **Code** page. Select the owner-supplied actual
   release and expand **Assets**. Record its URL, observed tag and exact
   selected asset name. Distinguish an explicitly published asset from
   GitHub-generated source archives. If no asset is accessible, mark
   **BLOCKED: release asset** and continue with step 5.
2. Read the actual help noted above. In the terminal, use the new empty
   evidence directory. Replace the two placeholder values with the observed
   tag and exact asset name:

   ```bash
   RELEASE_TAG='PASTE_OBSERVED_RELEASE_TAG'
   ASSET_NAME='PASTE_EXACT_ASSET_NAME'
   gh release download "$RELEASE_TAG" --repo msfttoler/wre-flight-deck --pattern "$ASSET_NAME" --dir "$EVIDENCE_DIR"
   ls -l "$EVIDENCE_DIR"
   ```

   `--pattern` is a glob, not an exact-name guarantee. Use it only when the
   observed name has no glob metacharacters and uniquely matches the selected
   asset. Do not paste a tag or asset name containing a single quote into
   these single-quoted assignments. For a name with shell quotes or glob
   characters, use the browser's asset download into a new empty directory
   instead; if a tag cannot be safely entered, mark the CLI download
   **BLOCKED**. If more than the intended file appears, stop and resolve the
   ambiguity; do not overwrite or delete files. A downloaded file is not yet
   a verified file.
3. If you used the browser, set `ASSET_NAME` to the exact downloaded
   filename as in step 2. For a name with an embedded quote, use terminal
   filename completion or an owner-approved file picker to enter the literal
   file path instead of pasting it as shell syntax. For an ordinary name,
   set `ASSET_PATH` and inspect the digest:

   ```bash
   ASSET_PATH="$EVIDENCE_DIR/$ASSET_NAME"
   shasum -a 256 "$ASSET_PATH"
   gh attestation verify "$ASSET_PATH" --repo msfttoler/wre-flight-deck
   ```

   `shasum` is common on macOS; where available, Linux learners may use
   `sha256sum "$ASSET_PATH"` instead. If neither digest command is available,
   record that separate digest read as **BLOCKED**. Check the installed
   verifier help for the fields and restrictions it supports. Record its
   actual result; do not paste raw private statement material into class notes.
4. Enforce the owner's workflow, source SHA and source ref instead of
   inferring them from a repository-only pass. In `gh attestation verify
   --help`, confirm `--signer-workflow`, `--source-digest`, `--source-ref`,
   `--format`, and `--jq` are available. If a flag or an approved value is
   missing, mark that policy check **BLOCKED**; do not omit a restriction
   and call the stricter policy passed.

   If the owner approved the workflow shown below, enter it exactly. Replace
   the other two placeholders with the owner's full source SHA and full
   source ref, for example `refs/tags/v1.0.0` only if that is the approved
   ref. Do not paste a value containing a single quote into these assignments.

   ```bash
   SIGNER_WORKFLOW='msfttoler/wre-flight-deck/.github/workflows/release.yml'
   SOURCE_SHA='PASTE_APPROVED_FULL_SOURCE_SHA'
   SOURCE_REF='PASTE_APPROVED_FULL_SOURCE_REF'
   gh attestation verify "$ASSET_PATH" \
     --repo msfttoler/wre-flight-deck \
     --signer-workflow "$SIGNER_WORKFLOW" \
     --source-digest "$SOURCE_SHA" \
     --source-ref "$SOURCE_REF" \
     --format json --jq '.[].verificationResult.statement.subject[] | {name,digest}'
   ```

   Check the actual command result and compare the verified subject digest
   with the separate SHA-256 reading. Record the exact restrictions and result.
   For a negative comparison, first confirm the same asset passed this
   owner-approved policy and its actual verified signer. The approved
   `wre-v1` source contains `.github/workflows/ci.yml`; use it as the
   contrasting signer only if the release owner confirms that this existing
   workflow is not an allowed producer for the selected release. If the
   baseline does not pass, the policy is unknown, or the owner cannot confirm
   the alternate, mark the wrong-signer case **BLOCKED**. Do not invent a
   workflow name or call an arbitrary CLI error a policy refusal.

   ```bash
   WRONG_SIGNER='msfttoler/wre-flight-deck/.github/workflows/ci.yml'
   gh attestation verify "$ASSET_PATH" \
     --repo msfttoler/wre-flight-deck \
     --signer-workflow "$WRONG_SIGNER" \
     --source-digest "$SOURCE_SHA" \
     --source-ref "$SOURCE_REF"
   ```

   This repeats the canonical verifier against the same approved target and
   bytes, changing only the expected signer. Count a refusal only when the
   actual diagnostic identifies signer identity mismatch; missing evidence,
   access, network, or source-ref errors are inconclusive.
   The signed statement's predicate can contain workflow-controlled metadata;
   do not treat it alone as independently trusted producer identity. Open the
   owner's actual run URL, or select **Actions**, the observed release
   workflow, the actual run, and its job. Expand checkout, attestation and publication
   steps if available; record their revision and conclusions. A current tag
   link is not proof that the tag never moved. An unavailable field or run is
   unknown, not passed.
5. Link the verified source/build to the actual release only where evidence
   supports it. If release or attestation evidence is missing, open **Code** >
   branch/tag selector > **Tags** > `wre-v1`. At the repository root, open the
   displayed commit and compare the full SHA in its URL with the owner's
   approved baseline. If unavailable or mismatched, mark that comparison
   **BLOCKED** and do not treat the file as approved. Otherwise open
   `.github/workflows` > `release.yml`. Read its trigger, packaging,
   attestation and publication steps as source configuration. At the
   recorded baseline the tag filter is `v*`; `wre-v1` does not match that
   prefix. Confirm the selected file rather than assuming a release ran.

**Ask:** "Does a statement for another file prove this download?" No; the
subject digest must bind the exact bytes. Next, add an independently approved
expected digest to the actual evidence, not an invented second artifact.

## 28-31: Live Quiz Sprint

Read aloud; use paper, fingers, chat or private written responses. Allow
additional response time and do not rank by speed.

1. Does a release tag authenticate every asset? **No.**
2. Is a valid signature alone enough for a specific producer policy? **No.**
3. Does provenance prove the tests or product are sufficient? **No.**

## 31-33: Read, Rule Out, Return

**Read** the consumer's accepted producer and source. **Rule out** a
statement for different bytes or an unapproved workflow. **Return** to the
actual digest, verified identity and remaining unknowns.

## 33-35: Handoff to independent verification

Explain the independent digest condition below. Start practice at minute 35
even if the demonstration's verification is blocked.

## 35-70: Independent practice

When your core work is on track, use the [Week 05 investigation challenge](sessions.md#make-the-practice-time-useful).

Use the real asset from the demo, or a different actual asset if one is
available. The changed condition adds an **independently approved expected
SHA-256** for the selected asset to the demo's workflow, source and ref policy.
The expected digest must come from the owner through an approved independent
channel, not from hashing the file you are deciding whether to accept. Do not
invent an asset, edit a statement or generate provenance.

1. **35-40:** Write the target repository and the owner's actual expected
   workflow, source ref, source SHA and independently approved asset SHA-256.
   Record the observed release URL, tag and asset name separately. If a
   required policy value is missing, mark that acceptance condition
   **BLOCKED**, but still verify an available asset without claiming policy
   acceptance. If the release is missing, mark it **BLOCKED** and continue
   to step 5.
2. **40-48:** In your own new evidence directory, download the selected
   asset using the demo's `gh release download` steps or the browser
   alternative. Inspect the directory and set `ASSET_PATH` to that exact
   file. Do not run or extract it. If the asset is absent, the download
   fails or the selected name is ambiguous, record the actual condition and
   continue to step 5.
3. **48-54:** Run the available SHA-256 command and
   `gh attestation verify "$ASSET_PATH" --repo msfttoler/wre-flight-deck`.
   Record the actual digest and verifier result when available. Then, if the
   owner supplied the required workflow, SHA and ref and your client supports
   all the flags, apply the stricter command from demo step 4 with your
   actual approved values. Otherwise mark that policy check **BLOCKED**;
   never describe an unsupported or unrun restriction as enforced.
4. **54-60:** Make one row each for **bytes/subject**, **approved expected
   digest**, **signer or issuer**, **repository**, **workflow**, **source
   SHA**, **source ref** and **build/run link**. Compare the independent
   expected digest with both the local SHA-256 and verified subject digest.
   For every row, cite the actual source or enforced restriction and compare
   it with the owner's policy. Mark an observed mismatch **FAIL** and absent
   evidence **BLOCKED**. Accept the artifact
   for this stated policy only if every required condition is established.
   A successful repository-level verification is not, by itself, the
   stricter workflow/ref decision.
5. **60-66:** If an asset, statement, policy field or CLI capability is
   unavailable, inspect the actual `wre-v1` release workflow using the
   **Code** path in the demo. In an approved local clone, the alternative is
   `git show wre-v1:.github/workflows/release.yml`. List the expected
   trigger, packaged subject, attestation step and exact missing release,
   digest, run or policy evidence. If the workflow or approved baseline is
   unavailable too, mark that source read **BLOCKED**. This checklist is
   not a completed policy verification. Otherwise, use the actual release run's
   job and checkout details to check your build/run link; mark any missing
   connection unknown rather than assuming it.
6. **66-70:** Finish a note with the file path, actual digest if read,
   verifier command/result, each policy row, source and run links, decision
   and next owner. Do not claim verification for a proposal or a local app.

### Progressive hints

1. Keep the downloaded file fixed while comparing verifier policies.
2. Ask the owner which producer is allowed; do not infer policy from a
   signature or workflow filename.
3. Count a negative result only when the verifier identifies the changed
   signer condition as the reason for refusal.

## If something fails

- **No attestation:** Recheck the exact selected file, repository and
  owner-provided run. Stop rather than creating a local statement.
- **Verification fails or the producer differs:** Retain the original bytes
  and redacted result; investigate the subject and policy mismatch. Do not
  rename the failure into an approval.
- **CLI or network unavailable:** Record the actual version/error and blocked
  check. Source inspection can continue if accessible; it cannot prove the
  missing verification.
- **Producer policy changes:** A narrower workflow/ref policy reduces
  accidental trust but must be maintained when a legitimate pipeline
  changes. An owner must decide the new policy; do not silently broaden it.

## 70-83: Self-check and debrief

- **70-75, self-check:** Does every acceptance row have actual evidence or an
  explicit block? Is the file whose digest you read the file you verified?
- **75-81, facilitator discussion:** Ask, "What changes if the same bytes were
  produced by an unapproved workflow?" and "What would provenance still not
  tell us?" A signature is not malware analysis or deployment approval.
- **81-83, record:** State accepted, failed or blocked for the named policy,
  the missing field and the owner who can resolve it.

## 83-85: Transfer and close

Give the customer a reproducible acceptance policy tied to exact bytes and
producer, not a screenshot of a green build. The local app is not release
evidence. Hosted provenance is **BLOCKED** until actually supplied and
verified; native and classroom rehearsal remain **UNREVIEWED**.
