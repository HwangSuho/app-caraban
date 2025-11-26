# 5-Min Presentation Script (Caraban)

1) What it is (30s)
- Caraban: camping reservation platform for campers, hosts, admins.
- Frontend (React/Vite/Tailwind) + Backend (Express/TS + Sequelize) + Firebase Auth.

2) Login/Auth (60s)
- Frontend uses Firebase Web SDK for email/password + Google.
- After login, client sends Firebase ID token to `POST /api/auth/firebase`.
- Backend verifies via Firebase Admin, `findOrCreate` user in DB, and returns profile.
- Axios interceptor auto-attaches tokens to API calls.

3) Core Features (60s)
- Models: users, campsites, reservations, reviews.
- Public: list campsites (`GET /api/campsites`).
- Authenticated: create/cancel reservations, write reviews.
- Seed script populates a demo host + three campsites for quick demo.

4) Architecture (60s)
- Docker Compose: `web` (nginx static + SPA), `backend` (Express), `db` (MariaDB with volume).
- Web container nginx proxies `/api` to backend; host-level Nginx terminates TLS (Let's Encrypt) and forwards 80/443 -> 8080.
- Logging: Winston + daily rotate to `logs/`.
- Health: `GET /api/health`.

5) Deployment (60s)
- Target: AWS EC2 + domain + HTTPS (certbot).
- Prod stack: `docker-compose.prod.yml` (MariaDB volume + GHCR images) behind host nginx TLS.
- Systemd unit (`infrastructure/systemd/caraban.service`) auto-restarts on boot.
- CI/CD: `deploy.yml` builds/pushes GHCR images and SSH-deploys (`docker compose pull && up -d`).

6) Demo flow (30s)
- Login with Firebase (or create account).
- `/dashboard` shows API-fetched campsites; make a reservation via API client/soon UI.
- Show logs and `/api/health` to confirm service status.
