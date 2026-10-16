import assert from "node:assert/strict"
import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { test } from "node:test"
import { BeansUnavailableError, loadStats } from "../../.opencode/plugins/beans-stats/beans.ts"

test("a missing beans binary is unavailable, not a crash", async () => {
  const previous = process.env.PATH
  process.env.PATH = "/nonexistent"
  try {
    await assert.rejects(loadStats(process.cwd()), BeansUnavailableError)
  } finally {
    process.env.PATH = previous
  }
})

test("a directory without a tracker is unavailable", async () => {
  const dir = await mkdtemp(join(tmpdir(), "opencode-beans-none-"))
  try {
    await assert.rejects(loadStats(dir), BeansUnavailableError)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
})
