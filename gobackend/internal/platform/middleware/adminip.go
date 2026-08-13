package middleware

import (
	"strings"

	"github.com/Sayedtaha55/ray-eg/gobackend/internal/config"
	"github.com/Sayedtaha55/ray-eg/gobackend/internal/platform/errors"
	"github.com/gofiber/fiber/v2"
)

var adminPathPrefixes = []string{
	"/api/v1/admin",
	"/api/v1/shops/admin",
	"/api/v1/users/admin",
	"/api/v1/products/admin",
	"/api/v1/orders/admin",
}

// AdminIPAllowlist blocks admin endpoints when the client IP is not in the
// configured allowlist. In non-production environments this middleware is a no-op.
func AdminIPAllowlist(cfg *config.Config) fiber.Handler {
	return func(c *fiber.Ctx) error {
		if !cfg.IsProduction() {
			return c.Next()
		}

		if len(cfg.Security.AdminIPAllowlist) == 0 {
			return c.Next()
		}

		path := c.Path()
		if !isAdminPath(path) {
			return c.Next()
		}

		clientIP := normalizeIP(c.IP())
		for _, allowed := range cfg.Security.AdminIPAllowlist {
			if matchIP(clientIP, normalizeIP(allowed)) {
				return c.Next()
			}
		}

		return errors.Forbidden("admin_ip_denied", "عنوان IP غير مصرح به للوصول إلى لوحة الإدارة")
	}
}

func isAdminPath(path string) bool {
	for _, p := range adminPathPrefixes {
		if strings.HasPrefix(path, p) {
			return true
		}
	}
	return false
}

func normalizeIP(ip string) string {
	return strings.TrimPrefix(ip, "::ffff:")
}

func matchIP(client, allowed string) bool {
	client = normalizeIP(client)
	allowed = normalizeIP(allowed)
	if client == allowed {
		return true
	}
	// Support suffix matching, e.g. allowed="10.0.0." matches "10.0.0.42".
	if strings.HasSuffix(client, allowed) {
		return true
	}
	return false
}
