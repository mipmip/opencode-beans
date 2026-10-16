# project-foundation Specification

## Purpose
Provide a reproducible build, development and test environment for the plugin
using plain nix flakes, so every later change lands on a foundation that passes
the same checks on every supported system.

## Requirements

### Requirement: Plain nix flake without system helpers

The flake SHALL declare the supported systems explicitly and merge per-system
outputs with `nixpkgs.lib.genAttrs`. It MUST NOT depend on `flake-utils` or any
other input that abstracts over systems.

#### Scenario: Flake evaluates without helper inputs

- **WHEN** the flake inputs are locked and `nix flake show` runs
- **THEN** it lists `devShells`, `packages`, `checks` and `formatter` for
  `x86_64-linux`, `aarch64-linux`, `x86_64-darwin` and `aarch64-darwin`
- **AND** the only flake input is `nixpkgs`

### Requirement: Development shell

`devShells.default` SHALL provide Node 24 and the tools required to build, test
and format the project.

#### Scenario: Entering the development shell

- **WHEN** `nix develop` is entered from a clean checkout
- **THEN** `node --version` reports a v24 release inside the shell
- **AND** `jj`, `git` and `nixfmt` are available on `PATH`

### Requirement: Reproducible check in a pure sandbox

`checks.default` SHALL run the unit and integration test suite without network
access, so `nix flake check` is a trustworthy gate in CI and locally.

#### Scenario: Check runs the test suite

- **WHEN** `nix flake check` runs on a supported system
- **THEN** it builds the check and runs the `node:test` suite
- **AND** the command exits successfully when every test passes

#### Scenario: Check fails with a failing test

- **WHEN** any unit or integration test fails
- **THEN** `nix flake check` exits non-zero and reports the failing test

### Requirement: Plugin package output

`packages.default` SHALL assemble the plugin from the repository source and
expose the plugin directory in the build output.

#### Scenario: Building the package

- **WHEN** `nix build` runs on a supported system
- **THEN** the result contains the `beans-stats` plugin directory with its
  server and TUI entrypoints

### Requirement: Type checking and test entry points

The project SHALL expose the development entry points used by humans and by the
nix outputs: a test script, an end to end test script and a type check script.

#### Scenario: Running the test entry points

- **WHEN** `npm test` runs in the development shell
- **THEN** it executes the unit and integration tests with the `node:test`
  runner
- **AND** `npm run typecheck` type checks the plugin and test sources without
  emitting files
