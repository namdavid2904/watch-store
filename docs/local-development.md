# Local Development

## Prerequisites

- Docker Desktop (or Docker Engine + Compose v2)
- Node.js 22 LTS and pnpm 9 (`corepack enable pnpm`)
- Java 21 and Maven 3.9+ (optional, for running the API outside Docker)

## Start the full stack

```bash
make up
```

| Service    | URL                                      |
|------------|------------------------------------------|
| Customer   | http://localhost:3003 (Docker default)   |
| Customer   | http://localhost:3000 (`pnpm dev:web`)   |
| Admin      | http://localhost:3002                    |
| API        | http://localhost:8080                    |
| Swagger UI | http://localhost:8080/swagger-ui.html    |
| Grafana    | http://localhost:3001 (admin / admin)    |
| Prometheus | http://localhost:9090                    |

Verify the API is healthy:

```bash
curl http://localhost:8080/api/v1/ping
# {"status":"ok"}
```

## Frontend-only development

Install dependencies once at the repo root:

```bash
pnpm install
```

Run apps against the Docker API:

```bash
pnpm dev:web    # http://localhost:3000
pnpm dev:admin  # http://localhost:3002
```

## API-only development

Start infrastructure:

```bash
docker compose up -d postgres redis localstack
```

Run the Spring Boot app from `services/api` with profile `dev` and env vars matching `docker-compose.yml`.

## Stop and reset

```bash
make down
docker compose down -v   # also remove volumes (database data)
```
