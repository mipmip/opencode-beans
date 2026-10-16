import assert from "node:assert/strict"
import { test } from "node:test"
import {
  PANEL_BIND,
  PANEL_COMMAND_ID,
  PANEL_NAME,
  panelCommand,
} from "../../.opencode/plugins/beans-stats/setup.ts"

test("the command opens the beans panel", () => {
  const opened: string[] = []
  const command = panelCommand((name) => {
    opened.push(name)
    return true
  })

  command.run()

  assert.deepEqual(opened, [PANEL_NAME])
})

test("the panel name is a stable identifier", () => {
  assert.equal(PANEL_NAME, "beans-stats")
})

test("the command carries a stable id and a default binding", () => {
  const command = panelCommand(() => true)

  assert.equal(command.id, PANEL_COMMAND_ID)
  assert.equal(command.bind, PANEL_BIND)
  assert.ok(command.title.length > 0)
  assert.ok(command.group.length > 0)
})
