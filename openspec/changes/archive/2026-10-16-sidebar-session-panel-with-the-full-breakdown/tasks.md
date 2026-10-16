## 1. Aggregation

- [x] 1.1 Read the bean type in `parseBeans`, keeping it only when it is a string, and verify `tests/unit/beans-parse.test.ts` passes with a new case for a bean without a type
- [x] 1.2 Count beans by type in `aggregate` and carry `byType` on `Stats`, and verify `tests/unit/beans-aggregate.test.ts` passes with a new case for per-type counts
- [x] 1.3 Sort per-type rows by descending count then name in `typeRows`, next to the existing `statusRows`, and verify `tests/unit/layout-rows.test.ts` passes for ordering and ties

## 2. Layout helpers

- [x] 2.1 Extract `bars` so the sidebar and the panel scale bars from one helper, and verify `tests/unit/layout-rows.test.ts` covers the max, the proportional case and the empty case
- [x] 2.2 Have the sidebar render from `bars(statusRows(stats))` and verify the suite still passes

## 3. Panel and command

- [x] 3.1 Add the panel name and a pure `panelCommand(open)` in `setup.ts`, and verify a unit test asserts the command id, the default binding and that running it opens the panel name
- [x] 3.2 Add a `BeansBreakdown` component and claim the `session.panel` slot gated on the panel name, and verify `tests/unit/plugin-wiring.test.ts` asserts the slot, the gate and the keymap layer
- [x] 3.3 Register the command in `context.keymap.layer` and wire `ui.panel.open`, and verify the wiring test asserts both

## 4. Proof

- [x] 4.1 Run `npm test` and `npm run typecheck` and verify both are green
- [x] 4.2 Run `nix flake check` and `nixfmt --check` and verify both are green
- [x] 4.3 Run `npm run test:e2e` and verify the sidebar cases still pass
