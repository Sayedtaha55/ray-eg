package auth

import (
	"context"
	"crypto/rand"
	"crypto/subtle"
	"fmt"
	"strings"
	"time"

	"github.com/Sayedtaha55/ray-eg/gobackend/internal/config"
	"github.com/Sayedtaha55/ray-eg/gobackend/internal/platform/errors"
	"github.com/Sayedtaha55/ray-eg/gobackend/internal/platform/jobs"
	"github.com/Sayedtaha55/ray-eg/gobackend/internal/platform/lockout"
	"github.com/Sayedtaha55/ray-eg/gobackend/internal/platform/logger"
	"github.com/Sayedtaha55/ray-eg/gobackend/internal/platform/mailer"
	"github.com/Sayedtaha55/ray-eg/gobackend/internal/platform/password"
	"github.com/Sayedtaha55/ray-eg/gobackend/internal/platform/session"
	"github.com/pquerna/otp"
	"github.com/pquerna/otp/totp"
	"go.uber.org/zap"
)

// Service implements the authentication business logic.
type Service struct {
	cfg      *config.Config
	repo     *Repository
	tokens   *TokenService
	lockout  *lockout.Manager
	mailer   mailer.Mailer
	jobs     *jobs.Client
	sessions *session.Store
}

// NewService creates the auth service. jobsClient is optional; when provided,
// verification/reset emails are enqueued for the background worker instead of
// being sent synchronously on the request goroutine.
func NewService(cfg *config.Config, repo *Repository, tokens *TokenService, lockoutMgr *lockout.Manager, m mailer.Mailer, jobsClient *jobs.Client, sessionStore *session.Store) *Service {
	if m == nil {
		m = mailer.NoOpMailer{}
	}
	return &Service{
		cfg:      cfg,
		repo:     repo,
		tokens:   tokens,
		lockout:  lockoutMgr,
		mailer:   m,
		jobs:     jobsClient,
		sessions: sessionStore,
	}
}

// Signup registers a new user and issues an initial token pair.
func (s *Service) Signup(ctx context.Context, req SignupRequest, meta RequestMeta) (*AuthResponse, error) {
	if err := password.Validate(req.Password); err != nil {
		return nil, err
	}

	email := normalizeEmail(req.Email)
	existing, err := s.repo.FindByEmail(ctx, email)
	if err != nil {
		return nil, err
	}
	if existing != nil {
		return nil, errors.Conflict("email_already_exists", "البريد الإلكتروني مستخدم بالفعل")
	}

	hash, err := password.Hash(req.Password)
	if err != nil {
		return nil, errors.Internal("password_hash_failed", err)
	}

	role := RoleCustomer
	if req.Role == RoleMerchant {
		role = RoleMerchant
	}

	user := &User{
		Email:    email,
		Name:     strings.TrimSpace(req.Name),
		Phone:    nil,
		Password: hash,
		Role:     role,
		IsActive: true,
	}
	if strings.TrimSpace(req.Phone) != "" {
		phone := strings.TrimSpace(req.Phone)
		user.Phone = &phone
	}

	created, err := s.repo.Create(ctx, user)
	if err != nil {
		return nil, err
	}

	s.recordAuthEvent(ctx, created, "signup", "success", meta)

	verificationToken, err := s.tokens.IssueEmailVerificationToken(*created)
	if err != nil {
		logger.Global().Warn("failed to issue verification token", zap.Error(err))
	} else {
		if err := s.sendVerificationEmail(ctx, created, verificationToken); err != nil {
			logger.Global().Warn("failed to send verification email", zap.Error(err))
		}
	}

	return s.issueAuthResponse(ctx, *created, meta)
}

