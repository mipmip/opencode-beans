## 1. Fixture tooling

- [x] 1.1 Add `e2e/helpers/project.ts` that creates a temporary fixture project, runs `beans init` and `beans create`, copies `.opencode/plugins/beans-stats`, and symlinks `node_modules` from the repository. Verify with a small run in the end to end test.
- [x] 1.2 Add `e2e/helpers/session.ts` that writes the canned session document and imports it with `opencode session import --standalone`. Verify that the imported session is listed after import.
- [x] 1.3 Add `e2e/helpers/env.ts` that builds the isolated environment (temporary `HOME` and XDG directories) and detects whether OpenCode, `python3` and the plugin dependencies are available. Verify the detection returns false for an empty `PATH`.

## 2. Pseudo terminal and screen emulator

- [x] 2.1 Add `e2e/helpers/pty.py`, a stdlib-only helper that allocates a pseudo terminal, sets the size, runs a command in a directory and prints the captured output. Verify by running it against a command that prints text.
- [x] 2.2 Add `e2e/helpers/pty.ts` that spawns the helper and returns the capture. Verify with a unit test that runs the helper against `echo`.
- [x] 2.3 Add `e2e/helpers/screen.ts`, a terminal emulator that returns the final screen as lines. Verify with unit tests covering cursor positioning, clearing and plain text.

## 3. End to end sidebar tests

- [x] 3.1 Add `e2e/beans-sidebar.test.ts` that boots OpenCode against a beans fixture, finds the `BEANS` column, and asserts the total and every per-status count match `beans list --json`. Verify by running `npm run test:e2e`.
- [x] 3.2 Add `e2e/beans-degraded.test.ts` that boots OpenCode against a fixture without `.beans` and asserts the muted `unavailable` line in the sidebar region and no total. Verify by running `npm run test:e2e`.

## 4. Acceptance criterion map and docs

- [x] 4.1 Update `e2e/README.md` to describe the concrete harness, the pseudo terminal helper, the screen emulator, the canned session and the skip conditions. Verify by reading the file.
- [x] 4.2 Add `tests/unit/screen.test.ts` and any harness unit tests so the emulator and helper logic have unit coverage. Verify with `npm test`.

## 5. Verification

- [x] 5.1 Run `npm test` and confirm the unit and integration suites pass.
- [x] 5.2 Run `npm run test:e2e` and confirm both end to end suites pass against a real OpenCode install.
- [x] 5.3 Run `nix flake check` and `npm run typecheck` and confirm both are green.
- [x] 5.4 Confirm every acceptance criterion in `AGENTS.md` section 1 maps to a concrete test and note the mapping in the epic summary.
