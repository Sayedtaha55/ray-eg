package seasonaloffers

import (
	"context"
	"database/sql"
	"fmt"
	"strings"

	"github.com/Sayedtaha55/ray-eg/gobackend/internal/platform/db"
	"github.com/Sayedtaha55/ray-eg/gobackend/internal/platform/errors"
	"github.com/jackc/pgx/v5"
)

// Repository handles persistence for the SeasonalOffers domain.
type Repository struct {
	pool *db.Pool
}

// NewRepository creates a new seasonal offers repository.
func NewRepository(pool *db.Pool) *Repository {
	return &Repository{pool: pool}
}

const seasonalOfferColumns = `
	so.id, so.shop_id, so.name, so.description, so.occasion,
	so.discount_type, so.discount_value, so.categories, so.start_date, so.end_date,
	so.banner_color, so.status, so.is_active, so.created_at, so.updated_at
`

const seasonalOfferJoinColumns = `
	s.name AS shop_name, s.slug AS shop_slug
`

// FindByID returns a seasonal offer by ID with join data.
func (r *Repository) FindByID(ctx context.Context, id string) (*SeasonalOffer, error) {
	query := "SELECT " + seasonalOfferColumns + ", " + seasonalOfferJoinColumns + `
		FROM seasonal_offers so
		LEFT JOIN shops s ON s.id = so.shop_id
		WHERE so.id = $1 LIMIT 1
	`
	row := r.pool.QueryRow(ctx, query, id)
	return scanSeasonalOffer(row)
}

// ListByShop returns seasonal offers for a shop with optional filters.
func (r *Repository) ListByShop(ctx context.Context, shopID, status, occasion string, limit, offset int) ([]SeasonalOffer, error) {
	filters := "so.is_active = true"
	args := []any{limit, offset}
	idx := 3

	if shopID != "" {
		filters += fmt.Sprintf(" AND so.shop_id = $%d", idx)
		args = append(args, shopID)
		idx++
	}
	if status != "" {
		filters += fmt.Sprintf(" AND so.status = $%d", idx)
		args = append(args, strings.ToUpper(status))
		idx++
	}
	if occasion != "" {
		filters += fmt.Sprintf(" AND so.occasion = $%d", idx)
		args = append(args, occasion)
		idx++
	}

	query := "SELECT " + seasonalOfferColumns + ", " + seasonalOfferJoinColumns + `
		FROM seasonal_offers so
		LEFT JOIN shops s ON s.id = so.shop_id
		WHERE ` + filters + `
		ORDER BY so.created_at DESC
		LIMIT $1 OFFSET $2
	`
	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, errors.Internal("list_seasonal_offers_failed", err)
	}
	defer rows.Close()
	return scanSeasonalOffers(rows)
}

// ListPublic returns active seasonal offers for all shops (for marketplace).
func (r *Repository) ListPublic(ctx context.Context, limit, offset int) ([]SeasonalOffer, error) {
	query := "SELECT " + seasonalOfferColumns + ", " + seasonalOfferJoinColumns + `
		FROM seasonal_offers so
		LEFT JOIN shops s ON s.id = so.shop_id
		WHERE so.is_active = true
		  AND so.status = 'active'
		  AND so.start_date <= NOW()
		  AND so.end_date >= NOW()
		ORDER BY so.created_at DESC
		LIMIT $1 OFFSET $2
	`
	rows, err := r.pool.Query(ctx, query, limit, offset)
	if err != nil {
		return nil, errors.Internal("list_public_seasonal_offers_failed", err)
	}
	defer rows.Close()
	return scanSeasonalOffers(rows)
}

// Create inserts a new seasonal offer.
func (r *Repository) Create(ctx context.Context, o *SeasonalOffer) (*SeasonalOffer, error) {
	row := r.pool.QueryRow(ctx, `
		INSERT INTO seasonal_offers (
			id, shop_id, name, description, occasion,
			discount_type, discount_value, categories, start_date, end_date,
			banner_color, status, is_active, created_at, updated_at
		) VALUES (
			gen_random_uuid(), $1, $2, $3, $4,
			$5, $6, $7, $8, $9,
			$10, $11, true, NOW(), NOW()
		) RETURNING `+seasonalOfferColumns,
		o.ShopID, o.Name, o.Description, o.Occasion,
		o.DiscountType, o.DiscountValue, o.Categories, o.StartDate, o.EndDate,
		o.BannerColor, o.Status,
	)
	return scanSeasonalOffer(row)
}

