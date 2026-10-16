---
# opencode-beans-bjty
title: Align the sidebar columns with the documented layout
status: completed
type: epic
priority: high
created_at: 2026-10-16T15:07:53Z
updated_at: 2026-10-16T15:15:53Z
parent: opencode-beans-ifyg
---

## Goal

Make the rendered BEANS section match the target layout documented in README.md and BRIEFING.md. The current render puts a single space between the label, the count and the bar, so the columns do not line up and the documented blank-line separation is missing.

## Deliverables

- Pure layout helpers that produce the aligned rows: label column padded, count column right aligned, two spaces before the bar, blank line after the total and before the ready/blocked summary.
- The sidebar and the session panel both render from those helpers.
- Unit tests for the column widths and the formatted rows, plus an end to end assertion on the rendered alignment.

## Definition of done

The sidebar renders the exact column layout shown in README.md for the documented example counts. npm test, npm run test:e2e, npm run typecheck and nix flake check are green.

OpenSpec capability: plugin-sidebar (modified)

## Summary of Changes

The sidebar and the breakdown panel now render through `layoutSection` and
`layoutBreakdown` in `layout.ts`, which return finished aligned text lines
instead of raw rows.

- Labels are left aligned in a column that is the longest label plus two.
- Counts are right aligned in a column that is the longest count plus two.
- The bar follows the count after two spaces, so every bar starts in the same
  column.
- A blank line follows the total and precedes the ready and blocked summary;
  summary rows carry no bar.
- `tui.tsx` renders the body lines with `Index` because the body repeats empty
  strings.

Tests cover the documented example row by row, the column widths, the bar
column, the blank lines and the breakdown. The end to end suite now asserts
column alignment and the blank line in the real terminal, which confirms the
empty line occupies a row under OpenTUI.

Suite: 101 unit tests and 3 end to end tests pass, `npm run typecheck` and
`nix flake check` are green.
