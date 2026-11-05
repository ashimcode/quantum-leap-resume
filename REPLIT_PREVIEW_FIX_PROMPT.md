# Replit Agent prompt: restore preview and publish the latest Quantum Leap update

> Historical Agent handoff. Superseded by the user's November 5 instruction to fix directly without Agent credits and to verify without publishing. Do not submit this prompt or initiate another publish under the current instruction. Codex removed the actual Nix library-path override directly; see `REPLIT_REPAIR_REPORT.md`. Earlier artifact fingerprints below identify the old package and must not be reused for the repaired import.

Fix this existing Replit workspace and deploy the latest approved Quantum Leap v1.2.0 application. Do not redesign or rebuild the site. Diagnose the current failure with evidence before changing configuration.

## Current evidence and source of truth

- The latest screenshot shows the Preview timeout: "This is taking longer than expected. Ask Agent to fix the preview." The preview address includes `:3000`. This does not prove a build failure, a crashed app, or an iframe failure by itself.
- Local application source and the PRIVATE `ashimcode/quantum-leap-resume` repository are authoritative. Replit remains a testing/submission deployment, not our permanent hosting decision.
- Required application fix commit: `7935cbf77ebfb740877acbf47c9be5d37b0a6665` (`fix(replit): isolate application typecheck from stale agent tests`). Use this commit or its descendant on main, not just the original v1.2.0 tag. The old tag deliberately remains unchanged.
- Updated upload: `quantum-leap-v1.2.0-replit.zip`, 12,789,603 bytes, SHA-256 `0b4a1ccab98905cc615904f048b1ce2344431240bd6b6f7bd3334823a6db0aee`. The filename/version alone cannot distinguish the corrected package from the older ZIP. Verify the actual uploaded archive before using it. If it is absent or does not match, report that clearly; use the latest private repo only through already authorized access.
- The prior TypeScript failure was reproduced and fixed locally: leftover `playwright.config.ts` / `tests/browser/portfolio.spec.ts` imported `@playwright/test`, which is not an application dependency. `tsconfig.json` now includes only `next-env.d.ts`, `src/**/*.ts`, `src/**/*.tsx`, `.next/types/**/*.ts`, and `.next/dev/types/**/*.ts`; it excludes `node_modules`, `playwright.config.ts`, `tests`, `scripts`, and `.qa`. Strict mode stays enabled. Typecheck, production build, 142 API + 33 scanner checks, submission checks and 168 baseline hashes passed locally, including a build with stale Playwright files present.
- Old Agent messages showing 30 scanner cases are historical. Do not reapply an old scanner patch or downgrade the current 33-case suite.

## Guardrails

Preserve all `src/**` and `public/**` application content: layout, UndergroundScrollStage animation, CRT idle signal, CLI, sandboxed CarMechanicOS, verified facts, ambassador component/API and redacted resume. Replacing those files with the matching approved package is allowed; feature edits are not part of this task. Preserve `ql_carmechanicos_save_v1` storage isolation, lazy loading and iframe sandbox. No new resume claims, phone/address/personal email, secrets, chat logging or external game dependencies.

Limit repairs to evidence-based Replit workflow/port settings and, only if proven necessary, narrowly scoped preview configuration in `next.config.mjs`. Do not install Playwright to mask the old issue, use `ignoreBuildErrors`, disable privacy tests, broadly disable CSP, expose secrets, make GitHub public, alter release tags, or rewrite baseline hashes to hide unexplained drift. Back up the current small config files/diffs first. Do not reset the entire workspace or kill unrelated processes.

## 1. Inspect and synchronize safely

Record sanitized Node/npm versions, current directory, package version, tsconfig include/exclude, package scripts, `.replit`, active Run workflow, listener/process state and the latest startup/build error. Inspect differences in `next.config.mjs` and lockfile against the approved source. Do not dump environment variables or credentials.

