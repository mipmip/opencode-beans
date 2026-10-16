{
  mkShell,
  nodejs_24,
  jj,
  git,
  nixfmt,
}:

mkShell {
  packages = [
    nodejs_24
    jj
    git
    nixfmt
  ];
}
