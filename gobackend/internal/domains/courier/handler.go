package courier

import (
	"strconv"

	"github.com/Sayedtaha55/ray-eg/gobackend/internal/config"
	"github.com/Sayedtaha55/ray-eg/gobackend/internal/platform/middleware"
	"github.com/gofiber/fiber/v2"
)

// Handler handles HTTP requests for courier
type Handler struct {
	service *Service
	config  *config.Config
}

// NewHandler creates a new courier handler
func NewHandler(service *Service, cfg *config.Config) *Handler {
	return &Handler{
		service: service,
		config:  cfg,
	}
}

// RegisterRoutes registers courier routes
func (h *Handler) RegisterRoutes(app fiber.Router) {
	courier := app.Group("/couriers")

	// Protected routes
	courier.Get("/", middleware.RequireAuth(h.config), h.ListCouriers)
	courier.Get("/:id", middleware.RequireAuth(h.config), h.GetCourierByID)
	courier.Patch("/:id/status", middleware.RequireAuth(h.config), h.UpdateCourierStatus)
}

// ListCouriers handles listing all couriers
func (h *Handler) ListCouriers(c *fiber.Ctx) error {
	user, ok := middleware.AuthUserFromContext(c)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(CouriersListResponse{
			Success: false,
			Error:   "Unauthorized",
		})
	}

	// Only admin can list all couriers
	if user.Role != "admin" && user.Role != "ADMIN" {
		return c.Status(fiber.StatusForbidden).JSON(CouriersListResponse{
			Success: false,
			Error:   "Unauthorized",
		})
	}

	limit := 20
	offset := 0

	if limitStr := c.Query("limit"); limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 {
			limit = l
		}
	}

	if offsetStr := c.Query("offset"); offsetStr != "" {
		if o, err := strconv.Atoi(offsetStr); err == nil && o >= 0 {
			offset = o
		}
	}

	couriers, total, err := h.service.ListCouriers(c.Context(), limit, offset)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(CouriersListResponse{
			Success: false,
			Error:   "Failed to retrieve couriers",
		})
	}

	return c.JSON(CouriersListResponse{
		Success: true,
		Data:    couriers,
		Total:   total,
	})
}

// GetCourierByID handles retrieving a courier by ID
func (h *Handler) GetCourierByID(c *fiber.Ctx) error {
	id := c.Params("id")

	courier, err := h.service.GetCourierByID(c.Context(), id)
	if err != nil {
		if err.Error() == "courier not found" {
			return c.Status(fiber.StatusNotFound).JSON(CourierResponse{
				Success: false,
				Error:   "Courier not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(CourierResponse{
			Success: false,
			Error:   "Failed to retrieve courier",
		})
	}

	return c.JSON(CourierResponse{
		Success: true,
		Data:    courier,
	})
}

// UpdateCourierStatus handles updating courier status
func (h *Handler) UpdateCourierStatus(c *fiber.Ctx) error {
	id := c.Params("id")

	var req struct {
		Status CourierStatus `json:"status" validate:"required,oneof=AVAILABLE BUSY OFFLINE"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(CourierResponse{
			Success: false,
			Error:   "Invalid request body",
		})
	}

	err := h.service.UpdateCourierStatus(c.Context(), id, req.Status)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(CourierResponse{
			Success: false,
			Error:   "Failed to update courier status",
		})
	}

	return c.JSON(CourierResponse{Success: true})
}
