# Codex -> Gemini: Quantum Leap v1.2.0 deployment and preview sync

Gemini, act as our architectural prompt planner. Use this current report instead of older chat assumptions or the superseded historical sync document. Produce a bounded engineering plan after Replit returns evidence; do not redesign the approved website or assume the preview is already fixed.

## 1. Source of truth and release state

- Canonical workspace: `C:\Users\admin\Desktop\QuantumLeap V1\preview-site`.
- Authoritative repository: PRIVATE `https://github.com/ashimcode/quantum-leap-resume`, default branch `main`.
- Approved feature release: v1.2.0, including the sandboxed CarMechanicOS CRT easter egg. The original annotated v1.2.0 tag still targets `f759182767a3924ce5c52104bcfefc1b1082563d`.
- Codex committed and pushed a follow-up deployment repair to main: `7935cbf77ebfb740877acbf47c9be5d37b0a6665`, `fix(replit): isolate application typecheck from stale agent tests`. Latest main includes this fix; checking out the original v1.2.0 tag will omit it. No tag was moved and no release version was bumped.
- Replit is our current testing/submission deployment environment. We have not selected it as the permanent host/domain. Local source plus private GitHub remain authoritative; Replit-only changes need a sanitized diff and local reconciliation.
- Codex is committing this updated handoff and `REPLIT_PREVIEW_FIX_PROMPT.md` separately from the application fix. Those prompt documents are not runtime application code or included in the existing exporter allowlist.

## 2. What failed and what is fixed

The user imported a newer ZIP into an existing Replit workspace. `unzip -o` overwrote tracked application files but did not remove old Replit Agent additions. Replit then reported:

- next build compilation succeeded, but TypeScript could not resolve `@playwright/test` in root `playwright.config.ts` and `tests/browser/portfolio.spec.ts`.
- Related implicit-any diagnostics followed. The package intentionally did not depend on that external test runner, while old tsconfig `**/*.ts` / `**/*.tsx` patterns picked up its leftover files.

Codex reproduced that exact class of failure locally using temporary stale Playwright files. The repair is limited to application TypeScript scope:

```json
{
  "include": [
    "next-env.d.ts",
    "src/**/*.ts",
    "src/**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts"
  ],
  "exclude": ["node_modules", "playwright.config.ts", "tests", "scripts", ".qa"]
}
```

Strict mode remains enabled. No Playwright dependency or ignoreBuildErrors was added. Typecheck, production build and verifier passed while the stale files were still present; the reproduction files were then removed. Maintainer scripts still run independently through ts-node.

Changed in the application-fix commit: `tsconfig.json`, `RELEASE_BASELINE.json` (only the tsconfig hash), `REPLIT_DEPLOYMENT.md` (safe import/cleanup commands), and `RELEASE_VERIFICATION.md` (repair evidence). No src/, public/, dependency or package-version changes.

The existing freeze script intentionally refuses to overwrite an already tagged/same-version release. Under the user's explicit deployment-repair authorization, Codex updated just the current deployment baseline's tsconfig hash, verified all other frozen files unchanged, and recorded the repair in a new commit instead of rewriting the old tag. Preserve that provenance.

## 3. Current artifact and checks

Updated Replit package:

- Path: `C:\Users\admin\Desktop\QuantumLeap V1\quantum-leap-v1.2.0-replit.zip`.
- Bytes: 12,789,603; 188 allowlisted application files.
- SHA-256: `0b4a1ccab98905cc615904f048b1ce2344431240bd6b6f7bd3334823a6db0aee`.
- Adjacent .sha256 and .manifest.json regenerated and verified against archive bytes and every per-entry hash.
- Includes all seven public/carmechanicos assets and the approved RetroNameTerminal implementation. No node_modules, .next, .git, .qa, .env files, private source PDFs or stale root Playwright tests.
- The same filename was used for a previous ZIP, so file name and package version alone do not prove the import is current. Use the checksum/current tsconfig or required fix commit.
- Original general `quantum-leap-v1.2.0.zip`, v1.1.0/v1.1.1 archives and existing tags remain preserved. The general v1.2.0 ZIP is the original release, not the corrected Replit package.

Verified locally:

| Check | Result |
| --- | --- |
| npm run typecheck | passed, including stale-file reproduction after fix |
| npm run build | passed with stale Playwright files still present |
| npm run verify | 142 API + 33 scanner regressions passed; 186 source/public/client files scanned |
| npm run verify:submission | passed exact questions/refusals/deep-links/provider routing |
| npm run verify:baseline | all 168 frozen hashes passed |
| ZIP integrity, corrected config and game contents | passed |
| Private GitHub application-fix push | main verified at 7935cbf after push |

GitHub Actions must be checked for the current pushed commit; local success alone is not a remote CI or live deployment result.

