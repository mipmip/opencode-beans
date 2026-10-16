# session-panel Specification

## Purpose
Give a reader one surface that shows the whole beans picture: every status and
every type with its count and bar, opened from the keyboard.

## Requirements

### Requirement: Full breakdown panel

The plugin SHALL contribute a session panel that shows every status and every
type for the current project, each with its count and a bar chart.

#### Scenario: The panel is open

- **WHEN** the beans panel is open in a session
- **THEN** it lists each status with its count and bar, most frequent first
- **AND** it lists each type with its count and bar, most frequent first
- **AND** it shows the total

#### Scenario: A group without beans is absent

- **WHEN** no bean carries a type
- **THEN** the panel shows no type rows

### Requirement: A command opens the panel

The plugin SHALL register a command in its own keymap layer that opens the
beans panel. The command SHALL carry a stable id and a default binding, and the
plugin SHALL only claim the panel it opened.

#### Scenario: The reader runs the command

- **WHEN** the reader triggers the beans panel command
- **THEN** the plugin opens its session panel in the current session

#### Scenario: Another panel is selected

- **WHEN** the session panel slot is open with a name the plugin does not own
- **THEN** the plugin renders nothing

### Requirement: The panel reuses the sidebar data and failure state

The panel SHALL render from the same stats the sidebar uses, and SHALL show the
muted `unavailable` line when those stats cannot be read.

#### Scenario: The tracker is unavailable

- **WHEN** the panel is open and beans cannot be read
- **THEN** the panel shows the muted `unavailable` line instead of counts
