package sessions

import (
	"github.com/Sayedtaha55/ray-eg/gobackend/internal/config"
	"github.com/Sayedtaha55/ray-eg/gobackend/internal/platform/middleware"
	"github.com/gofiber/fiber/v2"
)

// Handler handles HTTP requests for session events
type Handler struct {
	service *Service
	config  *config.Config
}

// NewHandler creates a new sessions handler
func NewHandler(service *Service, cfg *config.Config) *Handler {
	return &Handler{
		service: service,
		config:  cfg,
	}
}

// RegisterRoutes registers session routes
func (h *Handler) RegisterRoutes(app fiber.Router) {
	sessions := app.Group("/sessions")
	
	// All session routes require authentication
	sessions.Use(middleware.RequireAuth(h.config))
	
	sessions.Get("/recent", h.GetRecentEvents)
	sessions.Get("/today-stats", h.GetTodayStats)
	sessions.Get("/average-duration", h.GetAverageDuration)
	sessions.Get("/active-users", h.GetActiveUsers)
}

// GetRecentEvents returns recent session events
func (h *Handler) GetRecentEvents(c *fiber.Ctx) error {
	limit := c.QueryInt("limit", 20)
	offset := c.QueryInt("offset", 0)
	
	if limit > 100 {
		limit = 100
	}
	
	events, err := h.service.GetRecentEvents(c.UserContext(), limit, offset)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to fetch session events",
		})
	}
	
	return c.JSON(fiber.Map{
		"success": true,
		"data":    events,
	})
}

// GetTodayStats returns today's login/logout counts
func (h *Handler) GetTodayStats(c *fiber.Ctx) error {
	loginCount, err := h.service.GetTodayLoginCount(c.UserContext())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to fetch today stats",
		})
	}
	
	logoutCount, err := h.service.GetTodayLogoutCount(c.UserContext())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to fetch today stats",
		})
	}
	
	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"loginsToday":  loginCount,
			"logoutsToday": logoutCount,
		},
	})
}

// GetAverageDuration returns average session duration
func (h *Handler) GetAverageDuration(c *fiber.Ctx) error {
	days := c.QueryInt("days", 7)
	if days > 90 {
		days = 90
	}
	
	avg, err := h.service.GetAverageDuration(c.UserContext(), days)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to fetch average duration",
		})
	}
	
	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"averageDurationSeconds": avg,
			"days":                   days,
		},
	})
}

// GetActiveUsers returns currently active users
func (h *Handler) GetActiveUsers(c *fiber.Ctx) error {
	users, err := h.service.GetActiveUsers(c.UserContext())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to fetch active users",
		})
	}
	
	return c.JSON(fiber.Map{
		"success": true,
		"data":    users,
		"count":   len(users),
	})
}
