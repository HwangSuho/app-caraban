# Caraban Backend
Express + TypeScript API for the Caraban camping reservation platform.

## Stack
- Node 18+, Express, Sequelize (MySQL/MariaDB/SQLite), Firebase Admin, Kakao login
- Package manager: pnpm

## Setup
1) Install deps
```bash
corepack enable
pnpm install
```
2) Environment: copy `.env.example` to `.env` and fill values. Keep `.env` out of git.

Key env vars:
- `CORS_ORIGIN`: comma list, e.g. `http://localhost:5173,https://app-caraban.vercel.app`
- `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` (keep it quoted with `\n` escapes; on CI secrets, escape backslashes like `\\n`)
- `KAKAO_NATIVE_KEY`, `KAKAO_REST_API_KEY`, `KAKAO_JAVASCRIPT_KEY`, `KAKAO_ADMIN_KEY`
- DB: `DB_DIALECT` (`sqlite|mysql|mariadb`), `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_STORAGE`

## Run
- Dev: `pnpm dev`
- Build: `pnpm build`
- Start (after build): `pnpm start`
- Seed sample data: `pnpm seed`

## API (auth)
- `POST /api/auth/firebase` — header `Authorization: Bearer <firebase_id_token>`
- `POST /api/auth/kakao` — header `Authorization: Bearer <kakao_access_token>`
Response shape: `{ user: { id, email, name, role, firebaseUid, createdAt, updatedAt } }`

## Deployment
- Render backend: see `render.yaml`. Health check: `/api/health`. Set secrets in the Render dashboard (Firebase/Kakao/DB), keep `CORS_ORIGIN=https://app-caraban.vercel.app`.
- Vercel frontend: set `VITE_API_BASE=https://app-caraban-backend.onrender.com/api` and `VITE_KAKAO_JS_KEY=<kakao_js_key>` (if used). Redeploy after updating env vars.
