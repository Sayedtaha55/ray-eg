# Core Modules

Every feature must belong to a module.

Modules communicate through services or events.

Never through direct database access.

---------------------------------

Core Modules

Authentication

Users

Businesses

Branches

Products

Categories

Inventory

Orders

Invoices

Customers

Suppliers

Employees

CRM

Booking

Marketplace

Business Graph

Maps

Notifications

Messaging

Analytics

Reports

Payments

Media

Files

Reviews

Permissions

Roles

Audit Logs

AI

Search

Settings

Integrations

---------------------------------

Future Modules

Insurance

Financing

Shipping

Logistics

Auctions

Government Integration

Export

Import

IoT

Smart Devices

---------------------------------

Rules

Each module owns:

Entities

DTOs

Controllers

Services

Events

Validation

Tests

Documentation

Never share entities directly.

Always expose services or interfaces.

Every module should be reusable.