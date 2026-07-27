# Security Policy

## Philosophy

Security is NOT a feature.

Security is the default.

Every line of code must be written assuming attackers already exist.

-------------------------------------

## Security Goals

Protect Users

Protect Businesses

Protect Data

Protect Revenue

Protect Reputation

Protect Infrastructure

-------------------------------------

## Security Principles

Zero Trust

Least Privilege

Defense In Depth

Fail Secure

Secure By Default

Never Trust Client Input

Everything Must Be Validated

Everything Must Be Logged

Everything Must Be Audited

Everything Must Be Tested

-------------------------------------

## OWASP

Follow

OWASP Top 10

OWASP API Security Top 10

OWASP ASVS

-------------------------------------

## Never Trust

Request Body

Query Parameters

Headers

Cookies

Files

JWT Payload

Frontend Validation

External APIs

Third Party Services

-------------------------------------

## Always

Validate

Sanitize

Escape

Authorize

Authenticate

Log

Rate Limit

Encrypt

Monitor

Audit

-------------------------------------

## Secrets

Never store:

Passwords

API Keys

JWT Secrets

Database Passwords

SMTP Passwords

AWS Keys

Google Secrets

Inside source code.

Always use environment variables.

-------------------------------------

## Logging

Log

Authentication

Authorization

Errors

Critical Changes

Payments

Business Changes

Role Changes

Admin Actions

Never log

Passwords

Tokens

Secrets

Credit Cards

Private Keys

OTP Codes

-------------------------------------

## Production

HTTPS Only

HSTS

Secure Cookies

SameSite Cookies

HttpOnly Cookies

CSP

Helmet

CORS

Compression

Rate Limiting

Monitoring

Backups

Automatic Alerts

-------------------------------------

## AI Security Review

Before merging code ask:

Can this be abused?

Can permissions be bypassed?

Can input break the system?

Can users access other users' data?

Can this expose secrets?

Can this leak business information?

Can this create financial damage?