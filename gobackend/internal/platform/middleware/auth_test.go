package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestRequireAuth_ExtractsUserFromHeader(t *testing.T) {
	cfg := testConfig(t)
	token := buildToken(t, cfg.Auth.JWTSecret, jwt.MapClaims{
		"sub":    "user-123",
		"email":  "test@example.com",
		"role":   "merchant",
		"shopId": "shop-456",
	})

	app := fiber.New(fiber.Config{ErrorHandler: NewErrorHandler()})
	app.Use(RequireAuth(cfg))
	app.Get("/me", func(c *fiber.Ctx) error {
		u, ok := AuthUserFromContext(c)
		require.True(t, ok)
		return c.JSON(u)
	})

	req := httptest.NewRequest(http.MethodGet, "/me", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	resp, err := app.Test(req)
	require.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode)
}

func TestRequireAuth_RejectsInvalidToken(t *testing.T) {
	cfg := testConfig(t)
	app := fiber.New(fiber.Config{ErrorHandler: NewErrorHandler()})
	app.Use(RequireAuth(cfg))
	app.Get("/me", func(c *fiber.Ctx) error {
		return c.SendStatus(fiber.StatusOK)
	})

	req := httptest.NewRequest(http.MethodGet, "/me", nil)
	req.Header.Set("Authorization", "Bearer invalid-token")
	resp, err := app.Test(req)
	require.NoError(t, err)
	assert.Equal(t, http.StatusUnauthorized, resp.StatusCode)
}

func buildToken(t *testing.T, secret string, claims jwt.MapClaims) string {
	t.Helper()
	if _, ok := claims["exp"]; !ok {
		claims["exp"] = time.Now().Add(time.Hour).Unix()
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	s, err := token.SignedString([]byte(secret))
	require.NoError(t, err)
	return s
}
