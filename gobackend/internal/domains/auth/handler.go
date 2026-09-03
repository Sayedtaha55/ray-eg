package auth

import (
	"strings"
	"time"

	"github.com/Sayedtaha55/ray-eg/gobackend/internal/config"
	"github.com/Sayedtaha55/ray-eg/gobackend/internal/platform/errors"
	"github.com/Sayedtaha55/ray-eg/gobackend/internal/platform/middleware"
	"github.com/Sayedtaha55/ray-eg/gobackend/internal/platform/validate"
	"github.com/gofiber/fiber/v2"
)

// Handler exposes authentication HTTP endpoints.
type Handler struct {
	service *Service
	cfg     AuthCookieConfig
	appCfg  *config.Config
}

// AuthCookieConfig holds cookie settings for the auth handlers.
type AuthCookieConfig struct {
	Name     string
	Domain   string
	MaxAge   time.Duration
	Secure   bool
	SameSite string
}

// NewHandler creates a handler for auth routes.
func NewHandler(service *Service, cookieCfg AuthCookieConfig, appCfg *config.Config) *Handler {
	return &Handler{service: service, cfg: cookieCfg, appCfg: appCfg}
}

// RegisterRoutes wires the auth endpoints under the provided router.
func (h *Handler) RegisterRoutes(r fiber.Router) {
	g := r.Group("/auth")
	g.Post("/signup", h.Signup)
	g.Post("/login", h.Login)
	g.Post("/logout", h.Logout)
	g.Post("/refresh", h.Refresh)
	g.Post("/password/forgot", h.RequestPasswordReset)
	g.Post("/password/reset", h.ResetPassword)
	g.Post("/verify-email", h.VerifyEmail)
	g.Post("/resend-verification", h.ResendVerification)
	g.Post("/bootstrap-admin", h.BootstrapAdmin)

	// Dev login endpoints (only in non-production AND when explicitly enabled)
	if !h.appCfg.IsProduction() {
		if h.appCfg.Auth.AllowDevMerchantBoot {
			g.Post("/dev-merchant-login", h.DevMerchantLogin)
		}
		if h.appCfg.Auth.AllowDevCourierBoot {
			g.Post("/dev-courier-login", h.DevCourierLogin)
		}
		if h.appCfg.Auth.AllowDevCustomerBoot {
			g.Post("/dev-customer-login", h.DevCustomerLogin)
		}
	}

	g.Post("/2fa/generate", middleware.RequireAuth(h.appCfg), h.Generate2FA)
	g.Post("/2fa/enable", middleware.RequireAuth(h.appCfg), h.Enable2FA)
	g.Post("/2fa/disable", middleware.RequireAuth(h.appCfg), h.Disable2FA)
	g.Post("/2fa/verify", middleware.RequireAuth(h.appCfg), h.Verify2FA)
	g.Get("/me", middleware.RequireAuth(h.appCfg), h.Me)
}

func (h *Handler) Logout(c *fiber.Ctx) error {
	token := ""
	if authHeader := c.Get("Authorization"); strings.HasPrefix(authHeader, "Bearer ") {
		token = strings.TrimSpace(strings.TrimPrefix(authHeader, "Bearer "))
	}
	if token == "" {
		token = extractRefreshToken(c)
	}
	if token != "" && h.service != nil {
		if err := h.service.Logout(c.UserContext(), token, extractMeta(c)); err != nil {
			return err
		}
	}

	h.clearAuthCookie(c)
	return c.JSON(fiber.Map{"success": true, "message": "تم تسجيل الخروج بنجاح"})
}

func (h *Handler) Signup(c *fiber.Ctx) error {
	var req SignupRequest
	if err := c.BodyParser(&req); err != nil {
		return errors.Validation("invalid_body", "تعذر قراءة بيانات الطلب")
	}
	if err := validate.Struct(req); err != nil {
		return err
	}

	resp, err := h.service.Signup(c.UserContext(), req, extractMeta(c))
	if err != nil {
		return err
	}
	h.setAuthCookie(c, resp.Token.RefreshToken)
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"success": true, "data": resp})
}

func (h *Handler) Login(c *fiber.Ctx) error {
	var req LoginRequest
	if err := c.BodyParser(&req); err != nil {
		return errors.Validation("invalid_body", "تعذر قراءة بيانات الطلب")
	}
	if err := validate.Struct(req); err != nil {
		return err
	}

	resp, err := h.service.Login(c.UserContext(), req, extractMeta(c))
	if err != nil {
		return err
	}
	h.setAuthCookie(c, resp.Token.RefreshToken)
	return c.JSON(fiber.Map{"success": true, "data": resp})
}

