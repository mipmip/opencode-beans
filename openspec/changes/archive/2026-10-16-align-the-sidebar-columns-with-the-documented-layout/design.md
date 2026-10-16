## Context

The plugin already renders the section from pure helpers in `layout.ts`, but the
component joins the label, count and bar with single spaces, so the columns do
not line up with the target layout in `README.md` and `BRIEFING.md`. See the
proposal for the motivation.

## Goals / Non-Goals

- Goal: the rendered section matches the documented column layout exactly.
- Goal: the same alignment applies to the sidebar section and the session panel.
- Goal: the alignment stays pure and unit testable, without an OpenCode process.
- Non-Goal: changing which rows are shown, the ordering, the bar scaling or the
  colors.

## Decisions

- The alignment lives in `layout.ts` and returns finished text lines. The
  component renders the lines and keeps only the color choice, so the layout can
  be tested as strings.
- Column widths are derived from the rows in the block: the label column is the
  longest label plus a two character gutter, the count column is the longest
  count plus a two character gutter, and the count is right aligned. A bar
  follows after two spaces. For the documented example this yields the exact
  rows in `README.md`.
- The widths are computed once over every row of the rendered block, so the
  summary and the type rows line up with the status rows.
- Blank lines are emitted as empty strings in the returned line array, so the
  section is a single ordered list of lines. The component renders one text
  element per line.
- `layoutSection` returns the total separately from the body, because the total
  is rendered with a different theme token than the rows. `layoutBreakdown`
  returns the section body with the type rows appended after another blank line.

## Risks / Trade-offs

- [An empty text element may not occupy a line in OpenTUI, collapsing the blank
  separator] -> Verify the blank line in the real terminal with the end to end
  harness; if it collapses, render a single space for blank lines instead.
- [The documented column widths could be read as fixed rather than derived] ->
  Derive them from the rows and assert the documented example, so the layout
  adapts to longer status names and to three digit counts while still matching
  the documentation for the documented counts.
- [Changing the rendered text breaks existing assertions that match `todo 2`] ->
  Update the end to end and unit assertions to match the aligned rows.
