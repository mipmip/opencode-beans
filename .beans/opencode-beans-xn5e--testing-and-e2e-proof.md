---
# opencode-beans-xn5e
title: Testing and e2e proof
status: completed
type: epic
priority: high
created_at: 2026-10-16T13:45:30Z
updated_at: 2026-10-16T14:19:50Z
parent: opencode-beans-6tzv
---

Goal: prove the PoC works with thorough automated tests.

Deliverables:
- Unit tests for aggregation, formatting and error mapping.
- Integration tests against a real beans fixture project.
- An e2e harness that boots OpenCode against a fixture and asserts the sidebar.
- One test per acceptance criterion in AGENTS.md.

Definition of done:
- npm test and npm run test:e2e pass.
- nix flake check stays green.
- Every acceptance criterion has a test that fails if the criterion regresses.

OpenSpec capability: testing.

## Summary of Changes

Added the end to end proof for the PoC (change `testing-and-e2e-proof`,
capability `testing`).

- `e2e/helpers/project.ts` builds a temporary fixture project with `beans init`
  and `beans create`, copies the plugin and symlinks `node_modules`.
- `e2e/helpers/env.ts` isolates each run with a temporary HOME and XDG
  directories and reports the skip reasons.
- `e2e/helpers/session.ts` imports a canned session so the sidebar renders
  without a model or network access.
- `e2e/helpers/pty.py` runs OpenCode in a fixed-size pseudo terminal; it is
  stdlib-only and added as `python3` to the dev shell.
- `e2e/helpers/screen.ts` reconstructs the final screen and locates the sidebar
  by the `BEANS` header column.
- `e2e/beans-sidebar.test.ts` proves the total and every per-status count match
  `beans list --json`.
- `e2e/beans-degraded.test.ts` proves the muted `unavailable` line appears and
  no total is shown when there is no tracker.
- `tests/unit/screen.test.ts` and `tests/unit/pty-helper.test.ts` cover the
  harness.

Acceptance criterion mapping: appears = `e2e/beans-sidebar.test.ts`; counts =
`e2e/beans-sidebar.test.ts` plus the aggregation tests; refresh =
`tests/unit/plugin-wiring.test.ts` (subscription and timer); degrade =
`e2e/beans-degraded.test.ts` plus the failure unit tests; flake check =
`nix flake check`; suites = `npm test` and `npm run test:e2e`.

Verified: 51 unit and integration tests pass, 2 end to end tests pass,
`nix flake check` passes, `npm run typecheck` is clean.
