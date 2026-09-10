package finance

import (
	"strings"

	"github.com/Sayedtaha55/ray-eg/gobackend/internal/config"
	"github.com/Sayedtaha55/ray-eg/gobackend/internal/platform/middleware"
	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
)

// Handler serves the finance API routes (accounts, journal, expenses, taxes,
// wallets, transactions and computed reports).
type Handler struct {
	service  *Service
	config   *config.Config
	validate *validator.Validate
}

// NewHandler creates a new finance handler.
func NewHandler(service *Service, cfg *config.Config) *Handler {
	return &Handler{service: service, config: cfg, validate: validator.New()}
}

// RegisterRoutes wires the finance endpoints under /finance.
func (h *Handler) RegisterRoutes(app fiber.Router) {
	g := app.Group("/finance")
	auth := middleware.RequireAuth(h.config)

	// Accounts (chart of accounts)
	g.Get("/accounts/shop/:shopId", auth, h.ListAccounts)
	g.Post("/accounts/shop/:shopId", auth, h.CreateAccount)
	g.Put("/accounts/:id", auth, h.UpdateAccount)
	g.Delete("/accounts/:id", auth, h.DeleteAccount)

	// Journal entries
	g.Get("/journal/shop/:shopId", auth, h.ListJournalEntries)
	g.Post("/journal/shop/:shopId", auth, h.CreateJournalEntry)
	g.Delete("/journal/:id", auth, h.DeleteJournalEntry)

	// Expenses
	g.Get("/expenses/shop/:shopId", auth, h.ListExpenses)
	g.Post("/expenses/shop/:shopId", auth, h.CreateExpense)
	g.Put("/expenses/:id", auth, h.UpdateExpense)
	g.Delete("/expenses/:id", auth, h.DeleteExpense)

	// Taxes
	g.Get("/taxes/shop/:shopId", auth, h.ListTaxes)
	g.Post("/taxes/shop/:shopId", auth, h.CreateTax)
	g.Put("/taxes/:id", auth, h.UpdateTax)
	g.Delete("/taxes/:id", auth, h.DeleteTax)

	// Wallets
	g.Get("/wallets/shop/:shopId", auth, h.ListWallets)
	g.Post("/wallets/shop/:shopId", auth, h.CreateWallet)
	g.Put("/wallets/:id", auth, h.UpdateWallet)
	g.Delete("/wallets/:id", auth, h.DeleteWallet)

	// Transactions
	g.Get("/transactions/shop/:shopId", auth, h.ListTransactions)
	g.Post("/transactions/shop/:shopId", auth, h.CreateTransaction)

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
// Accounts
// ---------------------------------------------------------------------------

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
	account, err := h.service.CreateAccount(c.Context(), shopID, &dto)
	if err != nil {
		return fail(c, fiber.StatusBadRequest, err.Error())
	}
	return c.Status(fiber.StatusCreated).JSON(map[string]any{"success": true, "data": account})
}

func (h *Handler) UpdateAccount(c *fiber.Ctx) error {
	var dto UpdateAccountDTO
	if err := c.BodyParser(&dto); err != nil {
		return fail(c, fiber.StatusBadRequest, "Invalid request body")
	}
	if err := dto.Validate(h.validate); err != nil {
		return fail(c, fiber.StatusBadRequest, err.Error())
	}
	account, err := h.service.UpdateAccount(c.Context(), c.Params("id"), &dto)
	if err != nil {
		return fail(c, fiber.StatusBadRequest, err.Error())
	}
	return c.JSON(map[string]any{"success": true, "data": account})
}

func (h *Handler) DeleteAccount(c *fiber.Ctx) error {
	if err := h.service.DeleteAccount(c.Context(), c.Params("id")); err != nil {
		return fail(c, fiber.StatusBadRequest, err.Error())
	}
	return c.JSON(map[string]any{"success": true})
}

// ---------------------------------------------------------------------------
// Journal entries
// ---------------------------------------------------------------------------

func (h *Handler) ListJournalEntries(c *fiber.Ctx) error {
	shopID, ok := resolveShop(c)
	if !ok {
		return nil
	}
	entries, err := h.service.ListJournalEntries(c.Context(), shopID)
	if err != nil {
		return fail(c, fiber.StatusInternalServerError, err.Error())
	}
	return c.JSON(map[string]any{"success": true, "data": entries})
}

