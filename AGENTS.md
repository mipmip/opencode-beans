# AGENTS.md

Operating manual for coding agents in this repository. It is written for Claude
Code, which builds this project autonomously from the roadmap in section 4.

The product goal and the exact target look live in `BRIEFING.md`. Read it once,
then work from this file and from the OpenSpec change you are implementing.

## 0. Start of every session

Run these first, in order:

```bash
beans prime
beans list --json --ready
beans list --json -t epic
openspec context --json
```

Use beans for all work tracking. Do not use TodoWrite, and do not keep task
lists anywhere else.

## 1. What we are building

A project-local OpenCode v2 CLI/TUI plugin that renders a sidebar section with
Beans issue tracker statistics for the current project directory. The target
look is in `BRIEFING.md`.

The PoC is the alpha base for later development, so it must be correct, tested
and packaged from the start.

Acceptance criteria for the PoC:

- A `BEANS` section appears in the OpenCode sidebar for a project.
- Counts match `beans list --json`: total and per status.
- The section refreshes after each assistant turn.
- The plugin does not crash when `.beans/` is missing or when `beans` fails. It
  shows a muted "unavailable" line instead.
- `nix flake check` passes for every supported system.
- The unit, integration and e2e suites described in section 7 pass.

## 2. Toolchain

| Concern        | Tool                                   |
| -------------- | -------------------------------------- |
| Version control| jj (colocated with git)                |
| Issues         | beans (milestones and epics)           |
| Planning       | OpenSpec (one change per epic)         |
| Build and dev  | nix flakes, plain nix, no flake-utils  |
| Runtime        | OpenCode v2, Node 24                   |

`beans`, `openspec` and `jj` are expected on `PATH`. They are provided by the
host system, not by the flake. Everything else comes from `nix develop`.

## 3. Version control with jj

- Author every commit as `Pim Snel <post@pimsnel.com>`. This is already set in
  the jj config.
- Never add self-promotion or attribution trailers: no `Co-authored-by`,
  no `Co-Authored-By`, no `Generated with ...`, no mention of Claude, Anthropic
  or any agent.
- Commit after every OpenSpec archive. One commit per archive is the default and
  must contain both the code and the beans/OpenSpec bookkeeping files.
- Use the commit form `jj commit -m "<type>: <summary>"`, where `<type>` is one
  of `feat`, `fix`, `test`, `docs`, `build`, `chore`, `spec`. Example:

  ```bash
  jj commit -m "feat: render beans status counts in the sidebar"
  ```

- Do not push. Pim pushes when he wants to.
- Keep `.jj` out of git. It is already ignored.

## 4. Issues, milestones and epics (beans)

beans holds the roadmap. Milestones group epics, epics group the work that one
OpenSpec change delivers.

Rules:

- A milestone title starts with a two digit counter and a space: `01`, `02`,
  and so on. The counter increases by one per milestone. Never reuse or renumber
  a milestone.
- Every epic is a bean of type `epic` with `--parent <milestone-id>`.
- Work is never done directly on a milestone or an epic bean. The epic is a
  container. The actual tasks live in its OpenSpec change.
- One OpenSpec change per epic. The change name is the epic's kebab-case name.
- The agent administers milestones and epics: creating the next milestone when
  the current one is complete, adjusting epics when scope changes, and recording
  deferred work as new beans.

Finding the work:

```bash
beans list --json -t milestone
beans list --json -t epic
beans list --json --ready
beans list --json --parent <epic-id>
beans show --json <id>
```

Lifecycle of an epic bean:

1. `todo` while waiting.
2. `in-progress` when its OpenSpec change has been created.
3. `completed` after the change is archived and committed, with a
   `## Summary of Changes` section added to the bean body.
4. `scrapped` with a `## Reasons for Scrapping` section if it is dropped.

When every epic of a milestone is `completed` or `scrapped`, mark the milestone
`completed` and create the next numbered milestone.

## 5. Planning with OpenSpec

OpenSpec owns everything inside an epic: proposal, specs, design and tasks.

Workflow for one epic:

```bash
openspec new change "<epic-kebab-name>"
openspec status --change "<epic-kebab-name>" --json
openspec instructions <artifact> --change "<epic-kebab-name>" --json
# write every required artifact (proposal, specs, design, tasks)
openspec status --change "<epic-kebab-name>"
```

Then implement with the apply workflow, and finish with the archive workflow.
Use the skills and commands under `.claude/` (`openspec-propose`,
`openspec-apply-change`, `openspec-archive-change`) with their instructions as
the source of truth. Do not hand-roll the OpenSpec structure.

Rules:

- Planning and implementation are separate steps. Do not implement during the
  propose workflow.
- The change must name the epic bean id in its proposal so the two stay linked.
- Every task that changes behavior must come with a test task in the same
  change. A change is not done while any task is unchecked.
- After archiving, sync the delta specs into the main specs, then commit
  everything with jj (section 3).
- `openspec/config.yaml` carries the project context and rules. Keep it current
  when conventions change.

## 6. The autonomous build loop

Repeat until the current milestone has no open epics:

1. Pick the next `todo` epic under the current milestone, highest priority
   first, then lowest bean id.
2. Mark it `in-progress`.
3. Create its OpenSpec change and generate every required artifact
   (section 5).
4. Implement the change. Follow the tasks in order.
5. Run the full test suite. Do not move on with a red suite.
6. Archive the change and sync the specs.
7. Update the epic bean: check off todo items, add `## Summary of Changes`, set
   `completed`.
