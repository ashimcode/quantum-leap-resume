'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Download, X } from 'lucide-react';

const chapters = [['top', 'Home'], ['role-match', 'About'], ['projects', 'Portfolio'], ['experience', 'Services'], ['ambassador', 'Contact']] as const;
const FRAME_COUNT = 120;
const clamp = (n: number, min = 0, max = 1) => Math.min(max, Math.max(min, n));
const smoothstep = (a: number, b: number, n: number) => { const t = clamp((n - a) / (b - a)); return t * t * (3 - 2 * t); };
type DecodedFrame = ImageBitmap | HTMLImageElement;
type SceneBox = { el: HTMLElement; top: number; height: number; entered: boolean };

/** Native scrolling; one render loop. Only user controls use React state. */
export default function UndergroundScrollStage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const drawerRef = useRef<HTMLDialogElement>(null);
  const motion = useRef({ targetScroll: 0, currentScroll: 0, scrollVelocity: 0, mouseX: .7, mouseY: .45, targetX: .7, targetY: .45, mouseRadius: 110 });
  const [reduced, setReduced] = useState(true);
  const [drawer, setDrawer] = useState(false);

  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(preference.matches);
    sync(); preference.addEventListener('change', sync);
    return () => preference.removeEventListener('change', sync);
  }, []);
  useEffect(() => {
    const dialog = drawerRef.current;
    if (drawer && dialog && !dialog.open) dialog.showModal();
    else if (!drawer && dialog?.open) dialog.close();
  }, [drawer]);

  useEffect(() => {
    const element = canvasRef.current;
    const context = element?.getContext('2d', { alpha: false });
    const root = document.querySelector<HTMLElement>('.site');
    if (!element || !context || !root) return;
    const canvas = element, ctx = context, site = root;
    const state = motion.current;
    state.targetScroll = state.currentScroll = window.scrollY;
    state.scrollVelocity = 0;
    site.dataset.motion = reduced ? 'reduced' : 'full';
    const film = videoRef.current;
    const frames: (DecodedFrame | undefined)[] = new Array(FRAME_COUNT);
    const nearest = new Uint8Array(FRAME_COUNT);
    const controller = new AbortController();
    let disposed = false, raf = 0, lastTime = 0, elapsed = 0;
    let width = innerWidth, height = innerHeight, extent = 1, dirty = true;
    let decoded = 0, cacheMix = 0, chapter = -1, percent = -1, failures = 0;
    let scenes: SceneBox[] = [], positions: number[] = [];
    let input: { x: number; y: number } | undefined;
    let scrim: CanvasGradient, vignette: CanvasGradient;
    const rail = [...(hudRef.current?.querySelectorAll<HTMLAnchorElement>('.chapter-links a') ?? [])];
    const crosses = [...(hudRef.current?.querySelectorAll<HTMLElement>('.hud-cross') ?? [])];
    const telemetry = hudRef.current?.querySelector<HTMLElement>('.scroll-telemetry');
    const terminal = site.querySelector<HTMLElement>('[data-terminal-scene]');
    const trails = Array.from({ length: 5 }, () => ({ x: .7, y: .45 }));
    const blendCanvas = document.createElement('canvas');
    const blendCtx = blendCanvas.getContext('2d')!;

    // Generated once. No pixel readbacks or per-frame dither rasterization.
    const tile = document.createElement('canvas'); tile.width = tile.height = 32;
    const tileCtx = tile.getContext('2d')!;
    const bayer = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
    bayer.forEach((value, i) => {
      tileCtx.fillStyle = `rgba(212,231,194,${.08 + value / 38})`;
      tileCtx.beginPath(); tileCtx.arc((i % 4) * 8 + 4, Math.floor(i / 4) * 8 + 4, .6 + value / 15, 0, Math.PI * 2); tileCtx.fill();
    });
    const pattern = ctx.createPattern(tile, 'repeat');
    const stipple = document.createElement('canvas'); stipple.width = stipple.height = 256;
    const sc = stipple.getContext('2d')!;
    sc.fillStyle = sc.createPattern(tile, 'repeat')!; sc.fillRect(0, 0, 256, 256);
    sc.globalCompositeOperation = 'destination-in';
    const fade = sc.createRadialGradient(128,128,16,128,128,128);
    fade.addColorStop(0,'#000'); fade.addColorStop(1,'transparent'); sc.fillStyle=fade; sc.fillRect(0,0,256,256);
    const rings = document.createElement('canvas'); rings.width = rings.height = 800;
    const rc = rings.getContext('2d')!;
    for (let ring=0;ring<8;ring++) {
      const radius=70+ring*39, count=90+ring*22;
      for(let dot=0;dot<count;dot++) {
        const angle=dot/count*Math.PI*2;
        rc.fillStyle=`rgba(211,226,191,${.3+(dot%4)/8})`;
        rc.fillRect(400+Math.cos(angle)*radius,400+Math.sin(angle)*radius,1.5,1.5);
      }
    }
    const schedule = () => { if (!raf && !disposed && !document.hidden) raf = requestAnimationFrame(render); };
    const syncPlayback = () => {
      if (!film) return;
      if (reduced || document.hidden || cacheMix > .995) film.pause();
      else void film.play().catch(() => { /* Poster and procedural stage remain usable. */ });
    };
    const measure = () => {
      dirty = false;
      extent = Math.max(1, document.documentElement.scrollHeight - height);
      positions = chapters.map(([id]) => { const el=document.getElementById(id); return el ? el.getBoundingClientRect().top+scrollY : 0; });
      scenes = [...site.querySelectorAll<HTMLElement>('[data-scene]')].map(el => { const r=el.getBoundingClientRect(); return {el,top:r.top+scrollY,height:r.height,entered:el.dataset.entered==='true'}; });
      const r=document.getElementById('question')?.getBoundingClientRect();
      input = r ? {x:r.left,y:r.top+scrollY+r.height/2} : undefined;
    };
    const resize = () => {
      width=innerWidth; height=innerHeight;
      const ratio=Math.min(devicePixelRatio||1,1.5);
      canvas.width=Math.round(width*ratio); canvas.height=Math.round(height*ratio);
      ctx.setTransform(ratio,0,0,ratio,0,0);
      ctx.imageSmoothingEnabled=true; ctx.imageSmoothingQuality='low';
      scrim=ctx.createLinearGradient(0,0,width,0);
      scrim.addColorStop(0,'#07080af5'); scrim.addColorStop(.44,'#07080ac4'); scrim.addColorStop(1,'#07080a20');
      vignette=ctx.createRadialGradient(width*.64,height*.45,0,width*.64,height*.45,width*.8);
      vignette.addColorStop(0,'transparent'); vignette.addColorStop(1,'#0009');
      dirty=true; schedule();
    };
    const rebuildNearest = () => {
      const ready=frames.flatMap((f,i)=>f?[i]:[]);
      for(let i=0;i<FRAME_COUNT;i++) nearest[i]=ready.reduce((best,n)=>Math.abs(n-i)<Math.abs(best-i)?n:best,ready[0]??0);
    };
    const decode = async (index: number) => {
      try {
        const response=await fetch(`/underground-frames/frame-${String(index).padStart(3,'0')}.jpg`,{signal:controller.signal});
        if(!response.ok) throw new Error('Frame unavailable');
        const blob=await response.blob();
        let bitmap: DecodedFrame;
        if(typeof createImageBitmap==='function') {
          // ~95 MB mobile / ~149 MB desktop, independent of source JPEG dimensions.
          bitmap=await createImageBitmap(blob,{resizeWidth:width<700?384:480,resizeQuality:'low'});
        } else {
          const url=URL.createObjectURL(blob); const image=new Image(); image.src=url;
          try { await image.decode(); bitmap=image; } finally { URL.revokeObjectURL(url); }
        }
        if(disposed) { if('close' in bitmap)bitmap.close(); return; }
        frames[index]=bitmap; decoded++; rebuildNearest(); schedule();
        canvas.dataset.decoded=String(decoded);
      } catch { if(!disposed) {failures++; canvas.dataset.frameErrors=String(failures);} }
    };
    const load = async () => {
      await decode(0); if(disposed || reduced) return;
      const anchors=[24,48,72,96,119];
      for(const index of anchors) { if(disposed)return; await decode(index); }
      const queue=Array.from({length:FRAME_COUNT},(_,i)=>i).filter(i=>i!==0&&!anchors.includes(i));
      // Bounded workers. Never decode or fetch inside the rendering callback.
      await Promise.all(Array.from({length:3},async()=>{while(queue.length&&!disposed){await decode(queue.shift()!);}}));
    };
    const star = (x:number,y:number,r:number) => {
      ctx.beginPath();ctx.moveTo(x-r,y);ctx.lineTo(x-1,y-1);ctx.lineTo(x,y-r);ctx.lineTo(x+1,y-1);ctx.lineTo(x+r,y);ctx.lineTo(x+1,y+1);ctx.lineTo(x,y+r);ctx.lineTo(x-1,y+1);ctx.closePath();ctx.fill();
    };
    const drawSource = (source: CanvasImageSource, sourceWidth:number, sourceHeight:number, alpha:number, zoom:number, pan:number) => {
      const areaWidth=width<700?width:width*.63;
      const scale=Math.max(areaWidth/sourceWidth,height/sourceHeight)*zoom;
      const fw=sourceWidth*scale,fh=sourceHeight*scale;
      const x=width*(width<700?.5:.76)-fw/2+(state.mouseX-.5)*16;
      ctx.globalAlpha=alpha;ctx.drawImage(source,x,height/2-fh/2+pan,fw,fh);
    };
    function render(time:number) {
      raf=0;
      if(disposed||document.hidden)return;
      const delta=Math.min(50,lastTime?time-lastTime:16.667);lastTime=time;
      const damping=1-Math.pow(.92,delta/16.667);
      const previous=state.currentScroll;
      state.currentScroll=reduced?state.targetScroll:state.currentScroll+(state.targetScroll-state.currentScroll)*damping;
      if(Math.abs(state.targetScroll-state.currentScroll)<.05)state.currentScroll=state.targetScroll;
      state.scrollVelocity+=(Math.abs(state.currentScroll-previous)/Math.max(delta,1)-state.scrollVelocity)*damping;
      state.mouseX+=(state.targetX-state.mouseX)*damping;state.mouseY+=(state.targetY-state.mouseY)*damping;
      const speed=reduced?0:clamp(state.scrollVelocity/2.8);
      state.mouseRadius+=(110+speed*65-state.mouseRadius)*damping;
      if(!reduced)elapsed+=delta/1000;
      if(dirty)measure();
      const p=clamp(state.currentScroll/extent);
      const a=smoothstep(.18,.45,p),b=smoothstep(.40,.70,p),c=smoothstep(.65,.88,p),end=smoothstep(.85,1,p);
      const zoom=1+.18*smoothstep(0,.22,p)-.11*b-.12*c+.17*end;
      const pan=-height*.10*b+height*.07*c;
      const filmOpacity=.66-.28*a+.16*b-.34*c;
      const percentValue=Math.round(p*100);
      if(percentValue!==percent) {percent=percentValue;if(progressRef.current)progressRef.current.textContent=`${String(percent).padStart(3,'0')}%`;}
      let active=0; positions.forEach((position,i)=>{if(state.currentScroll+height*.36>=position)active=i;});
      if(active!==chapter) {chapter=active;site.dataset.chapter=String(chapter);rail.forEach((el,i)=>{if(i===chapter)el.setAttribute('aria-current','location');else el.removeAttribute('aria-current');});}
      if(telemetry)telemetry.style.transform=`translate3d(50%,${p*(height-175)}px,0)`;
      crosses.forEach((el,i)=>{el.style.transform=`translate3d(0,${reduced?0:(p-.5)*(i?22:-14)}px,0)`;});
      if(terminal)terminal.style.setProperty('--terminal-arrival',String(reduced?1:.96+.04*end));
      // Geometry is cached on resize/content changes. No read/write layout loop on scroll.
      for(const scene of scenes) {
        const top=scene.top-state.targetScroll;
        if(top>height*1.15||top+scene.height < -height*.3)continue;
        const local=clamp((height-top)/(height+scene.height));
        scene.el.style.setProperty('--local',local.toFixed(4));
        scene.el.style.setProperty('--float',`${reduced?0:(.5-local)*70}px`);
        if(!scene.entered&&top<height*.94){scene.entered=true;scene.el.dataset.entered='true';}
      }
      ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';ctx.fillStyle='#07080a';ctx.fillRect(0,0,width,height);
      const cacheReady=decoded===FRAME_COUNT;
      cacheMix+=(Number(cacheReady)-cacheMix)*damping;
      if(!reduced&&film&&film.readyState>=2&&cacheMix<.995)drawSource(film,film.videoWidth,film.videoHeight,filmOpacity*(1-cacheMix),zoom,pan);
      // Decoded images are sampled synchronously. No video seeks, fetches, or decode work here.
      if(decoded) {
        const position=reduced?0:clamp(p+Math.sin(elapsed*.55)*.003)*(FRAME_COUNT-1);
        const low=Math.floor(position),high=Math.min(FRAME_COUNT-1,low+1),blend=position-low;
        const first=frames[low]??frames[nearest[low]],second=frames[high]??frames[nearest[high]];
        const opacity=reduced?filmOpacity:filmOpacity*(cacheReady?cacheMix:(film?.readyState??0)>=2?0:1);
        if(first) {
          const w='naturalWidth' in first?first.naturalWidth:first.width,h='naturalHeight' in first?first.naturalHeight:first.height;
          if(blendCanvas.width!==w||blendCanvas.height!==h){blendCanvas.width=w;blendCanvas.height=h;}
          blendCtx.globalAlpha=1;blendCtx.drawImage(first,0,0,w,h);
          if(second&&second!==first){blendCtx.globalAlpha=blend;blendCtx.drawImage(second,0,0,w,h);}
          drawSource(blendCanvas,w,h,opacity,zoom,pan);
        }
      }
      if(cacheReady&&cacheMix>.995&&film&&!film.paused)film.pause();
      ctx.globalAlpha=1;ctx.fillStyle=scrim;ctx.fillRect(0,0,width,height);
      const cx=width*(.69+(reduced?0:state.mouseX-.5)*.025),cy=height*(.44+(state.mouseY-.5)*.025);
      ctx.globalAlpha=(.48-.31*a)*(1-.65*end);
      const ringSize=height*(.95+.18*smoothstep(0,.22,p));
      ctx.drawImage(rings,cx-ringSize/2,cy-ringSize/2,ringSize,ringSize);
      ctx.globalAlpha=1;
      const horizon=height*(.52-.15*a+.09*b);
      ctx.lineWidth=.65;ctx.setLineDash([1,4]);
      for(const side of [-1,1])for(let row=1;row<19;row++) {
        const depth=row/19;ctx.beginPath();
        for(let col=0;col<=46;col++) {
          const x=width*col/46;
          const wave=Math.sin(col*.28+elapsed*.15+row*.25+p*7)*(5+depth*15);
          const curve=Math.pow((x-cx)/Math.max(width*.5,1),2)*(20+depth*100);
          const y=horizon+side*(40+depth*depth*height*.8+wave+curve)+pan*.25;
          if(!col)ctx.moveTo(x,y);else ctx.lineTo(x,y);
        }
        ctx.strokeStyle=`rgba(192,204,187,${(.28-.13*a)*depth*(1-.7*end)})`;ctx.stroke();
      }
      ctx.setLineDash([]);
      const gridAlpha=a*(1-c)*.13;
      if(gridAlpha>.001) {
        ctx.strokeStyle=`rgba(212,255,51,${gridAlpha})`;
        for(let n=0;n<13;n++){ctx.beginPath();ctx.moveTo(width*.63,horizon);ctx.lineTo(n/12*width,height);ctx.stroke();}
        for(let n=0;n<11;n++){const y=horizon+(height-horizon)*Math.pow(n/10,2);ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(width,y);ctx.stroke();}
      }
      if(pattern) {ctx.globalAlpha=.04+a*(1-b)*.07;ctx.globalCompositeOperation='soft-light';ctx.fillStyle=pattern;ctx.fillRect(width*.4,0,width*.6,height);ctx.globalCompositeOperation='source-over';}
      ctx.globalAlpha=1;
      if(!reduced) {
        let tx=state.mouseX,ty=state.mouseY;
        for(let i=0;i<trails.length;i++) {
          const trail=trails[i];trail.x+=(tx-trail.x)*damping*.7;trail.y+=(ty-trail.y)*damping*.7;tx=trail.x;ty=trail.y;
          const size=state.mouseRadius*(2+i*.13);ctx.globalAlpha=(.24+speed*.12)/(i+1);
          ctx.drawImage(stipple,trail.x*width-size/2,trail.y*height-size/2,size,size);
        }
        ctx.globalAlpha=1;
      }
      if(c>.001) {
        ctx.globalAlpha=c*(1-.6*end);ctx.strokeStyle='rgba(212,255,51,.25)';ctx.fillStyle='#d4ff33';
        const points=[[.37,.18],[.55,.3],[.72,.12],[.87,.4],[.55,.61],[.32,.77],[.81,.79]];
        points.forEach((point,i)=>{const q=points[(i+1)%points.length],x=point[0]*width,y=point[1]*height;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(q[0]*width,q[1]*height);ctx.stroke();star(x,y,4);});
        const iy=input?input.y-state.targetScroll:-1;
        if(input&&iy>0&&iy<height){ctx.beginPath();ctx.moveTo(width*.55,height*.61);ctx.lineTo(input.x-18,iy);ctx.lineTo(input.x,iy);ctx.stroke();star(input.x-18,iy,5);}
        ctx.globalAlpha=1;
      }
      if(speed>.005) {
        const y=height*((elapsed*.17+p*.4)%1);ctx.fillStyle=`rgba(255,30,39,${speed*.12})`;ctx.fillRect(0,y,width,1+speed*3);
        ctx.fillStyle=`rgba(50,210,222,${speed*.05})`;ctx.fillRect(2,y+3,width,1);
      }
      ctx.fillStyle=vignette;ctx.fillRect(0,0,width,height);
      canvas.dataset.pipeline=cacheReady?'frames':decoded?'loading':'fallback';
      if(!reduced)schedule();
    }
    const scroll=()=>{state.targetScroll=window.scrollY;schedule();};
    const pointer=(event:PointerEvent)=>{if(event.pointerType==='mouse'&&!reduced){state.targetX=event.clientX/width;state.targetY=event.clientY/height;}};
    const visibility=()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;}else{lastTime=0;schedule();}syncPlayback();};
    const observer=new ResizeObserver(()=>{dirty=true;schedule();});observer.observe(site);
    resize();void load();syncPlayback();
    window.addEventListener('scroll',scroll,{passive:true});window.addEventListener('resize',resize);window.addEventListener('pointermove',pointer,{passive:true});
    document.addEventListener('visibilitychange',visibility);film?.addEventListener('loadeddata',syncPlayback);
    return()=>{
      disposed=true;controller.abort();cancelAnimationFrame(raf);observer.disconnect();film?.pause();
      frames.forEach(bitmap=>{if(bitmap&&'close' in bitmap)bitmap.close();});
      window.removeEventListener('scroll',scroll);window.removeEventListener('resize',resize);window.removeEventListener('pointermove',pointer);
      document.removeEventListener('visibilitychange',visibility);film?.removeEventListener('loadeddata',syncPlayback);
    };
  },[reduced]);

  return <>
    <div className="underground-stage" aria-hidden="true"><canvas ref={canvasRef}/><video ref={videoRef} src={reduced?undefined:'/underground-reel.mp4'} poster="/underground-frames/frame-000.jpg" muted loop playsInline preload="metadata"/><div className="stage-scanlines"/><div className="stage-grain"/></div>
    <div className="blueprint-hud" ref={hudRef}>
      <div className="hud-rail"><a href="#top" className="monogram" aria-label="Ashim John home">aj<span>.</span></a><button className="index-toggle" aria-label="Open chapter index" aria-expanded={drawer} aria-controls="chapter-index" onClick={()=>setDrawer(true)}>::</button><div className="ruler" aria-hidden="true"/><nav className="chapter-links" aria-label="Page chapters">{chapters.map(([id,label],i)=><a href={`#${id}`} aria-label={label} key={id}><span>0{i+1}</span><span className="chapter-label">{label}</span></a>)}</nav><span className="rail-coordinate" aria-hidden="true">40° / FIELD NOTES</span></div>
      <div className="hud-top"><a className="hud-brand" href="#top">QUANTUM LEAP <span>/ ASHIM JOHN</span></a><div className="hud-actions"><button className="fx-toggle" aria-pressed={!reduced} onClick={()=>setReduced(value=>!value)}>FX: <span>{reduced?'REDUCED':'FULL'}</span></button><a className="hud-resume" href="/resume-public.pdf" download>RESUME <Download size={12}/></a><a className="hud-connect" href="#ambassador">CONNECT <ArrowUpRight size={13}/></a></div></div>
      <span className="hud-line hud-line-a" aria-hidden="true"/><span className="hud-line hud-line-b" aria-hidden="true"/><span className="hud-cross cross-one" aria-hidden="true">✦</span><span className="hud-cross cross-two" aria-hidden="true">✦</span><div className="scroll-telemetry" aria-label="Scroll progress"><span ref={progressRef}>000%</span><span aria-hidden="true">+</span></div>
    </div>
    <dialog id="chapter-index" className="chapter-drawer" ref={drawerRef} onCancel={()=>setDrawer(false)} onClose={()=>setDrawer(false)} onClick={event=>{if(event.target===event.currentTarget)setDrawer(false);}} aria-labelledby="index-heading"><div className="drawer-inner"><div className="drawer-top"><span id="index-heading">QUANTUM LEAP / CHAPTER INDEX</span><button aria-label="Close chapter index" onClick={()=>setDrawer(false)}><X size={21}/></button></div><nav aria-label="Main navigation">{[['top','Home'],['role-match','About'],['experience','Services'],['projects','Portfolio'],['ambassador','Contact']].map(([id,label],i)=><a href={`#${id}`} key={id} onClick={()=>setDrawer(false)}><span>0{i+1}</span>{label}<ArrowUpRight size={24}/></a>)}</nav><p>Security thinking. Practical evidence.</p></div></dialog>
  </>;
}
