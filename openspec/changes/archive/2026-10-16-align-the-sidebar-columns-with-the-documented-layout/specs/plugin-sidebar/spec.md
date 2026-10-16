# plugin-sidebar Delta

## MODIFIED Requirements

### Requirement: Sidebar layout from pure helpers

The section layout (total line, per-status rows, bar scaling, and the ready and
blocked summary lines) MUST be computed by pure functions that take a stats
value and return renderable rows, so the layout can be tested without an
OpenCode process. Status rows MUST be ordered by descending count, then by
status name. The ready and blocked lines MUST appear after the status rows and
MUST be omitted when their count is absent.

The rows MUST be aligned as columns. The label MUST be left aligned in a column
two characters wider than the longest rendered label, the count MUST be right
aligned in a column two characters wider than the longest rendered count, and a
bar MUST follow the count after two spaces. A blank line MUST separate the total
line from the status rows, and a blank line MUST separate the status rows from
the ready and blocked summary when that summary is present. Summary lines MUST
carry no bar.

#### Scenario: Rows are ordered by count

- **WHEN** the helpers format a stats value with counts `todo 18`, `processing 6`,
  and `draft 4`
- **THEN** the rows come back as `todo`, `processing`, `draft`

#### Scenario: Bars scale to the largest count

- **WHEN** the helpers format bars for counts `18`, `6`, and `4`
- **THEN** the largest count produces the full bar and smaller counts produce a
  proportionally shorter bar

#### Scenario: Ready and blocked are rendered

- **WHEN** the helpers format a stats value with `ready 11` and `blocked 3`
- **THEN** the layout includes a `ready 11` line and a `blocked 3` line

#### Scenario: An absent count is omitted

- **WHEN** the helpers format a stats value without a blocked count
- **THEN** the layout contains no blocked line

#### Scenario: The documented example renders as aligned columns

- **WHEN** the helpers format a stats value with `todo 18`, `in-progress 6`,
  `completed 2`, `ready 11` and `blocked 3`
- **THEN** the rows are `todo           18  ████`,
  `in-progress     6  █▌`, `completed       2  ▌`, `ready          11` and
  `blocked         3`

#### Scenario: The total is separated from the status rows

- **WHEN** the helpers format a stats value that has status rows
- **THEN** the rendered section contains a blank line between the total line and
  the first status row

#### Scenario: The summary is separated from the status rows

- **WHEN** the helpers format a stats value that has status rows and a ready
  count
- **THEN** the rendered section contains a blank line between the last status row
  and the first summary line
