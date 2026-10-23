# ByteBridge — new-chat handoff

Snapshot: October 23, 2026, Asia/Manila. Workspace: `C:\Users\Richard\Desktop\ByteBridge`. This document contains no credentials. It summarizes completed work; it is not authorization for additional changes.

## Start here

**Suggested opening message to the next Codex chat:**

> Read `HANDOFF.md` in this workspace, inspect current git status and applicable instructions, and use it as context. Preserve existing uncommitted work. The last homepage cleanup is complete; do not start another redesign or restore removed elements. Wait for my next task, or carry out the specific task I provide alongside this handoff. Never print `.env` values, secret keys, or Stripe client secrets.

User working style: implement requested changes directly, keep reasoning and final reports concise, avoid unnecessary questions, dependencies, exploration, and refactoring. Respect the latest task's scope; prior broad redesign permission does not authorize future unrelated changes. No subagents were used or requested.

## Current state / priorities

- React site and Express donation backend exist and work locally in Stripe **test mode**.
- Full dark/orange redesign is complete. A later, narrower homepage cleanup is also complete and supersedes earlier screenshots/design details.
- No unfinished implementation task, pending user approval, or active request remains at handoff creation. Latest request was to create this handoff.
- No payment has been submitted or completed by the agent. Real Stripe-hosted fields and unconfirmed test PaymentIntents were verified. Do not call that a successful donation transaction.
- ByteBridge is explicitly a **student-created nonprofit concept**. Preserve that disclosure. Never invent beneficiary counts, achievements, testimonials, registration, tax deductibility, or amount-to-impact guarantees.

## Repository / local state

- Git now exists; latest observed commit: `3a04507` — `add donation page and Stripe checkout`. Earlier conversation statements that no repository existed are obsolete.
- Current work is uncommitted. Before creating this file, modified paths were: `QA.md`, `index.html`, `public/favicon.svg`, `scripts/stripe-checkout-audit.mjs`, `src/components/Brand.tsx`, `src/pages/{About,Donate,Home}.tsx`, `src/styles/{about,animations,donate,global,home,navbar}.css`.
- Previously untracked: `DESIGN.md`, `scripts/redesign-audit.mjs`. This handoff is newly added. Recheck `git status --short`; do not reset, discard, commit, or overwrite user work without a relevant request.
- At handoff inspection, local listeners existed on **5173** (Vite) and **4242** (API). Do not assume they survive a new chat. Inspect before launching duplicates; Vite silently chooses 5174 when 5173 is occupied.
- Windows PowerShell. Prefer `npm.cmd` when script execution policies block `npm`.
- Node **24+** is required by the server's built-in SQLite store. Installed Node was v24.18.1.

## Stack / architecture

- Frontend: React 19, TypeScript 6, Vite 8, React Router 7, Lucide icons, plain CSS, locally hosted Inter + Plus Jakarta Sans. No Tailwind/UI framework/animation dependency.
- Stripe frontend: `@stripe/react-stripe-js` 7, `@stripe/stripe-js` 10. Lazy loader comes from **`@stripe/stripe-js/pure`**, avoiding Stripe network requests on unrelated pages.
- Backend: separate CommonJS package in `server/`; Express 5, cors, dotenv, Stripe Node SDK 23.0.1. Frontend package is ESM.
- `src/App.tsx`: BrowserRouter, metadata, route focus/hash scrolling, skip link, Navbar/Footer. `/` Home; `/about` About; `/donate` Donate; `/payment-success` verified status. Unknown routes redirect Home. Preserve these behaviors.
- `src/main.tsx`: React StrictMode; payment request effects account for StrictMode.
- `src/pages/Home.tsx`: hero → focus-area program rows → digital divide → mission → approach → closing CTA. Existing content and learning tips remain.
- `src/pages/About.tsx`: organization story, mission/vision, values, team/responsibilities. `src/data/team.ts` intentionally has no fabricated members; supports confirmed member fixtures/data.
- `src/components/{Navbar,Footer,Brand,ScrollReveal,ProgramCard,TeamCard}.tsx`: shared accessible components. Navbar has desktop/mobile links, inert closed menu, Escape/outside-click/resize/focus behavior. Program cards have keyboard-operable tip disclosures.
- `src/styles/global.css`: primary tokens, typography/buttons/focus/reduced motion. Page CSS: `home.css`, `about.css`, `donate.css`; shared `navbar.css`, `animations.css`, `fonts.css`. Some legacy class/token names (`blue`, `mint`, `navy`) remain but resolve to the current theme; do not mistake them for a request to restore old colors.
- Assets: `public/images/` includes actual existing illustrative learning photos; `public/fonts/`; `public/favicon.svg`. Credits: `ASSETS.md`.

## Design contract / latest homepage cleanup

Use `.agents/skills/frontend-ui-engineering/SKILL.md` when doing UI work; announce skill usage. Inspect applicable `AGENTS.md` if any appear. `DESIGN.md` records the broader reference adaptation; current source and the latest cleanup below take precedence.

