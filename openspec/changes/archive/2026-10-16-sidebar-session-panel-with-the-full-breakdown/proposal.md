## Why

Epic bean `opencode-beans-qcq9`. The sidebar proves the data path with a compact
per-status list, but a reader who wants the whole picture has nowhere to look:
the per-type split and the bar chart for every group never reach the screen. The
PoC shipped with this surface deferred, and the panel is the natural next step.

## What Changes

- Aggregate per-type counts next to the per-status counts, from the same
  `beans list --json` read.
- Add a `BEANS` session panel that shows the per-status and per-type breakdown
  with the bar chart.
- Register a command in the plugin's own keymap layer that opens the panel, with
  a default binding and an overridable command id.

## Capabilities

### New Capabilities

- `session-panel`: a session panel with the full beans breakdown and the
  command that opens it.

### Modified Capabilities

- `beans-stats`: the aggregation also counts beans by type.

## Impact

`.opencode/plugins/beans-stats/` gains a panel component and a command, and the
aggregate gains a per-type dimension. The sidebar keeps its current shape. No
new dependency, no change to how beans is invoked.
