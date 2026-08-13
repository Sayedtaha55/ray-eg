package orders

import (
	"github.com/Sayedtaha55/ray-eg/gobackend/internal/config"
	"github.com/Sayedtaha55/ray-eg/gobackend/internal/domains/auth"
	"github.com/Sayedtaha55/ray-eg/gobackend/internal/platform/errors"
	"github.com/Sayedtaha55/ray-eg/gobackend/internal/platform/middleware"
	"github.com/Sayedtaha55/ray-eg/gobackend/internal/platform/validate"
	"github.com/gofiber/fiber/v2"
)

// Handler exposes order HTTP endpoints.
type Handler struct {
	service *Service
	cfg     *config.Config
}

// NewHandler creates an orders handler.
func NewHandler(service *Service, cfg *config.Config) *Handler {
	return &Handler{service: service, cfg: cfg}
}

// RegisterRoutes wires the order endpoints under the provided router.
func (h *Handler) RegisterRoutes(r fiber.Router) {
	g := r.Group("/orders")

	g.Post("/", middleware.RequireAuth(h.cfg), h.Create)
	g.Get("/", middleware.RequireAuth(h.cfg), middleware.RequireRole(string(auth.RoleMerchant), string(auth.RoleAdmin)), h.List)
	g.Get("/me", middleware.RequireAuth(h.cfg), middleware.RequireRole(string(auth.RoleMerchant)), h.ListMine)
	g.Get("/admin", middleware.RequireAuth(h.cfg), middleware.RequireRole(string(auth.RoleAdmin)), h.ListAdmin)
	g.Get("/courier/me", middleware.RequireAuth(h.cfg), middleware.RequireRole(string(auth.RoleCourier)), h.ListCourier)
	g.Get("/customer/me", middleware.RequireAuth(h.cfg), h.ListCustomerOrders)
	g.Get("/:id", middleware.RequireAuth(h.cfg), h.GetByID)
	g.Patch("/:id", middleware.RequireAuth(h.cfg), middleware.RequireRole(string(auth.RoleMerchant), string(auth.RoleAdmin)), h.Update)
	g.Patch("/:id/assign-courier", middleware.RequireAuth(h.cfg), middleware.RequireRole(string(auth.RoleAdmin)), h.AssignCourier)
	g.Patch("/:id/courier", middleware.RequireAuth(h.cfg), middleware.RequireRole(string(auth.RoleCourier)), h.UpdateCourier)
}

func (h *Handler) Create(c *fiber.Ctx) error {
	user, ok := middleware.AuthUserFromContext(c)
	if !ok {
		return errors.Unauthorized("unauthenticated", "يجب تسجيل الدخول")
	}
	var req CreateOrderRequest
	if err := c.BodyParser(&req); err != nil {
		return errors.Validation("invalid_body", "تعذر قراءة بيانات الطلب")
	}

	// Map nested customer object to flat fields (frontend compatibility).
	if req.Customer != nil {
		if req.Customer.Phone != "" && (req.CustomerPhone == nil || *req.CustomerPhone == "") {
			phone := req.Customer.Phone
			req.CustomerPhone = &phone
		}
		if req.Customer.Address != "" && (req.DeliveryAddressManual == nil || *req.DeliveryAddressManual == "") {
			addr := req.Customer.Address
			if req.Customer.City != "" {
				addr = req.Customer.City + ", " + addr
			}
			if req.Customer.District != "" {
				addr = req.Customer.District + ", " + addr
			}
			req.DeliveryAddressManual = &addr
		}
		if req.Customer.Lat != nil && req.DeliveryLat == nil {
			req.DeliveryLat = req.Customer.Lat
		}
		if req.Customer.Lng != nil && req.DeliveryLng == nil {
			req.DeliveryLng = req.Customer.Lng
		}
		if req.Customer.Notes != "" && (req.CustomerNote == nil || *req.CustomerNote == "") {
			note := req.Customer.Notes
			req.CustomerNote = &note
		}
	}

	if err := validate.Struct(req); err != nil {
		return err
	}

	order, err := h.service.CreateOrder(c.UserContext(), req, user.ID, user.Role)
	if err != nil {
		return err
	}
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"success": true, "data": order})
}

func (h *Handler) GetByID(c *fiber.Ctx) error {
	user, ok := middleware.AuthUserFromContext(c)
	if !ok {
		return errors.Unauthorized("unauthenticated", "يجب تسجيل الدخول")
	}
	id := c.Params("id")
	if id == "" {
		return errors.Validation("id_required", "id مطلوب")
	}
	order, err := h.service.GetByID(c.UserContext(), id, user.ID, user.ShopID, user.Role)
	if err != nil {
		return err
	}
	return c.JSON(fiber.Map{"success": true, "data": order})
}

