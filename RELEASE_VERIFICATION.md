# Quantum Leap release verification

## v1.2.0 Replit packaging correction - November 5, 2026

The refreshed `quantum-leap-v1.2.0-replit.zip` narrows the application TypeScript project to `src/`, `next-env.d.ts`, and generated Next.js types. It excludes external Playwright files, tests, maintainer scripts, and local QA without disabling strict checking or adding test-runner dependencies. No runtime source, public asset, dependency, or version changes were made.

- Reproduced the reported missing `@playwright/test` and implicit-any errors using temporary root-level Playwright configuration and browser-test files under the old configuration.
- With those same stale files still present, the corrected `npm run typecheck`, `npm run build`, and `npm run verify` passed: 142 API regressions, 33 scanner regressions, and 186 source/public/client files scanned.
- Temporary reproduction files were removed before export. The updated Replit instructions clean stale Agent tests and build cache and install locked dependencies including build tools.
- Under the explicit deployment-repair authorization, only the `tsconfig.json` hash is refreshed in the 168-file v1.2.0 baseline. The existing annotated `v1.2.0` tag and general `quantum-leap-v1.2.0.zip` remain unchanged; the refreshed Replit ZIP has its own regenerated checksum and manifest. The tagged source represents the original release; the corrected deployment package is tracked in a separate follow-up commit.

## v1.1.1 maintenance release - November 5, 2026

Release scope: scanner/release tooling and documentation only. No src/ or public/ changes. Verification sequence: version bump, typecheck, production build, 142 API + 33 scanner regressions, submission checks, explicit new-version freeze, baseline check, and versioned ZIP export. Release completion is evidenced by the v1.1.1 commit/tag and GitHub Actions results.

The additional scanner cases cover minified adjacent rules, private content adjacent to an allowed rounded-full rule, and a spoofed custom property. The supplied private number is constructed at test runtime rather than stored verbatim in the repository. The v1.1.0 tag and original replit-quantum-leap-handshake.zip remain preserved. Permanent hosting is not being assigned to Replit.

## Historical v1.1.0 verification

Release date: November 4, 2026. This is an official source baseline and upload package, not a claimed live Replit deployment.

## Passed locally

- Production build and TypeScript checks: exit 0.
- Unchanged grounding/privacy verifier: 142 API regressions; 172 source/public/client files scanned, including built client bundles and PDF text/metadata.
- Dedicated submission checks: all seven recruiter phrasings answer with approved excerpts and deep-links to actual rendered HTML IDs. Eight unsupported/injection cases return the exact required refusal. The exact two-part Handshake injection payload is included.
- Managed provider routing: mock-verified endpoint, authorization, standard-key precedence, missing/invalid configuration, and store:false. Existing model pre/post checks remain active. No real provider credentials or production gateway calls were required.
- Release baseline: 139 normalized-source / exact-binary hashes recorded. The v1.1 visual source, canonical data, public PDF/media, and original verifier are preserved; only a server-side provider adapter was added to the route.
- Dependency lockfile preparation reported zero npm audit findings in this environment. This is not a guarantee against future advisories.
- Headless browser: 390 px width without horizontal overflow, Tab focus with solid outline, public PDF HTTP 200 with PDF signature, and GitHub profile HTTP 200. LinkedIn URL is correct, but LinkedIn blocks automated requests with HTTP 999; live manual verification remains required.
- Supplied private contact values were checked in source, compiled HTML, and client bundles without copying those values into repository files. PDF text and metadata passed the existing generic privacy scan.
- Original page.tsx, globals.css, and UndergroundScrollStage.tsx match their approved pre-release byte hashes. No design edits were made during packaging.

## Publishing gates and evidence limits

- Replit Core import, a live managed gateway, public deployment, production proxy/edge rate limits, and a friend/colleague one-minute review still require the actual deployment environment.
- Original source line precision and verbatim Handshake Agent prompt templates are not available in this application evidence set. The submission packet explicitly labels adapted prompts and reproduces the current canonical claim audit without inventing citations.
- Local v1.1 performance measurements are preserved in V1_1_VERIFICATION.md. Rare frame-time outliers remain; do not advertise an unconditional locked 60 fps.
- GitHub source must remain private; the recruiter-facing production page may be public only after the normal privacy checks.
