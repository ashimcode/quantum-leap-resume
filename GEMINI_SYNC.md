# Codex -> Gemini: Quantum Leap architecture sync prompt

## v1.2.0 feature update (supersedes the historical game status below)

The user authorized reintegration on feat/v1.2.0-carmechanicos, created from clean main at v1.1.1 (81da231). The active RetroNameTerminal now conditionally loads a virtual filesystem CLI and a sandboxed local CarMechanicOS game. No scroll-engine, canonical-data, ambassador component/API, or PDF changes were made. Old tags and ZIPs are protected.

All feature gates passed in order: typecheck; production build; 142 API + 33 scanner regressions (186 files scanned); submission checks; desktop/mobile Playwright comparison against a separately built v1.1.1 control. Native modal expansion originally collapsed page flow; a reserved monitor footprint corrected that before acceptance. Idle geometry, scroll position, frame lifecycle, lazy fetching, save/relaunch, reset isolation, and CLI focus restoration were verified at 1440x900 and 390x844. Sandbox tests confirmed parent-document and direct storage access are blocked. Game achievements are fictional, not new resume claims.

Save key: ql_carmechanicos_save_v1. Game assets are about 1.2 MB, fetched only after launch; the iframe is opaque origin, has no network access, and communicates with a source/session-checked parent bridge. Closing it destroys game timers/rAF context. EXPAND/COLLAPSE preserves iframe identity. The name signal, pause and tune remain the initial state. Source: quarantined game assets reviewed alongside carmechanicos-public 3af75da; local Chart.js license retained.

The local v1.2.0 package/manifest freeze passed all 168 hashes. Changes are saved in a local feature-branch commit so main remains a clean v1.1.1 rollback point. The current task does not authorize a merge, new Git tag, push, hosting deployment, domain change, or overwrite of earlier upload archives. The required npm version command also updates package-lock version metadata to keep the lockfile consistent. Read README for controls and .qa/v12-acceptance.json for measured local evidence. Original integration/history folders stay where they were.

> Historical handoff snapshot from before Phase 1. The user subsequently authorized the v1.1.1 scanner/release sequence: three adversarial cases were added (33 scanner cases total), and the maintenance release is prepared on sync/replit-reconciliation before merge to main. Use the current package version, release manifest, tags, and CI as the final release authority; statements below about pending verifier drift describe the earlier audit, not the new frozen release.

Gemini, act as the architectural prompt planner for the next Quantum Leap engineering work. Treat this as an audited state report, not an instruction to rebuild the approved site. Distinguish verified observations, reported Replit findings, historical documents, and future plans. Produce bounded implementation prompts with explicit prerequisites, file scope, acceptance checks, and rollback steps.

## 1. Source of truth and hosting decision

- Canonical workspace: `C:\Users\admin\Desktop\QuantumLeap V1\preview-site`.
- Canonical private GitHub repository: https://github.com/ashimcode/quantum-leap-resume . GitHub CLI confirmed PRIVATE visibility and main as the default branch.
- Local changes become shared truth only after review, commit, and push. This sync branch is NOT yet committed or pushed.
- Replit is a testing/import/submission environment, NOT the permanent production domain. Do not design future infrastructure around a permanent Replit hostname.
- Preserve the approved layout, typography, dark underground aesthetic, animated footage, CRT name display, verified source data, and grounded ambassador. No runtime/UI source or public asset was changed during this reconciliation.

## 2. Git state and release identity

Before this audit, active main was clean and matched origin/main and annotated tag v1.1.0:

| Item | Verified value |
| --- | --- |
| main / origin/main / tag target | a2941e279fc9b2a3a081f1c735ce03e052c892b2 |
| Annotated tag object v1.1.0 | 359662e49539b764796eb2d1283472b4e95f104c |
| Current working branch | sync/replit-reconciliation |
| Branch HEAD | Same commit as main; reconciliation edits are uncommitted |
| package version | 1.1.0; no new release version assigned |
| Conflicts | No merge conflict markers or unresolved Git merge state observed |

Existing commits:

1. `4f43565 feat(quantum-leap): lock v1.1 scrollytelling resume and grounded ambassador`
2. `ee48058 security(repo): enforce zero-PII redaction and portfolio boundary`
3. `a2941e2 docs(repo): add status table, security policy, and Handshake submission packet`

The authenticated CLI can access this private repository. The connected GitHub plugin returned 404 for it; do not mistake that connector-access limitation for deletion of the repository. Remote refs were verified with git ls-remote, and visibility was checked with gh.

No tag was moved, no history rewritten, no new release created, no push performed, and no existing ZIP overwritten during this audit.

