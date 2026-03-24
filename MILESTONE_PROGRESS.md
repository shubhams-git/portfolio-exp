# Milestone Progress

Temporary handoff document for the portfolio build. Keep this file up to date while the project is in flight, and delete it during final cleanup once the portfolio is complete.

## Purpose of This File

This file exists so a new AI model or engineer can continue the work without reconstructing the full history from chat. It should be read together with:

- `README.md` at the repo root
- the current codebase in `frontend` and `backend`
- the PRD reference bundle in `stitch_the_layered_matrix_prd`

## Product Summary

The product is a premium, recruiter-facing full-stack portfolio for `Shubham Sharma`, built around the "Layered Matrix" design direction.

Core intent:

- sell early-career but high-signal full-stack engineering capability
- make recruiter scanning easy
- show practical AI integration without looking like an empty design template
- keep the interface dark, grid-led, dense, and credible rather than flashy

Primary audience:

- engineering managers
- CTOs
- technical recruiters

Canonical source of truth:

- the written frontend PRD is the source of truth for content, IA, tone, and section purpose
- the HTML files and screenshots in `stitch_the_layered_matrix_prd` are visual references for spacing, hierarchy, and atmosphere

## Non-Negotiable Design Requirements

These requirements should continue to guide implementation:

- monochrome-first palette: `#050505`, `#0F0F11`, `#FFFFFF`, `#A1A1AA`, `#27272A`, `#E4E4E7`
- strong 1px structural grid lines
- no rounded-card language; corners stay sharp
- typography split:
  - display: Clash Display
  - body: Switzer
  - technical/meta: JetBrains Mono
- motion stays restrained:
  - subtle scaling
  - opacity fades
  - no noisy continuous animation
- technical credibility is the primary content
- the portfolio should feel premium, but recruiter clarity wins over drama

## Actual Stack in the Repo

The user explicitly rejected Next.js. The actual stack is now:

- frontend: Vite + React + TypeScript + React Router + plain CSS
- backend: Express + TypeScript

There is no Python backend anymore. FastAPI was removed earlier and replaced with Express.

## Current Repo Shape

High-level structure:

- `frontend`
  - React app
  - routed portfolio UI
  - design tokens and layout styles in CSS
  - typed content model powering the homepage and project pages
- `backend`
  - Express API
  - contact-form endpoint
  - health endpoint
  - env parsing with Zod
  - API tests with Vitest + Supertest
- `stitch_the_layered_matrix_prd`
  - reviewed PRD assets, HTML mock sections, and screenshots

Important frontend files:

- `frontend/src/main.tsx`
- `frontend/src/App.tsx`
- `frontend/src/App.css`
- `frontend/src/index.css`
- `frontend/src/content/portfolio-content.ts`
- `frontend/src/types/portfolio.ts`
- `frontend/src/lib/portfolio.ts`
- `frontend/src/lib/seo.ts`
- `frontend/src/pages/HomePage.tsx`
- `frontend/src/pages/ProjectPage.tsx`
- `frontend/src/components/SiteHeader.tsx`
- `frontend/src/components/SiteFooter.tsx`
- `frontend/src/components/QuickPreviewModal.tsx`
- `frontend/src/components/ProjectVisual.tsx`
- `frontend/src/components/ScrollToTop.tsx`

Important backend files:

- `backend/src/server.ts`
- `backend/src/app.ts`
- `backend/src/config/env.ts`
- `backend/src/routes/health.ts`
- `backend/src/routes/contact.ts`
- `backend/tests/api.test.ts`

## Implemented Milestones

### Milestone 1: Foundation

Objective:

- establish the full-stack baseline
- set up design tokens and content structure
- render a first homepage shell from real content

Completed:

- reviewed every relevant PRD artifact in `stitch_the_layered_matrix_prd`
- settled on React + TypeScript frontend instead of Next.js
- scaffolded `frontend` with Vite
- scaffolded `backend` with Express + TypeScript
- added the initial CSS variable design system
- added typed portfolio data structures
- rendered the homepage from real content instead of hardcoded placeholder sections

Verification performed:

