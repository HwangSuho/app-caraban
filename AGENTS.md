# AGENTS – Caraban (캠핑장 예약 플랫폼)

이 문서는 **codex max x high CLI**에게 이 레포지토리의 맥락과 목표를 설명하기 위한 가이드다.  
너는 이 레포에서 동작하는 **AI 페어 프로그래머 & DevOps 어시스턴트**다.

---

## 0. TL;DR – 너의 역할

- 이 레포는 **캠핑장 예약/관리 플랫폼**이다.
- 목표는 **수업 과제에서 만점 기준에 해당하는 수준**의
  - **기능 완성도** (일반 사용자 + 사업자 + 관리자)
  - **프로덕션급 배포** (EC2 + 도메인 + HTTPS + CI/CD + DB/로그 분리)
  를 달성하는 것이다.
- 인증 구조(수정된 합의사항):
  - **웹 프론트에서는 Firebase Auth로 이메일/비밀번호 + Google 로그인**을 처리한다.
  - 백엔드는 **Firebase ID 토큰을 검증**하고, 자체 DB의 `users` 테이블과 매핑해서 세션/권한을 관리한다.
  - Kakao 로그인은 선택 사항이며, 구현되어 있다면 유지·보완하되, 핵심은 **Firebase 이메일/구글 로그인**이다.
- 데이터/로직:
  - 예약/결제/리뷰/통계 등 비즈니스 로직과 데이터 저장은 **기존 백엔드 + MariaDB/SQLite** 를 사용한다.  
    Firebase는 **“인증(Identity Provider)” 역할만 한다.**

> 네가 해야 할 일의 중심은  
> **“기존 아키텍처를 망가뜨리지 않고, Firebase Auth 기반 로그인 + 프로덕션 배포를 완성하는 것”**이다.

---

## 1. 프로젝트 맥락 & 만점 기준

### 1.1 프로젝트 요약

- 이름: **Caraban – 캠핑장 예약 플랫폼**
- 목적:
  - 일반 사용자: 캠핑장 검색·예약·결제·리뷰
  - 사업자: 캠핑장/예약/리뷰/매출 관리
  - 관리자: 사용자/예약/리뷰/시스템 모니터링

### 1.2 만점 기준에서 중요한 포인트

1. **기능**
   - 일반 사용자:
     - 이메일/비밀번호 + Google 로그인 (Firebase Auth)
     - (선택) Kakao 로그인
     - 캠핑장 검색/필터/상세, 예약 생성/취소, 결제, 리뷰, 알림(이메일)
   - 사업자:
     - 캠핑장 등록/수정/삭제
     - 예약/리뷰/매출 통계
   - 관리자:
     - 대시보드, 사용자/리뷰 관리, 기본 모니터링

2. **배포/인프라**
   - AWS EC2 (또는 Compute Engine)에서 실제 서비스 구동
   - **도메인 + HTTPS(SSL/TLS)** 적용
   - **환경 변수(.env) 기반 시크릿 관리**
   - **CI/CD 파이프라인**으로 자동 배포
   - 앱과 DB 분리(MariaDB, Redis 등), 고가용성 옵션
   - 애플리케이션/인프라 **로그 관리 체계**

3. **문서/발표**
   - README/DEPLOYMENT/HIGH_AVAILABILITY 문서로 배포 과정을 설명
   - 5분 이내에 “서비스 요약 + 아키텍처 + 배포 흐름”을 설명 가능한 구조

---

## 2. 리포지토리 구조 (요약)

> 세부 구조/파일은 레포 문서를 참고하고, 여기서는 너의 이해를 위한 핵심만 적는다.

- `backend/`
  - Node.js + Express + TypeScript
  - 계층 구조: `config/`, `models/`, `services/`, `controllers/`, `routes/`, `middlewares/`
  - DB: 개발은 SQLite, 프로덕션은 MariaDB + Sequelize ORM
- `web/`
  - React + Vite + TypeScript + TailwindCSS
  - 페이지/컴포넌트 기반 SPA
- `config/`, `infrastructure/`, `scripts/`
  - Nginx, DB, EC2 초기 설정, 고가용성, CDN 등 인프라 정의
