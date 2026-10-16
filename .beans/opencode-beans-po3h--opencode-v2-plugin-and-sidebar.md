---
# opencode-beans-po3h
title: OpenCode v2 plugin and sidebar
status: todo
type: epic
priority: high
created_at: 2026-10-16T13:45:30Z
updated_at: 2026-10-16T13:45:30Z
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
