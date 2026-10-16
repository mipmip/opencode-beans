## Why

Epic bean `opencode-beans-lpip`. The PoC renders the BEANS sidebar section and
proves it end to end, but three things keep it from being a safe alpha base.

First, `beans list --json` runs without a bound. A slow or wedged `beans`
process leaves a read hanging, and a reload that starts before the previous one
finishes can race it. Unloading the plugin does not cancel work either.

Second, the repository explains how to build and test only in `AGENTS.md`. A
newcomer opening `README.md` cannot install the plugin, run the tests or find
the nix build output.

Third, the work that we deliberately left out of the PoC has no home. Deferred
features would live in chat history instead of the tracker.

## What Changes

- Bound every `beans` invocation with a timeout, and make reads cancellable
  through an `AbortSignal`.
- Cancel the in-flight read when a new refresh starts and when the plugin is
  disposed, so a superseded read cannot overwrite newer stats.
- Document install, development and test flow in `README.md`, including the
  `nix build` output layout.
- Record the deferred features as beans under the next milestone.

## Capabilities

### New Capabilities

- `robustness`: bounded and cancellable tracker reads, a documented install and
  development flow, a documented packaged plugin output, and a rule that
  deferred work is recorded in the tracker.

### Modified Capabilities

## Impact

- `.opencode/plugins/beans-stats/beans.ts`: timeout and `AbortSignal` support.
- `.opencode/plugins/beans-stats/tui.tsx`: in-flight cancellation.
- `README.md`: install, development and test documentation.
- `tests/unit/`, `tests/integration/`: covered by the new requirements.
- beans: follow-up beans for the deferred features.
- No change to the sidebar layout, the counts or the plugin entrypoints.
