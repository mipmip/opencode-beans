import assert from "node:assert/strict"
import { test } from "node:test"
import { createBean, createProject, hasBeans, listBeans } from "../helpers/project.ts"

const available = await hasBeans()

test("beans list reports the beans created in a fixture project", { skip: !available }, async () => {
  const project = await createProject()
  try {
    await createBean(project.dir, "first")
    await createBean(project.dir, "second", "in-progress")

    const beans = await listBeans(project.dir)

    assert.equal(beans.length, 2)
    assert.equal(beans.filter((bean) => bean.status === "in-progress").length, 1)
  } finally {
    await project.dispose()
  }
})
