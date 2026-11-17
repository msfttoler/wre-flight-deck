# Week 09: Trace a real GitHub App integration

The airline's platform engineer needs to know whether a repository event
reached the intended integration and produced the intended effect. Follow
actual evidence from installation to delivery to receiver; do not mistake
Flight Deck's local event journal for a GitHub webhook.

**By the end:** build a bounded evidence chain, identify where it stops, and
ask the owner for the exact missing record without changing an installation.

## Before class: choose real evidence

1. Read [shared setup and evidence rules](sessions.md). The owner supplies,
   if available, an authorized read-only view or redacted record for one
   real GitHub App installation, one relevant delivery, and the corresponding
   receiver log or durable output. Ask for the repository, event/action,
   installation scope, granted permissions, delivery identifiers and times,
   response, and receiver processing outcome.
2. Do not request private keys, secrets, signatures, or raw sensitive payloads.
   The owner may show a dated redacted record instead of granting settings
   access. If any record is absent, mark that link **BLOCKED** and use the
   evidence-request route below. Do not install an App, replay a delivery,
   create a receiver, or generate a fake event for the lesson.
3. Optional: prepare the local app to show the contrast with a GitHub webhook.
   This is not a prerequisite for reading hosted evidence. Use Git and
   Node.js 24 or later, and a bash-compatible terminal such as Git Bash on
   Windows. Replace `river-a1` with an unused, non-sensitive attempt name:

   ```bash
   cd ~
   git clone https://github.com/msfttoler/wre-flight-deck.git wre-w09-river-a1
   ```

   If cloning fails or the folder exists, stop and choose another name.
   After a successful clone:

   ```bash
   cd ~/wre-w09-river-a1
   git remote -v
   git status --short --branch
   git rev-parse 'wre-v1^{commit}'
   ```

   Confirm both remote URLs name `msfttoler/wre-flight-deck`, the worktree is
   clean, and the tag SHA is the owner's approved SHA. The `##` line is a
   branch header; other status lines indicate changes. Do not share URLs that
   contain credentials. If the tag is absent or mismatched, local app entry
   is **BLOCKED**; do not substitute `main`.
4. The checkout is read-only, so no learner branch is required. The optional
   local booking writes this app's own local state; it makes no hosted change.
   Select the baseline:

   ```bash
   git switch --detach wre-v1
   ```

   If switching fails, stop. Only after it succeeds:

   ```bash
   git rev-parse HEAD
   ```

   Stop if `HEAD` differs from the approved SHA. Only then run `npm start`.
   Wait for your terminal to print `Flight Deck: http://127.0.0.1:3000`
   and stay running before opening that address. If port 3000 is occupied,
   do not stop another person's process or browse its listener. After your
   failed start exits, use `PORT=3001 npm start` and open port 3001 only
   after your server reports that it started. Missing Node or local app access
   blocks only this contrast, not an available hosted read. The `wre-v1` app
   predates the in-app quick-start.

No learner needs App-owner, organization-owner, or repository-administrator
access. No previous session or existing learner workspace is needed.

## 00-12: Open and explain the task

1. **00-05 - Open the problem.** Say: "The team says an integration received
   an event. We need to know whether the right installation received it and
   whether its receiver actually did the intended work." Ask what a delivery
   response alone can establish.
2. **05-12 - Draw the chain in words.** Name four distinct checks:
   installation scope and permission; subscribed event; GitHub delivery and
   response; receiver authentication, processing, and business effect.
   A successful HTTP response is transport evidence, not proof of the effect.
   Identify which owner-supplied records are actually available today.
3. Tell learners that a local request ID and a GitHub delivery GUID belong to
   different systems. Similar timestamps do not establish causation.

## 12-30: Facilitator demonstration

1. **12-16 - Observe the local boundary.** If the local app is available,
   open **Plan a journey**, select **SEA · Seattle** to **DEN · Denver** and
   **1 passenger**,
   then choose **Find flights**. Choose **Review fare** on a listed option,
   then **Calculate fare**. Enter a unique fictional team callsign, such as
   `TEAM-ORBIT-A1`, and choose **Confirm fictional booking**. Open **Event
   journal**, find **booking created**, and note its displayed request ID
   and time. If no flight is available, choose another destination.
   No personal or payment information is needed.
