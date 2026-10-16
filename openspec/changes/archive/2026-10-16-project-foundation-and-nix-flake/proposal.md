## Why

Epic bean `opencode-beans-mrqa` ("Project foundation and nix flake") is the base
every later epic builds on. Without a reproducible build, a dev shell and an
automated check, the plugin work has nowhere to land and the PoC cannot be
trusted as an alpha base. The repository must be buildable, testable and
reproducible with plain nix flakes before any plugin behavior is written.

## What Changes

- Add a plain nix flake that lists the four supported systems explicitly and
  merges them with `nixpkgs.lib.genAttrs`. No `flake-utils`, no other system
  abstraction input.
- Provide `devShells.default` with Node 24 plus the tools needed to build and
  test the plugin.
- Provide `packages.default` that assembles the plugin from the repository
  source.
- Provide `checks.default` that runs the unit and integration suites in a pure
  sandbox with no network access.
- Wire `package.json` and `tsconfig.json` to the built in `node:test` runner and
  to `tsc` for type checking.
- Keep the OpenSpec configuration, `AGENTS.md` and the beans roadmap in place as
  the project contract.

## Capabilities

### New Capabilities

- `project-foundation`: the repository builds, tests and runs reproducibly with
  plain nix flakes on every supported system.

### Modified Capabilities

None.

## Impact

- New: `flake.nix`, `flake.lock`, `nix/package.nix`, `nix/checks.nix`,
  `nix/devshell.nix`.
- New: `package.json`, `tsconfig.json`.
- New: `openspec/config.yaml`, `AGENTS.md`, `CLAUDE.md`, `.gitignore`.
- No runtime code is affected: the plugin entrypoints are still stubs after this
  change.
