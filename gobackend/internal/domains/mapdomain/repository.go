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
