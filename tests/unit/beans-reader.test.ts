import assert from "node:assert/strict"
import { test } from "node:test"
import {
  BeansUnavailableError,
  DEFAULT_TIMEOUT_MS,
  createBeanReader,
  type ExecOptions,
} from "../../.opencode/plugins/beans-stats/beans.ts"

interface Call {
  readonly command: string
  readonly args: readonly string[]
  readonly options: ExecOptions
}

function recorder(outputs: Record<string, string>) {
  const calls: Call[] = []
  const exec = async (command: string, args: readonly string[], options: ExecOptions) => {
    calls.push({ command, args, options })
    const stdout = outputs[args.join(" ")]
    if (stdout === undefined) {
      throw new Error(`no canned output for ${args.join(" ")}`)
    }
    return { stdout }
  }
  return { calls, exec }
}

const full: Record<string, string> = {
  "list --json": JSON.stringify([{ status: "todo" }, { status: "todo" }]),
  "list --ready --json": JSON.stringify([{ status: "todo" }]),
  "list --is-blocked --json": "[]",
}

test("every read runs beans in the project directory", async () => {
  const { calls, exec } = recorder(full)
  await createBeanReader(exec).loadStats("/tmp/project")
  assert.ok(calls.length > 0)
  for (const call of calls) {
    assert.equal(call.command, "beans")
    assert.equal(call.options.cwd, "/tmp/project")
  }
})

test("reads are bounded by the default timeout", async () => {
  const { calls, exec } = recorder(full)
  await createBeanReader(exec).loadStats("/tmp/project")
  for (const call of calls) {
    assert.equal(call.options.timeout, DEFAULT_TIMEOUT_MS)
  }
})

test("a caller can override the timeout", async () => {
  const { calls, exec } = recorder(full)
  await createBeanReader(exec).loadStats("/tmp/project", { timeoutMs: 123 })
  for (const call of calls) {
    assert.equal(call.options.timeout, 123)
  }
})

test("the signal is forwarded to every read", async () => {
  const { calls, exec } = recorder(full)
  const controller = new AbortController()
  await createBeanReader(exec).loadStats("/tmp/project", { signal: controller.signal })
  assert.equal(calls.length, 3)
  for (const call of calls) {
    assert.equal(call.options.signal, controller.signal)
  }
})

test("no signal is passed when the caller has none", async () => {
  const { calls, exec } = recorder(full)
  await createBeanReader(exec).loadStats("/tmp/project")
  for (const call of calls) {
    assert.equal("signal" in call.options, false)
  }
})

test("a failing main read is unavailable, not a crash", async () => {
  const { exec } = recorder({})
  await assert.rejects(createBeanReader(exec).loadStats("/tmp/project"), BeansUnavailableError)
})

test("a failing side read is omitted, not fatal", async () => {
  const { exec } = recorder({ "list --json": JSON.stringify([{ status: "todo" }]) })
  const stats = await createBeanReader(exec).loadStats("/tmp/project")
  assert.equal(stats.total, 1)
  assert.equal("ready" in stats, false)
  assert.equal("blocked" in stats, false)
})
