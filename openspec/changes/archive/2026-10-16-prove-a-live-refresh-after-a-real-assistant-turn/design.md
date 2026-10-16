## Context

The motivation is in the proposal. The plugin already refreshes on
`session.execution.succeeded` and on a thirty second timer, and unit tests
assert the wiring. This change adds the missing end to end observation of a
real turn.

## Goals / Non-Goals

Goals:

- Run a real assistant turn in the terminal without a model account.
- Observe the sidebar before and after the turn and prove the counts changed
  because of the turn.
- Keep the case deterministic and offline.

Non-Goals:

- Test provider integrations in general.
- Replace the wiring tests. They stay, because they are fast and precise.

## Decisions

Use a local OpenAI compatible provider instead of a real account. OpenCode
loads the provider runtime from its own binary, so a provider entry with a
local base URL needs no package install and no network. The harness serves the
completion itself.

Hold the completion until the case is ready. The provider withholds the
assistant message until the case releases it. That makes the order
deterministic: the plugin reads the tracker at startup, the case then adds a
bean, then the turn finishes, then the plugin refreshes. Without the hold the
turn could finish before the bean is added and the assertion would pass for the
wrong reason.

Bound the capture below the timer. The capture window stays under thirty
seconds from plugin setup, so the periodic timer cannot be the cause of the
refresh. The observed change must come from the turn event.

Assert on the rendered screen, not on raw bytes. Terminal output places escape
sequences between characters, so the harness reconstructs the screen and crops
the sidebar region before matching.

## Risks / Trade-offs

[Risk] The provider package name could change in a future OpenCode release ->
Mitigation: the case skips when the provider cannot start, and the failure is
visible in the assistant text assertion rather than as a silent pass.

[Risk] Terminal timing makes the case flaky -> Mitigation: the provider hold
removes the race, the capture window is generous, and the assertion reads the
reconstructed final screen.

[Risk] The case needs a real terminal, so it cannot run in the pure nix check
-> Mitigation: it lives in the end to end suite, which is separate by design.
