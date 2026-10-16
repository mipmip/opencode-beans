import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { dirname, join } from "node:path"
import { test } from "node:test"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..")
const tui = await readFile(join(root, ".opencode/plugins/beans-stats/tui.tsx"), "utf8")

test("colors come from the theme", () => {
  assert.match(tui, /context\.theme\.text\.(base|muted)/)
})

test("no hard-coded color literal appears", () => {
  assert.ok(!/#[0-9a-fA-F]{3,8}\b/.test(tui), "hex color literal found")
  assert.ok(!/\brgba?\(/.test(tui), "rgb color literal found")
})

test("the empty and error states share a muted placeholder", () => {
  assert.match(tui, /props\.error\(\) \?\? "loading"/)
})

test("the sidebar renders the section layout helper", () => {
  assert.match(tui, /layout=\{layoutSection\}/)
})

test("the panel renders the breakdown layout helper", () => {
  assert.match(tui, /layout=\{layoutBreakdown\}/)
})

test("the rendered lines come from the layout value", () => {
  assert.match(tui, /props\.layout\(stats\(\)\)\.body/)
})

test("the failure state reads unavailable", () => {
  assert.match(tui, /setError\("unavailable"\)/)
})
