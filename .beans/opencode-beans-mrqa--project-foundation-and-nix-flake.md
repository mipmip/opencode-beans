---
# opencode-beans-mrqa
title: Project foundation and nix flake
status: completed
type: epic
priority: high
created_at: 2026-10-16T13:45:30Z
updated_at: 2026-10-16T13:55:07Z
parent: opencode-beans-6tzv
---

Goal: make the repository buildable, testable and reproducible with plain nix flakes before any plugin behavior is written.

Deliverables:
- flake.nix with the four supported systems listed explicitly, no flake-utils.
- devShells.default providing Node 24 and the toolchain.
- packages.default assembling the plugin.
- checks.default running the unit and integration suite.
- package.json and tsconfig.json wired to node:test and tsc.
- OpenSpec config, AGENTS.md and the beans roadmap in place.

Definition of done:
- nix develop drops into a working shell.
- nix flake check passes.
- nix build produces the plugin output.
- The OpenSpec change is archived and committed as Pim Snel.

OpenSpec capability: project-foundation.



## Summary of Changes

Delivered in change project-foundation-and-nix-flake (archived 2026-10-16).

- flake.nix with the four supported systems via nixpkgs.lib.genAttrs, nixpkgs as the only input.
- nix/package.nix, nix/checks.nix and nix/devshell.nix as single-argument modules for callPackage.
- devShells.default with Node 24, jujutsu, git and nixfmt. The shell uses jujutsu because nixpkgs jj is an unrelated package.
- packages.default assembles the beans-stats plugin directory.
- checks.default runs the node:test suite in a pure sandbox.
- package.json and tsconfig.json wired to node:test and tsc; jsxImportSource is @opentui/solid.
- tests/unit/flake.test.ts guards the plain-flake invariants.
- Main spec openspec/specs/project-foundation/spec.md.
