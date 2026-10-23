# ByteBridge

A responsive nonprofit concept created for a student project. Built in React + TypeScript + Vite, with Home (`/`), About Us (`/about`), Donation (`/donate`), and a Stripe payment status return route (`/payment-success`).

Donation setup and payment limitations are documented in [DONATIONS.md](DONATIONS.md). The Express API is in `server/`; start it with `npm start --prefix server` using Node.js 24+. Online checkout remains unavailable until matching Stripe test keys are configured and the API verifies PHP card-payment support.

## Run locally

```sh
npm install
npm run dev
```

Open the local URL printed by Vite (normally http://localhost:5173).

On Windows PowerShell with script execution restricted, use `npm.cmd` in place of `npm`.

```sh
npm run build
npm run lint
npm run preview
```

The build command checks TypeScript before creating `dist/`. For production hosting, configure the host to serve `index.html` for application routes such as `/about`. Vite development and preview servers already support these routes.

## Project map

- `src/App.tsx`: routes, page titles, descriptions, hash scrolling, and route focus.
- `src/pages/Home.tsx`: six homepage sections and practical learning tips.
- `src/pages/About.tsx`: story, mission, vision, values, student responsibilities, and team.
- `src/components/`: shared navigation, footer, original SVG brand, skill cards, team cards, and Intersection Observer reveals.
- `src/data/team.ts`: actual member information; intentionally empty until confirmed details are available.
- `src/styles/global.css`: palette, typography, spacing, buttons, and accessibility defaults.
- `src/styles/home.css`, `about.css`, `navbar.css`, `animations.css`: component and page styling.
- `public/images/`: locally stored, compressed photographs. Credits and licenses are in `ASSETS.md`.
- `public/favicon.svg`: ByteBridge brand mark.
- `public/fonts/` and `src/styles/fonts.css`: locally hosted Google Fonts with open font licenses and system fallbacks.
- `index.html`: document metadata and font preloading.

## Add the actual team

Edit `src/data/team.ts`. Copy its commented object structure into the `teamMembers` array, replacing the example values with a confirmed member's name, role, short biography, and unique ID. Put approved photos in `public/images/team/` and use a path such as `/images/team/member-photo.jpg`.

The About page automatically switches from its student responsibilities introduction to a responsive gallery. An omitted or unavailable portrait displays the member's initials. The grid supports one, several, or many members without layout changes.

## Interaction and accessibility

- Sticky desktop navigation and a mobile disclosure menu with Escape, outside-click, resize, and focus behavior.
- Client-side page navigation, active links, skip link, and accessible section scrolling.
- Skill cards with keyboard-operable learning tips, without creating additional pages.
- CSS entrance and hover animations plus progressive Intersection Observer reveals.
- Reduced-motion support, visible keyboard focus, semantic sections, and descriptive image text.
- Responsive layouts from 320px through desktop.

## Dependencies

The application uses React Router, Lucide icons, Stripe.js, and React Stripe.js. Styling uses vanilla CSS; no UI or animation framework is required.

## Browser verification

Browser checks are in `scripts/`. These optional development tools are not saved as application dependencies. To rerun them:

```sh
npm install --no-save --package-lock=false playwright @axe-core/playwright
npm run dev
```

In another terminal:

```sh
node scripts/browser-audit.mjs
node scripts/interaction-audit.mjs
node scripts/team-audit.mjs
node scripts/donation-audit.mjs
```

Scripts use the existing Windows Chrome installation. Set `CHROME_PATH` to an alternative executable and `BASE_URL` to another running development URL when needed. Reports and screenshots are written into `artifacts/qa/`. Team fixture data is intercepted only in the test browser; it never changes the real team file.

## Scope and later refinements

ByteBridge is presented honestly as a proposed, student-created initiative. The donation page can accept payments only after the included payment backend and matching Stripe keys have been configured; payment details are collected through Stripe Elements. The site does not provide accounts or claim completed programs. Stock photographs illustrate learning and are not team portraits or evidence of real activities.

Next refinements can include approved team details and original project photography, or adjustments to image crops and typography based on your preferred visual direction. Photographs and both fonts are hosted locally; the site does not depend on external asset requests.