- 루트
  - `.env.*` (환경 변수 템플릿)
  - `docker-compose*.yml` (로컬/프로덕션/HA 스택)
  - `README.md`, `DEPLOYMENT.md`, `HIGH_AVAILABILITY.md`, 등 문서

---

## 3. 기능 목표 (정리)

### 3.1 인증(Auth) – 이번에 수정된 핵심

- **Firebase Auth 사용**
  - 이메일/비밀번호 로그인
  - Google 로그인
- 로그인 플로우:

  1. 웹 프론트에서 Firebase JS SDK로 로그인
     - `signInWithEmailAndPassword`
     - `signInWithPopup`(Google)
  2. 로그인 성공 후 `user.getIdToken()`으로 **Firebase ID 토큰** 획득
  3. 이 토큰을 `Authorization: Bearer <ID_TOKEN>` 헤더로  
     백엔드 `/auth/firebase` 엔드포인트에 보내 로그인/회원 연동을 수행
  4. 백엔드는 `firebase-admin`으로 토큰 검증 후
     - `firebaseUid` / `email` 기준으로 **로컬 DB 유저 생성·조회**
  5. 이후 예약/결제/리뷰 API는 기존과 동일하게 `req.user`를 신뢰하고 동작

- 선택:
  - Kakao 로그인은 유지 가능하나, **우선순위는 Firebase 이메일/구글**이다.
  - 시간이 없을 경우 최소 인증 스펙은 **Firebase 이메일/구글 + 기본 유저 프로필 관리**.

---

### 3.2 일반 사용자 기능

- 캠핑장 목록/검색/필터/지도 표시(카카오 지도)
- 캠핑장 상세(사진/설명/위치/가격/리뷰)
- 예약 생성/조회/취소
- 결제(PortOne 등 외부 연동)
- 리뷰 작성(별점/텍스트/이미지)
- 이메일 알림(예약 확인, 취소, 리뷰 요청 등)

### 3.3 사업자/관리자 기능

- 사업자:
  - 캠핑장 등록/수정/삭제
  - 예약/매출/리뷰 현황 확인
- 관리자:
  - 대시보드 (사용자/예약/매출/리뷰 통계)
  - 사용자 및 리뷰 관리
  - 시스템 헬스 체크/모니터링

---

## 4. 백엔드 구현 원칙 (Firebase Auth 포함)

1. **레이어드 아키텍처 유지**
   - 새로운 인증 플로우(`/auth/firebase`) 도입 시에도
     - `routes` → `controllers` → `services` → `models` → `middlewares` 구조를 유지한다.

2. **Firebase Admin 연동**

   - 예시 초기화(실제 경로/파일명은 레포에 맞춰 조정):

     ```ts
     // backend/src/config/firebase.ts
     import admin from "firebase-admin";

     if (!admin.apps.length) {
       admin.initializeApp({
         credential: admin.credential.cert({
           projectId: process.env.FIREBASE_PROJECT_ID,
           clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
           privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
         }),
       });
     }

     export { admin };
     ```

   - `.env`에는 최소 다음이 필요하다:

     ```env
     FIREBASE_PROJECT_ID=app-caraban
     FIREBASE_CLIENT_EMAIL=...@app-caraban.iam.gserviceaccount.com
     FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
     ```

3. **Firebase 토큰 검증 미들웨어**

   - `/auth/firebase` 및 인증이 필요한 라우트에서 사용할 미들웨어:

     ```ts
     // backend/src/middlewares/firebaseAuth.ts
     import { Request, Response, NextFunction } from "express";
     import { admin } from "../config/firebase";
     import { User } from "../models/User";

     export async function firebaseAuth(
       req: Request,
       res: Response,
       next: NextFunction
     ) {
       try {
         const authHeader = req.headers.authorization;
         if (!authHeader?.startsWith("Bearer ")) {
           return res.status(401).json({ message: "No auth token" });
         }

         const idToken = authHeader.split(" ")[1];
         const decoded = await admin.auth().verifyIdToken(idToken);

         const [user] = await User.findOrCreate({
           where: { firebaseUid: decoded.uid },
           defaults: {
             email: decoded.email,
             name: decoded.name ?? decoded.email?.split("@")[0],
           },
         });

         (req as any).user = user;
         next();
       } catch (err) {
         console.error(err);
         return res.status(401).json({ message: "Invalid auth token" });
       }
     }
     ```

   - 인증용 라우트 예시:

     ```ts
     // backend/src/routes/auth.routes.ts
     import { Router } from "express";
     import { firebaseAuth } from "../middlewares/firebaseAuth";

     const router = Router();

     router.post("/firebase", firebaseAuth, (req, res) => {
       return res.json({ user: (req as any).user });
     });

     export default router;
     ```

