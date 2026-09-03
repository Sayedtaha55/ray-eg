package auth

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestLogoutClearsCookieAndReturnsSuccess(t *testing.T) {
	h := &Handler{
		cfg: AuthCookieConfig{
			Name:     "ray_session",
			MaxAge:   7 * 24 * time.Hour,
			SameSite: "Lax",
		},
	}

	app := fiber.New()
	app.Post("/logout", h.Logout)

	req := httptest.NewRequest(http.MethodPost, "/logout", nil)
	req.Header.Set("Authorization", "Bearer test-access-token")

	resp, err := app.Test(req)
	require.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode)

	setCookie := resp.Header.Get("Set-Cookie")
	assert.Contains(t, setCookie, "ray_session=")
	assert.Contains(t, setCookie, "Expires=Thu, 01 Jan 1970")
}