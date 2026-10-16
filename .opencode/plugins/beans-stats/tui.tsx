import { For, Show, createSignal, type Accessor } from "solid-js"
import { Plugin, usePlugin } from "@opencode/plugin/tui"
import { bar, statusRows, summaryLines, totalLabel, type Stats } from "./layout.ts"
import { createDisposables, registerSidebar } from "./setup.ts"
import { loadStats } from "./beans.ts"
import { createRefresher } from "./refresh.ts"

interface StatusRow {
  readonly status: string
  readonly count: number
  readonly bar: string
}

function toRows(stats: Stats): StatusRow[] {
  const max = stats.byStatus.reduce((largest, entry) => Math.max(largest, entry.count), 0)
  return statusRows(stats).map((entry) => ({ ...entry, bar: bar(entry.count, max) }))
}

function BeansStats(props: {
  readonly stats: Accessor<Stats | null>
  readonly error: Accessor<string | null>
}) {
  const context = usePlugin()
  return (
    <box flexDirection="column" gap={0}>
      <text fg={context.theme.text.muted}>BEANS</text>
      <Show
        when={props.stats()}
        fallback={<text fg={context.theme.text.muted}>{props.error() ?? "loading"}</text>}
      >
        {(stats: Accessor<Stats>) => (
          <>
            <text fg={context.theme.text.base}>{totalLabel(stats())}</text>
            <For each={toRows(stats())}>
              {(row) => (
                <text fg={context.theme.text.muted}>
                  {row.status} {row.count} {row.bar}
                </text>
              )}
            </For>
            <For each={summaryLines(stats())}>
              {(line) => (
                <text fg={context.theme.text.muted}>
                  {line.label} {line.count}
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
    const bag = createDisposables()
    const dir = () => (context.location ?? context.data.location.default()).directory

    const refresher = createRefresher<Stats>({
      load: (signal) => loadStats(dir(), { signal }),
      onValue: (value) => {
        setStats(value)
        setError(null)
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

    return () => bag.dispose()
  },
})
