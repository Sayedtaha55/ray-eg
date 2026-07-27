# Coding Standards

## Philosophy

Code is written once.

Read thousands of times.

Optimize for readability.

Not cleverness.

-----------------------------------

## General Rules

Always use TypeScript Strict Mode.

Never use any.

Never disable eslint rules.

Never ignore TypeScript errors.

Never duplicate code.

Never hardcode configuration.

Never hardcode IDs.

Never hardcode permissions.

-----------------------------------

## Naming

Classes

PascalCase

BusinessService

ProductController

InventoryModule

Interfaces

Prefix with I only if required by project standard.

Variables

camelCase

Functions

camelCase

Constants

UPPER_SNAKE_CASE

Files

kebab-case

Example

business.service.ts

inventory.module.ts

-----------------------------------

## Functions

One responsibility.

Maximum 40 lines preferred.

Maximum 3 nesting levels.

Avoid boolean parameters.

Return early.

-----------------------------------

## Comments

Explain WHY.

Never explain WHAT.

Bad

// increment counter

Good

// Required to prevent duplicate invoice numbers.

-----------------------------------

## Error Handling

Never ignore exceptions.

Never use empty catch blocks.

Always log unexpected errors.

Return standardized API responses.

-----------------------------------

## Dependency Injection

Always use NestJS DI.

Never manually create services.

-----------------------------------

## Reusability

Prefer reusable:

Components

Hooks

Services

DTOs

Utilities

Validation

-----------------------------------

## Documentation

Public services must be documented.

Complex business logic must include explanation.

-----------------------------------

## Technical Debt

Never leave TODO without issue reference.

Example

TODO(BON-132): Optimize query after search service migration.