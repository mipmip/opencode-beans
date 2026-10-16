import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { dirname, join } from "node:path"
import { test } from "node:test"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..")
const readme = await readFile(join(root, "README.md"), "utf8")
const pkg = JSON.parse(await readFile(join(root, "package.json"), "utf8")) as {
  scripts?: Record<string, string>
}

test("the README documents the test and typecheck scripts", () => {
  assert.match(readme, /npm run test:e2e/)
  assert.match(readme, /npm run typecheck/)
  assert.match(readme, /npm test/)
})

test("every npm script the README names exists", () => {
  const named = [...readme.matchAll(/npm run ([a-z][a-z0-9:_-]*)/g)].map((match) => match[1])
  assert.ok(named.length > 0, "no npm run commands documented")
  for (const name of named) {
    assert.ok(pkg.scripts?.[name as string], `missing script: ${name}`)
  }
})

test("the README documents the nix entry points", () => {
  assert.match(readme, /nix develop/)
  assert.match(readme, /nix flake check/)
  assert.match(readme, /nix build/)
})

test("the README documents the nix build output", () => {
  assert.match(readme, /result\/plugins\/beans-stats\//)
})
