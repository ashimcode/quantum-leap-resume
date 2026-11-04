'use client';

import { useState, useRef, useEffect } from 'react';
import { ArrowUpRight, Send, ShieldCheck, RotateCcw } from 'lucide-react';
import { verifiedSources as data } from '@/data/verifiedSources';
import { completedHistory, type ConversationTurn } from '@/lib/conversation';
type Message = ConversationTurn;

export default function VirtualAmbassador() {
  const [messages,setMessages]=useState<Message[]>([]),[input,setInput]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
  const lock=useRef(false);
  const chatBody=useRef<HTMLDivElement>(null);
  useEffect(()=>{const body=chatBody.current;if(body)body.scrollTop=body.scrollHeight;},[messages,busy,error]);
  async function ask(question:string) {
    if(lock.current || !question.trim())return;
    lock.current=true;setBusy(true);setError('');setInput('');setMessages(m=>[...m,{role:'user',text:question}]);
    try {
      const r=await fetch('/api/ambassador',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:question,history:completedHistory(messages)})});
      if(!r.ok){setError(r.status===429?'Please wait a minute before asking again.':'The request could not be completed. Please try again.');return;}
      const result=await r.json();setMessages(m=>[...m,{role:'assistant',text:result.answer}]);
    } catch {setError('Connection interrupted. Please try again.');}
    finally {lock.current=false;setBusy(false);}
  }
  function content(text:string) {
    return text.split(/(\[[^\]]+\]\(#[a-z-]+\))/g).map((part,i)=>{
      const match=part.match(/^\[([^\]]+)\]\((#[a-z-]+)\)$/);
      return match?<a key={i} className="answer-link" href={match[2]}>{match[1]} <ArrowUpRight size={13}/></a>:<span key={i}>{part}</span>;
    });
  }
  return <section id="ambassador" className="ambassador section-target" data-scene aria-labelledby="ambassador-heading">
    <div className="ambassador-intro"><span className="pill">04 // ASKED BEFORE HIRING</span><h2 id="ambassador-heading">Ask the<br/><em>evidence directly.</em></h2><p>Explore my experience, projects, and education through answers grounded in approved sources.</p><div className="privacy-note"><ShieldCheck size={17}/><span>Source-backed answers. Honest boundaries.<br/>Chat stays in this tab; the app does not save it.</span></div><a className="text-link" href="#sources">Review the source notes <ArrowUpRight size={16}/></a></div>
    <div className="constellation-frame"><svg className="constellation-lines" viewBox="0 0 600 600" preserveAspectRatio="none" aria-hidden="true"><path d="M25 120 180 35 340 110 520 30 570 220 520 480 360 550 125 505 25 120 M180 35 125 505 M340 110 360 550 M25 120 520 480"/>{[[25,120],[180,35],[340,110],[520,30],[570,220],[520,480],[360,550],[125,505]].map(([x,y])=><circle cx={x} cy={y} r="2.5" key={`${x}-${y}`}/>)}</svg>
      <div className="chat-panel"><div className="chat-top"><div><span className="status-dot"/> ASHIM’S AMBASSADOR</div><button className="icon-button" aria-label="Clear conversation" disabled={busy} onClick={()=>{setMessages([]);setError('');}}><RotateCcw size={16}/></button></div>
        <div className="chat-body" ref={chatBody}><div className="assistant-welcome"><span className="avatar">AJ</span><div><strong>What would you like to know?</strong><p>Start with a question below, or ask your own. If a source doesn’t support an answer, I’ll say so.</p></div></div>
          {messages.length===0?<div className="starter-list">{data.starterQuestions.map((q,i)=><button disabled={busy} onClick={()=>ask(q)} key={q}><span>0{i+1}</span>{q}<ArrowUpRight size={16}/></button>)}</div>:<div className="messages" role="log" aria-label="Conversation" aria-live="polite">{messages.map((m,i)=><div key={i} className={`message ${m.role}`}><span className="message-label">{m.role==='user'?'YOU':'AMBASSADOR'}</span><p>{content(m.text)}</p></div>)}</div>}
          <div role="status" className="chat-status">{busy?'Checking approved sources…':error}</div>
        </div>
        <form onSubmit={e=>{e.preventDefault();ask(input);}}><label className="sr-only" htmlFor="question">Ask about Ashim’s verified experience</label><input id="question" value={input} maxLength={500} onChange={e=>setInput(e.target.value)} placeholder="Ask about my experience…" disabled={busy}/><button aria-label="Send question" disabled={busy||!input.trim()}><Send size={18}/></button></form><p className="chat-footnote">Approved sources only · {input.length}/500 characters · No application chat storage</p>
      </div>
    </div>
  </section>;
}
