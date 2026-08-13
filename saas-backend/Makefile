.PHONY: build run test db-up db-down sqlc-gen clean

# Build the binary
build:
	go build -o bin/saas-api ./cmd/api

# Run the server
run: build
	./bin/saas-api

# Run tests
test:
	go test ./... -v

# Start PostgreSQL via Docker Compose
db-up:
	docker compose up -d postgres
	@echo "Waiting for PostgreSQL to be ready..."
	@timeout 10 bash -c 'until docker compose exec postgres pg_isready -U saas; do sleep 1; done' || true
	@echo "PostgreSQL is ready"

# Stop PostgreSQL
db-down:
	docker compose down

# Generate Go code from SQL via sqlc
sqlc-gen:
	sqlc generate

# Clean build artifacts
clean:
	rm -rf bin/
