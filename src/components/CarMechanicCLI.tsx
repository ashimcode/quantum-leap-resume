'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import './CarMechanicEasterEgg.css';

const root = ['Users', 'ashim'];
const commands = ['help', 'dir', 'ls', 'cd Desktop', 'cd Desktop/carmechanicos', 'cd carmechanicos', 'cd ..', 'start game', 'carmechanicos.exe', 'play', 'cat README.txt', 'type README.txt', 'cls', 'clear', 'reset', 'exit'];
export default function CarMechanicCLI({ onPlay, onExit, onReset, active }: { onPlay: () => void; onExit: () => void; onReset: () => boolean; active: boolean }) {
  const [path, setPath] = useState(root);
  const [input, setInput] = useState('');
  const [lines, setLines] = useState(['AJ-01 PERSONAL TERMINAL', 'Signal acquired. Type help to explore.']);
  const history = useRef<string[]>([]);
  const cursor = useRef(0);
  const field = useRef<HTMLInputElement>(null);
  const output = useRef<HTMLDivElement>(null);
  const prompt = `C:\\${path.join('\\')}>`;
  const inGame = path.length === 4;
  useEffect(() => { if (active) field.current?.focus({ preventScroll: true }); }, [active]);
  useEffect(() => { if (output.current) output.current.scrollTop = output.current.scrollHeight; }, [lines]);
  const run = () => {
    const raw = input.trim(); setInput(''); if (!raw) return;
    history.current.push(raw); cursor.current = history.current.length;
    const command = raw.toLowerCase().replace(/\s+/g, ' ');
    let response: string[] = [];
    if (command === 'exit') { onExit(); return; }
    if (['cls', 'clear'].includes(command)) { setLines([]); return; }
    if (command === 'reset') response = [onReset() ? 'Garage save cleared. Other site storage is unchanged.' : 'Save reset cancelled or storage unavailable.'];
    else if (command === 'help') response = ['dir / ls — list files', 'cd Desktop → cd carmechanicos → start game', 'cd .. / cd ~ — go back / home', 'cat README.txt / type README.txt', 'Tab — complete • ↑/↓ — history • clear • reset • exit'];
    else if (['dir', 'ls'].includes(command)) response = inGame ? ['carmechanicos.exe', 'README.txt', 'garage.cfg'] : path.length === 3 ? ['carmechanicos/'] : ['Desktop/'];
    else if (command.startsWith('cd ')) {
      const arg = raw.slice(3).trim().replace(/^"|"$/g, '').replace(/\\/g, '/');
      let next = [...path];
      if (arg === '~' || arg.toLowerCase() === 'c:/users/ashim') next = [...root];
      else {
        if (/^c:\//i.test(arg)) next = [];
        for (const segment of arg.replace(/^c:\//i, '').split('/')) {
          if (!segment || segment === '.') continue;
          if (segment === '..') { if (next.length > 2) next.pop(); continue; }
          next.push(segment);
        }
      }
      const canonical = ['Users', 'ashim', 'Desktop', 'carmechanicos'];
      if (next.length >= 2 && next.length <= 4 && next.every((part, i) => part.toLowerCase() === canonical[i].toLowerCase())) setPath(canonical.slice(0, next.length));
      else response = ['The system cannot find that path. Type dir to explore.'];
    } else if (['cat readme.txt', 'type readme.txt'].includes(command) && inGame) response = ['CARMECHANICOS // THE HIDDEN GARAGE', 'A fictional browser tycoon game; game achievements are not resume credentials.', 'Salvage scrap, order parts, complete repairs and build your garage.', 'Type start game to boot. Use EXPAND on the bezel for more room.', 'ESC / EXIT GAME returns here. Your garage saves in this browser.', 'reset clears only the garage save; exit returns to the name signal.'];
    else if (['start game', 'start carmechanicos', 'carmechanicos.exe', 'play'].includes(command)) {
      if (inGame) { onPlay(); return; }
      response = ['Navigate to the garage first: cd Desktop/carmechanicos'];
    } else response = [`Unknown command: ${raw}`, 'Type help for commands.'];
    setLines(previous => [...previous, `${prompt} ${raw}`, ...response].slice(-180));
  };
  const key = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Tab') {
      event.preventDefault();
      const prefix = input.toLowerCase();
      const matches = commands.filter(command => command.toLowerCase().startsWith(prefix));
      if (matches.length === 1) setInput(matches[0]);
      else if (matches.length) {
        let common = matches[0];
        while (!matches.every(value => value.startsWith(common))) common = common.slice(0, -1);
        if (common.length > input.length) setInput(common);
        else setLines(previous => [...previous, matches.join('  ')]);
      }
    }
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault(); cursor.current = Math.max(0, Math.min(history.current.length, cursor.current + (event.key === 'ArrowUp' ? -1 : 1)));
      setInput(history.current[cursor.current] || '');
    }
    if (event.key === 'Escape') { event.preventDefault(); onExit(); }
  };
  return <div className="aj-cli" onClick={() => field.current?.focus({ preventScroll: true })}>
    <div className="aj-cli-output" ref={output} role="log" aria-live="polite">{lines.map((line, i) => <div key={i}>{line || '\u00a0'}</div>)}</div>
    <form onSubmit={event => { event.preventDefault(); run(); }}><label htmlFor="aj-cli-input">{prompt}</label><input id="aj-cli-input" ref={field} aria-label="Terminal command" autoComplete="off" autoCapitalize="off" spellCheck={false} maxLength={200} value={input} onChange={event => setInput(event.target.value)} onKeyDown={key}/><button type="submit" aria-label="Run command">↵</button></form>
  </div>;
}
