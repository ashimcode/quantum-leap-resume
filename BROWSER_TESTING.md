# Browser testing

Build the production app with npm run build, install Playwright Chromium and WebKit with npx playwright install chromium webkit, then run npm run verify:browser. The suite starts an isolated production server on loopback port 3123, with model-provider credentials disabled. Browser specs and their configuration stay outside the application TypeScript project. Traces and screenshots are written under the ignored .qa/v125/playwright directory.

The projects use desktop Chromium at 1440 × 900 and Playwright WebKit with the iPhone 13 device profile. This profile emulates the viewport, touch, scale, and user agent. Physical iPhone testing is a separate check for hardware decoding, Safari browser controls, and the device download and share UI. See the [Playwright browser documentation](https://playwright.dev/docs/browsers#webkit) and [device emulation documentation](https://playwright.dev/docs/emulation).

The suite covers all four acts in forward and reverse order, canvas RGB color, matching image and tracking frame indexes, fixed camera jumps, reduced motion, asset failure and retry, keyboard focus, actual Ambassador grounding, exact analytics labels and failure tolerance, PDF bytes, and the sandboxed garage. The current WebKit project uses a 390 × 844 CSS-pixel viewport.

The v1.2.6 idle regression opens the camera controls and holds the top and 55% scroll positions for five seconds each. At 250 ms intervals it compares pixel samples from both canvases, hero and HUD bounding rectangles, the scroll position, document dimensions, and the frame and draw counters.

## v1.2.3 results

All 14 checks passed with Playwright 1.64.1 on Windows. Desktop Chromium used 1440 × 900. WebKit used the iPhone 13 profile at 390 × 664 CSS pixels and device scale 3. The WebKit download event produced bytes identical to the approved public PDF.

The keyboard paths use Tab, Shift+Tab, Enter and Escape in both projects. Explicit tab stops keep the skip link, chapter links and Ambassador evidence links reachable in the Windows WebKit configuration. The native chapter dialog traps focus, returns focus to its trigger on Escape, and sends focus to the destination when a chapter is chosen.

The playback checks require decoded video frames and an advancing clock, including after retry and resume. The four source files are H.264 at 1280 × 720 as confirmed with ffprobe. Chromium also records the initial network request count. WebKit's media process reports range requests separately from page request events, so its checks use the active media source, decoded frames and playback position.

Hardware playback, real Safari controls and the iOS download/share interface still need a physical-device check.
