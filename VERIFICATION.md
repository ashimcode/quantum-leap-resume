# v1.2.2 verification

Career authority remains the candidate-supplied canonical LinkedIn specification. The v1.2.1 career dataset is unchanged: six roles, three education entries, five credentials, three projects and five top skills. GitHub is restored in the hero, contact section, approved contact answer and public PDF as a candidate-authorized public link, not career evidence.

## Release gates

- `npm run typecheck` and `npm run build` enforce the application-only TypeScript scope.
- `npm run verify`: 249 API regressions and all 33 unchanged privacy-scanner cases, scanning 196 source/public/client files after build. Added regressions cover GitHub contact routing and refusals for unsupported YOLO/SLAM/GitHub career inferences.
- `npm run verify:submission`: all 132 canonical facts in rendered HTML and the three-page PDF; 17 entity answers/anchors, unsupported claims, provider routing, simulation disclosure, public GitHub link and LinkedIn-only source URLs.
- `npm run verify:baseline` checks the explicit new-version source/asset/config manifest.

## Browser acceptance

Production Chromium at 1440x900 and 390x844 covers all four feeds, active-feed-only loading, image-gradient sampling, three modes, cursor triangulation/target lock, pause/resume, FX reduction and operating-system motion preference. It verifies paused offscreen playback/rendering, blocked-autoplay still fallback, no page overflow, stable document height, public PDF download, GitHub ambassador answers, 120 decoded underground frames, lazy CLI/game load, monitor expansion/collapse/exit, unchanged CRT document geometry/scroll and zero errors on the normal paths.

Local evidence is retained under ignored `.qa/v122/`: browser.cjs, browser-results.json, camera/target/game screenshots, media.json and protected.json. PDF pages are rendered under `.qa/resume-render/`. All three pages were visually reviewed with no clipping; the career facts stay identical and GitHub appears in public contact.

## Integrity boundaries

The original underground scroll source/frames, retro terminal/game source/assets, privacy scanner source/cases, old tags and all existing ZIPs retain their captured hashes. The public PDF is intentionally rebuilt as authorized. Both ambassador component and API route remain unchanged. The surveillance overlay is explicitly a visual simulation, with authored labels/percentages and approximate zones: it is not actual YOLO inference, SLAM reconstruction, PII redaction or a security audit. A 60 fps render target is not a device-independent guarantee.

No Replit Agent, publish, DNS or hosting action is performed for this feature upgrade. The existing v1.2.1 deployment remains the live version until a separately authorized update.
