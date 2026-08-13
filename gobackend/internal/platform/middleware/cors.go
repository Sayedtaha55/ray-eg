package middleware

import (
	"strings"

	"github.com/Sayedtaha55/ray-eg/gobackend/internal/config"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

// CORS returns a Fiber CORS middleware configured from the application config.
// In development all origins are allowed; in production only the configured
// origins (no wildcards) are accepted.
func CORS(cfg *config.Config) fiber.Handler {
	origins := cfg.Security.CORSOrigins
	if len(origins) == 0 && cfg.App.FrontendURL != "" {
		origins = []string{cfg.App.FrontendURL}
	}

	// Sanitize: reject wildcard in production.
	if cfg.IsProduction() {
		for i, o := range origins {
			if strings.TrimSpace(o) == "*" {
				origins = append(origins[:i], origins[i+1:]...)
				break
			}
		}
	}

	return cors.New(cors.Config{
		AllowOriginsFunc: func(origin string) bool {
			if cfg.IsDevelopment() {
				return true
			}
			if origin == "" {
				return true
			}
			for _, allowed := range origins {
				if strings.EqualFold(strings.TrimSpace(allowed), origin) {
					return true
				}
			}
			return false
		},
		AllowMethods:     "GET,POST,PUT,PATCH,DELETE,OPTIONS",
		AllowHeaders:     "Origin,Content-Type,Accept,Authorization,X-Request-Id,X-Idempotency-Key,X-CSRF-Token",
		ExposeHeaders:    "X-CSRF-Token,X-Request-Id",
		AllowCredentials: true,
		MaxAge:           86400,
	})
}
