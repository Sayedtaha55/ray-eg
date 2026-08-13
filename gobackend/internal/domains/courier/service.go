package courier

import (
	"context"
)

// Service handles courier business logic
type Service struct {
	repo *Repository
}

// NewService creates a new courier service
func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

// ListCouriers retrieves all couriers
func (s *Service) ListCouriers(ctx context.Context, limit, offset int) ([]Courier, int64, error) {
	if limit <= 0 {
		limit = 20
	}
	if limit > 100 {
		limit = 100
	}
	if offset < 0 {
		offset = 0
	}

	return s.repo.ListCouriers(ctx, limit, offset)
}

// GetCourierByID retrieves a courier by ID
func (s *Service) GetCourierByID(ctx context.Context, id string) (*Courier, error) {
	return s.repo.GetCourierByID(ctx, id)
}

// UpdateCourierStatus updates the status of a courier
func (s *Service) UpdateCourierStatus(ctx context.Context, id string, status CourierStatus) error {
	return s.repo.UpdateCourierStatus(ctx, id, status)
}
