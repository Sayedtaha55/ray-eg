package products

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/Sayedtaha55/ray-eg/gobackend/internal/platform/db"
	"github.com/Sayedtaha55/ray-eg/gobackend/internal/platform/errors"
	"github.com/jackc/pgx/v5"
)

// Repository handles persistence for the Products domain.
type Repository struct {
	pool *db.Pool
}

// NewRepository creates a new products repository.
func NewRepository(pool *db.Pool) *Repository {
	return &Repository{pool: pool}
}

// FindByID returns a product by ID or nil if not found.
func (r *Repository) FindByID(ctx context.Context, id string) (*Product, error) {
	row := r.pool.QueryRow(ctx, selectProduct+" WHERE p.id = $1 LIMIT 1", id)
	return scanProduct(row)
}

// FindByIDWithInactive returns a product by ID regardless of is_active.
func (r *Repository) FindByIDWithInactive(ctx context.Context, id string) (*Product, error) {
	return r.FindByID(ctx, id)
}

// ListByShop returns active products for a shop, excluding image-map and duplicate categories.
func (r *Repository) ListByShop(ctx context.Context, shopID string, limit, offset int) ([]Product, error) {
	filters := "p.shop_id = $1 AND p.is_active = true AND " + excludeHiddenCategoriesSQL
	query := selectProduct + " WHERE " + filters + " ORDER BY p.created_at DESC LIMIT $2 OFFSET $3"
	rows, err := r.pool.Query(ctx, query, shopID, limit, offset)
	if err != nil {
		return nil, errors.Internal("list_products_failed", err)
	}
	defer rows.Close()
	return scanProducts(rows)
}

// ListAllActive returns all active products, excluding hidden categories.
func (r *Repository) ListAllActive(ctx context.Context, limit, offset int) ([]Product, error) {
	filters := "p.is_active = true AND " + excludeHiddenCategoriesSQL
	query := selectProduct + " WHERE " + filters + " ORDER BY p.created_at DESC LIMIT $1 OFFSET $2"
	rows, err := r.pool.Query(ctx, query, limit, offset)
	if err != nil {
		return nil, errors.Internal("list_products_failed", err)
	}
	defer rows.Close()
	return scanProducts(rows)
}

// ListByShopForManage returns products for a shop including inactive ones.
func (r *Repository) ListByShopForManage(ctx context.Context, shopID string, limit, offset int, includeImageMap bool) ([]Product, error) {
	filters := "p.shop_id = $1"
	args := []any{shopID, limit, offset}
	if !includeImageMap {
		filters += " AND " + excludeHiddenCategoriesSQL
	} else {
		filters += " AND p.category != '__DUPLICATE__AUTO__'"
	}
	query := selectProduct + " WHERE " + filters + " ORDER BY p.created_at DESC LIMIT $2 OFFSET $3"
	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, errors.Internal("list_products_manage_failed", err)
	}
	defer rows.Close()
	return scanProducts(rows)
}

// Create inserts a product with an optional furniture meta row.
func (r *Repository) Create(ctx context.Context, p *Product) (*Product, error) {
	query := `
		INSERT INTO products (
			id, name, description, price, stock, category, image_url, is_active,
			shop_id, track_stock, unit, images, colors, sizes, addons,
			menu_variants, pack_options, model_3d_url, spin_images, created_at, updated_at
		) VALUES (
			gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, NOW(), NOW()
		) RETURNING ` + productColumns

	row := r.pool.QueryRow(ctx, query,
		p.Name, p.Description, p.Price, p.Stock, p.Category, p.ImageURL, p.IsActive,
		p.ShopID, p.TrackStock, p.Unit, p.Images, p.Colors, p.Sizes, p.Addons,
		p.MenuVariants, p.PackOptions, p.Model3DURL, p.SpinImages,
	)
	created, err := scanProduct(row)
	if err != nil {
		return nil, err
	}
	if p.FurnitureMeta != nil {
		fm, err := r.upsertFurnitureMeta(ctx, created.ID, p.FurnitureMeta)
		if err != nil {
			return nil, err
		}
		created.FurnitureMeta = fm
	}
	return created, nil
}

// Update applies a partial update to a product and optionally updates furniture meta.
func (r *Repository) Update(ctx context.Context, id string, fields map[string]any, furnitureMeta *FurnitureMeta) (*Product, error) {
	set := []string{}
	args := []any{}
	i := 1
	for col, val := range fields {
		set = append(set, fmt.Sprintf("%s = $%d", col, i))
		args = append(args, val)
		i++
	}
	if len(set) == 0 && furnitureMeta == nil {
		return r.FindByID(ctx, id)
	}
	set = append(set, fmt.Sprintf("updated_at = $%d", i))
	args = append(args, time.Now().UTC())
	i++
	args = append(args, id)

	query := "UPDATE products SET " + strings.Join(set, ", ") + fmt.Sprintf(" WHERE id = $%d RETURNING ", i) + productColumns
	row := r.pool.QueryRow(ctx, query, args...)
	updated, err := scanProduct(row)
	if err != nil {
		return nil, err
	}
	if furnitureMeta != nil {
		fm, err := r.upsertFurnitureMeta(ctx, id, furnitureMeta)
		if err != nil {
			return nil, err
		}
		updated.FurnitureMeta = fm
	}
	return updated, nil
}