- frontend: `npm run build`
- frontend: `npm run lint`
- backend: `npm run build`
- backend: `npm test`

### Milestone 2: Hero / Work / Quick Preview

Objective:

- turn the top half of the homepage into the first production-quality pass
- introduce the project preview interaction

Completed:

- refined the hero composition
- added the atmospheric right-hand panel in the hero
- upgraded project cards with denser metadata
- added a quick preview modal
- added close-on-backdrop, close button, `Escape` handling, and body scroll locking

Verification performed:

- frontend: `npm run build`
- frontend: `npm run lint`

### Milestone 3: Stack / About / Contact

Objective:

- finish the lower half of the homepage
- replace placeholders with a live contact flow

Completed:

- updated identity to the user's real name: `Shubham Sharma`
- refined the technical stack section
- refined the about / portrait-void section
- wired the terminal contact form to the Express backend
- added client-side validation, API submission, and success/error states

Verification performed:

- frontend: `npm run build`
- frontend: `npm run lint`
- backend: `npm run build`
- backend: `npm test`

### Milestone 4: Routed Case Studies

Objective:

- turn project exploration into a proper routed experience

Completed:

- added `react-router-dom`
- converted the app into a routed shell
- created dedicated project pages at `/projects/:slug`
- extended the project data model for case-study content
- connected project cards and modal CTA to project routes
- added previous / next project traversal
- added return-to-matrix navigation

Verification performed:

- frontend: `npm run build`
- frontend: `npm run lint`

### Milestone 5: Route Polish / Metadata / Recruiter Readability

Objective:

- make the routed experience feel more polished and standalone
- improve recruiter-facing detail pages

Completed:

- added route scroll restoration via `ScrollToTop`
- added a route-enter shell transition
- made the header route-aware
- added in-app metadata updates for the homepage and project pages
- refined project-page content with recruiter highlights and better structure

Verification performed:

- frontend: `npm run build`
- frontend: `npm run lint`

## Post-Milestone Fixes Already Applied

### Hero Alignment / Overflow Fix

The user reported a visible alignment issue using a live screenshot plus the Pesticide Chrome extension overlay.

Problem found:

- hero left-column content was effectively pushing beyond its intended grid track
- the oversized display title and some grid children did not shrink correctly

Fix applied:

- reduced the hero title max size
- rebalanced the hero grid columns and gap
- added `min-width: 0` to grid/flex children that needed to shrink
- added `max-width: 100%` safeguards to key layout containers

Areas specifically hardened:

- hero title/content
- CTA row
- work/stack section headers
- modal panel
- about content
- terminal link row

Verification performed:

- frontend: `npm run build`
- frontend: `npm run lint`

## Current Product Behavior

### Frontend

The current React app already supports:

- routed homepage at `/`
- routed project deep-dives at `/projects/:slug`
- shared site header and footer
- section anchors for `work`, `stack`, `about`, and `contact`
- project quick preview modal from homepage cards
- data-driven rendering from `frontend/src/content/portfolio-content.ts`
- route-based metadata updates with canonical, OG, and Twitter tags
- contact form submission to the Express API with persisted receipts

Current homepage sections:

- Hero Terminal
- Work Matrix
- Technical Arsenal
- Portrait Void
- Terminal Contact

Current project page sections:

- hero / headline
- project context
- recruiter readout
- challenge
- metrics
- architecture
- implementation detail
- abstract image stage
- previous / return / next navigation

### Backend

Current API behavior:

- `GET /` returns a simple service status object
- `GET /api/health` returns `{ "status": "ok" }`
- `POST /api/contact` validates `name`, `email`, and `message`
- successful contact submission returns a `202 accepted` response with a receipt id
- accepted submissions are stored in an append-only NDJSON file
- repeated submissions are rate-limited per client IP

Validation details:

- `name`: min 2, max 100
- `email`: validated as an email
- `message`: min 10, max 4000

## Data / Content Model Notes

The content model is centralized in `frontend/src/content/portfolio-content.ts`.

It currently includes:

- site title
- person identity and value proposition
- navigation links
- hero actions
- featured projects
- project preview data
- project case-study data
- technical stack categories
- experience timeline
- contact links

