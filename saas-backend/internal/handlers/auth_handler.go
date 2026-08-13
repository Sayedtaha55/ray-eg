package handlers

import (
	"strings"
	"time"

	"github.com/Sayedtaha55/ray-eg/saas-backend/internal/auth"
	"github.com/Sayedtaha55/ray-eg/saas-backend/internal/db"
	"github.com/Sayedtaha55/ray-eg/saas-backend/internal/middleware"
	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
)

type AuthHandler struct {
	queries      *db.Queries
	tokenService *auth.TokenService
}

func NewAuthHandler(q *db.Queries, ts *auth.TokenService) *AuthHandler {
	return &AuthHandler{queries: q, tokenService: ts}
}

type RegisterRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	Role     string `json:"role"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type AuthResponse struct {
	AccessToken  string    `json:"access_token"`
	RefreshToken string    `json:"refresh_token"`
	ExpiresAt    time.Time `json:"expires_at"`
	User         UserInfo  `json:"user"`
}

type UserInfo struct {
	ID    string `json:"id"`
	Email string `json:"email"`
	Role  string `json:"role"`
}

func (h *AuthHandler) Register(c *fiber.Ctx) error {
	store := middleware.GetTenantStore(c)
	if store == nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "tenant_required",
			"message": "Must specify a tenant via X-Tenant-Domain header or subdomain",
		})
	}

	var req RegisterRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "invalid_body",
			"message": "Invalid request body",
		})
	}

	email := strings.ToLower(strings.TrimSpace(req.Email))
	if email == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "validation_error",
			"message": "email is required",
		})
	}

	if len(req.Password) < 8 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "validation_error",
			"message": "password must be at least 8 characters",
		})
	}

	role := strings.TrimSpace(req.Role)
	if role == "" {
		role = "member"
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "internal_error",
			"message": "Failed to hash password",
		})
	}

	user, err := h.queries.CreateUser(c.UserContext(), db.CreateUserParams{
		StoreID:      store.ID,
		Email:        email,
		PasswordHash: string(hash),
		Role:         role,
		IsActive:     true,
	})
	if err != nil {
		if isUniqueViolation(err) {
			return c.Status(fiber.StatusConflict).JSON(fiber.Map{
				"error":   "conflict",
				"message": "User with this email already exists in this store",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "internal_error",
			"message": "Failed to create user",
		})
	}

	return h.issueTokens(c, user)
}

func (h *AuthHandler) Login(c *fiber.Ctx) error {
	store := middleware.GetTenantStore(c)
	if store == nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "tenant_required",
			"message": "Must specify a tenant via X-Tenant-Domain header or subdomain",
		})
	}

	var req LoginRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "invalid_body",
			"message": "Invalid request body",
		})
	}

	email := strings.ToLower(strings.TrimSpace(req.Email))
	if email == "" || req.Password == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "validation_error",
			"message": "email and password are required",
		})
	}

	user, err := h.queries.GetUserByEmail(c.UserContext(), db.GetUserByEmailParams{
		StoreID: store.ID,
		Email:   email,
	})
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error":   "invalid_credentials",
			"message": "Invalid email or password",
		})
	}

	if !user.IsActive {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error":   "account_disabled",
			"message": "Your account has been disabled",
		})
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error":   "invalid_credentials",
			"message": "Invalid email or password",
		})
	}

	return h.issueTokens(c, user)
}

func (h *AuthHandler) Refresh(c *fiber.Ctx) error {
	refreshToken := c.Cookies("refresh_token")
	if refreshToken == "" {
		// Try Authorization header as fallback.
		authHeader := c.Get("Authorization")
		if parts := strings.SplitN(authHeader, " ", 2); len(parts) == 2 && strings.EqualFold(parts[0], "Bearer") {
			refreshToken = parts[1]
		}
	}

	// Try JSON body as last resort.
	if refreshToken == "" {
		var body struct {
			RefreshToken string `json:"refresh_token"`
		}
		if err := c.BodyParser(&body); err == nil && body.RefreshToken != "" {
			refreshToken = body.RefreshToken
		}
	}

	if refreshToken == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error":   "no_refresh_token",
			"message": "Refresh token not provided",
		})
	}

	claims, err := h.tokenService.ValidateToken(refreshToken)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error":   "invalid_token",
			"message": "Invalid or expired refresh token",
		})
	}

	access, err := h.tokenService.GenerateAccessToken(claims.UserID, claims.StoreID, claims.Role)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "internal_error",
			"message": "Failed to generate access token",
		})
	}

	return c.JSON(fiber.Map{
		"success":      true,
		"access_token": access,
		"expires_at":   time.Now().Add(15 * time.Minute),
	})
}

func (h *AuthHandler) Logout(c *fiber.Ctx) error {
	c.ClearCookie("refresh_token")
	return c.JSON(fiber.Map{
		"success": true,
		"message": "Logged out successfully",
	})
}

func (h *AuthHandler) Me(c *fiber.Ctx) error {
	userID, ok := c.Locals("user_id").(string)
	if !ok || userID == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error":   "unauthorized",
			"message": "Not authenticated",
		})
	}

	role, _ := c.Locals("role").(string)
	storeID, _ := c.Locals("store_id").(string)

	// Fetch full user record from DB.
	user, err := h.queries.GetUserByID(c.UserContext(), userID)
	if err != nil {
		return c.JSON(fiber.Map{
			"success":  true,
			"data":     UserInfo{ID: userID, Role: role},
			"store_id": storeID,
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data": UserInfo{
			ID:    user.ID,
			Email: user.Email,
			Role:  user.Role,
		},
		"store_id":  storeID,
		"is_active": user.IsActive,
	})
}

func (h *AuthHandler) issueTokens(c *fiber.Ctx, user db.User) error {
	access, err := h.tokenService.GenerateAccessToken(user.ID, user.StoreID, user.Role)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "internal_error",
			"message": "Failed to generate access token",
		})
	}

	refresh, err := h.tokenService.GenerateRefreshToken(user.ID, user.StoreID, user.Role)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "internal_error",
			"message": "Failed to generate refresh token",
		})
	}

	// Set refresh token in HttpOnly cookie.
	c.Cookie(&fiber.Cookie{
		Name:     "refresh_token",
		Value:    refresh,
		Expires:  time.Now().Add(7 * 24 * time.Hour),
		HTTPOnly: true,
		Secure:   false, // Set to true in production
		SameSite: "Lax",
		Path:     "/",
	})

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"success": true,
		"data": AuthResponse{
			AccessToken:  access,
			RefreshToken: refresh,
			ExpiresAt:    time.Now().Add(15 * time.Minute),
			User: UserInfo{
				ID:    user.ID,
				Email: user.Email,
				Role:  user.Role,
			},
		},
	})
}
