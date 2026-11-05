'use client';

import { useEffect, useRef, useState } from 'react';

const SAVE_KEY = 'ql_carmechanicos_save_v1';
const slots = ['mechanic_tycoon_save', 'mechanicOS_icons'];
type Saves = Record<string, string>;

/** Opaque iframe owns game timers/DOM; parent exposes only one save envelope. */
export default function CarMechanicEasterEgg({ onExit }: { onExit: () => void }) {
 const frame=useRef<HTMLIFrameElement>(null);
 const [documentText,setDocumentText]=useState('');
 const [ready,setReady]=useState(false);
 const [error,setError]=useState('');
 const [volatile,setVolatile]=useState(false);
 const [retry,setRetry]=useState(0);
 useEffect(()=>{
  const controller=new AbortController();
  const session=crypto.randomUUID();
  let saves:Saves={};
  const persist=()=>{try{if(Object.keys(saves).length)localStorage.setItem(SAVE_KEY,JSON.stringify(saves));else localStorage.removeItem(SAVE_KEY);}catch{setVolatile(true);}};
  try{const stored=JSON.parse(localStorage.getItem(SAVE_KEY)||'{}');if(stored&&typeof stored==='object')for(const key of slots){if(typeof stored[key]==='string'&&stored[key].length<=2_000_000)saves[key]=stored[key];}}catch{setVolatile(true);}
  const receive=(event:MessageEvent)=>{
   if(event.source!==frame.current?.contentWindow||event.origin!=='null'||!event.data||event.data.channel!=='ql-garage'||event.data.session!==session)return;
   const data=event.data;
   if(data.type==='ready'){setReady(true);return;}
   if(data.type==='exit'){onExit();return;}
   if(data.type==='reset'){saves={};persist();setRetry(n=>n+1);return;}
   if(data.type!=='save'||!slots.includes(data.key)||(data.value!==null&&(typeof data.value!=='string'||data.value.length>2_000_000)))return;
   if(data.value===null)delete saves[data.key];else saves[data.key]=data.value;
   persist();
  };
  window.addEventListener('message',receive);
  setReady(false);setError('');setDocumentText('');
  const read=async(file:string)=>{const r=await fetch(`/carmechanicos/${file}`,{signal:controller.signal});if(!r.ok)throw Error(`Asset unavailable (${r.status})`);return r.text();};
  void Promise.all([read('index.html'),read('style.css'),read('game.js'),read('vendor/chart.umd.min.js'),fetch('/carmechanicos/assets/world-map.png',{signal:controller.signal}).then(async r=>{if(!r.ok)throw Error('Map unavailable');const bytes=new Uint8Array(await r.arrayBuffer());let binary='';for(const byte of bytes)binary+=String.fromCharCode(byte);return `data:image/png;base64,${btoa(binary)}`;})]).then(([html,css,game,chart,map])=>{
   if(controller.signal.aborted)return;
   const seed=JSON.stringify(saves).replace(/</g,'\\u003c');
   const bridge=`(()=>{const session=${JSON.stringify(session)},slots=${seed},send=(type,extra={})=>parent.postMessage({channel:'ql-garage',session,type,...extra},'*');window.CRTGameStorage={getItem:k=>slots[k]??null,setItem(k,v){slots[k]=String(v);send('save',{key:k,value:String(v)})},removeItem(k){delete slots[k];send('save',{key:k,value:null})},clear(){for(const k of Object.keys(slots))this.removeItem(k)}};window.CRTGameReset=()=>send('reset');document.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();send('exit')}});window.addEventListener('load',()=>send('ready'));document.addEventListener('pointerup',e=>{if(e.pointerType==='touch'){const icon=e.target.closest('.desktop-icon');if(icon)icon.dispatchEvent(new MouseEvent('dblclick',{bubbles:true}))}})})();`;
   const script=(source:string)=>`<script>${source.replace(/<\/script/gi,'<\\/script')}</script>`;
   const csp=`<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; font-src data:; connect-src 'none'; base-uri 'none'; form-action 'none'">`;
   const safeGame=game.replace(/\blocalStorage\b/g,'window.CRTGameStorage').replace(/(?:window\.)?location\.reload\(\)/g,'window.CRTGameReset()');
   const body=html.replace(/<link\b[^>]*>/gi,'').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/https:\/\/images\.unsplash\.com\/[^'"\s)]+/g,map).replace('<head>',`<head>${csp}`).replace('</head>',`<style>${css.replace(/url\(['"]?\.\/assets\/world-map\.png['"]?\)/g,`url('${map}')`)}\nhtml,body{min-width:0}body{font-family:system-ui,sans-serif}@media(max-width:768px){.desktop-shortcuts{display:flex;flex-wrap:wrap;align-content:flex-start;gap:8px;padding:14px;width:100%;height:calc(100% - 50px);overflow:auto}.desktop-icon{position:static!important;flex:0 0 76px}.desktop-icon-label{max-width:76px;overflow-wrap:anywhere;white-space:normal}.window{min-width:0!important}.window-content{overflow:auto}#taskbar .start-btn{display:block;font-size:9px}}</style>${script(bridge)}</head>`).replace('</body>',`${script(chart)}${script(safeGame)}</body>`);
   setDocumentText(body);
  }).catch(e=>{if(!controller.signal.aborted)setError(e instanceof Error?e.message:'Unable to load game');});
  return()=>{controller.abort();window.removeEventListener('message',receive);};
 },[onExit,retry]);
 return <div className="aj-game-host">
  {!ready&&<div className="aj-game-status" role="status">{error||'BOOTING CARMECHANICOS...'}{error&&<button onClick={()=>setRetry(n=>n+1)}>Retry boot</button>}</div>}
  {volatile&&<div className="aj-save-warning" role="status">Storage unavailable. Progress is limited to this session.</div>}
  {documentText&&<iframe ref={frame} title="CarMechanicOS hidden garage game" sandbox="allow-scripts allow-modals" srcDoc={documentText}/>}
 </div>;
}
