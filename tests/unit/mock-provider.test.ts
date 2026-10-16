import assert from "node:assert/strict"
import { test } from "node:test"
import {
  MOCK_ASSISTANT_TEXT,
  MOCK_MODEL_ID,
  startMockProvider,
} from "../../e2e/helpers/mock-provider.ts"

function post(baseURL: string, messages: Array<{ role: string; content: string }>): Promise<string> {
  return fetch(`${baseURL}/chat/completions`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ model: MOCK_MODEL_ID, messages }),
  }).then((response) => response.text())
}

test("the local provider lists its model", async () => {
  const provider = await startMockProvider()
  try {
    const body = (await fetch(`${provider.baseURL}/models`).then((response) => response.json())) as {
      data: Array<{ id: string }>
    }
    assert.equal(body.data[0]?.id, MOCK_MODEL_ID)
  } finally {
    await provider.close()
  }
})

test("the title request is answered without a release", async () => {
  const provider = await startMockProvider()
  try {
    const text = await post(provider.baseURL, [{ role: "system", content: "You are a title generator." }])
    assert.match(text, /End to end session/)
  } finally {
    await provider.close()
  }
})

test("the agent request waits for the release", async () => {
  const provider = await startMockProvider()
  try {
    let settled = false
    const agent = post(provider.baseURL, [{ role: "user", content: "hello" }]).then((text) => {
      settled = true
      return text
    })
    await provider.agentRequested()
    await new Promise((resolve) => setTimeout(resolve, 150))
    assert.equal(settled, false, "the agent request should wait for the release")
    provider.release()
    assert.match(await agent, new RegExp(MOCK_ASSISTANT_TEXT))
  } finally {
    await provider.close()
  }
})
