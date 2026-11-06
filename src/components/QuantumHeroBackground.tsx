'use client';

import { useEffect, useRef, useState } from 'react';
import ChapterNavigation from './ChapterNavigation';
import { inspectFrame, SAMPLE_WIDTH, SAMPLE_HEIGHT } from '@/lib/motion-study';
import { createWovenFrameCache, frameAct, scrollAct, scrollFrame, ACT_STARTS, PORTAL_DESK_PATH } from '@/lib/woven-frames';
import { BREACH_PALETTES, createBreachRenderer, type BreachPalette } from '@/lib/ascii-breach';
import { annotatedBoxes } from '@/lib/woven-annotations';
import { trackEvent } from '@/lib/analytics';

type Point = { x: number; y: number };
const COLORS = ['#bff6df', '#8cdcc7', '#d4ff33'];
const FEEDS = [
  { file: 'cam-01-soc-wall', name: 'SOC_OVERWATCH' },
  { file: 'cam-02-night-pedestrians', name: 'NIGHT_CORRIDOR' },
  { file: 'cam-03-fisheye-transit', name: 'FISHEYE_TRANSIT' },
  { file: 'cam-04-spherical-grid', name: 'SPHERICAL_GRID' },
] as const;
const ANCHORS = [.18, .40, .60, .81];
const MODES = ['HYBRID_CV', 'YOLO_BOXES', 'SLAM_KEYPOINTS'] as const;
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const SCENES = [
  ['.hero', 'HERO', 'top'], ['.hero-grid-strip', 'FOUNDATION', 'top'],
  ['#role-match', 'VERIFIABLE EVIDENCE', 'role-match'], ['#projects', 'PROJECTS', 'projects'],
  ['#experience', 'EXPERIENCE', 'experience'], ['#credentials', 'CREDENTIALS', 'experience'],
  ['#ambassador', 'AMBASSADOR', 'ambassador'], ['#contact', 'CONTACT', 'ambassador'],
  ['[data-terminal-scene]', 'FOOTER', 'ambassador'],
] as const;
type Motion = 'full' | 'reduced' | 'off';

/** Decorative CV study. Boxes and keypoints are measured from each sampled frame.
 * Percentages describe motion evidence. No identity inference, redaction or audit runs.
 */
