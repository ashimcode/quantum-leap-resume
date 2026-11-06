# Quantum Leap release verification

Release labels follow the [milestone correlation table](docs/RELEASE-VERSION-MAP.md). Historical artifact filenames, branch names, and commit identities retain their original names. The notes below use the proposed labels for past milestones. Actual Git refs are listed in the original-tag column.

## v1.0.16 first SOC act scroll fix

Act I requests the next frames in the direction of travel and cancels obsolete downloads, with a bounded limit of five concurrent jobs on desktop and four on touch. The desk, ASCII orb, reveal, six palettes, later acts and media are unchanged.

In a 1.4 second desktop sweep from 16% to 30% with 200 ms added to each HD frame request, the baseline showed frame 19 at the end of scrolling and frame 21 after a further 400 ms. The candidate showed frames 26 and 29 respectively. The longest nonzero frame hold while scrolling fell from 174 ms to 59 ms in that comparison.

Production typecheck and build, 283 API regressions, 33 privacy cases, six analytics checks, five security categories and 131 HTML/PDF fact checks passed. Nineteen targeted browser checks passed across desktop and 4K Chromium and iPhone-profile WebKit. The new delayed-connection check runs in desktop Chromium.

## v1.0.15 security maintenance

The package pins Next.js 16.4.5 and targets Node 24 LTS. The image optimizer is disabled because the site uses prebuilt images. Direct garage HTML is inert under a CSP sandbox, while the CRT fetches its template and boots the same opaque iframe. When explicitly enabled behind a trusted ingress, the Ambassador limiter uses the rightmost forwarded IP and normalizes IPv6. It ignores forwarding headers by default.

