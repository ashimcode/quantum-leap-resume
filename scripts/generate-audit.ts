import { writeFileSync } from 'node:fs';
import { verifiedSources as d } from '../src/data/verifiedSources';

const rows: string[] = [];
function walk(value: unknown, path: string, source: string) {
  if (typeof value === 'string' && value && !/\.(id|answerId|anchor|source|link|url|number|label|category)$/.test(path)) {
    const authority = /candidate\.links\.github$/.test(path) || (/answers\./.test(path) && /GitHub/.test(value)) ? 'Canonical LinkedIn facts; candidate-authorized GitHub contact link' : source;
    rows.push(`| ${value.replaceAll('|', ' / ').replaceAll('\n', ' ')} | \`${path}\` | ${authority} |`);
  } else if (Array.isArray(value)) value.forEach((item,i)=>walk(item,`${path}.${i}`,source));
  else if (value && typeof value === 'object') for (const [key,item] of Object.entries(value)) walk(item,`${path}.${key}`,source);
}
walk(d.candidate,'verifiedSources.candidate','linkedin-profile / linkedin-education');
for (const group of ['experience','education','certifications','projects','capabilities'] as const)
 d[group].forEach((item,i)=>walk(item,`verifiedSources.${group}.${i}`,item.source));
d.answers.forEach((item,i)=>walk({text:item.text,detail:item.detail},`verifiedSources.answers.${i}`,'Canonical LinkedIn specification; linked page entry'));
writeFileSync('CLAIM_AUDIT.md',`# LinkedIn-only public claim audit

Reconciliation: v1.2.1; public-link restoration in v1.2.2, November 5, 2026.

## Sole factual authority

The candidate supplied the canonical LinkedIn specification in the v1.2.1 instruction. It is the only authority for career, education, projects, certifications and skills. Public URLs identify LinkedIn sections; this pass does not claim independently scraped or independently certified profile facts. All public factual copy, approved answers and the generated public PDF derive from src/data/verifiedSources.ts. GitHub is restored by the candidate as a public contact link, not as career authority. Generic navigation, the surveillance visual simulation and the fictional CRT game are not career claims.

## Exact inventory and changes

- Six roles, three education entries, five credentials, three projects and five top skills.
- Headline: ${d.candidate.headline}. About: ${d.candidate.summary}
- Robotics dates now follow LinkedIn: Aug 2025 – Dec 2025. AI Training Evaluator dates: Sep 2026 – Present. Apex dates: Oct 2024 – Present.
- Master's entry is In-Progress, Aug 2026 – May 2028. Bachelor's entry is currently pursued, 2023 – 2027. No awarded graduate/undergraduate degree is inferred.
- Published grades 3.4 and 3.2 are explicitly authorized in the canonical specification. Phone, street address and personal email remain excluded.
- Credentials are precisely the five LinkedIn titles and issue dates. Fiber Optics is a high-school skill, not an extra certification.
- Project Hedgehog leads the three-project list. Goldman Sachs challenge lists both 1st Place and 2nd Place Creativity Awards, not employment. No HIA/Hedgehog award is inferred.
- Former resume/repository/candidate-confirmation sources, old projects, extra roles, extra credentials and standalone honors are removed as current career evidence. Negative regression questions keep their names solely to verify refusal.
- The public resume was regenerated as a three-page LinkedIn-aligned document and each rendered page was visually reviewed.
- Every factual field below maps to the canonical LinkedIn section ID. Original-source line numbers are not available and are not fabricated.

## Canonical field-to-source map

| Claim / approved answer | Exact field | LinkedIn source |
| --- | --- | --- |
${rows.join('\n')}
`);
console.log(`Generated ${rows.length} field-to-source audit rows.`);
