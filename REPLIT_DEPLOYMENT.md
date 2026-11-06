# Import and deploy on Replit

## Import the package

1. Open https://replit.com/import and select **ZIP**.
2. Upload `replit-deploy.zip` and select **Import**. The archive has `.replit`, `package.json`, and `src/` directly at its root. Import the ZIP, not the parent workspace containing the private original PDFs.
3. Replit installs dependencies. The supplied configuration uses the `nodejs-24` runtime, `stable-24_05` Nix channel, and port 3000 → 80. Check that the workspace and build both supply Node 24.22.2 or newer.
4. Select **Run** to preview. The command is `npm run dev` and binds to `0.0.0.0`.

If the import did not install dependencies, run `npm ci` in Shell once. Replit's import compatibility checks may adjust its workspace setup.

## Update an existing workspace to v1.2.0

Use `quantum-leap-v1.2.0-replit-openssl-fix.zip`. Earlier packages, including `quantum-leap-v1.2.0-replit.zip`, still carry the obsolete Nix library override and must not be re-imported over the corrected workspace. The corrected package retains application version 1.2.0 and the approved UI; its filename distinguishes this deployment configuration repair from the original release.

The existing Replit workspace was repaired directly; it does not need another ZIP upload. A full import replaces the canonical port-3000 configuration and can overwrite Replit's existing port-5000/workflow/development-preview adaptations. Preserve or reconcile those platform settings before any future full import. The instructions below describe the canonical package configuration, not an instruction to overwrite the already-repaired workspace.

Stop the running app first. Upload `quantum-leap-v1.2.0-replit-openssl-fix.zip` into `public/`, then run this from the Replit project root:

```sh
unzip -tq public/quantum-leap-v1.2.0-replit-openssl-fix.zip && rm -f -- playwright.config.ts && rm -rf -- tests .next && rm -f -- tsconfig.tsbuildinfo && unzip -o public/quantum-leap-v1.2.0-replit-openssl-fix.zip && rm -- public/quantum-leap-v1.2.0-replit-openssl-fix.zip && env -u LD_LIBRARY_PATH npm ci --include=dev && env -u LD_LIBRARY_PATH npm run build
```

This validates the ZIP before removing the stale Replit Agent Playwright configuration/tests and generated build cache. `npm ci --include=dev` installs the exact lockfile, including TypeScript build tools even if the environment omits development dependencies by default. After a successful build, restart Run for preview and republish to update the live deployment.

The import command also clears any library-path override inherited by the already-open Shell. The permanent fix is the absence of the override in `replit.nix`; clearing it only in a later deployment build command cannot fix Replit's earlier automatic npm-install stage. Reload/reopen the Shell after Nix configuration changes. Publishing is a separate action and can incur normal hosting/build usage. The November 5 repair was explicitly verified without using Replit Agent or publishing, at the user's request.

The application TypeScript project includes only `src/**/*.ts`, `src/**/*.tsx`, `next-env.d.ts`, and generated Next.js types. External Playwright files and local verification scripts are excluded from the application build. Strict checking remains enabled; no Playwright dependency or `ignoreBuildErrors` setting is needed. Maintainer checks still run independently through `npm run verify` and `npm run verify:submission`.

## Publish

Open Publishing, choose **Autoscale**, and use the supplied commands:

- Build: `npm run build`
- Run: `npm run start`
- Internal port: `3000`; external port: `80`

The dev and start scripts explicitly bind `0.0.0.0:3000`, matching the Replit port mapping. Select Publish and use Replit's resulting HTTPS URL on applications. No local `.next` folder is needed in the ZIP; Replit creates it during the build. The API route requires a server, so use Autoscale rather than a static export.

## Optional server secrets

The deterministic grounded ambassador works without any secrets. To enable optional OpenAI answer-ID selection, add `OPENAI_API_KEY` as a Replit Secret for the workspace and the published app; optionally set `OPENAI_MODEL`. Never put the key in source, `.replit`, a public environment variable, or the ZIP.

`TRUST_PROXY` defaults to `false`. Enable it only after confirming the trusted ingress sets or appends the actual client IP as the rightmost `X-Forwarded-For` entry and direct access is disabled. Keep the default if the ingress chain has not been verified. The included rate limit is per process; use a platform/edge limit if enforcing a shared quota across Autoscale instances. Prompts and answers are not logged or saved by this application.

## Reproduce verification

```sh
npm ci
npm run build
npm run typecheck
npm run verify
npm run start
```

`npm run verify` additionally needs Python 3 with `pypdf` for PDF text/metadata scanning. It is a maintainer check, not a requirement to build, run, or deploy. Install that optional tool with `python3 -m pip install pypdf`, or point `PYTHON_BIN` at an existing Python environment. The public resume is already included. Optional PDF regeneration uses reportlab and pypdfium2 as documented in README.md.

## Single-click repository imports

A repository-specific import link requires this exact application source to be hosted in a GitHub repository. This export does not create or publish a GitHub repository. ZIP import works now; once the application is in a repository, Replit can import that repository through the same import page. No repository-specific import URL is claimed by this package.

## Contents and privacy

The package includes application source, npm lockfile, Replit/Nix configuration, Next.js and Tailwind configurations, source audit, verification scripts, and the public redacted resume. It excludes private original PDFs, all `.env*` files (including `.env.example`) and credentials, `.git`, `node_modules`, `.next`, QA images, temporary files, and alternate package-manager lockfiles. A SHA-256 checksum and file manifest accompany the ZIP.

Official references:

- Configuration: https://docs.replit.com/features/project-setup/configuration
- ZIP / repository imports: https://docs.replit.com/build/import-from-providers
- Deployment types: https://docs.replit.com/features/publishing/deployment-types

## GitHub import commands

Git is installed and its identity and credential helper are configured. The `gh` CLI is not installed, and GitHub authentication has not been verified. The application directory is not currently a Git repository. No push has been performed.

After creating an empty GitHub repository named `ashimcode/ashim-john-visual-resume`, run these commands. They use the sanitized ZIP as the repository source, so environment files, local QA files, and private source PDFs cannot be staged by accident. The ZIP must already exist at the path below.

```sh
set -e
mkdir /Users/ashimjohn/Documents/ashim-john-visual-resume
unzip -q '/Users/ashimjohn/Documents/Resume Webtie/replit-deploy.zip' -d /Users/ashimjohn/Documents/ashim-john-visual-resume
cd /Users/ashimjohn/Documents/ashim-john-visual-resume
git init -b main
git add .
git commit -m "Prepare visual resume for Replit"
git remote add origin https://github.com/ashimcode/ashim-john-visual-resume.git
git push -u origin main
```

Then import `https://github.com/ashimcode/ashim-john-visual-resume` through https://replit.com/import. The repository must exist and your GitHub HTTPS credentials must have push access. These commands are provided for you to run; this preparation task did not create the repository or upload the code.

The platform-managed Node module in `.replit` supplies Node and its matching libraries. `replit.nix` deliberately has no additional dependencies or `LD_LIBRARY_PATH` override. A legacy override injected an incompatible OpenSSL library during Replit's automatic package-install stage, before the application build command could run. Clearing the variable only inside that later build command cannot repair that earlier stage. Nix/deployment validation requires Replit; a successful Windows build alone does not prove deployment success.
