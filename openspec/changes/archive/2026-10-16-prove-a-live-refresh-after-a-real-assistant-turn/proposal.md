## Why

Acceptance criterion 3 of the PoC says the sidebar refreshes after each
assistant turn. The current evidence is wiring tests that assert the plugin
subscribes to `session.execution.succeeded` and re-reads the tracker. No test
observes a real turn and the refreshed frame, so a regression in the event
subscription, in the reactive repaint, or in the read path would go unnoticed.

The epic bean `opencode-beans-06i1` deferred this work because it needs a
configured model provider and network access. This change closes that gap by
giving the end to end harness its own local provider, so a real turn runs
without credentials and without network access.

## What Changes

- Add a local OpenAI compatible provider to the end to end harness. It is a
  small HTTP server that answers `POST /v1/chat/completions` with a canned
  assistant message, so a real turn completes without a model account.
- Add an end to end case that boots the terminal against a fixture project,
  starts a turn, waits until the turn has been submitted, adds a bean to the
  tracker, lets the turn finish, and asserts that the sidebar shows the new
  total. The initial read saw the old total, so the new total can only come
  from the refresh that follows the turn.
- Keep the case out of the pure nix check, because it needs the terminal and
  the python pseudo terminal helper.
- Make the case skip cleanly when the terminal, the python helper, the plugin
  dependencies or the local provider are unavailable.

## Capabilities

### New Capabilities

- `live-refresh`: prove with a real assistant turn that the sidebar section
  refreshes after the turn.

## Impact

- New harness files under `e2e/helpers/` and a new case `e2e/beans-live-refresh.test.ts`.
- `e2e/helpers/project.ts` gains an option that writes the provider config and
  the provider key into the fixture.
- `e2e/README.md` documents the local provider and the new case.
- No change to the plugin itself.