The local production build passed typecheck, 283 API regressions, 33 privacy cases, six analytics checks, five security categories, 131 HTML/PDF facts, and three Chromium tests covering the woven scroll, Ambassador and CRT game. Both npm audits reported zero findings. See [Vercel's release notes](https://github.com/vercel/next.js/releases/tag/v16.4.5) for the published advisories.

## v1.0.14 local numbering review

The local candidate applies the milestone mapping to the stable source at `b05f895`. Typecheck, production build, all 249 API and 33 privacy scanner regressions, six analytics event checks, five security check categories, and 131 résumé fact checks passed. The baseline matches all 576 hashes. Desktop Chromium passed the CRT museum, ASCII portal, and four-act scroll checks. The next-version command reports `1.0.15`, and a fixture at `1.0.20` advances to `1.1.0`.

## v1.0.14 approved browser-tab compositing repair

The live Chrome defect was reproduced by closing a LinkedIn tab: the native desktop display showed fullscreen rings while a browser screenshot showed the correct orb. The original WebGL fragment stored saturated RGB in fully transparent pixels. Premultiplying the output and enabling premultiplied alpha eliminates that hidden color without changing the approved orb geometry, glyphs, timing, or six reload palettes. Thirty-six original/repaired comparisons differ by at most one channel level out of 255 under correct compositing.

The shaded desk is retained in an offscreen canvas. Act 0 cancels delayed 4K plate requests, uses a charcoal cold-cache fallback, and restores graphics resources and desk rendering after context/visibility changes. No public media or verified career facts changed.

Local typecheck/build, 249 API regressions, 33 privacy cases, six analytics events, five security checks, and 131 HTML/PDF fact checks passed. All 63 browser scenarios are covered across desktop/4K Chromium and iPhone-profile WebKit, including normal/reduced motion, 15-second idle intervals at three intro positions, failed source images, and graphics-context recovery. One initial 4K assertion sampled before the next canvas paint; after awaiting byte-identical restored pixels, both 4K idle modes passed on targeted rerun. Actual desktop Chrome also retained the original orb through repeated LinkedIn-tab closure. Outlook was reported by the user, not independently tested.

Ashim approved publication after reviewing the local preview. The new release preserves all earlier tags and archives; Replit deployment must retain its port-5000 and platform Node configuration. Publication results are recorded separately after the deployment completes.

## v1.0.13 approved ASCII intro with reload palettes

This release restores the approved v1.0.10 workstation scene, WebGL glyph animation, and scroll transitions. A fresh page load selects one of six equally likely palettes; the monitor orb, bloom, room breach, and glow share that palette until the next reload. No media, résumé evidence, garage, or analytics changes are included.

Typecheck, production build, 249 API regressions, 33 privacy scanner cases, six analytics events, five security checks, and 131 HTML/PDF fact checks passed. Chromium desktop, Chromium 4K, and iPhone-profile WebKit verified the portal and all six palettes by sampling rendered glyph pixels through the intro and checking that toggling effects retains the chosen color.

## v1.0.12 sparse ASCII intro

Act 0 uses the original charcoal desk plate and a transparent Canvas 2D layer that draws individual ASCII characters. The compact monitor orb expands into a sparse annulus. The desk zooms toward the monitor and dissolves into the first eligible full-color SOC frame from 13% to 18%. Frames 000–034 are excluded from playback and prefetch. The stale 4K request guard remains active for Acts I–IV.

Browser checks sample the actual canvas pixels at 0%, 2%, 5%, 8%, 12%, and 15%, including dark monitor corners, dark room pixels between glyphs, and the clearing center. The idle and rapid reversal test also checks the monitor corners while delayed 4K responses are released.

## v1.0.11 intro stability

The existing 4K desk plate has no baked red rings. The renderer confines idle glyphs to the monitor in both the shader and the canvas clip. Scroll progress releases the clip for the breach. Woven 4K enhancement is reserved for Acts I–IV. Pending requests are canceled on scroll, and a decode must still belong to the current scroll position before it can enter the cache.

The browser regression samples composited pixels over twelve seconds at the top, then checks the desk after rapid scroll jumps with woven 4K responses held until the return. The test runs in desktop and 4K Chromium and iPhone-profile WebKit.

## v1.0.10 CRT filesystem and project museum

Typecheck, production build, grounding, privacy, analytics, security, and submission verification passed. Six targeted browser checks exercised the virtual root, completion, history, exhibit text, traversal boundaries, and the legacy garage shortcut in Chromium at desktop and 4K sizes and iPhone-profile WebKit. The garage still loads on demand and returns focus without shifting the document.

The classroom pages were rendered from the supplied HTML and CSS. The gallery pairs those captures with the previous portal and CRT, and the new filesystem and museum.

## v1.0.9 4K scrollytelling and ASCII portal

The approved intro uses an original 4K desk illustration and an independently animated crimson glyph layer. The four subsequent acts use 192 HD frames and matching 4K plates, with bounded decoding and the same frame selected at rest. SOC is upscaled from the 1080p source. The other sources originate in 4K. The first two acts retain color and the last two use monochrome.

Local typecheck, production build, 249 API checks, 33 privacy cases, six analytics events, five security checks, 131 HTML/PDF facts and 17 entity answers and anchors passed. The 33 browser checks across Chromium at 1440×900 and 3840×2160 and iPhone-profile WebKit at 390×844 include the breach, aperture, both scrub directions, HD fallback and five-second idle checks. Film pixels, CV and HUD geometry stayed fixed at rest in every profile. A short intro sample measured about 60 fps in desktop Chromium, 12 fps in headless 4K Chromium and 7 fps in iPhone-profile WebKit on Windows. Physical device cadence remains unmeasured.

## v1.0.8 scroll and idle stability

The woven playhead locks to the nearest scroll-selected frame and its tracking sample. A settled stage wakes for input, resize, or asset completion. The film and CV overlay share a pixel-aligned crop. The HUD reserves space for counters and the root keeps a consistent vertical scrollbar.

The idle regression requires identical samples for both canvases and zero DOM geometry drift at 0% and 55% scroll on desktop Chromium and iPhone-profile WebKit. Each check samples every 250 ms for five seconds with the camera controls open.

## v1.0.7 woven camera study and custom analytics

The scroll stage uses a 192-frame timeline with three 14-frame optical dissolves. Both color sources retain their color. The overlay samples the displayed frame and uses hand-marked landmarks within verified visibility ranges. All 16 browser checks passed in desktop Chromium and iPhone-profile WebKit. The suite covered both scrub directions, RGB pixels, frame alignment, retry, keyboard navigation, grounding, analytics and the garage.

Production checks passed 249 API regressions, 33 privacy cases, the six-event analytics contract, all five security checks, 131 HTML/PDF fact checks, and 17 entity answers and anchors. Generated WebP frames must be single image chunks without metadata. The public PDF, LinkedIn dataset, and protected garage files match v1.0.6.

## v1.0.6 camera study and public copy cleanup

The public site and résumé display Ashim John. The header, hero, footer, CRT media, grounded answers, and public PDF reflect the requested copy cleanup. LinkedIn remains the authority for career facts, and GitHub remains a public link.

- All four camera feeds produced frame-derived motion regions and image-gradient keypoints in desktop Chromium and iPhone-profile WebKit. The test followed one video and canvas through the page and exercised the collapsible topbar, modes, reduced motion, playback recovery, PDF download, Ambassador and garage. All 14 browser tests passed. Physical iPhone playback was outside this test.
- A synthetic frame probe confirmed no boxes for identical frames or dominant camera translation and localized moving edges at three positions. The rendered boxes are motion evidence, with no semantic object classification.
- Typecheck and production build passed. Verification passed 249 API regressions, 33 scanner cases, five security checks, 131 HTML/PDF fact checks, and 17 grounded entity answers and anchors. All three PDF pages were visually reviewed.

## v1.0.5 unified camera study and local security checks

The release branch is `feat/v1.2.3-unified-surveillance-and-security`, based on v1.0.4 at `38a96cd`. One fixed video element and tracking canvas now span the whole document. The visual simulation keeps all four feeds, three modes, cursor inspection, camera controls, and reduced-motion stills. The header camera control can reopen the study from any chapter. Scroll telemetry tracks the chapter and adjusts the camera framing.

- Production build, application typecheck, and separate strict typecheck of security and browser scripts passed.
- Grounding passed 249 API regressions and all 33 privacy cases. Submission passed 132 HTML/PDF fact checks and 17 entity answers and anchors.
- All five local security checks passed. Both npm audits reported zero vulnerabilities. The lockfile check validated 150 registry tarballs and six bundled entries covered by their parent tarball. The existing opaque-origin garage bridge is covered by its exact fingerprint and message guards.
- All 14 browser tests passed across desktop Chromium and iPhone 13 WebKit emulation. They checked four advancing H.264 feeds, camera and canvas identity through the footer, reduced mode redraws, blocked-autoplay recovery, keyboard focus and chat, exact PDF download bytes, and sandboxed garage geometry. BROWSER_TESTING.md describes the emulator and physical-device evidence boundary.
- Git comparison against v1.0.4 confirmed the canonical data and claim audit, PDF, garage code and assets, scanner code and cases, Replit configuration, application TypeScript scope, and existing media files.

## v1.0.4 surveillance hero and public GitHub restoration - November 5, 2026

Prepared on feat/v1.2.2-cv-surveillance from clean main at bdc117e. The supplied master brief reused an already-published version number; this feature uses the next patch version so the existing v1.0.3 tag, archive and live deployment remain intact. No Replit Agent, publish, hosting or DNS action occurs in this task.

Passed before freeze:

- Application typecheck and production build.
- 249 API regressions + all 33 unchanged privacy-scanner regressions; 196 source/public/client files scanned, including all new media and compiled browser bundles.
- Submission: 132 canonical facts in rendered HTML and the three-page public PDF; all 17 entity answers/anchors, provider mocks and refusals. Public GitHub links, LinkedIn-only career sources and simulation disclosure are checked explicitly.
- The v1.0.3 career dataset and all approved non-contact answers match byte-equivalent parsed data. The authorized contact link is restored in hero/contact, approved contact answers and the PDF. All three rebuilt PDF pages were visually reviewed without clipping.
- Four silent, metadata-stripped H.264 1280x720/30fps faststart clips plus reduced-motion JPEGs. Videos total 7,007,648 bytes; only the active feed video loads.
- Production Chrome at 1440x900 and 390x844: all four feeds play, three modes, gradient sampling, cursor vectors/lock, OFF/reduced/OS-preference behavior, blocked-autoplay poster fallback and offscreen pause. Short HUD-rate smoke samples measured about 61 and 60 frames/sec respectively; these are local samples, not a sustained or universal performance guarantee.
- Exact 3-project/6-role/3-education/5-credential inventory, 120 decoded underground frames, no idle game request, working GitHub ambassador answer, valid PDF response, and no normal-path console/page errors.
- CRT game launch/expand/collapse/exit preserved document height and scroll position at both viewports. Protected animation/CRT/game/scanner files and historical tags/ZIP archives retain their pre-change hashes. The authorized PDF is intentionally rebuilt.

The hero is explicitly a visual simulation. Image gradients/motion guide authored zones and keypoints; labels/confidence are illustrative. No YOLO recognition, SLAM reconstruction, identity inference, PII redaction or security audit is claimed. Target telemetry uses DEMO/NOT RUN. The original scroll engine and CRT game remain unchanged.

Reproducible browser scripts/results, screenshots and protected/media fingerprints remain in ignored .qa/v122; PDF renders are in .qa/resume-render. README.md, VERIFICATION.md, CLAIM_AUDIT.md and GEMINI_SYNC.md describe the current source/feature boundaries. The new-version freeze and root-level Replit export follow these checks; no historical package is replaced.

## v1.0.3 production deployment confirmed - November 5, 2026

Under the user's explicit publishing request, Codex manually deployed the LinkedIn-only release to https://quantum-leap-interactive.replit.app/. No Replit Agent task or AI prompt was used. Replit's production build, 243 API + 33 scanner regressions and 132 HTML/PDF fact checks passed. Live checks confirmed the new headline, 3 projects, 6 roles, 3 education entries, 5 credentials, all 120 decoded frames, exact approved PDF bytes, the approved Project Hedgehog answer, canonical refusal for a removed Home SOC claim, and unchanged game asset bytes. Evidence is saved in ignored .qa/v121/live-verification.json and live/publishing screenshots.

The scoped transfer backed up the existing workspace and preserved the three intentional platform overlays: port-5000 package scripts, .replit workflow/port mapping and preview-only next.config.mjs. All other 165 frozen entries match canonical v1.0.3. The platform overlay record is in Replit's .qa/deploy-v121-20261105-074409/deployment-overlay.json; the frozen canonical baseline remains unchanged. The corrected OpenSSL/Nix setting is preserved. Source-branch GitHub Actions passed before promotion to main. Existing release tags and historical archives remain rollback points; the new v1.0.3 tag records this release.

## v1.0.3 LinkedIn-only reconciliation - November 5, 2026

Branch: `feat/v1.2.1-linkedin-reconciliation`, based on clean main at `2a602e9`. The candidate-supplied canonical LinkedIn specification replaces every prior resume, cover-letter, repository and candidate-confirmation career source. It is not represented as an independently scraped or certified LinkedIn record.

The current page, approved ambassador answers and rebuilt three-page public PDF contain precisely six roles, three education entries, five credentials, three projects and five top skills. All role bullets, types, dates and locations; education dates/grades/details; credential issuers/issue dates; project associations/descriptions and skills are represented. The explicit grades 3.4 and 3.2 are authorized public content; private phone, street address and personal email remain excluded. Master and bachelor entries are not described as awarded degrees. Goldman project awards now read 1st Place and 2nd Place Creativity Awards. AWS/IAM/SIEM/Linux listings do not become implementation, proficiency or additional certification claims.

Passed before release freeze:

- `npm run typecheck` and `npm run build`.
- `npm run verify`: 243 API regressions + all 33 unchanged privacy scanner cases; 186 source/public/client files scanned. Removed entities and unsupported details refuse exactly, including mixed requests, fabricated dates, injection, and tampered histories. Existing rate limits and optional-model post-checks remain enforced; tests isolate all provider credentials to prevent real model calls.
- `npm run verify:submission`: 132 canonical facts checked in both rendered HTML and the three-page PDF; all 17 entity answers and actual page anchors checked; recruiter questions, refusals and managed-provider routing passed.
- PDF pages rendered and visually reviewed: clean page breaks, all six roles on page two, all three projects on page three; no clipping or private contact header.
- Headless Chrome at 1440x900 and 390x844: exact entity inventories, no horizontal overflow, 120 decoded scroll frames, no idle game fetch, CLI/game launch, expansion/collapse, clean exit, unchanged document height and scroll position during CRT interaction, and zero uncaught page errors. Evidence: ignored `.qa/v121` screenshots and browser-results.json.

The audit generator now maps 223 factual/answer fields to LinkedIn source sections. The current verification report is regenerated independently of the historical Handshake submission packet. Historical documents outside the allowed edit scope are preserved and are not authority for the new site. No Replit AI, publishing, hosting or DNS operations are involved. The corrected OpenSSL configuration from main is retained. Protected animation/game/scanner files, old tags and old ZIPs are checked against saved pre-change fingerprints before export.

## v1.0.2 OpenSSL deployment configuration repair - November 5, 2026

The user authorized direct repair of Replit, prohibited Agent credit usage, and explicitly selected verification without publishing. Codex removed `replit.nix`'s `LD_LIBRARY_PATH` override through the existing Replit Shell. The platform-managed Node runtime could run with its own libraries, while the legacy override forced an incompatible OpenSSL 3.0.13 and prevented automatic npm installation. The corrected file has empty Nix dependencies and relies on `.replit`'s existing Node module. No application UI, source data, game assets, dependencies, security headers or version metadata were changed by this repair.

The same minimal configuration correction is applied locally. Only the `replit.nix` hash is refreshed in the current deployment baseline; all other 167 frozen entries are preserved. Existing release tags and archives remain historical originals. A separately named `quantum-leap-v1.2.0-replit-openssl-fix.zip` prevents a later import from restoring the defective override. Local typecheck, build, 142 API + 33 scanner regressions, submission checks and all 168 baseline hashes passed. Replit typecheck and production build passed after clearing the inherited library path for the current Shell. A new deployment install/publish was NOT attempted and is not claimed successful.

## v1.0.2 Replit packaging correction - November 5, 2026

The refreshed `quantum-leap-v1.2.0-replit.zip` narrows the application TypeScript project to `src/`, `next-env.d.ts`, and generated Next.js types. It excludes external Playwright files, tests, maintainer scripts, and local QA without disabling strict checking or adding test-runner dependencies. No runtime source, public asset, dependency, or version changes were made.

- Reproduced the reported missing `@playwright/test` and implicit-any errors using temporary root-level Playwright configuration and browser-test files under the old configuration.
- With those same stale files still present, the corrected `npm run typecheck`, `npm run build`, and `npm run verify` passed: 142 API regressions, 33 scanner regressions, and 186 source/public/client files scanned.
- Temporary reproduction files were removed before export. The updated Replit instructions clean stale Agent tests and build cache and install locked dependencies including build tools.
- Under the explicit deployment-repair authorization, only the `tsconfig.json` hash is refreshed in the 168-file v1.0.2 baseline. The existing annotated `v1.0.2` tag and general `quantum-leap-v1.2.0.zip` remain unchanged; the refreshed Replit ZIP has its own regenerated checksum and manifest. The tagged source represents the original release; the corrected deployment package is tracked in a separate follow-up commit.

## v1.0.1 maintenance release - November 5, 2026

Release scope: scanner/release tooling and documentation only. No src/ or public/ changes. Verification sequence: version bump, typecheck, production build, 142 API + 33 scanner regressions, submission checks, explicit new-version freeze, baseline check, and versioned ZIP export. Release completion is evidenced by the v1.0.1 commit/tag and GitHub Actions results.

The additional scanner cases cover minified adjacent rules, private content adjacent to an allowed rounded-full rule, and a spoofed custom property. The supplied private number is constructed at test runtime rather than stored verbatim in the repository. The v1.0.0 tag and original replit-quantum-leap-handshake.zip remain preserved. Permanent hosting is not being assigned to Replit.

## Historical v1.0.0 verification

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