// Delete removes a product by ID.
func (r *Repository) Delete(ctx context.Context, id string) error {
	_, err := r.pool.Exec(ctx, "DELETE FROM products WHERE id = $1", id)
	return err
}

// ShopExists checks if a shop with the given ID exists.
func (r *Repository) ShopExists(ctx context.Context, shopID string) (bool, error) {
	var exists bool
	err := r.pool.QueryRow(ctx, "SELECT EXISTS(SELECT 1 FROM shops WHERE id = $1)", shopID).Scan(&exists)
	return exists, err
}

// GetShopCategory returns the category of a shop.
func (r *Repository) GetShopCategory(ctx context.Context, shopID string) (string, error) {
	var category string
	err := r.pool.QueryRow(ctx, "SELECT category FROM shops WHERE id = $1", shopID).Scan(&category)
	if err != nil {
		return "", err
	}
	return category, nil
}

func (r *Repository) upsertFurnitureMeta(ctx context.Context, productID string, fm *FurnitureMeta) (*FurnitureMeta, error) {
	query := `
		INSERT INTO product_furniture_meta (id, product_id, unit, length_cm, width_cm, height_cm, created_at, updated_at)
		VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW(), NOW())
		ON CONFLICT (product_id) DO UPDATE SET
			unit = EXCLUDED.unit,
			length_cm = EXCLUDED.length_cm,
			width_cm = EXCLUDED.width_cm,
			height_cm = EXCLUDED.height_cm,
			updated_at = NOW()
		RETURNING id, unit, length_cm, width_cm, height_cm
	`
	row := r.pool.QueryRow(ctx, query, productID, fm.Unit, fm.LengthCm, fm.WidthCm, fm.HeightCm)
	var out FurnitureMeta
	if err := row.Scan(&out.ID, &out.Unit, &out.LengthCm, &out.WidthCm, &out.HeightCm); err != nil {
		return nil, err
	}
	return &out, nil
}

const productColumns = `
	p.id, p.name, p.description, p.price, p.stock, p.category, p.image_url, p.is_active,
	p.shop_id, p.track_stock, p.unit, p.images, p.colors, p.sizes, p.addons,
	p.menu_variants, p.pack_options, p.model_3d_url, p.spin_images, p.created_at, p.updated_at,
	fm.id AS fm_id, fm.unit AS fm_unit, fm.length_cm AS fm_length, fm.width_cm AS fm_width, fm.height_cm AS fm_height
`

const selectProduct = `SELECT ` + productColumns + ` FROM products p LEFT JOIN product_furniture_meta fm ON fm.product_id = p.id`

func scanProduct(row pgx.Row) (*Product, error) {
	p := &Product{}
	var desc, imageURL, unit, model3d sql.NullString
	var fmID, fmUnit sql.NullString
	var fmLength, fmWidth, fmHeight sql.NullFloat64

	err := row.Scan(
		&p.ID, &p.Name, &desc, &p.Price, &p.Stock, &p.Category, &imageURL, &p.IsActive,
		&p.ShopID, &p.TrackStock, &unit, &p.Images, &p.Colors, &p.Sizes, &p.Addons,
		&p.MenuVariants, &p.PackOptions, &model3d, &p.SpinImages, &p.CreatedAt, &p.UpdatedAt,
		&fmID, &fmUnit, &fmLength, &fmWidth, &fmHeight,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, errors.Internal("scan_product_failed", err)
	}

	p.Description = nullStringPtr(desc)
	p.ImageURL = nullStringPtr(imageURL)
	p.Unit = nullStringPtr(unit)
	p.Model3DURL = nullStringPtr(model3d)

	if fmID.Valid {
		p.FurnitureMeta = &FurnitureMeta{
			ID:       fmID.String,
			Unit:     nullStringPtr(fmUnit),
			LengthCm: nullFloat64Ptr(fmLength),
			WidthCm:  nullFloat64Ptr(fmWidth),
			HeightCm: nullFloat64Ptr(fmHeight),
		}
	}

	return p, nil
}

func scanProducts(rows pgx.Rows) ([]Product, error) {
	var products []Product
	for rows.Next() {
		p, err := scanProduct(rows)
		if err != nil {
			return nil, err
		}
		if p != nil {
			products = append(products, *p)
		}
	}
	return products, rows.Err()
}

const excludeHiddenCategoriesSQL = `p.category != '__IMAGE_MAP__' AND p.category NOT ILIKE '%IMAGE_MAP%' AND p.category != '__DUPLICATE__AUTO__'`

func nullStringPtr(s sql.NullString) *string {
	if !s.Valid || s.String == "" {
		return nil
	}
	return &s.String
}

func nullFloat64Ptr(f sql.NullFloat64) *float64 {
	if !f.Valid {
		return nil
	}
	return &f.Float64
}
