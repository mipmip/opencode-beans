## Context

The plugin already aggregates per-status counts from `beans list --json` and
renders them in the `sidebar.content` slot. `Stats` and the layout helpers are
pure and unit tested. See proposal.md for motivation.

## Goals / Non-Goals

**Goals:**

- Add a per-type dimension to the existing aggregation without a second read of
  the tracker.
- Add a `session.panel` surface that reuses the same signals, failure state and
  bar helpers as the sidebar.
- Open the panel from a command in the plugin's own keymap layer.

**Non-Goals:**

- A new data source or a second `beans` invocation for types.
- Changing the sidebar's shape.
- Live focus and input handling inside the panel. The host owns panel layout and
  input scope.

## Decisions

- Add `byType` to `Stats` as an optional field and always populate it in
  `aggregate`, so the sidebar keeps working with the smaller shape and the panel
  reads the extra field. Alternative: a separate `loadBreakdown`, rejected
  because it would read the tracker twice and could disagree with the sidebar.
- Read the type in `parseBeans` and keep it only when it is a string, matching
  how `status` is validated. A bean without a type leaves the per-type map and
  stays in the total.
- Gate the panel claim on `input.name === PANEL_NAME`. The slot's `PanelInput`
  carries the name set by `ui.panel.open` and each contribution decides whether
  to render, so the gate keeps the plugin from drawing over another plugin's
  panel.
- Open the panel through `context.ui.panel.open(PANEL_NAME)`, reached from a
  `context.keymap.layer` command with a stable id (`beans.stats.panel`) so a
  reader can rebind it in `cli.json`, and a default binding of `<leader>d`.
- Extract `bars(entries)` as a pure helper so the sidebar and the panel scale
  bars the same way, instead of repeating the max computation.

## Risks / Trade-offs

- [The default binding `<leader>d` could collide with a host default] -> The
  command id is stable and overridable, and the layer is scoped to the plugin,
  so a collision is a config change rather than a code change.
- [The panel claim renders for a session the reader did not open it in] -> The
  gate on `input.name` plus the host's per-plugin `ui.panel.current` keep the
  panel bound to the plugin that opened it.
- [A bean whose type is missing changes the per-type total] -> Per-type entries
  are skipped rather than bucketed under a made-up name, and the total still
  counts the bean.
