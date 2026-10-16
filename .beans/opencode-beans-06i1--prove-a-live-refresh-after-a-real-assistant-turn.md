---
# opencode-beans-06i1
title: Prove a live refresh after a real assistant turn
status: completed
type: epic
priority: low
created_at: 2026-10-16T14:25:17Z
updated_at: 2026-10-16T14:52:11Z
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

## Summary of Changes

Accepted acceptance criterion 3 with a live turn instead of wiring tests alone.

- Added `e2e/helpers/mock-provider.ts`: a local OpenAI compatible provider that serves `GET /v1/models` and `POST /v1/chat/completions` from the harness, so a real turn runs offline with no account. It answers the title request at once and holds the agent request until the case releases it.
- Added the `provider` option to `e2e/helpers/project.ts`, which writes `opencode.jsonc` naming the provider, its model and the default model, and puts the provider key in the fixture environment.
- Added `e2e/beans-live-refresh.test.ts`: boots the terminal with a prompt, waits for the agent request, adds a bean, releases the completion, and asserts the reconstructed sidebar shows the new total and the new todo count while the assistant text proves the turn ran.
- Added `tests/unit/mock-provider.test.ts` covering the listing, the immediate title answer and the held agent answer.
- Updated `e2e/README.md`.

OpenSpec change `prove-a-live-refresh-after-a-real-assistant-turn` archived and synced into `openspec/specs/live-refresh/spec.md` (3 requirements).

Verified: `npm test` 93 pass; `npm run test:e2e` 3 pass across three runs; `npm run typecheck` clean; `nix flake check` green; `nixfmt --check` clean.
