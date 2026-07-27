# API Design Standards

## Philosophy

APIs are contracts.

Once published, they should remain stable.

Breaking changes must be versioned.

The API must be:

- Predictable
- Secure
- Consistent
- Documented
- Versioned
- Scalable

--------------------------------------------------

## API Style

REST API

Future:

GraphQL (Optional)

Public API

Webhook Support

--------------------------------------------------

## URL Naming

Use nouns.

Good

/api/v1/businesses

/api/v1/products

/api/v1/orders

/api/v1/invoices

Bad

/getProducts

/createBusiness

/deleteUser

--------------------------------------------------

## HTTP Methods

GET

Retrieve resources

POST

Create resources

PUT

Replace resource

PATCH

Partial update

DELETE

Delete resource

--------------------------------------------------

## API Versioning

Always use versioning.

/api/v1/

Future

/api/v2/

Never break existing clients.

--------------------------------------------------

## Response Format

Every response must follow the same structure.

Success

{
  "success": true,
  "message": "Product created successfully.",
  "data": {},
  "meta": {}
}

Error

{
  "success": false,
  "message": "Validation failed.",
  "errors": [],
  "code": "VALIDATION_ERROR"
}

--------------------------------------------------

## Status Codes

200 OK

201 Created

204 No Content

400 Bad Request

401 Unauthorized

403 Forbidden

404 Not Found

409 Conflict

422 Validation Error

429 Too Many Requests

500 Internal Server Error

--------------------------------------------------

## Pagination

Preferred

Cursor Pagination

Response

{
    "items": [],
    "nextCursor": "...",
    "hasMore": true
}

Avoid Offset Pagination on large tables.

--------------------------------------------------

## Filtering

Example

GET

/products

?category=cars

&status=active

&city=cairo

--------------------------------------------------

## Sorting

Example

?sort=name

?sort=-createdAt

Prefix (-) means descending.

--------------------------------------------------

## Searching

Example

?q=Toyota

Future

ElasticSearch

--------------------------------------------------

## Validation

Every request must validate:

Body

Params

Query

Headers

Files

Reject unknown fields.

Whitelist DTOs.

--------------------------------------------------

## DTO Rules

Never expose Prisma models.

Always use DTOs.

Separate

Create DTO

Update DTO

Response DTO

--------------------------------------------------

## Authentication

JWT

Google OAuth

Future

Apple

Microsoft

Passkeys

--------------------------------------------------

## Authorization

Every endpoint must verify permissions.

Never trust frontend.

RBAC

Permission Based

--------------------------------------------------

## Rate Limiting

Authentication

5/min

Search

100/min

Create

30/min

Configurable.

--------------------------------------------------

## Idempotency

Critical operations must support idempotency.

Examples

Payments

Invoices

Subscriptions

--------------------------------------------------

## Error Messages

Never expose

Stack Trace

SQL Errors

Internal Paths

Secrets

Always return friendly messages.

--------------------------------------------------

## Logging

Log

Request ID

User ID

Business ID

Execution Time

IP Address

Device

Never log

Passwords

Tokens

Secrets

--------------------------------------------------

## File Upload

Return signed URLs.

Never expose storage paths.

--------------------------------------------------

## API Documentation

Swagger Required.

Every endpoint must contain:

Description

Parameters

Responses

Examples

Authentication

Permissions

--------------------------------------------------

## Performance

Compress responses.

Cache when possible.

Avoid N+1 queries.

Use indexes.

Limit payload size.

--------------------------------------------------

## Security

Helmet

CORS

Validation Pipe

Rate Limit

RBAC

Audit Logs

CSRF (if applicable)

HTTPS

Security Headers

--------------------------------------------------

## Future Ready

Public API

Partner API

Webhook System

API Keys

OAuth Clients

SDK Support

Developer Portal

--------------------------------------------------

## AI Rules

Before creating a new endpoint ask:

Can an existing endpoint be reused?

Is the naming consistent?

Is the response standardized?

Is pagination required?

Is caching required?

Does it leak sensitive data?

Does it require audit logging?

Will this endpoint still be valid after 10 million records?

If not,

Redesign before implementation.