'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

const CarMechanicCLI=dynamic(()=>import('./CarMechanicCLI'),{ssr:false,loading:()=> <div className="aj-game-status" role="status">OPENING TERMINAL...</div>});
const CarMechanicEasterEgg=dynamic(()=>import('./CarMechanicEasterEgg'),{ssr:false,loading:()=> <div className="aj-game-status" role="status">BOOTING GARAGE...</div>});
const SAVE_KEY='ql_carmechanicos_save_v1';

export default function RetroNameTerminal() {
  const frame = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);
  const [failed, setFailed] = useState(false);
  const [tuned, setTuned] = useState(false);
  const [mode,setMode]=useState<'idle'|'cli'|'game'>('idle');
  const [expanded,setExpanded]=useState(false);
  const [gameSession,setGameSession]=useState(0);
  const previousMode=useRef(mode);
  const dialog=useRef<HTMLDialogElement>(null);
  const monitorSlot=useRef<HTMLDivElement>(null);
  const activator=useRef<HTMLButtonElement>(null);
  const cliControl=useRef<HTMLButtonElement>(null);
  const expandControl=useRef<HTMLButtonElement>(null);
  const savedPosition=useRef({x:0,y:0});
  const collapse=useCallback(()=>{
    const monitor=dialog.current;
    if(monitor?.matches(':modal')){monitor.close();monitor.show();}
    if(monitorSlot.current)monitorSlot.current.style.height='';
    setExpanded(false);
    window.scrollTo({left:savedPosition.current.x,top:savedPosition.current.y,behavior:'instant'});
  },[]);
  const exitGame=useCallback(()=>{if(dialog.current?.matches(':modal'))collapse();setMode('cli');},[collapse]);
  const exitCLI=()=>{if(dialog.current?.matches(':modal'))collapse();setMode('idle');};
  const toggleExpand=()=>{
    const monitor=dialog.current;if(!monitor)return;
    if(monitor.matches(':modal')){collapse();expandControl.current?.focus({preventScroll:true});return;}
    savedPosition.current={x:scrollX,y:scrollY};
    if(monitorSlot.current)monitorSlot.current.style.height=`${monitor.offsetHeight}px`;
    monitor.close();monitor.showModal();
    window.scrollTo({left:savedPosition.current.x,top:savedPosition.current.y,behavior:'instant'});setExpanded(true);
  };
  const resetSave=()=>{if(!window.confirm('Reset only this CarMechanicOS garage save?'))return false;try{localStorage.removeItem(SAVE_KEY);setGameSession(n=>n+1);return true;}catch{return false;}};
  useEffect(()=>{if(previousMode.current===mode)return;previousMode.current=mode;if(mode==='idle')activator.current?.focus({preventScroll:true});else if(mode==='game')cliControl.current?.focus({preventScroll:true});},[mode]);
  useEffect(() => {
    const terminal = frame.current;
    if (!terminal) return;
    let visible = false, animation = 0;
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const site = document.querySelector('.site');
    const reduced = () => preference.matches || site?.getAttribute('data-motion') === 'reduced';
    const sync = () => {
      terminal.dataset.reduced = String(reduced());
      if (!visible || paused || mode!=='idle' || reduced() || document.hidden) video.current?.pause();
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
      if (!visible || reduced() || mode!=='idle' || event.pointerType !== 'mouse') return;
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
  },[paused, failed, mode]);
  return <section className="name-terminal-section" aria-labelledby="terminal-name-heading">
    <div className="terminal-caption"><span>END OF TRANSMISSION</span><span>PERSONAL SIGNAL / 01</span></div>
    <div className="aj-monitor-slot" ref={monitorSlot}><dialog open ref={dialog} className="aj-monitor-shell" aria-label="AJ-01 personal terminal" onCancel={event=>{event.preventDefault();if(mode==='game')exitGame();else{collapse();cliControl.current?.focus({preventScroll:true});}}}>
    <div className="name-terminal" ref={frame} data-tuned={tuned} data-mode={mode}>
      <div className="terminal-top"><span><i/> AJ-01 / PERSONAL TERMINAL</span><span>COLOR · CRT</span></div>
      <div className="terminal-housing"><div className="terminal-screen">
        <h2 id="terminal-name-heading" className="sr-only">Ashim John</h2>
        <div className="terminal-fallback" aria-hidden="true">ASHIM JOHN<span>QUANTUM LEAP // PERSONAL SIGNAL</span></div>
        {!failed && <video ref={video} src="/name-signal.mp4" poster="/name-signal-poster.jpg" muted loop playsInline preload="metadata" aria-hidden="true" onError={()=>setFailed(true)}/>}
        <div className="terminal-rgb" aria-hidden="true">ASHIM JOHN</div><div className="terminal-static" aria-hidden="true"/><div className="terminal-tracking" aria-hidden="true"/><div className="terminal-glass" aria-hidden="true"/>
        <span className="terminal-osd" aria-hidden="true">AV 1 <span>●</span></span>
        {mode==='idle'&&<button className="aj-screen-activate" ref={activator} aria-label="Open virtual command terminal" onClick={()=>setMode('cli')}/>}
        {mode!=='idle'&&<div hidden={mode!=='cli'} className="aj-cli-container"><CarMechanicCLI active={mode==='cli'} onPlay={()=>setMode('game')} onExit={exitCLI} onReset={resetSave}/></div>}
        {mode==='game'&&<CarMechanicEasterEgg key={gameSession} onExit={exitGame}/>}
      </div><div className="terminal-controls"><span>AJ.</span><button aria-label={paused?'Play name animation':'Pause name animation'} aria-pressed={paused} onClick={()=>setPaused(!paused)}>{paused?'▶':'Ⅱ'}</button><button className="tune-knob" aria-label="Retune terminal signal" onClick={()=>setTuned(!tuned)}>◉</button><div className="aj-bezel-extras"><button className="aj-bezel-action" ref={cliControl} aria-label={mode==='idle'?'Open CLI':mode==='game'?'Exit game':'Exit CLI'} onClick={()=>mode==='idle'?setMode('cli'):mode==='game'?exitGame():exitCLI()}>{mode==='idle'?'>_ CLI':mode==='game'?'ESC / EXIT GAME':'EXIT CLI'}</button><button className="aj-bezel-action" ref={expandControl} aria-label={expanded?'Collapse monitor':'Expand monitor'} onClick={toggleExpand}>{expanded?'COLLAPSE':'EXPAND'}</button>{mode!=='idle'&&<button className="aj-bezel-action" aria-label="Reset game save" onClick={resetSave}>RESET SAVE</button>}</div><div className="speaker-grille" aria-hidden="true"/><span className="power-led" aria-hidden="true"/></div></div>
      <div className="terminal-chin"><span>ASHIM JOHN / QUANTUM LEAP</span><span>EST. IN THE EVIDENCE</span></div>
    </div>
    </dialog></div>
    <p className="terminal-hint">Move closer to tune the signal. <a href="#top">Return to the surface ↗</a></p>
  </section>;
}
