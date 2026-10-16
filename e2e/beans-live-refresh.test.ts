import assert from "node:assert/strict"
import { execFile } from "node:child_process"
import { test } from "node:test"
import { promisify } from "node:util"
import { checkPrerequisites, skipReason } from "./helpers/env.ts"
import { MOCK_ASSISTANT_TEXT, startMockProvider } from "./helpers/mock-provider.ts"
import { createE2eProject, listBeans } from "./helpers/project.ts"
import { capturePty } from "./helpers/pty.ts"
import { isColumnAligned, renderScreen, sidebarRegion } from "./helpers/screen.ts"

const run = promisify(execFile)

const skip = skipReason(await checkPrerequisites())

const columns = 160
const rows = 45

test("the sidebar refreshes after a real assistant turn", { skip }, async (t) => {
  const provider = await startMockProvider().catch(() => null)
  if (provider === null) {
    t.skip("the local end to end provider could not start")
    return
  }

  const project = await createE2eProject({ provider: { baseURL: provider.baseURL, model: provider.model } })
  try {
    const before = await listBeans(project.dir)
    assert.ok(before.length > 0, "the fixture should contain beans")

    const capture = capturePty({
      cwd: project.dir,
      env: project.env,
      command: ["opencode", "--standalone", "--prompt", "say hello to the beans sidebar"],
      cols: columns,
      rows,
      timeout: 24,
    })

    await provider.agentRequested()
    await run("beans", ["create", "added during the turn", "-s", "todo"], { cwd: project.dir })
    provider.release()

    const output = await capture
    const screen = renderScreen(output, columns, rows)
    const full = screen.join("\n")
    assert.match(full, new RegExp(MOCK_ASSISTANT_TEXT), `expected the assistant message in:\n${full}`)

    const sidebar = sidebarRegion(screen)
    assert.ok(sidebar.length > 0, `the BEANS header was not rendered:\n${full}`)
    const text = sidebar.join("\n")

    const after = await listBeans(project.dir)
    assert.equal(after.length, before.length + 1, "the fixture should contain one more bean than before the turn")
    assert.match(
      text,
      new RegExp(`\\b${after.length} total\\b`),
      `expected the refreshed total ${after.length} in:\n${text}`,
    )
    assert.match(text, /^todo\s+2\s/m, `expected the refreshed todo count in:\n${text}`)
    assert.ok(isColumnAligned(sidebar), `expected the refreshed rows to stay aligned:\n${text}`)
  } finally {
    await provider.close()
    await project.dispose()
  }
})
