package handlers

import (
	"fmt"
	"strings"
	"time"

	"github.com/Sayedtaha55/ray-eg/saas-backend/internal/db"
	"github.com/Sayedtaha55/ray-eg/saas-backend/internal/middleware"
	"github.com/gofiber/fiber/v2"
)

type CategoryHandler struct {
	queries *db.Queries
}

func NewCategoryHandler(q *db.Queries) *CategoryHandler {
	return &CategoryHandler{queries: q}
}

type CreateCategoryRequest struct {
	Name        string  `json:"name"`
	Slug        string  `json:"slug"`
	ParentID    *string `json:"parent_id"`
	Description *string `json:"description"`
	ImageURL    *string `json:"image_url"`
	SortOrder   *int32  `json:"sort_order"`
	IsActive    *bool   `json:"is_active"`
}

type UpdateCategoryRequest struct {
	Name        *string `json:"name"`
	Slug        *string `json:"slug"`
	Description *string `json:"description"`
	ImageURL    *string `json:"image_url"`
	SortOrder   *int32  `json:"sort_order"`
	IsActive    *bool   `json:"is_active"`
}

type CategoryResponse struct {
	ID          string    `json:"id"`
	StoreID     string    `json:"store_id"`
	ParentID    *string   `json:"parent_id"`
	Name        string    `json:"name"`
	Slug        string    `json:"slug"`
	Description *string   `json:"description"`
	ImageURL    *string   `json:"image_url"`
	SortOrder   int32     `json:"sort_order"`
	IsActive    bool      `json:"is_active"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

func (h *CategoryHandler) Create(c *fiber.Ctx) error {
	store := middleware.GetTenantStore(c)
	if store == nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "tenant_required",
			"message": "Tenant context is required",
		})
	}

	var req CreateCategoryRequest
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

	slug := strings.ToLower(strings.TrimSpace(req.Slug))
	if slug == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "validation_error",
			"message": "slug is required",
		})
	}

	var sortOrder int32 = 0
	if req.SortOrder != nil {
		sortOrder = *req.SortOrder
	}

	isActive := true
	if req.IsActive != nil {
		isActive = *req.IsActive
	}

	category, err := h.queries.CreateCategory(c.UserContext(), db.CreateCategoryParams{
		StoreID:     store.ID,
		ParentID:    req.ParentID,
		Name:        name,
		Slug:        slug,
		Description: req.Description,
		ImageURL:    req.ImageURL,
		SortOrder:   sortOrder,
		IsActive:    isActive,
	})
	if err != nil {
		if isUniqueViolation(err) {
			return c.Status(fiber.StatusConflict).JSON(fiber.Map{
				"error":   "conflict",
				"message": "Category with this slug already exists in this store",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "internal_error",
			"message": fmt.Sprintf("Failed to create category: %v", err),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"data":    toCategoryResponse(category),
	})
}

func (h *CategoryHandler) GetByID(c *fiber.Ctx) error {
	store := middleware.GetTenantStore(c)
	if store == nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "tenant_required", "message": "Tenant context is required"})
	}

	id := strings.TrimSpace(c.Params("id"))
	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "validation_error", "message": "id is required"})
	}

	category, err := h.queries.GetCategoryByID(c.UserContext(), db.GetCategoryByIDParams{ID: id, StoreID: store.ID})
	if err != nil {
		if isNoRows(err) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "not_found", "message": "Category not found"})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "internal_error", "message": fmt.Sprintf("Failed: %v", err)})
	}

	return c.JSON(fiber.Map{"success": true, "data": toCategoryResponse(category)})
}

func (h *CategoryHandler) List(c *fiber.Ctx) error {
	store := middleware.GetTenantStore(c)
	if store == nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "tenant_required", "message": "Tenant context is required"})
	}

	limit := int32(c.QueryInt("limit", 50))
	if limit <= 0 || limit > 200 {
		limit = 50
	}
	offset := int32(c.QueryInt("offset", 0))

	includeInactive := c.QueryBool("include_inactive", false)
	isActive := !includeInactive

	categories, err := h.queries.ListCategoriesByStore(c.UserContext(), db.ListCategoriesByStoreParams{
		StoreID:  store.ID,
		IsActive: isActive,
		Limit:    limit,
		Offset:   offset,
	})
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "internal_error", "message": fmt.Sprintf("Failed: %v", err)})
	}

	resp := make([]CategoryResponse, len(categories))
	for i, cat := range categories {
		resp[i] = toCategoryResponse(cat)
	}

	return c.JSON(fiber.Map{"success": true, "data": resp})
}

func (h *CategoryHandler) ListChildren(c *fiber.Ctx) error {
	store := middleware.GetTenantStore(c)
	if store == nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "tenant_required", "message": "Tenant context is required"})
	}

	parentID := strings.TrimSpace(c.Params("parentId"))
	var parentPtr *string
	if parentID != "" {
		parentPtr = &parentID
	}

	categories, err := h.queries.ListCategoriesByParent(c.UserContext(), db.ListCategoriesByParentParams{
		StoreID:  store.ID,
		ParentID: parentPtr,
	})
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "internal_error", "message": fmt.Sprintf("Failed: %v", err)})
	}

	resp := make([]CategoryResponse, len(categories))
	for i, cat := range categories {
		resp[i] = toCategoryResponse(cat)
	}

	return c.JSON(fiber.Map{"success": true, "data": resp})
}

func (h *CategoryHandler) Update(c *fiber.Ctx) error {
	store := middleware.GetTenantStore(c)
	if store == nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "tenant_required", "message": "Tenant context is required"})
	}

	id := strings.TrimSpace(c.Params("id"))
	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "validation_error", "message": "id is required"})
	}

	existing, err := h.queries.GetCategoryByID(c.UserContext(), db.GetCategoryByIDParams{ID: id, StoreID: store.ID})
	if err != nil {
		if isNoRows(err) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "not_found", "message": "Category not found"})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "internal_error", "message": fmt.Sprintf("Failed: %v", err)})
	}

	var req UpdateCategoryRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid_body", "message": "Invalid request body"})
	}

	name := existing.Name
	if req.Name != nil {
		name = strings.TrimSpace(*req.Name)
		if name == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "validation_error", "message": "name cannot be empty"})
		}
	}

	slug := existing.Slug
	if req.Slug != nil {
		slug = strings.ToLower(strings.TrimSpace(*req.Slug))
		if slug == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "validation_error", "message": "slug cannot be empty"})
		}
	}

	description := existing.Description
	if req.Description != nil {
		description = req.Description
	}

	imageURL := existing.ImageURL
	if req.ImageURL != nil {
		imageURL = req.ImageURL
	}

	sortOrder := existing.SortOrder
	if req.SortOrder != nil {
		sortOrder = *req.SortOrder
	}

	isActive := existing.IsActive
	if req.IsActive != nil {
		isActive = *req.IsActive
	}

	category, err := h.queries.UpdateCategory(c.UserContext(), db.UpdateCategoryParams{
		ID:          id,
		Name:        name,
		Slug:        slug,
		Description: description,
		ImageURL:    imageURL,
		SortOrder:   sortOrder,
		IsActive:    isActive,
		StoreID:     store.ID,
	})
	if err != nil {
		if isUniqueViolation(err) {
			return c.Status(fiber.StatusConflict).JSON(fiber.Map{"error": "conflict", "message": "Slug already exists"})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "internal_error", "message": fmt.Sprintf("Failed: %v", err)})
	}

	return c.JSON(fiber.Map{"success": true, "data": toCategoryResponse(category)})
}

func (h *CategoryHandler) Delete(c *fiber.Ctx) error {
	store := middleware.GetTenantStore(c)
	if store == nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "tenant_required", "message": "Tenant context is required"})
	}

	id := strings.TrimSpace(c.Params("id"))
	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "validation_error", "message": "id is required"})
	}

	if err := h.queries.DeleteCategory(c.UserContext(), db.DeleteCategoryParams{ID: id, StoreID: store.ID}); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "internal_error", "message": fmt.Sprintf("Failed: %v", err)})
	}

	return c.JSON(fiber.Map{"success": true, "message": "Category deleted"})
}

func (h *CategoryHandler) AssignProduct(c *fiber.Ctx) error {
	store := middleware.GetTenantStore(c)
	if store == nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "tenant_required", "message": "Tenant context is required"})
	}

	productID := strings.TrimSpace(c.Params("id"))
	categoryID := strings.TrimSpace(c.Params("categoryId"))
	if productID == "" || categoryID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "validation_error", "message": "product id and category id are required"})
	}

	// Verify both belong to this store.
	if _, err := h.queries.GetProductByID(c.UserContext(), db.GetProductByIDParams{ID: productID, StoreID: store.ID}); err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "not_found", "message": "Product not found in this store"})
	}
	if _, err := h.queries.GetCategoryByID(c.UserContext(), db.GetCategoryByIDParams{ID: categoryID, StoreID: store.ID}); err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "not_found", "message": "Category not found in this store"})
	}

	if err := h.queries.AddProductToCategory(c.UserContext(), productID, categoryID); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "internal_error", "message": fmt.Sprintf("Failed: %v", err)})
	}

	return c.JSON(fiber.Map{"success": true, "message": "Product assigned to category"})
}

func (h *CategoryHandler) UnassignProduct(c *fiber.Ctx) error {
	store := middleware.GetTenantStore(c)
	if store == nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "tenant_required", "message": "Tenant context is required"})
	}

	productID := strings.TrimSpace(c.Params("id"))
	categoryID := strings.TrimSpace(c.Params("categoryId"))
	if productID == "" || categoryID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "validation_error", "message": "product id and category id are required"})
	}

	if err := h.queries.RemoveProductFromCategory(c.UserContext(), productID, categoryID); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "internal_error", "message": fmt.Sprintf("Failed: %v", err)})
	}

	return c.JSON(fiber.Map{"success": true, "message": "Product removed from category"})
}

func toCategoryResponse(cat db.Category) CategoryResponse {
	return CategoryResponse{
		ID:          cat.ID,
		StoreID:     cat.StoreID,
		ParentID:    cat.ParentID,
		Name:        cat.Name,
		Slug:        cat.Slug,
		Description: cat.Description,
		ImageURL:    cat.ImageURL,
		SortOrder:   cat.SortOrder,
		IsActive:    cat.IsActive,
		CreatedAt:   cat.CreatedAt,
		UpdatedAt:   cat.UpdatedAt,
	}
}
