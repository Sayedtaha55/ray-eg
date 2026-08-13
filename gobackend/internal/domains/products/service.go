package products

import (
	"context"
	"regexp"
	"strings"

	"github.com/Sayedtaha55/ray-eg/gobackend/internal/platform/compression"
	"github.com/Sayedtaha55/ray-eg/gobackend/internal/platform/errors"
)

// Service implements the Products domain business logic.
type Service struct {
	repo        *Repository
	compression *compression.Service
}

// NewService creates a new products service.
func NewService(repo *Repository, compressionSvc *compression.Service) *Service {
	return &Service{repo: repo, compression: compressionSvc}
}

// GetByID returns a public product by ID.
func (s *Service) GetByID(ctx context.Context, id string) (*Product, error) {
	if id == "" {
		return nil, errors.Validation("id_required", "id مطلوب")
	}
	p, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if p == nil || !p.IsActive {
		return nil, errors.NotFound("product", id)
	}
	if isHiddenCategory(p.Category) {
		return nil, errors.NotFound("product", id)
	}
	return p, nil
}

// ListByShop lists active products for a public shop.
func (s *Service) ListByShop(ctx context.Context, req ProductListRequest) ([]Product, error) {
	shopID := strings.TrimSpace(req.ShopID)
	if shopID == "" {
		return nil, errors.Validation("shopId_required", "shopId مطلوب")
	}
	limit, offset := normalizePaging(req.Page, req.Limit)
	products, err := s.repo.ListByShop(ctx, shopID, limit, offset)
	if err != nil {
		return nil, err
	}
	return filterHidden(products), nil
}

// ListAllActive lists all active public products.
func (s *Service) ListAllActive(ctx context.Context, req ProductListRequest) ([]Product, error) {
	limit, offset := normalizePaging(req.Page, req.Limit)
	products, err := s.repo.ListAllActive(ctx, limit, offset)
	if err != nil {
		return nil, err
	}
	return filterHidden(products), nil
}

// ListByShopForManage lists products for a merchant/admin dashboard.
func (s *Service) ListByShopForManage(ctx context.Context, shopID string, actorShopID, actorRole string, req ManageProductListRequest) ([]Product, error) {
	shopID = strings.TrimSpace(shopID)
	if shopID == "" {
		return nil, errors.Validation("shopId_required", "shopId مطلوب")
	}
	if !isAdmin(actorRole) && actorShopID != shopID {
		return nil, errors.Forbidden("insufficient_role", "صلاحيات غير كافية")
	}
	limit, offset := normalizePaging(req.Page, req.Limit)
	return s.repo.ListByShopForManage(ctx, shopID, limit, offset, req.IncludeImageMap)
}

// Create creates a product for the authenticated merchant's shop.
func (s *Service) Create(ctx context.Context, req CreateProductRequest, shopID, actorShopID, actorRole string) (*Product, error) {
	if !isAdmin(actorRole) && actorShopID != shopID {
		return nil, errors.Forbidden("insufficient_role", "ليس لديك صلاحية لإضافة منتجات لهذا المتجر")
	}
	if shopID == "" {
		return nil, errors.Validation("shopId_required", "shopId مطلوب")
	}

	exists, err := s.repo.ShopExists(ctx, shopID)
	if err != nil {
		return nil, err
	}
	if !exists {
		return nil, errors.NotFound("shop", shopID)
	}

	name := strings.TrimSpace(req.Name)
	if name == "" {
		return nil, errors.Validation("name_required", "اسم المنتج مطلوب")
	}

	category := strings.TrimSpace(req.Category)
	if category == "" {
		category = "عام"
	}

	shopCategory, err := s.repo.GetShopCategory(ctx, shopID)
	if err != nil {
		return nil, err
	}
	trackStock := req.TrackStock == nil || *req.TrackStock
	if strings.EqualFold(shopCategory, "RESTAURANT") {
		trackStock = false
	}

	p := &Product{
		Name:          name,
		Description:   req.Description,
		Price:         req.Price,
		Stock:         req.Stock,
		Category:      category,
		Unit:          req.Unit,
		ImageURL:      req.ImageURL,
		TrackStock:    trackStock,
		IsActive:      true,
		ShopID:        shopID,
		Images:        req.Images,
		Colors:        req.Colors,
		Sizes:         req.Sizes,
		Addons:        req.Addons,
		MenuVariants:  req.MenuVariants,
		PackOptions:   req.PackOptions,
		Model3DURL:    req.Model3DURL,
		SpinImages:    req.SpinImages,
		FurnitureMeta: req.FurnitureMeta,
	}

	return s.repo.Create(ctx, p)
}

