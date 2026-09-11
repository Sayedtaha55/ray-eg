package sessions

import (
	"context"
	"time"

	"github.com/Sayedtaha55/ray-eg/gobackend/internal/platform/logger"
	"go.uber.org/zap"
)

// Service handles session event business logic
type Service struct {
	repo *Repository
}

// NewService creates a new session service
func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

// RecordLogin records a login event
func (s *Service) RecordLogin(ctx context.Context, userID, email, name, role, ip, userAgent string) (*SessionEvent, error) {
	event := NewSessionEvent(userID, email, name, role, "login", ip, userAgent)
	event.LoginAt = time.Now().UTC()
	
	if err := s.repo.Insert(ctx, event); err != nil {
		logger.Global().Warn("Failed to record login event", zap.Error(err))
		return nil, err
	}
	
	logger.Global().Info("Login recorded",
		zap.String("userID", userID),
		zap.String("email", email),
		zap.String("ip", ip),
	)
	
	return event, nil
}

// RecordLogout records a logout event
func (s *Service) RecordLogout(ctx context.Context, userID, sessionID string) error {
	// Find the login event and update it
	logoutAt := time.Now().UTC()
	
	if err := s.repo.UpdateLogout(ctx, sessionID, logoutAt, 0); err != nil {
		logger.Global().Error("Failed to record logout event", zap.Error(err))
		return err
	}
	
	logger.Global().Info("Logout recorded",
		zap.String("userID", userID),
		zap.String("sessionID", sessionID),
	)
	
	return nil
}

// GetRecentEvents returns recent session events
func (s *Service) GetRecentEvents(ctx context.Context, limit, offset int) ([]*SessionEvent, error) {
	return s.repo.GetRecent(ctx, limit, offset)
}

// GetTodayLoginCount returns today's login count
func (s *Service) GetTodayLoginCount(ctx context.Context) (int, error) {
	return s.repo.GetTodayCount(ctx, "login")
}

// GetTodayLogoutCount returns today's logout count
func (s *Service) GetTodayLogoutCount(ctx context.Context) (int, error) {
	return s.repo.GetTodayCount(ctx, "logout")
}

// GetAverageDuration returns average session duration
func (s *Service) GetAverageDuration(ctx context.Context, days int) (float64, error) {
	return s.repo.GetAverageDuration(ctx, days)
}

// GetActiveUsers returns currently active users
func (s *Service) GetActiveUsers(ctx context.Context) ([]*SessionEvent, error) {
	return s.repo.GetActiveUsers(ctx)
}

// EnsureTable creates the session_events table
func (s *Service) EnsureTable(ctx context.Context) error {
	return s.repo.CreateTable(ctx)
}