This is currently the main source of portfolio content across homepage, modal, footer, and project pages.

## Current Known Limitations

These are important so the next model does not mistake the current build for final production polish.

### Content / Links

- the resume CTA is wired to a static HTML resume artifact because no source PDF was provided in the repo
- `GitHub`, `LinkedIn`, and `Source Code` links route to contact as "on request" because no verified public profile URLs were bundled in the workspace
- some timeline periods are generic (`Most Recent`, `Earlier`) rather than exact dates

### Visual Assets

- project visuals are static SVG case-study surfaces, not screenshots captured from live deployed products
- the about section still uses a monogram / halo treatment instead of a final portrait asset
- no user-provided portrait asset has been integrated yet

### Metadata / SEO

- static sitemap content still uses a deployment placeholder domain until the production hostname is known
- structured data has not been added yet

### Backend / Contact

- contact submission is stored locally rather than delivered through email/webhook
- there is rate limiting, but no captcha or third-party anti-spam service

### UI / Accessibility / Polish

- no real portrait asset has been supplied for the about section
- final deployment-domain substitution is still required for sitemap/canonical validation

## Milestones 6-9 Completion Notes

### Milestone 6: Asset and Link Realism

Completed:

- wired the hero resume CTA to a static resume artifact at `frontend/public/resume/Shubham_Sharma_Resume.html`
- replaced placeholder link behavior with explicit metadata-driven handling
- routed unavailable external profiles to the contact section instead of faking public URLs
- replaced abstract project visuals with project-specific static SVG case-study surfaces

Result:

- the portfolio no longer reads like it is waiting on obvious placeholder links or missing work visuals

### Milestone 7: Accessibility, Interaction, and Mobile Hardening

Completed:

- added modal focus trap, focus restoration, and dialog labelling
- added visible `:focus-visible` treatment across primary interactive elements
- added a skip link and improved semantic navigation state
- hardened small-screen spacing and overflow behavior across homepage, modal, and project pages
- added reduced-motion handling

Result:

- the app behaves more deliberately across desktop and smaller breakpoints

### Milestone 8: Contact Delivery and Backend Hardening

Completed:

- replaced the contact stub with durable local submission storage
- added per-IP fixed-window rate limiting
- added structured logging and explicit 429/500 paths
- expanded env configuration for storage, rate limits, and proxy trust
- updated backend tests to cover persistence, invalid payloads, and rate limiting

Result:

- contact submissions are stored safely enough for follow-up without requiring external provider secrets

### Milestone 9: SEO, Deployment, and Final Production Pass

Completed:

- upgraded the SEO helper to manage canonical, OG, Twitter, and robots metadata
- added static social preview/icon/manifest assets
- added root `robots.txt` and `sitemap.xml` files for deployable static hosting
- updated frontend route call sites to use the richer metadata helper
- refreshed root/backend docs to match the deployable frontend/backend split and new env contract

Result:

- the portfolio is in deployable shape, pending substitution of the final production domain where placeholder URLs are still required

## Verification Commands

Use these commands after meaningful changes.

Frontend:

```bash
cd frontend
npm install
npm run build
npm run lint
```

Backend:

```bash
cd backend
npm install
npm run build
npm test
```

Local development:

```bash
cd backend
npm run dev
```

```bash
cd frontend
npm run dev
```

## Environment Expectations

Frontend `.env`:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Backend `.env`:

```env
PORT=8000
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
CONTACT_RECEIVER=hello@example.com
CONTACT_STORAGE_PATH=data/contact-submissions.ndjson
CONTACT_RATE_LIMIT_WINDOW_MS=900000
CONTACT_RATE_LIMIT_MAX=5
TRUST_PROXY=true
```

## Notes for the Next Model

If another model takes over, it should assume:

- the user wants the assistant to lead implementation, not just suggest it
- the design direction is already chosen and should not be reinvented
- the written PRD remains the source of truth
- the current codebase is functional but still has placeholder assets and placeholder external links
- future changes should preserve the dark, grid-led, recruiter-readable aesthetic
- this file is temporary and should eventually be removed in the final cleanup pass
