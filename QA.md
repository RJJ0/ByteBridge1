# Verification

## Stripe credential recheck and real checkout — October 23, 2026

- Updated local test keys now authenticate with Stripe. No secret is present in the frontend environment.
- Corrected test readiness to permit sandbox checkout before live activation; live activation checks remain enforced for live keys.
- Replaced the unsupported `payment_method_types` request parameter with `allowed_payment_method_types` for the installed Stripe API.
- The running `/donation-config` returns 200 with `enabled: true` and PHP bounds.
- Real browser verification passed: Continue to payment enabled, Stripe PaymentElement loaded and became ready for PHP 250, then a custom PHP 350.50 created a new matching intent and ready form. This verifies publishable/secret key compatibility without submitting payment.
- Eight backend tests, production build/TypeScript, and ESLint passed. Signed webhook fixtures are tested; actual Stripe webhook delivery and a completed test payment remain unverified.
- `scripts/stripe-checkout-audit.mjs` reproduces the real form check; `artifacts/qa/stripe-checkout-report.json` contains amount-only results and no client secrets.

## Configured backend integration

- Added the missing payment configuration API and replaced the fixed PHP 100 intent with validated frontend-selected amounts.
- Added Stripe idempotency, account/PHP card readiness checks, local-origin CORS, request limits, and secret-safe errors.
- Added raw-body signature verification and transactional SQLite donation records with event deduplication and status ordering.
- `npm.cmd test --prefix server`: seven backend tests passed using simulated Stripe responses and real webhook signing/SQLite persistence.
- `npm.cmd run build` and `npm.cmd run lint`: passed.
- Initially the running API responded with HTTP 503 and `enabled: false` because the configured key did not match Stripe's expected format. Credential setup and real form verification were subsequently completed as recorded above.
- Signed test webhook fixtures were verified locally; Stripe CLI delivery and a completed Stripe test payment were not tested.

## Donation integration — October 23, 2026

- `npm.cmd run build`: passed, including TypeScript checks.
- `npm.cmd run lint`: passed.
- Existing interaction audit: all 12 checks passed, preserving Home/About navigation, focus, mission scrolling, tips, menu behavior, reduced motion, fonts, and unknown-route recovery.
- Existing browser audit: all 16 Home/About layout cases passed, with no overflow, broken images, accessibility violations, runtime errors, or failed requests. Six existing axe scans passed.
- New `node scripts/donation-audit.mjs`: all eight grouped checks passed. Donation layout verified at 320, 375, 768, 1024, and 1440px; desktop and mobile axe scans reported no violations. Screenshots inspected at 1440px and 375px.
- Donation checks cover mobile active navigation/menu closing, page metadata, invalid custom amounts, centavo precision, unavailable checkout, and unverified payment return URLs.
- Simulated API/Stripe checks cover one initial request under StrictMode, exact request amount, removal of stale Elements, ignored late responses, Stripe amount mismatch blocking, retry request IDs, accessible declines, duplicate submission prevention, success, and processing locks. These use browser-only module/API interception; production code has no test mode bypass.
- No actual Stripe transaction was completed. Account-specific PHP support, real PaymentElement rendering, redirect payment methods, backend validation/idempotency, signature verification, and durable webhook donation records remain unverified because the repository has no payment backend. See `DONATIONS.md`.
- Reports and screenshots are in ignored `artifacts/qa/`. The browser tools were installed temporarily without changing `package.json` or `package-lock.json`.

## Earlier baseline

Verified on October 9, 2026 with the installed Google Chrome browser and a local Vite development server.

## Results

- `npm.cmd run build`: passed; includes TypeScript project checks and the production bundle.
- `npm.cmd run lint`: passed.
- Browser layout audit: 16 cases passed, including both pages at 320, 375, 390, 768, 1024, and 1440px, 844×390 landscape, and the open mobile menu on both pages.
- No horizontal document overflow, broken images, JavaScript runtime errors, or failed asset requests in the layout audit.
- Six axe accessibility scans: no reported violations against the selected WCAG A/AA rules; includes mobile and desktop on both pages and both open mobile menus.
- Reduced motion: both pages retain visible headings, disable significant animations, and use automatic scrolling.
- Twelve interaction checks passed: client-side navigation, page titles, focus management, direct About refresh, repeated and cross-route mission scrolling, keyboard-operated tips, mobile menu keyboard/Escape/outside click/resize, normal and reduced motion, local font loading, and unknown URL recovery.
- Nine team gallery checks passed: 1, 2, and 7 members at 320, 768, and 1440px. Missing/omitted photos fall back to initials; valid photos load; layout does not overflow. Fixtures were injected into the test browser only. The actual team array remains empty.
- Desktop and mobile screenshots of both pages were inspected.

## Reproducing the checks

See `README.md` for optional browser tooling and commands. Scripts are in `scripts/`; reports and screenshots are in the ignored `artifacts/qa/` directory.

Automated accessibility checks do not replace a full assistive-technology review. Safari, Firefox, physical mobile devices, and screen readers were not tested. Production hosting requires an SPA fallback to `index.html` for `/about` and other client-side URLs; no hosting deployment is included.
