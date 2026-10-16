import assert from "node:assert/strict"
import { test } from "node:test"
import { aggregate, loadStats } from "../../.opencode/plugins/beans-stats/beans.ts"
import { createBean, createProject, hasBeans, listBeans } from "../helpers/project.ts"

const available = await hasBeans()

const byStatus = (
  left: { status: string },
  right: { status: string },
): number => left.status.localeCompare(right.status)

test("aggregated stats match beans list --json", { skip: !available }, async () => {
  const project = await createProject()
  try {
    await createBean(project.dir, "first")
    await createBean(project.dir, "second")
    await createBean(project.dir, "third", "in-progress")
    await createBean(project.dir, "fourth", "completed")

    const stats = await loadStats(project.dir)
    const beans = await listBeans(project.dir)

    assert.equal(stats.total, beans.length)
    assert.equal(stats.total, 4)
    assert.deepEqual(
      [...stats.byStatus].sort(byStatus),
      [...aggregate(beans).byStatus].sort(byStatus),
    )
    assert.equal(stats.byStatus.find((entry) => entry.status === "todo")?.count, 2)
    assert.equal(stats.byStatus.find((entry) => entry.status === "in-progress")?.count, 1)
  } finally {
    await project.dispose()
  }
})

test("ready and blocked counts use the flags when available", { skip: !available }, async () => {
  const project = await createProject()
  try {
    await createBean(project.dir, "only")

    const stats = await loadStats(project.dir)

    assert.equal(stats.total, 1)
    if (stats.ready !== undefined) {
      assert.equal(typeof stats.ready, "number")
    }
    if (stats.blocked !== undefined) {
      assert.equal(typeof stats.blocked, "number")
    }
  } finally {
    await project.dispose()
  }
})
