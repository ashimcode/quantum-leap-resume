/** Explicit release operation. Never silently re-baseline an existing release. */
import { readFileSync, readdirSync, writeFileSync, lstatSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
const version=process.argv[process.argv.indexOf('--version')+1];
assert(process.argv.includes('--version')&&/^\d+\.\d+\.\d+$/.test(version),'Use --version X.Y.Z after approving a new release');
const pkg=JSON.parse(readFileSync('package.json','utf8')),lock=JSON.parse(readFileSync('package-lock.json','utf8'));
assert.equal(pkg.version,version,'Bump package version explicitly first');
assert.equal(lock.version,version);assert.equal(lock.packages[''].version,version);
const tagged=spawnSync('git',['show-ref','--verify','--quiet',`refs/tags/v${version}`]);
assert.equal(tagged.status,1,'Release tag exists or Git check failed; refusing to overwrite a frozen release');
const old=JSON.parse(readFileSync('RELEASE_BASELINE.json','utf8'));
assert.notEqual(old.version,version,'Manifest already records this version; choose a new version');
const files={};
function add(path){assert(!lstatSync(path).isSymbolicLink(),'Unexpected symlink');const raw=readFileSync(path);const binary=/\.(?:jpg|jpeg|png|webp|mp4|webm|pdf|woff2?)$/i.test(path);files[path]=createHash('sha256').update(binary?raw:Buffer.from(raw.toString('utf8').replace(/\r\n/g,'\n'))).digest('hex');}
function walk(folder){for(const e of readdirSync(folder,{withFileTypes:true})){const path=`${folder}/${e.name}`;if(e.isDirectory())walk(path);else add(path);}}
for(const folder of ['src','public','scripts','tests','.github/workflows'])walk(folder);
for(const path of ['package.json','package-lock.json','next.config.mjs','tsconfig.json','playwright.config.ts','.replit','replit.nix'])add(path);
writeFileSync('RELEASE_BASELINE.json',JSON.stringify({version,textNormalization:'LF for text; binary assets exact',files},null,2)+'\n');
console.log(`Locked candidate ${version}: ${Object.keys(files).length} files. Verify, review and commit before creating a new annotated tag.`);
