## 1. Aligned layout helpers

- [x] 1.1 Add a `layoutSection(stats)` helper to `layout.ts` that returns the total plus a body of aligned text lines, with blank lines between the total, the status rows and the ready and blocked summary. Verify: `npm test` covers it and the returned lines match the documented example.
- [x] 1.2 Add a `layoutBreakdown(stats)` helper that returns the section body plus the type rows after another blank line. Verify: unit test asserts the type rows are aligned with the status rows.
- [x] 1.3 Add unit tests for the column widths: label column is the longest label plus two, count column is the longest count plus two, the count is right aligned and the bar follows after two spaces. Verify: `npm test`.
- [x] 1.4 Add unit tests for the exact rows of the documented example and for the blank line separation. Verify: `npm test`.

## 2. Render the aligned rows

- [x] 2.1 Change `tui.tsx` so the sidebar section renders `layoutSection` and the panel renders `layoutBreakdown`, keeping the total in the base token and the rows in the muted token. Verify: `npm run typecheck`.
- [x] 2.2 Update the existing unit assertions that match the rendered strings. Verify: `npm test`.
- [x] 2.3 Update the end to end assertions so they match the aligned sidebar rows. Verify: `npm run test:e2e`.
- [x] 2.4 Add an end to end assertion that the rendered sidebar rows are aligned, so a regression in the columns fails the suite. Verify: `npm run test:e2e`.

## 3. Verify and document

- [x] 3.1 Confirm the blank line renders in the real terminal and note the outcome in the change. Verify: `npm run test:e2e` output.
- [x] 3.2 Confirm `README.md` still describes the rendered layout. Verify: read the section against the captured frame.
- [x] 3.3 Run the full suite and the flake check. Verify: `npm test`, `npm run test:e2e`, `npm run typecheck` and `nix flake check` are green.
