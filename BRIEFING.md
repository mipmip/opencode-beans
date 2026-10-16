# Briefing — "Beans Stats" sidebar plugin for OpenCode v2

> Paste this file (or its summary) as the opening message of a new OpenCode session.

## Goal

Build a **project-local OpenCode v2 CLI/TUI plugin** that renders a sidebar section
showing stats for the [Beans](https://github.com/hmans/beans) issue tracker in the
current project directory. This is the target look:

```
┌─ OpenCode ───────────────────────────────────────┬───────────────────────────┐
│                                                  │  BEANS                    │
│  ╭─ Build ─────────────────────────────────────╮ │  42 total                 │
│  │ You: summarize the open tasks              │ │                           │
│  │                                            │ │  todo           18  ████  │
│  │ Build: checking beans…                     │ │  in-progress     6  █▌    │
│  │                                            │ │  draft           4  █     │
│  │  ▸ beans_list                              │ │  completed       2  ▌     │
│  │    ✓ 42 beans                              │ │  scrapped        1  ▌     │
│  │                                            │ │                           │
│  │  (working…)                                │ │  ready          11        │
│  ╰────────────────────────────────────────────╯ │  blocked         3        │
│  ╭────────────────────────────────────────────╮ │                           │
│  │ > _                                        │ │                           │
│  ╰────────────────────────────────────────────╯ │                           │
└──────────────────────────────────────────────────┴───────────────────────────┘
```

## Environment & prerequisites

- OpenCode **v2**.
- `beans` CLI on `PATH`; the target project has been initialized with `beans init`
  (so `.beans/` and `.beans.yml` exist at the repo root).
- The plugin runs inside the local `opencode` CLI process (Node/Bun), so Node
  builtins are available.

## OpenCode v2 plugin facts (do NOT use V1 syntax)

- V1 used the singular `plugin` field and `@opencode-ai/plugin`. **V2 uses the plural
  `plugins` field and `@opencode/plugin`.** A TUI entrypoint imports
  `@opencode/plugin/tui`.
- A plugin is defined as:

  ```ts
  import { Plugin } from "@opencode/plugin"                 // server
  import { Plugin, usePlugin } from "@opencode/plugin/tui"  // TUI
  export default Plugin.define({
    id: "beans.stats",
    setup(context) {
      /* … */
      return cleanup
    },
  })
  ```

- **Auto-discovery**: a directory under the project's `.opencode/plugins/<name>/`
  with `index.ts` (server entrypoint) and `tui.tsx` (TUI entrypoint). No
  `opencode.jsonc` entry is needed. Discovered plugins may import
  `@opencode/plugin/tui` directly.
- **Sidebar slot**: `context.ui.slot({ append: "sidebar.content", render: () => <JSX/> })`.
  The two sidebar slots are `sidebar.content` and `sidebar.footer`.
- JSX uses OpenTUI primitives (`box`, `text`) with theme tokens
  (`context.theme.text.base`, `context.theme.text.muted`) and Solid reactivity
  (`createSignal`, `For`, `Show`). Inside components use `usePlugin()` to get the
  context.
- Current directory: `context.location ?? context.data.location.default()`, then
  `.directory`.
- React to events with `context.data.on("session.execution.succeeded", cb)` (returns
  an unsubscribe function).
- There is **no `$` shell helper** in V2 — shell out via `node:child_process`.

## Beans data source

- `beans list --json` → a flat JSON array of beans. Fields include `id`, `title`,
  `status`, `type`, `priority`, `tags`, parent/blocking relations, timestamps.
- `beans list --ready --json` → actionable beans; `beans list --is-blocked --json` →
  blocked ones.
- Also available: `beans graphql '<query>'` (alias `beans query`), `beans roadmap`,
  `beans progress`, `beans show <id>`.

## Steps

1. **Verify the data source first.** Run `beans list --json` in the target repo and
   inspect the JSON shape. Confirm `beans --version` and a populated `.beans/`.
   Recommend an AGENTS.md line so the agent is aware of Beans:
   `**IMPORTANT**: before you do anything else, run the \`beans prime\` command and heed its output.`
2. **Scaffold** this layout:

   ```
   .opencode/plugins/beans-stats/
   ├── index.ts     # minimal server entrypoint
   └── tui.tsx      # sidebar
   ```

   Server entrypoint:

   ```ts
   // .opencode/plugins/beans-stats/index.ts
   import { Plugin } from "@opencode/plugin"
   export default Plugin.define({ id: "beans.stats", setup() {} })
   ```

3. **Implement the sidebar** in `tui.tsx`:

   ```tsx
   import { Plugin, usePlugin } from "@opencode/plugin/tui"
   import { For, Show, createSignal, type Accessor } from "solid-js"
   import { execFile } from "node:child_process"
   import { promisify } from "node:util"

   const run = promisify(execFile)
   type Stats = { total: number; byStatus: Record<string, number> }

   async function loadStats(dir: string): Promise<Stats> {
     const { stdout } = await run("beans", ["list", "--json"], {
       cwd: dir,
       maxBuffer: 8 * 1024 * 1024,
     })
     const beans = JSON.parse(stdout) as Array<{ status: string }>
     const byStatus: Record<string, number> = {}
     for (const b of beans) byStatus[b.status] = (byStatus[b.status] ?? 0) + 1
     return { total: beans.length, byStatus }
   }

   function BeansStats(props: { stats: Accessor<Stats | null>; error: Accessor<string | null> }) {
     const context = usePlugin()
     return (
       <box flexDirection="column" gap={0}>
         <text fg={context.theme.text.muted}>BEANS</text>
         <Show
           when={props.stats()}
           fallback={<text fg={context.theme.text.muted}>{props.error() ?? "loading…"}</text>}
         >
           {(s) => (
             <>
               <text fg={context.theme.text.base}>{s().total} total</text>
               <For each={Object.entries(s().byStatus)}>
                 {([status, count]) => (
                   <text fg={context.theme.text.muted}>
                     {status} {count}
                   </text>
                 )}
               </For>
             </>
           )}
         </Show>
       </box>
     )
   }

   export default Plugin.define({
     id: "beans.stats",
     setup(context) {
       const [stats, setStats] = createSignal<Stats | null>(null)
       const [error, setError] = createSignal<string | null>(null)
       const dir = () => (context.location ?? context.data.location.default()).directory

       const refresh = async () => {
         try {
           setStats(await loadStats(dir()))
           setError(null)
         } catch {
           setError("beans unavailable")
         }
       }
       void refresh()

       const stop = context.data.on("session.execution.succeeded", () => void refresh())
       const timer = setInterval(() => void refresh(), 30_000)

       context.ui.slot({
         append: "sidebar.content",
         render: () => <BeansStats stats={stats} error={error} />,
       })

       return () => {
         stop()
         clearInterval(timer)
       }
     },
   })
   ```

4. **Load & test**: plugins are discovered at CLI startup. Pick up changes with
   `opencode service restart`, or iterate with `opencode --standalone` (private
   server, doesn't touch the shared one). Confirm it's active via
   `opencode plugin list`. Server logs: `~/.local/share/opencode/log/opencode.log`.

## Acceptance criteria

- The "BEANS" section appears in the sidebar for the project.
- Counts match `beans list --json` (per-status, total).
- The section refreshes after each assistant turn and does not crash when `.beans/`
  is missing or `beans` fails (show a muted "unavailable" line instead).

## Optional follow-ups (only if asked)

- Add `ready`/`blocked` counts using `beans list --ready --json` /
  `--is-blocked --json`.
- Add a `session.panel` with the full by-status/by-type breakdown, opened from a
  keybound command via `context.keymap.layer(...)`.
- Cache last stats in `context.storage.store("beans", …)`.