## 3. Workspace and file tree audit

```text
C:\Users\admin\Desktop\QuantumLeap V1\
|-- preview-site\                    ACTIVE Next.js application and Git repository
|   |-- src\app\page.tsx              approved single-page visual resume
|   |-- src\app\globals.css           approved visual styling
|   |-- src\app\api\ambassador\route.ts
|   |-- src\components\UndergroundScrollStage.tsx
|   |-- src\components\RetroNameTerminal.tsx
|   |-- src\components\RetroNameTerminal.css
|   |-- src\components\VirtualAmbassador.tsx
|   |-- src\data\verifiedSources.ts    sole canonical public knowledge base
|   |-- src\lib\grounding.ts
|   |-- src\lib\conversation.ts
|   |-- src\lib\model-provider.ts
|   |-- public\underground-frames\     120 JPEG frames
|   |-- public\underground-reel.mp4
|   |-- public\name-signal.mp4
|   |-- public\name-signal-poster.jpg
|   |-- public\resume-public.pdf       only approved public PDF
|   |-- scripts\verify-grounding.ts    reconciled locally; not yet released
|   |-- scripts\privacy-scanner.ts     new local scanner implementation
|   |-- scripts\verify-privacy-scanner.ts  30 new scanner cases
|   |-- scripts\verify-submission.ts
|   |-- scripts\verify-baseline.mjs    now reads manifest version dynamically
|   |-- scripts\freeze-release.mjs     new explicit new-release manifest operation
|   |-- scripts\generate-submission.ts  no longer silently rewrites the baseline
|   |-- scripts\export-replit.py       ZIP + checksum + per-file manifest exporter
|   |-- RELEASE_BASELINE.json          original v1.1.0 baseline, preserved
|   |-- .github\workflows\verify.yml
|   |-- GEMINI_SYNC.md                 this prompt/report
|   `-- .qa\                          ignored local diagnostic artifacts/fixtures
|-- resume-site\                      historical planning/source-review scaffold
|-- reverted-crt-integration-20261104-164426\  quarantined integration and QA notes
|-- exports\                          historical archives
|-- replit-quantum-leap-handshake.zip
|-- replit-quantum-leap-handshake.sha256
`-- replit-quantum-leap-handshake.manifest.json
```

`resume-site` has older configuration, planning documents, and generated remnants, but no active src tree. Do not use its package/configuration as the application source. It contains LINKEDIN_SOURCE_REVIEW.md and WEBSITE_ROADMAP.md; private source documents must not be copied into the public application.

There is currently NO `QuantumLeap V1\CarMechanicOS` folder. Original game checkouts are here:

| Folder under C:\Users\admin\Desktop\junk projects | HEAD | Working status |
| --- | --- | --- |
| carmechanicos | 4c48b04 - Fix progression persistence and certified dispatch | clean |
| carmechanicos-public | 3af75da - security(public): remove local path wording | clean |
| carmechanicos-documentation | b62fac4 - Add CarMechanicOS build documentation | clean |

The rollback archive still contains CarMechanicCLI.tsx, CarMechanicEasterEgg.tsx, CarMechanicEasterEgg.css, and public/carmechanicos assets. Its README describes the integration as active: that wording is HISTORICAL AND STALE. Files in active preview-site and the rollback report take precedence. Do not edit or delete the archive merely to make its prose current.

## 4. Feature status

### Scroll stage: active, approved, unchanged

Single fixed Canvas 2D stage; 120 asynchronously decoded images; adjacent-frame blending; native playback fallback; no scroll-driven video seeking; ref-based damping, cursor effects, continuous scene windows, native chapter navigation, reduced motion, and DPR cap 1.5. Main page still identifies data-engine="v1.1".

Use "60 fps target" rather than claiming guaranteed locked performance. Previous measured high-refresh Chromium run: median 4.2 ms, p95 8.2 ms, max 112.5 ms, zero background video seek events. Rare outliers occurred. Those performance measurements were not rerun in this audit. Decoded-frame memory (~95-149 MB on the intended ImageBitmap path) remains a mobile-budget consideration.

### Grounded Virtual Ambassador: active, approved, unchanged

Canonical facts in verifiedSources.ts; deterministic routing and approved excerpts; privacy and prompt-injection rejection before optional model calls; answer-ID-only model selection and post-checks. Exact unsupported refusal remains: "I don't have verified information about that."

Server-only standard and Replit-managed credential configuration exists in model-provider.ts. No key is needed for deterministic answers. The current application logs/stores no chat content; upstream provider and hosting retention are separate. Preserve these qualifications.

