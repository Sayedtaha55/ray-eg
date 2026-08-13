package middleware

import (
	"fmt"
	"strings"

	"github.com/Sayedtaha55/ray-eg/gobackend/internal/config"
	"github.com/Sayedtaha55/ray-eg/gobackend/internal/platform/errors"
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

// AuthContextKey is the key used to store authenticated user data in fiber Locals.
const AuthContextKey = "auth_user"

// AuthUser represents the authenticated caller extracted from a JWT.
type AuthUser struct {
	ID     string `json:"id"`
	Email  string `json:"email"`
	Role   string `json:"role"`
	ShopID string `json:"shopId,omitempty"`
}

// RequireAuth verifies the JWT (from Authorization header or ray_session cookie)
// and injects an AuthUser into fiber Locals. If authentication fails it returns
// an authentication error.
func RequireAuth(cfg *config.Config) fiber.Handler {
	return func(c *fiber.Ctx) error {
		user, err := extractUser(c, cfg.Auth.JWTSecret)
		if err != nil {
			return errors.Unauthorized("invalid_token", err.Error())
		}
		c.Locals(AuthContextKey, user)
		return c.Next()
	}
}

// OptionalAuth extracts the user if a token is present, otherwise continues
// without authentication.
func OptionalAuth(cfg *config.Config) fiber.Handler {
	return func(c *fiber.Ctx) error {
		user, err := extractUser(c, cfg.Auth.JWTSecret)
		if err == nil {
			c.Locals(AuthContextKey, user)
		}
		return c.Next()
	}
}

// AuthUserFromContext returns the authenticated user from fiber Locals.
func AuthUserFromContext(c *fiber.Ctx) (AuthUser, bool) {
	v := c.Locals(AuthContextKey)
	if v == nil {
		return AuthUser{}, false
	}
	u, ok := v.(AuthUser)
	return u, ok
}

func extractUser(c *fiber.Ctx, secret string) (AuthUser, error) {
	tokenStr := extractToken(c)
	if tokenStr == "" {
		return AuthUser{}, fmt.Errorf("missing token")
	}

	token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (any, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method")
		}
		return []byte(secret), nil
	}, jwt.WithValidMethods([]string{"HS256"}))
	if err != nil {
		return AuthUser{}, err
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok || !token.Valid {
		return AuthUser{}, fmt.Errorf("invalid claims")
	}

	user := AuthUser{
		ID:    stringClaim(claims, "sub"),
		Email: stringClaim(claims, "email"),
		Role:  stringClaim(claims, "role"),
	}
	// Handle both camelCase and snake_case shop identifiers used by the Node backend.
	if shop := stringClaim(claims, "shopId"); shop != "" {
		user.ShopID = shop
	} else {
		user.ShopID = stringClaim(claims, "shop_id")
	}

	if user.ID == "" {
		return AuthUser{}, fmt.Errorf("missing sub claim")
	}

	return user, nil
}

func extractToken(c *fiber.Ctx) string {
	auth := c.Get("Authorization")
	if strings.HasPrefix(auth, "Bearer ") {
		return strings.TrimSpace(strings.TrimPrefix(auth, "Bearer "))
	}

	if cookie := c.Cookies("ray_session"); cookie != "" {
		return cookie
	}

	return ""
}

func stringClaim(claims jwt.MapClaims, key string) string {
	v, ok := claims[key]
	if !ok {
		return ""
	}
	s, ok := v.(string)
	if !ok {
		return ""
	}
	return s
}

// AuthRequired is a middleware that requires authentication
// It sets user_id, role, and shop_id in fiber Locals
func AuthRequired() fiber.Handler {
	return func(c *fiber.Ctx) error {
		user, ok := AuthUserFromContext(c)
		if !ok {
			return errors.Unauthorized("missing_auth", "Authentication required")
		}

		c.Locals("user_id", user.ID)
		c.Locals("email", user.Email)
		c.Locals("role", user.Role)
		if user.ShopID != "" {
			c.Locals("shop_id", user.ShopID)
		}

		return c.Next()
	}
}