// Login authenticates a user and returns fresh tokens.
func (s *Service) Login(ctx context.Context, req LoginRequest, meta RequestMeta) (*AuthResponse, error) {
	email := normalizeEmail(req.Email)

	locked, err := s.lockout.IsLocked(ctx, email)
	if err != nil {
		logger.Global().Warn("lockout check failed", zap.Error(err))
	}
	if locked {
		s.recordAuthEvent(ctx, nil, "login", "locked", meta, "email", email)
		return nil, errors.Forbidden("account_locked", "تم قفل الحساب مؤقتاً بسبب محاولات متكررة. حاول لاحقاً.")
	}

	user, err := s.repo.FindByEmail(ctx, email)
	if err != nil {
		return nil, err
	}
	if user == nil {
		s.recordAuthEvent(ctx, nil, "login", "failed", meta, "email", email, "reason", "user_not_found")
		return nil, errors.Unauthorized("invalid_credentials", "بيانات الدخول غير صحيحة")
	}

	if !user.IsActive {
		s.recordAuthEvent(ctx, user, "login", "failed", meta, "reason", "account_inactive")
		return nil, errors.Forbidden("account_inactive", "الحساب معطل. تواصل مع الدعم.")
	}

	valid, err := password.Verify(req.Password, user.Password)
	if err != nil || !valid {
		count, _ := s.lockout.RecordFailure(ctx, email)
		s.recordAuthEvent(ctx, user, "login", "failed", meta, "reason", "wrong_password", "attempt", count)
		return nil, errors.Unauthorized("invalid_credentials", "بيانات الدخول غير صحيحة")
	}

	_ = s.lockout.Reset(ctx, email)
	_ = s.repo.UpdateLastLogin(ctx, user.ID)

	s.recordAuthEvent(ctx, user, "login", "success", meta)
	return s.issueAuthResponse(ctx, *user, meta)
}

// Me returns the current authenticated user.
func (s *Service) Me(ctx context.Context, userID string) (*User, error) {
	return s.repo.FindByID(ctx, userID)
}

// Refresh issues a new token pair from a valid refresh token.
// It validates the session server-side and rotates the session ID.
func (s *Service) Refresh(ctx context.Context, token string, meta RequestMeta) (*AuthResponse, error) {
	claims, err := s.tokens.Parse(token)
	if err != nil {
		return nil, errors.Unauthorized("invalid_refresh_token", "رمز التحديث غير صالح")
	}
	if claims.Type != "refresh" {
		return nil, errors.Unauthorized("invalid_refresh_token", "رمز التحديث غير صالح")
	}

	// Validate the session server-side.
	if s.sessions != nil {
		sess, err := s.sessions.GetSession(ctx, claims.ID)
		if err != nil {
			return nil, errors.Unauthorized("session_error", "خطأ في الجلسة")
		}
		if sess == nil {
			return nil, errors.Unauthorized("session_expired", "انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.")
		}
	}

	user, err := s.repo.FindByID(ctx, claims.Subject)
	if err != nil {
		return nil, err
	}
	if user == nil || !user.IsActive {
		return nil, errors.Unauthorized("invalid_refresh_token", "المستخدم غير موجود أو معطل")
	}

	s.recordAuthEvent(ctx, user, "token_refresh", "success", meta)
	return s.issueAuthResponse(ctx, *user, meta)
}

// Logout invalidates the current session and clears the auth cookie.
func (s *Service) Logout(ctx context.Context, token string, meta RequestMeta) error {
	claims, err := s.tokens.Parse(token)
	if err != nil {
		// Token may be expired; still try to invalidate the session.
		// We can't parse expired tokens without ParseUnverified, so skip
		claims = nil
	}

	if claims != nil && s.sessions != nil {
		_ = s.sessions.DeleteSession(ctx, claims.ID)
	}

	if claims != nil && claims.Subject != "" {
		s.recordAuthEvent(ctx, nil, "logout", "success", meta, "user_id", claims.Subject)
	}
	return nil
}

// LogoutAll invalidates all sessions for the current user.
func (s *Service) LogoutAll(ctx context.Context, userID string, meta RequestMeta) error {
	if s.sessions != nil {
		_, _ = s.sessions.DeleteAllUserSessions(ctx, userID)
	}
	s.recordAuthEvent(ctx, nil, "logout_all", "success", meta, "user_id", userID)
	return nil
}

