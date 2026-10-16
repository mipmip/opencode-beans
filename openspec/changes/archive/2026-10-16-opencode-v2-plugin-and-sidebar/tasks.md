## 1. Plugin entrypoints

- [x] 1.1 Keep `index.ts` as the minimal server entrypoint, `Plugin.define({ id: "beans.stats", setup() {} })` from `@opencode/plugin`. Verify with `openspec validate` and by reading the file: no v1 imports.
- [x] 1.2 Wire `tui.tsx` as the TUI entrypoint: it imports `Plugin` from `@opencode/plugin/tui`, calls `registerSidebar` from `./setup.ts`, and returns the cleanup from `setup`. Verify: `opencode plugin list` shows `beans.stats`.
- [x] 1.3 Add `tests/unit/plugin-wiring.test.ts` asserting both entrypoints exist, import the v2 packages, and contain none of `@opencode-ai/plugin`, a `setup(context)` with a `$` helper, or a singular `plugin` field. Verify: `npm test`.

## 2. Layout helpers

- [x] 2.1 Add `.opencode/plugins/beans-stats/layout.ts` exporting the `Stats` type plus `statusRows` (descending count, then status name), `bar` (scales to the largest count in a fixed width), and `totalLabel`. No OpenCode imports. Verify: `npm run typecheck`.
- [x] 2.2 Add `tests/unit/layout-rows.test.ts` covering the ordering and bar-scaling scenarios from `specs/plugin-sidebar/spec.md`. Verify: `npm test`.

## 3. Sidebar registration and cleanup

- [x] 3.1 Add `.opencode/plugins/beans-stats/setup.ts` with `registerSidebar(host, render)`, which appends to `sidebar.content` and returns a cleanup that unregisters the slot, plus an idempotent disposables helper for listeners and timers added later. Verify: `npm run typecheck`.
- [x] 3.2 Add `tests/unit/sidebar-registration.test.ts` driving `registerSidebar` with a fake host: asserts the target slot is `sidebar.content`, that cleanup unregisters it, and that a second cleanup call does not throw. Verify: `npm test`.

## 4. Section rendering

- [x] 4.1 Implement the `BeansStats` Solid component in `tui.tsx`: a `BEANS` header, the total line, and one row per status built from the layout helpers, all reading the stats signal. Verify: `npm run typecheck`.
- [x] 4.2 Render a single muted placeholder line when the stats signal is empty or carries an error, with no status rows. Verify: covered by 4.4 and the e2e epic.
- [x] 4.3 Take every color from `context.theme` tokens; no color literal in `tui.tsx`. Verify: `tests/unit/theme-usage.test.ts` asserts `context.theme` is used and that no `#rrggbb` or `rgb(` literal appears.
- [x] 4.4 Add `tests/unit/theme-usage.test.ts` covering 4.3 and asserting the placeholder branch renders without the rows. Verify: `npm test`.

## 5. Verification

- [x] 5.1 Run `npm test`, `npm run typecheck`, `nix flake check` and `nix build`; all must be green. Verify: command exit codes.
- [x] 5.2 Confirm `opencode plugin list` reports `beans.stats` for this repository. Verify: command output.
