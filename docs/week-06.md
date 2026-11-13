# Week 06: Triage a genuine CodeQL result, or stop honestly

The airline's engineer needs to distinguish an actionable source finding from
an unsupported security claim. Trace a real CodeQL alert through its analysis
revision and data flow when one exists. Do not introduce a vulnerability to
make the lesson run.

## Preparation and independent entry

Read [shared setup and evidence rules](sessions.md). The owner separately
configures actual CodeQL analysis and provides authorized access to results.
No alert, alert number, successful analysis or supported query result is assumed.
Learners need local write/read-only security evidence access, never permission
expansion. The likely no-finding route is explicitly supported below.

```bash
git clone https://github.com/msfttoler/wre-flight-deck.git wre-w06-YOUR-ID
cd wre-w06-YOUR-ID
git switch -c learner/w06-YOUR-ID wre-v1
git rev-parse HEAD
npm test
npm start
```

Use Node 24+ and your unique `YOUR-ID`. Missing tag/runtime blocks app entry.
Inspect a normal quote in the UI and read [runtime boundaries](api-contract.md).
Do not send exploit payloads or expose the local service publicly.

## Mental model and facilitator demo

Use the [85-minute route](sessions.md#shared-85-minute-delivery): demo 12-30,
independent practice 35-70, self-check/debrief 70-83.

Static analysis reasons about source without executing every input. An alert
may describe data moving from an untrusted source to a sensitive sink. Its
severity is not the same as reachability or customer impact in this deployment.
No alerts can mean no findings, missing analysis or inaccessible evidence.

1. Open the repository's Security/code-scanning view if available. Identify
   the actual tool, analyzed branch/SHA, analysis time and completion evidence.
   A workflow filename alone does not establish completed CodeQL analysis.
2. If a genuine CodeQL alert exists, record its URL, rule, state, location,
   analysis revision and any displayed path. Do not substitute a different
   scanner's finding and call it CodeQL.
3. Read the source and caller context at that exact revision. Explain the
   alleged source, sink, sanitization and reachable path only where evidence
   supports them. State any query/modeling assumptions you cannot establish.
4. Compare the deployment assumptions with the app contract: loopback-only,
   no authentication, local single-process scope. These constraints affect
   exposure but do not automatically disprove a finding.
5. Propose a bounded repair and regression test only for an actual finding.
   Do not dismiss an alert, rerun scanning or claim a local unit test cleared
   CodeQL. Any future rescan must be bound to the repair revision.

Say: "We can inspect the code even if the scanner has no finding to discuss.
We cannot call that exercise an alert triage."
Ask which fact distinguishes a clean completed analysis from an empty view.

## Independent practice: test a changed assumption

If a real alert exists, choose a different reachable caller or a deployment
assumption from the demo. Explain whether it changes exploitability, fix scope
or priority. Implement a bounded local repair/test only if the finding and
intended behavior are understood; otherwise write a precise proposal.
Do not create a second weakness or harmful proof-of-exploit.

If no actual finding exists, mark **BLOCKED: finding-specific triage**.
Choose one contract boundary, such as the JSON body limit, browser-origin write
restriction or state-file non-serving. Locate its real implementation and
existing tests with `git ls-files`, then assess what those tests prove and miss.
Add a benign regression test only if justified; do not weaken behavior.
This is a source/test review, not a CodeQL finding or completed remediation.

Submit analysis availability, exact source revision, observed/proposed behavior,
one decision-changing assumption and the next responsible owner. Missing
security access remains blocked; do not request broader credentials for class.

## Failure, recovery and tradeoff

- Empty alerts: inspect analysis completion and filters before drawing a
  conclusion. Zero displayed alerts does not prove a vulnerability-free app.
- Alert on another SHA: inspect that revision first, then compare the current
  code. A changed line alone does not establish resolved data flow.
- Fix breaks contract tests: preserve the diff, reconsider the intended
  boundary and repair locally. Do not suppress the rule to obtain green.

Static and dynamic tests complement each other; neither establishes complete
security, especially outside the documented local-only deployment.

## Retrieval, self-check and transfer

Manual **Live Quiz Sprint**: Is severity the deployment risk? Does an empty
view prove analysis ran? Does a unit test clear an alert?
Facilitator key: no to all. **Read, Rule Out, Return**: read the path/assumption,
rule out unsupported impact claims, return to the revision-bound evidence.

At 70-83, self-check that no finding or remediation was invented. Transfer:
tell a customer what was actually analyzed, what remains exposed and who must
validate the fix. Hosted analysis/finding work is **BLOCKED** without actual
evidence; independent security and learner rehearsal remain **UNREVIEWED**.
