## Context

The plugin mechanics, the accepted target look and the v2 API surface are in
`BRIEFING.md`; the proposal for this change states what it delivers and why.
This document records the decisions behind the shape of the plugin and how it
is tested without booting OpenCode.

## Goals / Non-Goals

Goals:

- Load as a v2 plugin with no configuration entry.
- Paint a `BEANS` section from a reactive signal.
- Keep layout logic testable as pure functions.
- Unload without leaving listeners or a slot behind.

Non-Goals:

- Reading or aggregating beans data. That is the beans data integration epic.
- Refresh triggers and timers. Also the data integration epic.
- The e2e harness. That is the testing epic.

## Decisions

### Split the entrypoints from the layout

`index.ts` stays a minimal server entrypoint and `tui.tsx` holds the TUI
entrypoint, matching the auto-discovery layout. Layout math lives in a plain
module with no OpenCode imports, so `node:test` can cover it directly. This is
what makes the ordering and bar-scaling scenarios testable at all.

### Render from a signal

The section is a Solid component that reads a stats accessor. The accessor
starts empty and is filled later; the component only knows how to paint a stats
value or a placeholder. That keeps the plugin mechanics independent from how the
stats are produced, and lets the data epic replace the placeholder without
touching the component contract.

### Append to `sidebar.content`

The section is appended to `sidebar.content` rather than `sidebar.footer`
because the section is a content block with several lines, not a one-line
status. The target look in `BRIEFING.md` shows it as the main sidebar block.

### Return a cleanup function

`setup` returns a function that unregisters the slot and disposes what it
created. OpenCode calls it on unload, and tests call it directly to prove the
plugin is safe to reload.

### Placeholder instead of nothing

An empty section reads as a bug. A single muted line says the section is alive
and waiting, and it is the same path the failure state uses. The two states
share one rendering branch.

## Risks / Trade-offs

- [A stale signal leaves the section empty] -> The data epic wires the refresh
  triggers; this change is explicit that it only renders what it is given.
- [Unit tests cannot prove the section really paints] -> The pure helpers cover
  the layout and the e2e epic covers the rendered output in a real OpenCode
  process. This change does not pretend the unit layer proves rendering.
- [Theme tokens are typed loosely] -> The component reads only `context.theme`
  tokens, and a unit test asserts no hard-coded color literal appears in the
  component source.
