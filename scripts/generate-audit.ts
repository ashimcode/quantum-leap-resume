import { writeFileSync } from 'node:fs';
import { verifiedSources as d } from '../src/data/verifiedSources';

const rows: string[] = [];
function walk(value: unknown, path: string, source: string) {
  if (typeof value === 'string' && value && !/\.(id|anchor|source|link|url|number|label|category)$/.test(path)) {
    rows.push(`| ${value.replaceAll('|', ' / ').replaceAll('\n', ' ')} | \`${path}\` — ${source} | ${/pending|unavailable|withheld|unverified|not established|not claimed|not documented|not asserted/.test(value) ? 'Boundary disclosed' : 'Supported to stated scope'} |`);
  } else if (Array.isArray(value)) value.forEach((item, i) => walk(item, `${path}.${i}`, source));
  else if (value && typeof value === 'object') for (const [key, item] of Object.entries(value)) walk(item, `${path}.${key}`, source);
}
const { additionalCredentials, honors, ...candidate } = d.candidate;
walk(candidate, 'verifiedSources.candidate', 'resume / cover-letter / candidate-correction; public contact approved by candidate');
walk(additionalCredentials, 'verifiedSources.candidate.additionalCredentials', 'linkedin-certifications');
walk(honors, 'verifiedSources.candidate.honors', 'linkedin-honors / candidate-reconciliation / resume');
d.capabilities.forEach((item, i) => walk(item, `verifiedSources.capabilities.${i}`, item.source));
d.projects.forEach((item, i) => walk(item, `verifiedSources.projects.${i}`, item.source));
d.experience.forEach((item, i) => walk(item, `verifiedSources.experience.${i}`, item.source));
d.answers.forEach((item, i) => walk({ text: item.text, detail: item.detail }, `verifiedSources.answers.${i}`, ['hia', 'goldman'].includes(item.id) ? 'linkedin-projects' : item.id === 'honors' ? 'linkedin-honors / candidate-reconciliation / linkedin-projects / resume' : 'resume / cover-letter / soc-readme / soc-audit / linkedin-education / linkedin-certifications / candidate-reconciliation as applicable'));

writeFileSync('CLAIM_AUDIT.md', `# Public claim audit

Review date: November 4, 2026 (America/New_York).

Factual candidate copy and approved ambassador excerpts come from src/data/verifiedSources.ts. Generic navigation and design labels are not candidate claims. LinkedIn entries are candidate-reported sources, not independently certified facts. Source IDs resolve in verifiedSources.sources.

The redacted public PDF is preserved unchanged from the prior approved version. It predates this expanded knowledge base and is not claimed to contain the new LinkedIn projects or honors. Original private PDFs remain outside the application directory.

## Source reconciliation

- Drone internship: resume Sep 2025–Dec 2025 retained by explicit candidate instruction on November 4, 2026. LinkedIn Aug 2025–Dec 2025 is logged as a source discrepancy, not silently substituted.
- Makerspace: January–May 2026; candidate correction from October 29, 2026 retained and consistent with LinkedIn.
- Education: undergraduate portion of the combined 4+1 program; expected B.S. May 2027. LinkedIn graduate-component dates do not establish an awarded B.S. or M.S.
- Credentials: retain resume Copper, Fiber Optics, Coaxial Cabling, Grounding and Bonding, Ethernet. LinkedIn separately lists Wireless Technician, Grounding and Bonding Technician, Network Cabling Specialist Copper Systems, Telecommunications Technologies (June 2023), and FAA sUAS TRUST Certificate (August 2026). Overlapping copper/grounding titles are not counted as extra distinct certifications. TRUST is not a Part 107 license.
- Honors: official LinkedIn wording is Dr. Seth Spellman, Jr. Academic Achievement Award recipient, March 2026. Dean’s List Spring 2024 and Fall 2025 are explicitly candidate-confirmed in the November 4 build instruction; LinkedIn independently provides only the broader 2024–2026 title.
- HIA AI: collaborative design/testing, college access, privacy, and ethical AI are supported by LinkedIn. No HIA first-place award or Manhattan representation is asserted.
- Goldman Sachs challenge: LinkedIn project entry reports 1st Place Creativity Award. No employment, financial return, adoption figure, or forecast accuracy is inferred.
- SOC: Windows/Sysmon telemetry and end-to-end investigation remain unverified; architecture is proposed. Only supporting runtime and sanitized synthetic Splunk HEC acceptance are established.
- Unsupported ZTNA research and Atlas work are omitted from featured cards. No completed SMB hardening is asserted. Existing ambassador refusals remain in place.
- Quantum Leap: original seven supplied files establish the student-site layout and local form validation. No original message delivery or sole authorship claim is inferred.
- Handshake: resume-based general AI evaluation retained; no internal project name or implied employer security specialization is introduced. LinkedIn skill tags alone do not establish AWS, IAM, or Kubernetes deployment experience.
- Privacy: no GPA, phone, private email, street address, analytics, recruiter-only preferences, or original contact header is imported. Public contact is LinkedIn.

## Rendered claims and approved answers

| Rendered claim | Exact field / evidence | Status |
| --- | --- | --- |
${rows.join('\n')}
`);
