package users

import (
	"context"
	"regexp"
	"strings"

	"github.com/Sayedtaha55/ray-eg/gobackend/internal/domains/auth"
	"github.com/Sayedtaha55/ray-eg/gobackend/internal/platform/errors"
	"github.com/Sayedtaha55/ray-eg/gobackend/internal/platform/password"
	"golang.org/x/crypto/bcrypt"
)

// Service implements the Users domain business logic.
type Service struct {
	repo *Repository
}

// NewService creates a new users service.
func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

// UpdateMe updates the authenticated user's profile.
func (s *Service) UpdateMe(ctx context.Context, userID string, req UpdateMeRequest) (*UserProfile, error) {
	userID = strings.TrimSpace(userID)
	if userID == "" {
		return nil, errors.Unauthorized("unauthenticated", "غير مصرح")
	}

	var name, phone string
	name = "__UNSET__"
	phone = "__UNSET__"

	if req.Name != "" {
		name = strings.TrimSpace(req.Name)
		if name == "" {
			return nil, errors.Validation("name_required", "الاسم مطلوب")
		}
		if len(name) > 80 {
			return nil, errors.Validation("name_too_long", "الاسم طويل جداً")
		}
	}
	if req.Phone != nil {
		phone = normalizePhone(*req.Phone)
		if phone != "" {
			if err := validatePhone(phone); err != nil {
				return nil, err
			}
			existing, err := s.repo.FindByPhone(ctx, phone)
			if err != nil {
				return nil, err
			}
			if existing != nil && existing.ID != userID {
				return nil, errors.Conflict("phone_exists", "رقم الهاتف مستخدم بالفعل في نظامنا")
			}
		}
	}

	if name == "__UNSET__" && phone == "__UNSET__" {
		return nil, errors.Validation("no_update_data", "لا توجد بيانات للتحديث")
	}

	updated, err := s.repo.UpdateMe(ctx, userID, name, phone)
	if err != nil {
		return nil, err
	}
	if updated == nil {
		return nil, errors.NotFound("user", userID)
	}
	return toProfile(updated), nil
}

// ListCouriers lists courier users with pagination and optional search.
func (s *Service) ListCouriers(ctx context.Context, req CourierListRequest) ([]UserProfile, error) {
	take, skip := normalizePaging(req.Take, req.Skip)
	var active *bool
	if raw := strings.TrimSpace(req.IsActive); raw != "" {
		b := strings.EqualFold(raw, "true")
		active = &b
	}
	users, err := s.repo.ListCouriers(ctx, take, skip, strings.TrimSpace(req.Search), active)
	if err != nil {
		return nil, err
	}
	return toProfiles(users), nil
}

// CreateCourier creates a new courier account.
func (s *Service) CreateCourier(ctx context.Context, req CreateCourierRequest) (*UserProfile, error) {
	email := normalizeEmail(req.Email)
	if email == "" {
		return nil, errors.Validation("email_required", "البريد الإلكتروني مطلوب")
	}
	if err := password.Validate(req.Password); err != nil {
		return nil, err
	}
	name := strings.TrimSpace(req.Name)
	if name == "" {
		return nil, errors.Validation("name_required", "الاسم مطلوب")
	}
	if len(name) > 80 {
		return nil, errors.Validation("name_too_long", "الاسم طويل جداً")
	}

	existing, err := s.repo.FindByEmail(ctx, email)
	if err != nil {
		return nil, err
	}
	if existing != nil {
		return nil, errors.Conflict("email_exists", "البريد الإلكتروني مستخدم بالفعل في نظامنا")
	}

	var phone *string
	if req.Phone != nil && strings.TrimSpace(*req.Phone) != "" {
		p := normalizePhone(*req.Phone)
		if err := validatePhone(p); err != nil {
			return nil, err
		}
		existingPhone, err := s.repo.FindByPhone(ctx, p)
		if err != nil {
			return nil, err
		}
		if existingPhone != nil {
			return nil, errors.Conflict("phone_exists", "رقم الهاتف مستخدم بالفعل في نظامنا")
		}
		phone = &p
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, errors.Internal("password_hash_failed", err)
	}

	created, err := s.repo.CreateCourier(ctx, &auth.User{
		Email:    email,
		Name:     name,
		Password: string(hash),
		Phone:    phone,
	})
	if err != nil {
		return nil, err
	}
	return toProfile(created), nil
}

// ListPendingCouriers returns inactive courier users.
func (s *Service) ListPendingCouriers(ctx context.Context, req CourierListRequest) ([]UserProfile, error) {
	take, skip := normalizePaging(req.Take, req.Skip)
	inactive := false
	users, err := s.repo.ListCouriers(ctx, take, skip, strings.TrimSpace(req.Search), &inactive)
	if err != nil {
		return nil, err
	}
	return toProfiles(users), nil
}