4. **기타 백엔드 규칙**

   - TypeScript 타입 안전 (DTO/응답 타입 정의, `any` 자제)
   - 입력 검증(`express-validator`) + JWT/역할(Role) 체크
   - 로깅(Winston) + 공통 에러 핸들러
   - `/api/health` 등 헬스 체크 엔드포인트 유지·보완

---

## 5. 프론트엔드 구현 원칙 (Firebase Web SDK 포함)

1. **Firebase 초기화**

   - `web` 폴더에서 `firebase` 패키지 사용
   - `web/src/lib/firebase.ts` 같은 곳에 초기화 코드 작성:

     ```ts
     // web/src/lib/firebase.ts
     import { initializeApp } from "firebase/app";
     import { getAuth, GoogleAuthProvider } from "firebase/auth";

     const firebaseConfig = {
         apiKey: "AIzaSyDi2a32H5cpn8EB04xW4khzSXkptOuE3xI",
         authDomain: "app-caraban.firebaseapp.com",
         projectId: "app-caraban",
         storageBucket: "app-caraban.firebasestorage.app",
         messagingSenderId: "544137111582",
         appId: "1:544137111582:web:0a8bea35f0e63ee604e60f",
         measurementId: "G-YBXCP7DF91"
     };

     const app = initializeApp(firebaseConfig);

     export const auth = getAuth(app);
     export const googleProvider = new GoogleAuthProvider();
     ```

   - `.env` (Vite이므로 `VITE_` prefix 필요):

     ```env
     VITE_FIREBASE_API_KEY=실제_키
     ```

2. **로그인 플로우 (프론트)**

   - 이메일/비밀번호:

     ```ts
     import { signInWithEmailAndPassword } from "firebase/auth";
     import { auth } from "@/lib/firebase";
     import axios from "@/lib/axios";

     async function loginWithEmail(email: string, password: string) {
       const { user } = await signInWithEmailAndPassword(auth, email, password);
       const token = await user.getIdToken();
       await axios.post("/auth/firebase", {}, {
         headers: { Authorization: `Bearer ${token}` },
       });
     }
     ```

   - Google 로그인:

     ```ts
     import { signInWithPopup } from "firebase/auth";
     import { auth, googleProvider } from "@/lib/firebase";
     import axios from "@/lib/axios";

     async function loginWithGoogle() {
       const { user } = await signInWithPopup(auth, googleProvider);
       const token = await user.getIdToken();
       await axios.post("/auth/firebase", {}, {
         headers: { Authorization: `Bearer ${token}` },
       });
     }
     ```

   - 이후 API 호출에서는 axios 인스턴스에 인터셉터를 설정해
     - Firebase ID 토큰 또는 백엔드에서 새로 발급한 토큰을 자동으로 붙이도록 할 수 있다.

3. **라우팅/페이지**

   - `/auth/login`, `/auth/register` 페이지에서 위 Firebase 플로우를 사용
   - 로그인 후에는 기존처럼
     - `/campsites`, `/campsites/:id`, `/my/reservations`, `/host/*`, `/admin/*` 등으로 이동

4. **UI/UX**

   - TailwindCSS 기반 디자인 유지
   - 로딩/에러 상태 명시
   - 로그인/회원가입/예약/결제 등 주요 액션에 피드백(토스트/모달) 제공

---

## 6. 배포 & DevOps – 만점 기준

1. **EC2 배포**
   - Docker + docker-compose를 사용해
     - 백엔드, 프론트, DB, Redis, Nginx 등을 EC2에서 구동
   - 헬스 체크 및 로그 확인 가능하도록 설정

