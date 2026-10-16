## Context

`tui.tsx` builds a `Stats` signal that starts as `null`, then seeds it from the
first successful read through `createRefresher`. `context.storage.store` offers
durable, live-synced JSON state keyed by a plugin-chosen string. See
proposal.md for motivation.

## Goals / Non-Goals

**Goals:**

- Persist the last successful `Stats` per project directory.
- Seed the signal at setup so a known project does not show `loading`.
- Validate stored data before use, because it may come from an older plugin
  version.

**Non-Goals:**

- Changing when a read happens, or the refresh triggers.
- Caching across projects or sharing one value between directories.
- Caching the full bean list. Only the aggregate is stored.

## Decisions

- Store under one plugin key, `beans.stats.cache`, with the project directory as
  the inner key, so one durable value holds every project the reader visits.
  Alternative: one storage key per directory, rejected because the directory is
  an absolute path and not a stable key across renames.
- Put the snapshot, validation and read/write/compose logic in a pure
  `cache.ts`, taking a minimal `{read, write}` port. The TUI passes a port built
  from `context.storage.store`. This keeps the cache unit testable without a
  running host.
- Snapshot instead of storing the reactive value directly, so the durable value
  is plain JSON and does not carry store proxies.
- Seed once at setup, synchronously, before `refresher.refresh()`. The seed is a
  best effort: a malformed value yields `null` and the normal read still runs.
- Keep the stored value on a failed read. The last good value is more useful
  than none, and the next success overwrites it.

## Risks / Trade-offs

- [A stale value can be shown briefly, then corrected] -> The first read
  replaces it and the sidebar already treats the seeded value the same as a
  fresh one; the value is never older than the previous session.
- [Storage grows with every directory visited] -> Each entry is a few hundred
  bytes and the store is the host's own durable state; acceptable for the
  number of projects a reader opens.
- [A shape change between plugin versions makes old entries invalid] ->
  Validation rejects them and the read supplies fresh stats instead of the
  plugin crashing.