- Palette: canvas `#0D0D0D`, sections `#171717`, cards `#202020`, accent `#FF9F0A`, accent hover `#FFB340`, primary text `#F5F5F5`, secondary text `#A3A3A3`. Orange controls use dark text. Semantic tokens include `--canvas`, `--surface`, `--card`, `--accent`, `--text-primary`, `--text-muted`, `--text-on-accent`, `--border`.
- Visual identity: pill navbar/buttons, oversized headings with orange phrases, orange-framed learning photo, stacked numbered program rows with orange Online Safety feature, paired About panels, dark donation controls and Stripe fields.
- Motion: CSS/IntersectionObserver reveals about 450–600ms, microinteractions about 180–220ms, reduced-motion support, no continuous hero drift.
- **Most recent code task changed only `src/pages/Home.tsx` and `src/styles/home.css`:**
  1. Hero badge still says “Empowering Through Technology”; only its leading dot was removed, using scoped `.hero-copy .eyebrow::before { display: none; }` and zero gap. Other eyebrow dots remain.
  2. Removed the outlined **Discover Our Mission** hero button. Remaining hero actions: **Make a Donation → `/donate`**, **About Us → `/about`**. Preserve destinations.
  3. Removed entire hero student-led/group-icon footnote.
  4. Removed floating “Knowledge opens doors.” card and its icons/description/arrow.
  5. Removed entire bottom hero navigation strip (label, three focus links, icons, border/container).
  6. Removed associated CSS across breakpoints; adjusted hero/action/image spacing. Main hero photo, orange frame, caption, sticker, other decorations, navbar, focus section, and all other sections remain.
- Do **not** restore those removed items based on older reference material. Most recent screenshots: `artifacts/qa/home-cleanup-{375,1440}.png`.

## Donation frontend — preserve invariants

- `src/pages/Donate.tsx`: layout, readiness fetch, amount selection, keyed intent preparation/Elements. Presets PHP 100/250/500/1,000; decimal custom input parsed to integer centavos. Server supplies actual limits.
- `src/lib/payments.ts`: lazy Stripe singleton, API URL, currency formatting, exact-centavo parser. Development requires a `pk_test_` key.
- `src/components/Donation.tsx`: actual PaymentElement, readiness, pre-confirmation Stripe amount/currency verification, submission mutex, parent amount lock, accessible loading/error/success/processing states. Keep default PaymentElement layout; a temporary explicit tabs experiment was reverted.
- Flow: GET config → select valid amount → **Continue to payment** → POST `{amount,currency:'php',requestId}` → verify response and retrieve real Stripe intent → mount Elements with client secret. Starting checkout is explicit; subsequent amount changes debounce 350ms, remove old Elements immediately, generate a new UUID, and ignore aborted/late responses. Retry preparation keeps the UUID. Fetch timeout: 15s.
- Displayed amount, server response, Stripe intent amount, and pre-confirmation amount must match. Never weaken validation to merely enable the button. Never collect raw card details outside Stripe.
- Locks prevent repeated submissions; terminal states and ambiguous thrown network failures remain locked. Confirmation uses `redirect:'if_required'` and `${window.location.origin}/payment-success`.
- Stripe Appearance: `night`, dark background/text, orange primary; this is presentation only.
- `PaymentSuccess.tsx` calls `retrievePaymentIntent`, never trusts claimed success parameters, removes return query from history, keeps secret in memory. Refresh after query removal gives honest unverified status. Browser status does not create donation records.

## Backend / credentials / API

- Read `DONATIONS.md` for full configuration. Root `.env`: **`VITE_STRIPE_PUBLISHABLE_KEY`**, **`VITE_API_URL=http://localhost:4242`**. Backend `server/.env`: **`STRIPE_SECRET_KEY`**, optional/configure **`STRIPE_WEBHOOK_SECRET`**, `PORT`, `FRONTEND_ORIGINS`, `DONATION_MIN_AMOUNT`, `DONATION_MAX_AMOUNT`, optional `DONATION_DATABASE_PATH`, `NODE_ENV`.
- Matching test keys were corrected by the user and authenticated successfully; a real browser verified their compatibility. The earlier “invalid 99-character keys” blocker is resolved. Do not request keys again unless fresh evidence requires it. Never print/commit env values or client secrets. A mistakenly added frontend `VITE_STRIPE_SECRET_KEY` was removed. Keep secrets server-only.
- `.gitignore`: ignores `.env`/`.env.*` except examples, `node_modules/`, `dist/`, `artifacts/`, `server/data/`. Keep credentials out of handoffs/artifacts.
- `server/server.js` loads dotenv relative to `__dirname`; can start from root. Listens on 127.0.0.1:4242 by default. CORS allowlists localhost:5173 and 127.0.0.1:5173; explicit origin rejection; JSON limits, no-store responses, per-process/IP rate limiter (120 requests/15min).
- GET `/donation-config`: authenticates Stripe + checks account-country PHP support; readiness cache 60s. Default min/max **10000–10000000 centavos** (PHP 100–100,000). **Test mode must not require live `charges_enabled`/active card capability**; the user's test account can create test intents before live activation. Live keys still require both; production requires webhook secret. Invalid/unavailable readiness returns 503 and disables checkout.
- POST `/create-payment-intent`: validates integer bounds, PHP currency, v4 UUID; Stripe idempotency key `bytebridge-donation-${requestId}`. Creates unconfirmed exact-amount intent with `metadata.project='bytebridge'`, `metadata.request_id`. Returns `{clientSecret,amount,currency}` from Stripe after amount/currency/mode checks. Changed params with reused ID → 409; safe failures without raw Stripe logs.
- **Installed Stripe API requires `allowed_payment_method_types:['card']`.** Old `payment_method_types` creation parameter was actually rejected by Stripe. Do not revert. Verify current official docs/installed SDK if changing APIs.
- POST `/webhook`: raw body BEFORE express.json; Stripe signature verification; successful/processing/failed events for this project only; amount/currency/mode checks. `server/donation-store.js` uses `node:sqlite` with WAL and transactions to deduplicate event IDs and upsert intent records without regressing succeeded status. DB defaults `server/data/donations.sqlite`; failed writes return 500 for Stripe retries.
- Local webhook command: `stripe listen --forward-to http://localhost:4242/webhook`; configure signing secret locally and restart. Real webhook delivery and full transaction completion are **unverified**. Signature/SQLite behavior is tested with fixtures. No production-readiness claim; deployment needs persistent DB, correct live setup, HTTPS/origins, SPA fallbacks, etc.

