# 운영 점검 체크리스트 (Level 3 루브릭 대응)

- **배포/네트워크**
  - [ ] 도메인 → EC2 공인 IP로 A 레코드 연결
  - [ ] 호스트 Nginx에 `config/nginx/host-https.conf` 적용 후 `certbot --nginx -d <domain>`으로 TLS 발급/갱신
  - [ ] `docker-compose.prod.yml`로 서비스 기동 (`web:8080` → Nginx 리버스 프록시 80/443)

- **앱/인증**
  - [ ] `backend/.env`에 Firebase 서비스 계정, DB, CORS 오리진 설정
  - [ ] 프런트 빌드 시 `VITE_FIREBASE_*` 환경변수 주입 (CI/CD secrets 사용)
  - [ ] `/api/auth/firebase` 로그인 후 주요 API 호출 정상 확인

- **CI/CD**
  - [ ] GHCR 로그인용 `GHCR_DEPLOY_TOKEN` 등록, `EC2_HOST/USER/SSH_KEY` 시크릿 설정
  - [ ] `.github/workflows/deploy.yml` 실행 → `docker compose -f docker-compose.prod.yml pull && up -d` 자동 배포

- **시스템 안정성**
  - [ ] `infrastructure/systemd/caraban.service` 배포 후 `systemctl enable --now caraban` (재부팅 자동 재시작)
  - [ ] DB 볼륨 `db_data` 존재 및 재기동 시 데이터 유지 확인
  - [ ] 로그 로테이션: `backend/logs/combined-*.log`, `error-*.log` 생성 확인
  - [ ] 헬스체크 `GET /api/health` 모니터링 추가 (StatusCake/Pingdom 등)
  - [ ] DB 백업 크론/스냅샷 구성 (예: 주기적 `mysqldump` → S3)

- **데모/발표**
  - [ ] 시연 계정 및 플로우: Firebase 로그인 → 대시보드 → 캠핑장 목록/예약/리뷰 API 호출 시연
  - [ ] 장애 시나리오 대응: 컨테이너 재시작, 인증서 갱신 실패 시 nginx 로그 확인 경로 숙지
