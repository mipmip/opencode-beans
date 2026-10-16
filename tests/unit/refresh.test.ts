import assert from "node:assert/strict"
import { test } from "node:test"
import { createRefresher } from "../../.opencode/plugins/beans-stats/refresh.ts"

function deferred<Value>() {
  let resolve!: (value: Value) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<Value>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

test("a starting refresh cancels the read that is still in flight", async () => {
  const signals: AbortSignal[] = []
  const gates: Array<ReturnType<typeof deferred<string>>> = []
  const values: string[] = []
  const refresher = createRefresher<string>({
    load: (signal) => {
      signals.push(signal)
      const gate = deferred<string>()
      gates.push(gate)
      return gate.promise
    },
    onValue: (value) => values.push(value),
    onError: () => values.push("error"),
  })

  const first = refresher.refresh()
  const second = refresher.refresh()

  assert.equal(signals.length, 2)
  assert.equal(signals[0]?.aborted, true)
  assert.equal(signals[1]?.aborted, false)

  gates[0]?.resolve("stale")
  gates[1]?.resolve("fresh")
  await Promise.all([first, second])

  assert.deepEqual(values, ["fresh"])
})

test("disposing aborts the read in flight and does not touch the state", async () => {
  const signals: AbortSignal[] = []
  const gates: Array<ReturnType<typeof deferred<string>>> = []
  const values: string[] = []
  const refresher = createRefresher<string>({
    load: (signal) => {
      signals.push(signal)
      const gate = deferred<string>()
      gates.push(gate)
      return gate.promise
    },
    onValue: (value) => values.push(value),
    onError: () => values.push("error"),
  })

  const run = refresher.refresh()
  refresher.dispose()

  assert.equal(signals[0]?.aborted, true)

  gates[0]?.resolve("late")
  await run

  assert.deepEqual(values, [])
})

test("an aborted read does not report an error", async () => {
  const errors: number[] = []
  const refresher = createRefresher<string>({
    load: (signal) =>
      new Promise((_, reject) => {
        signal.addEventListener("abort", () => reject(new Error("aborted")))
      }),
    onValue: () => {},
    onError: () => errors.push(1),
  })

  const run = refresher.refresh()
  refresher.dispose()
  await run

  assert.deepEqual(errors, [])
})

test("a failing read reports an error", async () => {
  const errors: number[] = []
  const refresher = createRefresher<string>({
    load: () => Promise.reject(new Error("boom")),
    onValue: () => {},
    onError: () => errors.push(1),
  })

  await refresher.refresh()

  assert.deepEqual(errors, [1])
})

test("a refresh after dispose is a no-op", async () => {
  let loads = 0
  const refresher = createRefresher<string>({
    load: () => {
      loads += 1
      return Promise.resolve("value")
    },
    onValue: () => {},
    onError: () => {},
  })

  refresher.dispose()
  await refresher.refresh()

  assert.equal(loads, 0)
})