export default function QuantumHeroBackground() {
  const [mode, setMode] = useState(0);
  const [systemReduced, setSystemReduced] = useState(true);
  const [requestedMotion, setRequestedMotion] = useState<Motion>('full');
  const [failed, setFailed] = useState(false);
  const [scroll, setScroll] = useState({ percent: 0, act: -1, section: 'HERO', chapter: 'top' });
  const rootRef = useRef<HTMLDivElement>(null);
  const pictureRef = useRef<HTMLCanvasElement>(null);
  const posterRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const breachRef = useRef<HTMLCanvasElement>(null);
  const breachPalette = useRef<BreachPalette | null>(null);
  // Keep the decoded desk independent of image-cache and FX renderer lifetimes.
  const deskBufferRef = useRef<HTMLCanvasElement | null>(null);
  const readoutRef = useRef<HTMLSpanElement>(null);
  const progress = useRef(0);
  const displayMode = useRef(0);
  const redraw = useRef<(() => void) | null>(null);
  const retry = useRef<(() => void) | null>(null);
  const motion: Motion = requestedMotion === 'off' ? 'off' : systemReduced || requestedMotion === 'reduced' ? 'reduced' : 'full';

  useEffect(() => {
    // Pick once after hydration; FX toggles and resizing keep this visit's color.
    breachPalette.current ??= BREACH_PALETTES[Math.floor(Math.random() * BREACH_PALETTES.length)];
    if (rootRef.current) rootRef.current.dataset.breachPalette = breachPalette.current.name;
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setSystemReduced(preference.matches);
    sync();
    preference.addEventListener('change', sync);
    return () => preference.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    const site = rootRef.current?.closest<HTMLElement>('.site');
    if (site) site.dataset.motion = motion;
  }, [motion]);

  useEffect(() => {
    const site = rootRef.current?.closest<HTMLElement>('.site');
    if (!site) return;
    const header = site.querySelector<HTMLElement>('.hud-header');
    let pending = 0;
    let pageHeight = 1;
    let headerHeight = 65;
    let positions: { top: number; section: string; chapter: string }[] = [];
    function update() {
      pending = 0;
      const y = Math.max(0, window.scrollY);
      const ratio = Math.min(1, y / pageHeight);
      if (ratio !== progress.current) {
        progress.current = ratio;
        redraw.current?.();
      }
      site?.style.setProperty('--journey', String(progress.current));
      const marker = y + Math.max(headerHeight, Math.min(180, window.innerHeight * .3));
      const current = progress.current >= .999 ? positions.at(-1) : positions.findLast(position => position.top <= marker);
      const next = {
        percent: Math.round(progress.current * 100), act: scrollAct(progress.current), section: current?.section ?? 'HERO',
        chapter: current?.chapter ?? 'top',
      };
      setScroll(previous => previous.percent === next.percent && previous.act === next.act && previous.section === next.section ? previous : next);
    }
    function schedule() {
      if (!pending) pending = requestAnimationFrame(update);
    }
    function measure() {
      headerHeight = header?.offsetHeight ?? 65;
      site?.style.setProperty('--hud-height', `${headerHeight}px`);
      pageHeight = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      positions = SCENES.flatMap(([selector, section, chapter]) => {
        const element = site?.querySelector(selector);
        return element ? [{ top: element.getBoundingClientRect().top + window.scrollY, section, chapter }] : [];
      });
      schedule();
    }
    const observer = new ResizeObserver(measure);
    observer.observe(site);
    if (header) observer.observe(header);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', measure);
    measure();
    return () => {
      cancelAnimationFrame(pending);
      observer.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', measure);
    };
  }, []);

  useEffect(() => {
    const container = rootRef.current, overlay = canvasRef.current, picture = pictureRef.current;
    const ctx = overlay?.getContext('2d'), imageContext = picture?.getContext('2d');
    if (!container || !overlay || !picture || !ctx || !imageContext) return;
    const stage = container, effects = overlay, image = picture, ink = ctx, film = imageContext;
    const cache = motion === 'full' ? createWovenFrameCache(schedule) : null;
    const breachCanvas = breachRef.current;
    const breach = breachCanvas && createBreachRenderer(breachCanvas, breachPalette.current ?? BREACH_PALETTES[0], invalidate);
    const desk = new Image();
    desk.onload = () => {
      if (!desk.naturalWidth) return;
      const buffer = document.createElement('canvas');
      buffer.width = desk.naturalWidth;
      buffer.height = desk.naturalHeight;
      const context = buffer.getContext('2d', { alpha: false, willReadFrequently: true });
      if (!context) return;
      context.drawImage(desk, 0, 0);
      deskBufferRef.current = buffer;
      filmDirty = true;
      invalidate();
    };
    if (!deskBufferRef.current) desk.src = PORTAL_DESK_PATH;
    const revealStill = new Image();
    revealStill.onload = () => { filmDirty = true; invalidate(); };
    const sampler = document.createElement('canvas');
    sampler.width = SAMPLE_WIDTH;
    sampler.height = SAMPLE_HEIGHT;
    const sampleContext = sampler.getContext('2d', { willReadFrequently: true });
    const pointer = { x: 0, y: 0, active: false };
    const selectedFrame = () => scrollFrame(progress.current);
    let width = 0, height = 0, dpr = 0, raf = 0, painted = 0, dirty = true, filmDirty = true;
    let crop = { x: 0, y: 0, width: 0, height: 0 };
    let target = selectedFrame();
    let playhead = target, direction = 1, lastTick: number | undefined;
    let lastScroll = -1, stillSince = performance.now(), plateTimer = 0, renderedPlate: ImageBitmap | undefined;
    let introPaints = 0, sampledIntro = true;
    let fallback = false;
    let rendered: number | undefined, sampled: number | undefined;
    let posterSource: string | undefined;
    let analysis: ReturnType<typeof inspectFrame> = { boxes: [], keypoints: [] };
    const active = () => !!cache && !document.hidden;

    const project = (p: Point) => ({ x: crop.x + p.x * crop.width, y: crop.y + p.y * crop.height });
    function luma(source: CanvasImageSource) {
      if (!sampleContext) return undefined;
      sampleContext.drawImage(source, 0, 0, SAMPLE_WIDTH, SAMPLE_HEIGHT);
      const pixels = sampleContext.getImageData(0, 0, SAMPLE_WIDTH, SAMPLE_HEIGHT).data;
      const values = new Uint8Array(SAMPLE_WIDTH * SAMPLE_HEIGHT);
      for (let i = 0; i < values.length; i++) values[i] = (pixels[i * 4] * 3 + pixels[i * 4 + 1] * 6 + pixels[i * 4 + 2]) / 10;
      return values;
    }

    const line = (a: Point, b: Point) => { ink.beginPath(); ink.moveTo(a.x, a.y); ink.lineTo(b.x, b.y); ink.stroke(); };
    const draw = () => {
      ink.clearRect(0, 0, width, height);
      if (motion === 'off' || progress.current < ACT_STARTS[0]) {
        stage.dataset.annotations = '';
        stage.dataset.keypoints = '0';
        stage.dataset.blobs = '0';
        stage.dataset.frames = String(++painted);
        return;
      }
      if (displayMode.current !== 2) {
        const origin = pointer.active ? pointer : { x: width * .73, y: height * .43 };
        ink.globalAlpha = .14;
        ink.strokeStyle = '#a7d8cd';
        ink.lineWidth = .65;
        for (let col = 1; col < 12; col++) {
          const x = col * width / 12;
          line({ x: x + (origin.x - x) * .026, y: 0 }, { x, y: height });
        }
        for (let row = 1; row < 8; row++) {
          const y = row * height / 8;
          line({ x: 0, y }, { x: width, y: y + (origin.y - y) * .04 });
        }
        ink.globalAlpha = 1;
      }
      const targets: Point[] = [];
      let lock = '';
      ink.font = `${width < 600 ? 8 : 10}px monospace`;
      const landmarks = rendered === undefined ? [] : annotatedBoxes(rendered);
      const boxes = [...landmarks, ...analysis.boxes.map(box => ({ ...box, label: '' }))];
      if (displayMode.current !== 2) boxes.forEach((drawn, i) => {
        const a = project(drawn);
        const b = project({ x: drawn.x + drawn.w, y: drawn.y + drawn.h });
        if (b.x < 0 || a.x > width || b.y < 0 || a.y > height) return;
        targets.push({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
        const near = pointer.active && pointer.x > a.x - 30 && pointer.x < b.x + 30 && pointer.y > a.y - 30 && pointer.y < b.y + 30;
        if (near) lock = drawn.label || 'MOTION CLUSTER';
        ink.strokeStyle = COLORS[i % COLORS.length]; ink.lineWidth = near ? 1.7 : .8;
        ink.globalAlpha = near ? .95 : .68; ink.strokeRect(a.x, a.y, b.x - a.x, b.y - a.y);
        const label = drawn.label ? `${drawn.label} / ANNOTATED` : `MOTION CLUSTER: ${'score' in drawn ? drawn.score : ''}% / SIM`;
        const labelWidth = ink.measureText(label).width + 12;
        const labelX = Math.max(6, Math.min(width - labelWidth - 6, a.x)), labelY = Math.max(20, Math.min(height - 12, a.y));
        ink.fillStyle = '#091616d9'; ink.fillRect(labelX, labelY - 17, labelWidth, 17);
        ink.strokeRect(labelX, labelY - 17, labelWidth, 17);
        ink.fillStyle = COLORS[i % COLORS.length]; ink.fillText(label, labelX + 6, labelY - 5);
      });
      ink.globalAlpha = .65;
      if (displayMode.current !== 1) {
        const visiblePoints = analysis.keypoints.map(project).filter(p => p.x > 8 && p.x < width - 8 && p.y > 8 && p.y < height - 8);
        targets.push(...visiblePoints); ink.strokeStyle = '#38bdf8'; ink.lineWidth = .6;
        visiblePoints.forEach((p, i) => {
          ink.fillStyle = '#d8faed'; ink.fillRect(p.x - 1, p.y - 1, 2, 2);
          if (i < 4) {
            const glow = ink.createRadialGradient(p.x, p.y, 0, p.x, p.y, 13);
            glow.addColorStop(0, '#edfff3a8');
            glow.addColorStop(1, '#83cfb800');
            ink.fillStyle = glow;
            ink.fillRect(p.x - 13, p.y - 13, 26, 26);
          }
          if (i % 5 === 0) { ink.strokeStyle = '#f97366'; ink.beginPath(); ink.arc(p.x, p.y, 7, 0, Math.PI * 2); ink.stroke(); }
          if (i < 8 && visiblePoints[i + 1]) { ink.strokeStyle = '#38bdf8'; line(p, visiblePoints[i + 1]); }
        });
        ink.fillStyle = '#9ad9eb';
        ['Multiple View Geometry / SIM', 'Feature Edge / SIM', 'Risk Boundary / SIM'].forEach((label, i) => {
          const p = visiblePoints[i * 4];
          if (p) ink.fillText(label, Math.max(8, Math.min(width - 185, p.x + 10)), Math.max(30, p.y - 12));
        });
      }
      if (pointer.active && active()) {
        const lens = ink.createRadialGradient(pointer.x, pointer.y, 1, pointer.x, pointer.y, 82);
        lens.addColorStop(0, '#c3f9ef27');
        lens.addColorStop(.56, '#76c7e210');
        lens.addColorStop(1, '#76c7e200');
        ink.fillStyle = lens;
        ink.fillRect(pointer.x - 82, pointer.y - 82, 164, 164);
        ink.globalAlpha = .85; ink.strokeStyle = '#d4ff33'; ink.lineWidth = .7;
        targets.sort((a, b) => Math.hypot(a.x - pointer.x, a.y - pointer.y) - Math.hypot(b.x - pointer.x, b.y - pointer.y)).slice(0, 4).forEach(p => line(pointer, p));
        ink.beginPath(); ink.arc(pointer.x, pointer.y, lock ? 18 : 11, 0, Math.PI * 2); ink.stroke();
        line({ x: pointer.x - 24, y: pointer.y }, { x: pointer.x + 24, y: pointer.y });
        line({ x: pointer.x, y: pointer.y - 24 }, { x: pointer.x, y: pointer.y + 24 });
      }
      ink.globalAlpha = 1;
      stage.dataset.lock = lock;
      stage.dataset.annotations = landmarks.map(box => box.label).join(' ');
      stage.dataset.keypoints = String(analysis.keypoints.length);
      stage.dataset.blobs = String(analysis.boxes.length);
      stage.dataset.frames = String(++painted);
      const readout = `${lock ? `SIM LOCK / ${lock} · ` : ''}MOTION: ${analysis.boxes.length} · EDGES: ${analysis.keypoints.length} · NO MODEL INFERENCE`;
      if (readoutRef.current && readoutRef.current.textContent !== readout) readoutRef.current.textContent = readout;
    };

    function tick(now: number) {
      raf = 0;
      if (document.hidden) return;
      const elapsed = lastTick === undefined ? 16 : Math.min(64, now - lastTick);
      lastTick = now;
      const ratio = progress.current;
      const intro = ratio < ACT_STARTS[0];
      const room = ratio < .14;
      if (ratio !== lastScroll) {
        if (intro) cache?.cancelPlate();
        lastScroll = ratio;
        stillSince = now;
        filmDirty = true;
        dirty = true;
        clearTimeout(plateTimer);
        plateTimer = window.setTimeout(schedule, 180);
      }
      const next = selectedFrame();
      if (next !== target) {
        direction = next > target ? 1 : -1;
        target = next;
      }
      let current: number | undefined;
      let bitmap: ImageBitmap | undefined;
      if (cache) {
        playhead = mix(playhead, target, 1 - Math.exp(-elapsed / 78));
        if (Math.abs(playhead - target) < .15) playhead = target;
        const desired = Math.round(playhead);
        cache.prioritize(desired, target, direction);
        const trackingReady = desired === 0 || !!cache.get(desired - 1) || cache.failed(desired - 1);
        if (desired === target) {
          // Present the destination and its tracking data together. Late cache
          // arrivals must never step through nearby frames after scrolling stops.
          if (cache.get(target) && trackingReady) current = target;
          else if (rendered !== undefined && frameAct(rendered) === frameAct(target)) current = rendered;
        } else {
          current = cache.nearest(desired);
          if (current === target) current = rendered;
        }
        bitmap = current === undefined ? undefined : cache.get(current);
        if (!bitmap) current = undefined;
        const unavailable = cache.failed(desired);
        stage.dataset.playback = unavailable ? 'fallback' : bitmap ? 'active' : 'loading';
        if (fallback !== unavailable) {
          fallback = unavailable;
          setFailed(unavailable);
        }
      } else {
        stage.dataset.playback = motion === 'off' ? 'off' : 'paused';
      }

      const previous = current === undefined ? undefined : cache?.get(current - 1);
      const still = posterRef.current;
      if (intro !== sampledIntro || current !== sampled || (!bitmap && still?.complete && still.currentSrc !== posterSource)) {
        sampled = current;
        sampledIntro = intro;
        posterSource = still?.complete ? still.currentSrc : undefined;
        const source = bitmap ?? (still?.complete && still.naturalWidth ? still : undefined);
        const values = source && luma(source);
        analysis = values && motion !== 'off' && !intro ? inspectFrame(values, previous && luma(previous)) : { boxes: [], keypoints: [] };
        dirty = true;
      }
      const frameChanged = current !== rendered;
      const atRest = playhead === target && now - stillSince >= 160;
      if (!intro && atRest && current === target) void cache?.requestPlate(target);
      const plate = !intro && atRest && current === target ? cache?.plate(target) : undefined;
      if (plate !== renderedPlate) { renderedPlate = plate; filmDirty = true; }
      const deskBuffer = deskBufferRef.current;
      const deskReady = !!deskBuffer;
      const introFallback = intro && !deskReady;
      if (intro && !room && !bitmap && !revealStill.src) revealStill.src = `/surveillance/${FEEDS[0].file}.jpg`;
      const zoomProgress = Math.min(1, ratio / .14);
      const zoom = 1 + zoomProgress * zoomProgress * 5;
      const deskX = width < height ? width / 2 - .647 * crop.width : crop.x;
      const monitor = { x: deskX + .647 * crop.width, y: crop.y + .432 * crop.height };
      const focus = {
        x: mix(monitor.x, width / 2, zoomProgress),
        y: mix(monitor.y, height / 2, zoomProgress),
      };
      if (filmDirty || frameChanged || introFallback !== (stage.dataset.sampling === 'desk-fallback')) {
        if (introFallback) {
          // A quiet, filled silhouette until the real desk is buffered. No wireframe.
          film.fillStyle = '#07090e';
          film.fillRect(0, 0, width, height);
          film.fillStyle = '#0b1016';
          film.fillRect(monitor.x - crop.width * .15, monitor.y - crop.height * .145, crop.width * .3, crop.height * .29);
          film.fillStyle = '#0c1117';
          film.fillRect(monitor.x - crop.width * .27, monitor.y + crop.height * .25, crop.width * .55, crop.height * .035);
        } else if (intro) {
          film.clearRect(0, 0, width, height);
          film.drawImage(deskBuffer!, Math.round(focus.x - .647 * crop.width * zoom), Math.round(focus.y - .432 * crop.height * zoom),
            Math.round(crop.width * zoom), Math.round(crop.height * zoom));
          const reveal = bitmap ?? (revealStill.complete && revealStill.naturalWidth ? revealStill : undefined);
          if (!room && reveal) {
            film.drawImage(reveal, crop.x, crop.y, crop.width, crop.height);
          }
        } else if (!room && (plate || bitmap)) {
          film.drawImage(plate || bitmap!, crop.x, crop.y, crop.width, crop.height);
        } else {
          film.clearRect(0, 0, width, height);
        }
        rendered = current;
        stage.dataset.frame = current === undefined ? '' : String(current);
        stage.dataset.trackingFrame = stage.dataset.frame;
        stage.dataset.sampling = introFallback ? 'desk-fallback' : intro ? 'desk-plate' : bitmap ? 'woven-frame' : 'still-edges';
        stage.dataset.resolution = introFallback ? 'fallback' : intro || plate ? '4k' : 'hd';
        stage.dataset.deskBuffer = deskReady ? 'ready' : 'loading';
        filmDirty = false;
      }
      if (dirty || frameChanged) {
        draw();
        dirty = false;
      }
      stage.dataset.intro = room ? ratio < .02 ? 'desk' : 'breach' : intro ? 'reveal' : 'complete';
      if (breachCanvas) {
        breachCanvas.style.visibility = intro && motion !== 'off' ? 'visible' : 'hidden';
        if (intro && motion !== 'off') {
          breach?.draw(introFallback ? 0 : ratio, motion === 'full' ? now / 1000 : 0,
            introFallback ? monitor : focus, pointer, breachCanvas.width / width);
          stage.dataset.orbFrames = String(++introPaints);
        }
      }
      stage.dataset.settled = String(!introFallback && (intro ? deskReady
        : !!cache && playhead === target && rendered === target && (!!plate || cache.plateFailed(target))));
      if (cache && (playhead !== target || intro)) schedule();
      else lastTick = undefined;
    }

    function schedule() {
      if (!raf && !document.hidden) raf = requestAnimationFrame(tick);
    }
    function invalidate() { dirty = true; schedule(); }
    function resize() {
      const nextWidth = stage.clientWidth, nextHeight = stage.clientHeight;
      const nextDpr = Math.min(devicePixelRatio || 1, 3840 / Math.max(nextWidth, nextHeight), 2160 / Math.min(nextWidth, nextHeight));
      if (!nextWidth || !nextHeight || (width === nextWidth && height === nextHeight && dpr === nextDpr)) return;
      width = nextWidth;
      height = nextHeight;
      dpr = nextDpr;
      const pixelWidth = Math.round(width * dpr), pixelHeight = Math.round(height * dpr);
      const scaleX = pixelWidth / width, scaleY = pixelHeight / height;
      const cover = Math.max(pixelWidth / 16, pixelHeight / 9);
      const cropWidth = Math.round(16 * cover), cropHeight = Math.round(9 * cover);
      crop = {
        x: Math.round((pixelWidth - cropWidth) / 2) / scaleX,
        y: Math.round((pixelHeight - cropHeight) / 2) / scaleY,
        width: cropWidth / scaleX, height: cropHeight / scaleY,
      };
      for (const surface of [image, effects]) {
        surface.width = pixelWidth;
        surface.height = pixelHeight;
      }
      // Glyph cells carry no extra detail at Retina resolution. Keep the room/CV
      // native-DPR while avoiding millions of redundant shader fragments.
      if (breachCanvas) {
        const effectRatio = Math.min(dpr, 1, 1920 / Math.max(width, height));
        breachCanvas.width = Math.round(width * effectRatio);
        breachCanvas.height = Math.round(height * effectRatio);
      }
      for (const context of [film, ink]) context.setTransform(scaleX, 0, 0, scaleY, 0, 0);
      film.imageSmoothingEnabled = true;
      film.imageSmoothingQuality = 'high';
      filmDirty = true;
      invalidate();
    }
    function move(event: PointerEvent) {
      if (event.pointerType !== 'mouse' || !active()) return;
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;
      invalidate();
    }
    function leave() { pointer.active = false; invalidate(); }
    function visibility() {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
        pointer.active = false;
      } else {
        lastTick = undefined;
        filmDirty = true;
        invalidate();
      }
    }
    function loadStill() { posterSource = undefined; invalidate(); }
    const still = posterRef.current;
    setFailed(false);
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(stage);
    redraw.current = invalidate;
    retry.current = () => { cache?.retry(); schedule(); };
    still?.addEventListener('load', loadStill);
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', move, { passive: true });
    document.documentElement.addEventListener('pointerleave', leave);
    document.addEventListener('visibilitychange', visibility);
    resize();
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(plateTimer);
      desk.onload = null;
      revealStill.onload = null;
      breach?.dispose();
      cache?.dispose();
      redraw.current = null;
      retry.current = null;
      resizeObserver.disconnect();
      still?.removeEventListener('load', loadStill);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', move);
      document.documentElement.removeEventListener('pointerleave', leave);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [motion]);

  const camera = `CAM_0${scroll.act + 1}`;
  function jumpToAct(act: number) {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({ top: Math.round(maxScroll * ANCHORS[act]), behavior: motion === 'full' ? 'smooth' : 'instant' });
  }
  function changeMotion(request: Motion) {
    const next = request === 'full' && systemReduced ? 'reduced' : request;
    setRequestedMotion(request);
    if (next !== motion) trackEvent('fx_changed', next);
  }

  return <>
    <div ref={rootRef} className="surveillance-stage" data-feed={camera} data-motion={motion} data-section={scroll.section} data-progress={scroll.percent} data-settled="false" aria-hidden="true">
      <div className="surveillance-picture">
        <img ref={posterRef} className="surveillance-poster" src={scroll.act < 0 ? PORTAL_DESK_PATH : `/surveillance/${FEEDS[scroll.act].file}.jpg`} alt=""/>
        <canvas ref={pictureRef} className="surveillance-film"/>
        <canvas ref={breachRef} className="surveillance-breach"/>
        <div className="surveillance-shade"/><canvas ref={canvasRef} className="surveillance-overlay"/><div className="surveillance-scanlines"/>
      </div>
    </div>
    <ChapterNavigation motion={motion} cycleMotion={() => changeMotion(motion === 'full' ? 'reduced' : motion === 'reduced' ? 'off' : 'full')} camera={camera} {...scroll}>
      <span className="surveillance-caption"><span/> VISUAL SIMULATION / WOVEN CAMERA STUDY</span>
      <div className="surveillance-feeds" role="group" aria-label="Jump to camera act">
        {FEEDS.map(({name}, index) => <button className="surveillance-feed" key={name} aria-pressed={index === scroll.act}
          aria-label={`CAM_0${index + 1} / ${name}`} title={name} onClick={() => jumpToAct(index)}>CAM_0{index + 1}</button>)}
      </div>
      <div className="surveillance-modes" role="group" aria-label="Simulation visualization mode">
        {MODES.map((name, i) => <button key={name} aria-pressed={mode === i} onClick={() => {
          displayMode.current = i;
          setMode(i);
          redraw.current?.();
        }}>{name}</button>)}
        <button aria-label={motion === 'off' ? 'Resume surveillance effects' : 'Pause surveillance effects'} onClick={() => changeMotion(motion === 'off' ? 'full' : 'off')}>
          {motion === 'off' ? 'RESUME ▷' : 'PAUSE Ⅱ'}
        </button>
      </div>
      <span className="surveillance-section">{String(scroll.percent).padStart(3, '0')}% / {scroll.section}</span>
      <span ref={readoutRef} className="surveillance-readout">VISUAL SIMULATION / NO MODEL INFERENCE</span>
      {failed && motion === 'full' && <button className="surveillance-retry" onClick={() => retry.current?.()}>Still image · Retry footage</button>}
    </ChapterNavigation>
  </>;
}
