package middleware

import (
	"context"
	"strings"

	"github.com/Sayedtaha55/ray-eg/saas-backend/internal/db"
	"github.com/gofiber/fiber/v2"
)

type contextKey string

const (
	tenantKey      contextKey = "tenant"
	tenantStoreKey string     = "tenant_store"
)

// TenantStore is the resolved store for the current request.
type TenantStore = db.Store

// Tenant resolves the store from the request host (custom domain or subdomain)
// or from the X-Tenant-Domain header. It stores the resolved store in context
// and fiber locals. Tenant-scoped queries must use the store_id from context.
func Tenant(queries *db.Queries) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Priority 1: explicit header (useful for testing and API clients).
		domain := strings.TrimSpace(c.Get("X-Tenant-Domain"))

		// Priority 2: resolve from Host header.
		if domain == "" {
			host := stripPort(c.Hostname())
			domain = resolveDomain(host)
		}

		if domain == "" {
			// No tenant context: allow public routes to proceed without a store.
			return c.Next()
		}

		store, err := queries.GetStoreByDomain(c.UserContext(), domain)
		if err != nil {
			// Store not found — continue without tenant for public endpoints.
			// Protected endpoints will fail at the handler level.
			return c.Next()
		}

		// Store in fiber locals for handlers.
		c.Locals(tenantStoreKey, &store)

		// Store in context for downstream packages.
		ctx := context.WithValue(c.UserContext(), tenantKey, &store)
		c.SetUserContext(ctx)

		return c.Next()
	}
}

// GetTenantStore extracts the resolved store from fiber locals.
// Returns nil if no tenant was resolved.
func GetTenantStore(c *fiber.Ctx) *TenantStore {
	v := c.Locals(tenantStoreKey)
	if v == nil {
		return nil
	}
	s, ok := v.(*TenantStore)
	if !ok {
		return nil
	}
	return s
}

// RequireTenant is a middleware that rejects requests without a resolved tenant.
func RequireTenant() fiber.Handler {
	return func(c *fiber.Ctx) error {
		store := GetTenantStore(c)
		if store == nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error":   "tenant_not_found",
				"message": "المتجر غير موجود أو غير مفعل",
			})
		}
		if store.Status != db.StoreStatusActive && store.Status != db.StoreStatusPending {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"error":   "tenant_inactive",
				"message": "المتجر غير مفعل",
			})
		}
		return c.Next()
	}
}

// resolveDomain extracts the tenant identifier from a host string.
// For subdomain-based tenancy: "acme.example.com" → "acme"
// For custom domains: "shop.acme.com" → "shop.acme.com" (full host)
func resolveDomain(host string) string {
	host = strings.ToLower(strings.TrimSpace(host))
	if host == "" || host == "localhost" || host == "127.0.0.1" {
		return ""
	}

	// If the host has dots, it could be a subdomain or custom domain.
	parts := strings.Split(host, ".")
	if len(parts) >= 3 {
		// e.g. acme.app.com → subdomain "acme"
		return parts[0]
	}
	// e.g. shop.com → treat as custom domain
	return host
}
