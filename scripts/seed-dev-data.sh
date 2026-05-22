#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "Re-seeding watch-store development database..."

if ! command -v docker >/dev/null 2>&1; then
  echo "Error: docker is required." >&2
  exit 1
fi

echo "Stopping services and removing postgres volume..."
docker compose down -v

echo "Starting postgres and redis..."
docker compose up -d postgres redis

echo "Waiting for postgres to become healthy..."
until docker compose exec -T postgres pg_isready -U watchstore -d watchstore >/dev/null 2>&1; do
  sleep 1
done

echo "Starting API to apply Flyway migrations and seed data..."
docker compose up -d --build api

echo "Waiting for API health check..."
until curl -sf http://localhost:8080/api/v1/ping >/dev/null 2>&1; do
  sleep 2
done

PRODUCT_COUNT="$(curl -sf http://localhost:8080/api/v1/products | grep -o '"totalElements":[0-9]*' | head -1 | cut -d: -f2)"
echo "Seed complete. Catalog products: ${PRODUCT_COUNT:-unknown}"

echo "Run 'make up' to start the full stack."
