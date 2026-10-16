# End to end tests

These tests prove the plugin works inside the real OpenCode process, not only in
isolation. They are the acceptance proof for the PoC.

```bash
npm run test:e2e
```

They are not part of `nix flake check`, because they need a real OpenCode
install and a terminal.

## What is proven

1. The `BEANS` section appears in the sidebar when OpenCode runs in a project
   that has beans (`e2e/beans-sidebar.test.ts`).
2. The rendered total and every per-status count match `beans list --json`.
3. The plugin refreshes after a real assistant turn. The case starts a turn,
   adds a bean while the turn is held open, and asserts the rendered counts
   change (`e2e/beans-live-refresh.test.ts`). The wiring tests in
   `tests/unit/plugin-wiring` still cover the subscription and the timer.
4. When `.beans/` is missing, the section shows the muted `unavailable` line and
   the TUI keeps running (`e2e/beans-degraded.test.ts`).
5. `nix flake check` stays green.

## How the harness works

Each test creates a temporary fixture project and runs OpenCode against it.

- `helpers/project.ts` makes the fixture: `beans init` and `beans create`, a
  copy of `.opencode/plugins/beans-stats`, and a `node_modules` symlink so the
  plugin can resolve `@opencode/plugin` and `solid-js`. The tracker step is
  skipped for the degraded test.
- `helpers/env.ts` isolates the run with a temporary `HOME` and temporary
  `XDG_DATA_HOME`, `XDG_CONFIG_HOME` and `XDG_CACHE_HOME`, so the developer's
  own beans and OpenCode data are untouched and no global plugins load.
- `helpers/session.ts` writes a canned session with one user and one assistant
  message and imports it with `opencode session import --standalone`. This puts
  the TUI in the session view, where the sidebar lives, without needing a model
  or network access.
- `helpers/mock-provider.ts` serves a local OpenAI compatible provider for the
  live refresh case. It needs no package install and no network, and it holds
  the assistant message until the case releases it so the order of the turn and
  the tracker change is deterministic. The fixture writes the matching provider
  config into `opencode.jsonc` (`helpers/project.ts`).
- `helpers/pty.py` runs `opencode --standalone` inside a pseudo terminal of a
  fixed size. Node has no built in pseudo terminal, so the helper uses the
  Python standard library. It is available on the host and in `nix develop`.
- `helpers/screen.ts` reconstructs the final screen from the captured terminal
  output, because OpenCode redraws with cursor positioning. Assertions run
  against the screen and are limited to the sidebar region, located by the
  `BEANS` header column.

The tests skip cleanly when `opencode`, `python3` or the plugin dependencies are
missing, so a checkout without an OpenCode install still passes. The live
refresh case also skips when its local provider cannot start.
