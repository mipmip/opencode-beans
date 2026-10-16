---
# opencode-beans-q4ii
title: Beans data integration
status: completed
type: epic
priority: high
created_at: 2026-10-16T13:45:30Z
updated_at: 2026-10-16T14:05:43Z
parent: opencode-beans-6tzv
---

Goal: read the beans CLI and turn it into the numbers the sidebar shows.

Deliverables:
- Load stats by invoking beans list --json through node:child_process.
- Aggregate the total and the per-status counts.
- Optional ready and blocked counts from beans list --ready and --is-blocked.
- Refresh on session.execution.succeeded and on a fallback timer.
- A clear unavailable state when beans fails or .beans is missing.

Definition of done:
- Counts match beans list --json exactly.
- The section refreshes after an assistant turn.
- Failure degrades to a muted unavailable line instead of crashing.
- Unit and integration tests cover the aggregation and the failure paths.

OpenSpec capability: beans-stats.

## Summary of Changes

The sidebar now shows live Beans numbers.

- New `.opencode/plugins/beans-stats/beans.ts`: `parseBeans` and `aggregate`
  are pure, `loadStats` runs `beans list --json` (plus `--ready` and
  `--is-blocked`) through `node:child_process` with `cwd` and a bounded buffer.
- `layout.ts` `Stats` gained optional `ready` and `blocked`; `summaryLines`
  emits them after the status rows and omits absent counts.
- `tui.tsx` loads stats on setup, after every `session.execution.succeeded`,
  and on a 30s fallback timer; both the subscription and the timer live in the
  disposables bag. Failure degrades to a muted `unavailable` line.
- Tests: unit coverage for aggregation, parsing, failure paths and summary
  lines; integration coverage against a real `beans` fixture. Suite is 43 tests
  green, `npm run typecheck` clean, `nix flake check` and `nix build` pass.
