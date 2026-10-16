import assert from "node:assert/strict"
import { test } from "node:test"
import { renderScreen, sidebarRegion } from "../../e2e/helpers/screen.ts"

test("plain lines are rendered in order", () => {
  const screen = renderScreen("first\r\nsecond\r\n", 20, 4)
  assert.deepEqual(screen.slice(0, 2), ["first", "second"])
})

test("cursor positioning places text at the requested cell", () => {
  const screen = renderScreen("hello\u001b[2;3HX", 10, 3)
  assert.equal(screen[1], "  X")
})

test("clearing the screen removes earlier content", () => {
  const screen = renderScreen("noise\u001b[2J\u001b[Hdone", 10, 2)
  assert.equal(screen[0], "done")
})

test("erasing from the cursor removes the rest of the line", () => {
  const screen = renderScreen("abcd\u001b[1;3H\u001b[0K", 10, 1)
  assert.equal(screen[0], "ab")
})

test("carriage returns overwrite the line", () => {
  const screen = renderScreen("11111\r22", 10, 1)
  assert.equal(screen[0], "22111")
})

test("the sidebar region starts at the beans header column", () => {
  const lines = ["main content     BEANS", "                 3 total"]
  assert.deepEqual(sidebarRegion(lines), ["BEANS", "3 total"])
})

test("the sidebar region is empty when the header is absent", () => {
  assert.deepEqual(sidebarRegion(["nothing here"]), [])
})
