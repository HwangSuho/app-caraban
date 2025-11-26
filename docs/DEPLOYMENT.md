# Deployment Guide (EC2 + Docker + HTTPS)

This repository is prepared for a production-style rollout on AWS EC2 with Docker, Nginx, MariaDB, and Firebase Auth.

## 1. Prerequisites
- EC2 (Ubuntu 22.04 recommended), public IP + domain (Route53/Gabia/etc)
- Docker + Docker Compose v2 installed
- Firebase service account JSON (values injected via env)
- MariaDB credentials (root password, app user/password)
- Node 18+ locally if you want to run without containers

## 2. Environment Variables
- Backend: copy `backend/.env.example` to `backend/.env` and fill DB/Firebase values.
- Frontend build args (for Docker builds): set the Vite Firebase vars when building the web image:
  - `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`
  - `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`
  - `VITE_FIREBASE_APP_ID`, `VITE_FIREBASE_MEASUREMENT_ID`
- Root-level DB secrets (used by compose): `DB_ROOT_PASSWORD`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- Prod compose images: set `BACKEND_IMAGE` and `WEB_IMAGE` (defaults point to `ghcr.io/<org>/caraban-*`) when pulling on the server.
- Registry login for deploy: set `GHCR_DEPLOY_TOKEN` (PAT with `packages:read`) in GitHub Secrets and on the EC2 host if pulling manually.

## 3. Local (Docker)
```bash
cp backend/.env.example backend/.env   # edit values
export VITE_FIREBASE_API_KEY=...
export VITE_FIREBASE_AUTH_DOMAIN=...
export VITE_FIREBASE_PROJECT_ID=...
export VITE_FIREBASE_STORAGE_BUCKET=...
export VITE_FIREBASE_MESSAGING_SENDER_ID=...
export VITE_FIREBASE_APP_ID=...
docker compose up --build
```
- API: `http://localhost:4000/api/health`
- Web: `http://localhost`

## 4. Production on EC2
### 4.1 One-time setup
1) Clone to `/opt/caraban` (or another path):
```bash
sudo mkdir -p /opt/caraban
sudo chown $USER:$USER /opt/caraban
git clone <repo> /opt/caraban
cd /opt/caraban
cp backend/.env.example backend/.env
# fill Firebase + DB secrets
```
2) Provide backend env:
```bash
cp backend/.env.example backend/.env
# fill Firebase + DB + CORS values
```
3) Persist with systemd (template: `infrastructure/systemd/caraban.service` uses `docker-compose.prod.yml`):
```bash
sudo cp infrastructure/systemd/caraban.service /etc/systemd/system/caraban.service
sudo systemctl daemon-reload
sudo systemctl enable --now caraban
```
4) Logs:
- Backend app logs rotate via Winston into `./logs` (mounted in container)
- `docker logs caraban-backend-1` (or `docker compose logs -f backend`)

### 4.2 Run production stack (images from registry)
The prod compose file maps web -> host port 8080 to sit behind host-level Nginx TLS.
```bash
export BACKEND_IMAGE=ghcr.io/<org>/caraban-backend:latest
export WEB_IMAGE=ghcr.io/<org>/caraban-web:latest
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

## 5.1 Demo Data
- After the stack is up (or locally), run `cd backend && npm run seed` to create a demo host and three example campsites.

## 5. HTTPS (Let’s Encrypt)
- Point your domain (e.g., `caraban.yourdomain.com`) to the EC2 public IP.
- Install host nginx + certbot: `sudo apt install nginx certbot python3-certbot-nginx`.
- Copy `config/nginx/host-https.conf` to `/etc/nginx/sites-available/caraban` and replace `caraban.example.com` with your domain; update cert paths after issuing a cert.
- Allow nginx to proxy to the web container (mapped to `127.0.0.1:8080`): `sudo ln -s /etc/nginx/sites-available/caraban /etc/nginx/sites-enabled/caraban && sudo nginx -t && sudo systemctl reload nginx`.
- Issue/renew certs: `sudo certbot --nginx -d caraban.yourdomain.com`.

## 6. CI/CD (outline)
- Build & deploy workflow lives at `.github/workflows/deploy.yml`.
- On push to `main` it:
  1. Builds/pushes `ghcr.io/<owner>/caraban-backend` and `caraban-web` (tags: `latest` + SHA).
  2. SSHes to EC2 (`EC2_HOST`, `EC2_USER`, `EC2_SSH_KEY` secrets) and runs `docker compose -f docker-compose.prod.yml pull && up -d`.
  3. Restarts `caraban.service` systemd unit (ignores failure if not installed).
- Provide secrets: `GHCR_DEPLOY_TOKEN` (packages:read), Firebase web config for build (`VITE_FIREBASE_*`), DB/passwords should only live on the server (`backend/.env`).
- CI-only build remains at `.github/workflows/ci.yml` for PR validation.

## 7. Healthchecks & Monitoring
- API health: `GET /api/health`
- DB health via MariaDB container healthcheck
- Add uptime checks (Pingdom/StatusCake) against the HTTPS endpoint
- Vercel/SPA 빌드 시 `VITE_API_BASE_URL=https://app-caraban-backend.onrender.com/api` 로 설정하여 배포 백엔드와 연동
