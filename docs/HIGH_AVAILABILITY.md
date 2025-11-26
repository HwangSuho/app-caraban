# High Availability & Resilience

This stack targets coursework needs but outlines how to harden it for production-level uptime.

## 1) Data Durability
- MariaDB data persisted via `db_data` volume; back up with `mariabackup` or `mysqldump` on a cron to S3.
- Consider moving DB to managed RDS for multi-AZ and snapshots.
- App logs rotate to `./logs` via Winston; ship to CloudWatch/ELK for retention.

## 2) Stateless App Containers
- Backend/frontend are stateless and can be scaled horizontally:
  - Add `deploy.replicas` when running on Swarm/Kubernetes.
  - Put Nginx/ALB in front of multiple backend instances.

## 3) Health & Readiness
- API: `/api/health` returns `{ status: "ok" }`.
- DB: MariaDB healthcheck in `docker-compose.yml`.
- Add application-level probes for DB connectivity and background workers if added later.

## 4) HTTPS & Certificates
- Terminate TLS at host-level Nginx or ALB. Sample host config: `config/nginx/host-https.conf` (proxies to web container on `127.0.0.1:8080`).
- Auto-renew with certbot timer (`systemctl list-timers`); alert on expiry.

## 5) Systemd Autorestart
- `infrastructure/systemd/caraban.service` restarts the compose stack on boot or failure, calling `docker-compose.prod.yml`. Keep repo at `/opt/caraban` and point the unit there.
- Use `docker-compose.prod.yml` for production so ports remain private and nginx terminates TLS on the host.

## 6) CI/CD Safety
- Staged deploy: build/push images, then `docker compose pull && docker compose up -d`.
- Rollback: keep previous image tags (`:previous`) to revert quickly.

## 7) Observability
- Structured logs via Winston; attach JSON transport to CloudWatch/ELK.
- Add metrics (Prometheus + node_exporter) and alerts on 5xx, DB CPU, disk usage.
