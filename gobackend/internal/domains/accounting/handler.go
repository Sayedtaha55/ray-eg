package accounting

import (
	"strings"

	"github.com/Sayedtaha55/ray-eg/gobackend/internal/config"
	"github.com/Sayedtaha55/ray-eg/gobackend/internal/platform/middleware"
	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
)

// Handler serves the accounting API routes.
type Handler struct {
	service  *Service
	config   *config.Config
	validate *validator.Validate
}

// NewHandler creates a new accounting handler.
func NewHandler(service *Service, cfg *config.Config) *Handler {
	return &Handler{service: service, config: cfg, validate: validator.New()}
}

// RegisterRoutes registers accounting routes under /accounting.
func (h *Handler) RegisterRoutes(app fiber.Router) {
	g := app.Group("/accounting")
	auth := middleware.RequireAuth(h.config)

	// Accounts (chart of accounts)
	g.Get("/accounts/shop/:shopId", auth, h.ListAccounts)
	g.Post("/accounts/shop/:shopId", auth, h.CreateAccount)
	g.Put("/accounts/:id", auth, h.UpdateAccount)
	g.Delete("/accounts/:id", auth, h.DeleteAccount)

	// Journal entries
	g.Get("/journal/shop/:shopId", auth, h.ListJournalEntries)
	g.Post("/journal/shop/:shopId", auth, h.CreateJournalEntry)
	g.Get("/journal/:id", auth, h.GetJournalEntry)
	g.Put("/journal/:id", auth, h.UpdateJournalEntry)
	g.Delete("/journal/:id", auth, h.DeleteJournalEntry)
	g.Post("/journal/:id/post", auth, h.PostJournalEntry)
	g.Post("/journal/:id/reverse", auth, h.ReverseJournalEntry)

	// Reports
	g.Get("/trial-balance/shop/:shopId", auth, h.TrialBalance)
	g.Get("/reports/income-statement/shop/:shopId", auth, h.IncomeStatement)
	g.Get("/reports/balance-sheet/shop/:shopId", auth, h.BalanceSheet)
}

func fail(c *fiber.Ctx, status int, msg string) error {
	return c.Status(status).JSON(map[string]any{"success": false, "error": msg})
}

// resolveShop mirrors dashboard scoping: non-admins only access their own shop.
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

// ------------------------------- Accounts ---------------------------------

func (h *Handler) ListAccounts(c *fiber.Ctx) error {
	shopID, ok := resolveShop(c)
	if !ok {
		return nil
	}
	accounts, err := h.service.ListAccounts(c.Context(), shopID)
	if err != nil {
		return fail(c, fiber.StatusInternalServerError, err.Error())
	}
	return c.JSON(map[string]any{"success": true, "data": accounts})
}

func (h *Handler) CreateAccount(c *fiber.Ctx) error {
	shopID, ok := resolveShop(c)
	if !ok {
		return nil
	}
	var dto CreateAccountDTO
	if err := c.BodyParser(&dto); err != nil {
		return fail(c, fiber.StatusBadRequest, "Invalid request body")
	}
	if err := dto.Validate(h.validate); err != nil {
		return fail(c, fiber.StatusBadRequest, err.Error())
	}
	acc, err := h.service.CreateAccount(c.Context(), shopID, &dto)
	if err != nil {
		return fail(c, fiber.StatusInternalServerError, err.Error())
	}
	return c.Status(fiber.StatusCreated).JSON(map[string]any{"success": true, "data": acc})
}

func (h *Handler) UpdateAccount(c *fiber.Ctx) error {
	var dto UpdateAccountDTO
	if err := c.BodyParser(&dto); err != nil {
		return fail(c, fiber.StatusBadRequest, "Invalid request body")
	}
	if err := dto.Validate(h.validate); err != nil {
		return fail(c, fiber.StatusBadRequest, err.Error())
	}
	acc, err := h.service.UpdateAccount(c.Context(), c.Params("id"), &dto)
	if err != nil {
		return fail(c, fiber.StatusInternalServerError, err.Error())
	}
	return c.JSON(map[string]any{"success": true, "data": acc})
}

func (h *Handler) DeleteAccount(c *fiber.Ctx) error {
	if err := h.service.DeleteAccount(c.Context(), c.Params("id")); err != nil {
		if err == ErrAccountInUse {
			return fail(c, fiber.StatusConflict, err.Error())
		}
		return fail(c, fiber.StatusInternalServerError, err.Error())
	}
	return c.JSON(map[string]any{"success": true})
}

// ------------------------------- Journal ----------------------------------

