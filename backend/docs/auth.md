# Authentication

## Kakao
- Endpoint: `POST /api/auth/kakao`
- Headers: `Authorization: Bearer <kakao_access_token>`
- Body: none (user info is fetched from Kakao)
- Returns: `{ user: { id, email, name, role, firebaseUid, createdAt, updatedAt } }`
- Env vars: `KAKAO_NATIVE_KEY`, `KAKAO_REST_API_KEY`, `KAKAO_JAVASCRIPT_KEY`, `KAKAO_ADMIN_KEY` (see `.env.example`)

## Firebase
- Endpoint: `POST /api/auth/firebase`
- Headers: `Authorization: Bearer <firebase_id_token>`
- Body: none
- Returns: `{ user: { id, email, name, role, firebaseUid, createdAt, updatedAt } }`
- Env vars: `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`
