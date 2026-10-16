{
  mkShell,
  nodejs_24,
  jujutsu,
  git,
  nixfmt,
}:

mkShell {
  packages = [
    nodejs_24
    jujutsu
    git
    nixfmt
  ];
}