// ApproveCourier activates a courier account.
func (s *Service) ApproveCourier(ctx context.Context, id string) (*UserProfile, error) {
	id = strings.TrimSpace(id)
	if id == "" {
		return nil, errors.Validation("id_required", "id مطلوب")
	}
	updated, err := s.repo.SetActive(ctx, id, true)
	if err != nil {
		return nil, err
	}
	if updated == nil {
		return nil, errors.NotFound("courier", id)
	}
	return toProfile(updated), nil
}

// RejectCourier removes a pending (inactive) courier account.
func (s *Service) RejectCourier(ctx context.Context, id string) error {
	id = strings.TrimSpace(id)
	if id == "" {
		return errors.Validation("id_required", "id مطلوب")
	}
	existing, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return err
	}
	if existing == nil {
		return errors.NotFound("courier", id)
	}
	if existing.Role != auth.RoleCourier {
		return errors.Validation("not_courier", "هذا الحساب ليس مندوباً")
	}
	if existing.IsActive {
		return errors.Validation("courier_active", "لا يمكن رفض مندوب مُفعّل")
	}
	return s.repo.Delete(ctx, id)
}

// GetCourierDetails returns courier profile plus state and recent order stats.
func (s *Service) GetCourierDetails(ctx context.Context, id string) (*CourierDetails, error) {
	id = strings.TrimSpace(id)
	if id == "" {
		return nil, errors.Validation("id_required", "id مطلوب")
	}
	courier, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if courier == nil {
		return nil, errors.NotFound("courier", id)
	}
	if courier.Role != auth.RoleCourier {
		return nil, errors.Validation("not_courier", "هذا الحساب ليس مندوباً")
	}

	state, _ := s.repo.CourierState(ctx, id)
	orders, err := s.repo.CourierOrders(ctx, id, 12)
	if err != nil {
		orders = []map[string]any{}
	}

	stats := CourierStats{}
	for _, o := range orders {
		status, _ := o["status"].(string)
		status = strings.ToUpper(status)
		stats.TotalOrders++
		switch status {
		case "PENDING", "CONFIRMED", "PREPARING", "READY":
			stats.ActiveOrders++
		case "DELIVERED":
			stats.DeliveredOrders++
			if total, ok := o["total"].(float64); ok {
				stats.DeliveredRevenue += total
			}
		case "CANCELLED":
			stats.CancelledOrders++
		}
	}

	recent := make([]any, len(orders))
	for i := range orders {
		recent[i] = orders[i]
	}
	return &CourierDetails{
		Courier:      *toProfile(courier),
		State:        state,
		Stats:        stats,
		RecentOrders: recent,
	}, nil
}

// SetCourierActiveStatus toggles a courier account active flag.
func (s *Service) SetCourierActiveStatus(ctx context.Context, id string, isActive bool) (*UserProfile, error) {
	id = strings.TrimSpace(id)
	if id == "" {
		return nil, errors.Validation("id_required", "id مطلوب")
	}
	existing, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if existing == nil {
		return nil, errors.NotFound("courier", id)
	}
	if existing.Role != auth.RoleCourier {
		return nil, errors.Validation("not_courier", "هذا الحساب ليس مندوباً")
	}
	updated, err := s.repo.SetActive(ctx, id, isActive)
	if err != nil {
		return nil, err
	}
	return toProfile(updated), nil
}

func toProfile(u *auth.User) *UserProfile {
	return &UserProfile{
		ID:        u.ID,
		Name:      u.Name,
		Email:     u.Email,
		Phone:     u.Phone,
		Role:      u.Role,
		IsActive:  u.IsActive,
		CreatedAt: u.CreatedAt,
		LastLogin: u.LastLogin,
	}
}

func toProfiles(users []auth.User) []UserProfile {
	out := make([]UserProfile, len(users))
	for i := range users {
		out[i] = *toProfile(&users[i])
	}
	return out
}

func normalizePaging(take, skip int) (int, int) {
	if take <= 0 {
		take = 50
	}
	if take > 200 {
		take = 200
	}
	if skip < 0 {
		skip = 0
	}
	return take, skip
}

func normalizePhone(phone string) string {
	return strings.ReplaceAll(strings.TrimSpace(phone), " ", "")
}

func validatePhone(phone string) error {
	if phone == "" {
		return nil
	}
	if len(phone) > 32 {
		return errors.Validation("phone_invalid", "رقم الهاتف غير صحيح")
	}
	re := regexp.MustCompile(`^\+?[0-9]{6,32}$`)
	if !re.MatchString(phone) {
		return errors.Validation("phone_invalid", "رقم الهاتف غير صحيح")
	}
	return nil
}

func normalizeEmail(email string) string {
	return strings.ToLower(strings.TrimSpace(email))
}
