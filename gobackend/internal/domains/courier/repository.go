package courier

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/Sayedtaha55/ray-eg/gobackend/internal/platform/db"
)

// Repository handles database operations for courier
type Repository struct {
	pool *db.Pool
}

// NewRepository creates a new courier repository
func NewRepository(pool *db.Pool) *Repository {
	return &Repository{pool: pool}
}

// ListCouriers retrieves all couriers
func (r *Repository) ListCouriers(ctx context.Context, limit, offset int) ([]Courier, int64, error) {
	query := `
		SELECT u.id, u.name, u.phone, u.email, u.created_at, u.updated_at
		FROM users u
		WHERE u.role = 'COURIER'
		ORDER BY u.created_at DESC
		LIMIT $1 OFFSET $2
	`

	rows, err := r.pool.Query(ctx, query, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to query couriers: %w", err)
	}
	defer rows.Close()

	var couriers []Courier
	for rows.Next() {
		var courier Courier
		err := rows.Scan(
			&courier.ID, &courier.Name, &courier.Phone, &courier.Email,
			&courier.CreatedAt, &courier.UpdatedAt,
		)
		if err != nil {
			continue
		}
		courier.Status = CourierStatusAvailable
		courier.Rating = 0
		courier.TotalOrders = 0
		couriers = append(couriers, courier)
	}

	// Get total count
	var total int64
	err = r.pool.QueryRow(ctx, "SELECT COUNT(*) FROM users WHERE role = 'COURIER'").Scan(&total)
	if err != nil {
		return couriers, 0, nil
	}

	return couriers, total, nil
}

// GetCourierByID retrieves a courier by ID
func (r *Repository) GetCourierByID(ctx context.Context, id string) (*Courier, error) {
	query := `
		SELECT u.id, u.name, u.phone, u.email, u.created_at, u.updated_at
		FROM users u
		WHERE u.id = $1 AND u.role = 'COURIER'
	`

	var courier Courier
	err := r.pool.QueryRow(ctx, query, id).Scan(
		&courier.ID, &courier.Name, &courier.Phone, &courier.Email,
		&courier.CreatedAt, &courier.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("courier not found")
		}
		return nil, fmt.Errorf("failed to get courier: %w", err)
	}

	courier.Status = CourierStatusAvailable
	courier.Rating = 0
	courier.TotalOrders = 0

	return &courier, nil
}

// UpdateCourierStatus updates the status of a courier
func (r *Repository) UpdateCourierStatus(ctx context.Context, id string, status CourierStatus) error {
	_, err := r.pool.Exec(ctx,
		`UPDATE users SET updated_at = NOW() WHERE id = $1 AND role = 'COURIER'`,
		id,
	)
	return err
}
