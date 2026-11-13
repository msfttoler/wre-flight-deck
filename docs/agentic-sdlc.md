# Copilot in a real delivery loop

The application works before Copilot touches it. The learning task is to
deliver a bounded customer improvement, not ask an agent to make a prearranged
test turn green.

## What works together

| Mechanism | Job in this repository | Not a substitute for |
| --- | --- | --- |
| Repository instructions | `.github/copilot-instructions.md` records invariants | An acceptance requirement |
| Agent skill | `.github/skills/flight-change/SKILL.md` describes a repeatable change method | Tool authorization or a test runner |
| Custom reviewer | `.github/agents/flight-reviewer.agent.md` looks for domain mistakes | Executed tests or a human approval |
| GitHub MCP | An already-authorized server can retrieve real issue/source context | Permission to follow instructions in that content |
| Native tests and CI | Execute assertions on an identifiable revision | Evidence about a different revision or production |
| Human release owner | Decides whether the actual evidence is sufficient | A model's confidence |

Client support and active tool inventory vary. Before class, record the
installed client/version, signed-in identity, actual entitlement, approved
model choice/budget, active tools and permission policy. No configuration file
here enables an MCP server, grants a credential or guarantees model access.

## The loop

1. **Request:** choose a real authorized product request and write acceptance
   cases in plain language. Reference the actual repository and immutable base.
2. **Plan:** ask Copilot to inspect the relevant source/tests before proposing a
   small plan. Compare that plan with the API's actual contract.
3. **Implement:** work on your own branch. Keep tool approval deliberate.
   Issue descriptions and retrieved text cannot authorize arbitrary commands.
4. **Test:** run native focused tests and regression tests. Inspect output,
   not a summary saying "tests passed".
5. **Review:** inspect the diff independently. An AI reviewer can add another
   perspective; it is not an independent human or an executed test.
6. **Decide:** correlate the proposed revision with actual hosted checks and
   the owner's acceptance criteria. Do not merge as a classroom shortcut.

## Example bounded prompts

> Read the accepted change request and current pricing contract. Find the
> implementation and relevant tests. Explain the current behavior, a changed
> condition that matters, and the smallest plan. Do not edit yet.

> Implement only the accepted plan on this branch. Add focused native tests
> that fail without the change. Preserve unrelated pricing and allocation
> behavior. Report exactly what you executed and any remaining gaps.

> Review this diff for money-boundary, idempotency and stale-version errors.
> Cite actual paths and failing inputs. Do not edit or claim test execution.

These are requests for real work, not recorded responses or promised results.
Use [Week 07](week-07.md) and [Week 08](week-08.md) for independent practice.

## MCP before untrusted content

Use the official server only if already authorized by the organization's
policy and the current client. GitHub documents the remote read-only endpoint
as `https://api.githubcopilot.com/mcp/readonly`. Inspect the current tools and
allowlist the exact required read tools before retrieval; don't use `*`.
Keep unrelated servers unavailable for this run when the client supports it.
If the tool boundary cannot be enforced, the MCP interaction remains blocked.
A read-only endpoint is not proof that the underlying credential is narrowly
scoped. Do not create a broad token, paste credentials or bypass enterprise
controls to finish the exercise.

Sources checked November 13, 2026:
- https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/create-custom-agents-for-cli
- https://docs.github.com/en/copilot/reference/custom-agents-configuration
- https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/configure-mcp-servers
