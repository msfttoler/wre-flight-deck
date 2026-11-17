# Week 06: Triage a genuine CodeQL result, or stop honestly

The airline's engineer needs to distinguish an actionable source finding from
an unsupported security claim. You will trace an actual CodeQL alert through
its analysis revision and available data flow, or examine a real source/test
boundary while marking finding-specific triage **BLOCKED**. Do not introduce
a vulnerability to make the lesson run.

## Before class

- **Owner and facilitator:** Confirm the approved `wre-v1` SHA and, if they
  exist, supply an actual CodeQL run and alert URL with existing authorized
  read access. No alert, successful analysis or supported query result is
  assumed. Prepare to demonstrate the source/test fallback when necessary.
- **Learner, required for hosted triage:** A browser and existing read access
  to the relevant analysis and alert. No previous week, security-admin role,
  permission expansion or GitHub write access is needed. Without the actual
  finding or access, the finding-specific part is **BLOCKED**.
- **Required for running local tests:** Git 2.23+, Node.js 24+, npm and a new
  local clone. **Optional for source-only review:** browse the approved tag
  in GitHub instead. The local app server, a learner branch and `gh` are
  optional; no app server is needed to read the code or run the native tests.

Read [shared setup and evidence](sessions.md) and
[runtime boundaries](api-contract.md#runtime-and-boundaries). The application
is a local, single-process development app without authentication. Its
browser-origin checks do not turn it into an authenticated production
service. Never expose it publicly or send exploit payloads.

Keep a note outside the clone with repository, account role without
credentials, UTC observation time, actual alert/run URLs, analyzed and
baseline SHAs, source paths, results and limitations. Do not copy secrets,
raw sensitive payloads or private account metadata.

### Optional: prepare local source and tests

From a parent you own, replace `YOUR-ID` with a non-sensitive unique handle
and attempt suffix using only letters, digits and hyphens, such as `river-a1`:

<pre tabindex="0"><code>git --version
node --version
npm --version
git clone https://github.com/msfttoler/wre-flight-deck.git wre-w06-YOUR-ID
</code></pre>

Only if cloning succeeds, enter the new directory:

<pre tabindex="0"><code>cd wre-w06-YOUR-ID
</code></pre>

If `cd` fails, stop before Git. Otherwise inspect the target and baseline:

<pre tabindex="0"><code>git remote -v
git status --short --branch
git rev-parse 'wre-v1^{commit}'
</code></pre>

Compare both origin URLs with `msfttoler/wre-flight-deck` without exposing
credentials and the tag commit with the owner's approved SHA. A different
target, dirty clone, missing tag or mismatch is **BLOCKED**; do not substitute
`main`. For a read-only local test, select the approved tag:

<pre tabindex="0"><code>git switch --detach wre-v1
</code></pre>

If the switch fails, stop. Only after success, use `git rev-parse HEAD` and
confirm the approved SHA. To make an authorized local test edit instead,
create an unused branch from the verified tag with
`git switch -c learner/w06-YOUR-ID wre-v1`, then confirm `HEAD`. If creation
fails or the SHA differs, stop before editing. Do not move `wre-v1`.

If you choose to see the product, run `npm start` from the verified clone
root, open `http://127.0.0.1:3000`, and under **Plan a journey** choose
actual airports and passengers. Select **Find flights**, **Review fare** and
**Calculate fare**. Use only fictional data and stop your own server with
Ctrl-C. The quote is local app behavior, not a CodeQL or GitHub result.
If the app cannot start or no route is available, mark only this optional
preview **BLOCKED**. For a port conflict, do not stop another process: if no
server is using this clone's `.data`, try `PORT=3001 npm start` and open
`http://127.0.0.1:3001` only after a successful start. Never run two servers
against the same state directory.

## 00-05: The customer problem

**Say:** "A scanner result can point us to a path worth investigating. We
still need the analyzed revision and deployment context before describing
customer impact."

Ask: "What could an empty alerts view mean besides a clean analysis?" The
analysis might not have run, might cover another branch, or may be
inaccessible. An empty view alone cannot choose among those explanations.

## 05-12: Model and setup

Static analysis reasons about source without executing every possible input.
An alert may describe data from an untrusted **source** reaching a sensitive
**sink**, possibly through validation. Not every rule is a path query; if no
path is shown, do not invent one. Severity is not identical to reachability
or risk in this deployment.

Show the available repository and actual analysis or state the access gap.
For local source, show the owner-approved tag and SHA. A workflow file is
configuration, not proof that analysis completed or that its results are
available.

## 12-30: Facilitator demo

1. Open `https://github.com/msfttoler/wre-flight-deck` > **Security** >
   **Code scanning** or **Code scanning alerts**, if accessible. Inspect the
   actual branch, state and tool filters. Record whether the view is
   accessible; do not treat a 403, 404 or missing tab as an empty result.
2. In **Actions**, open the actual CodeQL workflow and an observed run if
   available. Record its event, branch, revision, time, conclusion and
   analysis/upload evidence where visible. A successful job alone does not
   establish which alert results are available for the target branch. With
   an authorized `gh`, an optional read is:

   <pre tabindex="0"><code>gh run list --repo msfttoler/wre-flight-deck --workflow codeql.yml --limit 10
   </code></pre>

   If `gh` is used, follow the conditional status check in
   [sessions](sessions.md#choose-the-setup-your-task-needs). An unavailable
   workflow or run is unknown, not a fabricated failure.
3. If a genuine **CodeQL** alert is visible, open it and record its actual
   URL, rule, state, location, analyzed revision and displayed path. Open its
   location or path details. To inspect the exact revision in **Code**,
   replace `ANALYSIS_SHA` in
   `https://github.com/msfttoler/wre-flight-deck/tree/ANALYSIS_SHA` with the
   actual full analyzed SHA, then open the displayed source and caller paths.
   If the SHA or source is inaccessible, mark that comparison **BLOCKED**.
   Explain source, sink and validation only where the alert and code support
   them. A finding from another scanner is not a CodeQL alert.
4. If there is no accessible actual alert, write **BLOCKED:
   finding-specific triage**. Instead open **Code** > branch/tag selector >
   **Tags** > `wre-v1`. At the repository root, open the displayed commit and
   compare the full SHA in its URL with the owner's approved baseline. If
   unavailable or mismatched, mark the approved-source review **BLOCKED** and
   do not treat the file as approved. Otherwise open `src/server.mjs` and find
   `BODY_LIMIT` and `jsonBody`. Open `test/http.test.mjs` and find the tests
   for the 16 KiB limit, content length and chunked transfer. The code counts
   received bytes as well as checking a declared length; the tests express
   intended boundary behavior. Reading them is source/test review, not alert
   triage.
5. Compare the observed path or fallback boundary with the documented
   loopback-only, unauthenticated deployment. Those limits affect exposure
   but do not automatically disprove a finding. If a real alert supports a
   repair, propose the smallest change and regression test; otherwise name
   what is missing. Do not dismiss an alert, rerun scanning or say a unit
   test cleared CodeQL. Any future rescan must be tied to the repair revision.

**Ask:** "What distinguishes a completed analysis with zero findings from
an empty view?" Require actual completion, target and result evidence. The
independent task changes a caller or input condition without creating a flaw.

## 30-33: Live Quiz Sprint

Read aloud; learners may use paper, fingers, chat or private written responses.
Allow additional response time and do not rank by speed.

1. Is scanner severity the same as deployment risk? **No.**
2. Does an empty view prove analysis ran? **No.**
3. Does a local unit test by itself clear an alert? **No.**

## 33-35: Read, Rule Out, Return

**Read** the actual path and deployment assumption. **Rule out** an impact
claim not supported by the analyzed revision. **Return** to the evidence
needed for a repair or a source-only boundary review. Start practice at
minute 35 even if the alert is blocked.

## 35-70: Independent practice

Use the real CodeQL alert if one is accessible; otherwise use the real
request-body boundary. Both routes require a decision and a clear evidence
limit, but only the first is finding-specific triage.

1. **35-40:** Record analysis availability, tool, target branch, revision and
   conclusion from the actual **Security** and **Actions** views. If any is
   hidden or absent, mark it unknown. If there is no actual CodeQL alert,
   explicitly record **BLOCKED: finding-specific triage** and use the
   fallback in the next steps.
2. **40-48:** Follow the applicable path:
   - **Actual alert:** Open its rule and any displayed path. At the analyzed
     SHA, identify the input, relevant callers, validation and sink only if
     shown. Record the alert URL, state and source locations. If the SHA or
     path is unavailable, mark the corresponding analysis **BLOCKED**.
   - **No alert:** At the approved `wre-v1` tag, open `src/server.mjs` and
     `test/http.test.mjs`. Find `BODY_LIMIT`, `jsonBody`, and the tests named
     for the 16 KiB limit and exact boundary. In a verified clone, these
     native reads help locate them:

     <pre tabindex="0"><code>git grep -n -e 'BODY_LIMIT' -e 'jsonBody' wre-v1 -- src/server.mjs
     git grep -n -e '16 KiB' -e 'chunked transfer' wre-v1 -- test/http.test.mjs
     </code></pre>

     If the tag or files are unavailable, mark this source review **BLOCKED**.
3. **48-54:** Change one assumption and explain the decision:
   - **Actual alert:** Inspect a different real caller or consider whether a
     proposed deployment would expose the input beyond loopback. Say which
     evidence supports or limits reachability, priority and fix scope. Do not
     deploy, expose the service or assume a proxy makes a finding harmless.
   - **No alert:** Compare a declared `Content-Length` with chunked input,
     which may arrive without that length. Explain why checking the received
     byte count matters. Read the assertions for a valid 16384-byte body and
     an over-limit body; distinguish expected test behavior from an
     executed result. Do not send a new payload.
4. **54-62:** If you have the verified local clone and Node 24+, run the
   relevant real tests from its root. For the body-limit fallback, use:

   <pre tabindex="0"><code>node --test test/http.test.mjs
   </code></pre>

   For an actual alert, locate its relevant tests with `git ls-files test`
   and run the project's `npm test` instead; explain which assertions relate
   to the finding rather than assuming the HTTP tests cover it.
   Record the actual result and `git rev-parse HEAD`. This is a test of the
   local baseline, not validation of an alert analyzed at a different SHA.
   Without the runtime or clone, mark local execution **BLOCKED**. Optionally,
   for the body-limit fallback, if existing assertions leave a justified gap,
   add a benign regression test to `test/http.test.mjs` on your own verified
   learner branch. For example, inspect whether an exactly 16384-byte valid
   JSON request sent in chunks is covered; use the existing `raw` helper and
   valid quote test data rather than a new runner. Run `npm test` and inspect
   `git diff` and `git diff --check`. Do not weaken the boundary or claim an
   unrun test passed.
5. **62-67:** For an actual finding, write a bounded repair and test proposal
   only if the behavior and path are understood; otherwise list the missing
   fact and owner. A separately authorized local repair must be tied to the
   relevant source revision and tested; a test result is not a CodeQL rescan.
   For the fallback, state what the body-limit tests cover and what they do
   not establish about production exposure or a scanner finding.
6. **67-70:** Finish the note with analysis/finding status, exact source
   revision, observed or proposed behavior, one decision-changing assumption,
   actual test result or block, and the next responsible owner. Never label
   the fallback a remediated alert.

## If something fails

- **Empty alerts:** Check filters and actual analysis completion for the
  target branch before drawing a conclusion. Zero displayed alerts does not
  prove a vulnerability-free app.
- **403, 404 or no Security tab:** Verify the target and current authorized
  actor. Record the access limit; do not broaden credentials or infer that
  an alert does not exist.
- **Alert on another SHA:** Inspect that revision first, then compare the
  current code. A changed line alone does not prove that the data flow is
  resolved. If the revision is inaccessible, the comparison is **BLOCKED**.
- **A local test fails:** Preserve the diff and actual error; reconsider the
  documented behavior. Do not suppress a rule or weaken a test to obtain
  green. Static and dynamic tests complement each other; neither proves
  complete security.

## 70-83: Self-check and debrief

- **70-75, self-check:** Is the finding real and tied to an analysis revision?
  If not, is finding-specific triage explicitly blocked? Are source
  expectations separate from actual test results?
- **75-81, facilitator discussion:** Ask, "Which assumption changes the
  exposure decision?" and "What would a post-fix CodeQL run need to show?"
  A local-only boundary changes reachability, not the truth of every alert.
- **81-83, record:** State the decision, remaining uncertainty and owner; do
  not claim a remediation or hosted scan that did not happen.

## 83-85: Transfer and close

Tell a customer what was actually analyzed, which deployment assumption
matters and who must validate a proposed fix. Local source and app behavior
are not hosted CodeQL evidence. Missing analysis or finding work is
**BLOCKED**; independent security and native/classroom rehearsal are
**UNREVIEWED**.