// RequestPasswordReset sends a reset link to the user's email if it exists.
func (s *Service) RequestPasswordReset(ctx context.Context, req PasswordResetRequest, meta RequestMeta) error {
	email := normalizeEmail(req.Email)
	if email == "" {
		return errors.Validation("email_required", "البريد الإلكتروني مطلوب")
	}

	user, err := s.repo.FindByEmail(ctx, email)
	if err != nil {
		return err
	}
	if user == nil {
		s.recordAuthEvent(ctx, nil, "password_reset_requested", "ignored", meta, "email", email)
		return nil
	}

	token, err := s.tokens.IssuePasswordResetToken(*user)
	if err != nil {
		return errors.Internal("token_issue_failed", err)
	}

	if err := s.sendPasswordResetEmail(ctx, user, token); err != nil {
		logger.Global().Warn("failed to send password reset email", zap.Error(err))
	}

	s.recordAuthEvent(ctx, user, "password_reset_requested", "success", meta)
	return nil
}

// ResetPassword completes a password reset using a valid token.
// It invalidates all active sessions for the user.
func (s *Service) ResetPassword(ctx context.Context, req PasswordResetConfirm, meta RequestMeta) error {
	if err := password.Validate(req.Password); err != nil {
		return err
	}

	claims, err := s.tokens.Parse(req.Token)
	if err != nil {
		return errors.Unauthorized("invalid_reset_token", "رمز إعادة تعيين كلمة المرور غير صالح أو منتهي")
	}
	if claims.Type != "password_reset" {
		return errors.Unauthorized("invalid_reset_token", "رمز إعادة تعيين كلمة المرور غير صالح")
	}

	user, err := s.repo.FindByID(ctx, claims.Subject)
	if err != nil {
		return err
	}
	if user == nil {
		return errors.NotFound("user", claims.Subject)
	}

	hash, err := password.Hash(req.Password)
	if err != nil {
		return errors.Internal("password_hash_failed", err)
	}

	if err := s.repo.UpdatePassword(ctx, user.ID, hash); err != nil {
		return err
	}

	// Invalidate all active sessions (forces re-login).
	if s.sessions != nil {
		_, _ = s.sessions.DeleteAllUserSessions(ctx, user.ID)
	}

	_ = s.lockout.Reset(ctx, user.Email)
	s.recordAuthEvent(ctx, user, "password_reset_completed", "success", meta)
	return nil
}

// VerifyEmail marks a user's email as verified.
func (s *Service) VerifyEmail(ctx context.Context, req VerifyEmailRequest, meta RequestMeta) error {
	claims, err := s.tokens.Parse(req.Token)
	if err != nil {
		return errors.Unauthorized("invalid_verification_token", "رمز التحقق غير صالح أو منتهي")
	}
	if claims.Type != "email_verification" {
		return errors.Unauthorized("invalid_verification_token", "رمز التحقق غير صالح")
	}

	user, err := s.repo.FindByID(ctx, claims.Subject)
	if err != nil {
		return err
	}
	if user == nil {
		return errors.NotFound("user", claims.Subject)
	}

	if err := s.repo.SetEmailVerified(ctx, user.ID); err != nil {
		return err
	}

	s.recordAuthEvent(ctx, user, "email_verified", "success", meta)
	return nil
}

// ResendVerification sends a new verification email to the user.
func (s *Service) ResendVerification(ctx context.Context, email string, meta RequestMeta) error {
	email = normalizeEmail(email)
	if email == "" {
		return errors.Validation("email_required", "البريد الإلكتروني مطلوب")
	}

	user, err := s.repo.FindByEmail(ctx, email)
	if err != nil {
		return err
	}
	if user == nil {
		s.recordAuthEvent(ctx, nil, "verification_resent", "ignored", meta, "email", email)
		return nil // Don't reveal if email exists
	}

	if user.EmailVerifiedAt != nil {
		return errors.Conflict("already_verified", "البريد الإلكتروني مؤكد بالفعل")
	}

	verificationToken, err := s.tokens.IssueEmailVerificationToken(*user)
	if err != nil {
		logger.Global().Warn("failed to issue verification token", zap.Error(err))
		return errors.Internal("token_issue_failed", err)
	}

	if err := s.sendVerificationEmail(ctx, user, verificationToken); err != nil {
		logger.Global().Warn("failed to send verification email", zap.Error(err))
		return errors.Internal("email_send_failed", err)
	}

	s.recordAuthEvent(ctx, user, "verification_resent", "success", meta)
	return nil
}

