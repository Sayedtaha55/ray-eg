# Authentication & Authorization

## Authentication

Use JWT Access Token

Use Refresh Token

Access Token

15 Minutes

Refresh Token

7 Days

Rotate Refresh Tokens

Store Refresh Tokens securely.

-------------------------------------

## Password Policy

Minimum 12 Characters

Uppercase

Lowercase

Numbers

Special Characters

Block Common Passwords

Use bcrypt

Minimum Cost Factor

12

-------------------------------------

## Login

Rate Limit Login

Detect Brute Force

Temporary Lock

Notify User

Log Device

Log Location

-------------------------------------

## Sessions

Support

Logout Current Device

Logout All Devices

Device List

Last Login

-------------------------------------

## Roles

Super Admin

Platform Admin

Business Owner

Manager

Employee

Customer

Guest

-------------------------------------

## Permissions

Never check roles directly.

Always check permissions.

Example

business.products.create

business.products.edit

business.products.delete

-------------------------------------

## Authorization

Never trust frontend.

Always verify permissions on backend.

Every endpoint.

Every request.

-------------------------------------

## MFA (Future)

Support

Authenticator Apps

SMS

Email

Passkeys

WebAuthn