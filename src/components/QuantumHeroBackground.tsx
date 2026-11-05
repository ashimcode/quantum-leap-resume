'use client';

import { useEffect, useRef, useState } from 'react';
import ChapterNavigation from './ChapterNavigation';

type Point = { x: number; y: number };
type Zone = Point & { label: string; score: number; w: number; h: number };
const COLORS = ['#38bdf8', '#f97316', '#a3e635'];
const FEEDS = [
  { file: 'cam-01-soc-wall', name: 'SOC_OVERWATCH', zones: [
    { label: 'Monitor_Feed', score: 98, x: .04, y: .26, w: .24, h: .35 },
    { label: 'Operator_Station', score: 94, x: .68, y: .56, w: .27, h: .4 },
    { label: 'Telemetry_Wall', score: 89, x: .48, y: .25, w: .42, h: .28 },
    { label: 'Traffic_Stream', score: 82, x: .28, y: .23, w: .18, h: .29 },
  ] },
  { file: 'cam-02-night-pedestrians', name: 'NIGHT_CORRIDOR', zones: [
    { label: 'Pedestrian', score: 97, x: .34, y: .5, w: .17, h: .48 },
    { label: 'Pedestrian', score: 93, x: .52, y: .55, w: .14, h: .43 },
    { label: 'Billboard_Display', score: 99, x: .52, y: .16, w: .17, h: .39 },
    { label: 'Retail_Ingress', score: 86, x: .05, y: .33, w: .25, h: .53 },
  ] },
  { file: 'cam-03-fisheye-transit', name: 'FISHEYE_TRANSIT', zones: [
    { label: 'Transit_Bus', score: 96, x: .66, y: .54, w: .2, h: .28 },
    { label: 'Urban_Cab', score: 92, x: .29, y: .65, w: .18, h: .2 },
    { label: 'Lane_Vector', score: 88, x: .48, y: .45, w: .16, h: .45 },
    { label: 'Pedestrian', score: 84, x: .12, y: .4, w: .13, h: .28 },
  ] },
  { file: 'cam-04-spherical-grid', name: 'SPHERICAL_GRID', zones: [
    { label: 'Spherical_Vehicle', score: 95, x: .38, y: .34, w: .22, h: .32 },
    { label: 'Traffic_Node', score: 91, x: .61, y: .32, w: .22, h: .26 },
    { label: 'Horizon_Structure', score: 87, x: .12, y: .11, w: .23, h: .36 },
    { label: 'Optical_Grid', score: 93, x: .57, y: .66, w: .24, h: .2 },
  ] },
] as const;
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

/** Decorative CV study. Gradients/motion guide authored zones, not an AI model.
 * Percentages are simulation values. No identity inference, redaction or audit runs.
 */
