package middleware

import (
	"crypto/rand"
	"encoding/hex"
	"strings"

	"github.com/Sayedtaha55/ray-eg/gobackend/internal/config"
	"github.com/Sayedtaha55/ray-eg/gobackend/internal/platform/errors"
	"github.com/gofiber/fiber/v2"
)

const (
	csrfCookieName = "ray_csrf"
	csrfHeaderName = "X-CSRF-Token"
)

var csrfExemptPrefixes = []string{
	"/api/v1/auth/login",
	"/api/v1/auth/signup",
	"/api/v1/auth/courier-signup",
	"/api/v1/auth/password/forgot",
	"/api/v1/auth/password/reset",
	"/api/v1/auth/bootstrap-admin",
	"/api/v1/auth/google",
	"/api/v1/auth/dev-merchant-login",
	"/api/v1/auth/dev-courier-login",
	"/api/v1/auth/dev-portal-login",
}

// CSRF protects state-changing endpoints against cross-site request forgery.
// Safe methods and configured auth endpoints are exempt.
func CSRF(cfg *config.Config) fiber.Handler {
	return func(c *fiber.Ctx) error {
		method := strings.ToUpper(c.Method())
		path := strings.ToLower(c.Path())

		// Always set or refresh the CSRF cookie and expose the token header.
		cookieToken := c.Cookies(csrfCookieName)
		if cookieToken == "" || cfg.IsDevelopment() || cfg.Security.CSRFDisabled {
			cookieToken = generateCSRFToken()
			setCSRFCookie(c, cookieToken, cfg)
		}

		c.Set(csrfHeaderName, cookieToken)

		// Safe methods do not require the CSRF header.
		if method == "GET" || method == "HEAD" || method == "OPTIONS" {
			return c.Next()
		}

		// Exempt auth flows.
		if isCSRFExempt(path) {
			return c.Next()
		}

		if cfg.IsDevelopment() || cfg.Security.CSRFDisabled {
			return c.Next()
		}

		headerToken := strings.TrimSpace(c.Get(csrfHeaderName))
		if headerToken == "" {
			return errors.Forbidden("csrf_token_missing", "رمز الحماية مطلوب")
		}

		if !strings.EqualFold(headerToken, cookieToken) {
			return errors.Forbidden("csrf_token_invalid", "رمز الحماية غير صالح")
		}

		// Rotate token after successful verification.
		newToken := generateCSRFToken()
		setCSRFCookie(c, newToken, cfg)
		c.Set(csrfHeaderName, newToken)

		return c.Next()
	}
}

func generateCSRFToken() string {
	b := make([]byte, 32)
	_, _ = rand.Read(b)
	return hex.EncodeToString(b)
}

func setCSRFCookie(c *fiber.Ctx, value string, cfg *config.Config) {
	cookie := fiber.Cookie{
		Name:     csrfCookieName,
		Value:    value,
		Path:     "/",
		HTTPOnly: false, // Must be readable by frontend JS to send back in header.
		SameSite: "Lax",
		Secure:   cfg.IsProduction(),
		MaxAge:   24 * 60 * 60,
	}
	if cfg.App.FrontendURL != "" && cfg.IsProduction() {
		// Only set domain in production when a single domain is configured.
		cookie.Domain = cfg.Auth.CookieDomain
	}
	c.Cookie(&cookie)
}

func isCSRFExempt(path string) bool {
	path = strings.ToLower(path)
	for _, p := range csrfExemptPrefixes {
		if strings.HasPrefix(path, p) {
			return true
		}
	}
	return false
}
