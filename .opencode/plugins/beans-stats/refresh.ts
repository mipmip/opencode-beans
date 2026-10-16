export interface RefresherOptions<Value> {
  readonly load: (signal: AbortSignal) => Promise<Value>
  readonly onValue: (value: Value) => void
  readonly onError: () => void
}

export interface Refresher {
  refresh(): Promise<void>
  dispose(): void
}

export function createRefresher<Value>(options: RefresherOptions<Value>): Refresher {
  let current: AbortController | null = null
  let disposed = false

  const settle = (controller: AbortController) => {
    if (current === controller) {
      current = null
    }
  }

  return {
    async refresh() {
      if (disposed) {
        return
      }
      current?.abort()
      const controller = new AbortController()
      current = controller
      try {
        const value = await options.load(controller.signal)
        if (!controller.signal.aborted) {
          options.onValue(value)
        }
      } catch {
        if (!controller.signal.aborted) {
          options.onError()
        }
      } finally {
        settle(controller)
      }
    },
    dispose() {
      disposed = true
      current?.abort()
      current = null
    },
  }
}
