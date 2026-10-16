import { For, Index, Show, createSignal, type Accessor } from "solid-js"
import { Plugin, usePlugin } from "@opencode/plugin/tui"
import {
  layoutBreakdown,
  layoutSection,
  type SectionLayout,
  type Stats,
} from "./layout.ts"
import { PANEL_NAME, createDisposables, panelCommand, registerSidebar } from "./setup.ts"
import { loadStats } from "./beans.ts"
import { createRefresher } from "./refresh.ts"
import { CACHE_KEY, createCache, type CacheState } from "./cache.ts"

function BeansLines(props: {
  readonly stats: Accessor<Stats | null>
  readonly error: Accessor<string | null>
  readonly layout: (stats: Stats) => SectionLayout
}) {
  const context = usePlugin()
  return (
    <Show
      when={props.stats()}
      fallback={<text fg={context.theme.text.muted}>{props.error() ?? "loading"}</text>}
    >
      {(stats: Accessor<Stats>) => (
        <>
          <text fg={context.theme.text.base}>{props.layout(stats()).total}</text>
          <Index each={props.layout(stats()).body}>
            {(line) => <text fg={context.theme.text.muted}>{line()}</text>}
          </Index>
        </>
      )}
    </Show>
  )
}

function BeansStats(props: {
  readonly stats: Accessor<Stats | null>
  readonly error: Accessor<string | null>
}) {
  const context = usePlugin()
  return (
    <box flexDirection="column" gap={0}>
      <text fg={context.theme.text.muted}>BEANS</text>
      <BeansLines stats={props.stats} error={props.error} layout={layoutSection} />
    </box>
  )
}

function BeansBreakdown(props: {
  readonly stats: Accessor<Stats | null>
  readonly error: Accessor<string | null>
}) {
  const context = usePlugin()
  return (
    <box flexDirection="column" gap={0}>
      <text fg={context.theme.text.muted}>BEANS</text>
      <BeansLines stats={props.stats} error={props.error} layout={layoutBreakdown} />
    </box>
  )
}

export default Plugin.define({
  id: "beans.stats",
  setup(context) {
    const [stats, setStats] = createSignal<Stats | null>(null)
    const [error, setError] = createSignal<string | null>(null)
    const bag = createDisposables()
    const dir = () => (context.location ?? context.data.location.default()).directory

    const [cacheState, updateCache] = context.storage.store<CacheState>(CACHE_KEY, { initial: {} })
    const cache = createCache(
      {
        read: (directory) => cacheState[directory],
        write: (directory, value) => {
          void updateCache((draft) => {
            draft[directory] = value
          })
        },
      },
      dir(),
    )

    const cached = cache.seed()
    if (cached !== null) {
      setStats(cached)
    }

    const refresher = createRefresher<Stats>({
      load: (signal) => loadStats(dir(), { signal }),
      onValue: (value) => {
        setStats(value)
        setError(null)
        cache.save(value)
      },
      onError: () => {
        setStats(null)
        setError("unavailable")
      },
    })

    void refresher.refresh()

    bag.add(context.data.on("session.execution.succeeded", () => void refresher.refresh()))

    const timer = setInterval(() => void refresher.refresh(), 30_000)
    bag.add(() => clearInterval(timer))

    bag.add(refresher.dispose)

    bag.add(
      registerSidebar(context, {
        append: "sidebar.content",
        render: () => <BeansStats stats={stats} error={error} />,
      }),
    )

    bag.add(
      registerSidebar(context, {
        append: "session.panel",
        render: (input) => (
          <Show when={input.name === PANEL_NAME}>
            <BeansBreakdown stats={stats} error={error} />
          </Show>
        ),
      }),
    )

    context.keymap.layer(() => ({
      commands: [panelCommand((name) => context.ui.panel.open(name))],
    }))

    return () => bag.dispose()
  },
})
