# Software Architecture

## Architecture Style

The project follows a Modular Monolith architecture designed to evolve into Microservices when needed.

Current Architecture

Client

↓

API Gateway (Future)

↓

NestJS Application

↓

Feature Modules

↓

PostgreSQL

Redis

ElasticSearch

S3

BullMQ

----------------------------

## Principles

- Modular First
- Domain Driven Design (DDD)
- Clean Architecture
- SOLID
- DRY
- KISS
- Event Driven Ready
- Microservice Ready
- Plugin Ready

----------------------------

## Layers

Presentation

↓

Application

↓

Domain

↓

Infrastructure

----------------------------

## Controllers

Controllers must:

Only receive requests.

Validate input.

Call application services.

Return responses.

Never contain business logic.

----------------------------

## Services

Application Services

Coordinate business operations.

Domain Services

Contain business rules.

Infrastructure Services

Database.

Email.

Redis.

S3.

External APIs.

----------------------------

## Dependencies

Allowed

Controller

↓

Application

↓

Domain

↓

Infrastructure

Forbidden

Infrastructure

↓

Controller

----------------------------

## Rules

No circular dependencies.

No business logic in controllers.

No Prisma inside controllers.

No HTTP requests inside entities.

No duplicated logic.

Every module owns its data.

Every feature must be replaceable.