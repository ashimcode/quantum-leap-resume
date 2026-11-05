import { mkdirSync, writeFileSync } from 'node:fs';
import { verifiedSources } from '../src/data/verifiedSources';
mkdirSync('.qa', { recursive: true });
writeFileSync('.qa/resume-data.json', JSON.stringify(verifiedSources));
