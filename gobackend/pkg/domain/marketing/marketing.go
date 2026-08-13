// Package marketing defines the Marketing Directory Portal domain boundary.
package marketing

import (
	"context"
	"time"

	"github.com/google/uuid"
)

// MarketingService is the boundary interface for the marketing domain.
type MarketingService interface {
	ListFeaturedShops(ctx context.Context, filter ShopFilter) ([]ShopListing, error)
	SubmitLead(ctx context.Context, lead Lead) error
	TrackCampaign(ctx context.Context, event CampaignEvent) error
}

type ShopListing struct {
	ShopID   uuid.UUID `json:"shop_id"`
	Name     string    `json:"name"`
	Category string    `json:"category"`
	Rating   float64   `json:"rating"`
	Featured bool      `json:"featured"`
}

type ShopFilter struct {
	Category string
	City     string
	Page     int
	PageSize int
}

type Lead struct {
	ShopID    uuid.UUID `json:"shop_id"`
	Name      string    `json:"name"`
	Phone     string    `json:"phone"`
	Source    string    `json:"source"` // e.g. "portal", "qr_code"
	CreatedAt time.Time `json:"created_at"`
}

type CampaignEvent struct {
	CampaignID uuid.UUID `json:"campaign_id"`
	ShopID     uuid.UUID `json:"shop_id"`
	Action     string    `json:"action"` // "click", "view", "conversion"
	VisitorID  string    `json:"visitor_id"`
	OccurredAt time.Time `json:"occurred_at"`
}
