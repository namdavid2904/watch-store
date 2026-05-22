.PHONY: up down logs api-test web-install help

help:
	@echo "Watch Store — development commands"
	@echo "  make up       Start all services (docker compose)"
	@echo "  make down     Stop all services"
	@echo "  make logs     Tail service logs"
	@echo "  make api-test Run API integration tests"

up:
	docker compose up -d --build

down:
	docker compose down

logs:
	docker compose logs -f

api-test:
	cd services/api && ./mvnw test

web-install:
	pnpm install
