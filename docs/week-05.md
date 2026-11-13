# Week 05: Verify the bytes and their producer

The airline's release consumer needs to know where a downloaded application
artifact came from. Verify an actual release asset against its attestation,
source and expected build identity; do not confuse a release page with proof.

## Preparation and independent entry

Read [shared setup and evidence rules](sessions.md). The owner separately
publishes an actual release artifact and real provenance workflow, then supplies
the release tag, asset name, source SHA, run URL and expected producer policy.
`wre-v1` is the learning baseline; it need not be the artifact's release tag.
No release or attestation is assumed to exist. Learners need read/download
access and a `gh` version supporting the documented verification command.

```bash
git clone https://github.com/msfttoler/wre-flight-deck.git wre-w05-YOUR-ID
cd wre-w05-YOUR-ID
git switch -c learner/w05-YOUR-ID wre-v1
git rev-parse HEAD
npm test
npm start
```

Use Node 24+ and your unique `YOUR-ID`. Missing tag/runtime blocks app entry.
Inspect the local UI's route and quote to identify the product being packaged;
that UI is not evidence about downloaded release bytes.

## Mental model and facilitator demo

Follow the [85-minute route](sessions.md#shared-85-minute-delivery): demo 12-30,
individual practice 35-70, self-check/debrief 70-83.

A digest fingerprints bytes. An attestation is a signed statement about an
artifact and its build. Verification must bind your downloaded bytes to that
statement and an expected producer. A valid signature from an unexpected
workflow is insufficient. Neither proves product correctness.

1. In GitHub Releases, choose an observed release and actual asset. Trace its
   source revision and build run. Distinguish built assets from GitHub's source
   archives; do not assume both have the same provenance.
2. Read `gh release download --help` and `gh attestation verify --help`.
   Create a new evidence directory outside the clone with `mkdir EVIDENCE_DIR`,
   replacing `EVIDENCE_DIR` with a new absolute path you own.
3. Use `gh release download RELEASE_TAG --repo msfttoler/wre-flight-deck
   --pattern ASSET_NAME --dir EVIDENCE_DIR`. Replace the tag/name with observed
   values and quote paths/names containing spaces. Download only; do not run it.
4. Run `gh attestation verify ASSET_PATH --repo msfttoler/wre-flight-deck`,
   with `ASSET_PATH` the downloaded file's actual path. Inspect the returned
   subject digest, source, workflow identity and trusted verification result.
   Apply any additional supported restrictions required by the owner's
   recorded producer policy; do not invent flags or omit the policy comparison.
5. Link the attested source/build to the release. Record verification output
   and what producer restrictions were actually checked. A repository-level
   verifier constraint does not alone enforce an intended workflow/ref.

Say: "We are accepting these exact bytes from a specific producer, not trusting
every file that happens to appear on this release page."
Ask whether a valid statement for yesterday's artifact proves today's download.

## Independent practice: change one trust condition

Choose either a different actual asset/release, if available, or a stricter
consumer requirement: accept only the recorded release workflow and approved
source ref. Reassess the real artifact against that changed condition.

For the stricter requirement, identify exactly which verification fields or
supported CLI constraints establish it. Record accepted/rejected/unknown for
each condition: bytes, signer/issuer, repository, workflow, source and build.
Do not fabricate a second artifact, edit an attestation or handwrite provenance.

If artifacts/attestations are absent, mark verification **BLOCKED**. Read the
actual workflow if present and prepare the consumer acceptance checklist,
including the missing run and digest evidence. This is a useful read-only
investigation, not a completed provenance verification.

## Failure, recovery and tradeoff

- No attestation: check the exact file/repository and owner-provided run;
  stop rather than generating a local statement.
- Verification fails: retain the original bytes/output and investigate subject
  and producer mismatch. Never rename a failure into approval.
- CLI lacks support or network access: record version/error and blocked status;
  an approved client update is owner preparation, not credential expansion.

Narrow producer policy reduces accidental trust but needs maintenance when the
release pipeline legitimately changes. A signature is not malware analysis.

## Retrieval, self-check and transfer

Manual **Live Quiz Sprint**: Does a release tag authenticate every asset? Is
a valid signature alone enough? Does provenance prove tests are sufficient?
Facilitator key: no to all. **Read, Rule Out, Return**: read the consumer policy,
rule out a statement for other bytes, return to the exact digest and producer.

At 70-83, check each acceptance condition has evidence or an explicit unknown.
Transfer: give the customer a reproducible acceptance policy rather than a
screenshot of a green build. Hosted provenance remains **BLOCKED** until supplied
and verified; this guide's rehearsal is **UNREVIEWED**.
