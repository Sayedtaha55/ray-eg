package sessions

import (
	"fmt"
	"time"

	"github.com/google/uuid"
)

// SessionEvent represents a login/logout event for a user
type SessionEvent struct {
	ID        string    `json:"id" db:"id"`
	UserID    string    `json:"userId" db:"user_id"`
	Email     string    `json:"email" db:"email"`
	Name      string    `json:"name" db:"name"`
	Role      string    `json:"role" db:"role"`
	EventType string    `json:"eventType" db:"event_type"` // "login" or "logout"
	IPAddress string    `json:"ipAddress" db:"ip_address"`
	UserAgent string    `json:"userAgent" db:"user_agent"`
	SessionID string    `json:"sessionId" db:"session_id"`
	LoginAt   time.Time `json:"loginAt" db:"login_at"`
	LogoutAt  *time.Time `json:"logoutAt,omitempty" db:"logout_at"`
	Duration  int64     `json:"duration,omitempty" db:"duration_seconds"` // in seconds
	CreatedAt time.Time `json:"createdAt" db:"created_at"`
}

// NewSessionEvent creates a new session event
func NewSessionEvent(userID, email, name, role, eventType, ip, userAgent string) *SessionEvent {
	return &SessionEvent{
		ID:        uuid.New().String(),
		UserID:    userID,
		Email:     email,
		Name:      name,
		Role:      role,
		EventType: eventType,
		IPAddress: ip,
		UserAgent: userAgent,
		CreatedAt: time.Now().UTC(),
	}
}

// IsLogin returns true if this is a login event
func (e *SessionEvent) IsLogin() bool {
	return e.EventType == "login"
}

// IsLogout returns true if this is a logout event
func (e *SessionEvent) IsLogout() bool {
	return e.EventType == "logout"
}

// SetLogout updates the event as a logout with duration
func (e *SessionEvent) SetLogout(loginTime time.Time) {
	now := time.Now().UTC()
	e.LogoutAt = &now
	e.Duration = int64(now.Sub(loginTime).Seconds())
}

// DurationFormatted returns human-readable duration
func (e *SessionEvent) DurationFormatted() string {
	if e.Duration == 0 {
		return "—"
	}
	minutes := e.Duration / 60
	seconds := e.Duration % 60
	if minutes > 0 {
		return fmt.Sprintf("%d دقيقة %d ثانية", minutes, seconds)
	}
	return fmt.Sprintf("%d ثانية", seconds)
}
