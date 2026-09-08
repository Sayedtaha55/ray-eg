package audit

import (
	"context"
)

// Service provides audit logging business logic.
type Service struct {
	repo *Repository
}

// NewService creates a new audit service.
func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

// RecordLogin records a user login event and returns the audit ID.
func (s *Service) RecordLogin(ctx context.Context, userID, email, role, ip, userAgent, token string) (string, error) {
	return s.repo.InsertLoginEvent(ctx, userID, email, role, ip, userAgent, token)
}

// RecordLogout records the logout time and calculates session duration.
func (s *Service) RecordLogout(ctx context.Context, token string) error {
	return s.repo.UpdateLogoutEvent(ctx, token)
}

// GetRecentEvents returns recent login events.
func (s *Service) GetRecentEvents(ctx context.Context, limit int) ([]LoginAudit, error) {
	return s.repo.GetRecentLoginEvents(ctx, limit)
}

// GetUserSessions returns sessions for a specific user.
func (s *Service) GetUserSessions(ctx context.Context, userID string, limit int) ([]LoginAudit, error) {
	return s.repo.GetUserSessions(ctx, userID, limit)
}

// GetActiveSessionsCount returns the number of currently active sessions.
func (s *Service) GetActiveSessionsCount(ctx context.Context) (int, error) {
	return s.repo.GetActiveSessionsCount(ctx)
}

// GetStats returns aggregate statistics.
func (s *Service) GetStats(ctx context.Context) (map[string]interface{}, error) {
	return s.repo.GetStats(ctx)
}
