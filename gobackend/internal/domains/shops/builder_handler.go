package shops

import (
	"github.com/Sayedtaha55/ray-eg/gobackend/internal/platform/errors"
	"github.com/Sayedtaha55/ray-eg/gobackend/internal/platform/middleware"
	"github.com/Sayedtaha55/ray-eg/gobackend/internal/platform/validate"
	"github.com/gofiber/fiber/v2"
)

// BuilderHandler exposes builder configuration HTTP endpoints.
type BuilderHandler struct {
	service *BuilderService
}

// NewBuilderHandler creates a new builder handler.
func NewBuilderHandler(service *BuilderService) *BuilderHandler {
	return &BuilderHandler{service: service}
}

// RegisterBuilderRoutes wires the builder endpoints under the provided router.
// All routes require authentication and shop ownership (or admin role).
func (h *BuilderHandler) RegisterBuilderRoutes(r fiber.Router, authMW fiber.Handler) {
	g := r.Group("/builder", authMW)

	g.Get("/:shopId/config", h.GetBuilderConfig)
	g.Put("/:shopId/config", h.UpdateBuilderConfig)
	g.Patch("/:shopId/config", h.UpdateBuilderConfig)
	g.Post("/:shopId/publish", h.PublishBuilderConfig)
}

// RegisterPublicRoutes wires public (no-auth) storefront endpoints.
// GET /shops/:slug/website serves the published website config.
// GET /shops/published-slugs lists published site slugs for sitemaps.
func (h *BuilderHandler) RegisterPublicRoutes(r fiber.Router) {
	g := r.Group("/shops")
	g.Get("/published-slugs", h.GetPublishedSlugs)
	g.Get("/:slug/website", h.GetPublicWebsite)
}

// GetPublishedSlugs handles GET /shops/published-slugs (public).
// Returns the slugs of approved shops with a published website — used by the
// frontend sitemap to index /site/:slug pages.
func (h *BuilderHandler) GetPublishedSlugs(c *fiber.Ctx) error {
	slugs, err := h.service.ListPublishedSlugs(c.UserContext())
	if err != nil {
		return err
	}
	return c.JSON(fiber.Map{"success": true, "data": slugs})
}

// GetPublicWebsite handles GET /shops/:slug/website (public).
func (h *BuilderHandler) GetPublicWebsite(c *fiber.Ctx) error {
	slug := c.Params("slug")
	if slug == "" {
		return errors.Validation("slug_required", "slug مطلوب")
	}

	site, err := h.service.GetPublicWebsiteBySlug(c.UserContext(), slug)
	if err != nil {
		return err
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    site,
	})
}

// GetBuilderConfig handles GET /builder/:shopId/config
// Requires authentication and shop ownership or admin role.
func (h *BuilderHandler) GetBuilderConfig(c *fiber.Ctx) error {
	req := GetBuilderConfigRequest{
		ShopID: c.Params("shopId"),
	}

	if err := validate.Struct(req); err != nil {
		return errors.Validation("invalid_request", err.Error())
	}

	// Get authenticated user
	actor, ok := middleware.AuthUserFromContext(c)
	if !ok {
		return errors.Unauthorized("unauthorized", "غير مصرح")
	}

	// Check if user has access to this shop
	if actor.Role != "ADMIN" && actor.ShopID != req.ShopID {
		return errors.Forbidden("access_denied", "لا تملك صلاحية الوصول لهذا المتجر")
	}

	config, err := h.service.GetBuilderConfig(c.UserContext(), req.ShopID)
	if err != nil {
		return err
	}

	return c.JSON(config)
}

// UpdateBuilderConfig handles PATCH/PUT /builder/:shopId/config
// Requires authentication and shop ownership or admin role.
func (h *BuilderHandler) UpdateBuilderConfig(c *fiber.Ctx) error {
	var req UpdateBuilderConfigRequest
	req.ShopID = c.Params("shopId")

	if err := c.BodyParser(&req); err != nil {
		return errors.Validation("invalid_body", err.Error())
	}

	if err := validate.Struct(req); err != nil {
		return errors.Validation("invalid_request", err.Error())
	}

	// Get authenticated user
	actor, ok := middleware.AuthUserFromContext(c)
	if !ok {
		return errors.Unauthorized("unauthorized", "غير مصرح")
	}

	// Check if user has access to this shop
	if actor.Role != "ADMIN" && actor.ShopID != req.ShopID {
		return errors.Forbidden("access_denied", "لا تملك صلاحية الوصول لهذا المتجر")
	}

	config, err := h.service.UpdateBuilderConfig(c.UserContext(), req.ShopID, &req.Config)
	if err != nil {
		return err
	}

	return c.JSON(config)
}

// PublishBuilderConfig handles POST /builder/:shopId/publish
// Requires authentication and shop ownership or admin role.
func (h *BuilderHandler) PublishBuilderConfig(c *fiber.Ctx) error {
	req := PublishBuilderConfigRequest{
		ShopID: c.Params("shopId"),
	}

	if err := validate.Struct(req); err != nil {
		return errors.Validation("invalid_request", err.Error())
	}

	// Get authenticated user
	actor, ok := middleware.AuthUserFromContext(c)
	if !ok {
		return errors.Unauthorized("unauthorized", "غير مصرح")
	}

	// Check if user has access to this shop
	if actor.Role != "ADMIN" && actor.ShopID != req.ShopID {
		return errors.Forbidden("access_denied", "لا تملك صلاحية الوصول لهذا المتجر")
	}

	if err := h.service.PublishBuilderConfig(c.UserContext(), req.ShopID); err != nil {
		return err
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "تم نشر التكوين بنجاح",
	})
}
