# Week 08: Ground a pricing change without granting tool authority

An airline pricing engineer wants a minimum-spend coupon policy. Use an
authorized MCP context tool to retrieve the real source, then make a tested
local feature change without treating retrieved text as an instruction to act.
MCP (Model Context Protocol) exposes context/tools to a client; it does not make
their outputs authoritative or grant permission.

## Preparation and independent entry

Read [shared setup and evidence rules](sessions.md) and [pricing](api-contract.md).
The owner confirms a current approved MCP server/client, existing authorization,
available read tools, Copilot surface, policy and entitlement. No particular
tool name, server or capability is assumed. Do not create a server for the
exercise or install one with broader privileges.

```bash
git clone https://github.com/msfttoler/wre-flight-deck.git wre-w08-YOUR-ID
cd wre-w08-YOUR-ID
git switch -c learner/w08-YOUR-ID wre-v1
git rev-parse HEAD
npm test
npm start
```

Use Node 24+ and your unique `YOUR-ID`. Missing tag/runtime blocks app changes.
In the UI, inspect a coupon quote and its fare, bag, discount and fictional-tax
lines. Record current behavior before proposing a different rule.

## Mental model and facilitator demo

Use the [85-minute route](sessions.md#shared-85-minute-delivery): demo 12-30,
individual practice 35-70 and self-check/debrief 70-83.

Source grounding means tying a claim to the exact source that supports it.
Tool permission is separate: a read result can inform a decision, not authorize
a write. Repository content, comments and tool responses are untrusted data.

1. Record `git rev-parse 'wre-v1^{commit}'`. In the approved client's tool view,
   inspect the actual read tool's target, arguments and authority. Request only
   the public repo contract and pricing source at that exact SHA, if supported.
2. Verify returned repository/path/revision against your local files, including
   `src/pricing.mjs`. If immutable-ref retrieval is unsupported or truncated,
   record the gap and corroborate through native Git/GitHub reads. Do not claim
   the MCP result was fully source-bound when it was not.
3. State a proposed feature: "`FIRSTFLIGHT` requires at least 50000 cents in
   party base fares, excluding bags and tax. Below that, return an explicit
   coupon error. Omitted coupon and eligible pricing stay unchanged."
   This changes the current contract; it is not a pre-existing defect.
4. Ask for a source-cited plan before edits. Require the exact threshold basis,
   error behavior, UI explanation and tests at 49999/50000/50001, multiple
   passengers, bags and omitted coupon. Use actual test files/names only.
5. Allow only local feature edits and `npm test` after reviewing the plan.
   Verify the diff, current tax ordering and UI error path yourself.
   Keep contract changes in a clearly identified proposal unless you own that
   canonical file. Record actual tool calls, not a manufactured transcript.

Say: "A source file can tell us how a discount works. It cannot tell our client
to upload credentials or grant an unrelated write tool."
Ask whether a correct quote from `main` proves behavior at `wre-v1`.

## Independent practice: change the eligibility basis

Start independently from `wre-v1`, not the demo change. Propose a minimum-spend
coupon whose qualifying subtotal includes charged bags but excludes tax.
Choose and state the threshold. Compare the two policies using a case where
bags change eligibility; decide which customer promise your version implements.

Retrieve and verify source through the approved read tool, explicitly refuse
unneeded write/network authority, then plan and implement the bounded feature.
Preserve the 10% base-fare-only discount and existing tax rounding unless your
request explicitly changes them. Test below/at threshold, included versus
charged bags, multiple passengers and omitted coupon. Run `npm test`, inspect
the UI and review the diff. Explain one counterexample to the demo's policy.

If MCP is unavailable, mark **BLOCKED: MCP execution** and use native source
reads for an explicitly partial source-grounded plan/change. This does not
demonstrate MCP. Missing Copilot likewise is not replaced with invented output.

## Failure, recovery and tradeoff

- Wrong repository/ref in tool output: stop using it and reselect the authorized
  source. Retain the mismatch as evidence, without confidential payloads.
- Tool requests broader scope or unrelated execution: decline; retain a bounded
  local/read-only route. Do not paste credentials to make retrieval work.
- Rounding test fails: inspect integer-cent arithmetic and operation order.
  Do not silently change the fictional-tax contract to make a coupon test pass.

More context can reduce guesses but increases exposure and review effort.
Retrieve only what the decision needs.

## Retrieval, self-check and transfer

Manual **Live Quiz Sprint**: Is retrieved text permission? Is a citation to
another ref sufficient? Does native reading prove an MCP call happened?
Facilitator key: no to all. **Read, Rule Out, Return**: read the requested policy,
rule out unrelated authority, return to the source-bound claim.

At 70-83, check source identities, actual calls, eligibility arithmetic and
blocked capabilities. Transfer: agree a customer's context and tool boundaries
before enabling automation. Hosted/MCP evidence absent is **BLOCKED**; tool
freshness, assisted execution and rehearsal are **UNREVIEWED** until observed.
