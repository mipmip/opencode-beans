import assert from "node:assert/strict"
import { test } from "node:test"
import { createDisposables, registerSidebar } from "../../.opencode/plugins/beans-stats/setup.ts"

function fakeHost() {
  const claims: Array<{ append: string; render: () => string }> = []
  let unregistered = 0
  const host = {
    ui: {
      slot: (claim: { append: string; render: () => string }) => {
        claims.push(claim)
        return () => {
          unregistered += 1
        }
      },
    },
  }
  return {
    host,
    claims,
    unregistered: () => unregistered,
  }
}

test("the section is appended to the sidebar content slot", () => {
  const fake = fakeHost()
  registerSidebar(fake.host, { append: "sidebar.content", render: () => "BEANS" })
  assert.equal(fake.claims.length, 1)
  assert.equal(fake.claims[0]?.append, "sidebar.content")
  assert.equal(fake.claims[0]?.render(), "BEANS")
})

test("cleanup unregisters the slot", () => {
  const fake = fakeHost()
  const cleanup = registerSidebar(fake.host, { append: "sidebar.content", render: () => "BEANS" })
  assert.equal(fake.unregistered(), 0)
  cleanup()
  assert.equal(fake.unregistered(), 1)
})

test("the disposables bag disposes every entry once", () => {
  const bag = createDisposables()
  let calls = 0
  bag.add(() => {
    calls += 1
  })
  bag.dispose()
  bag.dispose()
  assert.equal(calls, 1)
})

test("entries added after disposal run immediately", () => {
  const bag = createDisposables()
  bag.dispose()
  let calls = 0
  bag.add(() => {
    calls += 1
  })
  assert.equal(calls, 1)
})
