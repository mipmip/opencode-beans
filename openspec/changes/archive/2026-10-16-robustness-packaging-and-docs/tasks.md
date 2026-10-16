## 1. Bound and cancel tracker reads

- [x] 1.1 Add a default timeout and a per-call `LoadOptions` with an optional
  `signal` to `beans.ts`, and pass both to `execFile`. Verify with a unit test
  that a read beyond the timeout fails as unavailable.
- [x] 1.2 Pass the signal through `count` so the ready and blocked reads are
  cancellable too. Verify with a unit test that an aborted signal aborts the
  side queries as well.
- [x] 1.3 Add a test that an aborted read rejects and does not leave an
  unhandled rejection. Verify with `node --test`.

## 2. Cancel in-flight work in the sidebar

- [x] 2.1 Keep the controller of the current read in `setup`, abort it when a
  new refresh starts, and abort it on dispose. Verify with a unit test of the
  refresh helper.
- [x] 2.2 Ensure an aborted read does not update the stats or the error state.
  Verify with a unit test that a superseded read leaves the newer stats intact.

## 3. Document install, development and tests

- [x] 3.1 Rewrite `README.md` with an install section, a development section, a
  test section and the `nix build` output path. Verify by reading it against the
  scripts in `package.json`.
- [x] 3.2 Add a unit test that every command the README documents corresponds to
  a script the repository exposes. Verify with `node --test`.

## 4. Package and record

- [x] 4.1 Confirm the nix package output and document it in the README. Verify
  with `nix build` and the documented path.
- [x] 4.2 Record the deferred features as follow-up beans under the next
  milestone, each stating what is deferred and why. Verify with
  `beans list --json -t epic`.

## 5. Verify the whole suite

- [x] 5.1 Run `npm test`, `npm run typecheck` and `nix flake check` and confirm
  every suite is green. Verify with the exit status of each command.
