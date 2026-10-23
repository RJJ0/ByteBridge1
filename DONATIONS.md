# Donation integration

The donation frontend and Express payment API are included in this repository. Checkout is enabled only after the backend verifies the Stripe account can accept PHP card payments. The selected amount is always sent as integer centavos and verified against Stripe before confirmation.

## Configuration and startup

Use Node.js 24 or later. The backend uses Node's built-in SQLite support for webhook records.

Frontend `.env`:

```dotenv
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
VITE_API_URL=http://localhost:4242
```

Backend `server/.env`:

```dotenv
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_WEBHOOK_SECRET=
PORT=4242
FRONTEND_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
DONATION_MIN_AMOUNT=10000
DONATION_MAX_AMOUNT=10000000
```

Use publishable and secret keys from the same Stripe test account. Never put a secret key in any `VITE_` variable. Both `.env` files and `server/data/` are ignored by Git. Development rejects live secret keys. The existing credential values were preserved; the frontend API URL was added.

From the project root, run the API and frontend in separate terminals:

```sh
npm install --prefix server
npm start --prefix server
```

```sh
npm run dev
```

On Windows with restricted PowerShell execution, use `npm.cmd`. Backend dotenv loading is relative to `server/server.js`, so starting from the root works. Restart the API after updating `server/.env`; Vite must also reload after frontend environment changes. Stop any older backend still listening on port 4242 first.

## What enables Continue to payment

`GET /donation-config` authenticates with Stripe and checks the account country's supported PHP payment currency. Live keys additionally require `charges_enabled` and an active card-payments capability. Test keys allow sandbox checkout before live activation. Successful checks are cached for one minute. The route returns the configured bounds in centavos:

```json
{ "enabled": true, "currency": "php", "minAmount": 10000, "maxAmount": 10000000 }
```

These default application bounds mean PHP 100–100,000. Invalid keys, inactive live accounts, unsupported currency, and Stripe connection failures keep the button disabled. Production additionally requires a configured webhook signing secret. The integration uses `allowed_payment_method_types: ['card']`, matching the installed Stripe SDK/API. Adding other methods requires checking their PHP support and redirect behavior.

## Intent lifecycle

`POST /create-payment-intent` accepts:

```json
{ "amount": 25000, "currency": "php", "requestId": "a-client-generated-v4-uuid" }
```

The server validates a safe integer amount against its own bounds, enforces PHP, and creates an unconfirmed Stripe intent for the exact amount. The UUID scopes a Stripe idempotency key. Repeated requests with the same parameters reuse the intent; changed parameters with the same key fail. The response contains `clientSecret`, `amount`, and `currency` from Stripe. Responses are not cached, browser origins are restricted, request sizes are bounded, and API requests are rate limited. Stripe error objects and client secrets are never logged.

The frontend independently retrieves the intent through Stripe and checks amount, currency, and payable status before mounting Elements. Changing an amount immediately removes the old form, creates a new request ID, and debounces preparation. Late responses are ignored. Retries preserve the ID. Confirmation locks amount controls and guards against duplicate clicks, with another Stripe amount check immediately before submission. No raw card information is collected outside Stripe.

## Webhook and donation records

`POST /webhook` verifies `Stripe-Signature` against the unparsed raw body with `STRIPE_WEBHOOK_SECRET`. It handles this project's successful, processing, and failed PaymentIntent events, validating amount, currency, and test/live mode. SQLite atomically persists event IDs and donation records at `server/data/donations.sqlite` (override with server-only `DONATION_DATABASE_PATH`). Repeated events are deduplicated, older events do not regress status, and a succeeded donation cannot regress to failure. Failed writes return 500 so Stripe retries. Protect and back up the database directory on persistent storage before production; the local rate limiter is per server process.

For local webhook testing:

```sh
stripe listen --forward-to http://localhost:4242/webhook
```

Put the CLI's signing secret in `server/.env`, then restart the API. Complete an actual test donation to verify its corresponding webhook record. Generated CLI fixture events without `metadata.project=bytebridge` are intentionally ignored.

## Return route and hosting

`/payment-success` retrieves status directly through Stripe; a success URL parameter cannot prove a payment. The return secret is removed from the current URL and held in memory. Refreshing that page cannot reverify after removal and gives an unverified message. Browser status never creates a donation record.

Configure SPA fallbacks for `/about`, `/donate`, and `/payment-success`. Use HTTPS, explicit production frontend origins, a persistent database, and the correct live webhook endpoint before enabling live payments. Avoid logging payment-return query strings. The document referrer policy restricts outbound referrers.

## Verification

```sh
npm test --prefix server
npm run build
npm run lint
node scripts/donation-audit.mjs
```

The eight backend tests exercise API validation, exact amounts, Stripe idempotency, test/live account readiness, allowed origins, upstream errors, signed webhook verification, SQLite deduplication/status ordering, and persistence failures. These tests simulate Stripe responses. The donation browser audit also simulates payment behavior, including the unavailable API state.

`node scripts/stripe-checkout-audit.mjs` checks the real configured test backend and Stripe-hosted PaymentElement. It creates unconfirmed PHP 250 and PHP 350.50 test intents and verifies the form reloads with the selected amount. It never submits a payment. This real checkout check passed after configuring the matching test keys; no actual payment was completed. Reports omit client secrets and are written under ignored `artifacts/qa/`.

Stripe references: [PaymentIntent creation](https://docs.stripe.com/api/payment_intents/create), [PaymentIntents](https://docs.stripe.com/api/payment_intents), and [Country Specs](https://docs.stripe.com/api/country_specs).
