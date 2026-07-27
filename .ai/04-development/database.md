# Database Standards

Database

PostgreSQL

ORM

Prisma

-----------------------------------

## Tables

UUID Primary Keys

CreatedAt

UpdatedAt

DeletedAt (Soft Delete)

-----------------------------------

## Indexes

Index

Foreign Keys

Search Columns

Frequently Filtered Fields

-----------------------------------

## Transactions

Always use transactions for critical business operations.

Examples

Invoices

Payments

Inventory

Orders

-----------------------------------

## Relations

Avoid deep nesting.

Load only required relations.

-----------------------------------

## Queries

Never use SELECT *

Always select required fields.

-----------------------------------

## Pagination

Cursor Pagination Preferred.

-----------------------------------

## Migrations

Never edit old migrations.

Always create new migrations.

-----------------------------------

## Prisma

Never expose Prisma models to API.

Use DTOs.

Use Repository pattern if needed.

-----------------------------------

## Audit

Critical changes

Inventory

Invoices

Payments

Permissions

Business Settings

Must be audited.

-----------------------------------

## Performance

Use Explain Analyze.

Review slow queries.

Avoid N+1 queries.

Use connection pooling.

-----------------------------------

## Backup

Daily backup.

Weekly snapshot.

Monthly archive.

Test restoration regularly.