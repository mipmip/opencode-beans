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

test("the TUI entrypoint claims the session panel slot behind the panel name", () => {
  assert.match(tui, /append: "session\.panel"/)
  assert.match(tui, /input\.name === PANEL_NAME/)
})

test("the TUI entrypoint opens the panel from a keymap command", () => {
  assert.match(tui, /context\.keymap\.layer\(/)
  assert.match(tui, /panelCommand\(/)
  assert.match(tui, /context\.ui\.panel\.open\(/)
})

test("the TUI entrypoint refreshes on a turn and on a timer", () => {
  assert.match(tui, /session\.execution\.succeeded/)
  assert.match(tui, /setInterval\(/)
})

test("the TUI entrypoint loads stats from the data module", () => {
  assert.match(tui, /loadStats\(dir\(\), \{ signal \}\)/)
})

test("the TUI entrypoint cancels in-flight work on cleanup", () => {
  assert.match(tui, /createRefresher/)
  assert.match(tui, /bag\.add\(refresher\.dispose\)/)
})

test("the TUI entrypoint seeds stats from durable storage before the first refresh", () => {
  assert.match(tui, /context\.storage\.store<CacheState>\(CACHE_KEY/)
  assert.match(tui, /createCache\(/)

  const seed = tui.indexOf("cache.seed()")
  const refresh = tui.indexOf("refresher.refresh()")
  assert.ok(seed >= 0, "the cache must be seeded")
  assert.ok(refresh >= 0, "the first refresh must run")
  assert.ok(seed < refresh, "the seed must run before the first refresh")
})

test("the TUI entrypoint saves stats only on a successful read", () => {
  assert.match(tui, /onValue:[\s\S]*cache\.save\(value\)/)
  assert.ok(!/onError:[\s\S]*cache\.save/.test(tui), "a failed read must not save")
})