## Commands / testing

From workspace root, separate terminals:

```powershell
npm.cmd run dev                           # Vite; normally 5173
npm.cmd start --prefix server              # API; normally 4242
# Or npm.cmd run dev --prefix server       # backend watch
npm.cmd run build                         # tsc -b + Vite production build
npm.cmd run lint
npm.cmd test --prefix server               # 8 backend tests
```

If dependencies are missing: root `npm.cmd install`; server `npm.cmd install --prefix server`. Optional browser QA packages were installed with `npm.cmd install --no-save --package-lock=false playwright @axe-core/playwright`; they are not application dependencies. QA scripts use installed Chrome at `C:/Program Files/Google/Chrome/Application/chrome.exe`; most support `CHROME_PATH`/`BASE_URL`. Read individual scripts before running.

**Verification history / caveats (do not imply all were rerun for the latest cleanup):**

- Latest homepage cleanup: build incl. TypeScript + lint passed; browser checked absence of removed items, scoped badge dot removal, three retained focus cards, image/actions non-overlap and no horizontal overflow at 320/375/768/1024/1440; donation click and About keyboard navigation passed; no runtime errors. Screenshots inspected at 375/1440. Ad hoc check: ignored `artifacts/qa/home-cleanup.cjs`.
- Prior full redesign: `scripts/redesign-audit.mjs` passed **32 cases** (4 routes × 8 widths: 320/375/430/768/1024/1280/1440/1920), eight page axe scans + one mobile menu scan, no overflow/broken images/runtime errors. `scripts/donation-audit.mjs` passed eight grouped simulated payment/state checks.
- `scripts/stripe-checkout-audit.mjs` passed real test backend + visible hosted-field checks for PHP 250 and custom PHP 350.50. **Creates unconfirmed test intents, never submits payment**. Uses keyboard custom selection after scrolling in Stripe frames to avoid a sticky-header/automated-pointer timing issue observed during audit. Screenshots temporarily disable sticky positioning only in the test page; production CSS is unchanged. Reports omit secrets.
- Eight backend tests passed after API/readiness fixes: validation, exact amounts, idempotency, test/live readiness, CORS, safe failures, signed webhook verification, SQLite ordering/deduplication, persistence failure retries. They simulate Stripe API responses.
- **Known stale test:** `scripts/interaction-audit.mjs` previously passed all 12 checks, but now still clicks the intentionally removed “Discover Our Mission” hero link around line 38. Its failure there is an outdated expectation, not a request to restore UI. Update that test only if relevant to the next task. Do not report it as freshly passing after cleanup.
- `scripts/browser-audit.mjs` is the older Home/About audit; `scripts/team-audit.mjs` uses browser-only team fixtures. `scripts/donation-audit.mjs` explicitly mocks unavailable config for deterministic checks even when the real API works.
- `QA.md` is historical: older sections say backend missing/keys invalid/UI has removed elements. Newer source, this handoff, and latest user instructions supersede them. The latest cleanup is documented here rather than editing unrelated docs in that task.

## Tooling / resume guidance

- Stripe requests from sandboxed Node/browser commands previously failed with `StripeConnectionError`/`EACCES` or `ERR_NETWORK_ACCESS_DENIED`; network-enabled escalation made the same checks pass. Do not diagnose sandbox denial as invalid credentials or change production code to bypass readiness. Use the available approval mechanism if needed.
- Restart server after backend env/code changes; let Vite reload frontend env. Inspect the port owner before stopping a process; previous old `node server.js` instance served obsolete routes until restarted.
- Use `rg` for discovery. Preserve the user's current files and scope. No need to rerun every historical audit for a minor task. Never submit a payment, publish/deploy, send messages, or alter unrelated pet/account settings based solely on this handoff.
- A one-off unrelated ChatGPT pet lookup found only built-ins, active Dewey; no pet was edited. It has no bearing on this project.
