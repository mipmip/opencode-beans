{
  src,
  stdenv,
  nodejs_24,
}:

stdenv.mkDerivation {
  pname = "opencode-beans-tests";
  version = "0.1.0";

  inherit src;

  nativeBuildInputs = [ nodejs_24 ];

  dontBuild = true;
  doCheck = true;

  checkPhase = ''
    runHook preCheck
    node --test "tests/**/*.test.ts"
    runHook postCheck
  '';

  installPhase = ''
    runHook preInstall
    touch $out
    runHook postInstall
  '';
}
