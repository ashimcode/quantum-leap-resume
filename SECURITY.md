# Security and privacy

## Portfolio boundary

This private repository holds the deployable Quantum Leap application and sanitized evidence. The published site exposes approved professional facts only. Private resumes, cover letters, recruiter correspondence, phone numbers, street/apartment addresses, personal email addresses, credentials, and unredacted logs remain outside the repository and ZIP. Only `public/resume-public.pdf` is approved for tracking. Never paste private values into tests, documentation, issues, or Agent prompts.

## Grounded ambassador

`verifiedSources.ts` is the sole public knowledge base. Deterministic topic coverage, privacy, and prompt-injection checks run before any optional model request. The model may select only the already authorized answer ID or refuse. Public prose comes exclusively from approved excerpts, with post-checks after model selection. Arbitrary HTML is never rendered. Unsupported and mixed unsafe questions return exactly: `I don't have verified information about that.`

The API bounds message size, body size, and conversation history; rejects malformed input and cross-origin requests; and limits requests to 15 attempts per minute. The default anonymous shared bucket avoids trusting spoofable forwarding headers. `TRUST_PROXY=true` enables hashed-IP buckets only when a trusted proxy overwrites forwarding headers and direct access is blocked. The limiter is in-memory, per process, bounded, and resets on restart; Autoscale needs an edge limiter for a global quota.

## Secrets and chat handling

Use Replit Secrets or server environment variables. Never use NEXT_PUBLIC variables for credentials. Standard OPENAI_API_KEY takes precedence; otherwise the managed AI_INTEGRATIONS_OPENAI_API_KEY and AI_INTEGRATIONS_OPENAI_BASE_URL must both be present. A managed URL is server configuration, never supplied by a chat request. Provider failures fall back to deterministic answers.

The application does not log or persist prompts, answers, or raw conversation history. Chat stays in tab memory and is cleared on navigation/refresh or with Clear conversation. No database, browser storage, analytics, or cookies are added. Optional model requests send the current question and approved context with store:false; hosting/provider infrastructure can have separate logging and retention. Leave all model credentials unset to avoid upstream chat transmission.

## Reporting and contribution safeguards

Report suspected vulnerabilities privately to the owner through the public LinkedIn contact; do not include secrets or exploit personal data in GitHub issues. Test only owned or explicitly authorized environments. Run build, grounding/PDF verification, submission checks, and baseline integrity checks before pushing. Review staged filenames and content. Private repository visibility does not replace sanitization.
