# opencode-beans

OpenCode v2 plugin that shows [Beans](https://github.com/hmans/beans) issue
statistics in the sidebar of the OpenCode TUI.

The plugin lives at `.opencode/plugins/beans-stats/` and is discovered
automatically when OpenCode runs in this directory.

## Status

PoC in progress. The roadmap lives in beans (milestones and epics) and the work
inside each epic lives in OpenSpec changes.

## Prerequisites

`beans`, `openspec` and `jj` must be on `PATH`. Node 24 and the rest of the
toolchain come from the nix flake.

## Development

```bash
nix develop          # working environment
nix flake check      # unit and integration tests, pure sandbox
nix build            # assembled plugin
npm test             # unit and integration tests
npm run test:e2e     # end to end tests
npm run typecheck    # TypeScript
```

## How work is organised

- Milestones and epics: beans. Milestone titles start with `01`, `02`, ...
- Epic internals: OpenSpec. One change per epic.
- Version control: jj, committed as Pim Snel.

See `AGENTS.md` for the full operating manual and `BRIEFING.md` for the product
goal.
