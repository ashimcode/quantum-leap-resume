# Project setup

This is an existing Next.js App Router application in TypeScript and Tailwind CSS.

- Entry: src/app/page.tsx; API: src/app/api/ambassador/route.ts.
- Node.js 20.9+; npm is the canonical package manager. Use package-lock.json.
- Run npm ci to install. Run npm run dev for preview; npm run build then npm run start for production.
- Host 0.0.0.0, PORT 3000, external port 80; Autoscale configuration is in .replit.
- No API key or database is required. Optional OPENAI_API_KEY is server-only.
- All candidate facts and approved ambassador answer text live in src/data/verifiedSources.ts. Preserve its evidence boundaries and January–May 2026 Makerspace dates.
- Preserve exact refusal text, grounding post-checks, request/history bounds, prompt-injection checks, and rate limits. Never log or persist chat.
- Public resume: public/resume-public.pdf. Never introduce private original contact fields.
- Maintainer regression checks: npm run verify (Python/pypdf needed for PDF scan). See REPLIT_DEPLOYMENT.md.