### CRT and CarMechanicOS: distinguish them

The active CRT is the animated ASHIM JOHN name terminal with pause, retune, and proximity effects. There are NO active CarMechanic imports/components/assets in preview-site. The CLI, sandboxed game, monitor expansion, isolated storage key, and game saves are reverted experiments, not merged features. No attempt to reinstate them was made here. A future integration needs a separate branch, explicit user approval, isolated QA, and visual regression checks across the entire scroll page.

## 5. Replit findings reconciled locally

### A. rounded-full privacy false positive: implemented and tested locally

Before this audit, the local scanner lacked a CSS rounded-full exception and globally masked three numeric strings inside generated JS. The exact Replit patch was not imported: it was not available as a reviewed source diff. A local equivalent was implemented, with stronger syntax scoping.

- New scripts/privacy-scanner.ts exempts only the generated `.rounded-full { border-radius: 2147483647px }` rule in .next/static CSS, allowing ordinary formatting whitespace.
- The same number in other rules, source CSS, public CSS, comments, strings, or URLs remains subject to detection. There is no stylesheet-wide exemption.
- Existing necessary generated-JS constants are recognized through TypeScript AST context instead of globally whitelisting their digit strings. Comments and unrelated strings/URLs cannot inherit those syntax exemptions.
- scripts/verify-grounding.ts now calls the scanner and 30 regression cases. The existing 142 API cases are retained.
- This is a local, unreleased reconciliation; do not say the private GitHub repository already contains it.

### B. Frozen baseline versus archive checksums: separated explicitly

These are different controls:

1. RELEASE_BASELINE.json hashes frozen application files. It currently records v1.1.0.
2. The ZIP .sha256 hashes one exact archive.
3. The ZIP .manifest.json contains that archive hash and per-entry hashes.

The original upload ZIP/checksum/manifest were checked and still agree. Original ZIP SHA-256:
`e80b68e35b144815afeb725325f49d965cde9803fff16d969cfec0145fd77bab`

The new local verifier intentionally differs from the frozen v1.1.0 hash. Therefore `npm run verify:baseline` currently FAILS on scripts/verify-grounding.ts. This is expected detected drift, not a passing check. All runtime src/public files still match v1.1.0. Do not hide this by overwriting the old release manifest or weakening the check.

Changes prepared for future releases:

- verify-baseline.mjs compares the package version with baseline.version instead of hard-coding 1.1.0; it supports existing and new normalization schemas.
- New `npm run release:freeze -- --version X.Y.Z` requires matching package/lockfile versions, refuses an existing Git tag or same-version manifest rewrite, and hashes src/public/scripts/workflow/config files.
- generate-submission.ts now writes the submission packet only; it cannot silently reset the frozen-release manifest.
- The exporter already regenerates both ZIP sidecars from exact archived bytes. It was exercised in an ignored isolated fixture, without replacing the official ZIP. The temporary candidate ZIP includes unreleased changes and an old baseline; it is NOT approved for upload.

Suggested next approved release sequence (not executed):

```sh
# First review all changes and approve a new version, such as 1.1.1.
npm version 1.1.1 --no-git-tag-version
npm run typecheck
# Stop the owned preview server before any build in this working directory.
npm run build
npm run verify
npm run verify:submission
npm run release:freeze -- --version 1.1.1
npm run verify:baseline
# Regenerate release docs/versioned wording; review staged changes; commit.
# Export to a NEW versioned filename, preserving the v1.1.0 archive.
python scripts/export-replit.py --output ../quantum-leap-v1.1.1.zip
# Review archive/sidecars; create a NEW annotated tag only after acceptance.
```

Do not blindly regenerate the Handshake packet yet: its prose is still v1.1.0/Replit-oriented and needs an authorized version/hosting documentation update for a new permanent-host release.

### C. Proxy rate-limit parsing: inspected, deliberately unchanged

Default is a safe shared anonymous bucket, 15 attempts/minute/process. TRUST_PROXY=true currently uses the first X-Forwarded-For entry. Changing to the right-most entry without knowing trusted hops would not establish the real client identity either. Do not enable TRUST_PROXY or select a platform client-IP header until its trusted ingress contract is documented and tested. The map is not a distributed quota; serverless/Autoscale needs an edge or shared limiter if a global per-client limit is required.

## 6. Verification performed in this audit

