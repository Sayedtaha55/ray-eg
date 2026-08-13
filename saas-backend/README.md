# SaaS Backend — Multi-tenant (Go + Fiber + PostgreSQL + sqlc)

A modern, high-performance multi-tenant SaaS backend built with Go, inspired by Shopify and Odoo architecture.

## Tech Stack

| Component       | Technology                          |
|-----------------|-------------------------------------|
| Language        | Go 1.24                             |
| Web Framework   | Fiber v2                            |
| Database        | PostgreSQL 15 (Docker Compose)      |
| DB Layer        | sqlc + pgx/v5 (type-safe SQL)       |
| Architecture    | Modular Monolith (single binary)    |
| Auth            | JWT (Access + Refresh) + bcrypt     |
| Multi-tenancy   | Subdomain / Custom Domain isolation |

## Project Structure

```
saas-backend/
├── cmd/api/main.go          # Entry point & server setup
├── db/
│   ├── schema.sql           # PostgreSQL schema (tables, enums, indexes)
│   └── query.sql            # SQL queries for sqlc code generation
├── internal/
│   ├── database/            # pgx/v5 connection pool
│   ├── db/                  # sqlc-generated Go code (type-safe queries)
│   ├── handlers/            # Fiber HTTP controllers
│   ├── middleware/          # Security + Tenant Isolation middleware
│   └── auth/                # JWT token service + auth middleware
├── docker-compose.yml       # PostgreSQL 15 container
├── sqlc.yaml                # sqlc configuration
├── Makefile                 # Build & dev commands
└── .env.example             # Environment variables template
```

## Quick Start

### 1. Start PostgreSQL

```bash
cp .env.example .env
make db-up
```

### 2. Generate sqlc code (optional — pre-generated code is included)

```bash
make sqlc-gen
```

### 3. Build & Run

```bash
make run
# or
go run ./cmd/api
```

Server starts on `http://localhost:8080`.

## API Examples

### Create a Store

```bash
curl -X POST http://localhost:8080/api/v1/stores \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Acme Shop",
    "slug": "acme",
    "subdomain": "acme"
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "name": "Acme Shop",
    "slug": "acme",
    "subdomain": "acme",
    "status": "pending",
    ...
  }
}
```

### Get Store by Domain

```bash
curl http://localhost:8080/api/v1/stores/domain/acme
```

### Get Store by ID

```bash
curl http://localhost:8080/api/v1/stores/{uuid}
```

### List Stores

```bash
curl http://localhost:8080/api/v1/stores?limit=20&offset=0
```

### Register a User (tenant-scoped)

```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Domain: acme" \
  -d '{
    "email": "admin@acme.com",
    "password": "password123",
    "role": "admin"
  }'
```

### Login

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Domain: acme" \
  -d '{
    "email": "admin@acme.com",
    "password": "password123"
  }'
```

Returns `access_token` (15min) + sets `refresh_token` HttpOnly cookie (7d).

### Refresh Access Token

```bash
curl -X POST http://localhost:8080/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token": "<your-refresh-token>"}'
```

### Get Current User (protected)

```bash
curl http://localhost:8080/api/v1/auth/me \
  -H "Authorization: Bearer <access-token>"
```

### Create a Product (protected, tenant-scoped)

```bash
curl -X POST http://localhost:8080/api/v1/products/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access-token>" \
  -H "X-Tenant-Domain: acme" \
  -d '{
    "name": "Coffee Mug",
    "description": "Ceramic mug",
    "price": 15.99,
    "stock": 100
  }'
```

### List Products (public, tenant-scoped)

```bash
curl http://localhost:8080/api/v1/products \
  -H "X-Tenant-Domain: acme"
```

### Update a Product (protected)

```bash
curl -X PATCH http://localhost:8080/api/v1/products/{uuid} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access-token>" \
  -H "X-Tenant-Domain: acme" \
  -d '{"price": 19.99, "stock": 50}'
```

### Delete a Product (protected)

```bash
curl -X DELETE http://localhost:8080/api/v1/products/{uuid} \
  -H "Authorization: Bearer <access-token>" \
  -H "X-Tenant-Domain: acme"
```

## Multi-tenancy

Tenant resolution happens in the `Tenant` middleware:

1. **X-Tenant-Domain header** — explicit tenant for API clients
2. **Host header** — subdomain extraction (`acme.app.com` → `acme`) or custom domain

The resolved store is injected into the request context. All tenant-scoped queries
must filter by `store_id` from the context.

## Security

- **bcrypt** for password hashing
- **JWT** with short-lived access tokens (15min) + refresh tokens (7d) in HttpOnly cookies
- **CORS** configurable via `CORS_ORIGINS`
- **Helmet** for security headers (XSS, HSTS, X-Frame-Options, etc.)
- **Rate Limiting** per IP (100 req/min default)