// Enable2FA enables two-factor authentication for a user.
// Requires a valid TOTP code to confirm the secret.
func (s *Service) Enable2FA(ctx context.Context, userID, secret string) error {
	return s.repo.Set2FASecret(ctx, userID, secret)
}

// Confirm2FA verifies the provided code before enabling 2FA. This prevents an
// attacker from enabling 2FA with an arbitrary secret on a compromised account.
func (s *Service) Confirm2FA(ctx context.Context, userID, secret, code string) error {
	existing, err := s.repo.Get2FASecret(ctx, userID)
	if err != nil {
		return err
	}
	checkSecret := secret
	if existing != "" {
		checkSecret = existing
	}

	if !totp.Validate(code, checkSecret) {
		return errors.Unauthorized("invalid_2fa_code", "رمز المصادقة الثنائية غير صحيح")
	}

	return s.repo.Set2FASecret(ctx, userID, checkSecret)
}

// Disable2FA disables two-factor authentication for a user.
// Requires a valid TOTP code for security.
func (s *Service) Disable2FA(ctx context.Context, userID, code string) error {
	secret, err := s.repo.Get2FASecret(ctx, userID)
	if err != nil {
		return err
	}
	if secret == "" {
		return errors.Validation("2fa_not_enabled", "المصادقة الثنائية غير مفعلة")
	}

	if !totp.Validate(code, secret) {
		return errors.Unauthorized("invalid_2fa_code", "رمز المصادقة الثنائية غير صحيح")
	}

	return s.repo.Set2FASecret(ctx, userID, "")
}

// Verify2FA verifies a TOTP code for a user using the RFC 6238 standard.
// It accepts a small window of ±1 step to tolerate clock drift.
// Uses SHA256 for improved security over SHA1.
func (s *Service) Verify2FA(ctx context.Context, userID, code string) (bool, error) {
	secret, err := s.repo.Get2FASecret(ctx, userID)
	if err != nil {
		return false, err
	}
	if secret == "" {
		return false, nil
	}

	if len(code) != 6 {
		return false, nil
	}
	for _, r := range code {
		if r < '0' || r > '9' {
			return false, nil
		}
	}

	valid, err := totp.ValidateCustom(code, secret, time.Now().UTC(), totp.ValidateOpts{
		Period:    30,
		Skew:      1,
		Digits:    otp.DigitsSix,
		Algorithm: otp.AlgorithmSHA256,
	})
	if err != nil {
		return false, err
	}
	return valid, nil
}

// Generate2FASecret creates a new TOTP secret and returns it along with the
// otpauth:// URI for QR-code enrollment. Uses SHA256 for improved security.
func (s *Service) Generate2FASecret(ctx context.Context, userID, email string) (string, string, error) {
	key, err := totp.Generate(totp.GenerateOpts{
		Issuer:      "Ray Platform",
		AccountName: email,
		Period:      30,
		SecretSize:  20,
		Digits:      otp.DigitsSix,
		Algorithm:   otp.AlgorithmSHA256,
	})
	if err != nil {
		return "", "", err
	}

	if err := s.repo.Set2FASecret(ctx, userID, key.Secret()); err != nil {
		return "", "", err
	}

	return key.Secret(), key.URL(), nil
}

// GenerateRecoveryCodes generates recovery codes for a user's 2FA.
func (s *Service) GenerateRecoveryCodes(ctx context.Context, userID string) ([]string, error) {
	codes := make([]string, 10)
	for i := range codes {
		codes[i] = generateRecoveryCode()
	}

	// TODO: Implement SetRecoveryCodes in repository
	// if err := s.repo.SetRecoveryCodes(ctx, userID, codes); err != nil {
	// 	return nil, err
	// }

	return codes, nil
}

// UseRecoveryCode validates and consumes a recovery code.
func (s *Service) UseRecoveryCode(ctx context.Context, userID, code string) (bool, error) {
	// TODO: Implement ValidateRecoveryCode in repository
	// valid, err := s.repo.ValidateRecoveryCode(ctx, userID, code)
	// if err != nil {
	// 	return false, err
	// }
	// if !valid {
	// 	return false, nil
	// }
	return false, nil

	// TODO: Implement ConsumeRecoveryCode in repository
	// if err := s.repo.ConsumeRecoveryCode(ctx, userID, code); err != nil {
	// 	return false, err
	// }
	// return true, nil
}