2. **도메인 + HTTPS**
   - 도메인을 EC2 IP로 연결
   - Nginx 서버 블록에 `server_name` 설정
   - Certbot/Let’s Encrypt로 SSL 인증서 발급
   - HTTP → HTTPS 리다이렉션 설정

3. **환경 변수 / 시크릿 관리**
   - `.env.development`, `.env.production` 등으로 환경 분리
   - GitHub에는 시크릿을 올리지 않고, GitHub Secrets/서버 환경 변수로 관리
   - Firebase, DB, 포트원, SMTP 등의 키/시크릿을 문서로 정리

4. **CI/CD**
   - GitHub Actions로
     - Lint/테스트/빌드
     - Docker 이미지 빌드/푸시
     - EC2로 배포 스크립트 실행
   - main 브랜치에 push → 자동 배포 흐름 구성

5. **DB 분리 & 고가용성**
   - 앱/DB/Redis를 별도 서비스로 운영
   - 필요 시 `docker-compose.ha.yml` 기반으로 고가용성 구성
   - DB 백업/복구 전략 문서화

6. **로그 & 모니터링**
   - 애플리케이션 로그(Winston) + Nginx/시스템 로그 관리
   - 에러 로그와 일반 로그 분리
   - 헬스체크, 기본 메트릭(요청 수, 에러 비율 등)을 관찰할 수 있는 구조 유지

---

## 7. 문서 & 발표 준비

- `README.md`
  - 프로젝트 소개, 주요 기능, 기술 스택
  - 로컬 실행 방법 (Firebase Auth 포함)
  - 배포 환경 (EC2, 도메인, HTTPS, CI/CD, DB/로그)
  - 접속 URL, 테스트 계정

- `DEPLOYMENT.md`, `HIGH_AVAILABILITY.md`
  - 실제로 따라 할 수 있는 배포 흐름 전체 정리

- `docs/PRESENTATION_5MIN.md` (없다면 생성 제안)
  - 5분 발표용 대본:
    - 서비스 소개 → 아키텍처(특히 Firebase Auth + 백엔드 + DB 구조) → 배포 → 시연 → 회고

---

## 8. 작업 스타일 가이드 (codex max x high용)

- 기존 구조를 **필요에 따라 갈아엎고**, 필요한 부분을 확장/보완한다.
- 커밋은 작은 단위로, 의미 있는 메시지로 남긴다:

  - `feat(auth): add firebase email/google login`
  - `chore(env): add firebase env variables`
  - `docs(deploy): update deployment docs for firebase auth`

- `.env*`, `node_modules`, 빌드 결과물은 커밋하지 않는다.
- 의문이 생기면 “Firebase Auth + EC2 + MariaDB + Nginx + CI/CD + 만점 기준” 이라는 큰 목표에 맞게 선택한다.

---
## 9. Gemini 3.0이 작성한 agents.md 
   # AGENTS – Caraban (캠핑장 예약 플랫폼)

이 문서는 **codex max x high CLI**에게 이 레포지토리의 맥락, 목표, 그리고 **학기 과제 고득점 전략**을 설명하기 위한 가이드다.  
너는 이 레포에서 동작하는 **AI 페어 프로그래머 & DevOps 엔지니어**다.

---

# 0. TL;DR – 너의 역할

- 이 레포는 **캠핑장 예약/관리 플랫폼**이다.
- 목표는 **수업 과제에서 만점(Level 3) 기준에 해당하는 수준**의
  - **기능 완성도** (일반 사용자 + 사업자 + 관리자)
  - **프로덕션급 배포** (EC2 + 도메인 + HTTPS + CI/CD + DB/로그 분리 + Systemd)
  를 달성하는 것이다.
- 핵심 인증 구조:
  - **Frontend:** Firebase Auth (Email/PW + Google) -> ID Token 획득
  - **Backend:** Firebase Admin SDK로 Token 검증 -> DB `users` 테이블 매핑 -> 세션 관리
- **너의 최우선 미션:**
  > 기존 아키텍처를 유지하면서 **Firebase Auth**를 연동하고, **과제 채점 기준표(Rubric)**를 완벽히 충족하는 **AWS EC2 배포 파이프라인**을 구축하는 것.

