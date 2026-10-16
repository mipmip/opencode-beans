{
  description = "Beans stats sidebar plugin for OpenCode v2";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs =
    { self, nixpkgs }:
    let
      systems = [
        "x86_64-linux"
        "aarch64-linux"
        "x86_64-darwin"
        "aarch64-darwin"
      ];
      forAllSystems = nixpkgs.lib.genAttrs systems;
      each = f: forAllSystems (system: f nixpkgs.legacyPackages.${system});
      src = nixpkgs.lib.cleanSourceWith {
        src = ./.;
        filter =
          path: type:
          !(builtins.elem (baseNameOf path) [
            ".jj"
            ".git"
            "node_modules"
            "result"
          ]);
      };
    in
    {
      packages = each (pkgs: {
        default = pkgs.callPackage ./nix/package.nix { inherit src; };
      });

      checks = each (pkgs: {
        default = pkgs.callPackage ./nix/checks.nix { inherit src; };
      });

      devShells = each (pkgs: {
        default = pkgs.callPackage ./nix/devshell.nix { };
      });

      formatter = each (pkgs: pkgs.nixfmt);
    };
}
