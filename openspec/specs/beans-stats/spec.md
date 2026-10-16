# beans-stats Specification

## Purpose
Turns the Beans issue tracker in the current project directory into the numbers
the sidebar shows, and does so without ever taking the plugin down when the
tracker is missing or the `beans` command fails.

## Requirements

### Requirement: Read the beans tracker

The plugin MUST read the tracker for the current directory by invoking
`beans list --json` through `node:child_process`, with the project directory as
the working directory and a bounded output buffer. It MUST NOT call a shell and
MUST NOT depend on the developer's own `.beans/`.

#### Scenario: Reading a project with beans

- **WHEN** the directory has a `.beans/` and `beans` is on `PATH`
- **THEN** the plugin reads the flat JSON array `beans list --json` returns

#### Scenario: The command runs in the project directory

- **WHEN** stats are loaded for directory `D`
- **THEN** `beans list --json` is executed with `cwd` set to `D`

### Requirement: Aggregate total and per-status counts

The plugin MUST aggregate the flat bean array into a stats value holding the
total number of beans and the count per status. The counts MUST match
`beans list --json` exactly: the total is the array length and each status count
is the number of beans with that status.

#### Scenario: Counts match the listing

- **WHEN** `beans list --json` returns beans with statuses `todo` (2),
  `in-progress` (1) and `completed` (1)
- **THEN** the stats value has total `4`
- **AND** its per-status counts are `todo 2`, `in-progress 1`, `completed 1`

#### Scenario: An empty tracker is not an error

- **WHEN** `beans list --json` returns an empty array
- **THEN** the stats value has total `0` and no status rows
- **AND** the plugin does not report an error

### Requirement: Ready and blocked counts

The plugin MUST include a `ready` count from `beans list --ready --json` and a
`blocked` count from `beans list --is-blocked --json`. When either command fails
or is unavailable, that count MUST be omitted rather than failing the whole
stats value.

#### Scenario: Ready and blocked are counted

- **WHEN** the ready listing holds 11 beans and the blocked listing holds 3
- **THEN** the stats value reports `ready 11` and `blocked 3`

#### Scenario: A failing side query degrades to omission

- **WHEN** `beans list --json` succeeds but `beans list --ready --json` fails
- **THEN** the stats value still holds total and per-status counts
- **AND** it holds no ready count and reports no error for it

### Requirement: Refresh after a turn and on a timer

The plugin MUST refresh the stats after every assistant turn by subscribing to
`session.execution.succeeded`, and MUST also refresh on a fallback interval so a
stalled event stream does not freeze the section. Both the subscription and the
timer MUST be disposed on cleanup.

#### Scenario: A completed turn refreshes the stats

- **WHEN** a `session.execution.succeeded` event fires
- **THEN** the plugin loads the stats again
- **AND** the section repaints with the new counts

#### Scenario: The fallback timer refreshes the stats

- **WHEN** the fallback interval elapses without any event
- **THEN** the plugin loads the stats again

### Requirement: Resilient failure state

When `beans` is missing, when `.beans/` is absent, or when `beans list --json`
fails, the plugin MUST NOT throw and MUST surface a single muted `unavailable`
state instead.

#### Scenario: The beans command is missing

- **WHEN** loading stats fails because `beans` is not on `PATH`
- **THEN** the plugin records the unavailable state and does not throw

#### Scenario: The project has no tracker

- **WHEN** the project directory has no `.beans/`
- **THEN** the plugin records the unavailable state and does not throw

### Requirement: Aggregate per-type counts

The aggregation SHALL count beans by type in addition to counting them by
status, and SHALL carry the per-type counts on the same result as the per-status
counts.

#### Scenario: Types are counted

- **WHEN** the tracker holds beans of several types
- **THEN** the aggregated result carries one entry per type with its count

#### Scenario: A bean without a type is skipped

- **WHEN** a bean carries no type
- **THEN** it is left out of the per-type counts and still counted in the total
