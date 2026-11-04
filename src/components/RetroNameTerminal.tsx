'use client';

import { useEffect, useRef, useState } from 'react';

export default function RetroNameTerminal() {
  const frame = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);
  const [failed, setFailed] = useState(false);
  const [tuned, setTuned] = useState(false);
  useEffect(() => {
    const terminal = frame.current;
    if (!terminal) return;
    let visible = false, animation = 0;
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const site = document.querySelector('.site');
    const reduced = () => preference.matches || site?.getAttribute('data-motion') === 'reduced';
    const sync = () => {
      terminal.dataset.reduced = String(reduced());
      if (!visible || paused || reduced() || document.hidden) video.current?.pause();
      else void video.current?.play().catch(() => {});
      if (reduced()) {
        terminal.style.setProperty('--crt-heat','0');
        terminal.style.setProperty('--crt-rx','0deg');
        terminal.style.setProperty('--crt-ry','0deg');
      }
    };
    const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
    intersection.observe(terminal);
    const mutation = new MutationObserver(sync);
    if (site) mutation.observe(site,{attributes:true,attributeFilter:['data-motion']});
    const move = (event: PointerEvent) => {
      if (!visible || reduced() || event.pointerType !== 'mouse') return;
      cancelAnimationFrame(animation);
      animation = requestAnimationFrame(() => {
        const r = terminal.getBoundingClientRect();
        const dx = event.clientX-(r.left+r.width/2), dy = event.clientY-(r.top+r.height/2);
        const distance = Math.hypot(Math.max(0,Math.abs(dx)-r.width/2),Math.max(0,Math.abs(dy)-r.height/2));
        const heat = Math.max(0,1-distance/180);
        terminal.style.setProperty('--crt-heat',String(heat));
        terminal.style.setProperty('--crt-rx',`${Math.max(-3,Math.min(3,-dy/r.height*6))*heat}deg`);
        terminal.style.setProperty('--crt-ry',`${Math.max(-4,Math.min(4,dx/r.width*8))*heat}deg`);
      });
    };
    const leave = () => {
      terminal.style.setProperty('--crt-heat','0');
      terminal.style.setProperty('--crt-rx','0deg');
      terminal.style.setProperty('--crt-ry','0deg');
    };
    window.addEventListener('pointermove',move,{passive:true});
    document.documentElement.addEventListener('pointerleave',leave);
    document.addEventListener('visibilitychange',sync);
    preference.addEventListener('change',sync);
    sync();
    return () => { cancelAnimationFrame(animation);intersection.disconnect();mutation.disconnect();window.removeEventListener('pointermove',move);document.documentElement.removeEventListener('pointerleave',leave);document.removeEventListener('visibilitychange',sync);preference.removeEventListener('change',sync); };
  },[paused, failed]);
  return <section className="name-terminal-section" aria-labelledby="terminal-name-heading">
    <div className="terminal-caption"><span>END OF TRANSMISSION</span><span>PERSONAL SIGNAL / 01</span></div>
    <div className="name-terminal" ref={frame} data-tuned={tuned}>
      <div className="terminal-top"><span><i/> AJ-01 / PERSONAL TERMINAL</span><span>COLOR · CRT</span></div>
      <div className="terminal-housing"><div className="terminal-screen">
        <h2 id="terminal-name-heading" className="sr-only">Ashim John</h2>
        <div className="terminal-fallback" aria-hidden="true">ASHIM JOHN<span>QUANTUM LEAP // PERSONAL SIGNAL</span></div>
        {!failed && <video ref={video} src="/name-signal.mp4" poster="/name-signal-poster.jpg" muted loop playsInline preload="metadata" aria-hidden="true" onError={()=>setFailed(true)}/>}
        <div className="terminal-rgb" aria-hidden="true">ASHIM JOHN</div><div className="terminal-static" aria-hidden="true"/><div className="terminal-tracking" aria-hidden="true"/><div className="terminal-glass" aria-hidden="true"/>
        <span className="terminal-osd" aria-hidden="true">AV 1 <span>●</span></span>
      </div><div className="terminal-controls"><span>AJ.</span><button aria-label={paused?'Play name animation':'Pause name animation'} aria-pressed={paused} onClick={()=>setPaused(!paused)}>{paused?'▶':'Ⅱ'}</button><button className="tune-knob" aria-label="Retune terminal signal" onClick={()=>setTuned(!tuned)}>◉</button><div className="speaker-grille" aria-hidden="true"/><span className="power-led" aria-hidden="true"/></div></div>
      <div className="terminal-chin"><span>ASHIM JOHN / QUANTUM LEAP</span><span>EST. IN THE EVIDENCE</span></div>
    </div>
    <p className="terminal-hint">Move closer to tune the signal. <a href="#top">Return to the surface ↗</a></p>
  </section>;
}
