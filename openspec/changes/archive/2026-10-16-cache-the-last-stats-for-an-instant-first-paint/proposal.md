## Why

Epic bean `opencode-beans-xiv8`. On startup the sidebar paints `loading` until
`beans list --json` returns, which on a cold or slow machine is a visible gap
before the counts appear. The last counts are already known from the previous
session and there is nowhere to put them. The PoC shipped with this
optimisation deferred.

## What Changes

- Persist the last successful stats per project directory through
  `context.storage.store`, so they survive a TUI restart.
- Seed the stats signal from that cache before the first refresh resolves, so a
  known project paints counts immediately.
- Validate a cached value before using it, and ignore a value that does not
  match the current shape.

## Capabilities

### New Capabilities

- `stats-cache`: persistence and seeding of the last known beans stats.

## Impact

`.opencode/plugins/beans-stats/` gains a cache module and a seed step in the TUI
entrypoint. The refresh path is unchanged and still replaces the seeded value.
No new dependency.
