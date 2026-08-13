package products

import (
	"strconv"

	"github.com/Sayedtaha55/ray-eg/gobackend/internal/config"
	"github.com/Sayedtaha55/ray-eg/gobackend/internal/domains/auth"
	"github.com/Sayedtaha55/ray-eg/gobackend/internal/platform/errors"
	"github.com/Sayedtaha55/ray-eg/gobackend/internal/platform/middleware"
	"github.com/Sayedtaha55/ray-eg/gobackend/internal/platform/validate"
	"github.com/gofiber/fiber/v2"
)

// Handler exposes product HTTP endpoints.
type Handler struct {
	service *Service
	cfg     *config.Config
}

// NewHandler creates a products handler.
func NewHandler(service *Service, cfg *config.Config) *Handler {
	return &Handler{service: service, cfg: cfg}
}

// RegisterRoutes wires the product endpoints under the provided router.
func (h *Handler) RegisterRoutes(r fiber.Router) {
	g := r.Group("/products")

	g.Get("/", h.List)
	g.Get("/:id", h.GetByID)

	g.Get("/manage/by-shop/:shopId", middleware.RequireAuth(h.cfg), requireRolesMiddleware(auth.RoleMerchant, auth.RoleAdmin), h.ListManage)

	g.Post("/", middleware.RequireAuth(h.cfg), h.Create)
	g.Patch("/:id", middleware.RequireAuth(h.cfg), h.Update)
	g.Delete("/:id", middleware.RequireAuth(h.cfg), h.Delete)
}

func (h *Handler) List(c *fiber.Ctx) error {
	req := parseProductListRequest(c)
	var products []Product
	var err error
	if req.ShopID != "" {
		products, err = h.service.ListByShop(c.UserContext(), req)
	} else {
		products, err = h.service.ListAllActive(c.UserContext(), req)
	}
	if err != nil {
		return err
	}
	return c.JSON(fiber.Map{"success": true, "data": products})
}

func (h *Handler) GetByID(c *fiber.Ctx) error {
	id := c.Params("id")
	product, err := h.service.GetByID(c.UserContext(), id)
	if err != nil {
		return err
	}
	return c.JSON(fiber.Map{"success": true, "data": product})
}

func (h *Handler) ListManage(c *fiber.Ctx) error {
	shopID := c.Params("shopId")
	if shopID == "" {
		return errors.Validation("shopId_required", "shopId مطلوب")
	}
	user, ok := middleware.AuthUserFromContext(c)
	if !ok {
		return errors.Unauthorized("unauthenticated", "يجب تسجيل الدخول")
	}
	req := parseManageListRequest(c)
	products, err := h.service.ListByShopForManage(c.UserContext(), shopID, user.ShopID, user.Role, req)
	if err != nil {
		return err
	}
	return c.JSON(fiber.Map{"success": true, "data": products})
}

func (h *Handler) Create(c *fiber.Ctx) error {
	user, ok := middleware.AuthUserFromContext(c)
	if !ok {
		return errors.Unauthorized("unauthenticated", "يجب تسجيل الدخول")
	}

	var req CreateProductRequest
	if err := c.BodyParser(&req); err != nil {
		return errors.Validation("invalid_body", "تعذر قراءة بيانات الطلب")
	}
	if err := validate.Struct(req); err != nil {
		return err
	}

	shopID := user.ShopID
	if user.Role == string(auth.RoleAdmin) {
		shopID = req.ShopID
	}
	if shopID == "" {
		return errors.Validation("shopId_required", "shopId مطلوب")
	}

	product, err := h.service.Create(c.UserContext(), req, shopID, user.ShopID, user.Role)
	if err != nil {
		return err
	}
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"success": true, "data": product})
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

	var req UpdateProductRequest
	if err := c.BodyParser(&req); err != nil {
		return errors.Validation("invalid_body", "تعذر قراءة بيانات الطلب")
	}
	if err := validate.Struct(req); err != nil {
		return err
	}

	product, err := h.service.Update(c.UserContext(), id, req, user.ShopID, user.Role)
	if err != nil {
		return err
	}
	return c.JSON(fiber.Map{"success": true, "data": product})
}

func (h *Handler) Delete(c *fiber.Ctx) error {
	user, ok := middleware.AuthUserFromContext(c)
	if !ok {
		return errors.Unauthorized("unauthenticated", "يجب تسجيل الدخول")
	}

	id := c.Params("id")
	if id == "" {
		return errors.Validation("id_required", "id مطلوب")
	}

	if err := h.service.Delete(c.UserContext(), id, user.ShopID, user.Role); err != nil {
		return err
	}
	return c.JSON(fiber.Map{"success": true, "message": "تم حذف المنتج"})
}

func parseProductListRequest(c *fiber.Ctx) ProductListRequest {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "20"))
	return ProductListRequest{
		ShopID: c.Query("shopId"),
		Page:   page,
		Limit:  limit,
	}
}

func parseManageListRequest(c *fiber.Ctx) ManageProductListRequest {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "20"))
	include := c.Query("includeImageMap", "false")
	return ManageProductListRequest{
		Page:            page,
		Limit:           limit,
		IncludeImageMap: include == "true",
	}
}

func requireRolesMiddleware(allowed ...auth.Role) fiber.Handler {
	return func(c *fiber.Ctx) error {
		user, ok := middleware.AuthUserFromContext(c)
		if !ok {
			return errors.Unauthorized("unauthenticated", "يجب تسجيل الدخول")
		}
		for _, r := range allowed {
			if auth.Role(user.Role) == r {
				return c.Next()
			}
		}
		return errors.Forbidden("insufficient_role", "ليس لديك صلاحية للوصول")
	}
}
