import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
const baseline=JSON.parse(readFileSync('RELEASE_BASELINE.json','utf8'));
for(const [file,hash] of Object.entries(baseline.files)){const raw=readFileSync(file);const bytes=file.startsWith('src/')||file==='scripts/verify-grounding.ts'?Buffer.from(raw.toString('utf8').replace(/\r\n/g,'\n')):raw;assert.equal(createHash('sha256').update(bytes).digest('hex'),hash,`Baseline drift: ${file}`);}
assert.equal(JSON.parse(readFileSync('package.json','utf8')).version,'1.1.0');
console.log(`PASS: ${Object.keys(baseline.files).length} frozen application and public asset hashes`);
