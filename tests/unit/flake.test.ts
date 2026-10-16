import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { dirname, join } from "node:path"
import { test } from "node:test"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..")
const flake = await readFile(join(root, "flake.nix"), "utf8")

test("flake declares every supported system", () => {
  for (const system of [
    "x86_64-linux",
    "aarch64-linux",
    "x86_64-darwin",
    "aarch64-darwin",
  ]) {
    assert.ok(flake.includes(`"${system}"`), `missing system ${system}`)
  }
})

test("flake merges systems with genAttrs instead of a helper input", () => {
  assert.match(flake, /genAttrs/)
  assert.doesNotMatch(flake, /flake-utils/)
})

test("flake keeps nixpkgs as its only input", () => {
  const inputs = flake.slice(flake.indexOf("inputs"), flake.indexOf("outputs"))
  const urls = inputs.match(/url\s*=/g) ?? []
  assert.equal(urls.length, 1)
})
