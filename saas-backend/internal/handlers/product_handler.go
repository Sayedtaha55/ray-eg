package handlers

import (
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/Sayedtaha55/ray-eg/saas-backend/internal/db"
	"github.com/Sayedtaha55/ray-eg/saas-backend/internal/middleware"
	"github.com/gofiber/fiber/v2"
)

type ProductHandler struct {
	queries *db.Queries
}

func NewProductHandler(q *db.Queries) *ProductHandler {
	return &ProductHandler{queries: q}
}

type CreateProductRequest struct {
	Name        string  `json:"name"`
	Description *string `json:"description"`
	Price       float64 `json:"price"`
	Stock       int32   `json:"stock"`
	ImageURL    *string `json:"image_url"`
	IsActive    *bool   `json:"is_active"`
}

type UpdateProductRequest struct {
	Name        *string  `json:"name"`
	Description *string  `json:"description"`
	Price       *float64 `json:"price"`
	Stock       *int32   `json:"stock"`
	ImageURL    *string  `json:"image_url"`
	IsActive    *bool    `json:"is_active"`
}

type ProductResponse struct {
	ID          string     `json:"id"`
	StoreID     string     `json:"store_id"`
	Name        string     `json:"name"`
	Description *string    `json:"description"`
	Price       float64    `json:"price"`
	Stock       int32      `json:"stock"`
	ImageURL    *string    `json:"image_url"`
	IsActive    bool       `json:"is_active"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

func (h *ProductHandler) Create(c *fiber.Ctx) error {
	store := middleware.GetTenantStore(c)
	if store == nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "tenant_required",
			"message": "Tenant context is required",
		})
	}

	var req CreateProductRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "invalid_body",
			"message": "Invalid request body",
		})
	}

	name := strings.TrimSpace(req.Name)
	if name == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "validation_error",
			"message": "name is required",
		})
	}

	if req.Price < 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "validation_error",
			"message": "price must be >= 0",
		})
	}

	isActive := true
	if req.IsActive != nil {
		isActive = *req.IsActive
	}

	product, err := h.queries.CreateProduct(c.UserContext(), db.CreateProductParams{
		StoreID:     store.ID,
		Name:        name,
		Description: req.Description,
		Price:       req.Price,
		Stock:       req.Stock,
		ImageURL:    req.ImageURL,
		IsActive:    isActive,
		Metadata:    json.RawMessage(`{}`),
	})
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "internal_error",
			"message": fmt.Sprintf("Failed to create product: %v", err),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"data":    toProductResponse(product),
	})
}

func (h *ProductHandler) GetByID(c *fiber.Ctx) error {
	store := middleware.GetTenantStore(c)
	if store == nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "tenant_required",
			"message": "Tenant context is required",
		})
	}

	id := strings.TrimSpace(c.Params("id"))
	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "validation_error",
			"message": "id is required",
		})
	}

	product, err := h.queries.GetProductByID(c.UserContext(), db.GetProductByIDParams{
		ID:      id,
		StoreID: store.ID,
	})
	if err != nil {
		if isNoRows(err) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error":   "not_found",
				"message": "Product not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "internal_error",
			"message": fmt.Sprintf("Failed to fetch product: %v", err),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    toProductResponse(product),
	})
}

func (h *ProductHandler) List(c *fiber.Ctx) error {
	store := middleware.GetTenantStore(c)
	if store == nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "tenant_required",
			"message": "Tenant context is required",
		})
	}

	limit := int32(c.QueryInt("limit", 20))
	if limit <= 0 || limit > 100 {
		limit = 20
	}
	offset := int32(c.QueryInt("offset", 0))
	if offset < 0 {
		offset = 0
	}

	includeInactive := c.QueryBool("include_inactive", false)
	isActive := !includeInactive

	products, err := h.queries.ListProductsByStore(c.UserContext(), db.ListProductsByStoreParams{
		StoreID:  store.ID,
		IsActive: isActive,
		Limit:    limit,
		Offset:   offset,
	})
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "internal_error",
			"message": fmt.Sprintf("Failed to list products: %v", err),
		})
	}

	resp := make([]ProductResponse, len(products))
	for i, p := range products {
		resp[i] = toProductResponse(p)
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    resp,
	})
}

func (h *ProductHandler) Update(c *fiber.Ctx) error {
	store := middleware.GetTenantStore(c)
	if store == nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "tenant_required",
			"message": "Tenant context is required",
		})
	}

	id := strings.TrimSpace(c.Params("id"))
	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "validation_error",
			"message": "id is required",
		})
	}

	// Fetch existing product first.
	existing, err := h.queries.GetProductByID(c.UserContext(), db.GetProductByIDParams{
		ID:      id,
		StoreID: store.ID,
	})
	if err != nil {
		if isNoRows(err) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error":   "not_found",
				"message": "Product not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "internal_error",
			"message": fmt.Sprintf("Failed to fetch product: %v", err),
		})
	}

	var req UpdateProductRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "invalid_body",
			"message": "Invalid request body",
		})
	}

	name := existing.Name
	if req.Name != nil {
		name = strings.TrimSpace(*req.Name)
		if name == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   "validation_error",
				"message": "name cannot be empty",
			})
		}
	}

	description := existing.Description
	if req.Description != nil {
		description = req.Description
	}

	price := existing.Price
	if req.Price != nil {
		price = *req.Price
		if price < 0 {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   "validation_error",
				"message": "price must be >= 0",
			})
		}
	}

	stock := existing.Stock
	if req.Stock != nil {
		stock = *req.Stock
	}

	imageURL := existing.ImageURL
	if req.ImageURL != nil {
		imageURL = req.ImageURL
	}

	isActive := existing.IsActive
	if req.IsActive != nil {
		isActive = *req.IsActive
	}

	product, err := h.queries.UpdateProduct(c.UserContext(), db.UpdateProductParams{
		ID:          id,
		Name:        name,
		Description: description,
		Price:       price,
		Stock:       stock,
		ImageURL:    imageURL,
		IsActive:    isActive,
		Metadata:    existing.Metadata,
		StoreID:     store.ID,
	})
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "internal_error",
			"message": fmt.Sprintf("Failed to update product: %v", err),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    toProductResponse(product),
	})
}

func (h *ProductHandler) Delete(c *fiber.Ctx) error {
	store := middleware.GetTenantStore(c)
	if store == nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "tenant_required",
			"message": "Tenant context is required",
		})
	}

	id := strings.TrimSpace(c.Params("id"))
	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "validation_error",
			"message": "id is required",
		})
	}

	if err := h.queries.DeleteProduct(c.UserContext(), db.DeleteProductParams{
		ID:      id,
		StoreID: store.ID,
	}); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "internal_error",
			"message": fmt.Sprintf("Failed to delete product: %v", err),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Product deleted",
	})
}

func toProductResponse(p db.Product) ProductResponse {
	return ProductResponse{
		ID:          p.ID,
		StoreID:     p.StoreID,
		Name:        p.Name,
		Description: p.Description,
		Price:       p.Price,
		Stock:       p.Stock,
		ImageURL:    p.ImageURL,
		IsActive:    p.IsActive,
		CreatedAt:   p.CreatedAt,
		UpdatedAt:   p.UpdatedAt,
	}
}