export default function QuantumHeroBackground() {
  const [feed, setFeed] = useState<number | null>(null);
  const [mode, setMode] = useState(0);
  const [systemReduced, setSystemReduced] = useState(true);
  const [requestedMotion, setRequestedMotion] = useState<Motion>('full');
  const [failed, setFailed] = useState(false);
  const [scroll, setScroll] = useState({ percent: 0, section: 'HERO', chapter: 'top', atTop: true });
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const readoutRef = useRef<HTMLSpanElement>(null);
  const progress = useRef(0);
  const displayMode = useRef(0);
  const redrawStill = useRef<(() => void) | null>(null);
  const motion: Motion = requestedMotion === 'off' ? 'off' : systemReduced || requestedMotion === 'reduced' ? 'reduced' : 'full';

  useEffect(() => {
    setFeed(crypto.getRandomValues(new Uint8Array(1))[0] % FEEDS.length);
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
    let pending = 0;
    let pageHeight = 1;
    let positions: { top: number; section: string; chapter: string }[] = [];
    function update() {
      pending = 0;
      const y = Math.max(0, window.scrollY);
      progress.current = Math.min(1, y / pageHeight);
      site?.style.setProperty('--journey', String(progress.current));
      const marker = y + Math.min(180, window.innerHeight * .3);
      const current = progress.current >= .999 ? positions.at(-1) : positions.findLast(position => position.top <= marker);
      const next = {
        percent: Math.round(progress.current * 100), section: current?.section ?? 'HERO',
        chapter: current?.chapter ?? 'top', atTop: y < 72,
      };
      setScroll(previous => previous.percent === next.percent && previous.section === next.section && previous.atTop === next.atTop ? previous : next);
    }
    function schedule() {
      if (!pending) pending = requestAnimationFrame(update);
    }
    function measure() {
      pageHeight = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      positions = SCENES.flatMap(([selector, section, chapter]) => {
        const element = site?.querySelector(selector);
        return element ? [{ top: element.getBoundingClientRect().top + window.scrollY, section, chapter }] : [];
      });
      schedule();
    }
    const observer = new ResizeObserver(measure);
    observer.observe(site);
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
    const root = rootRef.current, canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!root || !canvas || !context || feed === null) return;
    const ctx = context, element = canvas, container = root, selected = FEEDS[feed];
    const reduced = motion === 'reduced', off = motion === 'off';
    container.dataset.lock = '';
    if (readoutRef.current) readoutRef.current.textContent = 'VISUAL SIMULATION / NO MODEL INFERENCE';
    const video = videoRef.current;
    const sampler = document.createElement('canvas'); sampler.width = 64; sampler.height = 36;
    const sampleContext = sampler.getContext('2d', { willReadFrequently: true });
    let previous = new Uint8Array(64 * 36);
    let points: Point[] = [], targetPoints: Point[] = [];
    let width = 1, height = 1, raf = 0, frames = 0, lastDraw = 0, lastSample = -200;
    let disposed = false, samplingFailed = false, locked = '';
    let optics = motion === 'full' && !failed ? progress.current : 0;
    let zoom = 1, offset = 0;
    const pointer = { x: 0, y: 0, active: false };
    const zones: (Zone & { tx: number; ty: number; sx: number; sy: number })[] = selected.zones.map(z => ({ ...z, tx: 0, ty: 0, sx: 0, sy: 0 }));
    const active = () => !disposed && !document.hidden && motion === 'full' && !failed;
    // Match the same cover crop, zoom and vertical offset applied to the video.
    const project = (p: Point) => {
      const scale = Math.max(width / 16, height / 9) * zoom;
      return { x: (p.x - .5) * 16 * scale + width / 2, y: (p.y - .5) * 9 * scale + height / 2 + offset };
    };
    const sample = () => {
      if (!video || video.readyState < 2 || !sampleContext || samplingFailed) return;
      try {
        sampleContext.drawImage(video, 0, 0, 64, 36);
        const pixels = sampleContext.getImageData(0, 0, 64, 36).data;
        const luma = new Uint8Array(64 * 36);
        for (let i = 0; i < luma.length; i++) luma[i] = (pixels[i * 4] * 3 + pixels[i * 4 + 1] * 6 + pixels[i * 4 + 2]) / 10;
        const candidates: (Point & { strength: number })[] = [];
        for (let y = 2; y < 34; y += 2) for (let x = 2; x < 62; x += 2) {
          const i = y * 64 + x;
          const gradient = Math.abs(luma[i + 1] - luma[i - 1]) + Math.abs(luma[i + 64] - luma[i - 64]);
          const movement = Math.abs(luma[i] - previous[i]);
          if (gradient > 32) candidates.push({ x: x / 64, y: y / 36, strength: gradient + movement * .5 });
        }
        candidates.sort((a, b) => b.strength - a.strength); targetPoints = [];
        for (const point of candidates) {
          if (targetPoints.every(p => Math.hypot((point.x - p.x) * 16, (point.y - p.y) * 9) > .55)) targetPoints.push(point);
          if (targetPoints.length === 28) break;
        }
        zones.forEach(z => {
          let total = 0, xSum = 0, ySum = 0;
          for (const p of candidates) if (p.x > z.x && p.x < z.x + z.w && p.y > z.y && p.y < z.y + z.h) {
            total += p.strength; xSum += p.x * p.strength; ySum += p.y * p.strength;
          }
          z.tx = total ? (xSum / total - z.x - z.w / 2) * .12 : 0;
          z.ty = total ? (ySum / total - z.y - z.h / 2) * .12 : 0;
        });
        previous = luma; container.dataset.sampling = 'luminance-motion';
        container.dataset.keypoints = String(targetPoints.length);
      } catch { samplingFailed = true; container.dataset.sampling = 'unavailable'; }
    };
    const line = (a: Point, b: Point) => { ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); };
    const draw = (time: number) => {
      const smoothing = reduced ? 1 : 1 - Math.exp(-Math.min(time - lastDraw || 16, 64) / 95); lastDraw = time;
      optics = reduced || off || failed ? 0 : mix(optics, progress.current, smoothing);
      zoom = 1 + optics * .045;
      offset = -height * .016 * optics;
      container.style.setProperty('--camera-zoom', zoom.toFixed(5));
      container.style.setProperty('--camera-offset', `${offset.toFixed(2)}px`);
      ctx.clearRect(0, 0, width, height); if (off) return;
      if (active() && time - lastSample > 100) { sample(); lastSample = time; }
      points = targetPoints.map(p => {
        const nearest = points.reduce<Point | undefined>((best, old) => !best || Math.hypot(old.x - p.x, old.y - p.y) < Math.hypot(best.x - p.x, best.y - p.y) ? old : best, undefined);
        return nearest && Math.hypot(nearest.x - p.x, nearest.y - p.y) < .15
          ? { x: mix(nearest.x, p.x, smoothing), y: mix(nearest.y, p.y, smoothing) } : p;
      });
      const targets: Point[] = []; let lock = '';
      ctx.font = `${width < 600 ? 8 : 10}px monospace`;
      if (displayMode.current !== 2) zones.forEach((z, i) => {
        z.sx = mix(z.sx, z.tx, smoothing); z.sy = mix(z.sy, z.ty, smoothing);
        const a = project({ x: z.x + z.sx, y: z.y + z.sy });
        const b = project({ x: z.x + z.w + z.sx, y: z.y + z.h + z.sy });
        if (b.x < 0 || a.x > width || b.y < 0 || a.y > height) return;
        targets.push({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
        const near = pointer.active && pointer.x > a.x - 30 && pointer.x < b.x + 30 && pointer.y > a.y - 30 && pointer.y < b.y + 30;
        if (near) lock = z.label;
        ctx.strokeStyle = COLORS[i % COLORS.length]; ctx.lineWidth = near ? 1.7 : .8;
        ctx.globalAlpha = near ? .95 : .65; ctx.strokeRect(a.x, a.y, b.x - a.x, b.y - a.y);
        const label = `${z.label}: ${z.score}% / SIM`, labelWidth = ctx.measureText(label).width + 12;
        const labelX = Math.max(6, Math.min(width - labelWidth - 6, a.x)), labelY = Math.max(20, Math.min(height - 12, a.y));
        ctx.fillStyle = COLORS[i % COLORS.length]; ctx.fillRect(labelX, labelY - 17, labelWidth, 17);
        ctx.fillStyle = '#05090c'; ctx.fillText(label, labelX + 6, labelY - 5);
      });
      ctx.globalAlpha = .65;
      if (displayMode.current !== 1) {
        const visiblePoints = points.map(project).filter(p => p.x > 8 && p.x < width - 8 && p.y > 8 && p.y < height - 8);
        targets.push(...visiblePoints); ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = .6;
        visiblePoints.forEach((p, i) => {
          ctx.fillStyle = '#e8e66b'; ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
          if (i % 5 === 0) { ctx.strokeStyle = '#f97366'; ctx.beginPath(); ctx.arc(p.x, p.y, 7, 0, Math.PI * 2); ctx.stroke(); }
          if (i < 8 && visiblePoints[i + 1]) { ctx.strokeStyle = '#38bdf8'; line(p, visiblePoints[i + 1]); }
        });
        ctx.fillStyle = '#9ad9eb';
        ['Multiple View Geometry / SIM', 'Optical Flow Vector / SIM', 'Risk Boundary / SIM'].forEach((label, i) => {
          const p = visiblePoints[i * 4];
          if (p) ctx.fillText(label, Math.max(8, Math.min(width - 185, p.x + 10)), Math.max(30, p.y - 12));
        });
      }
      if (pointer.active && active()) {
        ctx.globalAlpha = .85; ctx.strokeStyle = '#d4ff33'; ctx.lineWidth = .7;
        targets.sort((a, b) => Math.hypot(a.x - pointer.x, a.y - pointer.y) - Math.hypot(b.x - pointer.x, b.y - pointer.y)).slice(0, 4).forEach(p => line(pointer, p));
        ctx.beginPath(); ctx.arc(pointer.x, pointer.y, lock ? 18 : 11, 0, Math.PI * 2); ctx.stroke();
        line({ x: pointer.x - 24, y: pointer.y }, { x: pointer.x + 24, y: pointer.y });
        line({ x: pointer.x, y: pointer.y - 24 }, { x: pointer.x, y: pointer.y + 24 });
      }
      ctx.globalAlpha = 1;
      if (locked !== lock) {
        locked = lock; container.dataset.lock = lock;
        if (readoutRef.current) readoutRef.current.textContent = lock
          ? `SIM LOCK / ${lock} · PII_REDACTION: DEMO · ANOMALY_SCORE: DEMO · MODEL_AUDIT: NOT RUN`
          : 'VISUAL SIMULATION / NO MODEL INFERENCE';
      }
      container.dataset.frames = String(++frames);
    };
    const tick = (time: number) => { raf = 0; if (!active()) return; if (time - lastDraw >= 15) draw(time); raf = requestAnimationFrame(tick); };
    const syncPlayback = () => {
      cancelAnimationFrame(raf); raf = 0;
      if (active()) {
        if (video) void video.play().catch(error => {
          // Switching feeds/unmounting can abort an earlier play promise normally.
          if (!disposed && active() && error?.name !== 'AbortError') setFailed(true);
        });
        raf = requestAnimationFrame(tick);
      }
      else { video?.pause(); draw(performance.now()); }
      container.dataset.playback = active() ? 'active' : failed ? 'fallback' : off ? 'off' : 'paused';
    };
    const resize = () => {
      width = container.clientWidth; height = container.clientHeight;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      element.width = Math.round(width * dpr); element.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); draw(performance.now());
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || !active()) return;
      pointer.x = event.clientX; pointer.y = event.clientY; pointer.active = true;
    };
    const leave = () => { pointer.active = false; };
    redrawStill.current = () => { if (!active()) draw(performance.now()); };
    const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(container);
    window.addEventListener('pointermove', move, { passive: true });
    document.documentElement.addEventListener('pointerleave', leave);
    document.addEventListener('visibilitychange', syncPlayback); resize(); syncPlayback();
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      // Keep gesture-started playback when retrying on the same media element.
      if (!container.isConnected) video?.pause();
      redrawStill.current = null;
      resizeObserver.disconnect();
      window.removeEventListener('pointermove', move);
      document.documentElement.removeEventListener('pointerleave', leave);
      document.removeEventListener('visibilitychange', syncPlayback);
    };
  }, [feed, motion, failed]);

  const selected = feed === null ? null : FEEDS[feed];
  const camera = feed === null ? 'CAM' : `CAM_0${feed + 1}`;
  const cycle = () => { setFailed(false); setFeed(value => value === null ? 0 : (value + 1) % FEEDS.length); };
  function cycleMotion() {
    setFailed(false);
    setRequestedMotion(motion === 'full' ? 'reduced' : motion === 'reduced' ? 'off' : 'full');
  }
  function retryPlayback() {
    const video = videoRef.current;
    if (!video) return;
    if (video.error) video.load();
    void video.play().then(() => setFailed(false), () => setFailed(true));
  }

  return <>
    <div ref={rootRef} className="surveillance-stage" data-feed={camera} data-motion={motion} data-section={scroll.section} data-progress={scroll.percent} aria-hidden="true">
      <div className="surveillance-picture">
        {selected && <img className="surveillance-poster" src={`/surveillance/${selected.file}.jpg`} alt=""/>}
        <video ref={videoRef} src={selected && motion === 'full' ? `/surveillance/${selected.file}.mp4` : undefined}
          hidden={motion !== 'full' || failed} muted loop playsInline preload="metadata" onError={() => { if (motion === 'full') setFailed(true); }}/>
        <canvas ref={canvasRef}/><div className="surveillance-shade"/><div className="surveillance-scanlines"/>
      </div>
    </div>
    <ChapterNavigation motion={motion} cycleMotion={cycleMotion} camera={camera} {...scroll}>
      <span className="surveillance-caption"><span/> VISUAL SIMULATION / CAMERA STUDY</span>
      <button className="surveillance-feed" onClick={cycle} aria-label={`Switch surveillance camera, ${camera}`}>FEED: {selected ? `${camera} // ${selected.name}` : 'CONNECTING'} <span aria-hidden="true">↗</span></button>
      <div className="surveillance-modes" role="group" aria-label="Simulation visualization mode">
        {MODES.map((name, i) => <button key={name} aria-pressed={mode === i} onClick={() => {
          displayMode.current = i;
          setMode(i);
          redrawStill.current?.();
        }}>{name}</button>)}
        <button aria-label={motion === 'off' ? 'Resume surveillance effects' : 'Pause surveillance effects'} onClick={() => setRequestedMotion(motion === 'off' ? 'full' : 'off')}>
          {motion === 'off' ? 'RESUME ▷' : 'PAUSE Ⅱ'}
        </button>
      </div>
      <span className="surveillance-section">{String(scroll.percent).padStart(3, '0')}% / {scroll.section}</span>
      <span ref={readoutRef} className="surveillance-readout">VISUAL SIMULATION / NO MODEL INFERENCE</span>
      {failed && motion === 'full' && <button className="surveillance-retry" onClick={retryPlayback}>Still image · Retry playback</button>}
    </ChapterNavigation>
  </>;
}
