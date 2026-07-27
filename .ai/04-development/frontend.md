# Frontend Standards

Stack

React 19

TypeScript

Vite

TailwindCSS

React Router

-----------------------------------

## Components

One component.

One responsibility.

Maximum 300 lines preferred.

Split large components.

-----------------------------------

## State

Local State

↓

Context

↓

Server State

↓

Global Store only when required.

-----------------------------------

## Performance

Always

Lazy Load

Dynamic Imports

Memo when necessary

Virtual Lists

Image Optimization

Skeleton Loading

Code Splitting

-----------------------------------

## UI

Accessible

Responsive

Keyboard Friendly

Fast

Dark Mode Ready

-----------------------------------

## Forms

React Hook Form

Zod Validation

Server Validation

Client Validation

-----------------------------------

## API

Never call fetch directly.

Always use API layer.

-----------------------------------

## Security

Never trust frontend validation.

Never expose secrets.

Never store JWT in localStorage.

Prefer Secure Cookies.

-----------------------------------

## Maps

Leaflet

Cluster markers.

Lazy loading.

Viewport optimization.

-----------------------------------

## Animations

Framer Motion.

Use only when meaningful.

Never reduce performance.