import { For, Show, createSignal, type Accessor } from "solid-js"
import { Plugin, usePlugin } from "@opencode/plugin/tui"
import { bar, statusRows, totalLabel, type Stats } from "./layout.ts"
import { createDisposables, registerSidebar } from "./setup.ts"

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
          </>
        )}
      </Show>
    </box>
  )
}

export default Plugin.define({
  id: "beans.stats",
  setup(context) {
    const [stats] = createSignal<Stats | null>(null)
    const [error] = createSignal<string | null>(null)
    const bag = createDisposables()

    bag.add(
      registerSidebar(context, {
        append: "sidebar.content",
        render: () => <BeansStats stats={stats} error={error} />,
      }),
    )

    return () => bag.dispose()
  },
})
