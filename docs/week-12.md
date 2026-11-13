# Week 12: Make a release-candidate decision from evidence

The airline's release engineer needs a defensible decision for one candidate,
not a collection of unrelated green badges. Assemble source, behavior, checks,
security and provenance evidence around one immutable candidate and record
release/hold/unknown with explicit limits. WRE has no exam or production approval.

## Preparation and independent entry

Read [shared setup and evidence rules](sessions.md). No earlier lab or completed
workspace is required. The owner supplies the published baseline and, if
available, an actual candidate SHA, PR/run links, security analysis and release
artifact/provenance. No candidate or hosted result is assumed.
Learners need local write and existing read-only GitHub access; publishing,
merging, dispatching and another person's approval are not prerequisites.

```bash
git clone https://github.com/msfttoler/wre-flight-deck.git wre-w12-YOUR-ID
cd wre-w12-YOUR-ID
git switch -c learner/w12-YOUR-ID wre-v1
git rev-parse HEAD
npm test
npm start
```

Use Node 24+ and your unique `YOUR-ID`. Missing tag/runtime blocks app entry.
Inspect a route, quote and fictional reservation in the UI. Do not treat
persistent local state as release evidence from another instance.

## Six-part 85-minute route

| Minutes | Part | Facilitation |
|---|---|---|
| 00-05 | Opening | Reframe as a release decision assembled from familiar engineering moves |
| 05-10 | Flash Rewind | Choose relevant beats/traps below; no prior attendance assumed |
| 10-14 | Manual Live Quiz Sprint | Paper, fingers or chat; discuss evidence, not speed |
| 14-35 | Engineering Strategy Clinic | Read, Rule Out, Return; model the candidate evidence review |
| 35-70 | Independent Capstone Lab | Individual decision under a changed release condition |
| 70-85 | Close | 70-83 self-check/debrief; 83-85 customer transfer and recognition of the work |

This keeps 35 minutes of individual practice and 13 minutes of self-check/
facilitator debrief. Optional certification scheduling is a separate invitation,
not a WRE exam claim or condition of completion.

## Flash Rewind: one beat and trap per week

- 01: preserve recoverable work; local reflog is not remote backup.
- 02: inspect actual required checks; a green test is not a merge rule.
- 03: identify actor and target; authentication is not authorization.
- 04: trace event and checkout; a different SHA may be a valid test merge.
- 05: bind bytes and producer; a signature alone is not trust policy.
- 06: require actual analysis; no displayed alert is not proof of no risk.
- 07: own request and review; model agreement is not correctness.
- 08: verify source and tool scope; retrieved text is not authority.
- 09: correlate real delivery and receiver; local journal is not webhook proof.
- 10: compare a recorded baseline; not all differences are bad drift.
- 11: inventory hosted dependencies; clone is not complete migration.
- 12: bind evidence to a candidate; several unrelated green runs do not add up.

For the manual quiz, ask: Can a previous candidate's test run approve this one?
Can missing provenance be called passed? Does a read-only recommendation publish
a release? Facilitator key: no to all. Written answers are equally valid.

## Mental model and facilitator clinic

A release candidate is an exact revision and, when built, exact artifact bytes.
Evidence is relevant only within its source, environment and trust boundaries.
At 14-35, use **Read, Rule Out, Return**: read acceptance conditions, rule out
unrelated evidence, return to the first unresolved release decision.

1. Open the owner's actual candidate in GitHub, if supplied. Record full
   candidate/base SHAs and inspect the diff. If absent, use your `wre-v1` SHA as
   a clearly labeled local assessment candidate, not an actual hosted release.
2. Read the actual test/check evidence and run `npm test` locally on your
   baseline. A candidate at another SHA needs its own checkout/test evidence;
   baseline success is not candidate success. Stop your own server with Ctrl-C
   **before switching to the candidate**. Use an additional fresh local
   branch at the observed candidate only if the code is available and within
   your authorized target. Confirm the intended clone and record
   `git rev-parse HEAD` after checkout, then run `npm test` for that candidate.
3. Start `npm start` from the candidate checkout and reload the browser before
   recording UI evidence. Backend edits do not reload automatically; after any
   API edit, repeat the owned-server stop, clone/SHA confirmation and restart.
   Inspect route -> **new quote** -> reservation. Existing quotes retain their
   earlier persisted prices; keep `.data/` intact. Observe fictional price
   arithmetic and displayed state. Explain which behavior tests cover versus
   what was manually inspected, bound to the recorded candidate SHA.
4. Inspect actual current merge requirements, analysis revision and release
   artifact/provenance if available. Use GitHub's PR Checks, Security and Release
   views; select real objects, never placeholder numbers. Missing evidence is
   blocked, not an implied pass. Never manufacture an alert, attestation or PR.
5. Record a decision with an evidence matrix: criterion, source/artifact SHA
   or digest, observation/time, status, limitation and next owner. A hold or
   unknown decision can be correct even when all observed local tests pass.

Say: "Our job is not to make every box green. It is to show which release
conditions are actually established and which owner must resolve the rest."
Ask what changes if only the filename, not the digest, matches an attestation.

## Independent capstone: change the acceptance condition

Start with your own fresh-clone baseline and candidate record. Choose one
condition different from the demo:

- The consumer now requires an approved producer identity and digest-bound
  provenance, not only passed application tests.
- A proposed pricing or booking-filter feature changes the acceptance rule;
  the existing suite must be assessed for that new behavior before acceptance.
- The candidate depends on a workflow/permission difference from a recorded
  approved baseline, and its operational impact must be resolved.

Inspect real evidence, rule out one plausible but insufficient claim and make
a release/hold/unknown recommendation. For a feature request, you may prepare
a precise local change/test proposal; it is not implemented evidence unless
you actually implement and test it. Do not stack another week's solution.

Deliver a one-page local decision with candidate identity, scoped behavior,
actual test/UI observations, hosted links or blocked cells, counterexample,
remaining risk and next owner action. If no hosted candidate/data exists,
mark those conditions **BLOCKED** and give a read-only/local assessment only.
This is not a released candidate, completed deployment or final authorization.

## Failure, recovery and debrief

- Evidence references another SHA: inspect event/merge parents and artifact
  source before rejecting it; retain a mismatch if the relationship is absent.
- Local runtime fails: preserve logs without secrets, identify the first cause
  and record incomplete behavior verification. Do not delete state blindly.
- Release evidence is missing: hold that acceptance condition and name its
  owner. Do not dispatch a workflow or weaken acceptance for class completion.

During 70-83, spend five minutes checking your matrix, six discussing which
evidence changed decisions and two saving the final recommendation. No peer
approval or automated score substitutes for your reasoning.
At 83-85, name how the same record would help a customer distinguish authored
quality from hosted validation. Recognize the completed investigation without
claiming mastery. Classroom rehearsal and independent reviews are **UNREVIEWED**.