2. Explain what you just observed: a local application journal entry. It is
   not a GitHub webhook delivery, and making this local booking does not
   itself generate a GitHub event. If the app is unavailable, read the
   [event schema and runtime boundary](api-contract.md#runtime-and-boundaries)
   instead and say the local event was **not observed**.
3. **16-21 - Identify the installation.** Open the owner's supplied
   read-only link or redacted record. Record the observed App name, target
   repository, installation scope, relevant permission, and subscribed
   event/action. Mark any hidden field **BLOCKED**; an App name or badge
   alone does not establish access to this repository.
4. **21-25 - Inspect a real delivery.** In that supplied view or record,
   locate the delivery GUID, event/action, repository, delivery time,
   response, and whether it was a redelivery. Record only what is visible;
   do not copy headers or payloads with secrets. Do not press a redeliver
   button. GitHub retains the same `X-GitHub-Delivery` GUID for a redelivery;
   distinguish the GUID from any separate delivery-record ID or timestamp.
5. **25-30 - Follow the receiver.** Open the corresponding owner-supplied
   receiver log or durable result. Compare its correlation identifier and
   time with the delivery. Record separately whether reception, signature
   verification, duplicate handling, processing, and the intended effect
   are supported. A `2xx` response alone does not prove all five.
6. If any link in the chain is missing, stop at that link. Say: "We can
   establish these earlier observations, but this effect is unknown." Ask
   for the exact redacted record needed; do not manufacture a substitute.

For owner reference, GitHub documents [viewing webhook deliveries](https://docs.github.com/en/webhooks/testing-and-troubleshooting-webhooks/viewing-webhook-deliveries)
and [delivery GUID behavior](https://docs.github.com/en/webhooks/using-webhooks/best-practices-for-using-webhooks).
The settings view may require the App owner or an App manager; it is not a
learner prerequisite.

## 30-35: Retrieval and handoff

**30-33 - Manual Live Quiz Sprint.** Invite written, finger, or chat answers:

1. Is Flight Deck's `/api/events` a GitHub webhook log?
2. Does HTTP success prove the intended business effect?
3. Does an App's existence prove it is installed on this repository?

Facilitator key: **no** to all three.

**33-35 - Read, Rule Out, Return.** Read the intended integration effect;
rule out the unrelated local event as proof; return to the real correlated
delivery and receiver evidence. Hand off the independent task.

## 35-70: Independent practice - narrower installation scope

Work individually from the actual owner-supplied evidence. Your question:
"Could this integration perform its observed action if its repository scope
or permissions were narrowed?" You are assessing a proposal, not changing
the installation.

1. Write down the intended action and the target repository. Identify the
   available installation record and the event/action it covers.
2. Make a table with columns: **link in chain**, **source and observation
   time**, **what it establishes**, **status**, and **what is missing**.
   Add rows for installation, delivery, receiver authentication/processing,
   and business effect. Use **PASS**, **FAIL**, **BLOCKED**, or **UNREVIEWED**
   only for the specific criterion you actually assessed.
3. Select one observed or proposed narrower repository/permission scope.
   For each action the integration needs, state whether the available
   evidence establishes it would still be authorized. If the owner has not
   supplied the necessary permission details, record **unknown**, not denied
   or allowed.
4. Look for an actual delivery and its receiver record. Note the GUID and
   observed response; correlate only fields the records support. Explain
   one counterexample: transport succeeds but later processing fails, or the
   installation does not include the intended repository.
5. If the owner supplied records of a genuine redelivery, compare their
   timestamps, record IDs, shared GUID, and receiver duplicate-handling
   evidence. Do not initiate a replay. If no such records exist, say
   **BLOCKED: retry evidence** rather than inventing an attempt.
6. If no hosted App evidence is available at all, inspect the real
   [API contract](api-contract.md) and, if you have the clone, run
   `git ls-files .github/workflows` from its root. List what those sources
   do and do not establish, then write a specific request for the owner:
   installation scope, one redacted delivery, and the matching receiver
   outcome. This is a partial investigation, not an integration test.
7. Save your table, recommendation, one counterexample, and next owner/action
   in a local note outside tracked app files. Do not save secret values or
   sensitive payloads.

## 70-85: Self-check, recovery, and close

**70-75:** Check each table row has a source or an explicit blocked status.
Do not label a dated owner record as your own live inspection.

**75-81:** Discuss where the chain stopped. If delivery succeeded but no
effect is visible, request receiver processing evidence before considering a
replay. A replay can duplicate side effects. If installation scope or event
does not match, record the mismatch; do not broaden permissions for class.

**81-83:** Record the smallest owner request that would resolve the decision.
An inaccessible settings page is an access limit, not proof a setting is absent.

**83-85:** Transfer the chain to a customer integration: installation,
delivery, receiver, effect. Stop only your own local server with Ctrl-C.
Live integration behavior and classroom rehearsal remain unreviewed unless
actually observed.
