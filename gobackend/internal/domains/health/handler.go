package health

import (
	"context"
	"time"

	"github.com/Sayedtaha55/ray-eg/gobackend/internal/platform/db"
	"github.com/Sayedtaha55/ray-eg/gobackend/internal/platform/redis"
	"github.com/gofiber/fiber/v2"
	"go.uber.org/zap"
)

// Handler exposes monitoring and health endpoints.
type Handler struct {
	db     *db.Pool
	redis  *redis.Client
	logger *zap.Logger
}

// NewHandler creates a health handler.
func NewHandler(pool *db.Pool, redisClient *redis.Client, logger *zap.Logger) *Handler {
	return &Handler{db: pool, redis: redisClient, logger: logger}
}

// RegisterRoutes registers /monitoring/* routes.
func (h *Handler) RegisterRoutes(r fiber.Router) {
	g := r.Group("/monitoring")
	g.Get("/live", h.Live)
	g.Get("/ready", h.Ready)
	g.Get("/health", h.Live)
}

// Live returns a lightweight liveness probe.
func (h *Handler) Live(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{
		"status": "ok",
		"time":   time.Now().UTC(),
	})
}

// Ready checks database and Redis connectivity.
func (h *Handler) Ready(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(c.UserContext(), 5*time.Second)
	defer cancel()

	checks := fiber.Map{
		"database": "ok",
		"redis":    "ok",
	}
	status := fiber.StatusOK

	if h.db != nil {
		if err := h.db.Ping(ctx); err != nil {
			checks["database"] = "unavailable"
			status = fiber.StatusServiceUnavailable
			h.logger.Error("database readiness check failed", zap.Error(err))
		}
	}

	if h.redis != nil {
		if !h.redis.IsHealthy(ctx) {
			checks["redis"] = "unavailable"
			status = fiber.StatusServiceUnavailable
			h.logger.Error("redis readiness check failed")
		}
	}

	return c.Status(status).JSON(fiber.Map{
		"status": map[bool]string{true: "ok", false: "degraded"}[status == fiber.StatusOK],
		"checks": checks,
		"time":   time.Now().UTC(),
	})
}
