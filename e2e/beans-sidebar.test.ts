import assert from "node:assert/strict"
import { test } from "node:test"
import { checkPrerequisites, skipReason } from "./helpers/env.ts"
import { createE2eProject, listBeans } from "./helpers/project.ts"
import { capturePty } from "./helpers/pty.ts"
import { renderScreen, sidebarRegion } from "./helpers/screen.ts"
import { importSession, newSessionId } from "./helpers/session.ts"

const skip = skipReason(await checkPrerequisites())

const columns = 160
const rows = 45

function statusCounts(beans: Array<{ status: string }>): Map<string, number> {
  const byStatus = new Map<string, number>()
  for (const bean of beans) {
    byStatus.set(bean.status, (byStatus.get(bean.status) ?? 0) + 1)
  }
  return byStatus
}

test("the sidebar shows the total and per-status counts from beans", { skip }, async () => {
  const project = await createE2eProject()
  try {
    const sessionId = newSessionId()
    await importSession(project, sessionId)

    const capture = await capturePty({
      cwd: project.dir,
      env: project.env,
      command: ["opencode", "--standalone", "--session", sessionId],
      cols: columns,
      rows,
    })

    const screen = renderScreen(capture, columns, rows)
    const sidebar = sidebarRegion(screen)
    assert.ok(sidebar.length > 0, `the BEANS header was not rendered:\n${screen.join("\n")}`)
    const text = sidebar.join("\n")

    const beans = await listBeans(project.dir)
    assert.ok(beans.length > 0, "the fixture should contain beans")
    assert.match(text, new RegExp(`\\b${beans.length} total\\b`), `expected the total in:\n${text}`)
    for (const [status, count] of statusCounts(beans)) {
      assert.match(text, new RegExp(`${status} ${count}`), `expected "${status} ${count}" in:\n${text}`)
    }
  } finally {
    await project.dispose()
  }
})
