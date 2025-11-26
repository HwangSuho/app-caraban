# Caraban - Camping Reservation Platform

All-in-one platform for campers, hosts, and admins with Firebase-based authentication, Express/TypeScript backend, and React/Vite frontend. The goal is production-ready delivery for coursework: complete features, secure auth, and deployable on EC2 with domain + HTTPS + CI/CD.

## Features (target)
- Firebase Auth (email/password + Google) bridged to backend users
- Campsite search/detail, reservation, payment, and reviews
- Host management (campsites, reservations, revenue)
- Admin monitoring and user/review management
- Production deploy: Docker, Nginx reverse proxy, HTTPS, CI/CD, logging

## Stack
- Frontend: React, Vite, TypeScript, TailwindCSS, Firebase Web SDK
- Backend: Node.js, Express, TypeScript, Sequelize (MariaDB/SQLite), Firebase Admin
- Infra: Docker Compose, Nginx, GitHub Actions (CI/CD), Systemd for process management

## Repository Structure
- `backend/` - Express/TS API, DB models, services, Firebase admin
- `web/` - React/Vite frontend with Firebase Auth flows
- `config/` & `infrastructure/` - Nginx, compose files, systemd unit, scripts
- `docs/` - Architecture, deployment, HA guides
- `scripts/` - Helper scripts for local/prod operations
- `docker-compose.prod.yml` - production stack (db + backend + web images) for EC2
- `.github/workflows/deploy.yml` - CI/CD that builds/pushes images and can SSH-deploy

## Getting Started
### Prerequisites
- Node.js 18+
- pnpm (preferred) or npm
- Docker & docker-compose (for containerized runs)

### Local (frontend + backend separately)
1. Backend: `cd backend && pnpm install && cp .env.example .env && pnpm dev`
2. Frontend: `cd web && pnpm install && cp .env.example .env && pnpm dev`

### Docker (all services)
- See `docs/DEPLOYMENT.md` for compose-based local/prod flows.
- Use `.env.example` at repo root for DB/compose vars and export Vite Firebase envs before building.

### Production (EC2 + domain + HTTPS)
1. Copy `backend/.env.example` to `backend/.env` on the server and set DB + Firebase service account vars.
2. Ensure Docker + docker compose are installed and the repo lives at `/opt/caraban`.
3. Pull images built by CI: `docker compose -f docker-compose.prod.yml pull && docker compose -f docker-compose.prod.yml up -d`.
4. Put host-level Nginx TLS config from `config/nginx/host-https.conf` into `/etc/nginx/sites-available/caraban`, run certbot, and reload Nginx.
5. Enable autorestart: `sudo cp infrastructure/systemd/caraban.service /etc/systemd/system && sudo systemctl enable --now caraban`.

### Seed demo data (campsites)
- `cd backend && pnpm seed` (creates sample host + 3 campsites)

## API (preview)
- `GET /api/health` - health check  
- `POST /api/auth/firebase` - verifies Firebase ID token and returns user
- `GET /api/campsites` - public list  
- `POST /api/reservations` - create (Firebase auth)  
- `POST /api/reservations/:id/cancel` - cancel own reservation  
- `GET /api/reviews/campsite/:campsiteId` - list reviews  
- `POST /api/reviews` - create review (Firebase auth)

## Environment Variables
- Backend: set DB connection, Firebase service account keys, app secrets (`backend/.env.example`).
- Frontend: set Firebase web config and API base URL (`web/.env.example`).
- Root/compose: DB credentials + Vite build args (`.env.example`).

## Status
This repo is being scaffolded to meet the project rubric (Firebase auth + production deployment). See `AGENTS.md` for the full mandate. Further code and infra configs are added iteratively.

## Docs
- `docs/ARCHITECTURE.md` – sequence + deployment diagrams
- `docs/DEPLOYMENT.md` – local/prod steps, HTTPS, CI/CD outline
- `docs/HIGH_AVAILABILITY.md` – HA considerations
- `docs/PRESENTATION_5MIN.md` – quick script for demo/presentation
