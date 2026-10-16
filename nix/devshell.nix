{
  mkShell,
  nodejs_24,
  python3,
  jujutsu,
  git,
  nixfmt,
}:

mkShell {
  packages = [
    nodejs_24
    python3
    jujutsu
    git
    nixfmt
  ];
}
