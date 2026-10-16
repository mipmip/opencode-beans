## Purpose

Prove, with a real assistant turn in the terminal, that the sidebar section
refreshes after the turn instead of only when the plugin loads.

## ADDED Requirements

### Requirement: Local provider for the end to end harness

The end to end harness SHALL provide a local OpenAI compatible provider so a
real assistant turn completes without a model account, credentials or network
access.

#### Scenario: A turn completes against the local provider

- **WHEN** the terminal boots with a prompt and the local provider is running
- **THEN** the assistant message from the local provider appears in the terminal

#### Scenario: The provider withholds the completion until released

- **WHEN** the harness has not released the completion
- **THEN** the provider answers the request only after the harness releases it

### Requirement: A real turn refreshes the sidebar

The end to end harness SHALL observe the sidebar before and after an assistant
turn and SHALL assert that the rendered counts reflect a tracker change made
during that turn.

#### Scenario: Counts change after the turn

- **WHEN** the plugin has read the tracker, the case adds a bean, and the turn then finishes
- **THEN** the rendered sidebar shows the new total and the new per status counts

#### Scenario: The timer is not the cause

- **WHEN** the case asserts the refreshed counts
- **THEN** the capture window is shorter than the periodic refresh interval

### Requirement: The case skips cleanly

The live refresh case SHALL skip when its prerequisites are unavailable.

#### Scenario: A prerequisite is missing

- **WHEN** the terminal, the python pseudo terminal helper, the plugin dependencies or the local provider is unavailable
- **THEN** the case is skipped with a reason and the run does not fail
