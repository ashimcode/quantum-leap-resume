/** Explicit release operation. Never silently re-baseline an existing release. */
import { readFileSync, readdirSync, writeFileSync, lstatSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
const releaseVersion = /^1\.(0|[1-9]\d*)\.(0|[1-9]|1\d|20)$/;

function nextVersion(version) {
  assert.match(version, releaseVersion, 'Expected a 1.<minor>.<0..20> release');
  const [, minor, patch] = version.split('.');
  return Number(patch) < 20
    ? `1.${minor}.${Number(patch) + 1}`
    : `1.${BigInt(minor) + 1n}.0`;
}

const args = process.argv.slice(2);
const old = JSON.parse(readFileSync('RELEASE_BASELINE.json', 'utf8'));
const next = nextVersion(old.version);
if (args.length === 1 && args[0] === '--next') {
  console.log(next);
  process.exit(0);
}

const renumberHistory = args.length === 1 && args[0] === '--renumber-history';
assert(renumberHistory || args.length === 0 || (args.length === 2 && args[0] === '--version'),
  'Use no arguments for the next release, --next to print it, or --version X.Y.Z to specify it');
// One-time migration of the existing stable milestone. Unavailable after this freeze.
if (renumberHistory) assert.equal(old.version, '1.4.4', 'The original stable baseline is required for renumbering');
const expected = renumberHistory ? '1.0.14' : next;
const version = args[0] === '--version' ? args[1] : expected;
assert.match(version, releaseVersion, 'Expected a 1.<minor>.<0..20> release');
assert.equal(version, expected, 'Release must use the next milestone version');
const pkg=JSON.parse(readFileSync('package.json','utf8')),lock=JSON.parse(readFileSync('package-lock.json','utf8'));
assert.equal(pkg.version,version,'Bump package version explicitly first');
assert.equal(lock.version,version);assert.equal(lock.packages[''].version,version);
const tagged=spawnSync('git',['show-ref','--verify','--quiet',`refs/tags/v${version}`]);
assert.equal(tagged.status,1,'Release tag exists or Git check failed; refusing to overwrite a frozen release');
assert.notEqual(old.version,version,'Manifest already records this version; choose a new version');
const files={};
function add(path){assert(!lstatSync(path).isSymbolicLink(),'Unexpected symlink');const raw=readFileSync(path);const binary=/\.(?:jpg|jpeg|png|webp|mp4|webm|pdf|woff2?)$/i.test(path);files[path]=createHash('sha256').update(binary?raw:Buffer.from(raw.toString('utf8').replace(/\r\n/g,'\n'))).digest('hex');}
function walk(folder){for(const e of readdirSync(folder,{withFileTypes:true})){const path=`${folder}/${e.name}`;if(e.isDirectory())walk(path);else add(path);}}
for(const folder of ['src','public','scripts','tests','.github/workflows'])walk(folder);
for(const path of ['package.json','package-lock.json','next.config.mjs','tsconfig.json','playwright.config.ts','.replit','replit.nix'])add(path);
writeFileSync('RELEASE_BASELINE.json',JSON.stringify({version,textNormalization:'LF for text; binary assets exact',files},null,2)+'\n');
console.log(`Locked candidate ${version}: ${Object.keys(files).length} files. Verify, review and commit before creating a new annotated tag.`);
