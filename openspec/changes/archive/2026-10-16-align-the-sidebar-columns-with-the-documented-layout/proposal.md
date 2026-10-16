## Why

The rendered `BEANS` section does not match the layout documented in `README.md`
and `BRIEFING.md`, which show the status label, the count and the bar as aligned
columns separated by a blank line after the total and before the ready and
blocked summary. The current section joins those fields with single spaces, so
the counts and bars do not line up.

Epic bean: `opencode-beans-bjty`.

## What Changes

- Compute the section layout from a pure helper that pads the label column,
  right aligns the count column and places two spaces before the bar.
- Separate the total line from the status rows and the status rows from the
  ready and blocked summary with a blank line.
- Render both the sidebar section and the session breakdown panel from the same
  aligned rows, so the panel columns line up as well.
- Add unit tests for the column widths and the formatted rows, and an end to end
  assertion that the rendered section is aligned.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `plugin-sidebar`: the "Sidebar layout from pure helpers" requirement now also
  fixes the aligned column layout and the blank line separation.

## Impact

- `.opencode/plugins/beans-stats/layout.ts` gains the aligned row helpers.
- `.opencode/plugins/beans-stats/tui.tsx` renders the prepared rows instead of
  joining fields itself.
- Tests under `tests/unit/` and the end to end suite under `e2e/`.
- No API or dependency change.
