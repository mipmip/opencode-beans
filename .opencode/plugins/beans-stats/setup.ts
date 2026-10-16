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