func (h *Handler) Me(c *fiber.Ctx) error {
	user, ok := middleware.AuthUserFromContext(c)
	if !ok {
		return errors.Unauthorized("unauthenticated", "يجب تسجيل الدخول")
	}

	u, err := h.service.Me(c.UserContext(), user.ID)
	if err != nil {
		return err
	}
	if u == nil {
		return errors.NotFound("user", user.ID)
	}
	return c.JSON(fiber.Map{"success": true, "data": u})
}

func (h *Handler) Refresh(c *fiber.Ctx) error {
	token := extractRefreshToken(c)
	if token == "" {
		return errors.Unauthorized("missing_refresh_token", "refresh token مطلوب")
	}

	resp, err := h.service.Refresh(c.UserContext(), token, extractMeta(c))
	if err != nil {
		return err
	}
	h.setAuthCookie(c, resp.Token.RefreshToken)
	return c.JSON(fiber.Map{"success": true, "data": resp})
}

func (h *Handler) RequestPasswordReset(c *fiber.Ctx) error {
	var req PasswordResetRequest
	if err := c.BodyParser(&req); err != nil {
		return errors.Validation("invalid_body", "تعذر قراءة بيانات الطلب")
	}
	if err := validate.Struct(req); err != nil {
		return err
	}

	if err := h.service.RequestPasswordReset(c.UserContext(), req, extractMeta(c)); err != nil {
		return err
	}
	return c.JSON(fiber.Map{"success": true, "message": "إذا كان البريد موجوداً، ستصله رسالة إعادة التعيين"})
}

func (h *Handler) ResetPassword(c *fiber.Ctx) error {
	var req PasswordResetConfirm
	if err := c.BodyParser(&req); err != nil {
		return errors.Validation("invalid_body", "تعذر قراءة بيانات الطلب")
	}
	if err := validate.Struct(req); err != nil {
		return err
	}

	if err := h.service.ResetPassword(c.UserContext(), req, extractMeta(c)); err != nil {
		return err
	}
	return c.JSON(fiber.Map{"success": true, "message": "تم تغيير كلمة المرور بنجاح"})
}

func (h *Handler) VerifyEmail(c *fiber.Ctx) error {
	var req VerifyEmailRequest
	if err := c.BodyParser(&req); err != nil {
		return errors.Validation("invalid_body", "تعذر قراءة بيانات الطلب")
	}
	if err := validate.Struct(req); err != nil {
		return err
	}

	if err := h.service.VerifyEmail(c.UserContext(), req, extractMeta(c)); err != nil {
		return err
	}
	return c.JSON(fiber.Map{"success": true, "message": "تم تأكيد البريد الإلكتروني"})
}

func (h *Handler) ResendVerification(c *fiber.Ctx) error {
	var req struct {
		Email string `json:"email" validate:"required,email"`
	}
	if err := c.BodyParser(&req); err != nil {
		return errors.Validation("invalid_body", "تعذر قراءة بيانات الطلب")
	}
	if err := validate.Struct(req); err != nil {
		return err
	}

	if err := h.service.ResendVerification(c.UserContext(), req.Email, extractMeta(c)); err != nil {
		return err
	}
	return c.JSON(fiber.Map{"success": true, "message": "تم إرسال رابط التحقق"})
}

func (h *Handler) BootstrapAdmin(c *fiber.Ctx) error {
	var req BootstrapAdminRequest
	if err := c.BodyParser(&req); err != nil {
		return errors.Validation("invalid_body", "تعذر قراءة بيانات الطلب")
	}
	if err := validate.Struct(req); err != nil {
		return err
	}

	admin, err := h.service.BootstrapAdmin(c.UserContext(), req, extractMeta(c))
	if err != nil {
		return err
	}
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"success": true, "data": admin})
}

func (h *Handler) DevMerchantLogin(c *fiber.Ctx) error {
	var req DevMerchantLoginRequest
	if err := c.BodyParser(&req); err != nil {
		return errors.Validation("invalid_body", "تعذر قراءة بيانات الطلب")
	}

	resp, err := h.service.DevMerchantLogin(c.UserContext(), req, extractMeta(c))
	if err != nil {
		return err
	}
	h.setAuthCookie(c, resp.Token.RefreshToken)
	return c.JSON(fiber.Map{"success": true, "data": resp})
}

func (h *Handler) DevCourierLogin(c *fiber.Ctx) error {
	var req DevCourierLoginRequest
	if err := c.BodyParser(&req); err != nil {
		return errors.Validation("invalid_body", "تعذر قراءة بيانات الطلب")
	}

	resp, err := h.service.DevCourierLogin(c.UserContext(), extractMeta(c))
	if err != nil {
		return err
	}
	h.setAuthCookie(c, resp.Token.RefreshToken)
	return c.JSON(fiber.Map{"success": true, "data": resp})
}

