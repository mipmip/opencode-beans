## MODIFIED Requirements

### Requirement: Sidebar layout from pure helpers

The section layout (total line, per-status rows, bar scaling, and the ready and
blocked summary lines) MUST be computed by pure functions that take a stats
value and return renderable rows, so the layout can be tested without an
OpenCode process. Status rows MUST be ordered by descending count, then by
status name. The ready and blocked lines MUST appear after the status rows and
MUST be omitted when their count is absent.

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

### Requirement: Muted empty and failure state

When there are no stats yet, or the stats failed to load, the section MUST show
a single muted placeholder line instead of a broken or empty section. The
failure state MUST read `unavailable`. It MUST not throw.

#### Scenario: No data yet

- **WHEN** the stats signal is empty
- **THEN** the section renders a muted placeholder line and no status rows

#### Scenario: Load failure

- **WHEN** loading fails because `beans` is missing or `.beans/` is absent
- **THEN** the section renders a muted `unavailable` line and no status rows
