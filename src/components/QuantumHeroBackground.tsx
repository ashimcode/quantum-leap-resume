'use client';

import { useEffect, useRef, useState } from 'react';
import ChapterNavigation from './ChapterNavigation';
import { inspectFrame, SAMPLE_WIDTH, SAMPLE_HEIGHT } from '@/lib/motion-study';
import { createWovenFrameCache, frameAct, WOVEN_ACT_LENGTH, WOVEN_FRAME_COUNT } from '@/lib/woven-frames';
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
const ANCHORS = [0, .28, .55, .8];
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
  const [scroll, setScroll] = useState({ percent: 0, act: 0, section: 'HERO', chapter: 'top' });
  const rootRef = useRef<HTMLDivElement>(null);
  const pictureRef = useRef<HTMLCanvasElement>(null);
  const posterRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const readoutRef = useRef<HTMLSpanElement>(null);
  const progress = useRef(0);
  const displayMode = useRef(0);
  const redraw = useRef<(() => void) | null>(null);
  const retry = useRef<(() => void) | null>(null);
  const motion: Motion = requestedMotion === 'off' ? 'off' : systemReduced || requestedMotion === 'reduced' ? 'reduced' : 'full';

  useEffect(() => {
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
      progress.current = Math.min(1, y / pageHeight);
      site?.style.setProperty('--journey', String(progress.current));
      const marker = y + Math.max(headerHeight, Math.min(180, window.innerHeight * .3));
      const current = progress.current >= .999 ? positions.at(-1) : positions.findLast(position => position.top <= marker);
      const next = {
        percent: Math.round(progress.current * 100), act: Math.min(3, Math.floor(progress.current * 4)), section: current?.section ?? 'HERO',
        chapter: current?.chapter ?? 'top',
      };
      redraw.current?.();
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
    const cache = motion === 'full' ? createWovenFrameCache() : null;
    const sampler = document.createElement('canvas');
    sampler.width = SAMPLE_WIDTH;
    sampler.height = SAMPLE_HEIGHT;
    const sampleContext = sampler.getContext('2d', { willReadFrequently: true });
    const pointer = { x: 0, y: 0, active: false };
    let width = 1, height = 1, raf = 0, painted = 0, dirty = true;
    let target = progress.current * WOVEN_FRAME_COUNT;
    let playhead = target, direction = 1, lastInput = performance.now(), lastTick = lastInput;
    let fallback = false;
    let rendered: number | undefined, sampled: number | undefined, sampledPrevious = false;
    let posterSource: string | undefined;
    let analysis: ReturnType<typeof inspectFrame> = { boxes: [], keypoints: [] };
    const active = () => !!cache && !document.hidden;

    const project = (p: Point) => {
      const scale = Math.max(width / 16, height / 9);
      return { x: (p.x - .5) * 16 * scale + width / 2, y: (p.y - .5) * 9 * scale + height / 2 };
    };
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
      if (motion === 'off') return;
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
      const elapsed = Math.min(64, now - lastTick);
      lastTick = now;
      const next = Math.min(WOVEN_FRAME_COUNT - 1, progress.current * WOVEN_FRAME_COUNT);
      if (Math.abs(next - target) > .001) {
        direction = next > target ? 1 : -1;
        target = next;
        lastInput = now;
      }
      let current: number | undefined;
      let bitmap: ImageBitmap | undefined;
      if (cache) {
        playhead = mix(playhead, target, 1 - Math.exp(-elapsed / 78));
        const idle = !fallback && now - lastInput > 380 && Math.abs(playhead - target) < .15;
        const start = frameAct(target) * WOVEN_ACT_LENGTH;
        const ambient = idle ? Math.sin((now - lastInput - 380) / 1000) * 2 : 0;
        const desired = Math.round(idle
          ? Math.max(start, Math.min(start + WOVEN_ACT_LENGTH - 1, target + ambient))
          : playhead);
        cache.prioritize(desired, Math.round(target), direction);
        current = cache.nearest(desired);
        bitmap = current === undefined ? undefined : cache.get(current);
        const unavailable = cache.failed(desired) || (fallback && !bitmap);
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
      if (current !== sampled || !!previous !== sampledPrevious || (!bitmap && still?.complete && still.currentSrc !== posterSource)) {
        sampled = current;
        sampledPrevious = !!previous;
        posterSource = still?.complete ? still.currentSrc : undefined;
        const source = bitmap ?? (still?.complete && still.naturalWidth ? still : undefined);
        const values = source && luma(source);
        analysis = values && motion !== 'off' ? inspectFrame(values, previous && luma(previous)) : { boxes: [], keypoints: [] };
        dirty = true;
      }
      if (dirty || current !== rendered) {
        if (bitmap) {
          const a = project({ x: 0, y: 0 }), b = project({ x: 1, y: 1 });
          film.drawImage(bitmap, a.x, a.y, b.x - a.x, b.y - a.y);
        } else {
          film.clearRect(0, 0, width, height);
        }
        rendered = current;
        stage.dataset.frame = current === undefined ? '' : String(current);
        stage.dataset.trackingFrame = stage.dataset.frame;
        stage.dataset.sampling = bitmap ? 'woven-frame' : 'still-edges';
        draw();
        dirty = false;
      }
      if (active()) schedule();
    }

    function schedule() {
      if (!raf && !document.hidden) raf = requestAnimationFrame(tick);
    }
    function invalidate() { dirty = true; schedule(); }
    function resize() {
      width = stage.clientWidth;
      height = stage.clientHeight;
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      for (const surface of [image, effects]) {
        surface.width = Math.round(width * dpr);
        surface.height = Math.round(height * dpr);
      }
      for (const context of [film, ink]) context.setTransform(dpr, 0, 0, dpr, 0, 0);
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
        lastTick = performance.now();
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
    window.addEventListener('pointermove', move, { passive: true });
    document.documentElement.addEventListener('pointerleave', leave);
    document.addEventListener('visibilitychange', visibility);
    resize();
    return () => {
      cancelAnimationFrame(raf);
      cache?.dispose();
      redraw.current = null;
      retry.current = null;
      resizeObserver.disconnect();
      still?.removeEventListener('load', loadStill);
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
    <div ref={rootRef} className="surveillance-stage" data-feed={camera} data-motion={motion} data-section={scroll.section} data-progress={scroll.percent} aria-hidden="true">
      <div className="surveillance-picture">
        <img ref={posterRef} className="surveillance-poster" src={`/surveillance/${FEEDS[scroll.act].file}.jpg`} alt=""/>
        <canvas ref={pictureRef} className="surveillance-film"/>
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
