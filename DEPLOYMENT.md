# Deployment Guide

This repo is set up to deploy as two separate services:

- frontend: Vite + React on Vercel
- backend: Express API on Render

Deploy the backend first, because the frontend build needs the live backend URL.

## 1. Deploy the backend on Render

### Option A: Use the included `render.yaml`

1. Push this repo to GitHub.
2. In Render, click `New` -> `Blueprint`.
3. Select this repository.
4. Render will detect [`render.yaml`](./render.yaml).
5. Keep the backend service rooted at `backend/`.
6. Provide values for the prompted secrets:
   - `ALLOWED_ORIGINS`
   - `CONTACT_RECEIVER`
7. Confirm the remaining defaults:
   - runtime: `node`
   - build command: `npm ci && npm run build`
   - start command: `npm start`
   - health check path: `/api/health`
   - `CORS_ALLOW_VERCEL_PREVIEW=true`
   - `CONTACT_STORAGE_PATH=/var/data/contact-submissions.ndjson`
8. Complete the deploy.

### Option B: Create the service manually

1. In Render, click `New` -> `Web Service`.
2. Connect the repository.
3. Set `Root Directory` to `backend`.
4. Set `Runtime` to `Node`.
5. Set `Build Command` to `npm ci && npm run build`.
6. Set `Start Command` to `npm start`.
7. Set `Health Check Path` to `/api/health`.
8. Use at least the `Starter` plan if you want persistent on-disk contact storage.
9. Add a persistent disk:
   - mount path: `/var/data`
   - size: `1 GB` is enough for this project to start
10. Add these environment variables:

```env
ALLOWED_ORIGINS=https://your-frontend.vercel.app
CORS_ALLOW_VERCEL_PREVIEW=true
CONTACT_RECEIVER=you@example.com
CONTACT_STORAGE_PATH=/var/data/contact-submissions.ndjson
CONTACT_RATE_LIMIT_WINDOW_MS=900000
CONTACT_RATE_LIMIT_MAX=5
TRUST_PROXY=true
```

### Backend checks

After Render finishes, verify:

- `GET https://your-backend.onrender.com/api/health` returns `{"status":"ok"}`
- `GET https://your-backend.onrender.com/` returns the service status payload

## 2. Deploy the frontend on Vercel

1. In Vercel, click `Add New...` -> `Project`.
2. Import the same repository.
3. Set the project `Root Directory` to `frontend`.
4. Vercel should detect Vite automatically.
5. Add this environment variable before the first production deploy:

```env
VITE_API_BASE_URL=https://your-backend.onrender.com
```

6. Deploy.

This project already includes [`frontend/vercel.json`](./frontend/vercel.json) to rewrite all routes to `index.html`, which is required for the React Router SPA to support deep links on Vercel.

## 3. Final CORS configuration

Once the first Vercel deploy finishes, collect the frontend URLs you want the backend to allow.

At minimum, set `ALLOWED_ORIGINS` on Render to include:

```env
https://your-project.vercel.app
```

If you add a custom domain on Vercel, include that too:

```env
https://your-project.vercel.app,https://www.yourdomain.com
```

Keep `CORS_ALLOW_VERCEL_PREVIEW=true` if you want branch preview deployments on `https://*.vercel.app` to reach the Render API without editing `ALLOWED_ORIGINS` for every preview URL.

## 4. Redeploy order when changing domains

1. Update `ALLOWED_ORIGINS` on Render.
2. Save and redeploy the backend if Render does not auto-restart it.
3. Confirm the backend health check is green.
4. Redeploy the frontend on Vercel only if `VITE_API_BASE_URL` changed.

## 5. Post-deploy verification

Run these checks in order:

1. Open the Vercel site homepage.
2. Open a project detail route directly, such as `/projects/<slug>`, and confirm it loads without a 404.
3. Submit the contact form from the Vercel site.
4. Confirm the browser does not show a CORS failure in DevTools.
5. Confirm the Render API responds with `202 Accepted`.
6. If you attached a disk, verify submissions appear in the Render service filesystem under `/var/data/contact-submissions.ndjson`.

## 6. Common failure cases

### CORS error in the browser

Usually one of these is wrong:

- `ALLOWED_ORIGINS` does not include the live Vercel production or custom domain
- `CORS_ALLOW_VERCEL_PREVIEW` is false while testing from a Vercel preview deployment
- `VITE_API_BASE_URL` still points at localhost or the wrong backend URL

### Contact form cannot connect in production

The frontend now fails with a clear message when `VITE_API_BASE_URL` is missing in production. Set the variable in Vercel and redeploy.

### Contact submissions disappear on Render

Render filesystems are ephemeral unless you attach a persistent disk. Keep the disk mounted at `/var/data` and keep `CONTACT_STORAGE_PATH=/var/data/contact-submissions.ndjson`.
