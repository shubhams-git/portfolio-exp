# Backend

Express + TypeScript API for the portfolio project.

Current responsibilities:

- expose a health endpoint
- accept validated contact-form submissions
- persist accepted contact submissions to disk
- rate-limit repeated contact attempts
- provide a backend foundation for later delivery wiring and deployment hardening

## Run

```bash
npm install
npm run dev
```

## Verify

```bash
npm run build
npm test
```

## Current Endpoints

- `GET /`
- `GET /api/health`
- `POST /api/contact`

## Notes

- Accepted contact submissions are stored as NDJSON on disk.
- Rate limiting is configurable via environment variables.
- `TRUST_PROXY` should remain enabled when the backend runs behind a reverse proxy.
- Environment parsing lives in `src/config/env.ts`.
- Root `README.md` is the canonical repo overview.
