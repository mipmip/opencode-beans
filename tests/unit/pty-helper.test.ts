import assert from "node:assert/strict"
import { test } from "node:test"
import { hasCommand } from "../../e2e/helpers/env.ts"
import { capturePty } from "../../e2e/helpers/pty.ts"

const python = await hasCommand("python3")

test("the pseudo terminal helper captures command output", { skip: !python }, async () => {
  const output = await capturePty({
    cwd: process.cwd(),
    env: process.env,
    command: ["node", "-e", "process.stdout.write('hello-from-pty\\n')"],
    cols: 80,
    rows: 10,
    timeout: 10,
  })
  assert.match(output, /hello-from-pty/)
})
