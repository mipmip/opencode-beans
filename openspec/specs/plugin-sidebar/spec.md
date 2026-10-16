# plugin-sidebar Specification

## Purpose
Defines how the Beans stats plugin is discovered and loaded by OpenCode v2 and
how it renders its section into the sidebar as a self-contained, reactive and
cleanly unloadable UI extension.

## Requirements

### Requirement: Auto-discovered plugin entrypoints

The plugin MUST live in `.opencode/plugins/beans-stats/` with `index.ts` as the
server entrypoint and `tui.tsx` as the TUI entrypoint, and MUST be discoverable
without an entry in `opencode.jsonc`. The entrypoints MUST use the v2 plugin API:
the plural `plugins` configuration field when configured, and the
`@opencode/plugin` and `@opencode/plugin/tui` packages.

#### Scenario: OpenCode discovers the plugin

- **WHEN** OpenCode starts in this repository with no `opencode.jsonc`
- **THEN** the plugin is listed by `opencode plugin list` with the id `beans.stats`

#### Scenario: The entrypoints use v2 syntax

- **WHEN** the plugin sources are inspected
- **THEN** they import from `@opencode/plugin` and `@opencode/plugin/tui`
- **AND** they do not import `@opencode-ai/plugin` and do not use the singular
  `plugin` field or the v1 `$` shell helper

### Requirement: Sidebar section registration

The plugin MUST append its section to the `sidebar.content` slot during `setup`,
and MUST render a section headed `BEANS`. The section MUST be rendered by a
Solid component so that updates to the stats signal repaint it.

#### Scenario: The BEANS section appears

- **WHEN** the plugin is loaded and the sidebar is shown
- **THEN** a `BEANS` section is visible in the sidebar

#### Scenario: Rendering follows the stats signal

- **WHEN** the stats signal changes from empty to a populated value
- **THEN** the section repaints to show the new total and status rows

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

### Requirement: Cleanup on unload

`setup` MUST return a cleanup function that unregisters the sidebar slot and
every event or timer the plugin created. After cleanup, the plugin MUST leave no
listener behind and MUST be safe to call once.

#### Scenario: Cleanup removes the slot and listeners

- **WHEN** the cleanup function returned by `setup` is called
- **THEN** the slot registration is removed
- **AND** every event subscription and timer created by the plugin is disposed

#### Scenario: Cleanup is idempotent

- **WHEN** cleanup is called twice
- **THEN** it does not throw

### Requirement: Theme tokens for colors

The section MUST take its colors from the OpenCode theme through the plugin
context, so it follows the active theme. It MUST NOT hard-code color values.

#### Scenario: Colors come from the theme

- **WHEN** the section renders text
- **THEN** its foreground colors come from `context.theme` tokens
