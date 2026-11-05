'use client';

import { useEffect, useRef, useState } from 'react';
import ChapterNavigation from './ChapterNavigation';
import { inspectFrame, SAMPLE_WIDTH, SAMPLE_HEIGHT, type MotionBox } from '@/lib/motion-study';

type Point = { x: number; y: number };
const COLORS = ['#bff6df', '#8cdcc7', '#d4ff33'];
const FEEDS = [
  { file: 'cam-01-soc-wall', name: 'SOC_OVERWATCH' },
  { file: 'cam-02-night-pedestrians', name: 'NIGHT_CORRIDOR' },
  { file: 'cam-03-fisheye-transit', name: 'FISHEYE_TRANSIT' },
  { file: 'cam-04-spherical-grid', name: 'SPHERICAL_GRID' },
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

/** Decorative CV study. Boxes and keypoints are measured from each sampled frame.
 * Percentages describe motion evidence. No identity inference, redaction or audit runs.
 */
export default function QuantumHeroBackground() {
  const [feed, setFeed] = useState<number | null>(null);
  const [mode, setMode] = useState(0);
  const [systemReduced, setSystemReduced] = useState(true);
  const [requestedMotion, setRequestedMotion] = useState<Motion>('full');
  const [failed, setFailed] = useState(false);
  const [scroll, setScroll] = useState({ percent: 0, section: 'HERO', chapter: 'top' });
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const posterRef = useRef<HTMLImageElement>(null);
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
        percent: Math.round(progress.current * 100), section: current?.section ?? 'HERO',
        chapter: current?.chapter ?? 'top',
      };
      setScroll(previous => previous.percent === next.percent && previous.section === next.section ? previous : next);
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
    const root = rootRef.current, canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!root || !canvas || !context || feed === null) return;
    const ctx = context, element = canvas, container = root;
    const reduced = motion === 'reduced', off = motion === 'off';
    container.dataset.lock = '';
    container.dataset.blobs = '0';
    container.dataset.keypoints = '0';
    if (readoutRef.current) readoutRef.current.textContent = 'VISUAL SIMULATION / NO MODEL INFERENCE';
    const video = videoRef.current;
    const poster = posterRef.current;
    const sampler = document.createElement('canvas');
    sampler.width = SAMPLE_WIDTH;
    sampler.height = SAMPLE_HEIGHT;
    const sampleContext = sampler.getContext('2d', { willReadFrequently: true });
    let previous: Uint8Array | undefined, previousTime = -1;
    let points: Point[] = [], targetPoints: Point[] = [];
    let tracks: { drawn: MotionBox; target: MotionBox; missed: number }[] = [];
    let width = 1, height = 1, raf = 0, frames = 0, lastDraw = 0, lastSample = -200;
    let disposed = false, samplingFailed = false, lastReadout = '', lastRecovery = -Infinity;
    let optics = motion === 'full' && !failed ? progress.current : 0;
    let zoom = 1, offset = 0;
    const pointer = { x: 0, y: 0, active: false };
    const active = () => !disposed && !document.hidden && motion === 'full' && !failed;
    // Match the same cover crop, zoom and vertical offset applied to the video.
    const project = (p: Point) => {
      const scale = Math.max(width / 16, height / 9) * zoom;
      return { x: (p.x - .5) * 16 * scale + width / 2, y: (p.y - .5) * 9 * scale + height / 2 + offset };
    };
    function sample(source: HTMLVideoElement | HTMLImageElement, time?: number) {
      if (!sampleContext || samplingFailed || (time !== undefined && time === previousTime)) return;
      try {
        sampleContext.drawImage(source, 0, 0, SAMPLE_WIDTH, SAMPLE_HEIGHT);
        const pixels = sampleContext.getImageData(0, 0, SAMPLE_WIDTH, SAMPLE_HEIGHT).data;
        const luma = new Uint8Array(SAMPLE_WIDTH * SAMPLE_HEIGHT);
        for (let i = 0; i < luma.length; i++) luma[i] = (pixels[i * 4] * 3 + pixels[i * 4 + 1] * 6 + pixels[i * 4 + 2]) / 10;
        const continuous = time !== undefined && time > previousTime && time - previousTime < .35;
        const analysis = inspectFrame(luma, continuous ? previous : undefined);
        targetPoints = analysis.keypoints;
        const unmatched = continuous ? new Set(tracks) : new Set<typeof tracks[number]>();
        const next = analysis.boxes.map(target => {
          let nearest: typeof tracks[number] | undefined;
          let distance = .14;
          for (const track of unmatched) {
            const old = track.target;
            const cost = Math.hypot(old.x + old.w / 2 - target.x - target.w / 2, old.y + old.h / 2 - target.y - target.h / 2)
              + (Math.abs(old.w - target.w) + Math.abs(old.h - target.h)) * .55;
            if (cost < distance) { distance = cost; nearest = track; }
          }
          if (nearest) unmatched.delete(nearest);
          return { drawn: nearest?.drawn ?? { ...target }, target, missed: 0 };
        });
        tracks = next.concat([...unmatched].filter(track => track.missed < 1).map(track => ({ ...track, missed: track.missed + 1 })));
        previous = time === undefined ? undefined : luma;
        previousTime = time ?? -1;
        container.dataset.sampling = time === undefined ? 'still-edges' : 'luminance-motion';
        container.dataset.keypoints = String(targetPoints.length);
        container.dataset.blobs = String(analysis.boxes.length);
      } catch { samplingFailed = true; container.dataset.sampling = 'unavailable'; }
    }
    const line = (a: Point, b: Point) => { ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); };
    const draw = (time: number) => {
      const smoothing = reduced ? 1 : 1 - Math.exp(-Math.min(time - lastDraw || 16, 64) / 95); lastDraw = time;
      optics = reduced || off || failed ? 0 : mix(optics, progress.current, smoothing);
      zoom = 1 + optics * .045;
      offset = -height * .016 * optics;
      container.style.setProperty('--camera-zoom', zoom.toFixed(5));
      container.style.setProperty('--camera-offset', `${offset.toFixed(2)}px`);
      ctx.clearRect(0, 0, width, height); if (off) return;
      if (active() && video && video.readyState >= 2 && time - lastSample > 62) {
        sample(video, video.currentTime);
        lastSample = time;
      }
      if (displayMode.current !== 2) {
        const origin = pointer.active ? pointer : { x: width * .73, y: height * .43 };
        ctx.globalAlpha = .14;
        ctx.strokeStyle = '#a7d8cd';
        ctx.lineWidth = .65;
        for (let col = 1; col < 12; col++) {
          const x = col * width / 12;
          line({ x: x + (origin.x - x) * .026, y: 0 }, { x, y: height });
        }
        for (let row = 1; row < 8; row++) {
          const y = row * height / 8;
          line({ x: 0, y }, { x: width, y: y + (origin.y - y) * .04 });
        }
        ctx.globalAlpha = 1;
      }
      points = targetPoints.map(p => {
        const nearest = points.reduce<Point | undefined>((best, old) => !best || Math.hypot(old.x - p.x, old.y - p.y) < Math.hypot(best.x - p.x, best.y - p.y) ? old : best, undefined);
        return nearest && Math.hypot(nearest.x - p.x, nearest.y - p.y) < .15
          ? { x: mix(nearest.x, p.x, smoothing), y: mix(nearest.y, p.y, smoothing) } : p;
      });
      const targets: Point[] = []; let lock = '';
      ctx.font = `${width < 600 ? 8 : 10}px monospace`;
      if (displayMode.current !== 2) tracks.forEach(({ drawn, target, missed }, i) => {
        for (const key of ['x', 'y', 'w', 'h'] as const) drawn[key] = mix(drawn[key], target[key], .62);
        const a = project(drawn);
        const b = project({ x: drawn.x + drawn.w, y: drawn.y + drawn.h });
        if (b.x < 0 || a.x > width || b.y < 0 || a.y > height) return;
        targets.push({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
        const near = pointer.active && pointer.x > a.x - 30 && pointer.x < b.x + 30 && pointer.y > a.y - 30 && pointer.y < b.y + 30;
        if (near) lock = 'MOTION CLUSTER';
        ctx.strokeStyle = COLORS[i % COLORS.length]; ctx.lineWidth = near ? 1.7 : .8;
        ctx.globalAlpha = missed ? .26 : near ? .95 : .68; ctx.strokeRect(a.x, a.y, b.x - a.x, b.y - a.y);
        const label = `MOTION CLUSTER: ${target.score}% / SIM`, labelWidth = ctx.measureText(label).width + 12;
        const labelX = Math.max(6, Math.min(width - labelWidth - 6, a.x)), labelY = Math.max(20, Math.min(height - 12, a.y));
        ctx.fillStyle = '#091616d9'; ctx.fillRect(labelX, labelY - 17, labelWidth, 17);
        ctx.strokeRect(labelX, labelY - 17, labelWidth, 17);
        ctx.fillStyle = COLORS[i % COLORS.length]; ctx.fillText(label, labelX + 6, labelY - 5);
      });
      ctx.globalAlpha = .65;
      if (displayMode.current !== 1) {
        const visiblePoints = points.map(project).filter(p => p.x > 8 && p.x < width - 8 && p.y > 8 && p.y < height - 8);
        targets.push(...visiblePoints); ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = .6;
        visiblePoints.forEach((p, i) => {
          ctx.fillStyle = '#d8faed'; ctx.fillRect(p.x - 1, p.y - 1, 2, 2);
          if (i < 4) {
            const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 13);
            glow.addColorStop(0, '#edfff3a8');
            glow.addColorStop(1, '#83cfb800');
            ctx.fillStyle = glow;
            ctx.fillRect(p.x - 13, p.y - 13, 26, 26);
          }
          if (i % 5 === 0) { ctx.strokeStyle = '#f97366'; ctx.beginPath(); ctx.arc(p.x, p.y, 7, 0, Math.PI * 2); ctx.stroke(); }
          if (i < 8 && visiblePoints[i + 1]) { ctx.strokeStyle = '#38bdf8'; line(p, visiblePoints[i + 1]); }
        });
        ctx.fillStyle = '#9ad9eb';
        ['Multiple View Geometry / SIM', 'Feature Edge / SIM', 'Risk Boundary / SIM'].forEach((label, i) => {
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
      const readout = `${lock ? `SIM LOCK / ${lock} · ` : ''}MOTION: ${container.dataset.blobs} · EDGES: ${targetPoints.length} · NO MODEL INFERENCE`;
      if (lastReadout !== readout) {
        lastReadout = readout;
        container.dataset.lock = lock;
        if (readoutRef.current) readoutRef.current.textContent = readout;
      }
      container.dataset.frames = String(++frames);
    };
    const tick = (time: number) => { raf = 0; if (!active()) return; if (time - lastDraw >= 15) draw(time); raf = requestAnimationFrame(tick); };
    const play = () => {
      if (video) void video.play().catch(error => {
        // Switching feeds or hiding the document can abort an earlier play normally.
        if (active() && error?.name !== 'AbortError') setFailed(true);
      });
    };
    const recoverPause = () => {
      if (!active() || !video?.paused) return;
      const now = performance.now();
      if (now - lastRecovery < 1000) setFailed(true);
      else { lastRecovery = now; play(); }
    };
    const syncPlayback = () => {
      cancelAnimationFrame(raf); raf = 0;
      if (active()) {
        play();
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
    function loadStill() {
      if (motion !== 'full' || failed) {
        if (poster?.complete && poster.naturalWidth) sample(poster);
        draw(performance.now());
      }
    }
    poster?.addEventListener('load', loadStill);
    video?.addEventListener('pause', recoverPause);
    loadStill();
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
      poster?.removeEventListener('load', loadStill);
      video?.removeEventListener('pause', recoverPause);
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
        {selected && <img ref={posterRef} className="surveillance-poster" src={`/surveillance/${selected.file}.jpg`} alt=""/>}
        <video ref={videoRef} src={selected && motion === 'full' ? `/surveillance/${selected.file}.mp4` : undefined}
          hidden={motion !== 'full' || failed} muted loop playsInline preload="metadata" onError={() => { if (motion === 'full') setFailed(true); }}/>
        <div className="surveillance-shade"/><canvas ref={canvasRef}/><div className="surveillance-scanlines"/>
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
