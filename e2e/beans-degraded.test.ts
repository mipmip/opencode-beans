import assert from "node:assert/strict"
import { test } from "node:test"
import { checkPrerequisites, skipReason } from "./helpers/env.ts"
import { createE2eProject } from "./helpers/project.ts"
import { capturePty } from "./helpers/pty.ts"
import { renderScreen, sidebarRegion } from "./helpers/screen.ts"
import { importSession, newSessionId } from "./helpers/session.ts"

const skip = skipReason(await checkPrerequisites())

const columns = 160
const rows = 45

test("the sidebar degrades to unavailable when there is no tracker", { skip }, async () => {
  const project = await createE2eProject({ tracker: false })
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

    assert.match(text, /unavailable/, `expected the muted failure line in:\n${text}`)
    assert.doesNotMatch(text, /\btotal\b/, `the degraded sidebar must not show a total:\n${text}`)
  } finally {
    await project.dispose()
  }
})
