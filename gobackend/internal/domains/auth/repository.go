package auth

import (
	"context"
	"database/sql"
	"time"

	"github.com/Sayedtaha55/ray-eg/gobackend/internal/platform/db"
	"github.com/Sayedtaha55/ray-eg/gobackend/internal/platform/errors"
	"github.com/Sayedtaha55/ray-eg/gobackend/internal/platform/logger"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"go.uber.org/zap"
)

// Repository handles persistence for the Auth domain.
type Repository struct {
	pool *db.Pool
}

// NewRepository creates a new auth repository.
func NewRepository(pool *db.Pool) *Repository {
	return &Repository{pool: pool}
}

// FindByEmail returns a user by email or nil if not found.
func (r *Repository) FindByEmail(ctx context.Context, email string) (*User, error) {
	query := `
		SELECT id, email, name, phone, password, role, shop_id, is_active,
		       email_verified_at, email_verification_sent_at, last_login, tfa_secret,
		       created_at, updated_at
		FROM users
		WHERE email = $1
		LIMIT 1
	`
	row := r.pool.QueryRow(ctx, query, email)
	return scanUser(row)
}

// FindByID returns a user by ID.
func (r *Repository) FindByID(ctx context.Context, id string) (*User, error) {
	query := `
		SELECT id, email, name, phone, password, role, shop_id, is_active,
		       email_verified_at, email_verification_sent_at, last_login, tfa_secret,
		       created_at, updated_at
		FROM users
		WHERE id = $1
		LIMIT 1
	`
	row := r.pool.QueryRow(ctx, query, id)
	return scanUser(row)
}

// FindFirstAdmin returns the first admin user or nil.
func (r *Repository) FindFirstAdmin(ctx context.Context) (*User, error) {
	query := `
		SELECT id, email, name, phone, password, role, shop_id, is_active,
		       email_verified_at, email_verification_sent_at, last_login, tfa_secret,
		       created_at, updated_at
		FROM users
		WHERE role = 'ADMIN'
		LIMIT 1
	`
	row := r.pool.QueryRow(ctx, query)
	return scanUser(row)
}

// CreateDevShop creates a development shop for a merchant user.
func (r *Repository) CreateDevShop(ctx context.Context, userID, category string) (string, error) {
	shopID := "dev-shop-" + userID
	query := `
		INSERT INTO shops (id, owner_id, name, category, phone, governorate, city, is_active, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, true, NOW(), NOW())
		ON CONFLICT (id) DO UPDATE SET owner_id = $2, updated_at = NOW()
		RETURNING id
	`

	shopName := "Dev Shop"
	if category != "" {
		shopName = "Dev " + category + " Shop"
	}

	row := r.pool.QueryRow(ctx, query, shopID, userID, shopName, category, "01000000000", "Cairo", "Cairo")
	var id string
	if err := row.Scan(&id); err != nil {
		return "", errors.Internal("create_dev_shop_failed", err)
	}

	// Update user's shop_id
	updateQuery := `UPDATE users SET shop_id = $1, updated_at = NOW() WHERE id = $2`
	_, err := r.pool.Exec(ctx, updateQuery, shopID, userID)
	if err != nil {
		logger.Global().Warn("failed to update user shop_id", zap.Error(err))
	}

	return id, nil
}

// Create inserts a new user.
func (r *Repository) Create(ctx context.Context, u *User) (*User, error) {
	query := `
		INSERT INTO users (id, email, name, phone, password, role, shop_id, is_active, tfa_secret, created_at, updated_at)
		VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, '', NOW(), NOW())
		RETURNING id, email, name, phone, password, role, shop_id, is_active,
		          email_verified_at, email_verification_sent_at, last_login, tfa_secret,
		          created_at, updated_at
	`
	row := r.pool.QueryRow(ctx, query, u.Email, u.Name, u.Phone, u.Password, u.Role, u.ShopID, u.IsActive)
	return scanUser(row)
}

// UpdatePassword changes the user's password and updated_at timestamp.
func (r *Repository) UpdatePassword(ctx context.Context, id, hashedPassword string) error {
	_, err := r.pool.Exec(ctx,
		`UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2`,
		hashedPassword, id,
	)
	return err
}

