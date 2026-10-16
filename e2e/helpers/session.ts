import { execFile } from "node:child_process"
import { writeFile } from "node:fs/promises"
import { join } from "node:path"
import { promisify } from "node:util"
import type { E2eProject } from "./project.ts"

const run = promisify(execFile)

const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789"

export function newSessionId(): string {
  let id = "ses_e2e"
  for (let index = 0; index < 20; index += 1) {
    id += alphabet[Math.floor(Math.random() * alphabet.length)]
  }
  return id
}

function newMessageId(): string {
  let id = "msg_e2e"
  for (let index = 0; index < 20; index += 1) {
    id += alphabet[Math.floor(Math.random() * alphabet.length)]
  }
  return id
}

function sessionDocument(sessionId: string, dir: string): Record<string, unknown> {
  const now = Date.now()
  const model = { id: "mock", providerID: "mock", variant: "default" }
  const tokens = { input: 0, output: 0, reasoning: 0, cache: { read: 0, write: 0 } }
  return {
    info: {
      id: sessionId,
      projectID: "e2e",
      agent: "build",
      model,
      cost: 0,
      tokens,
      outcome: "succeeded",
      time: { created: now, updated: now },
      title: "End to end fixture session",
      location: { directory: dir },
    },
    messages: [
      {
        id: newMessageId(),
        time: { created: now },
        text: "hello from the end to end fixture",
        files: [],
        agents: [],
        type: "user",
      },
      {
        id: newMessageId(),
        time: { created: now + 1, streamed: now + 2, completed: now + 3 },
        type: "assistant",
        agent: "build",
        model,
        content: [{ type: "text", text: "This is a canned end to end response." }],
        snapshot: { start: "", end: "", files: [] },
        finish: "stop",
        rawFinish: "stop",
        cost: 0,
        tokens,
      },
    ],
  }
}

export async function importSession(project: E2eProject, sessionId: string): Promise<void> {
  const file = join(project.dir, "e2e-session.json")
  await writeFile(file, JSON.stringify(sessionDocument(sessionId, project.dir), null, 1))
  await run(
    "opencode",
    ["session", "import", file, "--standalone", "--directory", project.dir],
    { cwd: project.dir, env: project.env },
  )
}
