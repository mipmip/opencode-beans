---
# opencode-beans-qcq9
title: Sidebar session panel with the full breakdown
status: completed
type: epic
priority: normal
created_at: 2026-10-16T14:25:17Z
updated_at: 2026-10-16T14:32:38Z
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

## Summary of Changes

Added a BEANS session panel with the full breakdown and the command that opens it.

- parseBeans now carries a bean type when it is a string, and aggregate counts beans by type alongside status.
- TypeCount, Stats.byType, typeRows and the shared bars helper live in layout.ts; the sidebar renders through bars too.
- PANEL_NAME, PANEL_COMMAND_ID and panelCommand(open) live in setup.ts; tui.tsx claims the session.panel slot gated on the panel name and registers the command in context.keymap.layer.
- The command id is beans.stats.panel with default binding <leader>d, overridable from cli.json.
- Tests: per-type aggregation, parse type passthrough and omission, typeRows ordering and ties, bars scaling, panelCommand behaviour, and wiring guards for the slot gate and the keymap layer.
- Proof: npm test 82 pass, npm run typecheck clean, nix flake check all checks passed, npm run test:e2e 2 pass.
- OpenSpec change sidebar-session-panel-with-the-full-breakdown archived; specs session-panel (new) and beans-stats (modified) synced; openspec validate --specs 6 passed.
