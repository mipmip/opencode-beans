import assert from "node:assert/strict"
import { test } from "node:test"
import { createCache, decodeStats, toSnapshot } from "../../.opencode/plugins/beans-stats/cache.ts"

const valid = {
  total: 3,
  byStatus: [
    { status: "todo", count: 2 },
    { status: "draft", count: 1 },
  ],
  byType: [{ type: "task", count: 3 }],
  ready: 1,
}

test("a valid snapshot round trips", () => {
  assert.deepEqual(decodeStats(toSnapshot(valid)), valid)
})

test("toSnapshot drops keys outside the shape", () => {
  const snapshot = toSnapshot({ ...valid, extra: "ignored" } as never)

  assert.ok(!("extra" in snapshot))
})

test("a malformed value decodes to nothing", () => {
  assert.equal(decodeStats(null), null)
  assert.equal(decodeStats("nope"), null)
  assert.equal(decodeStats({}), null)
  assert.equal(decodeStats({ total: 1, byStatus: "x" }), null)
  assert.equal(decodeStats({ total: 1, byStatus: [{ status: "todo" }] }), null)
  assert.equal(decodeStats({ total: 1, byStatus: [], byType: [{}] }), null)
})

test("an absent ready and blocked stay absent", () => {
  const decoded = decodeStats(toSnapshot({ total: 0, byStatus: [] }))

  assert.ok(decoded !== null)
  assert.ok(!("ready" in decoded))
  assert.ok(!("blocked" in decoded))
})

test("a save then a seed returns the same counts", () => {
  const memory: Record<string, unknown> = {}
  const cache = createCache(
    {
      read: (directory) => memory[directory],
      write: (directory, value) => {
        memory[directory] = value
      },
    },
    "/tmp/project",
  )

  assert.equal(cache.seed(), null)
  cache.save(valid)
  assert.deepEqual(cache.seed(), valid)
})

test("each directory keeps its own value", () => {
  const memory: Record<string, unknown> = {}
  const port = {
    read: (directory: string) => memory[directory],
    write: (directory: string, value: unknown) => {
      memory[directory] = value
    },
  }

  createCache(port, "/a").save({ total: 1, byStatus: [] })
  createCache(port, "/b").save({ total: 2, byStatus: [] })

  assert.equal(createCache(port, "/a").seed()?.total, 1)
  assert.equal(createCache(port, "/b").seed()?.total, 2)
})