func (h *Handler) CreateJournalEntry(c *fiber.Ctx) error {
	shopID, ok := resolveShop(c)
	if !ok {
		return nil
	}
	var dto CreateJournalEntryDTO
	if err := c.BodyParser(&dto); err != nil {
		return fail(c, fiber.StatusBadRequest, "Invalid request body")
	}
	if err := dto.Validate(h.validate); err != nil {
		return fail(c, fiber.StatusBadRequest, err.Error())
	}
	entry, err := h.service.CreateJournalEntry(c.Context(), shopID, &dto)
	if err != nil {
		return fail(c, fiber.StatusBadRequest, err.Error())
	}
	return c.Status(fiber.StatusCreated).JSON(map[string]any{"success": true, "data": entry})
}

func (h *Handler) DeleteJournalEntry(c *fiber.Ctx) error {
	if err := h.service.DeleteJournalEntry(c.Context(), c.Params("id")); err != nil {
		return fail(c, fiber.StatusBadRequest, err.Error())
	}
	return c.JSON(map[string]any{"success": true})
}
// ---------------------------------------------------------------------------
// Expenses
// ---------------------------------------------------------------------------

func (h *Handler) ListExpenses(c *fiber.Ctx) error {
	shopID, ok := resolveShop(c)
	if !ok {
		return nil
	}
	expenses, err := h.service.ListExpenses(c.Context(), shopID)
	if err != nil {
		return fail(c, fiber.StatusInternalServerError, err.Error())
	}
	return c.JSON(map[string]any{"success": true, "data": expenses})
}

func (h *Handler) CreateExpense(c *fiber.Ctx) error {
	shopID, ok := resolveShop(c)
	if !ok {
		return nil
	}
	var dto CreateExpenseDTO
	if err := c.BodyParser(&dto); err != nil {
		return fail(c, fiber.StatusBadRequest, "Invalid request body")
	}
	if err := dto.Validate(h.validate); err != nil {
		return fail(c, fiber.StatusBadRequest, err.Error())
	}
	expense, err := h.service.CreateExpense(c.Context(), shopID, &dto)
	if err != nil {
		return fail(c, fiber.StatusBadRequest, err.Error())
	}
	return c.Status(fiber.StatusCreated).JSON(map[string]any{"success": true, "data": expense})
}

func (h *Handler) UpdateExpense(c *fiber.Ctx) error {
	var dto UpdateExpenseDTO
	if err := c.BodyParser(&dto); err != nil {
		return fail(c, fiber.StatusBadRequest, "Invalid request body")
	}
	if err := dto.Validate(h.validate); err != nil {
		return fail(c, fiber.StatusBadRequest, err.Error())
	}
	expense, err := h.service.UpdateExpense(c.Context(), c.Params("id"), &dto)
	if err != nil {
		return fail(c, fiber.StatusBadRequest, err.Error())
	}
	return c.JSON(map[string]any{"success": true, "data": expense})
}

func (h *Handler) DeleteExpense(c *fiber.Ctx) error {
	if err := h.service.DeleteExpense(c.Context(), c.Params("id")); err != nil {
		return fail(c, fiber.StatusBadRequest, err.Error())
	}
	return c.JSON(map[string]any{"success": true})
}

// ---------------------------------------------------------------------------
// Taxes
// ---------------------------------------------------------------------------

func (h *Handler) ListTaxes(c *fiber.Ctx) error {
	shopID, ok := resolveShop(c)
	if !ok {
		return nil
	}
	taxes, err := h.service.ListTaxes(c.Context(), shopID)
	if err != nil {
		return fail(c, fiber.StatusInternalServerError, err.Error())
	}
	return c.JSON(map[string]any{"success": true, "data": taxes})
}

func (h *Handler) CreateTax(c *fiber.Ctx) error {
	shopID, ok := resolveShop(c)
	if !ok {
		return nil
	}
	var dto CreateTaxDTO
	if err := c.BodyParser(&dto); err != nil {
		return fail(c, fiber.StatusBadRequest, "Invalid request body")
	}
	if err := dto.Validate(h.validate); err != nil {
		return fail(c, fiber.StatusBadRequest, err.Error())
	}
	tax, err := h.service.CreateTax(c.Context(), shopID, &dto)
	if err != nil {
		return fail(c, fiber.StatusBadRequest, err.Error())
	}
	return c.Status(fiber.StatusCreated).JSON(map[string]any{"success": true, "data": tax})
}

