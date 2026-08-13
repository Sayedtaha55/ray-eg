package middleware

import (
	"github.com/Sayedtaha55/ray-eg/gobackend/internal/config"
	"github.com/gofiber/fiber/v2"
)

// SecurityHeaders applies a hardened set of HTTP response headers. CSP is kept
// permissive enough for SPAs and WebSocket connections, and tightened via env.
func SecurityHeaders(cfg *config.Config) fiber.Handler {
	return func(c *fiber.Ctx) error {
		isDev := cfg.IsDevelopment()

		c.Set("X-Content-Type-Options", "nosniff")
		c.Set("X-Frame-Options", "DENY")
		c.Set("Referrer-Policy", "strict-origin-when-cross-origin")
		c.Set("Permissions-Policy", "geolocation=(self), microphone=(), camera=(), payment=(self)")
		c.Set("X-DNS-Prefetch-Control", "off")
		c.Set("Cross-Origin-Resource-Policy", "cross-origin")
		c.Set("Cross-Origin-Opener-Policy", "same-origin")

		if cfg.IsProduction() {
			c.Set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload")
		}

		// Content-Security-Policy: allow self, the configured frontend, and common CDNs.
		frontend := cfg.App.FrontendURL
		csp := buildCSP(isDev, frontend)
		c.Set("Content-Security-Policy", csp)

		return c.Next()
	}
}

func buildCSP(isDev bool, frontend string) string {
	scriptSrc := "'self' https://cdn.jsdelivr.net"
	if isDev {
		scriptSrc += " 'unsafe-inline' 'unsafe-eval'"
	}

	styleSrc := "'self' 'unsafe-inline'"
	imgSrc := "'self' data: https:"
	connectSrc := "'self' wss: https:"
	if isDev {
		imgSrc += " http:"
		connectSrc += " http: ws:"
	}
	if frontend != "" {
		connectSrc += " " + frontend
	}

	return "default-src 'self'; " +
		"script-src " + scriptSrc + "; " +
		"style-src " + styleSrc + "; " +
		"img-src " + imgSrc + "; " +
		"connect-src " + connectSrc + "; " +
		"font-src 'self'; " +
		"frame-ancestors 'none'; " +
		"base-uri 'self'; " +
		"form-action 'self';"
}
