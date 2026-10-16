## Context

The sidebar mechanism is in place; see `openspec/specs/plugin-sidebar/spec.md`
and the proposal for this change. This document covers how the tracker data is
read and aggregated, how the section stays current, and how failure is handled.

## Goals / Non-Goals

Goals:

- Read `beans list --json` and derive total, per-status, ready and blocked.
- Keep the counting logic pure and unit testable.
- Refresh after a turn and on a timer.
- Never crash on a missing tracker or a failing command.

Non-Goals:

- Changing how the section is laid out structurally; the helpers are extended,
  not replaced.
- The e2e harness. That is the testing epic.
- Caching across sessions. That is the robustness epic.

## Decisions

### Pure parsing and aggregation in the plugin

`beans.ts` splits into pure functions (`parseBeans`, `aggregate`) and one thin
exec function (`loadStats`). The pure functions take parsed JSON and return the
`Stats` value, so the counting scenarios run under `node:test` without spawning
anything. Only the integration layer spawns the real `beans`.

### One `execFile` per query, no shell

`execFile("beans", ["list", "--json"], { cwd, maxBuffer })` avoids shell
interpolation and quotes the arguments itself. `maxBuffer` is bounded so a
runaway listing cannot exhaust memory. This matches the v2 rule that there is no
`$` helper.

### Ready and blocked are best effort

Ready and blocked come from two extra listings. A failure in either is caught
and the count is simply left out, so the core section still renders. This keeps
the common case (no blockers configured) from turning into an error.

### Refresh on the turn event plus a timer

`session.execution.succeeded` is the precise signal that a turn finished. The
timer is the safety net for a stalled or missing event stream. Both go into the
same disposables bag, so cleanup is one code path.

### `unavailable` as the single failure word

The epic asks for a muted `unavailable` line. One word, one path, used for a
missing binary and a missing tracker alike, so the section never shows a stack
trace or a partial state.

## Risks / Trade-offs

- [Spawning `beans` three times per refresh is wasteful] -> Three short local
  processes once per turn is acceptable for a PoC. If it becomes a problem the
  queries collapse into one GraphQL call, which is a later change.
- [The timer can refresh while a load is in flight] -> Loads are cheap and the
  signal only ever holds the latest result; a stale write is harmless.
- [Ready and blocked semantics depend on the beans version] -> Both are covered
  by integration tests that skip cleanly when `beans` is absent.
