package finance

import (
	"strings"

	"github.com/Sayedtaha55/ray-eg/gobackend/internal/config"
	"github.com/Sayedtaha55/ray-eg/gobackend/internal/platform/middleware"
	"github.com/gofiber/fiber/v2"
)

// Handler serves the finance report API routes (cashflow, profit, revenue).
// Financial entity CRUD (accounts, journal, taxes, wallets) lives in the
// accounting domain backed by the acc_* tables.
type Handler struct {
	service *Service
	config  *config.Config
}

// NewHandler creates a new finance handler.
func NewHandler(service *Service, cfg *config.Config) *Handler {
	return &Handler{service: service, config: cfg}
}

// RegisterRoutes wires the finance endpoints under /finance.
func (h *Handler) RegisterRoutes(app fiber.Router) {
	g := app.Group("/finance")
	auth := middleware.RequireAuth(h.config)

	// Reports
	g.Get("/reports/cashflow/shop/:shopId", auth, h.Cashflow)
	g.Get("/reports/profit/shop/:shopId", auth, h.Profit)
	g.Get("/reports/revenue/shop/:shopId", auth, h.Revenue)
}

func fail(c *fiber.Ctx, status int, msg string) error {
	return c.Status(status).JSON(map[string]any{"success": false, "error": msg})
}

// resolveShop resolves the target shop from the path param, falling back to the
// authenticated user's shop. Only an ADMIN may act on a shop not their own.
func resolveShop(c *fiber.Ctx) (string, bool) {
	user, uok := middleware.AuthUserFromContext(c)
	if !uok {
		_ = fail(c, fiber.StatusUnauthorized, "Unauthorized")
		return "", false
	}
	shopID := c.Params("shopId")
	if shopID == "" {
		shopID = user.ShopID
	}
	if !strings.EqualFold(user.Role, "ADMIN") && shopID != user.ShopID {
		_ = fail(c, fiber.StatusForbidden, "Forbidden")
		return "", false
	}
	return shopID, true
}

// ---------------------------------------------------------------------------
// Reports
// ---------------------------------------------------------------------------

func (h *Handler) Cashflow(c *fiber.Ctx) error {
	shopID, ok := resolveShop(c)
	if !ok {
		return nil
	}
	summary, err := h.service.GetCashflowSummary(c.Context(), shopID)
	if err != nil {
		return fail(c, fiber.StatusInternalServerError, err.Error())
	}
	return c.JSON(map[string]any{"success": true, "data": summary})
}

func (h *Handler) Profit(c *fiber.Ctx) error {
	shopID, ok := resolveShop(c)
	if !ok {
		return nil
	}
	summary, err := h.service.GetProfitSummary(c.Context(), shopID)
	if err != nil {
		return fail(c, fiber.StatusInternalServerError, err.Error())
	}
	return c.JSON(map[string]any{"success": true, "data": summary})
}

func (h *Handler) Revenue(c *fiber.Ctx) error {
	shopID, ok := resolveShop(c)
	if !ok {
		return nil
	}
	summary, err := h.service.GetRevenueSummary(c.Context(), shopID)
	if err != nil {
		return fail(c, fiber.StatusInternalServerError, err.Error())
	}
	return c.JSON(map[string]any{"success": true, "data": summary})
}
