package users

import (
	"strconv"

	"github.com/Sayedtaha55/ray-eg/gobackend/internal/config"
	"github.com/Sayedtaha55/ray-eg/gobackend/internal/domains/auth"
	"github.com/Sayedtaha55/ray-eg/gobackend/internal/platform/errors"
	"github.com/Sayedtaha55/ray-eg/gobackend/internal/platform/middleware"
	"github.com/Sayedtaha55/ray-eg/gobackend/internal/platform/validate"
	"github.com/gofiber/fiber/v2"
)

// Handler exposes user HTTP endpoints.
type Handler struct {
	service *Service
	cfg     *config.Config
}

// NewHandler creates a users handler.
func NewHandler(service *Service, cfg *config.Config) *Handler {
	return &Handler{service: service, cfg: cfg}
}

// RegisterRoutes wires the user endpoints under the provided router.
func (h *Handler) RegisterRoutes(r fiber.Router) {
	g := r.Group("/users")

	g.Patch("/me", middleware.RequireAuth(h.cfg), h.UpdateMe)

	admin := g.Group("", middleware.RequireAuth(h.cfg), requireRoleMiddleware(auth.RoleAdmin))
	admin.Get("/couriers", h.ListCouriers)
	admin.Post("/couriers", h.CreateCourier)
	admin.Get("/couriers/pending", h.ListPendingCouriers)
	admin.Patch("/couriers/:id/approve", h.ApproveCourier)
	admin.Patch("/couriers/:id/reject", h.RejectCourier)
	admin.Get("/couriers/:id", h.GetCourierDetails)
	admin.Patch("/couriers/:id/status", h.SetCourierStatus)
}

func (h *Handler) UpdateMe(c *fiber.Ctx) error {
	user, ok := middleware.AuthUserFromContext(c)
	if !ok {
		return errors.Unauthorized("unauthenticated", "يجب تسجيل الدخول")
	}

	var req UpdateMeRequest
	if err := c.BodyParser(&req); err != nil {
		return errors.Validation("invalid_body", "تعذر قراءة بيانات الطلب")
	}
	if err := validate.Struct(req); err != nil {
		return err
	}

	updated, err := h.service.UpdateMe(c.UserContext(), user.ID, req)
	if err != nil {
		return err
	}
	return c.JSON(fiber.Map{"success": true, "data": updated})
}

func (h *Handler) ListCouriers(c *fiber.Ctx) error {
	req, err := parseCourierListRequest(c)
	if err != nil {
		return err
	}
	couriers, err := h.service.ListCouriers(c.UserContext(), req)
	if err != nil {
		return err
	}
	return c.JSON(fiber.Map{"success": true, "data": couriers})
}

func (h *Handler) CreateCourier(c *fiber.Ctx) error {
	var req CreateCourierRequest
	if err := c.BodyParser(&req); err != nil {
		return errors.Validation("invalid_body", "تعذر قراءة بيانات الطلب")
	}
	if err := validate.Struct(req); err != nil {
		return err
	}

	created, err := h.service.CreateCourier(c.UserContext(), req)
	if err != nil {
		return err
	}
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"success": true, "data": created})
}

func (h *Handler) ListPendingCouriers(c *fiber.Ctx) error {
	req, err := parseCourierListRequest(c)
	if err != nil {
		return err
	}
	couriers, err := h.service.ListPendingCouriers(c.UserContext(), req)
	if err != nil {
		return err
	}
	return c.JSON(fiber.Map{"success": true, "data": couriers})
}

func (h *Handler) ApproveCourier(c *fiber.Ctx) error {
	id := c.Params("id")
	courier, err := h.service.ApproveCourier(c.UserContext(), id)
	if err != nil {
		return err
	}
	return c.JSON(fiber.Map{"success": true, "data": courier})
}

func (h *Handler) RejectCourier(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := h.service.RejectCourier(c.UserContext(), id); err != nil {
		return err
	}
	return c.JSON(fiber.Map{"success": true, "message": "تم رفض المندوب"})
}

func (h *Handler) GetCourierDetails(c *fiber.Ctx) error {
	id := c.Params("id")
	details, err := h.service.GetCourierDetails(c.UserContext(), id)
	if err != nil {
		return err
	}
	return c.JSON(fiber.Map{"success": true, "data": details})
}

func (h *Handler) SetCourierStatus(c *fiber.Ctx) error {
	id := c.Params("id")
	var body struct {
		IsActive bool `json:"isActive"`
	}
	if err := c.BodyParser(&body); err != nil {
		return errors.Validation("invalid_body", "تعذر قراءة بيانات الطلب")
	}
	courier, err := h.service.SetCourierActiveStatus(c.UserContext(), id, body.IsActive)
	if err != nil {
		return err
	}
	return c.JSON(fiber.Map{"success": true, "data": courier})
}

func parseCourierListRequest(c *fiber.Ctx) (CourierListRequest, error) {
	take, _ := strconv.Atoi(c.Query("take", "50"))
	skip, _ := strconv.Atoi(c.Query("skip", "0"))
	return CourierListRequest{
		Take:     take,
		Skip:     skip,
		Search:   c.Query("search"),
		IsActive: c.Query("isActive"),
	}, nil
}

func requireRoleMiddleware(allowed auth.Role) fiber.Handler {
	return func(c *fiber.Ctx) error {
		user, ok := middleware.AuthUserFromContext(c)
		if !ok {
			return errors.Unauthorized("unauthenticated", "يجب تسجيل الدخول")
		}
		if auth.Role(user.Role) != allowed {
			return errors.Forbidden("insufficient_role", "ليس لديك صلاحية للوصول")
		}
		return c.Next()
	}
}
