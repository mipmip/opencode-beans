## Why

The sidebar section currently renders a placeholder. It has to show the real
numbers from the Beans issue tracker: the total, the per-status counts, and the
ready and blocked counts. This change is what makes the section useful, and the
resilience story (missing `.beans/`, failing `beans`, slow `beans`) belongs with
it.

Epic bean: `opencode-beans-q4ii` ("Beans data integration").

## What Changes

- New `beans.ts` module that runs `beans list --json` through
  `node:child_process` and turns the output into a stats value.
- Pure parsing and aggregation helpers, so the counting logic is testable
  without spawning `beans`.
- Ready and blocked counts from `beans list --ready --json` and
  `beans list --is-blocked --json`.
- The sidebar renders the ready and blocked counts alongside the total and the
  per-status rows.
- Refresh after every assistant turn via
  `context.data.on("session.execution.succeeded", ...)`, plus a fallback timer.
- A single muted `unavailable` line when `beans` fails or `.beans/` is missing.

## Capabilities

### New Capabilities

- `beans-stats`: reads the Beans ticker for the current directory, aggregates
  total, per-status, ready and blocked counts, and degrades to an unavailable
  state instead of crashing.

### Modified Capabilities

- `plugin-sidebar`: the sidebar section also renders the ready and blocked
  counts, and refreshes from the data layer.

## Impact

- New `.opencode/plugins/beans-stats/beans.ts` plus `layout.ts` gaining the
  ready and blocked fields.
- `tui.tsx` gains the refresh wiring and the live stats signal.
- `tests/unit/` gains aggregation and failure-path coverage;
  `tests/integration/` gains a real-`beans` aggregation test.
- No new dependencies. Node builtins only.
