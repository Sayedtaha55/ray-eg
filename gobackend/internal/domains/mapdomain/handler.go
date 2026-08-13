package mapdomain

import (
	"strconv"

	"github.com/Sayedtaha55/ray-eg/gobackend/internal/config"
	"github.com/gofiber/fiber/v2"
)

// Handler handles HTTP requests for map
type Handler struct {
	service *Service
	config  *config.Config
}

// NewHandler creates a new map handler
func NewHandler(service *Service, cfg *config.Config) *Handler {
	return &Handler{service: service, config: cfg}
}

// RegisterRoutes registers map routes
func (h *Handler) RegisterRoutes(r fiber.Router) {
	g := r.Group("/map")
	g.Get("/pins", h.GetPins)
}

// GetPins handles retrieving map pins
func (h *Handler) GetPins(c *fiber.Ctx) error {
	var lat, lng, radiusKm *float64

	if latStr := c.Query("lat"); latStr != "" {
		if v, err := strconv.ParseFloat(latStr, 64); err == nil {
			lat = &v
		}
	}
	if lngStr := c.Query("lng"); lngStr != "" {
		if v, err := strconv.ParseFloat(lngStr, 64); err == nil {
			lng = &v
		}
	}
	if rStr := c.Query("radiusKm"); rStr != "" {
		if v, err := strconv.ParseFloat(rStr, 64); err == nil {
			radiusKm = &v
		}
	}

	pins, err := h.service.GetPins(c.Context(), lat, lng, radiusKm)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(MapPinsResponse{
			Success: false,
			Error:   "Failed to retrieve map pins",
		})
	}

	return c.JSON(MapPinsResponse{
		Success: true,
		Data:    pins,
	})
}
