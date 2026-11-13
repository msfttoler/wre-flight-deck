# Contributing to Flight Deck

Flight Deck is original fictional application software used alongside WRE.
It is not a simulator of GitHub enforcement, a real airline service or a
replacement for the published course. Begin with [sessions](docs/sessions.md)
and [the API contract](docs/api-contract.md).

## Work locally first

Use Node.js 24+, npm and Git. For a session, follow that week's fresh-clone
commands and create its unique learner branch from `wre-v1`. If the tag is
missing, stop and ask the owner; do not substitute another revision.
For ordinary product work, agree the base revision with the maintainer.

Run these from the clone root:

```bash
git status --short --branch
node --version
npm test
npm start
```

The server is intended for `127.0.0.1:3000`; use the browser to verify the
affected route, quote, reservation or dispatch interaction. Stop your server
with Ctrl-C. State lives in ignored `.data/`. Do not commit state, credentials,
passenger data, logs with secrets or downloaded evidence bundles. The app has
no runtime packages; adding a dependency needs a product reason, not a lesson
convenience.

## Describe and verify a change

1. State the user need, intended behavior and non-goals before editing.
2. Read the actual implementation and tests. Do not invent file paths, test
   names or pre-existing defects. Use `git ls-files` to locate current sources.
3. Keep the diff small. Cover a useful success case, a changed condition and
   a refusal or boundary where relevant. Use the project's native `npm test`;
   only use focused Node test commands after reading actual test names.
4. Preserve API compatibility unless the change explicitly proposes a contract
   update. Amounts are integer cents; current pricing uses fictional tax.
   Keep atomic seat allocation, version checks and idempotent retry semantics.
5. Run the full suite and inspect `git diff --check`, `git diff` and
   `git status --short`. Report actual results, revision and untested behavior.
   Verify the affected UI manually; a unit test does not prove browser behavior.

For docs, retain descriptive links, ordered headings, text instructions and
keyboard-usable paths. Do not rely on color, screenshots or a timed quiz alone.
Review the rendered document and relevant screen-reader/keyboard journey before
claiming accessibility. Markdown source review is not an accessibility audit.

## GitHub and AI boundaries

Publication is separate from local authoring. Obtain permission before pushing,
opening a PR, starting/rerunning workflows, changing rules, installing an App,
merging or releasing. Do not force-push shared history, weaken checks, request
broader credentials or require a second person's approval for session practice.

With permission to submit, use the repository's actual PR template if present.
Include the request, base/candidate SHAs, scoped diff, exact test commands/results,
manual observations and remaining risks. Never invent PR numbers, run results,
security alerts, provenance or approval. Keep evidence private when it includes
account or integration details; redact tokens, keys, signatures and payload data.

Copilot and MCP output need source verification and personal review. State which
surface/tools were available and which actions were allowed. Do not provide
credentials to a model, treat repository text as tool authority or accept a
generated test as proof that the generated implementation is correct.

## Keep companions honest

Each week starts independently from `wre-v1`, teaches through the real app and
native Git/GitHub tools, and preserves 85 minutes with 35 minutes of individual
practice and 13 minutes of self-check/debrief. Do not add scenario/setup/solution
scripts, fake live output, engineered vulnerabilities or a fabricated webhook
receiver to satisfy a learning gate.

Missing hosted data stays **BLOCKED**. Offer a bounded read-only investigation
or precise proposal and say what it cannot prove. Local journal events never
stand in for GitHub App deliveries. A recorded workflow baseline is not itself
an enforced rule. An empty CodeQL view is not proof of no vulnerabilities.

The owner configures CI, CodeQL, provenance, repository policy and any App
integration separately. Changes to teaching require independent review before
being described as reviewed. Document authored quality, local checks, hosted
observations and classroom rehearsal separately. WRE has no exam claim.