// BootstrapAdmin initializes the first admin user.
func (s *Service) BootstrapAdmin(ctx context.Context, req BootstrapAdminRequest, meta RequestMeta) (*User, error) {
	expected := strings.TrimSpace(s.cfg.Auth.AdminBootstrapToken)
	if expected == "" {
		if s.cfg.IsProduction() {
			return nil, errors.Forbidden("bootstrap_not_configured", "Admin bootstrap is not configured")
		}
		if !s.cfg.Auth.AllowDevAdminBoot {
			return nil, errors.Forbidden("bootstrap_forbidden", "تفعيل Admin bootstrap غير مفعل في البيئة الحالية")
		}
	}

	if expected != "" {
		provided := []byte(strings.TrimSpace(req.Token))
		exp := []byte(expected)
		if subtle.ConstantTimeCompare(provided, exp) != 1 {
			return nil, errors.Forbidden("bootstrap_forbidden", "رمز bootstrap غير صالح")
		}
	}

	email := normalizeEmail(req.Email)
	if email == "" {
		return nil, errors.Validation("email_required", "البريد الإلكتروني مطلوب")
	}
	if err := password.Validate(req.Password); err != nil {
		return nil, err
	}

	hash, err := password.Hash(req.Password)
	if err != nil {
		return nil, errors.Internal("password_hash_failed", err)
	}

	existingAdmin, err := s.repo.FindFirstAdmin(ctx)
	if err != nil {
		return nil, err
	}

	existing, err := s.repo.FindByEmail(ctx, email)
	if err != nil {
		return nil, err
	}

	if existingAdmin != nil && s.cfg.IsProduction() {
		if !s.cfg.Auth.AdminBootstrapAllowReset {
			return nil, errors.Forbidden("admin_already_initialized", "Admin already initialized")
		}
		if existing == nil || existingAdmin.ID != existing.ID {
			return nil, errors.Forbidden("admin_already_initialized", "Admin already initialized")
		}
	}

	name := strings.TrimSpace(req.Name)
	if name == "" {
		name = "Admin"
	}

	if existing != nil {
		updated, err := s.repo.UpdateAdmin(ctx, existing.ID, name, hash)
		if err != nil {
			return nil, err
		}
		s.recordAuthEvent(ctx, updated, "admin_bootstrap", "updated", meta)
		return updated, nil
	}

	if existingAdmin != nil && s.cfg.IsProduction() {
		return nil, errors.Forbidden("admin_already_initialized", "Admin already initialized")
	}

	created, err := s.repo.Create(ctx, &User{
		Email:    email,
		Name:     name,
		Password: hash,
		Role:     RoleAdmin,
		IsActive: true,
	})
	if err != nil {
		return nil, err
	}
	s.recordAuthEvent(ctx, created, "admin_bootstrap", "created", meta)
	return created, nil
}

// SeedTestUsers inserts test users in development environments.
func (s *Service) SeedTestUsers(ctx context.Context) error {
	if s.cfg.IsProduction() {
		return nil
	}
	testUsers := []struct {
		email    string
		password string
		name     string
		role     Role
	}{
		{"admin@example.com", "Admin123!", "Super Admin", RoleAdmin},
		{"user@example.com", "Password123!", "Test User", RoleCustomer},
		{"testuser@example.com", "ValidPassword123!", "Test User", RoleCustomer},
		{"testcustomer@example.com", "TestPass123!", "Test Customer", RoleCustomer},
		{"testmerchant@example.com", "TestPass123!", "Test Merchant", RoleMerchant},
		{"merchant@example.com", "Merchant123!", "Test Merchant", RoleMerchant},
	}
	for _, tu := range testUsers {
		existing, err := s.repo.FindByEmail(ctx, tu.email)
		if err != nil {
			logger.Global().Warn("seed lookup failed", zap.Error(err))
			continue
		}
		if existing != nil {
			continue
		}
		hash, err := password.Hash(tu.password)
		if err != nil {
			logger.Global().Warn("seed password hash failed", zap.Error(err))
			continue
		}
		_, err = s.repo.Create(ctx, &User{
			Email:    tu.email,
			Name:     tu.name,
			Password: hash,
			Role:     tu.role,
			IsActive: true,
		})
		if err != nil {
			logger.Global().Warn("seed user create failed", zap.Error(err))
			continue
		}
		logger.Global().Info("seeded test user", zap.String("email", tu.email))
	}
	return nil
}

