package mapdomain

import "context"

// Service handles map business logic
type Service struct {
	repo *Repository
}

// NewService creates a new map service
func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

// GetPins retrieves map pins
func (s *Service) GetPins(ctx context.Context, lat, lng *float64, radiusKm *float64) ([]MapPin, error) {
	return s.repo.GetPins(ctx, lat, lng, radiusKm)
}