---

## 1. 프로젝트 맥락 & 만점(Level 3) 달성 기준

# 1.1 프로젝트 요약

- 이름: **Caraban – 캠핑장 예약 플랫폼**
- 타겟: 일반 사용자(예약), 사업자(관리), 관리자(모니터링)

# 1.2 채점 기준별 구현 요구사항 (필수 준수)

1. **기능 (기본)**
   - Firebase Auth 기반 로그인 (이메일, 구글)
   - CRUD (캠핑장, 예약, 리뷰) 및 검색/필터링

2. **배포/인프라 (Level 3 - 고급 배포)**
   - **HTTPS 적용:** Let's Encrypt + Nginx (Reverse Proxy)
   - **도메인 연결:** 가비아/Route53 등 실제 도메인과 EC2 IP 연결
   - **CI/CD:** GitHub Actions로 main 브랜치 push 시 자동 배포
   - **DB 분리:** `docker-compose` 서비스 레벨에서 App과 DB(MariaDB)를 분리하고, **Docker Volume**으로 데이터 영속성 보장
   - **프로세스 관리:** Docker 컨테이너를 관리하기 위해 **Systemd 서비스 등록** (재부팅 시 자동 실행)
   - **로그 관리:** `winston-daily-rotate-file`을 적용하여 로그 로테이션 및 에러 로그 파일 분리

3. **문서/발표**
   - 시스템 아키텍처 다이어그램 (Mermaid) 포함
   - 배포 가이드 문서화

---

# 2. 리포지토리 구조 및 기술 스택

- `backend/`: Node.js + Express + TypeScript + MariaDB(Sequelize)
- `web/`: React + Vite + TypeScript + TailwindCSS + Firebase SDK
- `infra/`: Nginx 설정, Docker Compose 파일, Systemd 설정 파일 등
- `.github/workflows/`: CI/CD 파이프라인 정의

---

# 3. 기능 구현 가이드 (Auth & Business Logic)

# 3.1 인증(Auth) 흐름도

1. **Client (Web):** `firebase.auth().signInWithPopup()` -> ID Token 획득
2. **Client -> Server:** API 요청 헤더에 `Authorization: Bearer <ID_TOKEN>` 전송
3. **Server (Middleware):** `admin.auth().verifyIdToken(token)` 검증
   - 유효하면: DB에서 `firebaseUid`로 유저 조회 (없으면 생성 `findOrCreate`)
   - `req.user`에 유저 정보 할당 후 Controller로 전달

# 3.2 주요 기능
- **일반:** 캠핑장 검색(지도 연동), 예약, 결제(PortOne), 리뷰, 이메일 알림
- **사업자/관리자:** 대시보드 통계, 캠핑장 CRUD

---

# 4. 백엔드 구현 지침 (Firebase & Logging)

1. **Firebase Admin 설정**
   - `.env`의 `FIREBASE_PRIVATE_KEY` 처리 시 `\n` 개행 문자 치환 로직 필수 (`.replace(/\\n/g, '\n')`).
   - `config/firebase.ts` 싱글톤 패턴 유지.

2. **로그 관리 (과제 점수 포인트)**
   - 단순 `console.log` 지양.
   - `winston`과 `winston-daily-rotate-file` 패키지 설치.
   - `logs/error-%DATE%.log` 와 `logs/combined-%DATE%.log`로 파일 분리 저장.

3. **타입 안전성**
   - `req.user` 타입 확장 (`Express.Request` 인터페이스 확장)하여 TypeScript 오류 방지.

---

# 5. 프론트엔드 구현 지침

1. **Firebase SDK**
   - `.env` (Vite prefix: `VITE_`) 환경 변수 철저히 관리.
   - `lib/firebase.ts`에서 초기화.

2. **API 요청 인터셉터**
   - `axios` 인터셉터를 설정하여, 토큰 만료 시 자동으로 갱신(`user.getIdToken(true)`) 후 재요청하도록 구현하면 가산점 요소임.

---

# 6. 배포 & DevOps (핵심: 과제 만점 전략)

이 부분은 **AI 네가 직접 설정 파일(YAML, Conf, Service file)을 작성**해야 한다.

