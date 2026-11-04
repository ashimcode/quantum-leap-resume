import { writeFileSync } from 'node:fs';
import { verifiedSources } from '../src/data/verifiedSources';
writeFileSync('.qa/resume-data.json',JSON.stringify(verifiedSources));
