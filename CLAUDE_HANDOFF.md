# ByteBridge handoff for Claude

Snapshot: October 23, 2026, Asia/Manila. Workspace: `C:\Users\Richard\Desktop\ByteBridge`. Shell: Windows PowerShell.

## Start here

Read this file, `VERCEL.md`, applicable repository instructions, and current `git status --short` before making changes. Preserve existing work. The Vercel deployment task is complete; wait for the user's next task. This document provides context, not permission for additional account changes or payments.

`HANDOFF.md` is an older design/local-development snapshot. Its claims that the project only works locally, that no payment was completed, and that there are eight backend tests are stale. This handoff and `VERCEL.md` supersede those claims. Retain the older handoff's design history where it agrees with current source.

User preferences: act directly within the requested scope, communicate briefly, avoid unnecessary confirmation and refactoring. Do not start another redesign or restore previously removed homepage elements. No subagents were requested or used.

## Completed work

The user reported that Donate was unavailable. The local API was not running; sandbox network restrictions also blocked Stripe verification. Starting the API with network access enabled checkout. Do not weaken payment checks to compensate for a stopped API or restricted network.

The user then requested Vercel deployment. The frontend and Express backend were prepared, configured, deployed, and verified. The user signed into Vercel, confirmed Neon terms acceptance, and explicitly approved transferring the existing Stripe test secret into Vercel secrets and creating the deployed test webhook. Those setup actions are complete; do not repeat them unnecessarily.

## Live deployment

| Component | Configuration |
| --- | --- |
| Vercel team/scope | `bytebridge1` |
| Frontend project | `byte-bridge1`, repository root, Vite, Node 24.x |
| Frontend URL | https://byte-bridge1.vercel.app |
| Backend project | `byte-bridge1-dglp`, root directory `server`, Express, Node 24.x |
| Backend URL | https://byte-bridge1-dglp.vercel.app |
| Database | Neon free plan, `bytebridge-donations`, region `iad1` |
| Webhook | https://byte-bridge1-dglp.vercel.app/webhook |
| Payment mode | Stripe test mode only; no real money moved |

The backend's production environment is connected to Neon. The frontend API URL points to the deployed backend. Backend `FRONTEND_ORIGINS` allows the public frontend origin. Public production domains were reachable without login; deployment-specific preview URLs may require Vercel authentication. Preview checkout is not configured: preview environments lack the production database connection and an allowed preview frontend origin.

Deployment used local files through Vercel CLI. **The deployment changes remain uncommitted and unpushed.** A Git-triggered deployment from older source could lose the fixes. Commit/push only as appropriate to the user's next request; do not reset or discard work.

Latest observed commit: `b1e51cc` (`Initial commit of full project source`). Recheck before relying on it.

## Architecture and changed files

- Frontend: React 19, TypeScript, Vite, React Router, plain CSS, Stripe Elements. Existing dark/orange UI was preserved.
- Backend: CommonJS package under `server/`; Express, Stripe SDK, dotenv, cors, and newly added `pg`.
- Root `vercel.json`: Vite build/output and SPA rewrite, including direct navigation and refresh on payment return routes.
- `server/vercel.json`: Express framework configuration.
- `server/server.js`: exports the Express app for Vercel and preserves `createApp` for tests; local startup still listens on port 4242. Awaits asynchronous webhook writes. Production availability requires configured webhook and persistent storage; storage readiness is checked before enabling checkout.
- `server/postgres-store.js`: PostgreSQL schema initialization, pooled connections, transactional event deduplication and donation updates, rollback/release on failure. Successful donations cannot regress to failure; stale events cannot regress newer status.
- `server/donation-store.js`: existing SQLite store retained for local development without `DATABASE_URL`. Production does not fall back to ephemeral SQLite.
- `server/package.json` and lockfile: `pg` dependency; test command includes `*.test.js`.
- `server/postgres-store.test.js`, `server/server.test.js`: storage transaction/error tests and production readiness checks. PostgreSQL unit tests simulate connections; deployed webhook persistence was separately verified against Neon.
- `.env.example`, `server/.env.example`: placeholder configuration only.
- `.vercelignore`, `server/.vercelignore`, `.gitignore`: exclude local credentials, deployment metadata, and generated artifacts.
- `VERCEL.md`, `README.md`, `DONATIONS.md`: deployment setup and current hosting details.

