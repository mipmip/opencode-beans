import { Plugin, usePlugin } from "@opencode/plugin/tui"

function BeansStats() {
  const context = usePlugin()
  return (
    <box flexDirection="column" gap={0}>
      <text fg={context.theme.text.muted}>BEANS</text>
      <text fg={context.theme.text.muted}>loading</text>
    </box>
  )
}

export default Plugin.define({
  id: "beans.stats",
  setup(context) {
    context.ui.slot({
      append: "sidebar.content",
      render: () => <BeansStats />,
    })
  },
})
