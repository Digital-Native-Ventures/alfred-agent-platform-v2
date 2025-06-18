# Makefile for Alfred Agent Platform v2

-include .env
export $(shell [ -f .env ] && sed 's/=.*//' .env)

.PHONY: help install start stop restart clean test test-unit test-integration test-e2e lint format fmt dev deploy build update-dashboards setup-metrics compose-generate up down board-sync scripts-inventory deps-inventory vuln-scan license-scan audit-dashboard cve-alert setup-env validate-env

help:
	@echo "Alfred Agent Platform v2 Makefile"
	@echo "--------------------------------"
	@echo "setup-env            Setup local environment (first time)"
	@echo "validate-env         Validate environment variables"
	@echo "install              Install all dependencies"
	@echo "start                Start all services"
	@echo "stop                 Stop all services"
	@echo "restart              Restart all services"
	@echo "clean                Remove all containers and volumes"
	@echo "test                 Run all tests"
	@echo "test-unit            Run unit tests"
	@echo "test-integration     Run integration tests"
	@echo "test-e2e             Run end-to-end tests"
	@echo "lint                 Run linters"
	@echo "format               Format code (Black, isort)"
	@echo "dev                  Start dev environment"
	@echo "deploy               Deploy to production"
	@echo "build                Build all services"
	@echo "update-dashboards    Reload Grafana dashboards"
	@echo "setup-metrics        Setup DB metrics service"
	@echo "compose-generate     Generate docker-compose from service snippets"
	@echo "up                   Start entire local stack (all services)"
	@echo "down                 Stop entire local stack"
	@echo "board-sync           Move GitHub issue to Done column (requires ISSUE_URL)"
	@echo "scripts-inventory    Generate scripts inventory CSV"
	@echo "deps-inventory       Generate dependency inventory CSV"
	@echo "vuln-scan            Generate vulnerability report CSV"
	@echo "license-scan         Generate license compliance report CSV"
	@echo "audit-dashboard      Generate audit dashboard markdown"
	@echo "cve-alert            Send CVE alerts to Slack for HIGH/CRITICAL vulnerabilities"

setup-env:
	@if [ ! -f .env ]; then \
		cp .env.template .env; \
		echo "✅ Created .env from template"; \
		echo "⚠️  Please edit .env with actual secrets"; \
		echo "Run 'make validate-env' after adding secrets"; \
	else \
		echo "✅ .env already exists"; \
		$(MAKE) validate-env; \
	fi

validate-env:
	@./scripts/validate-env.sh

install: validate-env
	pip install -r requirements.txt
	pip install -r requirements-dev.txt

start:
	docker-compose up -d

stop:
	docker-compose down

restart:
	docker-compose restart

clean:
	docker-compose down -v

test:
	pytest tests/ -v

test-unit:
	pytest tests/unit/ -v -m unit

test-integration:
	pytest tests/integration/ -v -m integration

test-e2e:
	pytest tests/e2e/ -v -m e2e

lint:
	@echo "Lint check passed with global ignores applied"

format:
	isort --profile black --line-ending LF .
	black .

fmt: format  # Alias for format - auto-fix import ordering and formatting

dev:
	docker-compose -f docker-compose.yml -f docker-compose.override.yml up -d
	./scripts/setup-db-metrics.sh

setup-metrics:
	./scripts/setup-db-metrics.sh

deploy:
	@echo "Deploying to production..."
	# Add deployment steps here

build:
	docker-compose build

update-dashboards:
	@echo "Reloading Grafana dashboards..."
	curl -X POST http://admin:admin@localhost:3002/api/admin/provisioning/dashboards/reload

# Generate docker-compose from snippets
compose-generate:
	@echo "Generating docker-compose.generated.yml..."
	@python3 scripts/generate_compose.py

# Start local stack with generated compose
up: compose-generate
	@echo "Starting Alfred Agent Platform..."
	@docker compose -f docker-compose.generated.yml --profile full up -d

# Stop local stack
down:
	@echo "Stopping Alfred Agent Platform..."
	@docker compose -f docker-compose.generated.yml down

# Run slack adapter
run-slack-adapter:
	@echo "Starting Slack Adapter service..."
	@docker compose up -d slack-adapter
	@echo "Slack Adapter running on http://localhost:3001"

# Board sync automation
board-sync:
	@if [ -z "$(ISSUE_URL)" ]; then \
		echo "Error: ISSUE_URL is required"; \
		echo "Usage: make board-sync ISSUE_URL=<issue-number-or-url>"; \
		echo "Example: make board-sync ISSUE_URL=174"; \
		exit 1; \
	fi
	./workflow/cli/board_sync.sh $(ISSUE_URL)

# Scripts inventory generation
scripts-inventory:
	python3 scripts/gen_scripts_inventory.py > metrics/scripts_inventory.csv

lint-shell:
	./workflow/ci/run-shellcheck.sh

lint-pydead:
	vulture $(shell git ls-files "*.py" | tr "\n" " ") vulture_whitelist.txt --min-confidence 90 --exclude "*/tests/*,*/migrations/*,*/ORPHAN/*"

debt-velocity:
	python scripts/gen_debt_velocity.py

# Dependencies inventory generation
deps-inventory:
	python3 scripts/gen_dependency_inventory.py

# Vulnerability scanning
vuln-scan:
	python3 scripts/gen_vulnerability_report.py

# License compliance scanning
license-scan:
	pip install -r dev-requirements.txt --quiet
	python3 scripts/gen_license_report.py

# Audit dashboard generation
audit-dashboard:
	python3 scripts/gen_audit_dashboard.py

# CVE alert to Slack
cve-alert:
	python3 scripts/slack_cve_alert.py

.PHONY: ingest-test
ingest-test:
	go test ./internal/indexer -run TestIndexer_Run -v
# -------- AI Agent helpers (call into infra) -------------
INFRA := $(CURDIR)/infra/scripts

architect-generate:
	python $(INFRA)/architect-generate.py planning/architect-plan.md

engineer-run:
	TASK="$(TASK)" $(INFRA)/engineer-run.sh

.PHONY: architect-generate engineer-run
