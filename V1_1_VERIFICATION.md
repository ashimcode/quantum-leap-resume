# v1.1 verification — November 4, 2026

## Completed checks

- Production `npm run build`: exit 0, including TypeScript checks.
- Unchanged `npm run verify`: exit 0; 142 API regressions and 171 source/public/client files scanned.
- 120/120 JPEG frames successfully decoded in headless Chrome 156.0.8078.80.
- 16-second native-scroll traversal: top → bottom → top, with pointer movement. 1440 × 900 CSS viewport, DPR 1.5; internal canvas 2160 × 1350.
- 3,546 measured rAF intervals: median 4.2 ms, p95 8.2 ms, p99 8.4 ms, average 4.51 ms. The host's high refresh cadence is approximately 240 Hz; these are not 60 Hz intervals.
- Five intervals exceeded 25 ms, including three above 50 ms; maximum 112.5 ms. No main-thread long tasks were observed during this traversal. A perfectly locked frame cadence is **not** demonstrated. The 60 fps frame budget was met at p99, with rare browser/system outliers.
- Background video seek events during the traversal: **0**. Video-decoder seeking is absent from the render pipeline. The fallback video paused once all decoded frames took over.
- No uncaught page errors.
- With all frame requests blocked: native muted background playback advanced and the procedural stage remained available.
- Manual reduced motion: stage settled without a continuing animation loop; background video paused.
- System reduced motion at 390 × 844 and DPR 2: one frame decoded, canvas width capped to 585, no horizontal overflow.
- Chapter drawer opened and closed with Escape.
- Live preview inspected, chapter anchors and return to top exercised, 120 decoded frames confirmed in the visible browser.

Raw measurements are saved in `.qa/scroll-benchmark-v1.1.json` (excluded from the public deployment archive). `scripts/benchmark-scroll.mjs` can reproduce the check with an externally installed `playwright-core`; set PLAYWRIGHT_MODULE_PATH to its index.mjs and optionally CHROME_EXECUTABLE, QA_REPORT, and QA_SCREENSHOT.

## Protected-file integrity

The following hashes match the pre-edit values:

| File | SHA-256 |
| --- | --- |
| src/data/verifiedSources.ts | 3D94DD2C7432E00DBD2F99CB2868EA563DB1B3C406348488116C8F70686B3091 |
| src/app/api/ambassador/route.ts | D1B03D4CCFD84F903972F6DF87A6AFBCBD51ECCF3C2EAC5E06676A2029FE3B65 |
| public/resume-public.pdf | AFEAA1D96E46E0CBB1FCBFE4D79C4EF0475C9C7F3F6C89C8948686DA5F9F6B3C |
| scripts/verify-grounding.ts | 67D828171EC7CBBC8BFFB03EC37B390475B45CA18F11D97318E377D0F0A4D303 |

The accepted v1 baseline and retro revision archives remain outside this revision and were not overwritten.

## Limits

The original film's detail is limited by its 450 px source width. Its existing editorial cuts and embedded static remain part of the sequence. Startup still requires network loading and image decoding; only warm frame sampling avoids decode latency. Decoded images use roughly 95–149 MB with ImageBitmap resizing, more in the legacy Image fallback. Browser/hardware scheduling can still produce occasional missed frames.
