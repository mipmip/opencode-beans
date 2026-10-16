import assert from "node:assert/strict"
import { test } from "node:test"
import { bar, bars, statusRows, summaryLines, totalLabel, typeRows, type Stats } from "../../.opencode/plugins/beans-stats/layout.ts"

const stats: Stats = {
  total: 29,
  byStatus: [
    { status: "draft", count: 4 },
    { status: "todo", count: 18 },
    { status: "processing", count: 6 },
  ],
}

test("rows are ordered by descending count then status name", () => {
  assert.deepEqual(
    statusRows(stats).map((row) => row.status),
    ["todo", "processing", "draft"],
  )
})

test("rows break count ties by status name", () => {
  const tied: Stats = {
    total: 4,
    byStatus: [
      { status: "beta", count: 2 },
      { status: "alpha", count: 2 },
    ],
  }
  assert.deepEqual(
    statusRows(tied).map((row) => row.status),
    ["alpha", "beta"],
  )
})

test("the largest count produces a full bar", () => {
  assert.equal(bar(18, 18), "████")
})

test("smaller counts produce a proportionally shorter bar", () => {
  assert.equal(bar(6, 18), "█▌")
  assert.equal(bar(4, 18), "█")
  assert.ok(bar(2, 18).length < bar(6, 18).length)
})

test("a zero or unknown maximum yields no bar", () => {
  assert.equal(bar(0, 0), "")
  assert.equal(bar(3, 0), "")
})

test("the total label reads clearly", () => {
  assert.equal(totalLabel(stats), "29 total")
})

test("ready and blocked lines follow the status rows", () => {
  const withCounts: Stats = { ...stats, ready: 11, blocked: 3 }

  assert.deepEqual(summaryLines(withCounts), [
    { label: "ready", count: 11 },
    { label: "blocked", count: 3 },
  ])
})

test("an absent count is omitted from the summary", () => {
  assert.deepEqual(summaryLines(stats), [])
  assert.deepEqual(summaryLines({ ...stats, ready: 0 }), [{ label: "ready", count: 0 }])
})

test("type rows are ordered by descending count then name", () => {
  const typed: Stats = {
    ...stats,
    byType: [
      { type: "bug", count: 2 },
      { type: "task", count: 18 },
      { type: "epic", count: 2 },
    ],
  }

  assert.deepEqual(
    typeRows(typed).map((row) => row.type),
    ["task", "bug", "epic"],
  )
})

test("a stats without types yields no type rows", () => {
  assert.deepEqual(typeRows(stats), [])
})

test("bars scale against the largest count in the group", () => {
  const scaled = bars([
    { label: "big", count: 18 },
    { label: "small", count: 6 },
  ])

  assert.deepEqual(
    scaled.map((row) => row.bar),
    ["████", "█▌"],
  )
  assert.equal(scaled[0]?.label, "big")
})

test("bars of an empty group are empty", () => {
  assert.deepEqual(bars([]), [])
})
