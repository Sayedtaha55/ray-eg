package gallery

import (
	"strconv"

	"github.com/Sayedtaha55/ray-eg/gobackend/internal/config"
	"github.com/Sayedtaha55/ray-eg/gobackend/internal/platform/middleware"
	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
)

// Handler handles HTTP requests for gallery
type Handler struct {
	service  *Service
	config   *config.Config
	validate *validator.Validate
}

// NewHandler creates a new gallery handler
func NewHandler(service *Service, cfg *config.Config) *Handler {
	return &Handler{
		service:  service,
		config:   cfg,
		validate: validator.New(),
	}
}

// RegisterRoutes registers gallery routes
func (h *Handler) RegisterRoutes(app fiber.Router) {
	gallery := app.Group("/gallery")

	// Public routes
	gallery.Get("/shop/:shopId", h.ListGalleryItemsByShop)

	// Protected routes
	gallery.Post("/", middleware.RequireAuth(h.config), h.CreateGalleryItem)
	gallery.Get("/:id", middleware.RequireAuth(h.config), h.GetGalleryItemByID)
	gallery.Patch("/:id", middleware.RequireAuth(h.config), h.UpdateGalleryItem)
	gallery.Delete("/:id", middleware.RequireAuth(h.config), h.DeleteGalleryItem)
}

// CreateGalleryItem handles creating a new gallery item
func (h *Handler) CreateGalleryItem(c *fiber.Ctx) error {
	var req CreateGalleryItemDTO
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(GalleryItemResponse{
			Success: false,
			Error:   "Invalid request body",
		})
	}

	if err := req.Validate(h.validate); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(GalleryItemResponse{
			Success: false,
			Error:   err.Error(),
		})
	}

	user, ok := middleware.AuthUserFromContext(c)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(GalleryItemResponse{
			Success: false,
			Error:   "Unauthorized",
		})
	}

	if user.ShopID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(GalleryItemResponse{
			Success: false,
			Error:   "User does not have a shop",
		})
	}

	item, err := h.service.CreateGalleryItem(c.Context(), user.ShopID, &req)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(GalleryItemResponse{
			Success: false,
			Error:   "Failed to create gallery item",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(GalleryItemResponse{
		Success: true,
		Data:    item,
	})
}

// GetGalleryItemByID handles retrieving a gallery item by ID
func (h *Handler) GetGalleryItemByID(c *fiber.Ctx) error {
	id := c.Params("id")

	item, err := h.service.GetGalleryItemByID(c.Context(), id)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(GalleryItemResponse{
			Success: false,
			Error:   "Gallery item not found",
		})
	}

	return c.JSON(GalleryItemResponse{
		Success: true,
		Data:    item,
	})
}

// ListGalleryItemsByShop handles listing gallery items for a shop
func (h *Handler) ListGalleryItemsByShop(c *fiber.Ctx) error {
	shopID := c.Params("shopId")

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

	items, total, err := h.service.ListGalleryItems(c.Context(), shopID, limit, offset)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(GalleryItemsListResponse{
			Success: false,
			Error:   "Failed to retrieve gallery items",
		})
	}

	return c.JSON(GalleryItemsListResponse{
		Success: true,
		Data:    items,
		Total:   total,
	})
}

// UpdateGalleryItem handles updating a gallery item
func (h *Handler) UpdateGalleryItem(c *fiber.Ctx) error {
	id := c.Params("id")

	var req UpdateGalleryItemDTO
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(GalleryItemResponse{
			Success: false,
			Error:   "Invalid request body",
		})
	}

	if err := req.Validate(h.validate); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(GalleryItemResponse{
			Success: false,
			Error:   err.Error(),
		})
	}

	err := h.service.UpdateGalleryItem(c.Context(), id, &req)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(GalleryItemResponse{
			Success: false,
			Error:   "Failed to update gallery item",
		})
	}

	return c.JSON(GalleryItemResponse{Success: true})
}

// DeleteGalleryItem handles deleting a gallery item
func (h *Handler) DeleteGalleryItem(c *fiber.Ctx) error {
	id := c.Params("id")

	err := h.service.DeleteGalleryItem(c.Context(), id)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(GalleryItemResponse{
			Success: false,
			Error:   "Failed to delete gallery item",
		})
	}

	return c.JSON(GalleryItemResponse{Success: true})
}
