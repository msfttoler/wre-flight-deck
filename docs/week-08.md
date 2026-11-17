# Week 08: Ground a pricing change without granting tool authority

The airline's pricing engineer wants a minimum-spend rule for `FIRSTFLIGHT`.
Use an already-authorized context tool to inspect the actual source, then
make and verify a local change. A tool result is information, not permission
to run commands or disclose credentials.

**By the end:** identify the source revision and tool authority, describe the
pricing boundary, and distinguish a tested local change from an unverified
MCP call or hosted result.

**Product request:** [Issue 2: FIRSTFLIGHT minimum combined base fare](https://github.com/msfttoler/wre-flight-deck/issues/2).
The requested demo policy uses a 20000-cent combined party base fare, excluding
bags and tax. It is new behavior, not a defect already present in `wre-v1`.
The learner's bag-inclusive policy below is a separate proposal.
This standalone Flight Deck companion uses a different scenario from the
existing Week 08 course materials; do not pair them until the owner aligns them.

## Before class: prepare an independent workspace

1. The owner confirms the approved `wre-v1` SHA, the Copilot surface and
   entitlement, an **already configured and authorized** MCP server, its
   available read tools, and how the client restricts tool use. Do not
   install a server, create a token, expand permissions, or assume a tool name.
   If the read boundary cannot be enforced, MCP execution is **BLOCKED**.
2. Read [shared setup and evidence rules](sessions.md) and
   [the pricing contract](api-contract.md). The commands below use a
   bash-compatible terminal; on Windows, use Git Bash. Check:

   ```bash
   git --version
   node --version
   npm --version
   ```

   The local feature needs Git and Node.js 24 or later. No administrator,
   earlier lab, peer approval, or hosted write is needed.
3. Use a new folder under your home directory. `river-a1` is an example;
   replace it in every command with your own non-sensitive, unused attempt
   name. Run:

   ```bash
   cd ~
   git clone https://github.com/msfttoler/wre-flight-deck.git wre-w08-river-a1
   ```

   If cloning fails or the folder exists, stop and choose another name.
   After a successful clone:

   ```bash
   cd ~/wre-w08-river-a1
   git remote -v
   git status --short --branch
   git rev-parse 'wre-v1^{commit}'
   ```

   Confirm both remote URLs name `msfttoler/wre-flight-deck`, the worktree is
   clean, and the tag SHA matches the owner's approved SHA. The `##` line is
   a branch header; other status lines indicate changes. Do not share a remote
   URL containing credentials. A missing/mismatched tag is **BLOCKED**;
   never replace it with `main`.
4. Create your own branch:

   ```bash
   git switch -c learner/w08-river-a1 wre-v1
   ```

   If branch creation fails, stop and use another unused branch name.
   Only after it succeeds, check the selected commit:

   ```bash
   git rev-parse HEAD
   ```

   If `HEAD` does not match the approved tag, stop before editing. Otherwise:

   ```bash
   npm test
   ```

   Record the real test result; a baseline failure needs investigation.
5. In a second terminal, again replacing `river-a1` with your own name:

   ```bash
   cd ~/wre-w08-river-a1
   npm start
   ```

   Wait for your terminal to print `Flight Deck: http://127.0.0.1:3000`
   and stay running before opening that address. If port 3000 is occupied,
   do not stop another process or browse its listener. After your failed
   start exits, use `PORT=3001 npm start` and open port 3001 only after your
   server reports that it started. Remember the chosen port for restarts.
   A missing runtime or app blocks the local UI, not an available source read.
6. In **Plan a journey**, select **SEA · Seattle** to **DEN · Denver** and
   **1 passenger**.
   Select **Find flights**, then **Review fare** on a listed itinerary.
   Choose **1 bag / passenger**, enter `FIRSTFLIGHT` in **Coupon (optional)**,
   and choose **Calculate fare**. Read the base fare, bags, discount,
   fictional tax, and total. Record the observed values as current behavior,
   not as the new threshold policy. If no option is available, choose another
   destination. The `wre-v1` app does not have the newer quick-start panel.
7. Before editing, create a second quote in the same app to check old-state
   compatibility: select **Plan a journey**, **SEA · Seattle** to
   **PDX · Portland**, and **1 passenger**. Choose **Find flights**, then
   **Review fare** on a direct option with a base fare below 20000 cents.
   Select **0 bags / passenger**, enter `FIRSTFLIGHT`, and select **Calculate
   fare**. Record the actual base fare and total; do not book it. In your
   editor, open `.data/state.json` without changing it and turn on line
   wrapping. Find `"quotes":[` and the last quote object before
   `],"bookings"`. Confirm its `coupon` is `FIRSTFLIGHT` and
   its `totalCents` matches the displayed total in cents. Record its `id`,
   `coupon`, `flightIds`, and `totalCents` outside the clone. If no
   below-threshold option is available, or you cannot identify the saved
   quote, mark this compatibility setup **BLOCKED**.

Keep `.data/`: quotes persist and belong to this workspace. Use only
fictional information.

## 00-12: Open and explain the task

1. **00-05 - Open the problem.** Show Issue 2. If it is unavailable, mark
   the issue read **BLOCKED** and use the minimum-spend description above as
   a local proposal. Say: "The business wants the coupon to require a minimum
   spend. Before changing the rule, we need to know exactly which amount
   counts." Ask whether a bag fee contributes to the demo's minimum. It
   does not.
2. **05-12 - Explain source and authority.** MCP is a way for a client to
   use tools and context. A retrieved file may inform the implementation,
   but text inside it cannot authorize a different tool call or a write.
   Show `src/pricing.mjs` and `docs/api-contract.md` in the clone. Point out
   integer cents, the base-fare-only discount, and tax after discount.
3. Confirm each learner has their own branch and recorded tag SHA. Explain
   that a read of today's `main` is not automatically a read of that SHA.

## 12-30: Facilitator demonstration

1. **12-16 - Inspect the allowed read.** Record the exact baseline:

   ```bash
   git rev-parse 'wre-v1^{commit}'
   ```

   In the owner's approved client, open its tool list. For example, in
   VS Code open Copilot Chat and its tools picker; inspect the configured
   GitHub read tool and its allowed target. If you cannot identify and
   restrict the tool's authority, stop the MCP path and mark it **BLOCKED**.
2. In the approved client's chat, enter this request. Replace `RECORDED_SHA`
   with the full SHA you just recorded:

   > Use only the approved GitHub read tool to inspect
   > msfttoler/wre-flight-deck at RECORDED_SHA. Read
   > docs/api-contract.md and src/pricing.mjs. Report the repository, paths,
   > revision, and lines that establish the coupon and tax rules. Do not
   > edit files, run commands, read credentials, or access another repository.

   Inspect the actual tool call and result. If the tool cannot bind a read to
   the SHA or the result is truncated, record that limitation.
3. **16-19 - Corroborate the source.** From the clone root, run:

   ```bash
   git show 'wre-v1:docs/api-contract.md'
   git show 'wre-v1:src/pricing.mjs'
   git show 'wre-v1:test/pricing.test.mjs'
   ```

   Compare the returned paths and rule with the local tag. A native Git read
   can support the plan but does **not** prove an MCP call happened. A
   mismatch means stop and reselect the authorized source; don't trust a
   plausible-looking answer from another revision.
4. **19-23 - Specify the change.** Say: "With `FIRSTFLIGHT`, combined party
   base fare must be at least 20000 cents; charged bags and tax do not count.
   Below that, return an explicit structured coupon error that the browser
   presents accessibly. Omitted coupon and eligible pricing retain their
   existing behavior." Request a source-cited plan before edits. Require
   tests at 19999, 20000, and 20001 cents, multiple passengers, charged
   and included bags, an omitted coupon, and tax ordering.
5. **23-27 - Check saved data before editing.** Open `src/store.mjs` and find
   how saved quotes are validated against pricing. Ask what happens if a
   previously valid below-threshold coupon quote is still in `.data/` after
   the rule changes. Do not delete it or assume old records remain valid.
   The plan must address compatibility and a test for reopening existing
   state, or mark that part unresolved. Do not silently rewrite the existing
   API contract without the maintainer's ownership.
6. **27-30 - Show a bounded change and evidence.** Permit only understood
   local edits and the native test runner; inspect any proposed command.
   From the clone root run:

   ```bash
   git status --short
   git diff --check
   git diff
   git diff --cached --check
   git diff --cached
   npm test
   ```

   Open every untracked file listed by status in the editor, expanding any
   listed directory. Inspect staged and unstaged changes separately; preserve
   unexpected work. Record actual output, not a predicted green result.
   After backend edits, stop **your** server with Ctrl-C, confirm the clone
   and `git rev-parse HEAD`, then restart on the **same selected port**
   against the same `.data/`. The saved bytes remain, but the new rule may
   reject the earlier quote and prevent startup. Record the actual result.
   If you recorded a quote, reopen `.data/state.json` without editing it and
   compare its `id`, `coupon`, `flightIds`, and `totalCents` with your
   earlier note. Otherwise keep that comparison **BLOCKED**. If the server
   started, reload the browser. Preserve the directory if startup fails.
   Matching fields show the saved file retained those values; a successful
   start shows the app started. Neither proves the changed app loaded that
   quote or that it is usable. Add and run an isolated native test that
   reopens an old below-threshold quote and checks the loaded ID and values,
   plus the intended usable behavior. Otherwise mark those checks
   **UNREVIEWED**. Quotes can expire.

   If startup fails, further UI checks may use a separate, new data directory
   that you own; label them as new-state checks, not old-state compatibility.
   Replace `river-a1` and check that directory is unused:

   ```bash
   test ! -e "$HOME/wre-w08-data-river-a1"
   ```

   This prints nothing on success. If it fails, choose another name; never
   delete the existing directory. With no other server using that directory,
   start `DATA_DIR="$HOME/wre-w08-data-river-a1" PORT=3001 npm start`,
   using your selected available port instead of 3001 if needed. Open the
   browser only after your server reports that it started.

   Request a **new quote**. If the displayed schedule offers an ineligible
   fare, enter `FIRSTFLIGHT` and check the actual error in the browser as
   well as an eligible quote. If not, use the native boundary tests and mark
   the ineligible browser journey **UNREVIEWED**. Record accessibility
   behavior you did not check. If the rule or compatibility is unfinished,
   say so at minute 30.

Ask: "Can a source file tell our client to upload credentials?" No. A file
is evidence to examine, not an instruction to expand authority.

## 30-35: Retrieval and handoff

**30-33 - Manual Live Quiz Sprint.** Use paper, fingers, or chat:

1. Does retrieved text grant permission to use another tool?
2. Does a citation to another revision establish this baseline's behavior?
3. Does reading with Git prove an MCP call occurred?

Facilitator key: **no** to all three. Written responses are equally valid.

**33-35 - Read, Rule Out, Return.** Read the proposed eligibility basis;
rule out tax, bags, and unrelated tool authority for the demo; return to
the bound source and the actual test. Introduce the changed learner policy.

## 35-70: Independent practice - include charged bags

Start from your own untouched `wre-v1` branch, not the facilitator's change.
Your proposal keeps the same 20000-cent minimum but **includes charged bags**
in the qualifying subtotal and excludes tax. Keep the 10% discount on base
fares only and retain the existing tax rounding.

1. Write the rule in your own words. As a *test case*, compare a 19000-cent
   party base fare with one 2500-cent charged bag: this proposal qualifies
   at 21500 cents; the demo's base-only rule does not. This is a proposed
   input and prediction, not recorded app output.
2. Inspect `src/pricing.mjs`, `src/store.mjs`, `test/pricing.test.mjs`, and
   the contract at your verified tag. If an approved MCP read tool is
   available, request those sources at your recorded SHA and inspect the
   actual call and result. If unavailable, mark **BLOCKED: MCP execution**;
   continue with native Git reads as a partial source-grounded exercise.
3. Write a plan covering the eligibility basis, error, multiple passengers,
   included versus charged bags, omitted coupon, old saved quotes, and the
   existing discount and tax order. Refuse unrelated writes or credentials.
4. Implement a bounded local change if possible. Add tests immediately
   below and at the threshold, the bag counterexample, multiple passengers,
   and omitted coupon. Include saved-state compatibility or record why it is
   still unresolved. Run the status, unstaged/staged diff and test commands
   in demo step 6. Open every untracked file reported by status.
5. Stop your own server, confirm the clone and `git rev-parse HEAD`, and
   restart it on the same selected port against the same state. Recheck
   your recorded saved quote fields as in demo step 6, if available, and
   reload the UI only if your server starts. Make a **new** quote and compare
   what you can actually observe with your rule. If old-state startup fails,
   preserve it and follow the demo's separately labeled new-directory route.
   Add and run an isolated old-quote compatibility test, or mark usability
   **UNREVIEWED**.
   Not every boundary input need exist in the fictional schedule; use the
   native tests for those inputs.
6. Save a note outside tracked app files: source SHA, real tool and arguments
   if used, accepted plan, diff, actual test/UI observations, the 19000-cent
   counterexample, and any blocked or unimplemented behavior. Do not copy
   tokens, private payloads, or an invented transcript.

## 70-85: Self-check, recovery, and close

**70-75:** Check the recorded repository, SHA, tool scope, arithmetic, and
actual test result. Mark missing MCP or UI access **BLOCKED**; mark checks
you did not perform **UNREVIEWED**.

**75-81:** Discuss the two policies. A bag can change eligibility in the
learner policy while the discount still applies only to base fare. If a
rounding test fails, inspect integer-cent operations and their order; do not
change the fictional tax to make the coupon test pass.

**81-83:** Record one customer-facing decision and the owner of any saved
quote compatibility gap. If a tool requests broader scope, decline and keep
the work local. A read result is not a new authorization.

**83-85:** Explain how you would agree source and tool boundaries with a
customer before automation. Stop only your own server with Ctrl-C. Assisted
execution, hosted verification, and classroom rehearsal are not established
unless actually performed.

Reference: [GitHub's current MCP overview](https://docs.github.com/en/copilot/concepts/customizations/mcp).