8. Commit code plus beans and OpenSpec files with jj as Pim Snel.
9. If the milestone is complete, complete it and create the next numbered
   milestone with its epics.

Stop and ask Pim when scope, acceptance criteria or an external dependency is
unclear, or when a task would need work beyond what the spec describes.

## 7. Testing

Testing is a first class deliverable, not an afterthought. Three layers:

1. Unit tests, `tests/unit/`. Pure logic only: JSON parsing, status and type
   aggregation, formatting, bar scaling, error mapping. No processes, no
   network. Run with `node --test tests/`.
2. Integration tests, `tests/integration/`. Run the real `beans` CLI against a
   temporary fixture project created with `beans init` and `beans create`, then
   assert the stats the plugin would compute. Skip cleanly when `beans` is not
   available.
3. End to end tests, `e2e/`. Prove the plugin works in the real OpenCode
   process: boot OpenCode against a fixture project, confirm the `BEANS` section
   renders with the correct counts, confirm it refreshes, and confirm it
   degrades to the muted "unavailable" line when the data source is broken. See
   `e2e/README.md`.

Commands:

```bash
npm test          # unit and integration
npm run test:e2e  # end to end
nix flake check   # unit and integration, in a pure sandbox
npm run typecheck # TypeScript, after npm install
```

Rules:

- The test runner is the built in `node:test`. Prefer it over adding a
  dependency. Tests are TypeScript and run through Node's type stripping.
- Every acceptance criterion in section 1 needs at least one test that would
  fail if the criterion regressed.
- Fixtures are created in a temporary directory and cleaned up. Tests never
  write into the repository and never depend on the developer's own `.beans/`.
- `nix flake check` must stay green and must not need network access.

## 8. Nix

- Plain nix flakes. Do not add `flake-utils` or any system abstraction input.
  Supported systems are listed explicitly in `flake.nix` and merged with
  `nixpkgs.lib.genAttrs`.
- Supported systems: `x86_64-linux`, `aarch64-linux`, `x86_64-darwin`,
  `aarch64-darwin`.
- Every output is defined for every supported system: `devShells.default`,
  `packages.default`, `checks.default` and `formatter`.
- `nix flake check` must pass on the current system before a change is archived.
- `nix develop` gives the working environment. It must contain Node 24 and the
  tools needed to build and test the plugin.

```bash
nix develop
nix flake check
nix build
```

## 9. OpenCode v2 plugin facts

These are fixed by the platform. Do not use V1 syntax.

- V1 used the singular `plugin` field and `@opencode-ai/plugin`. V2 uses the
  plural `plugins` field and `@opencode/plugin`. The TUI entrypoint imports
  `@opencode/plugin/tui`.
- The plugin lives in `.opencode/plugins/beans-stats/` with `index.ts` as the
  server entrypoint and `tui.tsx` as the TUI entrypoint. Auto-discovery needs no
  `opencode.jsonc` entry.
- The sidebar slot is `context.ui.slot({ append: "sidebar.content", render })`.
  The other sidebar slot is `sidebar.footer`. Other slots include
  `session.panel`, which is where a full breakdown panel belongs.
- JSX uses OpenTUI primitives (`box`, `text`) with theme tokens from
  `context.theme`. Reactivity is Solid: `createSignal`, `For`, `Show`.
- Inside components, get the context with `usePlugin()`.
- The current directory is
  `(context.location ?? context.data.location.default()).directory`.
- React to turns with `context.data.on("session.execution.succeeded", cb)`,
  which returns an unsubscribe function. Return a cleanup function from `setup`.
- There is no `$` shell helper in V2. Shell out with `node:child_process`.

Data source:

- `beans list --json` returns a flat JSON array of beans with `id`, `title`,
  `status`, `type`, `priority`, `tags`, relations and timestamps.
- `beans list --ready --json` and `beans list --is-blocked --json` give the
  actionable and blocked sets.
- Also available: `beans graphql '<query>'`, `beans roadmap`, `beans progress`,
  `beans show <id>`.

Pick up changes with `opencode service restart`, or iterate with
`opencode --standalone`. Server logs live in
`~/.local/share/opencode/log/opencode.log`.

## 10. Repository layout

```
.
├── AGENTS.md                      this file
├── BRIEFING.md                    product goal and target look
├── README.md
├── .beans.yml                     beans project config
├── .beans/                        beans tickets (committed)
├── .opencode/plugins/beans-stats/ the plugin
│   ├── index.ts                   server entrypoint
│   └── tui.tsx                    TUI entrypoint and sidebar
├── openspec/                      OpenSpec root
│   ├── config.yaml                context and rules
│   ├── changes/                   active and archived changes
│   └── specs/                     main specs
├── flake.nix                      nix flake, plain nix
├── nix/                           flake helper modules
├── package.json                   scripts and dev dependencies
├── tsconfig.json
├── tests/                         unit and integration tests
└── e2e/                           end to end tests
```

## 11. Style and guardrails

- Do not write comments in code. The code explains itself. Comments are allowed
  only where an OpenSpec document, a beans ticket or this file requires them.
- Keep changes minimal and scoped to the task at hand.
- Do not silently narrow, defer or drop behavior the spec asks for. If a task
  needs more work than the spec describes, surface it and ask.
- Never mark a task or bean complete while any of its specified behavior is
  unimplemented or any test is red.
- Do not edit the `.jj` directory, the OpenCode database, or the service config.
- Write prose without em dashes, without curly quotes and without filler words.
