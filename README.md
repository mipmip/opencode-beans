# opencode-beans

OpenCode v2 plugin that shows [Beans](https://github.com/hmans/beans) issue
statistics in the sidebar of the OpenCode TUI.

```
BEANS
42 total

todo           18  ████
in-progress     6  █▌
completed       2  ▌

ready          11
blocked         3
```

The section refreshes after every assistant turn and on a fallback timer. When
`.beans/` is missing or `beans` fails it shows a muted `unavailable` line
instead of crashing.

## Prerequisites

`beans`, `openspec` and `jj` must be on `PATH`. Everything else comes from the
nix flake.

## Install

The plugin is discovered automatically from a project's
`.opencode/plugins/<name>/` directory. To use it in a project:

1. Make sure that project has been initialized with `beans init`, so `.beans/`
   and `.beans.yml` exist at its root.
2. Copy the plugin directory into the project:

   ```bash
   mkdir -p .opencode/plugins
   cp -r /path/to/opencode-beans/.opencode/plugins/beans-stats .opencode/plugins/
   ```

3. Start OpenCode in that project. Confirm the plugin loaded:

   ```bash
   opencode plugin list
   ```

The assembled plugin is also available from `nix build`, see [Build](#build).

## Development

```bash
nix develop          # working environment: Node 24, python3, jujutsu, nixfmt
npm install          # dependencies for the tests and the type check
```

## Testing

```bash
npm test             # unit and integration tests
npm run test:e2e     # end to end tests against the real OpenCode terminal
npm run typecheck    # TypeScript
nix flake check      # unit and integration tests in a pure sandbox
```

The unit tests are pure logic. The integration tests run the real `beans` CLI
against a temporary fixture project and skip when `beans` is not available. The
end to end tests boot OpenCode against a fixture project in a pseudo terminal
and assert the rendered sidebar; they skip when their prerequisites are absent.
See `e2e/README.md` for the harness.

## Build

```bash
nix build
```

The plugin files are then at `result/plugins/beans-stats/` (`index.ts`,
`tui.tsx`, `beans.ts`, `layout.ts`, `refresh.ts`, `setup.ts`).

## How work is organised

- Milestones and epics: beans. Milestone titles start with `01`, `02`, ...
- Epic internals: OpenSpec. One change per epic.
- Version control: jj, committed as Pim Snel.

See `AGENTS.md` for the full operating manual and `BRIEFING.md` for the product
goal.
