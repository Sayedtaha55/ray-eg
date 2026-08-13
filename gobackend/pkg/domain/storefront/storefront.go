// Package storefront defines the Multi-Storefront domain boundary.
// Each shop can have its own branded storefront with independent rate limits
// stored in Redis (reuses existing platform/redis client).
package storefront

import (
	"context"

	"github.com/google/uuid"
)

// StorefrontService is the boundary interface for the storefront domain.
type StorefrontService interface {
	GetStorefront(ctx context.Context, shopSlug string) (*Storefront, error)
	ListProducts(ctx context.Context, shopID uuid.UUID, filter ProductFilter) ([]Product, error)
	RecordVisit(ctx context.Context, shopID uuid.UUID, visitorID string) error
}

// Storefront represents a shop's public-facing configuration.
type Storefront struct {
	ShopID      uuid.UUID      `json:"shop_id"`
	Slug        string         `json:"slug"`
	Name        string         `json:"name"`
	Theme       map[string]any `json:"theme"`        // builder config (JSONB)
	CustomAttrs map[string]any `json:"custom_attrs"` // Odoo-like dynamic fields
}

type Product struct {
	ID    uuid.UUID `json:"id"`
	Name  string    `json:"name"`
	Price float64   `json:"price"`
	Stock int       `json:"stock"`
}

type ProductFilter struct {
	CategoryID *uuid.UUID
	MinPrice   *float64
	MaxPrice   *float64
	Page       int
	PageSize   int
}
