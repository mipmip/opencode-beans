## 1. Data module

- [x] 1.1 Add `.opencode/plugins/beans-stats/beans.ts` with pure `parseBeans` (JSON text to bean records) and `aggregate` (beans to `Stats`) plus a thin `loadStats(dir)` that runs `beans list --json` with `cwd` and a bounded `maxBuffer`. Verify: `npm run typecheck`.
- [x] 1.2 Extend `layout.ts` so `Stats` carries optional `ready` and `blocked` counts and the helpers emit `ready`/`blocked` summary lines, omitted when absent. Verify: `npm run typecheck`.

## 2. Unit tests for aggregation

- [x] 2.1 Add `tests/unit/beans-aggregate.test.ts` covering the counting scenario, the empty-tracker scenario, and a tracker with several statuses. Verify: `npm test`.
- [x] 2.2 Add `tests/unit/beans-parse.test.ts` covering malformed JSON and a missing field, asserting a thrown error the caller can turn into the unavailable state. Verify: `npm test`.
- [x] 2.3 Add `tests/unit/layout-rows.test.ts` cases for the ready and blocked lines and for omission when absent. Verify: `npm test`.

## 3. Failure paths

- [x] 3.1 Make `loadStats` reject with a single error type when the process fails or the JSON is unusable. Verify: `tests/unit/beans-parse.test.ts`.
- [x] 3.2 Add `tests/unit/beans-failure.test.ts` proving a missing `beans` binary rejects instead of throwing synchronously, using the load path against a temporary directory without a tracker. Verify: `npm test`.

## 4. Refresh and rendering

- [x] 4.1 In `tui.tsx`, load the stats on setup and after every `session.execution.succeeded`, and set the muted `unavailable` state on failure. Verify: `npm run typecheck`.
- [x] 4.2 Add the fallback interval timer; register the subscription and the timer in the disposables bag so cleanup disposes both. Verify: `tests/unit/sidebar-registration.test.ts` still passes and `npm run typecheck`.
- [x] 4.3 Render the ready and blocked lines from the helpers; keep the muted `unavailable` fallback. Verify: `tests/unit/theme-usage.test.ts`.

## 5. Integration with real beans

- [x] 5.1 Extend `tests/integration/` with a test that creates a fixture project, creates beans in several statuses, and asserts the aggregated `Stats` equals what `beans list --json` reports. Skip cleanly when `beans` is absent. Verify: `npm test`.
- [x] 5.2 Assert the ready and blocked counts against the fixture, tolerating a beans build that does not expose the flags by asserting only when the query succeeds. Verify: `npm test`.

## 6. Verification

- [x] 6.1 Run `npm test`, `npm run typecheck`, `nix flake check` and `nix build`; all green. Verify: command exit codes.
