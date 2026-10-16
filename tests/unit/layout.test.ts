import assert from "node:assert/strict"
import { access, readFile } from "node:fs/promises"
import { dirname, join } from "node:path"
import { test } from "node:test"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..")

test("plugin has a server and a TUI entrypoint", async () => {
  await access(join(root, ".opencode/plugins/beans-stats/index.ts"))
  await access(join(root, ".opencode/plugins/beans-stats/tui.tsx"))
})

test("package.json exposes the test scripts", async () => {
  const raw = await readFile(join(root, "package.json"), "utf8")
  const pkg = JSON.parse(raw) as { scripts: Record<string, string> }
  assert.equal(typeof pkg.scripts.test, "string")
  assert.equal(typeof pkg.scripts["test:e2e"], "string")
  assert.equal(typeof pkg.scripts.typecheck, "string")
})