func (h *Handler) ListJournalEntries(c *fiber.Ctx) error {
	shopID, ok := resolveShop(c)
	if !ok {
		return nil
	}
	entries, err := h.service.ListJournalEntries(c.Context(), shopID, c.Query("status"), c.Query("from"), c.Query("to"))
	if err != nil {
		return fail(c, fiber.StatusInternalServerError, err.Error())
	}
	return c.JSON(map[string]any{"success": true, "data": entries})
}

func (h *Handler) GetJournalEntry(c *fiber.Ctx) error {
	entry, err := h.service.GetJournalEntry(c.Context(), c.Params("id"))
	if err != nil {
		return fail(c, fiber.StatusNotFound, "القيد غير موجود")
	}
	return c.JSON(map[string]any{"success": true, "data": entry})
}

func (h *Handler) CreateJournalEntry(c *fiber.Ctx) error {
	shopID, ok := resolveShop(c)
	if !ok {
		return nil
	}
	user, _ := middleware.AuthUserFromContext(c)
	var dto CreateJournalEntryDTO
	if err := c.BodyParser(&dto); err != nil {
		return fail(c, fiber.StatusBadRequest, "Invalid request body")
	}
	if err := dto.Validate(h.validate); err != nil {
		return fail(c, fiber.StatusBadRequest, err.Error())
	}
	entry, err := h.service.CreateJournalEntry(c.Context(), shopID, user.ID, &dto)
	if err != nil {
		return fail(c, fiber.StatusBadRequest, err.Error())
	}
	return c.Status(fiber.StatusCreated).JSON(map[string]any{"success": true, "data": entry})
}

func (h *Handler) UpdateJournalEntry(c *fiber.Ctx) error {
	var dto UpdateJournalEntryDTO
	if err := c.BodyParser(&dto); err != nil {
		return fail(c, fiber.StatusBadRequest, "Invalid request body")
	}
	if err := dto.Validate(h.validate); err != nil {
		return fail(c, fiber.StatusBadRequest, err.Error())
	}
	entry, err := h.service.UpdateJournalEntry(c.Context(), c.Params("id"), &dto)
	if err != nil {
		return fail(c, fiber.StatusBadRequest, err.Error())
	}
	return c.JSON(map[string]any{"success": true, "data": entry})
}

func (h *Handler) PostJournalEntry(c *fiber.Ctx) error {
	user, _ := middleware.AuthUserFromContext(c)
	entry, err := h.service.PostJournalEntry(c.Context(), c.Params("id"), user.ID)
	if err != nil {
		return fail(c, fiber.StatusBadRequest, err.Error())
	}
	return c.JSON(map[string]any{"success": true, "data": entry})
}

func (h *Handler) ReverseJournalEntry(c *fiber.Ctx) error {
	user, _ := middleware.AuthUserFromContext(c)
	entry, err := h.service.ReverseJournalEntry(c.Context(), c.Params("id"), user.ID)
	if err != nil {
		return fail(c, fiber.StatusBadRequest, err.Error())
	}
	return c.JSON(map[string]any{"success": true, "data": entry})
}

func (h *Handler) DeleteJournalEntry(c *fiber.Ctx) error {
	if err := h.service.DeleteJournalEntry(c.Context(), c.Params("id")); err != nil {
		return fail(c, fiber.StatusBadRequest, err.Error())
	}
	return c.JSON(map[string]any{"success": true})
}

// ------------------------------- Reports ----------------------------------

func (h *Handler) TrialBalance(c *fiber.Ctx) error {
	shopID, ok := resolveShop(c)
	if !ok {
		return nil
	}
	tb, err := h.service.TrialBalance(c.Context(), shopID, c.Query("from"), c.Query("to"))
	if err != nil {
		return fail(c, fiber.StatusInternalServerError, err.Error())
	}
	return c.JSON(map[string]any{"success": true, "data": tb})
}

func (h *Handler) IncomeStatement(c *fiber.Ctx) error {
	shopID, ok := resolveShop(c)
	if !ok {
		return nil
	}
	is, err := h.service.IncomeStatement(c.Context(), shopID, c.Query("from"), c.Query("to"))
	if err != nil {
		return fail(c, fiber.StatusInternalServerError, err.Error())
	}
	return c.JSON(map[string]any{"success": true, "data": is})
}

func (h *Handler) BalanceSheet(c *fiber.Ctx) error {
	shopID, ok := resolveShop(c)
	if !ok {
		return nil
	}
	bs, err := h.service.BalanceSheet(c.Context(), shopID, c.Query("asOf"))
	if err != nil {
		return fail(c, fiber.StatusInternalServerError, err.Error())
	}
	return c.JSON(map[string]any{"success": true, "data": bs})
}