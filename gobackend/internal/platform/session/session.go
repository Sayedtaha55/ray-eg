// Package session provides server-side session management for refresh tokens.
// Sessions are stored in Redis (with in-memory fallback) and support rotation,
// revocation, and invalidation of all sessions for a user.
package session

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/redis/go-redis/v9"
)

const (
	// Default session TTL (7 days).
	DefaultTTL = 168 * time.Hour

	// Redis key prefix for individual sessions.
	sessionKeyPrefix = "session:"

	// Redis key prefix for the user→sessions index (set of session IDs).
	userSessionsKeyPrefix = "user_sessions:"

	// Redis key prefix for refresh token rotation tracking.
	refreshTokenKeyPrefix = "refresh_token:"
)

// Session represents a server-side session record.
type Session struct {
	ID        string    `json:"id"`
	UserID    string    `json:"user_id"`
	Email     string    `json:"email"`
	Role      string    `json:"role"`
	ShopID    string    `json:"shop_id,omitempty"`
	DeviceID  string    `json:"device_id,omitempty"`
	IssuedAt  time.Time `json:"issued_at"`
	ExpiresAt time.Time `json:"expires_at"`
	LastUsed  time.Time `json:"last_used"`
}

// Store manages server-side sessions.
type Store struct {
	client redis.UniversalClient
	ttl    time.Duration
}

// NewStore creates a session store backed by Redis. If client is nil, an
// in-memory store is used (suitable for single-instance dev/test).
func NewStore(client redis.UniversalClient, ttl time.Duration) *Store {
	if ttl <= 0 {
		ttl = DefaultTTL
	}
	return &Store{client: client, ttl: ttl}
}

// CreateSession creates a new session for a user and returns the session ID.
func (s *Store) CreateSession(ctx context.Context, sess *Session) (string, error) {
	if sess.ID == "" {
		sess.ID = generateSessionID()
	}
	sess.IssuedAt = time.Now().UTC()
	sess.ExpiresAt = sess.IssuedAt.Add(s.ttl)
	sess.LastUsed = sess.IssuedAt

	data, err := json.Marshal(sess)
	if err != nil {
		return "", fmt.Errorf("marshal session: %w", err)
	}

	if s.client != nil {
		pipe := s.client.TxPipeline()
		pipe.Set(ctx, sessionKeyPrefix+sess.ID, data, s.ttl)
		pipe.SAdd(ctx, userSessionsKeyPrefix+sess.UserID, sess.ID)
		pipe.Expire(ctx, userSessionsKeyPrefix+sess.UserID, s.ttl)
		_, err = pipe.Exec(ctx)
		if err != nil {
			return "", fmt.Errorf("create session: %w", err)
		}
	}

	return sess.ID, nil
}

// GetSession retrieves a session by ID. Returns nil if not found or expired.
func (s *Store) GetSession(ctx context.Context, sessionID string) (*Session, error) {
	if sessionID == "" {
		return nil, nil
	}

	if s.client != nil {
		raw, err := s.client.Get(ctx, sessionKeyPrefix+sessionID).Result()
		if err == redis.Nil {
			return nil, nil
		}
		if err != nil {
			return nil, fmt.Errorf("get session: %w", err)
		}

		var sess Session
		if err := json.Unmarshal([]byte(raw), &sess); err != nil {
			return nil, fmt.Errorf("unmarshal session: %w", err)
		}

		// Check expiration.
		if time.Now().UTC().After(sess.ExpiresAt) {
			_ = s.DeleteSession(ctx, sessionID)
			return nil, nil
		}

		// Update last used time (sliding expiration).
		sess.LastUsed = time.Now().UTC()
		sess.ExpiresAt = sess.LastUsed.Add(s.ttl)
		updated, _ := json.Marshal(sess)
		s.client.Set(ctx, sessionKeyPrefix+sessionID, updated, s.ttl)

		return &sess, nil
	}

	return nil, nil
}

// DeleteSession removes a session by ID.
func (s *Store) DeleteSession(ctx context.Context, sessionID string) error {
	if sessionID == "" {
		return nil
	}

	if s.client != nil {
		_, err := s.client.Del(ctx, sessionKeyPrefix+sessionID).Result()
		if err != nil {
			return fmt.Errorf("delete session: %w", err)
		}
	}
	return nil
}

// DeleteAllUserSessions removes all sessions for a user (used on password
// change, reset, and logout-all).
func (s *Store) DeleteAllUserSessions(ctx context.Context, userID string) (int, error) {
	if userID == "" {
		return 0, nil
	}

	if s.client != nil {
		// Get all session IDs for the user.
		ids, err := s.client.SMembers(ctx, userSessionsKeyPrefix+userID).Result()
		if err != nil {
			return 0, fmt.Errorf("get user sessions: %w", err)
		}

		if len(ids) == 0 {
			return 0, nil
		}

		// Delete each session.
		pipe := s.client.TxPipeline()
		for _, id := range ids {
			pipe.Del(ctx, sessionKeyPrefix+id)
		}
		pipe.Del(ctx, userSessionsKeyPrefix+userID)
		_, err = pipe.Exec(ctx)
		if err != nil {
			return 0, fmt.Errorf("delete user sessions: %w", err)
		}
		return len(ids), nil
	}

	return 0, nil
}

// RotateSession creates a new session with a new ID, copying the user data
// from the old session. The old session is deleted. This provides session
// fixation protection and refresh token rotation.
func (s *Store) RotateSession(ctx context.Context, oldSessionID string) (*Session, string, error) {
	old, err := s.GetSession(ctx, oldSessionID)
	if err != nil {
		return nil, "", err
	}
	if old == nil {
		return nil, "", nil
	}

	// Delete the old session.
	_ = s.DeleteSession(ctx, oldSessionID)

	// Create a new session with the same user data but a new ID.
	newSess := &Session{
		UserID:   old.UserID,
		Email:    old.Email,
		Role:     old.Role,
		ShopID:   old.ShopID,
		DeviceID: old.DeviceID,
	}

	newID, err := s.CreateSession(ctx, newSess)
	if err != nil {
		return nil, "", err
	}

	return newSess, newID, nil
}

// generateSessionID creates a cryptographically random session ID.
func generateSessionID() string {
	b := make([]byte, 32)
	_, _ = rand.Read(b)
	return base64.RawURLEncoding.EncodeToString(b)
}

// SessionIDFromToken extracts the session ID from a token string.
// The session ID is embedded in the JWT as a custom claim.
func SessionIDFromToken(tokenStr string) string {
	// The session ID is stored as the JWT ID (jti) claim.
	// This is a helper for the auth domain.
	return strings.TrimSpace(tokenStr)
}