func (h *Handler) UpdateTax(c *fiber.Ctx) error {
	var dto UpdateTaxDTO
	if err := c.BodyParser(&dto); err != nil {
		return fail(c, fiber.StatusBadRequest, "Invalid request body")
	}
	if err := dto.Validate(h.validate); err != nil {
		return fail(c, fiber.StatusBadRequest, err.Error())
	}
	tax, err := h.service.UpdateTax(c.Context(), c.Params("id"), &dto)
	if err != nil {
		return fail(c, fiber.StatusBadRequest, err.Error())
	}
	return c.JSON(map[string]any{"success": true, "data": tax})
}

func (h *Handler) DeleteTax(c *fiber.Ctx) error {
	if err := h.service.DeleteTax(c.Context(), c.Params("id")); err != nil {
		return fail(c, fiber.StatusBadRequest, err.Error())
	}
	return c.JSON(map[string]any{"success": true})
}
// ---------------------------------------------------------------------------
// Wallets
// ---------------------------------------------------------------------------

func (h *Handler) ListWallets(c *fiber.Ctx) error {
	shopID, ok := resolveShop(c)
	if !ok {
		return nil
	}
	wallets, err := h.service.ListWallets(c.Context(), shopID)
	if err != nil {
		return fail(c, fiber.StatusInternalServerError, err.Error())
	}
	return c.JSON(map[string]any{"success": true, "data": wallets})
}

func (h *Handler) CreateWallet(c *fiber.Ctx) error {
	shopID, ok := resolveShop(c)
	if !ok {
		return nil
	}
	var dto CreateWalletDTO
	if err := c.BodyParser(&dto); err != nil {
		return fail(c, fiber.StatusBadRequest, "Invalid request body")
	}
	if err := dto.Validate(h.validate); err != nil {
		return fail(c, fiber.StatusBadRequest, err.Error())
	}
	wallet, err := h.service.CreateWallet(c.Context(), shopID, &dto)
	if err != nil {
		return fail(c, fiber.StatusBadRequest, err.Error())
	}
	return c.Status(fiber.StatusCreated).JSON(map[string]any{"success": true, "data": wallet})
}

func (h *Handler) UpdateWallet(c *fiber.Ctx) error {
	var dto UpdateWalletDTO
	if err := c.BodyParser(&dto); err != nil {
		return fail(c, fiber.StatusBadRequest, "Invalid request body")
	}
	if err := dto.Validate(h.validate); err != nil {
		return fail(c, fiber.StatusBadRequest, err.Error())
	}
	wallet, err := h.service.UpdateWallet(c.Context(), c.Params("id"), &dto)
	if err != nil {
		return fail(c, fiber.StatusBadRequest, err.Error())
	}
	return c.JSON(map[string]any{"success": true, "data": wallet})
}

func (h *Handler) DeleteWallet(c *fiber.Ctx) error {
	if err := h.service.DeleteWallet(c.Context(), c.Params("id")); err != nil {
		return fail(c, fiber.StatusBadRequest, err.Error())
	}
	return c.JSON(map[string]any{"success": true})
}

// ---------------------------------------------------------------------------
// Transactions
// ---------------------------------------------------------------------------

func (h *Handler) ListTransactions(c *fiber.Ctx) error {
	shopID, ok := resolveShop(c)
	if !ok {
		return nil
	}
	transactions, err := h.service.ListTransactions(c.Context(), shopID)
	if err != nil {
		return fail(c, fiber.StatusInternalServerError, err.Error())
	}
	return c.JSON(map[string]any{"success": true, "data": transactions})
}

func (h *Handler) CreateTransaction(c *fiber.Ctx) error {
	shopID, ok := resolveShop(c)
	if !ok {
		return nil
	}
	var dto CreateTransactionDTO
	if err := c.BodyParser(&dto); err != nil {
		return fail(c, fiber.StatusBadRequest, "Invalid request body")
	}
	if err := dto.Validate(h.validate); err != nil {
		return fail(c, fiber.StatusBadRequest, err.Error())
	}
	transaction, err := h.service.CreateTransaction(c.Context(), shopID, &dto)
	if err != nil {
		return fail(c, fiber.StatusBadRequest, err.Error())
	}
	return c.Status(fiber.StatusCreated).JSON(map[string]any{"success": true, "data": transaction})
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