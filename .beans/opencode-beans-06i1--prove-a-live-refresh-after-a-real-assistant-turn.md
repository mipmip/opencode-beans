---
# opencode-beans-06i1
title: Prove a live refresh after a real assistant turn
status: todo
type: epic
priority: low
created_at: 2026-10-16T14:25:17Z
updated_at: 2026-10-16T14:25:17Z
parent: opencode-beans-flf3
---

Goal: prove acceptance criterion 3 with a live turn instead of wiring tests alone.

Deliverables:
- An e2e case that runs a real turn against a configured provider and asserts the counts change on the next frame.

Definition of done:
- The case runs in an environment with a provider and passes.
- It skips cleanly when no provider is configured.

Deferred from the PoC because it needs a configured model provider and network access.

OpenSpec capability: live-refresh.
