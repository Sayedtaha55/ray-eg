package productcategories

import (
	"context"
	"fmt"
	"time"

	"github.com/Sayedtaha55/ray-eg/gobackend/internal/platform/db"
	"github.com/google/uuid"
)

// Repository handles DB operations for product categories.
type Repository struct {
	pool *db.Pool
}

func NewRepository(pool *db.Pool) *Repository {
	return &Repository{pool: pool}
}

// ListByShop returns all categories for a given shop.
func (r *Repository) ListByShop(ctx context.Context, shopID string) ([]Category, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, shop_id, name, name_ar, description, parent_category_id, image, status, created_at, updated_at
		FROM product_categories
		WHERE shop_id = $1
		ORDER BY name ASC
	`, shopID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var cats []Category
	for rows.Next() {
		var c Category
		if err := rows.Scan(
			&c.ID, &c.ShopID, &c.Name, &c.NameAr, &c.Description,
			&c.ParentCategoryID, &c.Image, &c.Status, &c.CreatedAt, &c.UpdatedAt,
		); err != nil {
			return nil, err
		}
		cats = append(cats, c)
	}
	if cats == nil {
		cats = []Category{}
	}
	return cats, rows.Err()
}

// GetByID returns a single category.
func (r *Repository) GetByID(ctx context.Context, id string) (*Category, error) {
	var c Category
	err := r.pool.QueryRow(ctx, `
		SELECT id, shop_id, name, name_ar, description, parent_category_id, image, status, created_at, updated_at
		FROM product_categories
		WHERE id = $1
	`, id).Scan(
		&c.ID, &c.ShopID, &c.Name, &c.NameAr, &c.Description,
		&c.ParentCategoryID, &c.Image, &c.Status, &c.CreatedAt, &c.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &c, nil
}

// Create inserts a new category.
func (r *Repository) Create(ctx context.Context, req CreateCategoryRequest) (*Category, error) {
	id := uuid.New().String()
	now := time.Now()

	status := req.Status
	if status == "" {
		status = "active"
	}
	nameAr := req.NameAr
	if nameAr == "" {
		nameAr = req.Name
	}

	_, err := r.pool.Exec(ctx, `
		INSERT INTO product_categories (id, shop_id, name, name_ar, description, parent_category_id, image, status, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $9)
	`, id, req.ShopID, req.Name, nameAr, req.Description, req.ParentCategoryID, req.Image, status, now)
	if err != nil {
		return nil, err
	}
	return r.GetByID(ctx, id)
}

// Update modifies an existing category.
func (r *Repository) Update(ctx context.Context, id string, req UpdateCategoryRequest) (*Category, error) {
	setParts := []string{}
	args := []interface{}{}
	idx := 1

	if req.Name != nil {
		setParts = append(setParts, fmt.Sprintf("name = $%d", idx))
		args = append(args, *req.Name)
		idx++
	}
	if req.NameAr != nil {
		setParts = append(setParts, fmt.Sprintf("name_ar = $%d", idx))
		args = append(args, *req.NameAr)
		idx++
	}
	if req.Description != nil {
		setParts = append(setParts, fmt.Sprintf("description = $%d", idx))
		args = append(args, *req.Description)
		idx++
	}
	if req.ParentCategoryID != nil {
		if *req.ParentCategoryID == "" {
			setParts = append(setParts, fmt.Sprintf("parent_category_id = $%d", idx))
			args = append(args, nil)
		} else {
			setParts = append(setParts, fmt.Sprintf("parent_category_id = $%d", idx))
			args = append(args, *req.ParentCategoryID)
		}
		idx++
	}
	if req.Image != nil {
		setParts = append(setParts, fmt.Sprintf("image = $%d", idx))
		args = append(args, *req.Image)
		idx++
	}
	if req.Status != nil {
		setParts = append(setParts, fmt.Sprintf("status = $%d", idx))
		args = append(args, *req.Status)
		idx++
	}

	if len(setParts) == 0 {
		return r.GetByID(ctx, id)
	}

	setParts = append(setParts, fmt.Sprintf("updated_at = $%d", idx))
	args = append(args, time.Now())
	idx++
	args = append(args, id)

	query := "UPDATE product_categories SET "
	for i, p := range setParts {
		if i > 0 {
			query += ", "
		}
		query += p
	}
	query += fmt.Sprintf(" WHERE id = $%d", idx)

	_, err := r.pool.Exec(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	return r.GetByID(ctx, id)
}

// Delete removes a category.
func (r *Repository) Delete(ctx context.Context, id string) error {
	_, err := r.pool.Exec(ctx, "DELETE FROM product_categories WHERE id = $1", id)
	return err
}
