## 1. Cache module

- [x] 1.1 Add `toSnapshot` and `decodeStats` in `cache.ts`, and verify `tests/unit/stats-cache.test.ts` covers a valid snapshot, a malformed value and a value missing fields
- [x] 1.2 Add `createCache(port, dir)` exposing `seed()` and `save(stats)`, and verify a unit test with a fake port shows a save then a seed returns the same counts

## 2. Wiring

- [x] 2.1 Build the port from `context.storage.store` under `CACHE_KEY` in `tui.tsx`, seed the signal before the first refresh, and save on every successful read
- [x] 2.2 Verify `tests/unit/plugin-wiring.test.ts` asserts `context.storage.store(`, `createCache(` and the seed before `refresh`, plus the guard that a failed read does not save
- [x] 2.3 Update `README.md` if it describes startup behavior, and verify `tests/unit/readme.test.ts` still passes

## 3. Proof

- [x] 3.1 Run `npm test` and `npm run typecheck` and verify both are green
- [x] 3.2 Run `nix flake check` and `nixfmt --check` and verify both are green
- [x] 3.3 Run `npm run test:e2e` and verify the sidebar cases still pass
