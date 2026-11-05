# Replit OpenSSL repair - November 5, 2026

## Outcome and cost boundary

The conflicting legacy Nix library override was removed directly in the user's existing Replit Shell, without sending messages to Replit Agent or using Agent AI actions. The user explicitly chose **fix and verify only; do not publish**. No publish, plan change, credit purchase, or paid Agent task was initiated. This is not a claim that platform hosting/workspace compute is free or that the live deployment was updated.

## Confirmed cause and change

Automatic deployment package installation failed before the Next.js build. Replit's managed Node executable required newer OpenSSL symbols but inherited a `replit.nix` override pointing to OpenSSL 3.0.13. Empty values in later build settings did not remove that earlier Nix environment setting.

The repaired Nix file is identical locally and in Replit:

```nix
{ pkgs }: {
  # Node and its matching libraries come from .replit's nodejs-20 module.
  # A separate OpenSSL search path can break Node before npm even starts.
  deps = [];
}
```

The `.replit` Node module remains responsible for Node and its matching libraries. No application source, game/media/PDF assets, verified claims, ambassador behavior, dependencies, or production security headers were changed by this repair. Replit already had empty Nix deps; the canonical local file also removes the redundant Nix Node/OpenSSL packages.

An already-open Shell still inherited the old variable after editing the file. Tests were initially run with `env -u LD_LIBRARY_PATH`; the current Shell variable was subsequently unset. Removing the Nix source override is the persistent fix for new environments. An existing Shell workaround alone would not establish a deployment-install repair.

## Verification

| Check | Result |
| --- | --- |
| Managed Replit runtime without conflicting override | Node v20.20.0; bundled OpenSSL 3.6.0; npm 10.8.2 |
| Replit npm run typecheck | passed |
| Replit npm run build | passed, including TypeScript and page generation |
| Replit npm run verify | 142 API + 33 scanner regressions passed; 188 source/public/client files scanned |
| Replit npm run verify:submission | passed |
| Nix configuration syntax | parsed successfully with nix-instantiate |
| Preview homepage / redacted PDF / game asset | each returned HTTP 200 in the cleaned Shell |
| Local typecheck / build / verify / submission | passed; 142 API + 33 scanner cases; 186 scanned files |
| Local deployment baseline | all 168 hashes passed after refreshing only replit.nix |
| New deployment package-install / publish stage | NOT attempted; user prohibited publishing |

The Replit verifier initially could not import pypdf from the system Python. An existing copy in `.pythonlibs/lib/python3.13/site-packages/pypdf` was copied into ignored `.qa/python/pypdf`, which the verifier already supports. No application dependency or verification rule was changed, and no new PDF package was downloaded.

## Process and backup state

- Replit backup: `.qa/codex-openssl-fix/replit.nix.before`.
- Only the observed project-owned Next dev processes were stopped before the production build.
- A temporary Replit dev server on port 5000 was used for HTTP checks, then stopped. Preview was restored through Replit's normal Run workflow on the same port; its homepage returned HTTP 200. The temporary log remains at `.qa/codex-openssl-fix/preview.log`.
- Existing Replit port-5000 scripts, workflows and development-preview config remain platform-specific differences. They were inspected but not copied wholesale into local source. The canonical package continues using port 3000 consistently in package scripts and `.replit`.
- The Replit release baseline was not silently rewritten to bless unrelated Agent changes. The canonical local baseline refresh is limited to this explicit configuration repair.

## Artifacts and release identity

The corrected export is `../quantum-leap-v1.2.0-replit-openssl-fix.zip`, with adjacent SHA-256 and per-file manifest. It keeps application version 1.2.0 and the approved runtime source. Old ZIPs remain historical originals and contain the obsolete Nix setting. Existing v1.1.0, v1.1.1 and v1.2.0 tags are not moved.

Corrected archive SHA-256: `8b2b07dc1cee01149f006176f7924f57f612c807f622e707eeb9d1f79fbb65f9` (12,790,742 bytes; 188 allowlisted files). Archive integrity, every per-entry hash, the exact corrected Nix file, seven game assets, privacy exclusions, untouched src/public diff and original release tag were verified.

The existing Replit workspace is already patched and does not require importing that ZIP. Importing a full canonical archive over it would also overwrite its platform settings; reconcile those separately before any future full import. A future publish must be explicitly authorized and must be verified independently of successful Shell builds. Until then, the older live deployment and any old publishing-error badge remain unchanged.
