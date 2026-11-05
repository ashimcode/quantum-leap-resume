# v1.2.1 LinkedIn reconciliation verification

## Authority and inventory

The sole factual authority is the candidate-supplied canonical LinkedIn specification. Public section links identify provenance, not independent validation. The page, deterministic ambassador answers and public PDF share verifiedSources.ts.

| Entity | Required count | Actual count |
| --- | --- | --- |
| Roles | 6 | 6 |
| Education | 3 | 3 |
| Credentials | 5 | 5 |
| Projects | 3 | 3 |
| Top skills | 5 | 5 |

## Reproducible checks

- npm run typecheck
- npm run build (stop the owned preview first)
- npm run verify: API, unsupported-claim refusals, exact follow-ups, input/history/origin/rate limits, model pre/post checks, PDF and client privacy scanning; all 33 unchanged scanner regressions.
- npm run verify:submission: current canonical recruiter questions; all rendered entries and source anchors; full public PDF content/metadata; supported entity answers and provider routing.
- npm run verify:baseline after the explicit 1.2.1 freeze.

The expanded grounding suite currently makes 243 API regression requests. Detailed actual run outcomes, protected-file hashes, PDF page renders and browser results are recorded during the release in RELEASE_VERIFICATION.md and ignored .qa/v121 artifacts.

## Grounding boundaries

Listed AWS, IAM, SIEM and Linux skills do not establish separate certifications, proficiency levels or production deployments. Graduate and bachelor's entries do not establish awarded degrees. Project awards do not establish employment. Unsupported salary, availability and private contact requests still return exactly: "I don't have verified information about that."

Career facts no longer come from the old resume, cover letter or repository. Historical Handshake documents outside this task's allowed edits are preserved artifacts and are not authority for the reconciled site. CarMechanicOS is a fictional interactive easter egg, not a listed career project.

## Privacy and deployment

Only the canonical grades and public professional location are published; no personal email, phone or street address is imported. PDF metadata contains only public document identity. The corrected OpenSSL configuration and application-only TypeScript scope from main remain intact. No Replit Agent, publish, hosting or DNS action is part of this content reconciliation.
