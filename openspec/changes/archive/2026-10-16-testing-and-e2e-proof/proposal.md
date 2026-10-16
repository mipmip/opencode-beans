## Why

The PoC is only trustworthy when its acceptance criteria are checked by machine,
not by eye. Today the suites cover pure logic and the beans CLI, but nothing
proves the sidebar renders inside the real OpenCode process, and there is no
single test that fails when one of the acceptance criteria regresses.

Epic bean: `opencode-beans-xn5e`.

## What Changes

- Add an end to end harness that boots the real `opencode --standalone` TUI in a
  pseudo terminal against a temporary fixture project and captures the rendered
  screen.
- Add a terminal screen emulator so assertions are made against the final frame
  rather than a raw byte stream.
- Add fixture tooling: a beans project, a copy of the plugin, and a canned
  OpenCode session that is imported so the session sidebar renders without a
  model or network access.
- Add an end to end test that proves the `BEANS` section appears with the total
  and every per-status count that `beans list --json` reports.
- Add an end to end test that proves the section degrades to the muted
  `unavailable` line when the project has no beans tracker.
- Keep one failing-if-regressed test per acceptance criterion, mapping each
  criterion to a concrete test file.

The user-visible outcome: `npm test` and `npm run test:e2e` together prove every
acceptance criterion in `AGENTS.md` section 1.

## Capabilities

### New Capabilities

- `testing`: the automated proof that the sidebar plugin renders the right
  beans counts, refreshes, and degrades gracefully, across unit, integration and
  end to end layers.

### Modified Capabilities

## Impact

- New `e2e/helpers/` modules and end to end tests under `e2e/`.
- `e2e/README.md` gains the concrete harness description.
- `nix/devshell.nix` gains `python3`, which the pseudo terminal helper uses.
- `package.json` `test:e2e` already covers the new tests.
- No change to plugin behavior or to the beans data source.
