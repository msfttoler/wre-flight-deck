# Week 07: Take a feature request through Copilot and personal review

An airline support engineer wants a smaller booking list, not a deliberately
broken app. Turn a request for a booking-status filter into a scoped plan,
tested local change and your own review. The feature below is proposed new
behavior, not a claim that the current contract already supports it.

Product request: [#1: reservation-status filter](https://github.com/msfttoler/wre-flight-deck/issues/1).
This is a requested enhancement to the working baseline, not a staged bug or
an already implemented feature. The demo addresses that request; the lab below
is a separate proposed extension.

## Preparation and independent entry

Read [shared setup and evidence rules](sessions.md) and [booking API](api-contract.md).
The owner supplies a working app and confirms the current Copilot surface,
entitlement, policy, selected model and permitted tools. No model or capability
is promised. Learners need local write access, not an admin role or peer approval.

```bash
git clone https://github.com/msfttoler/wre-flight-deck.git wre-w07-YOUR-ID
cd wre-w07-YOUR-ID
git switch -c learner/w07-YOUR-ID wre-v1
git rev-parse HEAD
npm test
npm start
```

Use Node 24+ and your unique `YOUR-ID`. Missing tag/runtime blocks the change.
In your local browser, quote a route, reserve using a fictional team callsign
and inspect bookings. Read available status values from real code/data; do not
assume a UI label or source path beyond the contract.

## Mental model and facilitator demo

Use the [85-minute route](sessions.md#shared-85-minute-delivery), with demo
12-30, individual practice 35-70 and self-check/debrief 70-83.

Say: "The assistant can propose a diff. We own the acceptance rule, the scope
of its tools and whether the tests actually distinguish the behavior we want."

1. State this request: "Add an optional exact booking-status filter to
   `GET /api/bookings` and an accessible browser control. Omitting the filter
   preserves today's list. Use only actual supported statuses; reject unknown
   values with the existing error format. Do not change reservations or access."
2. Ask Copilot for a plan before edits: identify actual implementation/test/UI
   files, accepted values, API compatibility, test cases and non-goals.
   Use `git ls-files` and read each cited source. Correct invented paths or
   assumptions before allowing work.
3. Authorize only bounded local edits and the native test runner. Do not allow
   network, credentials, pushes or hosted mutations. Inspect the proposed diff
   before accepting it. The intended contract delta belongs in the proposal;
   update canonical contract only under the maintainer's file ownership.
4. Require tests for omitted filter, each actual accepted value, unknown input
   and an empty result. Manually predict one result before reading the generated
   assertion, then run `npm test`. Do not trust tests merely because they agree
   with generated implementation.
5. After API edits, stop your own server with Ctrl-C, confirm the intended clone
   and record `git rev-parse HEAD`. Restart `npm start` from that clone and reload
   the browser; backend edits do not reload automatically. Keep `.data/` intact.
   In the actual UI, check filtering and clearing with keyboard controls.
   Review `git diff --check` and `git diff`, especially whether filtering hides
   data only in the browser or is implemented as requested in the API.
   Compare the base source in GitHub; do not imply the local diff is a PR.

Ask: "Does hiding cancelled bookings in the browser change who may read them?"
No. A usability filter is not authorization.

## Independent practice: filter by a different customer need

Start from your own untouched `wre-v1` learner branch, not the demo solution.
Choose an optional exact fictional callsign filter, or a combined status and
callsign filter. Specify case sensitivity, empty input, omitted parameters and
how combined filters interact before prompting.

Take the request through plan -> source verification -> bounded change -> real
tests -> personal review. Preserve the existing no-personal-data contract.
Use actual booking statuses and current component/source locations. Cover at
least a match, no match, omitted filter and one decision-changing boundary.
Before checking the UI after API edits, stop your own server with Ctrl-C,
confirm the intended clone and record `git rev-parse HEAD`, restart `npm start`
from that clone and reload the browser. Keep `.data/` intact. Verify the actual
UI and capture any incomplete part honestly.

Submit your request, accepted plan, source revision, final diff, actual test
result, manual UI observations and one suggestion you rejected or corrected
(if none, explain one risk you independently checked). A proposal without an
implemented/tested change is partial work, not the full capability.

## Failure, recovery and tradeoff

- Copilot unavailable: implement or plan manually and mark the assisted route
  **BLOCKED**. Never invent a chat transcript.
- Unrelated edits appear: stop tool execution, inspect the diff and retain
  only understood work. Preserve your prior work before reverting anything.
- Tests pass but UI fails: investigate actual request parameters and rendering;
  do not declare completion from the suite alone.

Filtering server-side improves a bounded request contract, but adds validation
and compatibility obligations. Keep that tradeoff explicit.

## Retrieval, self-check and transfer

Manual **Live Quiz Sprint**: Is a generated assertion independent evidence?
Is a filter access control? Does an accepted plan mean implementation ran?
Facilitator key: no to all. **Read, Rule Out, Return**: read the acceptance rule,
rule out unsupported suggestions, return to source and the actual diff.

At 70-83, self-check behavior, tool boundaries and test/UI gaps. Transfer:
give a customer a reviewable change, not a model's assurance. Assisted execution,
hosted checks and classroom rehearsal remain **UNREVIEWED** until actually run.