// Update updates a seasonal offer by ID.
func (r *Repository) Update(ctx context.Context, id string, req UpdateSeasonalOfferRequest) (*SeasonalOffer, error) {
	setParts := []string{"updated_at = NOW()"}
	args := []any{}
	idx := 1

	if req.Name != nil {
		setParts = append(setParts, fmt.Sprintf("name = $%d", idx))
		args = append(args, *req.Name)
		idx++
	}
	if req.Description != nil {
		setParts = append(setParts, fmt.Sprintf("description = $%d", idx))
		args = append(args, *req.Description)
		idx++
	}
	if req.Occasion != nil {
		setParts = append(setParts, fmt.Sprintf("occasion = $%d", idx))
		args = append(args, *req.Occasion)
		idx++
	}
	if req.DiscountType != nil {
		setParts = append(setParts, fmt.Sprintf("discount_type = $%d", idx))
		args = append(args, *req.DiscountType)
		idx++
	}
	if req.DiscountValue != nil {
		setParts = append(setParts, fmt.Sprintf("discount_value = $%d", idx))
		args = append(args, *req.DiscountValue)
		idx++
	}
	if req.Categories != nil {
		setParts = append(setParts, fmt.Sprintf("categories = $%d", idx))
		args = append(args, req.Categories)
		idx++
	}
	if req.StartDate != nil {
		setParts = append(setParts, fmt.Sprintf("start_date = $%d", idx))
		args = append(args, *req.StartDate)
		idx++
	}
	if req.EndDate != nil {
		setParts = append(setParts, fmt.Sprintf("end_date = $%d", idx))
		args = append(args, *req.EndDate)
		idx++
	}
	if req.BannerColor != nil {
		setParts = append(setParts, fmt.Sprintf("banner_color = $%d", idx))
		args = append(args, *req.BannerColor)
		idx++
	}
	if req.Status != nil {
		setParts = append(setParts, fmt.Sprintf("status = $%d", idx))
		args = append(args, strings.ToUpper(*req.Status))
		idx++
	}

	args = append(args, id)
	query := fmt.Sprintf(
		"UPDATE seasonal_offers SET %s WHERE id = $%d RETURNING "+seasonalOfferColumns,
		strings.Join(setParts, ", "), idx,
	)
	row := r.pool.QueryRow(ctx, query, args...)
	return scanSeasonalOffer(row)
}

// Delete sets is_active = false for a seasonal offer.
func (r *Repository) Delete(ctx context.Context, id string) error {
	_, err := r.pool.Exec(ctx, "UPDATE seasonal_offers SET is_active = false, updated_at = NOW() WHERE id = $1", id)
	if err != nil {
		return errors.Internal("delete_seasonal_offer_failed", err)
	}
	return nil
}

func scanSeasonalOffer(row pgx.Row) (*SeasonalOffer, error) {
	var o SeasonalOffer
	var desc sql.NullString
	var shopName, shopSlug sql.NullString
	var categories []string

	err := row.Scan(
		&o.ID, &o.ShopID, &o.Name, &desc, &o.Occasion,
		&o.DiscountType, &o.DiscountValue, &categories, &o.StartDate, &o.EndDate,
		&o.BannerColor, &o.Status, &o.IsActive, &o.CreatedAt, &o.UpdatedAt,
		&shopName, &shopSlug,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, errors.Internal("scan_seasonal_offer_failed", err)
	}

	o.Description = nullStringPtr(desc)
	o.ShopName = nullStringPtr(shopName)
	o.ShopSlug = nullStringPtr(shopSlug)
	if categories != nil {
		o.Categories = categories
	} else {
		o.Categories = []string{}
	}
	return &o, nil
}

func scanSeasonalOffers(rows pgx.Rows) ([]SeasonalOffer, error) {
	var offers []SeasonalOffer
	for rows.Next() {
		o, err := scanSeasonalOffer(rows)
		if err != nil {
			return nil, err
		}
		if o != nil {
			offers = append(offers, *o)
		}
	}
	return offers, rows.Err()
}

func nullStringPtr(s sql.NullString) *string {
	if !s.Valid || s.String == "" {
		return nil
	}
	return &s.String
}
