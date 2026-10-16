---
# opencode-beans-q4ii
title: Beans data integration
status: todo
type: epic
priority: high
created_at: 2026-10-16T13:45:30Z
updated_at: 2026-10-16T13:45:30Z
parent: opencode-beans-6tzv
---

Goal: read the beans CLI and turn it into the numbers the sidebar shows.

Deliverables:
- Load stats by invoking beans list --json through node:child_process.
- Aggregate the total and the per-status counts.
- Optional ready and blocked counts from beans list --ready and --is-blocked.
- Refresh on session.execution.succeeded and on a fallback timer.
- A clear unavailable state when beans fails or .beans is missing.

Definition of done:
- Counts match beans list --json exactly.
- The section refreshes after an assistant turn.
- Failure degrades to a muted unavailable line instead of crashing.
- Unit and integration tests cover the aggregation and the failure paths.

OpenSpec capability: beans-stats.
