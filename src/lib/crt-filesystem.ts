export const HOME = '/home/ashim';
export const GARAGE = '/opt/carmechanicos';
export const MUSEUM = '/usr/share/doc/quantum-leap';

const directories = new Set([
  '/', '/bin', '/boot', '/dev', '/etc', '/home', HOME, `${HOME}/Desktop`,
  '/lib', '/media', '/mnt', '/opt', GARAGE, '/run', '/sbin', '/srv', '/tmp',
  '/usr', '/usr/bin', '/usr/lib', '/usr/local', '/usr/share', '/usr/share/doc', MUSEUM,
  '/var', '/var/cache', '/var/lib', '/var/log', '/var/tmp',
]);

const files = new Map([
  ['/bin/README.txt', 'AJ-01 commands: ls, cd, pwd, cat, tree and clear. Type help for usage.'],
  ['/boot/README.txt', 'AJ-01 boots into a virtual, read-only filesystem.'],
  ['/dev/README.txt', 'This terminal has no access to host devices.'],
  ['/etc/issue', 'AJ-01 Personal Terminal\nQuantum Leap // browser filesystem'],
  ['/etc/aj-terminal.conf', 'filesystem=read-only\nmount=browser\nstart_directory=/'],
  [`${HOME}/README.txt`, `Welcome to Ashim’s terminal.\nType museum to explore the project’s history.\nThe garage is installed at ${GARAGE}.`],
  [`${GARAGE}/README.txt`, [
    'CARMECHANICOS // THE HIDDEN GARAGE',
    'A fictional browser game. Salvage scrap, order parts and complete repairs.',
    'Type start game to boot. EXPAND gives the garage more room.',
    'ESC / EXIT GAME returns here. Your garage saves in this browser.',
    'reset clears only the garage save; exit returns to the name signal.',
  ].join('\n')],
  [`${GARAGE}/carmechanicos.exe`, 'Browser launcher. Type start game or play.'],
  [`${GARAGE}/garage.cfg`, 'launcher=browser\nsave=local\nsandbox=enabled'],
  [`${MUSEUM}/origins.txt`, [
    'EXHIBIT 01 // THE UALBANY CLASSROOM',
    'Quantum Leap began as Ashim’s sophomore-year final project at UAlbany.',
    'The original site helped first-year students find academic support and campus resources.',
    'Five HTML pages shared one stylesheet, with a small JavaScript contact-form demo.',
  ].join('\n')],
  [`${MUSEUM}/exhibits.txt`, [
    'EXHIBIT 02 // FROM CLASS PROJECT TO PORTFOLIO',
    'The site became a personal portfolio with a public résumé and a source-grounded Ambassador.',
    'The CRT arrived as a place to explore and launch the fictional garage.',
    'v1.3.0 added the ASCII portal and four scroll-driven camera acts.',
    'v1.4.0 opens the CRT filesystem and records the iterations in the repository gallery.',
  ].join('\n')],
  [`${MUSEUM}/README.txt`, 'MUSEUM OF HUMBLE BEGINNINGS\nRead origins.txt for the classroom project and exhibits.txt for its later iterations.'],
  ['/var/log/boot.log', 'AJ-01: virtual filesystem ready\nAJ-01: museum records mounted read-only'],
]);

const aliases = new Map([[`${HOME}/Desktop/carmechanicos`, GARAGE]]);
const paths = [...directories, ...files.keys(), ...aliases.keys()].filter(path => path !== '/');
const nameOf = (path: string) => path.slice(path.lastIndexOf('/') + 1);
const parentOf = (path: string) => path.slice(0, path.lastIndexOf('/')) || '/';

export const isDirectory = (path: string) => directories.has(path);
export const readFile = (path: string) => files.get(path);

function children(path: string) {
  return paths.filter(entry => parentOf(entry) === path).sort((a, b) => nameOf(a).localeCompare(nameOf(b)));
}

export function listDirectory(path: string) {
  return children(path).map(entry => nameOf(entry) + (directories.has(entry) || aliases.has(entry) ? '/' : ''));
}

export function resolvePath(cwd: string, operand: string): string | undefined {
  const path = operand.trim().replace(/^"(.*)"$/, '$1').replaceAll('\\', '/')
    .replace(/^c:\/users\/ashim(?=\/|$)/i, HOME);
  let current = path.startsWith('/') ? '/' : cwd;
  const parts = path.split('/');
  if (parts[0] === '~') {
    current = HOME;
    parts.shift();
  } else if (cwd === '/' && parts[0]?.toLowerCase() === 'desktop') {
    current = HOME;
  }

  for (const part of parts) {
    if (!part) continue;
    if (!directories.has(current)) return;
    if (part === '.') continue;
    if (part === '..') {
      current = parentOf(current);
      continue;
    }
    const entry = children(current).find(child => nameOf(child).toLowerCase() === part.toLowerCase());
    if (!entry) return;
    current = aliases.get(entry) ?? entry;
  }
  return path.endsWith('/') && !directories.has(current) ? undefined : current;
}

export function completePath(cwd: string, operand: string, directoriesOnly: boolean) {
  const slash = operand.lastIndexOf('/') + 1;
  const prefix = operand.slice(0, slash);
  const query = operand.slice(slash).toLowerCase();
  const directory = resolvePath(cwd, prefix || '.');
  if (!directory || !isDirectory(directory)) return [];
  const choices = listDirectory(directory);
  if (!prefix && cwd === '/') choices.push('Desktop/');
  return choices.filter(entry => entry.toLowerCase().startsWith(query) && (!directoriesOnly || entry.endsWith('/')))
    .map(entry => prefix + entry);
}

export function directoryTree(path: string): string[] {
  const lines = [path];
  function walk(directory: string, indent: string) {
    const entries = children(directory);
    entries.forEach((entry, index) => {
      const last = index === entries.length - 1;
      const branch = last ? '└─ ' : '├─ ';
      const target = aliases.get(entry);
      lines.push(indent + branch + nameOf(entry) + (target ? ` → ${target}` : directories.has(entry) ? '/' : ''));
      if (directories.has(entry)) walk(entry, indent + (last ? '   ' : '│  '));
    });
  }
  walk(path, '');
  return lines;
}
