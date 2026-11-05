'use client';

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { ArrowUpRight, Download, X } from 'lucide-react';

const chapters = [
  ['top', 'Home'], ['role-match', 'About'], ['projects', 'Portfolio'],
  ['experience', 'Services'], ['ambassador', 'Contact'],
] as const;

type NavigationProps = {
  motion: 'full' | 'reduced' | 'off';
  cycleMotion: () => void;
  camera: string;
  chapter: string;
  percent: number;
  children: ReactNode;
};

export default function ChapterNavigation({ motion, cycleMotion, camera, chapter, percent, children }: NavigationProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const indexButton = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const cameraButton = useRef<HTMLButtonElement>(null);
  const [indexOpen, setIndexOpen] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);

  useEffect(() => {
    let frame = 0;
    function focusFragment(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href^="#"]') : null;
      const fragment = anchor?.getAttribute('href');
      const destination = fragment && document.getElementById(fragment.slice(1));
      if (!destination) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (location.hash !== fragment) return;
        if (!destination.hasAttribute('tabindex')) destination.tabIndex = -1;
        destination.focus({ preventScroll: true });
      });
    }
    document.addEventListener('click', focusFragment);
    return () => {
      document.removeEventListener('click', focusFragment);
      cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (!cameraOpen) return;
    function dismissCamera(event: globalThis.KeyboardEvent) {
      if (event.key !== 'Escape' || event.defaultPrevented || document.querySelector('dialog:modal')) return;
      event.preventDefault();
      setCameraOpen(false);
      cameraButton.current?.focus({ preventScroll: true });
    }
    window.addEventListener('keydown', dismissCamera);
    return () => window.removeEventListener('keydown', dismissCamera);
  }, [cameraOpen]);

  function openIndex() {
    dialog.current?.showModal();
    setIndexOpen(true);
    closeButton.current?.focus({ preventScroll: true });
  }

  function dismissIndex(restoreFocus = true) {
    dialog.current?.close();
    setIndexOpen(false);
    if (restoreFocus) indexButton.current?.focus({ preventScroll: true });
  }

  function keepTabInIndex(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== 'Tab') return;
    const controls = event.currentTarget.querySelectorAll<HTMLElement>('button, a[href]');
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return <>
    <div className="blueprint-hud">
      <div className="hud-rail">
        <a href="#top" className="monogram" aria-label="Ashim John home">aj<span>.</span></a>
        <button ref={indexButton} className="index-toggle" aria-label="Open chapter index" aria-haspopup="dialog" aria-expanded={indexOpen} aria-controls="chapter-index" onClick={openIndex}>::</button>
        <div className="ruler" aria-hidden="true"/>
        <nav className="chapter-links" aria-label="Page chapters">
          {chapters.map(([id, label], index) => <a href={`#${id}`} tabIndex={0} aria-label={label} aria-current={chapter === id ? 'location' : undefined} key={id}>
            <span>0{index + 1}</span><span className="chapter-label">{label}</span>
          </a>)}
        </nav>
        <span className="rail-coordinate" aria-hidden="true">40° / FIELD NOTES</span>
      </div>
      <span className="hud-line hud-line-a" aria-hidden="true"/><span className="hud-line hud-line-b" aria-hidden="true"/>
      <span className="hud-cross cross-one" aria-hidden="true">✦</span><span className="hud-cross cross-two" aria-hidden="true">✦</span>
      <div className="scroll-telemetry" aria-label={`Scroll progress ${percent}%`}><span>{String(percent).padStart(3, '0')}%</span><span aria-hidden="true">+</span></div>
    </div>
    <header className="hud-header">
      <div className="hud-top">
        <a className="hud-brand" href="#top">ASHIM JOHN</a>
        <div className="hud-actions">
          <button className="fx-toggle" onClick={cycleMotion} aria-label={`Effects ${motion}. Cycle effects`}>FX <span>{motion.toUpperCase()}</span></button>
          <a className="hud-resume" href="/resume-public.pdf" download>RESUME <Download size={12}/></a>
          <a className="hud-connect" href="#ambassador">CONNECT <ArrowUpRight size={13}/></a>
          <button ref={cameraButton} className="camera-toggle" aria-label={`Camera study controls, ${camera}`} aria-expanded={cameraOpen} aria-controls="camera-study" onClick={() => setCameraOpen(open => !open)}>SIM / {camera}</button>
        </div>
      </div>
      <div id="camera-study" className="surveillance-controls" role="group" aria-label="Surveillance visual simulation controls" hidden={!cameraOpen}>
        {children}
      </div>
    </header>
    <dialog id="chapter-index" className="chapter-drawer" ref={dialog} aria-labelledby="index-heading"
      onCancel={event => { event.preventDefault(); dismissIndex(); }} onClose={() => setIndexOpen(false)}
      onKeyDown={keepTabInIndex} onClick={event => { if (event.target === event.currentTarget) dismissIndex(); }}>
      <div className="drawer-inner">
        <div className="drawer-top"><span id="index-heading">CHAPTER INDEX</span>
          <button ref={closeButton} aria-label="Close chapter index" onClick={() => dismissIndex()}><X size={21}/></button>
        </div>
        <nav aria-label="Main navigation">
          {chapters.map(([id, label], index) => <a href={`#${id}`} tabIndex={0} key={id} onClick={() => dismissIndex(false)}>
            <span aria-hidden="true">0{index + 1}</span>{label}<ArrowUpRight size={24} aria-hidden="true"/>
          </a>)}
        </nav>
        <p>Security thinking. Practical evidence.</p>
      </div>
    </dialog>
  </>;
}
