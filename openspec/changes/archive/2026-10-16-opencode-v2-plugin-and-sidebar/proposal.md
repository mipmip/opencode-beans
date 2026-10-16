## Why

The PoC must prove that an OpenCode v2 plugin can be discovered in this project
and paint a `BEANS` section into the sidebar. That is the load-bearing platform
integration: without a loaded plugin and a working slot, the beans data and the
rest of the roadmap have nowhere to go. This change builds that integration and
keeps the data itself out of scope, so the plugin mechanics can be tested on
their own.

Epic bean: `opencode-beans-po3h` ("OpenCode v2 plugin and sidebar").

## What Changes

The plugin under `.opencode/plugins/beans-stats/` grows from a stub into a real
v2 plugin:

- `index.ts` stays the minimal server entrypoint.
- `tui.tsx` registers the `sidebar.content` slot, owns the sidebar signals and
  renders the `BEANS` section from them.
- Pure formatting helpers move into a separate module so the section layout can
  be unit tested without booting OpenCode.
- The section degrades to a muted placeholder line when there is no data yet or
  when loading failed.

The stats are supplied to the component through a signal. How those stats are
computed from `beans list --json` is the next epic; this change wires a
placeholder that resolves to an empty state.

## Capabilities

### New Capabilities

- `plugin-sidebar`: auto-discovered OpenCode v2 plugin that appends a `BEANS`
  section to the sidebar, renders it from a reactive signal, and cleans up its
  slot and listeners on unload.

### Modified Capabilities

<!-- none: no existing spec-level behavior changes -->

## Impact

- `.opencode/plugins/beans-stats/index.ts`, `tui.tsx`, and new helper modules.
- `tests/unit/` grows coverage for the pure helpers and the plugin wiring.
- No new dependencies. No `opencode.jsonc` entry is needed, by design.
- Does not yet read beans; the placeholder keeps the section honest until the
  data integration epic lands.
