package sessions

import (
	"context"
	"time"

	"github.com/jmoiron/sqlx"
)

// Repository handles session event persistence
type Repository struct {
	db *sqlx.DB
}

// NewRepository creates a new session repository
func NewRepository(db *sqlx.DB) *Repository {
	return &Repository{db: db}
}

// CreateTable creates the session_events table if it doesn't exist
func (r *Repository) CreateTable(ctx context.Context) error {
	query := `
	CREATE TABLE IF NOT EXISTS session_events (
		id VARCHAR(36) PRIMARY KEY,
		user_id VARCHAR(36) NOT NULL,
		email VARCHAR(255) NOT NULL,
		name VARCHAR(255) NOT NULL DEFAULT '',
		role VARCHAR(50) NOT NULL DEFAULT '',
		event_type VARCHAR(20) NOT NULL,
		ip_address VARCHAR(45) NOT NULL DEFAULT '',
		user_agent TEXT NOT NULL DEFAULT '',
		session_id VARCHAR(255) NOT NULL DEFAULT '',
		login_at TIMESTAMP NOT NULL DEFAULT NOW(),
		logout_at TIMESTAMP NULL,
		duration_seconds BIGINT NOT NULL DEFAULT 0,
		created_at TIMESTAMP NOT NULL DEFAULT NOW(),
		INDEX idx_user_id (user_id),
		INDEX idx_event_type (event_type),
		INDEX idx_created_at (created_at),
		INDEX idx_login_at (login_at)
	)`
	_, err := r.db.ExecContext(ctx, query)
	return err
}

// Insert adds a new session event
func (r *Repository) Insert(ctx context.Context, event *SessionEvent) error {
	query := `
	INSERT INTO session_events (id, user_id, email, name, role, event_type, ip_address, user_agent, session_id, login_at, logout_at, duration_seconds, created_at)
	VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
	_, err := r.db.ExecContext(ctx, query,
		event.ID, event.UserID, event.Email, event.Name, event.Role,
		event.EventType, event.IPAddress, event.UserAgent, event.SessionID,
		event.LoginAt, event.LogoutAt, event.Duration, event.CreatedAt,
	)
	return err
}

// UpdateLogout updates a session event with logout time and duration
func (r *Repository) UpdateLogout(ctx context.Context, sessionID string, logoutAt time.Time, duration int64) error {
	query := `
	UPDATE session_events SET logout_at = ?, duration_seconds = ?, event_type = 'logout'
	WHERE session_id = ? AND event_type = 'login'`
	_, err := r.db.ExecContext(ctx, query, logoutAt, duration, sessionID)
	return err
}

// GetRecent returns recent session events with pagination
func (r *Repository) GetRecent(ctx context.Context, limit, offset int) ([]*SessionEvent, error) {
	query := `
	SELECT id, user_id, email, name, role, event_type, ip_address, user_agent, session_id, login_at, logout_at, duration_seconds, created_at
	FROM session_events
	ORDER BY created_at DESC
	LIMIT ? OFFSET ?`
	events := []*SessionEvent{}
	err := r.db.SelectContext(ctx, &events, query, limit, offset)
	return events, err
}

// GetRecentByUser returns recent session events for a specific user
func (r *Repository) GetRecentByUser(ctx context.Context, userID string, limit int) ([]*SessionEvent, error) {
	query := `
	SELECT id, user_id, email, name, role, event_type, ip_address, user_agent, session_id, login_at, logout_at, duration_seconds, created_at
	FROM session_events
	WHERE user_id = ?
	ORDER BY created_at DESC
	LIMIT ?`
	events := []*SessionEvent{}
	err := r.db.SelectContext(ctx, &events, query, userID, limit)
	return events, err
}

// GetTodayCount returns the count of events today
func (r *Repository) GetTodayCount(ctx context.Context, eventType string) (int, error) {
	query := `
	SELECT COUNT(*) FROM session_events
	WHERE event_type = ? AND DATE(created_at) = CURDATE()`
	var count int
	err := r.db.GetContext(ctx, &count, query, eventType)
	return count, err
}

// GetAverageDuration returns the average session duration in seconds
func (r *Repository) GetAverageDuration(ctx context.Context, days int) (float64, error) {
	query := `
	SELECT COALESCE(AVG(duration_seconds), 0) FROM session_events
	WHERE event_type = 'logout' AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)`
	var avg float64
	err := r.db.GetContext(ctx, &avg, query, days)
	return avg, err
}

// GetActiveUsers returns users currently logged in (login without logout)
func (r *Repository) GetActiveUsers(ctx context.Context) ([]*SessionEvent, error) {
	query := `
	SELECT id, user_id, email, name, role, event_type, ip_address, user_agent, session_id, login_at, logout_at, duration_seconds, created_at
	FROM session_events
	WHERE event_type = 'login' AND session_id NOT IN (
		SELECT session_id FROM session_events WHERE event_type = 'logout' AND session_id != ''
	)
	ORDER BY login_at DESC`
	events := []*SessionEvent{}
	err := r.db.SelectContext(ctx, &events, query)
	return events, err
}