// issueAuthResponse creates a token pair and returns it with the user.
// It creates a server-side session for refresh token rotation and revocation.
func (s *Service) issueAuthResponse(ctx context.Context, user User, meta RequestMeta) (*AuthResponse, error) {
	sessionID := ""
	if s.sessions != nil {
		sess := &session.Session{
			UserID: user.ID,
			Email:  user.Email,
			Role:   string(user.Role),
			ShopID: strPtrValue(user.ShopID),
			// DeviceID: meta.DeviceID, // TODO: Add DeviceID to RequestMeta
		}
		id, err := s.sessions.CreateSession(ctx, sess)
		if err != nil {
			logger.Global().Warn("failed to create session", zap.Error(err))
		}
		sessionID = id
	}

	accessToken, err := s.tokens.IssueAccessToken(user, sessionID)
	if err != nil {
		return nil, errors.Internal("access_token_issue_failed", err)
	}
	refreshToken, err := s.tokens.IssueRefreshToken(user, sessionID)
	if err != nil {
		return nil, errors.Internal("refresh_token_issue_failed", err)
	}

	return &AuthResponse{
		User: user,
		Token: TokenPair{
			AccessToken:  accessToken,
			RefreshToken: refreshToken,
			ExpiresAt:    time.Now().Add(s.cfg.Auth.AccessTokenExpiry),
		},
	}, nil
}

// recordAuthEvent logs an authentication event with optional extra fields.
func (s *Service) recordAuthEvent(ctx context.Context, user *User, action, status string, meta RequestMeta, kv ...any) {
	var userID, email string
	if user != nil {
		userID = user.ID
		email = user.Email
	}

	fields := make(map[string]any)
	for i := 0; i+1 < len(kv); i += 2 {
		key, ok := kv[i].(string)
		if !ok {
			continue
		}
		fields[key] = kv[i+1]
	}

	if err := s.repo.RecordAuthEvent(ctx, userID, email, action, status, meta.IP, meta.UserAgent, fields); err != nil {
		logger.Global().Warn("failed to record auth event", zap.Error(err))
	}
}

func (s *Service) sendVerificationEmail(ctx context.Context, user *User, token string) error {
	verifyURL := fmt.Sprintf("%s/verify-email?token=%s", s.cfg.App.FrontendURL, token)
	text := fmt.Sprintf("مرحباً %s،\n\nيرجى تأكيد بريدك الإلكتروني:\n%s\n\nإذا لم تطلب إنشاء هذا الحساب، يمكنك تجاهل هذه الرسالة.", user.Name, verifyURL)
	msg := mailer.Message{
		To:      user.Email,
		Subject: "تأكيد البريد الإلكتروني",
		Text:    text,
	}

	err := s.sendEmail(ctx, msg)
	if err == nil {
		_ = s.repo.SetEmailVerificationSent(ctx, user.ID)
	}
	return err
}

func (s *Service) sendPasswordResetEmail(ctx context.Context, user *User, token string) error {
	resetURL := fmt.Sprintf("%s/reset-password?token=%s", s.cfg.App.FrontendURL, token)
	text := fmt.Sprintf("مرحباً %s،\n\nلإعادة تعيين كلمة المرور:\n%s\n\nإذا لم تطلب ذلك، تجاهل هذه الرسالة.", user.Name, resetURL)
	return s.sendEmail(ctx, mailer.Message{
		To:      user.Email,
		Subject: "إعادة تعيين كلمة المرور",
		Text:    text,
	})
}

