# Week 07: Take a feature request through Copilot and personal review

An airline support engineer wants to find a booking without reading the whole
list. The facilitator works through a proposed status filter; each learner
then makes a different, callsign-based proposal. The existing app works:
neither filter is a staged defect or a promise that the baseline has it.

**By the end:** explain the requested behavior, verify the relevant source,
make a bounded local change, and use actual tests and a personal diff review
to decide what remains unfinished.

**Product request:** [Issue 1: reservation-status filter](https://github.com/msfttoler/wre-flight-deck/issues/1).
The independent callsign filter below is a separate proposal.
This standalone Flight Deck companion uses a different scenario from the
existing Week 07 course materials; do not pair them until the owner aligns them.

## Before class: prepare an independent workspace

The facilitator and each learner use separate workspaces. No earlier week,
administrator role, hosted write, or peer approval is needed.

1. The owner confirms the approved `wre-v1` SHA and an available Copilot
   surface, entitlement, model policy, and permitted tools. For the VS Code
   example below, confirm that Copilot Chat and the needed modes are actually
   available. Do not promise a particular model or enable new tools for class.
2. Read [the shared evidence rules](sessions.md) and
   [the booking API contract](api-contract.md). Have a browser, Git, and
   Node.js 24 or later. The commands use a bash-compatible terminal; on
   Windows, use Git Bash. These checks do not install anything:

   ```bash
   git --version
   node --version
   npm --version
   ```

3. Use a new folder under your home directory. `river-a1` is an example,
   not your required identity. Replace it in every command with your own
   non-sensitive, unused attempt name:

   ```bash
   cd ~
   git clone https://github.com/msfttoler/wre-flight-deck.git wre-w07-river-a1
   ```

   If cloning fails or the folder already exists, stop; use a different
   unused folder rather than overwriting work. Only after cloning succeeds:

   ```bash
   cd ~/wre-w07-river-a1
   git remote -v
   git status --short --branch
   git rev-parse 'wre-v1^{commit}'
   ```

   Confirm both remote URLs name `msfttoler/wre-flight-deck`, the worktree has
   no changes, and the tag SHA matches the owner's approved SHA. The `##`
   line is a branch header; other status lines indicate changes. Do not share a
   remote URL if it contains credentials. A missing or mismatched tag is
   **BLOCKED**; do not substitute `main`.
4. Create your own branch from that tag. If the branch name already exists,
   choose another unused name; do not reset it.

   ```bash
   git switch -c learner/w07-river-a1 wre-v1
   ```

   If it succeeds, check the selected commit:

   ```bash
   git rev-parse HEAD
   ```

   Stop if `HEAD` differs from the approved tag SHA. Only then run:

   ```bash
   npm test
   ```

   Record the actual baseline test result; investigate a failure before
   claiming a later change passed.
5. In a **second terminal**, again replacing `river-a1` with your own name:

   ```bash
   cd ~/wre-w07-river-a1
   npm start
   ```

   Wait for your terminal to print `Flight Deck: http://127.0.0.1:3000`
   and stay running before opening that address. If the port is occupied,
   do not stop someone else's process or browse its listener. After your
   failed start exits, use `PORT=3001 npm start` and open port 3001 only
   after your server reports that it started. Choose another unused port if
   needed; remember it for restarts. If the app or runtime is unavailable,
   the UI portion is **BLOCKED**; do not describe an unobserved UI result.
6. Create fictional data in your own app: choose **SEA · Seattle** to
   **DEN · Denver**, **1 passenger**, and **Find flights**. On a displayed
   itinerary choose **Review fare**, then **Calculate fare**. Enter a unique
   fictional team callsign, such as `TEAM-ORBIT-A1`, and choose **Confirm
   fictional booking**. Open **View reservations** and find that callsign.
   If there are no available options, select another destination; do not use
   a real person's name or payment data. Repeat with a second fictional
   callsign. In its reservation row choose **Cancel reservation**, then
   **Confirm cancellation**. Verify that one fictional booking is confirmed
   and the other cancelled. If cancellation cannot be completed, mark that
   filter demonstration **BLOCKED** rather than inventing a row.

`wre-v1` predates the in-app quick-start panel. These instructions describe
the application controls, not a panel that must be present at that tag.
Keep the clone's `.data/` directory: it contains this workspace's local state.

## 00-12: Open and explain the task

1. **00-05 - Open the problem.** Show Issue 1. If it is unavailable, mark
   the issue read **BLOCKED** and use the status-filter description above as
   a local proposal. Say: "Support needs a shorter list. We will decide what
   the filter means, then check the change rather than accepting an
   assistant's assurance." Ask: "Does hiding a booking prevent someone from
   reading it?" The answer is no: a filter is not authorization.
2. **05-12 - Set the mental model.** Point to the local **Reservations**
   view. Explain that the browser requests data from `GET /api/bookings`;
   a server-side filter and a browser-only hiding rule are different changes.
   The assistant can propose a diff, but the engineer owns the acceptance
   criteria, tool permissions, and verification.
3. Confirm everyone can identify their own clone, branch, baseline SHA, and
   actual baseline test result. In VS Code, choose **File > Open Folder** and
   open that clone, not the parent directory. If Copilot is unavailable,
   continue with a manual plan/change and mark assisted execution **BLOCKED**.

## 12-30: Facilitator demonstration

Use the facilitator's own branch and fictional data. Keep learner branches
untouched.

1. **12-16 - Find the real implementation.** From the clone root, run:

   ```bash
   git grep -n -e 'api/bookings' -e 'bookings()' -- src web test
   git grep -n -e 'confirmed' -e 'cancelled' -- src test
   ```

   Open the matching files. Locate the HTTP route in `src/server.mjs`, the
   booking list in `src/service.mjs`, the UI in `web/app.js`, and the actual
   tests. Check supported statuses in source instead of assuming them from
   a label. A search result is a starting point, not proof that a filter exists.
2. **16-20 - Ask for a plan, not an edit.** In VS Code, open Copilot Chat
   from the Copilot menu and select **Ask** in the agents dropdown. Enter:

   > Inspect this checkout and plan an optional exact status query parameter
   > for GET /api/bookings and a labeled Status control in Reservations. Preserve
   > the existing response and order when the filter is omitted; reject unknown
   > statuses using the existing error format. Filtering must not change seats,
   > booking versions, events, or stored bookings. Include a useful empty
   > state. Cite the real source and test paths, accepted statuses,
   > compatibility risks, and tests. Do not edit files, run commands, access
   > another repository, or use credentials.

   Compare each cited path and assumption with the files you opened. If the
   client cannot enforce the allowed tool boundary, do not use that assisted
   route; write the plan yourself and mark it **BLOCKED**. A prompt alone
   does not prevent an enabled tool from acting.
3. **20-25 - Make the bounded change.** State the agreed behavior: no
   parameter preserves the existing response and order;
   `?status=confirmed` and `?status=cancelled` return matching bookings;
   an unknown status is rejected; no matches return
   `{"bookings":[]}`. Filtering must not alter inventory, booking versions,
   events, or stored bookings. The labeled UI must expose and clear the
   filter and explain an empty result. If the owner has approved local
   editing tools and their command approvals are under control, select
   **Agent** in the same dropdown and enter:

   > Implement only the accepted status-filter plan in this local checkout.
   > Add the labeled control and focused tests. Preserve the unfiltered
   > response and existing booking behavior. Ask before running commands;
   > do not access credentials, push, or change hosted resources. Report
   > changed files and the checks you actually ran.

   Otherwise edit manually. Refuse unrelated network, credential,
   hosted-write, or destructive requests. Keep a proposed contract update
   separate unless you own that file.
4. **25-30 - Inspect and test what actually happened.** Read the proposed
   changes, then run:

   ```bash
   git status --short
   git diff --check
   git diff
   git diff --cached --check
   git diff --cached
   npm test
   ```

   Open every untracked file listed by `git status --short` in the editor;
   expand any listed untracked directory. Inspect staged and unstaged changes
   separately. Preserve unexpected work instead of staging or deleting it
   merely to make it visible.

   Find tests for omitted input and ordering, each supported status, unknown
   input, an empty result, and unchanged inventory. Predict one result before
   reading its assertion. Record the real result, including failures. To
   check the affected browser journey after backend edits, stop **your**
   server with Ctrl-C, confirm the clone and `git rev-parse HEAD`, restart
   `npm start` there using the same port selected in preparation, and reload
   the browser only after your server reports that it started. In
   **Reservations**, apply and clear the new control; compare visible rows
   with the API response. To exercise the empty state, clear the filter,
   cancel your remaining confirmed fictional booking, and apply the
   **confirmed** filter again. Compare the UI and API response; record an
   empty result or any unexpected rows. If cancellation or the filter is
   unavailable, mark that check
   **BLOCKED**. After implementation, you can open
   `http://127.0.0.1:3000/api/bookings?status=confirmed` in a browser to
   inspect that response; use your selected port if it is not 3000. Also open
   `http://127.0.0.1:3000/api/bookings?status=unknown` using that port and
   predict a structured error, then record the actual response even if it is
   unexpectedly successful. Check that the existing booking and
   cancellation journey still works with a fictional callsign. A generated
   label or successful result is not
   guaranteed. If time or a dependency prevents a check, record the missing
   evidence rather than claiming success. Never delete `.data/` to make the
   check pass.

At minute 30, pause even if the implementation is incomplete. Say what was
actually observed and move the room to the quiz.

## 30-35: Retrieval and handoff

**30-33 - Manual Live Quiz Sprint.** Ask for a written answer, a show of
fingers, or chat; no quiz service or speed ranking is needed.

1. Does a generated assertion independently prove the generated code correct?
2. Does a status filter restrict who can read bookings?
3. Does an accepted plan mean the change has been implemented?

Facilitator key: **no** to all three. Explain that expected behavior must be
checked against the request, not just against the implementation.

**33-35 - Read, Rule Out, Return.** Read the acceptance condition; rule out a
browser-only filter as evidence of server filtering; return to the actual API
response and diff. Point learners to the independent task below.

## 35-70: Independent practice - filter by callsign

Use your own branch from `wre-v1`, not the facilitator's status-filter
solution. The new request is: "Find bookings by an optional exact fictional
team callsign, while keeping the unfiltered list unchanged."

1. Write four decisions before asking for code: whether matching is
   case-sensitive, what an empty input means, what an omitted parameter means,
   and what a no-match response contains. A clear starting choice is
   case-sensitive matching, blank input clearing the filter, an omitted
   parameter returning all bookings, and no match returning an empty list.
   You may choose differently if you state and test the behavior. Include
   the labeled browser control and state that this is not access control.
2. Find the route, list method, UI, and current tests using the two
   `git grep` commands above. Record the actual source revision:

   ```bash
   git rev-parse HEAD
   ```

3. If an authorized Copilot surface is available, open Chat and select
   **Ask**. Enter the prompt below, replacing its four example decisions
   if yours differ:

   > Inspect this checkout and plan an optional exact callsign filter for
   > GET /api/bookings with a labeled Reservations control. Match case
   > exactly, treat blank as no filter, keep an omitted parameter unfiltered,
   > and return an empty list for no match. Cite actual files and tests.
   > Do not edit, run commands, access another repository, or use credentials.

   Compare the plan with source. Otherwise write the plan manually and mark
   the Copilot part **BLOCKED**; do not invent a transcript.
4. Make or request only the local callsign-filter change. Add focused tests
   for a match, no match, omitted filter, and your case/empty-input decision.
   Inspect every suggested command before approving it.
5. From the clone root run the status, unstaged/staged diff and test commands
   in demo step 4. Open every untracked file reported by status. Save actual
   results. Stop and restart your own server on your selected port after
   backend changes as described in the demo; then apply and clear the new
   control in **Reservations**. Use only your fictional callsigns. If your
   server did not start or the app cannot be checked, label the UI result
   **BLOCKED**.
6. Save a short note outside tracked app files: request and four decisions;
   baseline SHA; files changed; actual tests and UI observations; one
   suggestion rejected or one risk you independently checked; and any gap.
   A plan without the implemented and tested behavior is partial work.

## 70-85: Self-check, recovery, and close

**70-75:** Check your request against the diff, test output, and UI
observation. Label an unrun check **UNREVIEWED** and an unavailable tool
**BLOCKED**. Do not call a local diff a pull request.

**75-81:** Discuss: Which assertion would catch a server returning every
booking? What would still be needed to establish authorization? If tests
pass but the UI fails, inspect the actual request and rendering; neither
result erases the other.

**81-83:** Record the decision and the next owner/action. If an assistant
edited unrelated work, stop, inspect the diff, and preserve that work before
making any correction; do not reset the branch.

**83-85:** Transfer the method to a customer's change: provide the scoped
request, independently checked diff, actual test result, and remaining gaps.
Stop only your own server with Ctrl-C. Hosted checks, classroom rehearsal,
and any unperformed assisted steps remain unreviewed.

Reference: [GitHub's current VS Code agent-mode instructions](https://docs.github.com/en/copilot/how-tos/copilot-in-your-ide/use-copilot-agents/use-agent-mode?tool=vscode).
