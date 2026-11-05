# Quantum Leap release verification

## v1.2.1 LinkedIn-only reconciliation - November 5, 2026

Branch: `feat/v1.2.1-linkedin-reconciliation`, based on clean main at `2a602e9`. The candidate-supplied canonical LinkedIn specification replaces every prior resume, cover-letter, repository and candidate-confirmation career source. It is not represented as an independently scraped or certified LinkedIn record.

The current page, approved ambassador answers and rebuilt three-page public PDF contain precisely six roles, three education entries, five credentials, three projects and five top skills. All role bullets, types, dates and locations; education dates/grades/details; credential issuers/issue dates; project associations/descriptions and skills are represented. The explicit grades 3.4 and 3.2 are authorized public content; private phone, street address and personal email remain excluded. Master and bachelor entries are not described as awarded degrees. Goldman project awards now read 1st Place and 2nd Place Creativity Awards. AWS/IAM/SIEM/Linux listings do not become implementation, proficiency or additional certification claims.

Passed before release freeze:

- `npm run typecheck` and `npm run build`.
- `npm run verify`: 243 API regressions + all 33 unchanged privacy scanner cases; 186 source/public/client files scanned. Removed entities and unsupported details refuse exactly, including mixed requests, fabricated dates, injection, and tampered histories. Existing rate limits and optional-model post-checks remain enforced; tests isolate all provider credentials to prevent real model calls.
- `npm run verify:submission`: 132 canonical facts checked in both rendered HTML and the three-page PDF; all 17 entity answers and actual page anchors checked; recruiter questions, refusals and managed-provider routing passed.
- PDF pages rendered and visually reviewed: clean page breaks, all six roles on page two, all three projects on page three; no clipping or private contact header.
- Headless Chrome at 1440x900 and 390x844: exact entity inventories, no horizontal overflow, 120 decoded scroll frames, no idle game fetch, CLI/game launch, expansion/collapse, clean exit, unchanged document height and scroll position during CRT interaction, and zero uncaught page errors. Evidence: ignored `.qa/v121` screenshots and browser-results.json.

The audit generator now maps 223 factual/answer fields to LinkedIn source sections. The current verification report is regenerated independently of the historical Handshake submission packet. Historical documents outside the allowed edit scope are preserved and are not authority for the new site. No Replit AI, publishing, hosting or DNS operations are involved. The corrected OpenSSL configuration from main is retained. Protected animation/game/scanner files, old tags and old ZIPs are checked against saved pre-change fingerprints before export.

## v1.2.0 OpenSSL deployment configuration repair - November 5, 2026

The user authorized direct repair of Replit, prohibited Agent credit usage, and explicitly selected verification without publishing. Codex removed `replit.nix`'s `LD_LIBRARY_PATH` override through the existing Replit Shell. The platform-managed Node runtime could run with its own libraries, while the legacy override forced an incompatible OpenSSL 3.0.13 and prevented automatic npm installation. The corrected file has empty Nix dependencies and relies on `.replit`'s existing Node module. No application UI, source data, game assets, dependencies, security headers or version metadata were changed by this repair.

The same minimal configuration correction is applied locally. Only the `replit.nix` hash is refreshed in the current deployment baseline; all other 167 frozen entries are preserved. Existing release tags and archives remain historical originals. A separately named `quantum-leap-v1.2.0-replit-openssl-fix.zip` prevents a later import from restoring the defective override. Local typecheck, build, 142 API + 33 scanner regressions, submission checks and all 168 baseline hashes passed. Replit typecheck and production build passed after clearing the inherited library path for the current Shell. A new deployment install/publish was NOT attempted and is not claimed successful.

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
