export interface DisposableBag {
  add(dispose: () => void): void
  dispose(): void
}

export function createDisposables(): DisposableBag {
  const pending: Array<() => void> = []
  let disposed = false

  return {
    add(dispose) {
      if (disposed) {
        dispose()
        return
      }
      pending.push(dispose)
    },
    dispose() {
      if (disposed) {
        return
      }
      disposed = true
      while (pending.length > 0) {
        pending.pop()?.()
      }
    },
  }
}

export interface SlotHost<Claim> {
  readonly ui: {
    readonly slot: (claim: Claim) => () => void
  }
}

export function registerSidebar<Claim>(host: SlotHost<Claim>, claim: Claim): () => void {
  const unregister = host.ui.slot(claim)
  return () => unregister()
}

export const PANEL_NAME = "beans-stats"
export const PANEL_COMMAND_ID = "beans.stats.panel"
export const PANEL_BIND = "<leader>d"

export interface PanelCommand {
  readonly id: string
  readonly title: string
  readonly description: string
  readonly group: string
  readonly bind: string
  readonly run: () => void
}

export function panelCommand(open: (name: string) => unknown): PanelCommand {
  return {
    id: PANEL_COMMAND_ID,
    title: "Beans breakdown",
    description: "Show the full beans breakdown panel",
    group: "Beans",
    bind: PANEL_BIND,
    run: () => {
      open(PANEL_NAME)
    },
  }
}
