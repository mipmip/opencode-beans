# End to end tests

These tests prove the plugin works inside the real OpenCode process, not only in
isolation. They are the acceptance proof for the PoC.

Run them with:

```bash
npm run test:e2e
```

They are not part of `nix flake check`, because they need a real OpenCode
install and a terminal.

## What must be proven

1. The `BEANS` section appears in the sidebar when OpenCode runs in a project
   that has beans.
2. The rendered counts match `beans list --json`: the total and every per-status
   count.
3. The section refreshes after an assistant turn completes.
4. When `.beans/` is missing, or when `beans` fails, the section shows a muted
   "unavailable" line and the TUI keeps running.

## Approach

Each test creates a fixture project in a temporary directory with `beans init`
and a handful of `beans create` calls, then starts OpenCode against it with a
private server (`opencode --standalone`). It drives the TUI through a pseudo
terminal, captures the rendered screen, and asserts on the `BEANS` section.

The fixture project is torn down afterwards. Tests never touch the developer's
own `.beans/`.

The "Testing and e2e proof" epic owns the concrete harness and decides whether
to capture the screen through a pty helper or through OpenCode's renderer test
utilities. The acceptance criteria above are fixed.
