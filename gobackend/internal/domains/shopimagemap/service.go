package shopimagemap

import (
	"context"
	"encoding/json"
	"strings"

	"github.com/Sayedtaha55/ray-eg/gobackend/internal/platform/compression"
	"github.com/Sayedtaha55/ray-eg/gobackend/internal/platform/errors"
)

// Service implements the ShopImageMap domain business logic.
type Service struct {
	repo        *Repository
	compression *compression.Service
}

// NewService creates a new shop image map service.
func NewService(repo *Repository, compressionSvc *compression.Service) *Service {
	return &Service{repo: repo, compression: compressionSvc}
}

// GetActiveForCustomer returns the active image map for a shop by slug.
func (s *Service) GetActiveForCustomer(ctx context.Context, slug string) (*ImageMapResponse, error) {
	if strings.TrimSpace(slug) == "" {
		return nil, errors.Validation("slug_required", "slug مطلوب")
	}
	m, err := s.repo.GetActiveForCustomerBySlug(ctx, slug)
	if err != nil {
		return nil, err
	}
	if m == nil {
		return nil, errors.NotFound("image_map", slug)
	}
	return s.shapeMapWithRelations(ctx, *m), nil
}

// ListForManage returns all image maps for a shop.
func (s *Service) ListForManage(ctx context.Context, shopID, actorRole, actorShopID string) ([]ImageMapResponse, error) {
	if !isAdmin(actorRole) && actorShopID != shopID {
		return nil, errors.Forbidden("insufficient_role", "صلاحيات غير كافية")
	}
	maps, err := s.repo.ListByShop(ctx, shopID)
	if err != nil {
		return nil, err
	}
	out := make([]ImageMapResponse, len(maps))
	for i, m := range maps {
		out[i] = *s.shapeMapWithRelations(ctx, m)
	}
	return out, nil
}

// Create creates a new image map.
func (s *Service) Create(ctx context.Context, shopID string, req CreateMapRequest, actorRole, actorShopID string) (*ImageMapResponse, error) {
	if !isAdmin(actorRole) && actorShopID != shopID {
		return nil, errors.Forbidden("insufficient_role", "صلاحيات غير كافية")
	}
	name := strings.TrimSpace(req.Name)
	if name == "" {
		name = "Main Map"
	}

	m := &ImageMap{
		ShopID:   shopID,
		Name:     name,
		IsActive: false,
	}
	if req.ImageURL != "" {
		m.ImageURL = &req.ImageURL
	}
	if req.Layout != nil {
		layoutBytes, _ := json.Marshal(req.Layout)
		m.Layout = layoutBytes
	} else {
		m.Layout = []byte("{}")
	}

	created, err := s.repo.Create(ctx, m)
	if err != nil {
		return nil, err
	}
	resp := s.shapeMap(*created)
	return &resp, nil
}

// Activate activates an image map.
func (s *Service) Activate(ctx context.Context, shopID, mapID, actorRole, actorShopID string) error {
	if !isAdmin(actorRole) && actorShopID != shopID {
		return errors.Forbidden("insufficient_role", "صلاحيات غير كافية")
	}
	existing, err := s.repo.FindByID(ctx, mapID)
	if err != nil {
		return err
	}
	if existing == nil {
		return errors.NotFound("image_map", mapID)
	}
	if existing.ShopID != shopID {
		return errors.Forbidden("insufficient_role", "صلاحيات غير كافية")
	}
	return s.repo.Activate(ctx, shopID, mapID)
}

// SaveLayout saves the layout for an image map.
func (s *Service) SaveLayout(ctx context.Context, shopID, mapID string, req SaveLayoutRequest, actorRole, actorShopID string) (*ImageMapResponse, error) {
	if !isAdmin(actorRole) && actorShopID != shopID {
		return nil, errors.Forbidden("insufficient_role", "صلاحيات غير كافية")
	}
	existing, err := s.repo.FindByID(ctx, mapID)
	if err != nil {
		return nil, err
	}
	if existing == nil {
		return nil, errors.NotFound("image_map", mapID)
	}
	if existing.ShopID != shopID {
		return nil, errors.Forbidden("insufficient_role", "صلاحيات غير كافية")
	}

	var imageURLPtr *string
	if req.ImageURL != "" {
		url := req.ImageURL
		// Compress the image URL for map use
		if s.compression != nil {
			url = s.compression.GetCompressedURL(req.ImageURL, compression.QualityHigh)
		}
		imageURLPtr = &url
	}

	layoutBytes, _ := json.Marshal(req.Layout)
	if err := s.repo.SaveLayout(ctx, mapID, imageURLPtr, layoutBytes); err != nil {
		return nil, err
	}

	updated, err := s.repo.FindByID(ctx, mapID)
	if err != nil {
		return nil, err
	}
	if updated == nil {
		return nil, errors.NotFound("image_map", mapID)
	}
	resp := s.shapeMap(*updated)
	return &resp, nil
}

// Analyze performs AI analysis on an image (placeholder — returns empty result).
func (s *Service) Analyze(ctx context.Context, shopID string, req AnalyzeRequest, actorRole, actorShopID string) (*AnalyzeResponse, error) {
	if !isAdmin(actorRole) && actorShopID != shopID {
		return nil, errors.Forbidden("insufficient_role", "صلاحيات غير كافية")
	}
	if strings.TrimSpace(req.ImageURL) == "" {
		return nil, errors.Validation("imageUrl_required", "imageUrl مطلوب")
	}
	return &AnalyzeResponse{
		ImageURL: req.ImageURL,
		Sections: []map[string]any{},
		Hotspots: []map[string]any{},
	}, nil
}

func (s *Service) shapeMapWithRelations(ctx context.Context, m ImageMap) *ImageMapResponse {
	resp := s.shapeMap(m)
	sections, _ := s.repo.ListSections(ctx, m.ID)
	if sections != nil {
		resp.Sections = sections
	}
	hotspots, _ := s.repo.ListHotspots(ctx, m.ID)
	if hotspots != nil {
		resp.Hotspots = hotspots
	}
	return &resp
}

func (s *Service) shapeMap(m ImageMap) ImageMapResponse {
	resp := ImageMapResponse{
		ID:        m.ID,
		ShopID:    m.ShopID,
		Name:      m.Name,
		IsActive:  m.IsActive,
		Layout:    map[string]any{},
		CreatedAt: m.CreatedAt,
		UpdatedAt: m.UpdatedAt,
	}
	if m.ImageURL != nil {
		resp.ImageURL = *m.ImageURL
	}
	if len(m.Layout) > 0 {
		json.Unmarshal(m.Layout, &resp.Layout)
	}
	return resp
}

func isAdmin(role string) bool {
	return strings.EqualFold(role, "ADMIN")
}
