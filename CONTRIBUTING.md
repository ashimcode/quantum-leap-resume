# Contributing

## Evidence before claims

Propose the source, narrow factual statement, exact public evidence locator, and privacy review before adding a claim. Preserve source disagreements and distinguish proposed architecture, executed work, measured results, and candidate-reported recognition. Never infer employment from a challenge, completion from a plan, or new metrics from descriptive outcomes.

Update the canonical verified source data and claim audit together only in an authorized future change. Do not publish raw resumes or cover letters. If original line/page references cannot be verified, record that limitation instead of inventing citations.

## Workflow

1. Branch from main and state scope and completion gate.
2. Keep changes focused; v1.1.0 visuals and animation engine are frozen.
3. Install with npm ci and Python/pypdf; run npm run build, npm run verify, npm run verify:submission, and npm run verify:baseline.
4. Review git diff --cached and excluded files before committing.
5. Use scoped conventional commits such as feat(quantum-leap), security(repo), docs(repo), or test(grounding), following cybr-projects history.
6. Describe evidence and remaining limits in the PR. Never overwrite a release tag or force-push main.

No secret values, personal contact details, unredacted PDFs, raw chat logs, or generated deployment archives belong in commits. Rebuild ZIPs using the allowlisted exporter.
