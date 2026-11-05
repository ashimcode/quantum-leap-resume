import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
const baseline=JSON.parse(readFileSync('RELEASE_BASELINE.json','utf8'));
for(const [file,hash] of Object.entries(baseline.files)){const raw=readFileSync(file);const normalized=baseline.textNormalization==='LF for text; binary assets exact'?!/\.(?:jpg|jpeg|png|webp|mp4|webm|pdf|woff2?)$/i.test(file):file.startsWith('src/')||file==='scripts/verify-grounding.ts';const bytes=normalized?Buffer.from(raw.toString('utf8').replace(/\r\n/g,'\n')):raw;assert.equal(createHash('sha256').update(bytes).digest('hex'),hash,`Baseline drift: ${file}`);}
assert.equal(JSON.parse(readFileSync('package.json','utf8')).version,baseline.version);
console.log(`PASS: ${Object.keys(baseline.files).length} frozen application and public asset hashes`);
