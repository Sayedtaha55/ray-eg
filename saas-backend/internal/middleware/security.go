package middleware

import (
	"os"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/helmet"
	"github.com/gofiber/fiber/v2/middleware/limiter"
)

// Security sets up CORS, Helmet, and Rate Limiting middlewares.
func Security(app *fiber.App) {
	origins := os.Getenv("CORS_ORIGINS")
	if origins == "" {
		origins = "*"
	}

	allowCredentials := origins != "*"

	app.Use(cors.New(cors.Config{
		AllowOrigins:     origins,
		AllowMethods:     "GET,POST,PUT,PATCH,DELETE,OPTIONS",
		AllowHeaders:     "Origin,Content-Type,Accept,Authorization,X-Tenant-Domain",
		AllowCredentials: allowCredentials,
	}))

	app.Use(helmet.New(helmet.Config{
		XSSProtection:         "1; mode=block",
		ContentTypeNosniff:    "nosniff",
		XFrameOptions:         "DENY",
		HSTSMaxAge:            31536000,
		HSTSExcludeSubdomains: false,
	}))

	rpm := 100
	app.Use(limiter.New(limiter.Config{
		Max:        rpm,
		Expiration: 60, // seconds
		KeyGenerator: func(c *fiber.Ctx) string {
			return c.IP()
		},
	}))
}

// JSONContentType forces JSON content type for API responses.
func JSONContentType() fiber.Handler {
	return func(c *fiber.Ctx) error {
		c.Set("Content-Type", "application/json")
		return c.Next()
	}
}

// stripPort removes the port from a host string.
func stripPort(host string) string {
	if idx := strings.LastIndex(host, ":"); idx != -1 {
		return host[:idx]
	}
	return host
}