| Check | Result |
| --- | --- |
| Clean starting main and remote/tag comparison | passed |
| Git diff v1.1.0 -- src public | empty; runtime/UI/data/assets unchanged |
| npm run typecheck | passed |
| npm run verify | passed: 142 API + 30 scanner regressions; 172 scanned files including existing production bundles/PDF |
| npm run verify:submission | passed |
| npm run verify:baseline after scanner change | expected failure: verifier hash differs; not release-ready |
| Existing v1.1.0 ZIP + checksum + manifest | consistent, preserved |
| New-version manifest operation in isolated fixture | passed |
| Same-version manifest rewrite refusal in isolated fixture | passed |
| Attempt to freeze existing v1.1.0 tag | correctly refused |
| Candidate archive and sidecar regeneration in isolated fixture | passed |
| Current full production rebuild / browser benchmark | not rerun during this audit; no runtime files changed |

Current modified tracked files: package.json; scripts/verify-grounding.ts; scripts/verify-baseline.mjs; scripts/generate-submission.ts. New local files: scripts/privacy-scanner.ts; scripts/verify-privacy-scanner.ts; scripts/freeze-release.mjs; GEMINI_SYNC.md. There is no integration merge conflict, but these changes are not committed, pushed, tagged, or reflected in the official upload ZIP.

## 7. Hosting and permanent domain readiness

This is a Next.js App Router application with a POST API, not a purely static site. GitHub Pages alone cannot run the current ambassador API. Keep the repository private; grant only necessary hosting integration access.

Candidate routes:

- Vercel: native Next.js/GitHub workflow, preview deployments, and a production branch/custom domain. This is the least migration-heavy candidate for the current app; cost/account limits and production Node support still need checking in the selected account. Official references: https://vercel.com/docs/git/vercel-for-github and https://vercel.com/docs/domains/set-up-custom-domain .
- A Node/Docker host connected to GitHub: npm ci, npm run build, npm run start, host-required port binding, TLS/reverse proxy, secrets, health checks, and a rollback path. Current scripts bind 0.0.0.0:3000; evaluate dynamic PORT requirements for the chosen platform.
- Cloudflare Workers: evaluate runtime/adapter compatibility separately. Current official guidance recommends vinext; OpenNext is another path, not an automatic drop-in claim. Do not silently migrate this frozen Next.js 16 project. Validate node:crypto/node:net, route behavior, model timeouts, headers and CI in a separate branch first. References: https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/ and https://developers.cloudflare.com/workers/framework-guides/web-apps/opennext/ .

Before a custom domain is ready: choose the provider and domain owner, authorize the private-repo integration, configure production secrets (or keep deterministic mode), define proxy/edge rate limiting, deploy a preview, test assets/PDF/ambassador/refusals/mobile/reduced-motion, add domain/DNS using provider-generated records, verify TLS and canonical www/apex redirects, then update public submission links. No host account, domain purchase, DNS change, or production deployment was performed in this audit.

Keep existing Replit deployment files and old Handshake artifacts as historical/testing material for now. Do not treat their old Replit-hosted instructions as the new permanent-host plan.

## 8. Multi-chat coordination and Replit evidence limits

Earlier concurrent work rebuilt .next while an older production preview process remained running, creating a plausible stale-asset mismatch. Separate ports alone do not isolate Next.js build output. Use separate checkouts/output directories or stop the owned server before rebuilding. Do not restart another chat's processes without coordinating ownership.

The prior Replit live inspection found v1.1 markup but no initialized canvas/data-motion attributes, indicating client startup/hydration had not completed. Exact root cause was not established because deeper debugging permission was declined. Subsequent Replit fixes, its reported 30-case scanner implementation, and the reported published URL have not been independently re-audited here. Request sanitized Replit diffs before claiming its entire workstream is reconciled; do not use Replit as a second source of truth.

## 9. Requested Gemini output

Respond with a sequenced plan and ready-to-paste engineering prompts for:

1. Review this local reconciliation (including adversarial scanner boundary tests), resolve the expected release drift using a NEW approved version, and update release documentation/CI without rewriting v1.1.0.
2. Choose a permanent host/custom-domain route. Ask only for the provider/account/domain decisions that are actually missing. Compare native Next.js hosting with Workers migration, and specify proxy/edge limiter requirements before implementation.
3. Define a safe multi-chat ownership and build-isolation workflow.
4. Design an optional CarMechanicOS reintegration plan as a separate future feature, explicitly acknowledging it is currently reverted. Include sandbox/storage boundaries, dependencies/licensing, loading budgets, exit/reset behavior, whole-page visual tests, and rollback gates.

Do not ask Codex to redesign the site, invent resume facts, reactivate the game, disable privacy checks, weaken production security, publish to Replit as the permanent host, move historical folders, or overwrite old tags/checksums. The immediate deliverable is a reviewed engineering plan; implementation of future hosting/game work needs its own authorized scope.
