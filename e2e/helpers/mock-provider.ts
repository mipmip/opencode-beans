import { createServer, type IncomingMessage, type ServerResponse } from "node:http"
import type { AddressInfo } from "node:net"

export const MOCK_PROVIDER_ID = "e2e"
export const MOCK_MODEL_ID = "model"
export const MOCK_API_KEY_ENV = "BEANS_E2E_MOCK_KEY"
export const MOCK_ASSISTANT_TEXT = "Mock response from the end to end provider."

export type MockProvider = {
  readonly baseURL: string
  readonly model: string
  agentRequested: () => Promise<void>
  release: () => void
  close: () => Promise<void>
}

function isTitleRequest(body: string): boolean {
  return body.includes("title generator")
}

function sendCompletion(response: ServerResponse, content: string): void {
  response.writeHead(200, {
    "content-type": "text/event-stream",
    "cache-control": "no-cache",
    connection: "keep-alive",
  })
  const base = {
    id: "chatcmpl-e2e",
    object: "chat.completion.chunk",
    created: 0,
    model: MOCK_MODEL_ID,
  }
  response.write(
    `data: ${JSON.stringify({
      ...base,
      choices: [{ index: 0, delta: { role: "assistant", content }, finish_reason: null }],
    })}\n\n`,
  )
  response.write(
    `data: ${JSON.stringify({ ...base, choices: [{ index: 0, delta: {}, finish_reason: "stop" }] })}\n\n`,
  )
  response.write("data: [DONE]\n\n")
  response.end()
}

function readBody(request: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = ""
    request.on("data", (chunk: Buffer) => {
      body += chunk.toString()
    })
    request.on("end", () => resolve(body))
    request.on("error", reject)
  })
}

export async function startMockProvider(): Promise<MockProvider> {
  let releaseAgent: (() => void) | undefined
  let released = false
  let announceAgent: (() => void) | undefined
  const agentRequest = new Promise<void>((resolve) => {
    announceAgent = resolve
  })
  const releasedSignal = new Promise<void>((resolve) => {
    releaseAgent = resolve
  })

  const server = createServer((request, response) => {
    void (async () => {
      const url = request.url ?? ""
      if (request.method === "GET" && url.includes("/models")) {
        response.writeHead(200, { "content-type": "application/json" })
        response.end(
          JSON.stringify({
            data: [{ id: MOCK_MODEL_ID, object: "model", created: 0, owned_by: MOCK_PROVIDER_ID }],
          }),
        )
        return
      }
      if (request.method === "POST" && url.includes("chat/completions")) {
        const body = await readBody(request)
        if (isTitleRequest(body)) {
          sendCompletion(response, "End to end session")
          return
        }
        announceAgent?.()
        announceAgent = undefined
        if (!released) {
          await releasedSignal
        }
        sendCompletion(response, MOCK_ASSISTANT_TEXT)
        return
      }
      response.writeHead(404, { "content-type": "application/json" })
      response.end(JSON.stringify({ error: { message: "not found" } }))
    })().catch(() => {
      response.writeHead(500, { "content-type": "application/json" })
      response.end(JSON.stringify({ error: { message: "mock provider failure" } }))
    })
  })

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject)
    server.listen(0, "127.0.0.1", () => {
      server.off("error", reject)
      resolve()
    })
  })

  const address = server.address() as AddressInfo
  return {
    baseURL: `http://127.0.0.1:${address.port}/v1`,
    model: `${MOCK_PROVIDER_ID}/${MOCK_MODEL_ID}`,
    agentRequested: () => agentRequest,
    release: () => {
      released = true
      releaseAgent?.()
    },
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.closeAllConnections()
        server.close((error) => {
          if (error) {
            reject(error)
            return
          }
          resolve()
        })
      }),
  }
}
