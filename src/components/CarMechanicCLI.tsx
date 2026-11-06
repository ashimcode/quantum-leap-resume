'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { completePath, directoryTree, GARAGE, HOME, isDirectory, listDirectory, MUSEUM, readFile, resolvePath } from '../lib/crt-filesystem';
import './CarMechanicEasterEgg.css';

const commands = ['help', 'ls', 'dir', 'cd', 'pwd', 'tree', 'cat', 'type', 'museum', 'start game', 'carmechanicos.exe', 'play', 'cls', 'clear', 'reset', 'exit'];
const help = [
  'ls [path] / dir [path] — list a directory',
  'cd [path] / pwd — change or print your location',
  'tree [path] / cat <file> — show a tree or read a file',
  'museum — find the project archive',
  'cd /opt/carmechanicos → start game',
  'Tab — complete • ↑/↓ — history • clear • reset • exit',
];

export default function CarMechanicCLI({ onPlay, onExit, onReset, active }: { onPlay: () => void; onExit: () => void; onReset: () => boolean; active: boolean }) {
  const [path, setPath] = useState('/');
  const [input, setInput] = useState('');
  const [lines, setLines] = useState(['AJ-01 PERSONAL TERMINAL', 'Filesystem mounted read-only. Type ls, help or museum.']);
  const history = useRef<string[]>([]);
  const cursor = useRef(0);
  const field = useRef<HTMLInputElement>(null);
  const output = useRef<HTMLDivElement>(null);
  const prompt = `aj@crt:${path === HOME ? '~' : path.replace(HOME + '/', '~/')}$`;
  const append = (...next: string[]) => setLines(previous => [...previous, ...next].slice(-180));

  useEffect(() => { if (active) field.current?.focus({ preventScroll: true }); }, [active]);
  useEffect(() => { if (output.current) output.current.scrollTop = output.current.scrollHeight; }, [lines]);

  const run = () => {
    const raw = input.trim();
    setInput('');
    if (!raw) return;
    history.current = [...history.current, raw].slice(-100);
    cursor.current = history.current.length;

    const [, verb, operand = ''] = /^(\S+)(?:\s+(.*))?$/.exec(raw) ?? [];
    const command = verb.toLowerCase();
    const normalized = raw.toLowerCase().replace(/\s+/g, ' ');
    const target = resolvePath(path, operand || (command === 'cd' ? '~' : '.'));
    let response: string[] = [];

    if (normalized === 'exit') { onExit(); return; }
    if (['cls', 'clear'].includes(normalized)) { setLines([]); return; }
    if (normalized === 'reset') response = [onReset() ? 'Garage save cleared.' : 'Save reset cancelled or storage unavailable.'];
    else if (command === 'help') response = help;
    else if (command === 'pwd') response = [path];
    else if (command === 'museum') response = [
      'MUSEUM OF HUMBLE BEGINNINGS',
      `cd ${MUSEUM}`,
      'ls → cat origins.txt → cat exhibits.txt',
    ];
    else if (['ls', 'dir', 'tree', 'cd'].includes(command)) {
      if (!target) response = [`${command}: no such path: ${operand}`];
      else if (!isDirectory(target)) response = [`${command}: not a directory: ${operand}`];
      else if (command === 'cd') setPath(target);
      else if (command === 'tree') response = directoryTree(target);
      else response = [listDirectory(target).join('  ') || '(empty directory)'];
    } else if (command === 'cat' || command === 'type') {
      if (!operand) response = [`Usage: ${command} <file>`];
      else if (!target) response = [`${command}: no such file: ${operand}`];
      else if (isDirectory(target)) response = [`${command}: is a directory: ${operand}`];
      else response = (readFile(target) ?? '').split('\n');
    } else if (['start game', 'start carmechanicos', 'carmechanicos.exe', 'play'].includes(normalized)) {
      if (path === GARAGE) { onPlay(); return; }
      response = [`Navigate to the garage first: cd ${GARAGE}`];
    } else response = [`Unknown command: ${verb}`, 'Type help for commands.'];

    append(`${prompt} ${raw}`, ...response);
  };

  const key = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Tab' && !event.shiftKey) {
      const [, prefix, operand] = /^(\S+\s+)(.*)$/.exec(input.trimStart()) ?? [];
      const verb = prefix?.trim().toLowerCase();
      const pathCommand = ['cd', 'ls', 'dir', 'tree', 'cat', 'type'].includes(verb);
      const query = pathCommand ? operand : input.trimStart();
      const matches = pathCommand
        ? completePath(path, operand, verb === 'cd' || verb === 'tree')
        : commands.filter(command => command.startsWith(query.toLowerCase()));
      if (!matches.length || !input.trim()) return;
      event.preventDefault();
      const leading = pathCommand ? prefix : '';
      let common = matches[0];
      while (!matches.every(value => value.startsWith(common))) common = common.slice(0, -1);
      if (matches.length === 1 || common.length > query.length) setInput(leading + common);
      else append(matches.join('  '));
    }

    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();
      cursor.current = Math.max(0, Math.min(history.current.length, cursor.current + (event.key === 'ArrowUp' ? -1 : 1)));
      setInput(history.current[cursor.current] || '');
    }
    if (event.key === 'Escape') { event.preventDefault(); onExit(); }
  };

  return <div className="aj-cli" onClick={() => field.current?.focus({ preventScroll: true })}>
    <div className="aj-cli-output" ref={output} role="log" aria-live="polite">{lines.map((line, i) => <div key={i}>{line || '\u00a0'}</div>)}</div>
    <form onSubmit={event => { event.preventDefault(); run(); }}><label htmlFor="aj-cli-input">{prompt}</label><input id="aj-cli-input" ref={field} aria-label="Terminal command" autoComplete="off" autoCapitalize="off" spellCheck={false} maxLength={200} value={input} onChange={event => setInput(event.target.value)} onKeyDown={key}/><button type="submit" aria-label="Run command">↵</button></form>
  </div>;
}
