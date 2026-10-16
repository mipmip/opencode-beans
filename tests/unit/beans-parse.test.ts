import assert from "node:assert/strict"
import { test } from "node:test"
import { BeansUnavailableError, parseBeans } from "../../.opencode/plugins/beans-stats/beans.ts"

test("valid JSON becomes bean records", () => {
  const beans = parseBeans('[{"status":"todo"},{"status":"draft"}]')

  assert.deepEqual(beans, [{ status: "todo" }, { status: "draft" }])
})

test("malformed JSON is a clear failure", () => {
  assert.throws(() => parseBeans("not json"), BeansUnavailableError)
})

test("a JSON value that is not an array is a clear failure", () => {
  assert.throws(() => parseBeans('{"status":"todo"}'), BeansUnavailableError)
})

test("a bean without a status is a clear failure", () => {
  assert.throws(() => parseBeans('[{"title":"x"}]'), BeansUnavailableError)
  assert.throws(() => parseBeans("[[1,2]]"), BeansUnavailableError)
})
