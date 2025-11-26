# Architecture

## Sequence: Firebase Login → Backend Sync
```mermaid
sequenceDiagram
  participant U as User
  participant W as Web (Vite/React)
  participant F as Firebase Auth
  participant A as API (Express)
  participant B as Firebase Admin
  participant D as DB (MariaDB/SQLite)

  U->>W: Sign in (email/pw or Google)
  W->>F: Firebase Auth request
  F-->>W: ID Token
  W->>A: POST /auth/firebase (Authorization: Bearer ID_TOKEN)
  A->>B: verifyIdToken(ID_TOKEN)
  B-->>A: decoded payload
  A->>D: findOrCreate(firebaseUid, email, name)
  D-->>A: user record
  A-->>W: user profile (id/email/role)
  W-->>U: Session ready, API calls with token
```

## Deployment (Docker on EC2)
```mermaid
graph TD
  user[Browser] -->|HTTPS| nginx[Nginx (host)]
  nginx -->|/ static + /api proxy| web[web container (nginx + Vite build)]
  nginx -->|/api| backend[backend container (Express)]
  backend --> db[(MariaDB volume)]
  subgraph docker_compose
    web
    backend
    db
  end
```

## Components
- **Frontend**: React/Vite + Firebase Web SDK, built to static assets served by Nginx. Axios interceptor attaches Firebase ID token.
- **Backend**: Express/TypeScript + Sequelize. Firebase Admin verifies ID tokens, maps users to DB. Winston + daily rotate for logs.
- **DB**: MariaDB (prod) / SQLite (dev). Models cover users, campsites, reservations, reviews.
- **Infra**: Docker Compose stack, systemd unit for autorestart, Nginx reverse proxy for `/api` to backend and static hosting.
