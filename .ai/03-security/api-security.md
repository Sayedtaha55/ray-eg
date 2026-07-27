# API Security

## Philosophy

Every API endpoint is an attack surface.

Treat every request as hostile until proven otherwise.

-------------------------------------

## CORS

Never use wildcard (*) in production.

Whitelist specific origins.

Example

https://mnmknk.com

https://api.mnmknk.com

https://admin.mnmknk.com

Configure allowed methods per route.

Configure allowed headers explicitly.

Expose only required headers.

-------------------------------------

## Security Headers

Use Helmet.

Strict-Transport-Security (HSTS)

X-Content-Type-Options: nosniff

X-Frame-Options: DENY

Content-Security-Policy

Referrer-Policy: strict-origin-when-cross-origin

Permissions-Policy

Never expose server information.

Remove X-Powered-By.

-------------------------------------

## Input Validation

Validate every input.

Body

Query Parameters

Route Parameters

Headers

Cookies

Files

Use class-validator with whitelist enabled.

Use forbidNonWhitelisted to reject unknown fields.

Use transform to convert types.

Never accept raw JSON without schema.

Never trust client-side serialization.

-------------------------------------

## SQL Injection Prevention

Never use raw string interpolation in queries.

Always use Prisma parameterized queries.

If $queryRaw is required, always use tagged templates.

Never concatenate user input into SQL.

Validate and cast all identifiers.

-------------------------------------

## XSS Prevention

Sanitize all user-generated HTML.

Use sanitize-html on server.

Use dompurify on client.

Set Content-Security-Policy headers.

Never use dangerouslySetInnerHTML without sanitization.

Never render user input as raw HTML.

-------------------------------------

## CSRF Protection

Use SameSite cookies.

Set SameSite=Lax or SameSite=Strict.

Validate Origin header for state-changing requests.

Use CSRF tokens for cookie-based auth.

Never allow cross-origin state changes without verification.

-------------------------------------

## Rate Limiting

Authentication endpoints

5 requests per minute

Login

Signup

Password reset

OTP verification

Search endpoints

100 requests per minute

Create endpoints

30 requests per minute

General API

1000 requests per minute per user

Use Redis-backed counters.

Return 429 with Retry-After header.

Never reveal rate limit internals in error messages.

-------------------------------------

## Request Size Limits

Body size limit

1 MB default

File upload limit

Configurable per endpoint

Never accept unlimited payload sizes.

Reject requests exceeding limits early.

-------------------------------------

## Timeout

Set request timeout.

Default

30 seconds

Long operations

Use background jobs.

Never let requests hang indefinitely.

-------------------------------------

## Error Handling

Never expose stack traces.

Never expose SQL errors.

Never expose internal file paths.

Never expose environment variables.

Return standardized error responses.

Use centralized exception filter.

Log full error internally.

Return friendly message externally.

-------------------------------------

## API Key Security (Future)

Store API keys hashed.

Never store in plaintext.

Never log API keys.

Rotate keys regularly.

Support key revocation.

Scope keys to specific permissions.

Set expiration dates.

-------------------------------------

## Webhook Security (Future)

Sign all webhooks with HMAC.

Use timestamp to prevent replay attacks.

Verify signature on receipt.

Never process unsigned webhooks.

Return 200 immediately.

Process asynchronously.

-------------------------------------

## Dependency Security

Run npm audit regularly.

Never ignore critical CVEs.

Update vulnerable packages immediately.

Review new dependencies before adding.

Never install packages with known vulnerabilities.

-------------------------------------

## API Security Checklist

Before deploying any endpoint verify:

Authentication required?

Authorization checked?

Input validated?

Output sanitized?

Rate limited?

Errors handled safely?

Secrets not exposed?

Logs don't contain sensitive data?

CORS configured?

Security headers set?