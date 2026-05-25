# Local Development

Definitive guide for running the Watch Store monorepo on your machine. For system design context see [architecture.md](./architecture.md); for REST details see [api.md](./api.md); for production see [deployment.md](./deployment.md).

---

## Prerequisites

| Tool | Version | Notes |
|------|---------|--------|
| Docker Desktop / Engine | Compose v2 | Required for full stack and API integration tests |
| Node.js | 22 LTS | `corepack enable pnpm` |
| pnpm | 9.x | Workspace package manager |
| Java | 21 (optional) | Only if running API outside Docker |
| Maven | 3.9+ (optional) | Bundled wrapper: `services/api/mvnw` |
| Stripe CLI | Latest (optional) | Local webhook forwarding for checkout |

---

## Environment configuration

Copy [`.env.example`](../.env.example) to `.env` at the repo root for production-oriented variables. **Docker Compose** injects most dev defaults directly in [`docker-compose.yml`](../docker-compose.yml).

### API (local Compose defaults)

| Variable | Local value | Purpose |
|----------|-------------|---------|
| `SPRING_PROFILES_ACTIVE` | `dev` | Dev Flyway seeds, relaxed security |
| `DB_*` | `postgres:5432/watchstore` | PostgreSQL |
| `REDIS_HOST` / `REDIS_PORT` | `redis:6379` | Cart, cache, locks |
| `S3_ENDPOINT` | `http://localstack:4566` | LocalStack S3 |
| `JWT_SECRET` | dev secret in compose | JWT signing (change in prod) |
| `CORS_ORIGINS` | `http://localhost:3000,3002,3003` | Browser origins |
| `STRIPE_ENABLED` | set in `.env` for real Test Mode | Use `sk_test_` / `whsec_` |
| `APP_MAIL_ENABLED` | `false` (default) | Logs emails instead of SES |

### Frontends (`pnpm dev`)

Create `apps/web/.env.local` and `apps/admin/.env.local` as needed:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
# Optional: resolve S3 keys to URLs (LocalStack or real bucket)
# NEXT_PUBLIC_S3_IMAGE_BASE_URL=http://localhost:4566/watch-store-images
```

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | Spring API base (must match CORS entry for your port) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe.js on checkout |
| `NEXT_PUBLIC_S3_IMAGE_BASE_URL` | Prefix for product/GLB keys returned by API |
| `S3_IMAGE_HOSTNAME` | Next.js image remotePatterns (Docker web build) |

### Port and CORS note

| Mode | Customer URL | CORS |
|------|--------------|------|
| `make up` (Docker web) | http://localhost:**3003** | Included in compose |
| `pnpm dev:web` | http://localhost:**3000** | Included in compose |

If the browser blocks API calls, confirm your origin is listed in `CORS_ORIGINS` and that `NEXT_PUBLIC_API_URL` points to `http://localhost:8080`.

---

## Docker Compose service matrix

| Service | Host port | Depends on | Role |
|---------|-----------|------------|------|
| `postgres` | 5432 | — | Primary database |
| `redis` | 6379 | — | Sessions, cart, catalog cache, checkout |
| `localstack` | 4566 | — | S3 API (dev assets) |
| `api` | 8080 | postgres, redis, otel-collector | Spring Boot |
| `web` | 3003 (via `WEB_HOST_PORT`) | api | Customer Next.js image |
| `admin` | 3002 | api | Admin Next.js image |
| `prometheus` | 9090 | api | Metrics |
| `grafana` | 3001 | prometheus | Dashboards |
| `jaeger` | 16686 | — | Trace UI |
| `otel-collector` | 4317, 4318 | jaeger | OTLP |

Healthchecks: Postgres and Redis gate API startup; API healthcheck hits `/actuator/health`.

---

## Bootstrap paths

### Full stack (recommended)

```bash
make up
```

Builds and starts all services. First API boot runs Flyway migrations and dev seeds.

```bash
curl http://localhost:8080/api/v1/ping
# {"status":"ok"}
```

### Frontend-only

Requires API already running (`make up` or API-only below).

```bash
pnpm install
pnpm dev:web      # http://localhost:3000
pnpm dev:admin    # http://localhost:3002
```

### API-only (IDE / Maven)

```bash
docker compose up -d postgres redis localstack
cd services/api
export SPRING_PROFILES_ACTIVE=dev
export DB_HOST=localhost DB_PORT=5432 DB_NAME=watchstore DB_USER=watchstore DB_PASSWORD=watchstore
export REDIS_HOST=localhost REDIS_PORT=6379
export S3_ENDPOINT=http://localhost:4566
export JWT_SECRET=dev-secret-key-change-in-production-min-256-bits
export CORS_ORIGINS=http://localhost:3000,http://localhost:3002,http://localhost:3003
./mvnw spring-boot:run
```

Mirror any additional variables from [`docker-compose.yml`](../docker-compose.yml) `api.environment`.

