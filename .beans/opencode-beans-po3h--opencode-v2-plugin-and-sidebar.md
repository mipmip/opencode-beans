---
# opencode-beans-po3h
title: OpenCode v2 plugin and sidebar
status: completed
type: epic
priority: high
created_at: 2026-10-16T13:45:30Z
updated_at: 2026-10-16T14:00:38Z
parent: opencode-beans-6tzv
---

Goal: load a v2 plugin in OpenCode and render the BEANS sidebar section.

Deliverables:
- .opencode/plugins/beans-stats/index.ts server entrypoint.
- .opencode/plugins/beans-stats/tui.tsx registering the sidebar.content slot.
- A Solid component that renders the section from a reactive stats signal.
- Cleanup of the slot and every listener on unload.

Definition of done:
- OpenCode discovers the plugin without an opencode.jsonc entry.
- The BEANS section is visible in the sidebar.
- No V1 plugin syntax is used.
- The rendering is covered by the e2e proof.

OpenSpec capability: plugin-sidebar.

## Summary of Changes

Implemented the OpenCode v2 plugin wiring and the sidebar section.

- `.opencode/plugins/beans-stats/index.ts` is the minimal v2 server entrypoint.
- `tui.tsx` claims `sidebar.content`, renders the BEANS section from Solid
  signals, falls back to a single muted placeholder line, and returns a cleanup
  that disposes the slot.
- `layout.ts` holds the pure layout helpers (ordering, bar scaling, total label).
- `setup.ts` holds the disposables bag and `registerSidebar`.
- New unit tests: `layout-rows`, `sidebar-registration`, `plugin-wiring`,
  `theme-usage`. Suite is 25 tests green, `npm run typecheck` clean,
  `nix flake check` and `nix build` pass, `opencode plugin list` reports
  `beans.stats`.
