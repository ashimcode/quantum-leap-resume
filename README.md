# Quantum Leap — visual resume v1.2.0

Ashim John's evidence-backed visual resume for an Entry-Level Cybersecurity & Cyber Risk Analyst role. Next.js, TypeScript, a continuous decoded-frame Canvas stage, retro CRT terminal, and a Virtual Ambassador limited to approved source excerpts.

## Current status

| Item | Status |
| --- | --- |
| v1.1 Scrollytelling Engine | Approved design frozen; 120 decoded frames; zero scroll-driven video seeks; performance limits documented |
| Grounded Virtual Ambassador | Deterministic pre/post checks; optional standard or Replit-managed server model |
| CarMechanicOS Easter egg | On-demand virtual CLI and opaque sandbox game inside the original CRT; isolated save/reset and modal expansion |
| Claim Audit | Canonical field references and source boundaries recorded; original source line precision remains limited |
| Redacted Public PDF | Approved sanitized PDF preserved unchanged |
| Replit Core Packaging | Root-level upload ZIP and submission packet prepared; public deployment pending |

## How this repository is used

This private application repository follows the evidence-first documentation and scoped conventional commits of [cybr-projects](https://github.com/ashimcode/cybr-projects). It contains deployable code, approved public assets, and sanitized release records. Engineering evidence stays linked to its source; private application materials stay local. Future modules must pass the source and privacy gates in CONTRIBUTING.md and ROADMAP.md.

## Quick start and verification

Node 20.9+ and Python 3 are required. CI uses Node 20 and Python 3.12.

```sh
npm ci
python -m pip install pypdf==6.21.4
npm run dev
# Stop the preview server before building in the same checkout:
npm run verify
npm run build
npm run verify
npm run verify:submission
npm run verify:baseline
npm run start
```

The second grounding run scans built browser bundles. Windows can set PYTHON_BIN if Python is not on PATH; the existing verifier also supports a local .qa/python installation. No model credentials are needed. Standard OPENAI_API_KEY takes precedence over the managed Replit credential pair; configure either through server Secrets. OPENAI_MODEL is optional. Never commit environment files. See SECURITY.md for privacy, upstream retention, and per-process rate-limit boundaries.

## Release and submission

`v1.2.0` is the user-approved release, locked on November 5, 2026, with an annotated tag on main and a versioned upload archive. It adds the scoped CarMechanicOS integration developed on feat/v1.2.0-carmechanicos. The v1.1.1 rollback tag remains unchanged. The scroll engine, canonical facts, ambassador component/route and public PDF are unchanged. The scanner retains 142 API regressions and 33 scanner regressions. `RELEASE_BASELINE.json` covers source, assets, verification scripts, workflows and release configuration. Future releases require an explicit new package version and `npm run release:freeze -- --version X.Y.Z`; existing tags and same-version manifests cannot be overwritten by that command.

## Hidden garage

The idle ASHIM JOHN name film, pause and retune controls remain available. Click the screen or >_ CLI on its bezel, then type:

```text
help
dir
cd Desktop
cd carmechanicos
dir
type README.txt
start game
```

`cd Desktop/carmechanicos` works from the virtual root. `play` and `carmechanicos.exe` also launch the garage. Tab completion, command history, `cd ..`, `cd ~`, `clear`, `reset` and `exit` are supported. This is a simulated filesystem, not access to the visitor's machine. Game achievements are fictional and do not establish resume credentials.

CLI and game components use next/dynamic with ssr:false and conditional mounting. No game files or CLI implementation are requested on idle load; the local game payload is about 1.2 MB and loads only on launch. The game is adapted from the quarantined source snapshot and reviewed alongside the sanitized carmechanicos-public snapshot 3af75da. Chart.js 4.5.1 and its MIT license remain local in public/carmechanicos/vendor; there is no remote font/CDN/backend setup.

The game runs in an opaque-origin srcdoc iframe with allow-scripts/allow-modals, without allow-same-origin, navigation or pop-up grants. A restrictive iframe CSP blocks network connections and forms. A source-window/session-validated message bridge exposes only two internal game slots, persisted under the single parent key `ql_carmechanicos_save_v1`. The parent accepts bounded values and never exposes other storage. The CLI reset or bezel RESET SAVE confirmation removes only this key; saves are browser-local and can be unavailable in private/restricted browsing.

EXPAND uses a native modal top layer while a measured placeholder preserves the footer footprint. COLLAPSE returns the same iframe to the footer. ESC / EXIT GAME unmounts the frame (destroying its timers and animation context) and restores CLI focus without scrolling. `exit` returns to the idle film. No game or CLI conversation is sent to the ambassador.

Acceptance ran in production Chromium at 1440x900 and 390x844 against an independently built v1.1.1 control: identical idle section geometry/footer height; no idle game downloads; CLI navigation/README/completion; game boot; opaque-origin/storage isolation; saved progress restored; expansion without iframe remount; unchanged document height/scroll on enter/expand/collapse/exit; reset preserves unrelated storage; 120 background frames still decoded; no uncaught browser errors. Local evidence lives under ignored .qa/v12-* files. Baseline geometry and game checks do not establish a universal FPS guarantee.

Read HANDSHAKE_SUBMISSION_PACKET.md for the historical v1.1.0 submission lists, adapted Agent prompts, existing claim audit, and Replit testing steps. Its verified resume content remains applicable; the game is an additional feature outside those historical submission instructions. Replit is a testing/submission environment; permanent hosting and a custom domain remain a separate decision. GEMINI_SYNC.md is the architectural handoff snapshot. Prompt templates and exact original source line references are not claimed as available when absent.

```sh
python scripts/export-replit.py --output ../quantum-leap-v1.2.0.zip
```

The ZIP has application files at its root and an adjacent SHA-256 checksum and manifest. Dependencies, build output, Git metadata, QA artifacts, archives, and secrets are excluded. Only the approved public PDF is included. See V1_1_VERIFICATION.md for the measured engine behavior; rare timing outliers mean a universally locked 60 fps is not asserted.
