import { For, Show, createSignal, type Accessor } from "solid-js"
import { Plugin, usePlugin } from "@opencode/plugin/tui"
import { bars, statusRows, summaryLines, totalLabel, typeRows, type Stats } from "./layout.ts"
import { PANEL_NAME, createDisposables, panelCommand, registerSidebar } from "./setup.ts"
import { loadStats } from "./beans.ts"
import { createRefresher } from "./refresh.ts"

function BeansSummary(props: {
  readonly stats: Accessor<Stats | null>
  readonly error: Accessor<string | null>
}) {
  const context = usePlugin()
  return (
    <Show
      when={props.stats()}
      fallback={<text fg={context.theme.text.muted}>{props.error() ?? "loading"}</text>}
    >
      {(stats: Accessor<Stats>) => (
        <>
          <text fg={context.theme.text.base}>{totalLabel(stats())}</text>
          <For each={bars(statusRows(stats()))}>
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
      <BeansSummary stats={props.stats} error={props.error} />
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
      <BeansSummary stats={props.stats} error={props.error} />
      <Show when={props.stats()}>
        {(stats: Accessor<Stats>) => (
          <For each={bars(typeRows(stats()))}>
            {(row) => (
              <text fg={context.theme.text.muted}>
                {row.type} {row.count} {row.bar}
              </text>
            )}
          </For>
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
