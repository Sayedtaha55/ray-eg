package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"regexp"
	"strings"
	"time"

	"github.com/Sayedtaha55/ray-eg/saas-backend/internal/db"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
)

type StoreHandler struct {
	queries *db.Queries
}

func NewStoreHandler(q *db.Queries) *StoreHandler {
	return &StoreHandler{queries: q}
}

type CreateStoreRequest struct {
	Name      string  `json:"name"`
	Slug      string  `json:"slug"`
	Domain    *string `json:"domain"`
	Subdomain *string `json:"subdomain"`
	LogoURL   *string `json:"logo_url"`
}

type StoreResponse struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Slug      string    `json:"slug"`
	Domain    *string   `json:"domain"`
	Subdomain *string   `json:"subdomain"`
	LogoURL   *string   `json:"logo_url"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

var slugRegex = regexp.MustCompile(`^[a-z0-9]([a-z0-9-]{0,98}[a-z0-9])?$`)

func (h *StoreHandler) Create(c *fiber.Ctx) error {
	var req CreateStoreRequest
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
	if !slugRegex.MatchString(slug) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "validation_error",
			"message": "slug must be lowercase alphanumeric with hyphens",
		})
	}

	params := db.CreateStoreParams{
		Name:      name,
		Slug:      slug,
		Domain:    req.Domain,
		Subdomain: req.Subdomain,
		LogoURL:   req.LogoURL,
		Status:    db.StoreStatusPending,
		Settings:  json.RawMessage(`{}`),
	}

	store, err := h.queries.CreateStore(c.UserContext(), params)
	if err != nil {
		if isUniqueViolation(err) {
			return c.Status(fiber.StatusConflict).JSON(fiber.Map{
				"error":   "conflict",
				"message": "slug, domain, or subdomain already exists",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "internal_error",
			"message": fmt.Sprintf("Failed to create store: %v", err),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"data":    toStoreResponse(store),
	})
}

func (h *StoreHandler) GetByDomain(c *fiber.Ctx) error {
	domain := strings.TrimSpace(c.Params("domain"))
	if domain == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "validation_error",
			"message": "domain is required",
		})
	}

	store, err := h.queries.GetStoreByDomain(c.UserContext(), domain)
	if err != nil {
		if isNoRows(err) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error":   "not_found",
				"message": "Store not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "internal_error",
			"message": fmt.Sprintf("Failed to fetch store: %v", err),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    toStoreResponse(store),
	})
}

func (h *StoreHandler) GetByID(c *fiber.Ctx) error {
	id := strings.TrimSpace(c.Params("id"))
	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "validation_error",
			"message": "id is required",
		})
	}

	if _, err := uuid.Parse(id); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "validation_error",
			"message": "invalid id format",
		})
	}

	store, err := h.queries.GetStoreByID(c.UserContext(), id)
	if err != nil {
		if isNoRows(err) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error":   "not_found",
				"message": "Store not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "internal_error",
			"message": fmt.Sprintf("Failed to fetch store: %v", err),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    toStoreResponse(store),
	})
}

func (h *StoreHandler) List(c *fiber.Ctx) error {
	limit := c.QueryInt("limit", 20)
	if limit <= 0 || limit > 100 {
		limit = 20
	}
	offset := c.QueryInt("offset", 0)
	if offset < 0 {
		offset = 0
	}

	stores, err := h.queries.ListStores(c.UserContext(), db.ListStoresParams{
		Limit:  int32(limit),
		Offset: int32(offset),
	})
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "internal_error",
			"message": fmt.Sprintf("Failed to list stores: %v", err),
		})
	}

	resp := make([]StoreResponse, len(stores))
	for i, s := range stores {
		resp[i] = toStoreResponse(s)
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    resp,
	})
}

func toStoreResponse(s db.Store) StoreResponse {
	return StoreResponse{
		ID:        s.ID,
		Name:      s.Name,
		Slug:      s.Slug,
		Domain:    s.Domain,
		Subdomain: s.Subdomain,
		LogoURL:   s.LogoURL,
		Status:    string(s.Status),
		CreatedAt: s.CreatedAt,
		UpdatedAt: s.UpdatedAt,
	}
}

func isUniqueViolation(err error) bool {
	var pgErr *pgconn.PgError
	if err != nil && pgErr != nil {
		return pgErr.Code == "23505"
	}
	_ = context.Background()
	_ = pgx.ErrNoRows
	return false
}

func isNoRows(err error) bool {
	return err == pgx.ErrNoRows
}
