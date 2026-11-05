# Quantum Leap — visual resume v1.1.1

Ashim John's evidence-backed visual resume for an Entry-Level Cybersecurity & Cyber Risk Analyst role. Next.js, TypeScript, a continuous decoded-frame Canvas stage, retro CRT terminal, and a Virtual Ambassador limited to approved source excerpts.

## Current status

| Item | Status |
| --- | --- |
| v1.1 Scrollytelling Engine | Approved design frozen; 120 decoded frames; zero scroll-driven video seeks; performance limits documented |
| Grounded Virtual Ambassador | Deterministic pre/post checks; optional standard or Replit-managed server model |
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

`v1.1.1` is the privacy-scanner maintenance release. Runtime files under src/ and public/ match the preserved `v1.1.0` tag. The scanner has 142 API regressions and 33 scanner regressions, including minified CSS adjacency, adjacent private content, and custom-property spoofing. `RELEASE_BASELINE.json` now covers source, assets, verification scripts, workflows, and release configuration. Future releases require an explicit new package version and `npm run release:freeze -- --version X.Y.Z`; existing tags and same-version manifests cannot be overwritten by that command.

Read HANDSHAKE_SUBMISSION_PACKET.md for the historical v1.1.0 submission lists, adapted Agent prompts, existing claim audit, and Replit testing steps. Its application content remains applicable because runtime files are unchanged. Replit is a testing/submission environment; permanent hosting and a custom domain remain a separate decision. GEMINI_SYNC.md is the architectural handoff snapshot. Prompt templates and exact original source line references are not claimed as available when absent.

```sh
python scripts/export-replit.py --output ../quantum-leap-v1.1.1.zip
```

The ZIP has application files at its root and an adjacent SHA-256 checksum and manifest. Dependencies, build output, Git metadata, QA artifacts, archives, and secrets are excluded. Only the approved public PDF is included. See V1_1_VERIFICATION.md for the measured engine behavior; rare timing outliers mean a universally locked 60 fps is not asserted.
