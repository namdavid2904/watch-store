# Watch Store

Production-grade watch e-commerce platform built as a pnpm monorepo.

## Stack

| Layer | Technology |
|-------|-----------|
| Customer UI | Next.js 15 (`apps/web`) |
| Admin UI | Next.js 15 (`apps/admin`) |
| API | Spring Boot 3, Java 21 (`services/api`) |
| Database | PostgreSQL 16 |
| Cache | Redis 7 |
| Observability | Prometheus + Grafana |

## Quick Start

```bash
# Start infrastructure + services
make up

# Customer app (Docker):  http://localhost:3003
# Customer app (local):   http://localhost:3000  (pnpm dev:web)
# Admin app:     http://localhost:3002
# API / Swagger: http://localhost:8080/swagger-ui.html
# Grafana:       http://localhost:3001  (admin / admin)
# Prometheus:    http://localhost:9090
```

## Monorepo Layout

```
apps/web/          Customer-facing Next.js app
apps/admin/        Admin dashboard Next.js app
packages/ui/       Shared UI components (shadcn/ui)
packages/api-client/  OpenAPI-generated TypeScript client
services/api/      Spring Boot REST API
infra/             Docker, K8s, Terraform configs
docs/              Architecture and deployment docs
```

## Development

See [docs/local-development.md](docs/local-development.md) for detailed setup instructions.
