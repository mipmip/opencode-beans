## Purpose

This capability covers the automated proof that the Beans sidebar plugin works
as the PoC promises. It defines the three test layers, the end to end harness
that drives the real OpenCode terminal, and the mapping from every acceptance
criterion to a test that fails when that criterion regresses.

## ADDED Requirements

### Requirement: Every acceptance criterion has a regression test

The test suite SHALL contain, for each acceptance criterion in `AGENTS.md`
section 1, at least one test that fails when that criterion regresses. The
criteria are: the section appears, the counts match, the section refreshes after
a turn, the section degrades to `unavailable`, the flake check stays green, and
the three suites pass.

#### Scenario: A regression in rendering is caught

- **WHEN** the sidebar stops rendering the `BEANS` section
- **THEN** at least one end to end test fails

#### Scenario: A regression in counts is caught

- **WHEN** the aggregation returns a wrong total or a wrong per-status count
- **THEN** at least one unit or integration test fails

#### Scenario: A regression in refresh wiring is caught

- **WHEN** the plugin stops subscribing to a completed turn or stops its timer
- **THEN** at least one wiring test fails

#### Scenario: A regression in the degraded state is caught

- **WHEN** the plugin stops showing the muted failure line
- **THEN** at least one unit or end to end test fails

### Requirement: Unit layer for pure logic

The unit layer SHALL test the pure functions only: JSON parsing, status and type
aggregation, formatting, bar scaling and error mapping. It SHALL run no
processes and use no network.

#### Scenario: Pure helpers are exercised in isolation

- **WHEN** the unit suite runs
- **THEN** aggregation, formatting and failure mapping are covered without
  spawning the beans CLI or OpenCode

### Requirement: Integration layer against a real beans fixture

The integration layer SHALL run the real `beans` CLI against a temporary fixture
project created with `beans init` and `beans create`, and SHALL assert the stats
the plugin would compute.

#### Scenario: Counts come from the real CLI

- **WHEN** the integration suite runs with `beans` available
- **THEN** the plugin's computed total and per-status counts equal the fixture
  project's `beans list --json`

#### Scenario: Missing beans is skipped, not failed

- **WHEN** `beans` is not available on `PATH`
- **THEN** the integration tests are skipped and the suite exits successfully

### Requirement: End to end harness drives the real OpenCode terminal

The end to end harness SHALL boot `opencode --standalone` inside a pseudo
terminal against a temporary fixture project, SHALL capture the terminal output,
and SHALL reconstruct the final screen before asserting.

#### Scenario: The TUI is captured through a pseudo terminal

- **WHEN** the harness starts OpenCode
- **THEN** the process runs with a fixed terminal size and its output is
  rendered to a final screen

#### Scenario: The fixture is isolated from the developer

- **WHEN** the harness runs
- **THEN** it uses a temporary project, a temporary home and temporary XDG
  directories, so the developer's own beans and OpenCode data are untouched

### Requirement: The sidebar section renders with matching counts

The end to end suite SHALL assert that the captured screen contains the `BEANS`
section and that its total and per-status counts match `beans list --json` for
the fixture project.

#### Scenario: Section and counts appear

- **WHEN** OpenCode runs against a fixture project that has beans
- **THEN** the final screen contains the `BEANS` header, the total, and one line
  per status with the matching count

### Requirement: The sidebar degrades to a muted unavailable line

The end to end suite SHALL assert that, when the project has no beans tracker,
the captured screen contains the muted `unavailable` line and the TUI keeps
running.

#### Scenario: Missing tracker is survivable

- **WHEN** OpenCode runs against a fixture project without `.beans`
- **THEN** the final screen shows `unavailable` and OpenCode is still running

### Requirement: Suites skip cleanly when prerequisites are absent

Each suite SHALL skip its tests, rather than fail, when a prerequisite such as
OpenCode, the pseudo terminal helper, or the plugin dependencies is unavailable.

#### Scenario: Missing OpenCode is skipped

- **WHEN** `opencode` is not on `PATH`
- **THEN** the end to end tests are skipped and the suite exits successfully

#### Scenario: Missing pseudo terminal helper is skipped

- **WHEN** `python3` is not available
- **THEN** the end to end tests are skipped and the suite exits successfully