Recheck Git status for the complete current list; the user may make further changes.

## Environment and credentials

Never print, paste, commit, or put secret values into handoffs. Never expose a secret key through a `VITE_` variable.

- Root `.env`: local frontend `VITE_STRIPE_PUBLISHABLE_KEY` and `VITE_API_URL`; the local API URL was preserved.
- Root `.env.local`: generated by Vercel link. It may contain a Vercel OIDC token. It is local tooling configuration, not the deployed backend configuration. Keep it ignored and do not display its values.
- `server/.env`: existing local Stripe test secret. A deployed webhook secret was not copied into this file.
- Vercel frontend: `VITE_STRIPE_PUBLISHABLE_KEY` is public Config; `VITE_API_URL` is Config. Vite embeds both at build time.
- Vercel backend: `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` are Secrets; `FRONTEND_ORIGINS` is Config. Neon supplies `DATABASE_URL` and related provider variables in production.
- `.vercel/project.json`: local link points to the frontend. Use an explicit `--project` when deploying the backend from the repository root.
- Temporary pulled database credentials and the temporary local webhook secret copy were deleted after verification. The deployed values remain in Vercel.

Vercel CLI authentication was completed in this session; check authentication before assuming it persists. Vercel may redact sensitive values when pulling environment files. Do not overwrite real secrets with pulled `[SENSITIVE]` placeholders.

## Verification completed

- `npm.cmd test --prefix server`: **14 tests passed**.
- `npm.cmd run build`: TypeScript and Vite build passed.
- `npm.cmd run lint`: passed.
- Public backend `/donation-config`: HTTP 200 with `enabled: true`, PHP currency, and configured bounds.
- `scripts/stripe-checkout-audit.mjs` against the public frontend: Donate enabled; real Stripe-hosted form loaded for PHP 250 and custom PHP 350.50. This script creates unconfirmed test intents and does not submit payments.
- A separate PHP 100 **test** PaymentIntent was created through the deployed backend and confirmed using Stripe's built-in `pm_card_visa` test method. This was an API test, not a browser card submission.
- Deployed `/donation-status` verified that test payment as succeeded with the correct amount.
- Stripe's actual webhook persisted the succeeded donation in hosted PostgreSQL.
- Browser opened the deployed success page for that verified payment; the Thank You state survived refresh.

Reports: `artifacts/qa/vercel-deployment-report.json` and `artifacts/qa/stripe-checkout-report.json`. Browser artifacts and one-off helper scripts under `artifacts/` are ignored. The temporary deployment helpers are not reusable automation: some depended on deleted secret files. Read before running; do not rerun a helper that submits another payment unnecessarily.

## Commands

```powershell
# Local development, separate terminals
npm.cmd run dev
npm.cmd start --prefix server

# Checks
npm.cmd test --prefix server
npm.cmd run build
npm.cmd run lint

# Deploy only when relevant to the user's request
npx.cmd --yes vercel deploy --prod --yes --project byte-bridge1-dglp --scope bytebridge1
npx.cmd --yes vercel deploy --prod --yes --project byte-bridge1 --scope bytebridge1
```

Use Node 24+. Check existing listeners before starting duplicate services. Sandboxed network failures such as `EACCES` do not prove credentials are invalid; use the environment's network approval mechanism when needed. Automatic approval initially rejected Stripe credential transfer/webhook creation; the user then explicitly approved that exact setup and it succeeded.

## Remaining considerations

No deployment failure or pending approval remains. Keep payments in test mode unless the user explicitly requests and authorizes a live-payment rollout. The API's in-memory rate limiter is per function instance; global production abuse controls would require additional work before accepting real money. Do not add paid services or upgrade the free Neon plan without authorization.

Preserve integer-centavo validation, Stripe amount/currency/status checks, idempotency, webhook signatures, awaited durable writes, and signed read-only success references. Do not trust payment status or amounts supplied in URL parameters.

ByteBridge remains a student-created nonprofit concept. Preserve its disclosure and do not invent beneficiaries, achievements, nonprofit registration, or tax deductibility.
