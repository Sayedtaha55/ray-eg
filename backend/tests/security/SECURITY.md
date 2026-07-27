# Security Audit & Testing Guide

## Overview

This directory contains professional security testing scripts for the Ray-EG marketplace backend.

## Scripts

### 1. Static Security Scanner (`static-security-scan.ts`)

Scans source code for security vulnerabilities without running the server.

```bash
npm run security:scan
```

**Detects:**
- Hardcoded passwords, secrets, and API keys
- `Math.random()` usage in security contexts
- `eval()` and `Function()` constructor usage
- SQL injection patterns (`$queryRawUnsafe`, `$executeRawUnsafe`)
- Unvalidated `@Body() body: any` parameters
- Insecure cookie settings (`sameSite: none`)
- CORS wildcard configuration
- `dangerouslySetInnerHTML` and `innerHTML` XSS risks
- TLS certificate validation disabled
- JWT tokens in `localStorage`
- Direct cookie manipulation from frontend

### 2. Dynamic Security Audit (`security-audit.ts`)

Runs live HTTP tests against a running backend server.

```bash
# Against local server
npm run security:audit:local

# Against any server
npm run security:audit -- --base-url=https://your-api.com
```

**Tests performed:**
1. **Unauthenticated Access** — Verifies protected endpoints reject requests without auth
2. **CSRF Protection** — Tests mutations without/with invalid CSRF tokens
3. **Rate Limiting** — Brute force simulation on auth endpoints
4. **CORS Policy** — Verifies disallowed origins are blocked
5. **Security Headers** — Checks CSP, HSTS, X-Frame-Options, etc.
6. **Information Disclosure** — Health/monitoring endpoints don't leak system info
7. **Monitoring Access Control** — All monitoring endpoints require admin auth
8. **SQL Injection** — Tests common SQLi patterns in input fields
9. **XSS Protection** — Verifies XSS payloads are not reflected in responses
10. **Body Size Limit** — Tests DoS protection via large payloads
11. **JWT Validation** — Invalid/forged tokens are properly rejected
12. **Dev Bootstrap Protection** — Dev endpoints blocked in production
13. **DB Test Endpoint** — Disabled or auth-guarded in production

### 3. Run All Security Tests

```bash
npm run security:all
```

Runs static scan first, then dynamic audit against localhost:4000.

## Security Fixes Applied

### Critical
- ✅ Timing-safe comparison for admin bootstrap token (`crypto.timingSafeEqual`)
- ✅ Cryptographically secure CSRF token generation (`crypto.randomBytes`)
- ✅ Health/monitoring endpoints guarded with JWT + admin role
- ✅ All `Math.random()` replaced with `crypto.randomBytes`

### High
- ✅ CSP hardened: no `unsafe-inline` in `scriptSrc`
- ✅ Auth rate limiting with exponential backoff lockouts
- ✅ Cookie `sameSite` set to `lax`/`strict` (not `none`)
- ✅ CORS wildcard blocked in production
- ✅ Dev bootstrap endpoints removed from CSRF exempt list

### Medium
- ✅ Rate limiter uses `req.ip` (respects trust proxy) instead of raw `X-Forwarded-For`
- ✅ `@Body() body: any` replaced with typed DTOs on auth/media endpoints
- ✅ `dangerouslySetInnerHTML` replaced with safe `<style>` tags
- ✅ DB test controller disabled in production
- ✅ Body limit reduced from 50MB to 10MB

### Low
- ✅ JWT fallback secret only allowed in `development` (not staging)
- ✅ Error messages hide internal details in production
- ✅ CSRF cookie `sameSite: strict` in production
- ✅ Env validation warns about `CORS_ORIGIN=*` and large `BODY_LIMIT`

## Remaining Recommendations

1. **Replace remaining `@Body() body: any`** with typed DTOs across all controllers (74 instances)
2. **Migrate token storage** from `localStorage` to httpOnly cookies entirely (17 instances)
3. **Add automated security scanning** to CI/CD pipeline
4. **Regular dependency audits** with `npm audit`
5. **Consider adding OWASP ZAP** for comprehensive penetration testing
