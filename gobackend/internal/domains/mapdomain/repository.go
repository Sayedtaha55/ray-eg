package mapdomain

import (
	"context"
	"fmt"

	"github.com/Sayedtaha55/ray-eg/gobackend/internal/platform/db"
)

// Repository handles database operations for map pins
type Repository struct {
	pool *db.Pool
}

// NewRepository creates a new map repository
func NewRepository(pool *db.Pool) *Repository {
	return &Repository{pool: pool}
}

// GetPins retrieves map pins, optionally filtered by lat/lng/radius
func (r *Repository) GetPins(ctx context.Context, lat, lng *float64, radiusKm *float64) ([]MapPin, error) {
	query := `
		SELECT id, slug, 'shop' as type, name, display_address, city, latitude, longitude
		FROM shops
		WHERE status = 'APPROVED'
			AND latitude IS NOT NULL
			AND longitude IS NOT NULL
	`
	args := []interface{}{}
	argIndex := 1

	if lat != nil && lng != nil && radiusKm != nil {
		query += fmt.Sprintf(" AND (6371 * acos(cos(radians($%d)) * cos(radians(latitude)) * cos(radians(longitude) - radians($%d)) + sin(radians($%d)) * sin(radians(latitude)))) <= $%d",
			argIndex, argIndex+1, argIndex, argIndex+2)
		args = append(args, *lat, *lng, *radiusKm)
		argIndex += 3
	}

	query += " LIMIT 500"

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to query map pins: %w", err)
	}
	defer rows.Close()

	var pins []MapPin
	for rows.Next() {
		var pin MapPin
		var addrLabel *string
		if err := rows.Scan(&pin.ID, &pin.Slug, &pin.Type, &pin.Title, &addrLabel, &pin.City, &pin.Latitude, &pin.Longitude); err != nil {
			continue
		}
		if addrLabel != nil {
			pin.AddressLabel = *addrLabel
		}
		pins = append(pins, pin)
	}

	return pins, nil
}

// ListPendingListings retrieves pending map listings for admin review
func (r *Repository) ListPendingListings(ctx context.Context, limit int) ([]map[string]any, error) {
	if limit <= 0 || limit > 100 {
		limit = 100
	}
	rows, err := r.pool.Query(ctx, `
		SELECT l.id, l.title, COALESCE(l.category, ''), COALESCE(l.description, ''),
		       COALESCE(l.website_url, ''), COALESCE(l.phone, ''), COALESCE(l.whatsapp, ''),
		       COALESCE(l.logo_url, ''), COALESCE(l.cover_url, ''), l.status::text, l.created_at::text
		FROM map_listings l
		WHERE l.status = 'PENDING'
		ORDER BY l.created_at DESC
		LIMIT $1`, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []map[string]any
	for rows.Next() {
		var id, title, cat, desc, web, phone, wa, logo, cover, status, createdAt string
		if err := rows.Scan(&id, &title, &cat, &desc, &web, &phone, &wa, &logo, &cover, &status, &createdAt); err != nil {
			continue
		}

		branchRows, _ := r.pool.Query(ctx, `SELECT id, name, latitude, longitude, address_label, governorate, city, is_primary FROM map_listing_branches WHERE listing_id = $1`, id)
		var branches []map[string]any
		if branchRows != nil {
			for branchRows.Next() {
				var bid, bname, baddr, bgov, bcity *string
				var blat, blng float64
				var bprimary bool
				if err := branchRows.Scan(&bid, &bname, &blat, &blng, &baddr, &bgov, &bcity, &bprimary); err == nil {
					branches = append(branches, map[string]any{
						"id": bid, "name": bname, "latitude": blat, "longitude": blng,
						"addressLabel": baddr, "governorate": bgov, "city": bcity, "isPrimary": bprimary,
					})
				}
			}
			branchRows.Close()
		}

		results = append(results, map[string]any{
			"id": id, "title": title, "category": cat, "description": desc,
			"websiteUrl": web, "phone": phone, "whatsapp": wa, "logoUrl": logo,
			"coverUrl": cover, "status": status, "createdAt": createdAt,
			"branches": branches,
		})
	}
	if results == nil {
		results = []map[string]any{}
	}
	return results, nil
}

// SetListingStatus updates the approval status of a map listing
func (r *Repository) SetListingStatus(ctx context.Context, id, status, note, adminID string) error {
	_, err := r.pool.Exec(ctx, `
		UPDATE map_listings
		SET status = $1::"MapListingStatus", review_note = $2, reviewed_by_admin_id = NULLIF($3, ''), reviewed_at = NOW(), updated_at = NOW()
		WHERE id = $4`, status, note, adminID, id)
	return err
}
