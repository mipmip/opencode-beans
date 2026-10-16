import assert from "node:assert/strict"
import { test } from "node:test"
import {
  bar,
  bars,
  layoutBreakdown,
  layoutSection,
  statusRows,
  summaryLines,
  totalLabel,
  typeRows,
  type Stats,
} from "../../.opencode/plugins/beans-stats/layout.ts"

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

test("the documented example renders as aligned columns", () => {
  const documented: Stats = {
    total: 42,
    byStatus: [
      { status: "todo", count: 18 },
      { status: "in-progress", count: 6 },
      { status: "completed", count: 2 },
    ],
    ready: 11,
    blocked: 3,
  }

  assert.deepEqual(layoutSection(documented).body, [
    "",
    "todo           18  ████",
    "in-progress     6  █▌",
    "completed       2  ▌",
    "",
    "ready          11",
    "blocked         3",
  ])
})

test("the total line reads from the layout value", () => {
  assert.equal(layoutSection(stats).total, "29 total")
})

test("a blank line separates the total from the status rows", () => {
  const body = layoutSection(stats).body

  assert.equal(body[0], "")
  assert.match(body[1] ?? "", /^todo/)
})

test("a blank line separates the summary from the status rows", () => {
  const body = layoutSection({ ...stats, ready: 11, blocked: 3 }).body

  assert.deepEqual(
    body.slice(4, 7).map((line) => line.replace(/\s+/g, " ")),
    ["", "ready 11", "blocked 3"],
  )
})

test("a stats without rows renders an empty body", () => {
  assert.deepEqual(layoutSection({ total: 0, byStatus: [] }), { total: "0 total", body: [] })
})

test("wider labels and counts widen the columns", () => {
  const wide: Stats = { total: 1000, byStatus: [{ status: "waiting-for-merge", count: 1000 }] }

  assert.deepEqual(layoutSection(wide).body, ["", "waiting-for-merge    1000  ████"])
})

test("every bar starts in the same column", () => {
  const typed: Stats = {
    total: 42,
    byStatus: [
      { status: "todo", count: 18 },
      { status: "in-progress", count: 6 },
    ],
    byType: [
      { type: "task", count: 18 },
      { type: "bug", count: 6 },
    ],
    ready: 11,
    blocked: 3,
  }

  const withBar = layoutBreakdown(typed).body.filter((line) => /[█▌]/.test(line))
  const columns = new Set(withBar.map((line) => line.search(/[█▌]/)))

  assert.equal(withBar.length, 4)
  assert.deepEqual([...columns], [19])
})

test("the breakdown adds the type rows after another blank line", () => {
  const typed: Stats = {
    total: 2,
    byStatus: [{ status: "todo", count: 2 }],
    byType: [{ type: "bug", count: 2 }],
  }

  assert.deepEqual(layoutBreakdown(typed).body, ["", "todo    2  ████", "", "bug     2  ████"])
})
