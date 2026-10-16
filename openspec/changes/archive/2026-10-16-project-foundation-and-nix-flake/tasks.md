## 1. Flake foundation

- [x] 1.1 Provide `flake.nix` listing the four supported systems and merging outputs with `nixpkgs.lib.genAttrs`, with `nixpkgs` as the only input; verify `nix flake show` lists `devShells`, `packages`, `checks` and `formatter` for every system
- [x] 1.2 Provide single-argument `nix/package.nix`, `nix/checks.nix` and `nix/devshell.nix` so `callPackage` injects dependencies; verify `nix flake check` evaluates them without errors
- [x] 1.3 Filter the flake source with `cleanSourceWith` to drop `.jj`, `.git`, `node_modules` and `result`; verify `nix build` reuses a stable store path
- [x] 1.4 Add `tests/unit/flake.test.ts` asserting the flake declares exactly the four supported systems, uses `genAttrs`, and has no `flake-utils` input; verify `npm test` reports the test passing

## 2. Development and test entry points

- [x] 2.1 Wire `package.json` scripts for `test`, `test:e2e` and `typecheck` to the built in `node:test` runner and `tsc`; verify the layout unit test covers the scripts and passes
- [x] 2.2 Wire `tsconfig.json` for the plugin and test sources; verify `npm run typecheck` succeeds after `npm install`

## 3. Verification

- [x] 3.1 Run `nix flake check` on the current system and confirm it passes without network access
- [x] 3.2 Run `nix build` and confirm the output contains the `beans-stats` plugin directory with both entrypoints
- [x] 3.3 Run `nix develop` and confirm Node 24, `jj`, `git` and `nixfmt` are available in the shell