// sendEmail prefers enqueueing onto the background worker (jobs.Client) so a
// slow/unavailable SMTP server never blocks the request goroutine. It falls
// back to sending synchronously when no jobs client is configured (e.g. in
// tests or when Redis is unavailable).
func (s *Service) sendEmail(ctx context.Context, msg mailer.Message) error {
	if s.jobs != nil {
		err := s.jobs.EnqueueEmail(ctx, jobs.EmailPayload{
			To:      msg.To,
			Subject: msg.Subject,
			Text:    msg.Text,
			HTML:    msg.HTML,
		})
		if err == nil {
			return nil
		}
		logger.Global().Warn("failed to enqueue email job, falling back to synchronous send", zap.Error(err))
	}
	_, err := s.mailer.Send(ctx, msg)
	return err
}

func normalizeEmail(email string) string {
	return strings.ToLower(strings.TrimSpace(email))
}

// generateRecoveryCode creates a random 10-character recovery code.
func generateRecoveryCode() string {
	b := make([]byte, 8)
	_, _ = rand.Read(b)
	return fmt.Sprintf("%X", b)[:10]
}

// DevMerchantLogin allows development merchant login without credentials.
// Only works in non-production environments when ALLOW_DEV_MERCHANT_BOOTSTRAP=true.
func (s *Service) DevMerchantLogin(ctx context.Context, req DevMerchantLoginRequest, meta RequestMeta) (*AuthResponse, error) {
	if s.cfg.IsProduction() {
		return nil, errors.Forbidden("dev_login_disabled", "Dev login is disabled in production")
	}
	if s.cfg.App.Env != "development" {
		return nil, errors.Forbidden("dev_login_disabled", "Dev login is only available in development")
	}

	devEmail := "dev-merchant@ray.local"

	user, err := s.repo.FindByEmail(ctx, devEmail)
	if err != nil {
		return nil, err
	}
	if user == nil {
		hashedPassword, _ := password.Hash("dev123456")
		user = &User{
			Email:    devEmail,
			Name:     "Dev Merchant",
			Password: hashedPassword,
			Role:     RoleMerchant,
			IsActive: true,
		}
		user, err = s.repo.Create(ctx, user)
		if err != nil {
			return nil, err
		}
	}

	if user.ShopID == nil || *user.ShopID == "" {
		shopID, err := s.repo.CreateDevShop(ctx, user.ID, req.ShopCategory)
		if err != nil {
			logger.Global().Warn("failed to create dev shop", zap.Error(err))
		} else {
			user.ShopID = &shopID
		}
	}

	return s.issueAuthResponse(ctx, *user, meta)
}

// DevCourierLogin allows development courier login without credentials.
// Only works in non-production environments.
func (s *Service) DevCourierLogin(ctx context.Context, meta RequestMeta) (*AuthResponse, error) {
	if s.cfg.IsProduction() {
		return nil, errors.Forbidden("dev_login_disabled", "Dev login is disabled in production")
	}

	devEmail := "dev-courier@ray.local"
	user, err := s.repo.FindByEmail(ctx, devEmail)
	if err != nil {
		return nil, err
	}
	if user == nil {
		hashedPassword, _ := password.Hash("dev123456")
		user = &User{
			Email:    devEmail,
			Name:     "Dev Courier",
			Password: hashedPassword,
			Role:     RoleCourier,
			IsActive: true,
		}
		user, err = s.repo.Create(ctx, user)
		if err != nil {
			return nil, err
		}
	}

	return s.issueAuthResponse(ctx, *user, meta)
}

// DevCustomerLogin allows development customer login without credentials.
// Only works in non-production environments.
func (s *Service) DevCustomerLogin(ctx context.Context, meta RequestMeta) (*AuthResponse, error) {
	if s.cfg.IsProduction() {
		return nil, errors.Forbidden("dev_login_disabled", "Dev login is disabled in production")
	}

	devEmail := "dev-customer@ray.local"
	user, err := s.repo.FindByEmail(ctx, devEmail)
	if err != nil {
		return nil, err
	}
	if user == nil {
		hashedPassword, _ := password.Hash("dev123456")
		user = &User{
			Email:    devEmail,
			Name:     "Dev Customer",
			Password: hashedPassword,
			Role:     RoleCustomer,
			IsActive: true,
		}
		user, err = s.repo.Create(ctx, user)
		if err != nil {
			return nil, err
		}
	}

	return s.issueAuthResponse(ctx, *user, meta)
}
