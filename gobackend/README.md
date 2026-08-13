# Ray Go Backend

Phase 0 foundation for the full rewrite of the Ray marketplace backend in Go.

## What is implemented

- Modular monolith layout (`cmd/`, `internal/domains/`, `internal/platform/`).
- Configuration loading with validation (`internal/config`).
- Structured logging with zap (`internal/platform/logger`).
- PostgreSQL connection via `pgx` with optional migrations (`internal/platform/db`).
- Redis client with graceful degradation (`internal/platform/redis`).
- Prometheus metrics (`internal/platform/telemetry`).
- Middleware stack:
  - Request ID, structured logger, compression, security headers, CORS.
  - Admin IP allowlist, CSRF, idempotency, global + auth rate limiting.
  - JWT authentication (required / optional), panic recovery, domain error handler.
- Health/readiness endpoints (`/monitoring/ready`, `/monitoring/live`, `/metrics`).
- Worker binary stub using `asynq` (`cmd/worker`).
- Docker multi-stage builds and local docker-compose.
- CI job in `.github/workflows/ci.yml`.

## Quick start

1. Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

2. Start dependencies with Docker:

   ```bash
   docker-compose up -d postgres redis
   ```

3. Download dependencies and run the API:

   ```bash
   go mod download
   go run ./cmd/api
   ```

4. Test readiness:

   ```bash
   curl http://localhost:4000/monitoring/ready
   ```

## Build

```bash
make build        # builds both api and worker binaries
make test         # runs go test ./...
make race         # runs tests with race detector
make vet          # runs go vet
```

## Docker

```bash
docker-compose up --build
```

This exposes the API on `http://localhost:4001`.

## Database migrations

For Phase 0 the existing Prisma schema remains the source of truth. Set
`DB_MIGRATE_ON_BOOT=false` while the same database is shared with the Node backend.

When the project is fully migrated to Go migrations, place SQL files under
`migrations/` and use `golang-migrate`:

```bash
make migrate-up
```

## sqlc code generation

Generate type-safe repository code from SQL queries:

```bash
sqlc generate
```

Before the first generation, populate `sqlc/schema.sql` from the current database:

```bash
pg_dump --schema-only --no-owner --no-privileges -f sqlc/schema.sql <DATABASE_URL>
```

## Project structure

```
gobackend/
├── cmd/
│   ├── api/           # HTTP server entrypoint
│   └── worker/        # Background worker entrypoint
├── internal/
│   ├── app/           # Fiber wiring, middleware order, routes
│   ├── config/        # Environment configuration & validation
│   ├── domains/       # Business domains (health, auth, shops, orders, ...)
│   ├── platform/      # Cross-cutting concerns (db, redis, logger, middleware, telemetry, errors, validate)
│   └── generated/     # sqlc generated code (created later)
├── migrations/        # golang-migrate SQL migrations
├── sqlc/              # Hand-written SQL queries + schema
├── tests/             # Integration, load, security tests
├── Dockerfile
├── Dockerfile.worker
├── docker-compose.yml
└── Makefile
```

## Next steps

Phase 1 starts with the **Auth** domain (login, signup, JWT, password reset,
email verification) followed by **Users** and **Shops**. Each domain is added as
an `internal/domains/<name>` package and wired into `internal/app/app.go`.
