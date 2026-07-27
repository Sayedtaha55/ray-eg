# Backend Standards

Stack

NestJS

Prisma

Redis

BullMQ

Socket.IO

-----------------------------------

## Controllers

Thin.

Only:

Validation

Authentication

Authorization

Call Service

Return Response

-----------------------------------

## Services

Contain business logic.

No HTTP layer.

No Prisma inside controllers.

-----------------------------------

## DTO

Every endpoint must use DTO.

Validation required.

-----------------------------------

## Validation

class-validator

class-transformer

Whitelist enabled.

Forbid unknown values.

-----------------------------------

## Events

Use events for:

Notifications

Emails

Logs

Analytics

Search Index

Background Jobs

-----------------------------------

## Background Jobs

BullMQ

Never block requests.

-----------------------------------

## Logging

Use Pino.

Structured logging.

Correlation IDs.

-----------------------------------

## Errors

Centralized Exception Filter.

Standard API response.

-----------------------------------

## Cache

Redis

Only cache expensive operations.

Invalidate cache correctly.

-----------------------------------

## Socket.IO

Authenticate every connection.

Authorize every event.

Disconnect invalid clients.