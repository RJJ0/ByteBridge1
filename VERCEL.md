# Deploy ByteBridge on Vercel

Use two projects connected to this repository. Keep Stripe in test mode for the student demo.

## Current deployment

Deployed and verified on October 23, 2026:

- Frontend: https://byte-bridge1.vercel.app
- Express API: https://byte-bridge1-dglp.vercel.app
- Database: Neon free plan, `bytebridge-donations`, connected to backend production.
- Stripe: test mode, with the deployed `/webhook` endpoint configured.

The public Donate button, preset and custom amount payment forms, a PHP 100 test payment, webhook storage, and the success page with refresh were verified. No real money moved. Preview environments do not have the production database connection or an allowed preview frontend origin; test checkout using the public production frontend above.

The deployment used the current local files through Vercel CLI. Commit and push these changes before relying on future Git-triggered deployments. For manual updates from the repository root:

```sh
npx vercel deploy --prod --yes --project byte-bridge1-dglp --scope bytebridge1
npx vercel deploy --prod --yes --project byte-bridge1 --scope bytebridge1
```

| Setting | Frontend | Backend |
| --- | --- | --- |
| Root directory | Repository root (`.`) | `server` |
| Framework | Vite | Express |
| Build command | `npm run build` | Framework default |
| Output | `dist` | Framework default |
| Node.js | 24.x | 24.x |

The root `vercel.json` supports refresh and direct visits to `/donate` and `/donation/success`. The backend has a separate configuration.

## Database and backend

Create a hosted PostgreSQL database, for example using Neon through Vercel Marketplace. Connect it to the **backend** project. Use its pooled connection string with TLS as `DATABASE_URL`. Keep passwords and keys in Vercel environment settings, never in Git or chat.

Set these backend variables:

```dotenv
STRIPE_SECRET_KEY=sk_test_REPLACE_WITH_EXISTING_TEST_KEY
DATABASE_URL=REPLACE_WITH_PROVIDER_POOLED_POSTGRES_URL
FRONTEND_ORIGINS=https://YOUR_FRONTEND.vercel.app
STRIPE_WEBHOOK_SECRET=REPLACE_AFTER_CREATING_STRIPE_ENDPOINT
```

Use exact frontend origins without trailing slashes, comma separated if needed. Explicitly add preview origins when testing previews. Deploy the backend and note its stable HTTPS URL.

Tables are created automatically during the first availability check; the database user needs permission to create tables. Production checkout requires storage, webhook configuration, and Stripe verification. Local development continues to use SQLite when `DATABASE_URL` is absent.

## Stripe webhook

In Stripe's test environment, create a webhook endpoint at `https://YOUR_BACKEND.vercel.app/webhook`. Subscribe to:

- `payment_intent.succeeded`
- `payment_intent.processing`
- `payment_intent.payment_failed`

Copy that endpoint's signing secret into backend `STRIPE_WEBHOOK_SECRET`, then redeploy. A local Stripe CLI signing secret is different from the deployed endpoint secret. Stripe must be able to reach the backend without Vercel login or deployment protection; use the public production domain.

## Frontend

Set these variables on the frontend project, then redeploy:

```dotenv
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_REPLACE_WITH_MATCHING_TEST_KEY
VITE_API_URL=https://YOUR_BACKEND.vercel.app
```

Copy only the publishable key from the local root `.env`. The secret key in `server/.env` belongs only on the backend. Vite embeds variables at build time, so changing them requires a new frontend build. Never use localhost for the deployed API URL.

## Verify

1. Open backend `/donation-config`. Expect HTTP 200 and `enabled: true`.
2. Open frontend `/donate` directly and refresh. Donate should become enabled.
3. Choose an amount and confirm the Stripe form loads with that amount.
4. Complete a test payment with `4242 4242 4242 4242`, a future expiry, and any CVC. Verify the success page and refresh it.
5. Confirm Stripe webhook delivery returned HTTP 200 and PostgreSQL has the corresponding `donations` row with `status = 'succeeded'`.

Local checks: `npm test --prefix server`, `npm run build`, `npm run lint`. PostgreSQL unit tests simulate connections; actual hosted-database writes and webhook delivery require deployment verification.

The in-memory API rate limiter applies per function instance. Configure platform rate limits before enabling real payments. This setup retains test keys; real payments require separate live-account and webhook configuration.

References: [Express on Vercel](https://vercel.com/docs/frameworks/backend/express), [Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite), [PostgreSQL transactions](https://node-postgres.com/features/transactions).
