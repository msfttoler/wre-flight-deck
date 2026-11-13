# Week 09: Trace a real GitHub App integration

The airline's platform engineer needs to know whether a repository event reached
an authorized integration and produced the intended effect. Trace actual GitHub
App evidence without mistaking the local booking journal for a webhook system.

## Preparation and independent entry

Read [shared setup and evidence rules](sessions.md). The owner, not learners,
supplies a real authorized App integration, its bounded installation scope and
redacted delivery/receiver evidence. The app here does not call external services
or implement a GitHub App receiver. Do not add a receiver, tunnel or simulator
to satisfy this session. No installation or delivery is assumed to exist.

```bash
git clone https://github.com/msfttoler/wre-flight-deck.git wre-w09-YOUR-ID
cd wre-w09-YOUR-ID
git switch -c learner/w09-YOUR-ID wre-v1
git rev-parse HEAD
npm test
npm start
```

Use Node 24+ and your unique `YOUR-ID`. Missing tag/runtime blocks app entry.
Learners use local write and existing read-only integration evidence access.
No installation, private key, permission grant, delivery replay or admin role
is a learner prerequisite.

## Mental model and facilitator demo

Use the [85-minute route](sessions.md#shared-85-minute-delivery): demo 12-30,
individual practice 35-70 and self-check/debrief 70-83.

A GitHub App installation has permissions and repository scope. Its webhook
subscription selects event types. A delivery records transport to a receiver;
the receiver's own evidence establishes signature checks and processing.
A successful HTTP response alone does not establish a correct business effect.

1. In the local UI, make one fictional reservation and inspect the app's event
   journal. Use `curl http://127.0.0.1:3000/api/events` as an optional native read.
   Identify this as application evidence only. Its `requestId` is not a GitHub
   delivery ID, and booking the app does not itself generate a GitHub event.
2. Separately open an owner-supplied real GitHub App/integration evidence view.
   Identify the App, installation, selected repository, granted permissions and
   subscribed event relevant to the intended integration. Hidden fields remain
   unknown; do not infer them from an App badge.
3. Inspect an actual delivery: delivery ID, event/action, repository, timestamp,
   attempt and response. Redact payload secrets, account details and signatures.
   Do not trigger an event or replay delivery without separate authorization.
4. Correlate that delivery with real receiver logs or durable integration output.
   Distinguish received, authenticated, deduplicated and processed. Establish
   a business effect only if the receiver's evidence supports it.
5. State where the chain stops. A redacted owner record is dated recorded
   evidence, not your live inspection of installation settings.

Say: "These two event records belong to different systems. Similar timestamps
do not establish that one caused the other."
Ask whether HTTP 200 proves the receiver created the intended result.

## Independent practice: retry or narrower scope

Choose one changed condition: a real repeated delivery, if available, or a
proposed reduction in installation repository/permission scope. For a retry,
compare actual attempt IDs and receiver evidence for duplicate prevention.
For reduced scope, assess whether the observed integration actions would
still be authorized. Do not change the installation or replay an event.

Submit an evidence chain and a decision: what arrived, what was authorized,
what processed, what effect is established and what remains unknown.
Explain one counterexample, such as successful transport followed by failed
processing or an installation that excludes the target repository.

Without a real App/delivery/receiver record, mark the integration route
**BLOCKED**. Inventory actual local workflow/integration declarations, if any,
and write the exact redacted evidence request for the owner. You may compare
the app journal's documented schema to needed integration evidence, but may
not relabel it as a webhook or claim completed integration testing.

## Failure, recovery and tradeoff

- Delivery/settings inaccessible: retain the known link and access limit;
  ask for authorized redacted records, not an App private key.
- Delivery succeeded but no receiver effect: inspect processing evidence
  before recommending a replay. Replays can duplicate side effects.
- Event/installation mismatch: verify repository scope and subscription;
  do not broaden permissions to make a demonstration work.

Broader App scope can simplify configuration but increases impact. Retry
handling needs durable deduplication evidence, not a local booking-id analogy.

## Retrieval, self-check and transfer

Manual **Live Quiz Sprint**: Is `/api/events` a webhook log? Does HTTP success
prove processing? Does App existence prove repository installation?
Facilitator key: no to all. **Read, Rule Out, Return**: read the integration
effect, rule out unrelated event records, return to the correlated delivery.

At 70-83, verify system boundaries and every link's evidence status. Transfer:
ask a customer for installation, delivery and receiver evidence separately.
Absent hosted evidence is **BLOCKED**; live integration and learner rehearsal
are **UNREVIEWED** until actually performed.