func (h *Handler) List(c *fiber.Ctx) error {
	user, ok := middleware.AuthUserFromContext(c)
	if !ok {
		return errors.Unauthorized("unauthenticated", "يجب تسجيل الدخول")
	}
	req := parseOrderListRequest(c)
	shopID := req.ShopID
	if user.Role != string(auth.RoleAdmin) {
		shopID = user.ShopID
	}
	if shopID == "" {
		return errors.Validation("shopId_required", "shopId مطلوب")
	}
	orders, err := h.service.ListByShop(c.UserContext(), shopID, user.ShopID, user.Role, req)
	if err != nil {
		return err
	}
	return c.JSON(fiber.Map{"success": true, "data": orders})
}

func (h *Handler) ListMine(c *fiber.Ctx) error {
	user, ok := middleware.AuthUserFromContext(c)
	if !ok {
		return errors.Unauthorized("unauthenticated", "يجب تسجيل الدخول")
	}
	req := parseOrderListRequest(c)
	orders, err := h.service.ListMerchantMine(c.UserContext(), user.ShopID, user.Role, req)
	if err != nil {
		return err
	}
	return c.JSON(fiber.Map{"success": true, "data": orders})
}

func (h *Handler) ListAdmin(c *fiber.Ctx) error {
	req := parseOrderListRequest(c)
	orders, err := h.service.ListAllAdmin(c.UserContext(), req)
	if err != nil {
		return err
	}
	return c.JSON(fiber.Map{"success": true, "data": orders})
}

func (h *Handler) ListCourier(c *fiber.Ctx) error {
	user, ok := middleware.AuthUserFromContext(c)
	if !ok {
		return errors.Unauthorized("unauthenticated", "يجب تسجيل الدخول")
	}
	req := parseCourierOrderListRequest(c)
	orders, err := h.service.ListMyCourierOrders(c.UserContext(), user.ID, req)
	if err != nil {
		return err
	}
	return c.JSON(fiber.Map{"success": true, "data": orders})
}

func (h *Handler) ListCustomerOrders(c *fiber.Ctx) error {
	user, ok := middleware.AuthUserFromContext(c)
	if !ok {
		return errors.Unauthorized("unauthenticated", "يجب تسجيل الدخول")
	}
	page, limit := ParsePageLimit(c.Query("page"), c.Query("limit"))
	orders, err := h.service.ListCustomerOrders(c.UserContext(), user.ID, page, limit)
	if err != nil {
		return err
	}
	return c.JSON(fiber.Map{"success": true, "data": orders})
}

func (h *Handler) Update(c *fiber.Ctx) error {
	user, ok := middleware.AuthUserFromContext(c)
	if !ok {
		return errors.Unauthorized("unauthenticated", "يجب تسجيل الدخول")
	}
	id := c.Params("id")
	if id == "" {
		return errors.Validation("id_required", "id مطلوب")
	}
	var req UpdateOrderRequest
	if err := c.BodyParser(&req); err != nil {
		return errors.Validation("invalid_body", "تعذر قراءة بيانات الطلب")
	}
	if err := validate.Struct(req); err != nil {
		return err
	}
	order, err := h.service.UpdateOrder(c.UserContext(), id, req, user.ShopID, user.Role)
	if err != nil {
		return err
	}
	return c.JSON(fiber.Map{"success": true, "data": order})
}

func (h *Handler) AssignCourier(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return errors.Validation("id_required", "id مطلوب")
	}
	var req AssignCourierRequest
	if err := c.BodyParser(&req); err != nil {
		return errors.Validation("invalid_body", "تعذر قراءة بيانات الطلب")
	}
	if err := validate.Struct(req); err != nil {
		return err
	}
	order, err := h.service.AssignCourier(c.UserContext(), id, req)
	if err != nil {
		return err
	}
	return c.JSON(fiber.Map{"success": true, "data": order})
}

func (h *Handler) UpdateCourier(c *fiber.Ctx) error {
	user, ok := middleware.AuthUserFromContext(c)
	if !ok {
		return errors.Unauthorized("unauthenticated", "يجب تسجيل الدخول")
	}
	id := c.Params("id")
	if id == "" {
		return errors.Validation("id_required", "id مطلوب")
	}
	var req CourierUpdateRequest
	if err := c.BodyParser(&req); err != nil {
		return errors.Validation("invalid_body", "تعذر قراءة بيانات الطلب")
	}
	if err := validate.Struct(req); err != nil {
		return err
	}
	order, err := h.service.UpdateCourierOrder(c.UserContext(), id, req, user.ID)
	if err != nil {
		return err
	}
	return c.JSON(fiber.Map{"success": true, "data": order})
}

func parseOrderListRequest(c *fiber.Ctx) OrderListRequest {
	page, limit := ParsePageLimit(c.Query("page"), c.Query("limit"))
	return OrderListRequest{
		ShopID: c.Query("shopId"),
		From:   parseOrderDate(c.Query("from")),
		To:     parseOrderDate(c.Query("to")),
		Page:   page,
		Limit:  limit,
	}
}

func parseCourierOrderListRequest(c *fiber.Ctx) CourierOrderListRequest {
	page, limit := ParsePageLimit(c.Query("page"), c.Query("limit"))
	return CourierOrderListRequest{
		Page:  page,
		Limit: limit,
	}
}
