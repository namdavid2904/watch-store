.PHONY: up down logs api-test web-install seed clean-docker help

help:
	@echo "Watch Store — development commands"
	@echo "  make up           Start all services (docker compose)"
	@echo "  make down         Stop all services"
	@echo "  make clean-docker Reclaim Docker disk space (build cache and unused images)"
	@echo "  make logs         Tail service logs"
	@echo "  make seed         Re-seed development database"
	@echo "  make api-test     Run API integration tests"

up:
	docker compose up -d --build

down:
	docker compose down

clean-docker:
	docker builder prune -af
	docker image prune -af
	docker container prune -f

logs:
	docker compose logs -f

api-test:
	cd services/api && ./mvnw test

seed:
	./scripts/seed-dev-data.sh

web-install:
	pnpm install