Stop only this app's running preview/build process and wait for it to exit before installing or rebuilding. Validate the uploaded ZIP, unpack at the application root (no extra wrapper directory), and use `npm ci --include=dev` rather than `npm install`. Quarantine stale Replit-only test files outside the app and clear only generated `.next` and `tsconfig.tsbuildinfo`. Remove the uploaded ZIP from `public/` after import so it is not served as a public download. Preserve secrets and user data. Do not assume overwriting files removed extra Agent files.

## 2. Find why Preview cannot connect

Compare the actual running command, bound host/port, `.replit` port mapping, Run workflow and the port selected in Preview. Approved scripts bind `0.0.0.0:3000`; approved mapping is local 3000 -> external 80. Confirm with process/listener output and an HTTP request to `http://127.0.0.1:3000/` before editing ports. Do not change to 5000 just because an old Replit workflow used it. If the current platform requires another port, document the evidence and align the script, environment, workflow and mapping consistently.

Use the networking/Preview UI to select the correct exposed endpoint and compare "open in new tab" with the embedded Preview. A port suffix in the screenshot is a clue to investigate, not proof of misconfiguration. Check for duplicate dev/start processes, stale `.next` output, startup exceptions, missing assets and requests that stall.

Inspect the actual response headers plus browser console/network failures. Approved `next.config.mjs` sets `X-Frame-Options: DENY` and CSP `frame-ancestors 'none'`. These are candidates for blocked embedding; they are not a confirmed root cause. Development CSP/HMR restrictions are another possibility only if the console shows them. Distinguish a healthy HTTP app blocked inside Preview from a server that never starts. If production `npm run start` works but dev/HMR fails, consider a production-mode preview workflow before weakening policies.

Only if logs prove an embedding/origin problem, apply the smallest explicit workspace-preview-only adjustment using verified preview ancestor origins from this workspace and current platform documentation. Keep published-production protections intact; do not whitelist all origins or all Replit tenants, add global unsafe-eval, disable host checking broadly, or change the game sandbox. If no safe scoped change is possible, preserve production headers, verify using the external preview URL, and report the embedded-preview limitation accurately.

## 3. Verify and publish this update

Run in order, halting on failures:

```sh
npm run typecheck
npm run build
npm run verify
npm run verify:submission
npm run verify:baseline
```

If a fresh workspace lacks generated Next.js types before the first typecheck, generate them with `npx --no-install next typegen`; do not edit `next-env.d.ts` by hand. The privacy verifier requires Python 3 with pypdf; use an isolated tooling environment if needed rather than modifying application dependencies. Expect 142 API + 33 scanner regressions. Baseline expects 168 hashes on unchanged source. If a necessary config repair changes a frozen file, report its exact diff and expected baseline failure; do not call it passing or silently re-freeze v1.2.0. Return that diff to Codex for a separately recorded baseline/release decision. A documented required platform-only change is distinct from unexplained source drift.

Start the app and verify desktop 1440x900 and mobile 390x844: home page styles/scrolling, initialized animated background, PDF download, ambassador supported answer + exact unsupported refusal, and CRT idle -> CLI -> `cd Desktop/carmechanicos` -> `start game` -> expand/collapse -> exit. Confirm normal scroll geometry/focus, no initial game download, no missing JS/CSS/media and no uncaught errors. Do not replace animations with still images to make the preview appear healthy.

Once preview/external checks and the production build pass and no unexplained drift remains, deploy the current corrected workspace through a NEW Replit publishing attempt (Autoscale Node server, not static export). Verify the published URL separately from the workspace Preview: startup health, assets, ambassador and game. Do not report "published" from an old deployment or just a successful local build. If publishing is unavailable or fails, provide the exact blocker and sanitized logs.

Return: confirmed root cause and evidence; changed files/config diff; Run/build/start commands and final port mapping; each check/result including any baseline drift; current preview and published URLs; deployment result; and a compact sanitized handoff for Codex to reconcile locally. Do not push Replit-generated patches into the authoritative private GitHub repository without that reconciliation.

Official references: [Ports](https://docs.replit.com/features/project-setup/ports), [Configuration](https://docs.replit.com/features/project-setup/configuration), [Preview](https://docs.replit.com/features/editor/preview), [MDN X-Frame-Options](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/X-Frame-Options).
