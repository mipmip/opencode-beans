## Context

See `proposal.md` for motivation. The repository is a fresh checkout with an
empty git history apart from the initial commit, and it is colocated with jj.
`beans`, `openspec` and `jj` are provided by the host; only Node and the
build tools come from nix. The tests run through Node's built in runner, which
means the nix check only needs Node, not a JavaScript package manager.

## Goals / Non-Goals

**Goals:**

- One `flake.nix` that a reader can scan in a minute, with no hidden helper
  input.
- A check that mirrors what a developer runs locally, so green means green in
  both places.
- Outputs defined uniformly for all four supported systems.

**Non-Goals:**

- Packaging `beans` or `openspec` from nixpkgs. nixpkgs carries versions far
  older than the host tools, so they stay host prerequisites.
- Vendoring `node_modules`. The plugin has no runtime dependencies; dev
  dependencies are installed by the developer, not baked into the check.
- Building a JavaScript bundle. The plugin is loaded from source.

## Decisions

**Plain `genAttrs` over `flake-utils`.** The project rule forbids system
abstraction inputs. `nixpkgs.lib.genAttrs` plus a small `each` helper gives the
same reach with visible inputs and no extra lock entry.

**Single-argument Nix modules.** `nix/package.nix` and `nix/checks.nix` take one
attribute set (`{ src, lib, stdenv, nodejs_24 }`) so `callPackage` can inject
dependencies. Curried definitions fail `callPackage` with "not a derivation".

**`cleanSourceWith` on the flake source.** Filtering `.jj`, `.git`,
`node_modules` and `result` keeps the nix store path small and, more
importantly, stable: jj rewrites the working copy constantly, and `.git` churn
would otherwise invalidate build inputs on every snapshot.

**The check runs the suite, not a separate copy.** `checks/default.nix` invokes
the same `node --test "tests/**/*.test.ts"` glob as `npm test`. A single source
of truth avoids the classic drift where CI passes and the local command does
not.

**`jujutsu` over `jj` in the dev shell.** nixpkgs has an unrelated package
named `jj` (the JSON Stream Editor). Pulling it into the shell would shadow the
Jujutsu binary on `PATH`. The shell therefore names the correct package,
`jujutsu`, whose binary is still `jj`.

**Test files use the quoted glob.** `node --test tests/` treats the directory
argument as a file and fails with `MODULE_NOT_FOUND`; Node does not scan a
directory argument. The quoted glob `"tests/**/*.test.ts"` is expanded by Node
itself, and an unmatched glob exits zero, which keeps a suite that skips cleanly
from turning the check red.

**TypeScript through Node type stripping.** Node 24 runs `.ts` directly, so the
tests need no compile step and no test framework dependency. `tsconfig.json`
still exists for `npm run typecheck`, which is the only step that needs `tsc`.

## Risks / Trade-offs

- [Host tools drift from what the flake expects] the versions are documented in
  `AGENTS.md` section 2 and the bootstrap is re-runnable, so a mismatch is
  visible immediately.
- [Non-native systems are not built during a local `nix flake check`] the check
  only builds the current system by default; `--all-systems` is available, and
  the outputs are still defined for all four.
- [`nix flake check` needs the flake tracked by git] because the repository is a
  git repository, new flake files must be staged (`git add`) before the first
  nix invocation; this is documented in the workflow notes.
