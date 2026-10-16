---
# opencode-beans-lpip
title: Robustness, packaging and docs
status: completed
type: epic
priority: normal
created_at: 2026-10-16T13:45:30Z
updated_at: 2026-10-16T14:25:02Z
parent: opencode-beans-6tzv
---

Goal: make the alpha base safe to build on.

Deliverables:
- A timeout and cancellation for the beans call.
- Documented install, development and test flow in README.
- A packaged plugin output through nix.
- Follow-up beans for deferred work.

Definition of done:
- No unhandled rejection or crash in any failure path.
- README covers install, development and tests.
- nix build output is documented.
- Follow-up beans are created for deferred work.

OpenSpec capability: robustness.

## Summary of Changes

- Tracker reads are bounded: `beans.ts` gained `DEFAULT_TIMEOUT_MS` (5000) and a `LoadOptions` with an optional `timeoutMs` and `AbortSignal`, forwarded to `execFile`.
- Reads are cancellable: `createBeanReader(exec)` builds the reader around an injectable exec, and every read (main, ready, blocked) carries the signal.
- `refresh.ts` gained `createRefresher`, which aborts the read in flight when a new refresh starts and on dispose, and ignores the outcome of an aborted read so a superseded read cannot overwrite newer stats.
- `tui.tsx` now drives the sidebar through the refresher and disposes it with the bag.
- `README.md` documents install, development, the test suites and the `nix build` output at `result/plugins/beans-stats/`.
- New unit tests: `beans-reader` (timeout, signal, failure mapping), `refresh` (cancellation, dispose, error), `readme` (documented commands exist).
- Deferred work recorded as beans under milestone 02.
- Verified: `npm test` 68 pass, `npm run test:e2e` 2 pass, `npm run typecheck` clean, `nix flake check` green, `nix build` produces the six plugin files.
