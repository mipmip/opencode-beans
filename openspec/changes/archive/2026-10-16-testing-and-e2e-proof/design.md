## Context

The motivation, the acceptance criteria and the epic link live in
`proposal.md`. This document records the decisions that make the end to end
proof practical, because the area is the least obvious part of the PoC.

## Goals / Non-Goals

- Goal: a deterministic, offline end to end test that shows the real `BEANS`
  sidebar section with counts that match `beans list --json`.
- Goal: a second end to end test that shows the muted `unavailable` line.
- Goal: assertions on the rendered screen, not on a raw byte stream.
- Non-goal: proving the full assistant turn loop with a live model. That needs
  network access and a provider, so the refresh criterion is covered by wiring
  tests instead.
- Non-goal: full terminal emulation. The emulator supports the subset OpenCode
  emits.

## Decisions

### Prefer a pseudo terminal over a native dependency

Node has no built in pseudo terminal, and a native module such as `node-pty`
would need a toolchain in the flake. The harness uses `python3` and its `pty`
module instead, which ships with the host and with `nix develop`. The helper
allocates the terminal, sets a fixed size, runs the command and returns the raw
output. `nix/devshell.nix` gains `python3` for this.

### Reconstruct the final screen before asserting

OpenCode redraws with cursor positioning, so a substring search over the raw
bytes is unreliable. A small terminal emulator in the harness applies cursor
positioning, clearing and printing, and returns the final screen as text. The
emulator handles the control sequences OpenCode actually emits and ignores the
rest.

### Locate the sidebar column instead of trusting a full screen search

The string `unavailable` also appears in the model status line, which would make
a degraded assertion pass for the wrong reason. Assertions first find the column
of the `BEANS` header and then read only from that column to the right edge. The
degraded test additionally asserts that the sidebar region does not contain a
total.

### Render a session without a model by importing a canned session

The sidebar sits in the session view. To avoid a provider and network access,
the harness writes a minimal session document with one user and one assistant
message and imports it with `opencode session import --standalone --directory
<fixture>`. The TUI then opens that session and renders the sidebar. The
assistant model is a placeholder, because a mock model shows `unavailable` in
the status line, which is far from the sidebar region.

### Isolate the fixture from the developer

Each run creates a temporary project directory, a temporary `HOME`, and
temporary `XDG_DATA_HOME`, `XDG_CONFIG_HOME` and `XDG_CACHE_HOME`. `beans init`
and `beans create` populate the tracker. The plugin directory is copied into
`.opencode/plugins/beans-stats`, and a `node_modules` symlink to the repository
lets the plugin resolve `@opencode/plugin` and `solid-js`. The developer's own
beans and OpenCode data are never touched, and the private server avoids the
shared background service.

### Capture with a timeout instead of a clean quit

Driving the quit keybind is fragile. The harness captures for a fixed window and
then terminates the process group. This is stable and still proves the render.

## Risks / Trade-offs

- [The TUI layout changes between OpenCode versions, so fixed screen positions
  break] -> Assertions anchor on the `BEANS` header column at runtime and use a
  generous terminal size, rather than assuming absolute coordinates.
- [The terminal emulator may miss a control sequence] -> It implements the
  sequences OpenCode emits, verified against a captured session, and ignores
  unknown ones rather than crashing.
- [A required external tool is missing] -> Every end to end test checks for
  OpenCode, `python3` and the plugin dependencies and skips cleanly.
- [The canned session format changes between versions] -> The harness asserts on
  the sidebar region only; if the session fails to render, the test fails loudly
  instead of passing on a partial screen.
- [The refresh criterion has no end to end test] -> The wiring tests fail if the
  `session.execution.succeeded` subscription or the interval is removed, which
  is the behavior that regresses in practice.
