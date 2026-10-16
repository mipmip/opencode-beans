## Context

Motivation is in the proposal. This capability hardens the read path that
`beans-stats` introduced and documents the project for the next developer.

## Goals / Non-Goals

- Goal: no tracker read can hang and no superseded read can overwrite fresh
  stats.
- Goal: a reader can install, develop and test the plugin from `README.md`.
- Goal: deferred features are visible in the tracker.
- Non-Goal: changing the counts, the sidebar layout or the plugin entrypoints.
- Non-Goal: retrying a failed read. The next turn or the fallback timer retries.

## Decisions

### Use the built-in timeout and signal of `execFile`

`node:child_process.execFile` accepts both `timeout` and `signal`. The plugin
passes the timeout, and passes an `AbortSignal` when the caller has one. Using
the built-in support avoids a hand-rolled timer and a `kill` call, and keeps the
process cleanup inside Node.

### Give each refresh its own controller

`setup` keeps the controller of the current read. Starting a refresh aborts the
previous controller before creating a new one, and disposing the plugin aborts
the current one. `loadStats` receives the signal and passes it to `execFile`.

### Treat an aborted read as no state change

When a read is aborted the `catch` returns before touching the signals. The
refresh that superseded it is responsible for the next state. This is what stops
an older read from clobbering a newer one.

### Document install, development and tests in the README

`AGENTS.md` stays the operating manual for the agent. `README.md` becomes the
entry point for a human: install, develop, test and the nix build output.

## Risks / Trade-offs

- [A too-short timeout hides a legitimately slow `beans`] -> The default is
  generous and callers can override it per read.
- [Aborting on every refresh could cancel a read that would have produced the
  newest stats] -> The aborted read belongs to an older refresh by definition;
  the newer refresh reads the same directory and produces fresh stats.
- [Documentation drifts from the scripts] -> A unit test asserts the README
  commands correspond to the scripts the repository exposes.