func (h *Handler) DevCustomerLogin(c *fiber.Ctx) error {
	var req DevCustomerLoginRequest
	if err := c.BodyParser(&req); err != nil {
		return errors.Validation("invalid_body", "تعذر قراءة بيانات الطلب")
	}

	resp, err := h.service.DevCustomerLogin(c.UserContext(), extractMeta(c))
	if err != nil {
		return err
	}
	h.setAuthCookie(c, resp.Token.RefreshToken)
	return c.JSON(fiber.Map{"success": true, "data": resp})
}

func (h *Handler) Generate2FA(c *fiber.Ctx) error {
	user, ok := middleware.AuthUserFromContext(c)
	if !ok {
		return errors.Unauthorized("unauthenticated", "يجب تسجيل الدخول")
	}

	secret, otpauthURL, err := h.service.Generate2FASecret(c.UserContext(), user.ID, user.Email)
	if err != nil {
		return errors.Internal("2fa_generate_failed", err)
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"secret":     secret,
			"otpauthUrl": otpauthURL,
		},
	})
}

func (h *Handler) Enable2FA(c *fiber.Ctx) error {
	user, ok := middleware.AuthUserFromContext(c)
	if !ok {
		return errors.Unauthorized("unauthenticated", "يجب تسجيل الدخول")
	}

	var req struct {
		Secret string `json:"secret" validate:"required"`
	}
	if err := c.BodyParser(&req); err != nil {
		return errors.Validation("invalid_body", "تعذر قراءة بيانات الطلب")
	}
	if err := validate.Struct(req); err != nil {
		return err
	}

	if err := h.service.Enable2FA(c.UserContext(), user.ID, req.Secret); err != nil {
		return err
	}
	return c.JSON(fiber.Map{"success": true, "message": "تم تفعيل المصادقة الثنائية"})
}

func (h *Handler) Disable2FA(c *fiber.Ctx) error {
	user, ok := middleware.AuthUserFromContext(c)
	if !ok {
		return errors.Unauthorized("unauthenticated", "يجب تسجيل الدخول")
	}

	if err := h.service.Disable2FA(c.UserContext(), user.ID, ""); err != nil {
		return err
	}
	return c.JSON(fiber.Map{"success": true, "message": "تم تعطيل المصادقة الثنائية"})
}

func (h *Handler) Verify2FA(c *fiber.Ctx) error {
	user, ok := middleware.AuthUserFromContext(c)
	if !ok {
		return errors.Unauthorized("unauthenticated", "يجب تسجيل الدخول")
	}

	var req struct {
		Code string `json:"code" validate:"required,len=6"`
	}
	if err := c.BodyParser(&req); err != nil {
		return errors.Validation("invalid_body", "تعذر قراءة بيانات الطلب")
	}
	if err := validate.Struct(req); err != nil {
		return err
	}

	valid, err := h.service.Verify2FA(c.UserContext(), user.ID, req.Code)
	if err != nil {
		return err
	}
	if !valid {
		return errors.Unauthorized("invalid_2fa_code", "رمز المصادقة الثنائية غير صحيح")
	}
	return c.JSON(fiber.Map{"success": true, "message": "تم التحقق بنجاح"})
}

func extractRefreshToken(c *fiber.Ctx) string {
	if t := c.Cookies("ray_session"); t != "" {
		return t
	}
	var body struct {
		RefreshToken string `json:"refreshToken"`
	}
	_ = c.BodyParser(&body)
	return body.RefreshToken
}

func (h *Handler) setAuthCookie(c *fiber.Ctx, refreshToken string) {
	if h.cfg.Name == "" {
		return
	}
	expiresAt := time.Now().Add(h.cfg.MaxAge)
	cookie := fiber.Cookie{
		Name:     h.cfg.Name,
		Value:    refreshToken,
		Path:     "/",
		HTTPOnly: true,
		Secure:   h.cfg.Secure,
		SameSite: h.cfg.SameSite,
		Domain:   h.cfg.Domain,
		Expires:  expiresAt,
		MaxAge:   int(h.cfg.MaxAge.Seconds()),
	}
	if cookie.SameSite == "" {
		cookie.SameSite = "Lax"
	}
	c.Cookie(&cookie)
}

func (h *Handler) clearAuthCookie(c *fiber.Ctx) {
	if h.cfg.Name == "" {
		return
	}
	cookie := fiber.Cookie{
		Name:     h.cfg.Name,
		Value:    "",
		Path:     "/",
		HTTPOnly: true,
		Secure:   h.cfg.Secure,
		SameSite: h.cfg.SameSite,
		Domain:   h.cfg.Domain,
		Expires:  time.Unix(0, 0),
		MaxAge:   -1,
	}
	if cookie.SameSite == "" {
		cookie.SameSite = "Lax"
	}
	c.Cookie(&cookie)
}

func extractMeta(c *fiber.Ctx) RequestMeta {
	return RequestMeta{
		IP:        c.IP(),
		UserAgent: c.Get("User-Agent"),
	}
}
