{ pkgs }: {
  # Node and its matching libraries come from .replit's nodejs-20 module.
  # A separate OpenSSL search path can break Node before npm even starts.
  deps = [];
}