## 4. Current unresolved issue: Replit Preview timeout

After the build repair, the user's screenshot shows Replit Preview reporting: "This is taking longer than expected. Ask Agent to fix the preview." Its visible address includes :3000. The screenshot also contains old Agent discussion of 30 scanner tests and several modified workspace files. That history is not proof that the active imported source is old, but motivates checking the actual fingerprint and diffs. Current local suite is 33 scanner cases.

We have NOT inspected Replit's current process, Run logs, browser console, live headers or deployment logs during this task. Exact cause is unconfirmed. Do not state that a UI/game regression, a port mismatch or CSP is proven.

Concrete diagnostics given to Replit Agent:

1. Verify the latest ZIP/source. Inspect current Run workflow and sanitized config diffs. Stop only the app's process before installation/build; avoid concurrent processes sharing .next.
2. Approved package scripts bind 0.0.0.0:3000. Approved .replit maps localPort 3000 to externalPort 80. Confirm actual listener/HTTP response and Preview's selected exposed endpoint; inspect inherited 5000-port workflows instead of blindly changing ports.
3. Compare HTTP localhost, external new-tab preview and embedded Preview. Inspect real console/network/response headers to distinguish server startup, routing, framing, HMR or stale assets.
4. Existing next.config.mjs sets X-Frame-Options DENY and CSP frame-ancestors 'none'. These may affect embedded Preview; dev CSP/HMR may also need investigation if errors show it. They are hypotheses only. Prefer correcting workflows/ports or a production-mode preview when appropriate. Do not globally weaken production headers.
5. Any necessary preview-only policy adjustment must use verified workspace origins, be narrowly scoped and be returned as a diff. Keep production security and game sandbox/storage controls intact. Do not mask failures with disabled checks or silent baseline rewrites.
6. Verify build, application/API/privacy checks and the whole page at desktop/mobile, including initialized scrolling footage and CRT -> CLI -> game -> expand/collapse -> exit. Then make a NEW publishing attempt and verify the published endpoint separately. Report a blocked/failed deployment accurately.

Full ready-to-paste Agent instructions are in `REPLIT_PREVIEW_FIX_PROMPT.md`. No message was sent to Replit automatically and no live deployment was performed by Codex in this task.

## 5. Approved features to protect

- UndergroundScrollStage: approved v1.1 continuous Canvas animation, 120 decoded frames, native navigation/reduced-motion behavior. Say "60 fps target," not guaranteed locked performance.
- CRT initial display: ASHIM JOHN signal, pause/tune and pointer effects. CLI/game modules load on demand. Virtual filesystem commands do not access the actual host filesystem.
- CarMechanicOS: reintegrated, accepted at desktop 1440x900 and mobile 390x844. Sandboxed opaque-origin iframe; local assets/Chart.js; isolated key ql_carmechanicos_save_v1; source/session-validated save bridge; expand/collapse preserves iframe; exit tears down its browsing context and restores focus without changing page scroll geometry. The earlier statement that this feature is reverted is obsolete.
- Grounded ambassador: verifiedSources.ts and approved answers only. Unsupported response remains "I don't have verified information about that." No personal phone/address/email, invented credentials/outcomes, arbitrary model prose or chat logging.
- Public resume, canonical claims, layout and visuals are unchanged by this deployment repair. No new game or resume work is authorized by a preview fix.

## 6. What Gemini should plan next

Return a concise diagnosis tree and a bounded Codex reconciliation prompt, to be finalized once the Replit Agent report arrives:

- Separate observed evidence from hypotheses and clearly distinguish build success, running preview, embedded framing, production publishing and post-publish health.
- Request only missing sanitized logs/diffs/fingerprints needed to select the smallest fix; do not plan a redesign or a fresh application rewrite.
- Define file scope, tests and rollback for importing any proven config fix back into the canonical workspace. No production-only Replit patches should silently become permanent architectural policy.
- Resolve release provenance for future repairs: the current same-version packaging correction is an explicit documented exception. Propose a new patch version/tag/artifact for subsequent source/config fixes instead of repeatedly replacing a frozen release or reusing ambiguous ZIP names. Do not execute a version bump or move old tags without an authorized implementation task.
- Keep permanent-host/custom-domain migration separate from this urgent Replit repair. No DNS or host change is authorized here.
- Require verification of the new published build before calling the update live. If the platform is unavailable, state the limitation and preserve a working rollback.

References: [Replit ports](https://docs.replit.com/features/project-setup/ports), [Replit configuration](https://docs.replit.com/features/project-setup/configuration), [Replit Preview](https://docs.replit.com/features/editor/preview), [MDN X-Frame-Options](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/X-Frame-Options). These explain diagnostic possibilities, not the actual cause of this workspace's timeout.
