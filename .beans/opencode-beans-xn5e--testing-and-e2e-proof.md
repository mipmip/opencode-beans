---
# opencode-beans-xn5e
title: Testing and e2e proof
status: todo
type: epic
priority: high
created_at: 2026-10-16T13:45:30Z
updated_at: 2026-10-16T13:45:30Z
parent: opencode-beans-6tzv
---

Goal: prove the PoC works with thorough automated tests.

Deliverables:
- Unit tests for aggregation, formatting and error mapping.
- Integration tests against a real beans fixture project.
- An e2e harness that boots OpenCode against a fixture and asserts the sidebar.
- One test per acceptance criterion in AGENTS.md.

Definition of done:
- npm test and npm run test:e2e pass.
- nix flake check stays green.
- Every acceptance criterion has a test that fails if the criterion regresses.

OpenSpec capability: testing.
