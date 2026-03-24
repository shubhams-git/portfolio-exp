# The Layered Matrix

Recruiter-facing full-stack portfolio for `Shubham Sharma`, built as a dark, grid-led React application with an Express backend for contact handling.

This repo is being built milestone-by-milestone. The current state is a working multi-page portfolio with routed project deep-dives, a quick preview modal, richer route metadata, and a live contact form backed by persisted submissions plus rate limiting.

## Read This First

For a continuation handoff, use these in order:

1. `README.md`
2. `MILESTONE_PROGRESS.md`
3. the codebase in `frontend` and `backend`
4. the visual and written references in `stitch_the_layered_matrix_prd`

Important source-of-truth rule:

- the written PRD defines the product, content intent, and section purpose
- the HTML/screens in `stitch_the_layered_matrix_prd` are visual references, not literal source code to copy

## Current Stack

- frontend: Vite + React + TypeScript + React Router
- backend: Express + TypeScript
- styling: plain CSS with CSS variables, no component library
- validation: Zod on the backend, lightweight client-side validation on the frontend
- testing: Vitest + Supertest on the backend

The user explicitly chose a plain React app over Next.js. Do not reintroduce Next.js unless the user asks for it.

## Current Product Scope

Implemented sections and flows:

- homepage hero
- work matrix
- technical stack section
- portrait/about section
- terminal-style contact form
- quick preview project modal
- dedicated project deep-dive routes at `/projects/:slug`
- route-level title and description updates

Current backend endpoints:

- `GET /`
- `GET /api/health`
- `POST /api/contact`

## Design Direction

The portfolio should remain aligned with the "Layered Matrix" PRD:

- premium but restrained dark aesthetic
- strong 1px grid lines
- high-density technical credibility
- cinematic depth used carefully, not decoratively
- zero-radius cards and surfaces
- recruiter clarity over visual noise

Core palette:

- background: `#050505`
- surface: `#0F0F11`
- text: `#FFFFFF`
- muted text: `#A1A1AA`
- grid: `#27272A`
- accent: `#E4E4E7`

Typography:

- display: Clash Display
- body: Switzer
- mono/meta: JetBrains Mono

## Repo Structure

```text
portfolio-exp/
  frontend/                     React portfolio app
    src/
      components/              Shared UI pieces
      content/                 Typed portfolio content
      lib/                     Small utility helpers
      pages/                   Routed pages
      types/                   Shared frontend types
  backend/                      Express API
    src/
      config/                  Env parsing
      routes/                  API routes
    tests/                     API tests
  stitch_the_layered_matrix_prd/  PRD bundle, HTML references, screenshots
  MILESTONE_PROGRESS.md        Temporary build handoff file
```

## Local Setup

### Prerequisites

- Node.js 20+ recommended
- npm

### Frontend

```bash
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```

Default frontend URL:

- [http://localhost:5173](http://localhost:5173)

### Backend

```bash
cd backend
npm install
Copy-Item .env.example .env
npm run dev
```

Default backend URL:

- [http://127.0.0.1:8000](http://127.0.0.1:8000)

## Environment Variables

Frontend:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Backend:

```env
PORT=8000
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
CONTACT_RECEIVER=hello@example.com
CONTACT_STORAGE_PATH=data/contact-submissions.ndjson
CONTACT_RATE_LIMIT_WINDOW_MS=900000
CONTACT_RATE_LIMIT_MAX=5
TRUST_PROXY=true
```

## Deployment Shape

The frontend is a static Vite build and can be deployed independently from the API.

- frontend build output: `frontend/dist`
- static metadata assets: `frontend/public/meta`
- backend runtime: Express service exposed on `PORT`

For production deployments:

- set `ALLOWED_ORIGINS` to the deployed frontend origin
- set `VITE_API_BASE_URL` in the frontend environment to the deployed backend URL
- serve the frontend build from a static host or CDN and the backend from a Node runtime
- replace the placeholder `https://example.com` entries in `frontend/public/sitemap.xml` with the final production domain

## Verification

Frontend:

```bash
cd frontend
npm run build
npm run lint
```

Backend:

```bash
cd backend
npm run build
npm test
```

## Current Important Files

Frontend:

- `frontend/src/App.tsx`
- `frontend/src/App.css`
- `frontend/src/index.css`
- `frontend/src/main.tsx`
- `frontend/src/pages/HomePage.tsx`
- `frontend/src/pages/ProjectPage.tsx`
- `frontend/src/content/portfolio-content.ts`
- `frontend/src/types/portfolio.ts`
- `frontend/src/components/QuickPreviewModal.tsx`
- `frontend/src/components/SiteHeader.tsx`
- `frontend/src/components/SiteFooter.tsx`
- `frontend/src/components/ProjectVisual.tsx`
- `frontend/src/lib/portfolio.ts`
- `frontend/src/lib/seo.ts`

Backend:

- `backend/src/app.ts`
- `backend/src/server.ts`
- `backend/src/config/env.ts`
- `backend/src/routes/health.ts`
- `backend/src/routes/contact.ts`
- `backend/tests/api.test.ts`

## Current State and Known Gaps

What is already working:

- routed homepage and project pages
- project preview modal
- shared navigation/footer shell
- data-driven project content
- terminal contact form posting to Express
- contact payload validation
- persisted contact submissions with rate limiting
- backend healthcheck and tests

What is still intentionally incomplete:

- no verified public GitHub/LinkedIn/source URLs are bundled in the repo, so those links route users to contact instead of faking external profiles
- project visuals are static SVG case-study surfaces, not screenshots captured from live deployed products
- no real portrait asset yet
- contact submissions are stored locally rather than delivered through an external provider
- some final accessibility and mobile-polish work remains

## Recommended Next Build Order

1. Replace the placeholder sitemap domain with the final production hostname.
2. Swap in verified public profile URLs if the user wants direct GitHub/LinkedIn/source links.
3. Replace the stylized portrait and SVG case-study surfaces with real media assets if they become available.
4. Add structured data and a real outbound delivery provider if production requirements expand.
5. Delete `MILESTONE_PROGRESS.md` during final cleanup.

## Notes for Future AI Continuation

If another model continues this work, it should:

- preserve the current stack unless the user explicitly changes it
- treat `frontend/src/content/portfolio-content.ts` as the main content source
- keep the PRD's visual direction intact
- avoid turning the site into a generic portfolio template
- maintain recruiter readability as the primary success metric