1. **Docker Compose 구성 (`docker-compose.prod.yml`)**
   - **Service 분리:** `frontend`(Nginx serving static), `backend`, `db`(MariaDB), `redis`(Option).
   - **Volume:** DB 데이터는 반드시 호스트 볼륨에 마운트하여 컨테이너 삭제 시에도 데이터 보존.
   - **Network:** 백엔드와 DB는 내부 네트워크로 통신.

2. **HTTPS & Nginx**
   - Nginx를 리버스 프록시로 설정.
   - 80포트 요청 시 443(HTTPS)으로 리다이렉트.
   - SSL 인증서 경로 마운트 설정.

3. **CI/CD (GitHub Actions)**
   - `build-and-deploy.yml`:
     - Test -> Build (Docker Image) -> Push (Docker Hub/GHCR) -> SSH 접속 -> Pull & Restart.
     - SSH 접속 시 `secrets.EC2_SSH_KEY` 사용.

4. **프로세스 관리 (Systemd)**
   - 과제 요구사항인 "Systemd로 프로세스 관리"를 충족하기 위해,
   - EC2 내부에서 `docker-compose up`을 관리하는 **systemd service unit 파일 (`caraban.service`)**을 작성하고 등록하는 스크립트를 제공하라.

---

# 7. 문서화 및 발표 준비 (AI 작성 요청)

너는 코드 뿐만 아니라 **문서**도 작성해야 한다.

1. **`README.md` 업데이트:**
   - 배포된 URL 명시 (가장 상단).
   - 실행 방법 (Local vs Prod).

2. **`docs/ARCHITECTURE.md` 생성:**
   - 아래 내용을 포함한 **Mermaid 다이어그램** 코드 작성:
     - **Sequence Diagram:** Firebase Login -> Server Token Verify -> DB Query Flow.
     - **Deployment Diagram:** User -> Nginx(EC2) -> Docker Containers (Web, API, DB).

---

# 8. 작업 가이드라인 (Constraint Checklist)

작업을 수행하기 전/후에 다음 리스트를 체크하라.

- [ ] **기존 코드 보존:** 멀쩡한 비즈니스 로직을 덮어쓰지 않았는가?
- [ ] **환경변수 분리:** `.env` 파일이 `.gitignore`에 포함되었는가?
- [ ] **채점 기준 준수:** - [ ] HTTPS 접속이 되는가?
    - [ ] DB 컨테이너를 껐다 켜도 데이터가 남는가?
    - [ ] 로그 파일이 생성되는가?
    - [ ] EC2 재부팅 시 서버가 자동 실행되는가? (Systemd)

---
## 10. 과제의 전문
? 과제 개요
1. 과제명: 카라반 일반 이용자용 앱 개발 (AI IDE 활용 + 클라우드 배포)
개발 환경: AI IDE (Cursor, GitHub Copilot, Windsurf, CLAUDE CODE GEMINI CLI 등) 활용
제출 방식: GitHub Repository 링크 + 배포 URL (선택)


2. 클라우드 배포 (고득점 옵션)

AWS EC2 또는 Google Cloud Compute Engine에 앱 배포
실제 접속 가능한 URL 제공
HTTPS 적용 권장 (Let's Encrypt 등)


3. 기말 발표방식 : github repository 실제 배포 방법 제공
클라우드 배포(옵션) 를 5분이내 설명


? 과제 제출 방법 및 기한
제출 방법

와플 과제 제출란에 GitHub Repository URL 제출
제출 시 포함 정보: 프로젝트 코드를 GitHub Public Repository에 업로드, GitHub Repository 링크, 앱 실행 방법 (간략히)
테스트 계정 정보 (필요시)


Level 1: 기본 배포 (10점)

EC2/Compute Engine 인스턴스에 앱 배포
Public IP로 접속 가능
README에 접속 URL 명시


Level 2: 중급 배포 (15점 = 10+5)

Level 1 + HTTPS 적용
환경 변수 분리 관리
PM2 또는 systemd로 프로세스 관리


Level 3: 고급 배포 (20점 = 10+10)

Level 2 + 도메인 연결
CI/CD 자동 배포
데이터베이스 분리
로그 관리 시스템
