---
# opencode-beans-xiv8
title: Cache the last stats for an instant first paint
status: todo
type: epic
priority: low
created_at: 2026-10-16T14:25:17Z
updated_at: 2026-10-16T14:25:17Z
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
