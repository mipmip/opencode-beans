## Purpose

Keep the last known beans counts per project so the sidebar paints them
immediately on startup instead of waiting for the tracker read.

## ADDED Requirements

### Requirement: Last stats are persisted per project

The plugin SHALL persist the last successful stats for a project directory in
durable plugin storage, keyed by that directory, and SHALL replace the stored
value on every later success.

#### Scenario: A successful read is stored

- **WHEN** a stats read succeeds for a directory
- **THEN** the plugin stores that stats value under the directory key
- **AND** it survives a TUI restart

#### Scenario: A different project keeps its own value

- **WHEN** two projects have each been read
- **THEN** each directory holds its own stats value

### Requirement: The signal is seeded before the first refresh resolves

The plugin SHALL seed the stats signal from the stored value for the current
directory at setup time, before the first read resolves.

#### Scenario: A known project paints immediately

- **WHEN** the plugin starts in a directory that has stored stats
- **THEN** the sidebar shows those counts before the first read returns

#### Scenario: An unknown project shows the loading state

- **WHEN** the plugin starts in a directory with no stored stats
- **THEN** the sidebar shows the loading placeholder until the first read
  returns

### Requirement: A cached value is validated before use

The plugin SHALL reject a stored value that does not match the stats shape, and
SHALL treat a rejection as no cached value rather than as a failure.

#### Scenario: A malformed value is ignored

- **WHEN** the stored value for a directory is missing or malformed
- **THEN** the plugin seeds nothing and the first read supplies the stats

#### Scenario: A failed read does not corrupt the cache

- **WHEN** a read fails
- **THEN** the stored value is left unchanged
