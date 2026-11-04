# Quantum Leap v1.1 scroll engine

## Reference runtime inspection

Inspected [Pear](https://pear.no/?ref=siteinspire) on November 4, 2026 through Chromium's live DOM and CDP Runtime evaluation. No vendor bundles were downloaded or read. Shader features were inspected from the active WebGL program using getAttachedShaders/getShaderSource; no reference shader code or media is redistributed.

- The observed viewport was 897 × 825 CSS pixels. The document was 43,018 px tall. Five canvases and two video elements were present. One visible stage had an active WebGL program; a separate active effect surface used Canvas 2D. Dormant canvases are not evidence of five simultaneous renderers.
- A 360-callback wheel/pointer probe traversed scrollY 0 → 42,188 → 0. Sampling every 30 callbacks showed native scroll continuing after input and reversing gradually. A separate 1,000 px wheel impulse approached 1,000 px: 85 at the first sample, 509 at callback 7, 736 at 14, 859 at 21, and 996 at 63. This fits about 0.085 interpolation per callback, with approximately a 1:1 pixel-wheel target multiplier in this run. This is an empirical fit, not access to a private scroll variable. Line-mode wheels and trackpads were not characterized.
- The display delivered a median rAF interval of 4.2 ms, p95 8.3 ms during the reference probe (high refresh, not a 60 Hz test). Do not compare this directly with headless 60 Hz results or call it a universal FPS guarantee.
- Live uniforms exposed texture dimensions, zoom/pan, layered transition strengths, burn fields, and endpoint framing. The active fragment shader uses recursive Bayer thresholds, smoothstep windows, noise, texture cover fitting, and multiple source samplers. This supports overlapping texture treatments rather than swapping whole scenes.
- Fixed rail/footer/transitional surfaces remain outside scrolling text. The probe observed signal/treatment uniforms changing while the camera framing stayed continuous. Native scrollY, uniform strength, and normalized document progress are different quantities; the exact private scroll-to-HUD mapping was not recoverable from DOM alone. No exact HUD update function or React render count is claimed for Pear.
- Pointer movement was exercised across the viewport. Stipple/ring distortion is visually present, but the precise pointer velocity formula and any trail buffer could not be inferred from the active program alone.

Raw numerical probe results are retained in the session's `pear-runtime-v1.1.json`, outside the deployable application. Conclusions above distinguish direct observations from estimates.

## Local implementation

The approved content, native scrolling, rail, dark film aesthetic, and CRT footer are retained. The engine is Canvas 2D, with cached bitmap/sprite compositing; GPU acceleration of Canvas operations is browser controlled. It is not a copy of Pear's renderer.

1. **Assets:** 120 JPEGs at 960 px width, extracted evenly over the remaining 8.87 seconds of the supplied recording after a 1.8 s intro trim. The source is only 450 × 806; crop removes letterboxing, and 960 px is an upscale, not recovered detail. Run `python scripts/extract-underground-frames.py <source.mp4>` to reproduce.
2. **Loading:** frame 000 is preloaded in the page and decoded first, followed by five spaced anchors, then three bounded workers. Decoding is asynchronous and outside the render callback. ImageBitmap decode dimensions are capped at 480 px desktop / 384 px mobile (~149 / 95 MB of uncompressed image memory). Bitmaps are closed and requests aborted on effect disposal. Browsers without ImageBitmap use decoded Image objects, with potentially greater memory use.
3. **Fallback:** native muted looping video plays during loading or failed frame requests. No scroll-driven currentTime assignment exists. The complete cache fades in before native playback pauses. Missing assets leave playback and procedural graphics available. Reduced motion loads only frame 000 and does not start video.
4. **Sampling:** smoothed normalized scroll plus a 0.003 idle oscillation selects adjacent decoded frames. A small offscreen canvas blends those frames before the main camera transform. Sampling is synchronous once ready; file fetch and decode latency still exists at startup. This does not guarantee zero browser compositing latency. Source editorial cuts are interpolated, not invented away.
5. **Motion:** refs store target/current scroll, velocity, and cursor state. One stage rAF callback uses `1 - pow(0.92, dt / 16.667)`, equivalent to 0.08 damping at 60 Hz and consistent across refresh rates. Native content is not wheel-intercepted. HUD text/rail/crosshairs update directly through refs; only FX and menu controls trigger React state changes.
6. **Choreography:** overlapping smoothstep windows at 0–.22, .18–.45, .40–.70, .65–.88, and .85–1 drive film camera scale, horizon pan, signal rings, perspective grid, constellation opacity, and terminal arrival scale. The chapter rail follows actual section positions, allowing different screen sizes and expanding chat content.
7. **Dither:** the Bayer tile, radial stipple sprite, and concentric dot rings are created once. A soft-light CanvasPattern and damped trail sprites provide grain/dissolve texture. There is no per-frame getImageData/putImageData readback or random jump. This approximates the reference aesthetic; it does not threshold every source pixel as a WebGL shader would.
8. **Cost:** canvas DPR is capped at 1.5, card/HUD live backdrop blur is removed, gradients are cached, layout geometry is measured only after resize/content changes, and offscreen scene updates are skipped. Hidden pages stop animation/playback. Native keyboard scrolling, anchors, focus, and the motion toggle remain available.

## Verification

The benchmark report accompanying this revision records actual headless Chromium frame intervals, long tasks, seek events, decoded count, browser renderer, viewport, fallback behavior, mobile overflow, and reduced motion. A 60 fps target is conditional on the measured browser/hardware. Consult its results rather than assuming every frame on every device meets 16.67 ms.

Protected sources, ambassador route, redacted PDF, and grounding verifier must retain their original SHA-256 values. Run the unchanged grounding suite and production build before packaging with scripts/export-replit.py.
