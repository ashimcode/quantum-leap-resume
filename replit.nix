{ pkgs }: {
  # nodejs_20 includes the npm CLI. This supports older Nix-based workspaces.
  deps = [
    pkgs.nodejs_20
    pkgs.openssl
  ];
  env = {
    LD_LIBRARY_PATH = pkgs.lib.makeLibraryPath [ pkgs.openssl ];
  };
}
