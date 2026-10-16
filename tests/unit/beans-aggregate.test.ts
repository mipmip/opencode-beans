import assert from "node:assert/strict"
import { test } from "node:test"
import { aggregate } from "../../.opencode/plugins/beans-stats/beans.ts"

test("counts match the listing", () => {
  const stats = aggregate([
    { status: "todo" },
    { status: "todo" },
    { status: "in-progress" },
    { status: "completed" },
  ])

  assert.equal(stats.total, 4)
  assert.deepEqual(
    [...stats.byStatus].sort((left, right) => left.status.localeCompare(right.status)),
    [
      { status: "completed", count: 1 },
      { status: "in-progress", count: 1 },
      { status: "todo", count: 2 },
    ],
  )
})

test("an empty tracker is not an error", () => {
  const stats = aggregate([])

  assert.equal(stats.total, 0)
  assert.deepEqual(stats.byStatus, [])
})

test("ready and blocked are carried when known", () => {
  const stats = aggregate([{ status: "todo" }], 11, 3)

  assert.equal(stats.ready, 11)
  assert.equal(stats.blocked, 3)
})

test("an unknown ready or blocked count is omitted", () => {
  const stats = aggregate([{ status: "todo" }])

  assert.equal(stats.ready, undefined)
  assert.equal(stats.blocked, undefined)
  assert.ok(!("ready" in stats))
  assert.ok(!("blocked" in stats))
})

test("beans are counted by type", () => {
  const stats = aggregate([
    { status: "todo", type: "task" },
    { status: "todo", type: "task" },
    { status: "draft", type: "epic" },
  ])

  assert.deepEqual(
    [...(stats.byType ?? [])].sort((left, right) => left.type.localeCompare(right.type)),
    [
      { type: "epic", count: 1 },
      { type: "task", count: 2 },
    ],
  )
})

test("a bean without a type is left out of the per-type counts", () => {
  const stats = aggregate([{ status: "todo" }, { status: "todo", type: "bug" }])

  assert.equal(stats.total, 2)
  assert.deepEqual(stats.byType, [{ type: "bug", count: 1 }])
})