// Update updates a product for the authenticated merchant's shop.
func (s *Service) Update(ctx context.Context, id string, req UpdateProductRequest, actorShopID, actorRole string) (*Product, error) {
	if id == "" {
		return nil, errors.Validation("id_required", "id مطلوب")
	}
	existing, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if existing == nil {
		return nil, errors.NotFound("product", id)
	}
	if !isAdmin(actorRole) && actorShopID != existing.ShopID {
		return nil, errors.Forbidden("insufficient_role", "صلاحيات غير كافية")
	}

	fields := make(map[string]any)
	if req.Name != nil {
		name := strings.TrimSpace(*req.Name)
		if name == "" {
			return nil, errors.Validation("name_required", "اسم المنتج مطلوب")
		}
		fields["name"] = name
	}
	if req.Price != nil {
		if *req.Price < 0 {
			return nil, errors.Validation("price_invalid", "السعر غير صالح")
		}
		fields["price"] = *req.Price
	}
	if req.Stock != nil {
		if *req.Stock < 0 {
			return nil, errors.Validation("stock_invalid", "المخزون غير صالح")
		}
		fields["stock"] = *req.Stock
	}
	if req.Category != nil {
		fields["category"] = strings.TrimSpace(*req.Category)
	}
	if req.Unit != nil {
		fields["unit"] = nullIfEmpty(*req.Unit)
	}
	if req.ImageURL != nil {
		if err := assertImageOnly(*req.ImageURL); err != nil {
			return nil, err
		}
		fields["image_url"] = nullIfEmpty(*req.ImageURL)
	}
	if req.Description != nil {
		fields["description"] = nullIfEmpty(*req.Description)
	}
	if req.TrackStock != nil {
		fields["track_stock"] = *req.TrackStock
	}
	if req.Images != nil {
		for _, img := range req.Images {
			if url, ok := img.(string); ok {
				if err := assertImageOnly(url); err != nil {
					return nil, err
				}
			}
		}
		fields["images"] = req.Images
	}
	if req.Colors != nil {
		fields["colors"] = req.Colors
	}
	if req.Sizes != nil {
		fields["sizes"] = req.Sizes
	}
	if req.Addons != nil {
		fields["addons"] = req.Addons
	}
	if req.MenuVariants != nil {
		fields["menu_variants"] = req.MenuVariants
	}
	if req.PackOptions != nil {
		fields["pack_options"] = req.PackOptions
	}
	if req.Model3DURL != nil {
		fields["model_3d_url"] = nullIfEmpty(*req.Model3DURL)
	}
	if req.SpinImages != nil {
		fields["spin_images"] = req.SpinImages
	}
	if req.IsActive != nil {
		fields["is_active"] = *req.IsActive
	}

	var furnitureMeta *FurnitureMeta
	if req.FurnitureMeta != nil {
		if err := validateFurnitureMeta(req.FurnitureMeta); err != nil {
			return nil, err
		}
		furnitureMeta = req.FurnitureMeta
	}

	return s.repo.Update(ctx, id, fields, furnitureMeta)
}

// Delete removes a product.
func (s *Service) Delete(ctx context.Context, id, actorShopID, actorRole string) error {
	if id == "" {
		return errors.Validation("id_required", "id مطلوب")
	}
	existing, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return err
	}
	if existing == nil {
		return errors.NotFound("product", id)
	}
	if !isAdmin(actorRole) && actorShopID != existing.ShopID {
		return errors.Forbidden("insufficient_role", "صلاحيات غير كافية")
	}
	return s.repo.Delete(ctx, id)
}

func normalizePaging(page, limit int) (int, int) {
	if limit <= 0 {
		limit = 20
	}
	if limit > 200 {
		limit = 200
	}
	if page < 1 {
		page = 1
	}
	offset := (page - 1) * limit
	return limit, offset
}

func isAdmin(role string) bool {
	return strings.EqualFold(role, "ADMIN")
}

func isHiddenCategory(category string) bool {
	c := strings.ToUpper(strings.TrimSpace(category))
	return c == "__IMAGE_MAP__" || c == "__DUPLICATE__AUTO__" || strings.Contains(c, "IMAGE_MAP")
}

func filterHidden(products []Product) []Product {
	out := products[:0]
	for _, p := range products {
		if !isHiddenCategory(p.Category) {
			out = append(out, p)
		}
	}
	return out
}

func nullIfEmpty(s string) any {
	if s == "" {
		return nil
	}
	return s
}

func assertImageOnly(url string) error {
	lower := strings.ToLower(strings.TrimSpace(url))
	if lower == "" {
		return nil
	}
	// Strip query/hash for extension check.
	noQuery := strings.SplitN(strings.SplitN(lower, "?", 2)[0], "#", 2)[0]
	re := regexp.MustCompile(`\.(mp4|webm|mov|m4v|avi|mkv)$`)
	if re.MatchString(noQuery) {
		return errors.Validation("video_not_allowed", "المنتجات لا تدعم الفيديو. يرجى رفع صور فقط")
	}
	return nil
}

func validateFurnitureMeta(fm *FurnitureMeta) error {
	if fm.LengthCm != nil && *fm.LengthCm <= 0 {
		return errors.Validation("invalid_length", "طول الأثاث غير صالح")
	}
	if fm.WidthCm != nil && *fm.WidthCm <= 0 {
		return errors.Validation("invalid_width", "عرض الأثاث غير صالح")
	}
	if fm.HeightCm != nil && *fm.HeightCm <= 0 {
		return errors.Validation("invalid_height", "ارتفاع الأثاث غير صالح")
	}
	return nil
}