// UpdateAdmin ensures a user is an active admin.
func (r *Repository) UpdateAdmin(ctx context.Context, id, name, hashedPassword string) (*User, error) {
	query := `
		UPDATE users
		SET name = $2, password = $3, role = 'ADMIN', is_active = true, updated_at = NOW()
		WHERE id = $1
		RETURNING id, email, name, phone, password, role, shop_id, is_active,
		          email_verified_at, email_verification_sent_at, last_login, tfa_secret,
		          created_at, updated_at
	`
	row := r.pool.QueryRow(ctx, query, id, name, hashedPassword)
	return scanUser(row)
}

// SetEmailVerified marks a user's email as verified.
func (r *Repository) SetEmailVerified(ctx context.Context, id string) error {
	_, err := r.pool.Exec(ctx,
		`UPDATE users SET email_verified_at = NOW(), updated_at = NOW() WHERE id = $1`,
		id,
	)
	return err
}

// SetEmailVerificationSent updates the sent-at timestamp.
func (r *Repository) SetEmailVerificationSent(ctx context.Context, id string) error {
	_, err := r.pool.Exec(ctx,
		`UPDATE users SET email_verification_sent_at = NOW(), updated_at = NOW() WHERE id = $1`,
		id,
	)
	return err
}

// UpdateLastLogin updates the last login timestamp.
func (r *Repository) UpdateLastLogin(ctx context.Context, id string) error {
	_, err := r.pool.Exec(ctx,
		`UPDATE users SET last_login = NOW(), updated_at = NOW() WHERE id = $1`,
		id,
	)
	return err
}

// Set2FASecret sets the 2FA secret for a user.
func (r *Repository) Set2FASecret(ctx context.Context, userID, secret string) error {
	_, err := r.pool.Exec(ctx,
		`UPDATE users SET tfa_secret = $1, updated_at = NOW() WHERE id = $2`,
		secret, userID,
	)
	return err
}

// Get2FASecret retrieves the 2FA secret for a user.
func (r *Repository) Get2FASecret(ctx context.Context, userID string) (string, error) {
	var secret sql.NullString
	err := r.pool.QueryRow(ctx,
		`SELECT tfa_secret FROM users WHERE id = $1`,
		userID,
	).Scan(&secret)
	if err != nil {
		return "", err
	}
	return secret.String, nil
}

// RecordAuthEvent inserts an authentication audit event.
func (r *Repository) RecordAuthEvent(ctx context.Context, userID, email, action, status string, ip, userAgent string, meta map[string]any) error {
	_, err := r.pool.Exec(ctx,
		`INSERT INTO auth_events (id, user_id, email, action, status, ip, user_agent, metadata, created_at)
		 VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW())`,
		userID, email, action, status, ip, userAgent, meta,
	)
	return err
}

// scanUser maps a pgx row to a User. It returns nil, nil when no rows are found.
func scanUser(row pgx.Row) (*User, error) {
	u := &User{}
	var phone, shopID, tfaSecret sql.NullString
	var verifiedAt, sentAt, lastLogin pgtype.Timestamp
	err := row.Scan(
		&u.ID, &u.Email, &u.Name, &phone, &u.Password, &u.Role, &shopID,
		&u.IsActive, &verifiedAt, &sentAt, &lastLogin, &tfaSecret,
		&u.CreatedAt, &u.UpdatedAt,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, errors.Internal("scan_user_failed", err)
	}
	if phone.Valid {
		u.Phone = &phone.String
	}
	if shopID.Valid {
		u.ShopID = &shopID.String
	}
	if tfaSecret.Valid {
		u.TFASecret = tfaSecret.String
	}
	u.EmailVerifiedAt = timestampPtr(verifiedAt)
	u.EmailVerificationSentAt = timestampPtr(sentAt)
	u.LastLogin = timestampPtr(lastLogin)
	return u, nil
}

func timestampPtr(t pgtype.Timestamp) *time.Time {
	if !t.Valid {
		return nil
	}
	return &t.Time
}
