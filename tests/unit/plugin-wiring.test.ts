import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { dirname, join } from "node:path"
import { test } from "node:test"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..")
const plugin = join(root, ".opencode/plugins/beans-stats")
const server = await readFile(join(plugin, "index.ts"), "utf8")
const tui = await readFile(join(plugin, "tui.tsx"), "utf8")

test("the entrypoints import the v2 packages", () => {
  assert.match(server, /from "@opencode\/plugin"/)
  assert.match(tui, /from "@opencode\/plugin\/tui"/)
})

test("the entrypoints do not use v1 plugin syntax", () => {
  for (const source of [server, tui]) {
    assert.ok(!source.includes("@opencode-ai/plugin"), "v1 plugin package found")
    assert.ok(!source.includes("$`"), "v1 shell helper found")
  }
})

test("the server entrypoint declares the plugin id", () => {
  assert.match(server, /id: "beans\.stats"/)
})

test("the TUI entrypoint claims the sidebar content slot", () => {
  assert.match(tui, /append: "sidebar\.content"/)
})

test("the TUI entrypoint registers cleanup", () => {
  assert.match(tui, /bag\.dispose\(\)/)
  assert.match(tui, /registerSidebar\(context/)
})

test("the TUI entrypoint refreshes on a turn and on a timer", () => {
  assert.match(tui, /session\.execution\.succeeded/)
  assert.match(tui, /setInterval\(/)
})

test("the TUI entrypoint loads stats from the data module", () => {
  assert.match(tui, /loadStats\(dir\(\)\)/)
})
