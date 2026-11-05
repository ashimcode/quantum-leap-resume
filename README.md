# Quantum Leap — visual resume v1.2.3

Ashim John's visual resume, grounded exclusively in his candidate-supplied canonical LinkedIn specification. Next.js and TypeScript power a full-viewport, four-camera surveillance visual simulation, a sandboxed retro CRT game, and a Virtual Ambassador restricted to approved excerpts.

## Current status

| Item | Status |
| --- | --- |
| Camera study | One fixed camera and tracking canvas from hero to footer. Four silent H.264 feeds, three modes, scroll optics and pointer inspection. |
| Local security checks | Static analysis, dependency audit, credential checks, configuration and production HTTP tests. |
| Grounded Virtual Ambassador | 249 API regressions; deterministic pre/post checks; optional server model |
| CarMechanicOS Easter egg | Preserved on-demand CLI and opaque-origin sandbox; isolated save/reset and modal expansion |
| Claim Audit | 224 field-to-source rows; LinkedIn-only career authority; GitHub authorized as public contact only |
| Redacted Public PDF | Three regenerated and visually reviewed pages; LinkedIn facts and public GitHub link |
| Replit Core Packaging | v1.2.3 root-level ZIP with checksum and manifest. Live deployment is v1.2.1. |

## How this repository is used

The private application repository follows the evidence-first documentation and scoped conventional commits of [cybr-projects](https://github.com/ashimcode/cybr-projects). Local source and GitHub remain authoritative. Career facts, approved answers and the public PDF derive from `src/data/verifiedSources.ts`. The current inventory is exactly six roles, three education entries, five certifications, three projects and five top skills. GitHub is a candidate-authorized navigation/contact link, never evidence for an additional career claim.

Historical submission packets and version tags remain historical records; use the current claim audit for current content. Future claims require the source and privacy checks in CONTRIBUTING.md. No personal phone, street address or personal email belongs in public assets.

## Quick start and verification

Use Node 20.9+ and Python 3.11+. CI uses Node 20 and Python 3.12.

```sh
npm ci
python -m pip install pypdf==6.21.4
npm run dev
# Stop the preview server before building in the same checkout:
npm run typecheck
npm run build
npm run verify
npm run verify:submission
npx playwright install chromium webkit
npm run verify:browser
npm run verify:baseline
npm run start
```

The grounding run scans source, public assets, generated client bundles and PDF text/metadata. It also runs the five local security checks. Run `npm run verify:security` after a production build to run those checks independently. See BROWSER_TESTING.md for browser coverage and evidence limits. All 33 scanner boundary cases remain enforced. No model credentials are required for verification; provider calls are mocked. Optional server Secrets use OPENAI_API_KEY or the managed Replit credential pair. See SECURITY.md for retention and per-process rate-limit boundaries.

To rebuild the public PDF, install reportlab, pypdf and pypdfium2 in your Python environment, then run `npm run resume` and `python scripts/build_resume.py`. Review the three rendered pages under ignored `.qa/resume-render/`.

## Surveillance visual simulation

`QuantumHeroBackground.tsx` renders one fixed camera and canvas from hero to footer. Scroll depth adjusts the camera framing and keeps the canvas aligned. The chapter HUD reports the current section, and the `SIM / CAM` button opens the camera study throughout the page. One camera is randomly selected after hydration, and only the active camera is requested. Four silent, metadata-stripped H.264 files plus JPEG stills live under `public/surveillance/`; the videos total 7,007,648 bytes.

HYBRID_CV, YOLO_BOXES and SLAM_KEYPOINTS are visualization modes, not inference models. A small offscreen luminance/motion sample guides authored per-camera zones and image-gradient keypoints. The high-DPI canvas interpolates between samples and targets 60 fps without React updates on each frame. Percentages and class labels are authored, explicitly marked SIM. Target-lock telemetry labels redaction as DEMO and model audit as NOT RUN. No recognition model, biometric identification, PII redaction or security audit actually runs.

The canvas leaves foreground controls and links interactive. Header FX cycles through FULL, REDUCED, and OFF. System reduced-motion preferences take precedence and use a still. Playback and animation pause when the document is hidden. Blocked playback displays a still and a retry control.

## Hidden garage

The original idle ASHIM JOHN CRT signal, pause and tune controls remain. Open >_ CLI and type:

```text
help
cd Desktop/carmechanicos
type README.txt
start game
```

`play` and `carmechanicos.exe` also work. Tab completion, history, directory navigation, clear, reset and exit are supported. This is a virtual filesystem. The game is a fictional easter egg, not a LinkedIn career project.

The on-demand game runs in an opaque-origin srcdoc iframe. Its restrictive CSP blocks network connections/forms, and a source-window/session-validated bridge exposes only bounded internal save slots under `ql_carmechanicos_save_v1`. Reset removes only that key. EXPAND uses the modal top layer while a placeholder preserves footer geometry. COLLAPSE retains the same frame; ESC / EXIT GAME unmounts it, cancels its execution context and restores CLI focus without scrolling.

## Release and deployment

v1.2.3 is prepared on `feat/v1.2.3-unified-surveillance-and-security`. The current live release is v1.2.1. [Quantum Leap](https://quantum-leap-interactive.replit.app/)

After explicit versioning, use a new version for every freeze. The freeze script refuses existing tags or same-version manifests.

```sh
npm version X.Y.Z --no-git-tag-version
npm run release:freeze -- --version X.Y.Z
npm run verify:baseline
python scripts/export-replit.py --output ../quantum-leap-vX.Y.Z-replit.zip
```

The exporter recursively includes public assets and explicitly requires all four surveillance feeds and posters. It excludes dependencies, build output, Git/QA files, archives and secrets. Only the approved public PDF is included. A checksum and per-entry manifest accompany the ZIP.

Do not blindly overwrite a running Replit workspace: preserve its documented port-5000 scripts/workflows and development preview overlays when applying the update. Canonical local scripts use port 3000. Keep platform-managed Node and the corrected empty `replit.nix` dependency set; never reintroduce the conflicting OpenSSL library-path override. No Replit Agent credits are needed. A permanent host/custom domain remains a separate decision.
