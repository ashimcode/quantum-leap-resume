# Quantum Leap — visual resume v1.1.0

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
# In another terminal, or after stopping dev:
npm run verify
npm run build
npm run verify
npm run verify:submission
npm run verify:baseline
npm run start
```

The second grounding run scans built browser bundles. Windows can set PYTHON_BIN if Python is not on PATH; the existing verifier also supports a local .qa/python installation. No model credentials are needed. Standard OPENAI_API_KEY takes precedence over the managed Replit credential pair; configure either through server Secrets. OPENAI_MODEL is optional. Never commit environment files. See SECURITY.md for privacy, upstream retention, and per-process rate-limit boundaries.

## Release and submission

`v1.1.0` is the annotated official baseline. `RELEASE_BASELINE.json` records source/public hashes; `npm run verify:baseline` detects drift. Preserve the tag and make future changes on a new branch/version. The visual design, layout, CSS, media, canonical facts, and grounding verifier were not changed for packaging. A small server-only provider adapter adds managed Replit credentials without changing approved answer text or guards.

Read HANDSHAKE_SUBMISSION_PACKET.md for verified lists, adapted Agent prompts, the complete existing claim audit, publishing steps, and submission text. Prompt templates and exact original source line references are not claimed as available when absent. Replit publication and the live one-minute review are still required before submission.

```sh
python scripts/export-replit.py --output ../replit-quantum-leap-handshake.zip
```

The ZIP has application files at its root and an adjacent SHA-256 checksum and manifest. Dependencies, build output, Git metadata, QA artifacts, archives, and secrets are excluded. Only the approved public PDF is included. See V1_1_VERIFICATION.md for the measured engine behavior; rare timing outliers mean a universally locked 60 fps is not asserted.
