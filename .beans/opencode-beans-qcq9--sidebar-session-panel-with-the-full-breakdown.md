---
# opencode-beans-qcq9
title: Sidebar session panel with the full breakdown
status: todo
type: epic
priority: normal
created_at: 2026-10-16T14:25:17Z
updated_at: 2026-10-16T14:25:17Z
parent: opencode-beans-flf3
---

Goal: let a reader open a panel that shows the full by-status and by-type breakdown, with the bar chart, from the sidebar.

Deliverables:
- A session.panel surface rendering the full breakdown.
- A keybound command that opens it, via context.keymap.layer.

Definition of done:
- The panel opens from a keybind and shows per-status and per-type counts.
- A test covers the aggregation and the keybinding wiring.

Deferred from the PoC because the sidebar slot already proves the data path and the panel is a larger UI surface.

OpenSpec capability: session-panel.
