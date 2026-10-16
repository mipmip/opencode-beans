---
# opencode-beans-xiv8
title: Cache the last stats for an instant first paint
status: completed
type: epic
priority: low
created_at: 2026-10-16T14:25:17Z
updated_at: 2026-10-16T14:35:56Z
parent: opencode-beans-flf3
---

Goal: show the last known counts immediately on startup instead of loading.

Deliverables:
- Persist the last stats with context.storage.store.
- Seed the signal from the cache before the first refresh resolves.

Definition of done:
- A cached project paints counts before the first refresh returns.
- A test covers reading and writing the cache.

Deferred from the PoC because it is an optimisation, not an acceptance criterion.

OpenSpec capability: stats-cache.

## Summary of Changes

Added a per-project stats cache so a known project paints its counts immediately.

- New cache.ts: CACHE_KEY (beans.stats.cache), decodeStats and toSnapshot validate and normalise a stored value, and createCache(port, dir) exposes seed() and save(stats) over a minimal {read, write} port.
- tui.tsx builds the port from context.storage.store, seeds the stats signal before the first refresh, and saves on every successful read only.
- A malformed or absent stored value is ignored; a failed read leaves the stored value untouched.
- README documents the instant first paint and the panel.
- Tests: snapshot round trip, malformed and partial values, absent ready and blocked, save then seed, per-directory isolation, and wiring guards for store, seed order and save-on-success only.
- Proof: npm test 90 pass, npm run typecheck clean, nix flake check all checks passed, npm run test:e2e 2 pass.
- OpenSpec change cache-the-last-stats-for-an-instant-first-paint archived; spec stats-cache created; openspec validate --specs 7 passed.
