# Security and privacy

## Portfolio boundary

This private repository holds the deployable Quantum Leap application and sanitized evidence. The published site exposes approved professional facts only. Private resumes, cover letters, recruiter correspondence, phone numbers, street/apartment addresses, personal email addresses, credentials, and unredacted logs remain outside the repository and ZIP. Only `public/resume-public.pdf` is approved for tracking. Never paste private values into tests, documentation, issues, or Agent prompts.

## Grounded ambassador

`verifiedSources.ts` is the sole public knowledge base. Deterministic topic coverage, privacy, and prompt-injection checks run before any optional model request. The model may select only the already authorized answer ID or refuse. Public prose comes exclusively from approved excerpts, with post-checks after model selection. Arbitrary HTML is never rendered. Unsupported and mixed unsafe questions return exactly: `I don't have verified information about that.`

The API bounds message size, body size, and conversation history; rejects malformed input and cross-origin requests; and limits requests to 15 attempts per minute. The default anonymous shared bucket avoids trusting spoofable forwarding headers. `TRUST_PROXY=true` uses the rightmost forwarding entry for a hashed IP bucket. Enable it only when trusted ingress supplies the actual client IP in that position and direct access is blocked. Missing or invalid entries use the shared bucket. The limiter is in-memory, per process, bounded, and resets on restart; Autoscale needs an edge limiter for a global quota.

## Runtime attack surface

Use a supported Node 24 LTS runtime and check published framework advisories alongside the npm audit. The app serves its own prebuilt visual assets and disables the Next.js image optimizer. Direct navigation to the garage HTML applies a script-free CSP sandbox. The CRT still fetches the template as text and starts the game in its existing opaque iframe.

## Secrets and chat handling

Use Replit Secrets or server environment variables. Never use NEXT_PUBLIC variables for credentials. Standard OPENAI_API_KEY takes precedence; otherwise the managed AI_INTEGRATIONS_OPENAI_API_KEY and AI_INTEGRATIONS_OPENAI_BASE_URL must both be present. A managed URL is server configuration, never supplied by a chat request. Provider failures fall back to deterministic answers.

The application does not log or persist prompts, answers, or raw conversation history. Chat stays in tab memory and is cleared on navigation/refresh or with Clear conversation. No database, browser storage, analytics, or cookies are added. Optional model requests send the current question and approved context with store:false; hosting/provider infrastructure can have separate logging and retention. Leave all model credentials unset to avoid upstream chat transmission.

## Reporting and contribution safeguards

Report suspected vulnerabilities privately to the owner through the public LinkedIn contact; do not include secrets or exploit personal data in GitHub issues. Test only owned or explicitly authorized environments. Run build, grounding/PDF verification, submission checks, and baseline integrity checks before pushing. Review staged filenames and content. Private repository visibility does not replace sanitization.

## Local release checks

Run `npm run build` followed by `npm run verify:security`. The main `npm run verify` command also runs this suite. Python 3.11 or newer is used to parse the Replit configuration and inspect an actual export. The dependency checks contact the npm registry for audit results.

1. TypeScript syntax trees are checked for dynamic execution, shell execution, direct HTML injection and wildcard messaging. The existing opaque garage iframe's outbound bridge is pinned to its reviewed fingerprint. Its inbound source, origin, session and save slot checks are verified.
2. Registry tarballs must use the official npm registry and valid SHA-512 integrity. npm's bundled child entries are checked against the declared bundle in the verified parent tarball. The production and full dependency audits both gate the release.
3. Tracked and new project text is checked for credential patterns and entropy in labelled secret fields. Ignore rules and a temporary exported ZIP inventory are also checked. Two exact synthetic values in the existing privacy test suite are reserved as fixtures.
4. The canonical Replit Node module, port and deploy commands are checked against the app scripts. The Nix dependencies, TypeScript scope and Next.js security headers are checked as configuration invariants.
5. A short-lived loopback production server with provider credentials disabled exercises headers and real HTTP API boundaries, including the disabled optimizer, garage template restrictions, method, media type, JSON schema and size, origin, grounding and rate limits.

These checks are scoped local release evidence. Formal security assurance requires a separate review against the complete applicable standard and deployed infrastructure.
