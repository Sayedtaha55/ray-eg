package auth

import "time"

// Role mirrors the Prisma UserRole enum.
type Role string

const (
	RoleCustomer Role = "CUSTOMER"
	RoleMerchant Role = "MERCHANT"
	RoleAdmin    Role = "ADMIN"
	RoleCourier  Role = "COURIER"
	RoleCashier  Role = "CASHIER"
)

// User represents a database user row.
type User struct {
	ID                      string     `json:"id"`
	Email                   string     `json:"email"`
	Name                    string     `json:"name"`
	Phone                   *string    `json:"phone,omitempty"`
	Password                string     `json:"-"`
	Role                    Role       `json:"role"`
	ShopID                  *string    `json:"shopId,omitempty"`
	IsActive                bool       `json:"isActive"`
	EmailVerifiedAt         *time.Time `json:"emailVerifiedAt,omitempty"`
	EmailVerificationSentAt *time.Time `json:"emailVerificationSentAt,omitempty"`
	LastLogin               *time.Time `json:"lastLogin,omitempty"`
	TFASecret               string     `json:"-"` // 2FA secret, never exposed
	CreatedAt               time.Time  `json:"createdAt"`
	UpdatedAt               time.Time  `json:"updatedAt"`
}

// SignupRequest represents the customer/merchant registration payload.
type SignupRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
	Name     string `json:"name" validate:"required,min=2,max=100"`
	Phone    string `json:"phone,omitempty" validate:"omitempty,e164"`
	Role     Role   `json:"role,omitempty" validate:"omitempty,oneof=CUSTOMER MERCHANT"`

	// Merchant-specific fields
	ActivityID     string   `json:"activityId,omitempty"`
	Category       string   `json:"category,omitempty"`
	EnabledModules []string `json:"enabledModules,omitempty"`
	Specialties    []string `json:"specialties,omitempty"`
	ModuleConfig   any      `json:"moduleConfig,omitempty"`

	// Shop fields
	ShopName        string `json:"shopName,omitempty"`
	ShopPhone       string `json:"shopPhone,omitempty"`
	ShopEmail       string `json:"shopEmail,omitempty"`
	Governorate     string `json:"governorate,omitempty"`
	City            string `json:"city,omitempty"`
	AddressDetailed string `json:"addressDetailed,omitempty"`
	ShopDescription string `json:"shopDescription,omitempty"`
	OpeningHours    string `json:"openingHours,omitempty"`
}

// LoginRequest represents the login payload.
type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

// TokenPair holds access and refresh tokens.
type TokenPair struct {
	AccessToken  string    `json:"accessToken"`
	RefreshToken string    `json:"refreshToken"`
	ExpiresAt    time.Time `json:"expiresAt"`
}

// AuthResponse is returned on successful login or signup.
type AuthResponse struct {
	User  User      `json:"user"`
	Token TokenPair `json:"token"`
}

// RefreshRequest carries a refresh token.
type RefreshRequest struct {
	RefreshToken string `json:"refreshToken" validate:"required"`
}

// PasswordResetRequest starts a password reset flow.
type PasswordResetRequest struct {
	Email string `json:"email" validate:"required,email"`
}

// PasswordResetConfirm confirms a password reset using a token.
type PasswordResetConfirm struct {
	Token    string `json:"token" validate:"required"`
	Password string `json:"password" validate:"required"`
}

// BootstrapAdminRequest creates the first admin.
type BootstrapAdminRequest struct {
	Token    string `json:"token" validate:"required"`
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=8"`
	Name     string `json:"name" validate:"required,min=2,max=100"`
}

// DevMerchantLoginRequest is for development merchant login.
type DevMerchantLoginRequest struct {
	ShopCategory string `json:"shopCategory,omitempty"`
}

// DevCourierLoginRequest is for development courier login.
type DevCourierLoginRequest struct{}

// DevCustomerLoginRequest is for development customer login.
type DevCustomerLoginRequest struct{}

// VerifyEmailRequest verifies the email address.
type VerifyEmailRequest struct {
	Token string `json:"token" validate:"required"`
}

// RequestMeta captures request context for audit logging.
type RequestMeta struct {
	IP        string
	UserAgent string
}