### Stop and reset

```bash
make down
docker compose down -v   # removes volumes (wipes DB)
```

### Re-seed catalog

```bash
make seed
# or: ./scripts/seed-dev-data.sh
```

Resets Postgres volume and reapplies migrations with demo products.

---

## Stripe Test Mode (local)

1. Create Stripe Test keys in the Dashboard.
2. Add to `.env` (loaded by Compose for `api` if configured):

   ```bash
   STRIPE_ENABLED=true
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

3. Set `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...` in `apps/web/.env.local`.
4. Forward webhooks:

   ```bash
   stripe listen --forward-to localhost:8080/api/v1/webhooks/stripe
   ```

5. Copy the CLI signing secret into `STRIPE_WEBHOOK_SECRET`.
6. Run checkout on the customer app; confirm payment with [Stripe test cards](https://docs.stripe.com/testing).

See [deployment.md](./deployment.md) for production webhook URL configuration.

---

## 3D assets and Virtual Try-On

1. Open admin: http://localhost:3002 — log in as a seeded admin user.
2. **Inventory → Products** — select a product and upload a `.glb` via **3D model** upload (`POST /api/v1/admin/products/{id}/model-3d`).
3. File is stored in LocalStack S3 under `products/{id}/models/…`; key saved to `products.model_3d_url`.
4. Open the product on the customer app PDP:
   - **3D tab** — [`WatchViewer3D`](../apps/web/src/components/watch-viewer-3d.tsx) orbit viewer.
   - **Try on** — opens VTO overlay; **GLB-primary** rendering in [`TryOnWatchCanvas`](../apps/web/src/components/try-on-watch-canvas.tsx) with 2D fallback if load fails.

If models do not render, set `NEXT_PUBLIC_S3_IMAGE_BASE_URL` to your LocalStack public URL pattern and ensure the bucket exists (seed scripts or first upload create keys).

---

## Email (local)

With `APP_MAIL_ENABLED=false` (default), the API **logs** email payloads instead of calling AWS SES. Trigger flows:

- Register a new user (welcome email log line)
- Submit an enquiry (admin alert log line)
- Complete a paid order via Stripe webhook (order confirmation log line)

To test real SES locally, set `APP_MAIL_ENABLED=true` and AWS credentials (see [deployment.md](./deployment.md) SES section).

---

## Testing and quality

### API integration tests (Testcontainers)

Requires Docker daemon:

```bash
make api-test
# equivalent: cd services/api && ./mvnw test
```

### Customer web unit tests

```bash
pnpm --filter @watch-store/web test
pnpm --filter @watch-store/web lint
pnpm --filter @watch-store/web build
```

### Admin web

```bash
pnpm --filter @watch-store/admin lint
pnpm --filter @watch-store/admin build
```

### CI parity

GitHub Actions workflows:

- [`.github/workflows/ci-api.yml`](../.github/workflows/ci-api.yml) — Maven test
- [`.github/workflows/ci-web.yml`](../.github/workflows/ci-web.yml) — pnpm lint/build for web and admin

---

## Observability (local)

| Tool | URL | Credentials |
|------|-----|-------------|
| Swagger UI | http://localhost:8080/swagger-ui.html | — |
| Actuator health | http://localhost:8080/actuator/health | — |
| Prometheus | http://localhost:9090 | — |
| Grafana | http://localhost:3001 | admin / admin |
| Jaeger | http://localhost:16686 | — |

Dashboards provisioned from [`infra/docker/grafana/`](../infra/docker/grafana/).

---

## Troubleshooting

### Docker disk full

If `make up` fails with `No space left on device` or Postgres exits immediately:

```bash
make clean-docker
make up
```

Increase Docker Desktop **Settings → Resources → Disk image size** if needed.

### API not reachable from browser

- Confirm `api` container healthy: `docker compose ps`
- Check `NEXT_PUBLIC_API_URL` matches host port **8080**
- Verify CORS includes your frontend origin (3000 vs 3003)

### Refresh cookie / auth on cross-origin dev

Local same-site cookies work when web and API share a registrable domain. For cross-origin setups mimicking production, set `REFRESH_COOKIE_SECURE` and `SameSite=None` per [deployment.md](./deployment.md).

### Checkout 409 / 410

- **409** — Another checkout lock active for your user/session; wait 15 minutes or clear Redis key.
- **410** — Reservation expired; restart checkout from cart.

### Stripe webhook not updating orders

- Ensure `stripe listen` is running and `STRIPE_WEBHOOK_SECRET` matches CLI output.
- Confirm `STRIPE_ENABLED=true` on the API.

---

## Related documentation

- [architecture.md](./architecture.md) — Checkout locking, caching, 3D pipeline diagrams
- [api.md](./api.md) — Endpoint catalog and auth
- [deployment.md](./deployment.md) — Production hosting checklist
