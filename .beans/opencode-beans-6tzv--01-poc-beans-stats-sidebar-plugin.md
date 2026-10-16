---
# opencode-beans-6tzv
title: '01 PoC: beans stats sidebar plugin'
status: completed
type: milestone
priority: high
created_at: 2026-10-16T13:45:17Z
updated_at: 2026-10-16T14:25:10Z
---

Milestone 01 tracks the proof of concept for the beans stats sidebar plugin for OpenCode v2. It proves the plugin works end to end with nix and OpenSpec from the start, and it becomes the alpha base for later development.

Definition of done:
- The BEANS section renders in the OpenCode sidebar with counts that match beans list --json.
- It refreshes after each assistant turn and degrades gracefully when beans or .beans is missing.
- nix flake check is green for every supported system.
- Unit, integration and e2e suites prove the acceptance criteria.
- Every epic is archived in OpenSpec and committed with jj as Pim Snel.

## Summary of Changes

Milestone 01 shipped the proof of concept. All five epics are completed and archived in OpenSpec: project foundation and nix flake; OpenCode v2 plugin and sidebar; beans data integration; testing and e2e proof; robustness, packaging and docs.

The BEANS sidebar section renders the total and per-status counts from `beans list --json`, refreshes after every assistant turn and on a timer, and degrades to a muted `unavailable` line. `nix flake check` is green and the unit, integration and e2e suites prove the acceptance criteria.

Deferred work is recorded under milestone 02.
