package finance

import (
	"context"
	"fmt"
	"time"

	"github.com/Sayedtaha55/ray-eg/gobackend/internal/platform/db"
)

// Repository handles database operations for the Finance module
type Repository struct {
	pool *db.Pool
}

// NewRepository creates a new Finance repository
func NewRepository(pool *db.Pool) *Repository {
	return &Repository{pool: pool}
}

// ---------------------------------------------------------------------------
// Accounts
// ---------------------------------------------------------------------------

func (r *Repository) ListAccounts(ctx context.Context, shopID string) ([]Account, error) {
	rows, err := r.pool.Query(ctx,
		`SELECT id, shop_id, code, name, type, balance, status, created_at
		 FROM fin_accounts WHERE shop_id = $1 ORDER BY code ASC`, shopID)
	if err != nil {
		return nil, fmt.Errorf("failed to list accounts: %w", err)
	}
	defer rows.Close()

	accounts := make([]Account, 0)
	for rows.Next() {
		var a Account
		var createdAt time.Time
		if err := rows.Scan(&a.ID, &a.ShopID, &a.Code, &a.Name, &a.Type, &a.Balance, &a.Status, &createdAt); err != nil {
			continue
		}
		a.CreatedAt = createdAt.Format(time.RFC3339)
		accounts = append(accounts, a)
	}
	return accounts, nil
}

func (r *Repository) CreateAccount(ctx context.Context, shopID string, dto *CreateAccountDTO) (*Account, error) {
	accountType := dto.Type
	if accountType == "" {
		accountType = "asset"
	}
	status := dto.Status
	if status == "" {
		status = "active"
	}
	var a Account
	var createdAt time.Time
	err := r.pool.QueryRow(ctx,
		`INSERT INTO fin_accounts (shop_id, code, name, type, balance, status)
		 VALUES ($1, $2, $3, $4, $5, $6)
		 RETURNING id, shop_id, code, name, type, balance, status, created_at`,
		shopID, dto.Code, dto.Name, accountType, dto.Balance, status).
		Scan(&a.ID, &a.ShopID, &a.Code, &a.Name, &a.Type, &a.Balance, &a.Status, &createdAt)
	if err != nil {
		return nil, fmt.Errorf("failed to create account: %w", err)
	}
	a.CreatedAt = createdAt.Format(time.RFC3339)
	return &a, nil
}

func (r *Repository) UpdateAccount(ctx context.Context, accountID string, dto *UpdateAccountDTO) (*Account, error) {
	if dto.Name != nil {
		_, _ = r.pool.Exec(ctx, "UPDATE fin_accounts SET name = $2, updated_at = NOW() WHERE id = $1", accountID, *dto.Name)
	}
	if dto.Type != nil {
		_, _ = r.pool.Exec(ctx, "UPDATE fin_accounts SET type = $2, updated_at = NOW() WHERE id = $1", accountID, *dto.Type)
	}
	if dto.Balance != nil {
		_, _ = r.pool.Exec(ctx, "UPDATE fin_accounts SET balance = $2, updated_at = NOW() WHERE id = $1", accountID, *dto.Balance)
	}
	if dto.Status != nil {
		_, _ = r.pool.Exec(ctx, "UPDATE fin_accounts SET status = $2, updated_at = NOW() WHERE id = $1", accountID, *dto.Status)
	}
	return r.getAccount(ctx, accountID)
}

func (r *Repository) getAccount(ctx context.Context, accountID string) (*Account, error) {
	var a Account
	var createdAt time.Time
	err := r.pool.QueryRow(ctx,
		`SELECT id, shop_id, code, name, type, balance, status, created_at
		 FROM fin_accounts WHERE id = $1`, accountID).
		Scan(&a.ID, &a.ShopID, &a.Code, &a.Name, &a.Type, &a.Balance, &a.Status, &createdAt)
	if err != nil {
		return nil, err
	}
	a.CreatedAt = createdAt.Format(time.RFC3339)
	return &a, nil
}

func (r *Repository) DeleteAccount(ctx context.Context, accountID string) error {
	_, err := r.pool.Exec(ctx, "DELETE FROM fin_accounts WHERE id = $1", accountID)
	return err
}

// ---------------------------------------------------------------------------
// Journal Entries
// ---------------------------------------------------------------------------

func (r *Repository) ListJournalEntries(ctx context.Context, shopID string) ([]JournalEntry, error) {
	rows, err := r.pool.Query(ctx,
		`SELECT id, shop_id, date::text, description, COALESCE(account,''), debit, credit,
		        COALESCE(reference,''), created_at
		 FROM fin_journal_entries WHERE shop_id = $1 ORDER BY date DESC, created_at DESC`, shopID)
	if err != nil {
		return nil, fmt.Errorf("failed to list journal entries: %w", err)
	}
	defer rows.Close()

	entries := make([]JournalEntry, 0)
	for rows.Next() {
		var e JournalEntry
		var createdAt time.Time
		if err := rows.Scan(&e.ID, &e.ShopID, &e.Date, &e.Description, &e.Account,
			&e.Debit, &e.Credit, &e.Reference, &createdAt); err != nil {
			continue
		}
		e.CreatedAt = createdAt.Format(time.RFC3339)
		entries = append(entries, e)
	}
	return entries, nil
}

func (r *Repository) CreateJournalEntry(ctx context.Context, shopID string, dto *CreateJournalEntryDTO) (*JournalEntry, error) {
	date := dto.Date
	if date == "" {
		date = time.Now().Format("2006-01-02")
	}
	var e JournalEntry
	var createdAt time.Time
	err := r.pool.QueryRow(ctx,
		`INSERT INTO fin_journal_entries (shop_id, date, description, account, debit, credit, reference)
		 VALUES ($1, $2::date, $3, $4, $5, $6, $7)
		 RETURNING id, shop_id, date::text, description, COALESCE(account,''), debit, credit,
		           COALESCE(reference,''), created_at`,
		shopID, date, dto.Description, dto.Account, dto.Debit, dto.Credit, dto.Reference).
		Scan(&e.ID, &e.ShopID, &e.Date, &e.Description, &e.Account,
			&e.Debit, &e.Credit, &e.Reference, &createdAt)
	if err != nil {
		return nil, fmt.Errorf("failed to create journal entry: %w", err)
	}
	e.CreatedAt = createdAt.Format(time.RFC3339)
	return &e, nil
}

func (r *Repository) DeleteJournalEntry(ctx context.Context, entryID string) error {
	_, err := r.pool.Exec(ctx, "DELETE FROM fin_journal_entries WHERE id = $1", entryID)
	return err
}

// ---------------------------------------------------------------------------
// Expenses
// ---------------------------------------------------------------------------

func (r *Repository) ListExpenses(ctx context.Context, shopID string) ([]Expense, error) {
	rows, err := r.pool.Query(ctx,
		`SELECT id, shop_id, category, amount, COALESCE(description,''), date::text, created_at
		 FROM fin_expenses WHERE shop_id = $1 ORDER BY date DESC, created_at DESC`, shopID)
	if err != nil {
		return nil, fmt.Errorf("failed to list expenses: %w", err)
	}
	defer rows.Close()

	expenses := make([]Expense, 0)
	for rows.Next() {
		var e Expense
		var createdAt time.Time
		if err := rows.Scan(&e.ID, &e.ShopID, &e.Category, &e.Amount, &e.Description, &e.Date, &createdAt); err != nil {
			continue
		}
		e.CreatedAt = createdAt.Format(time.RFC3339)
		expenses = append(expenses, e)
	}
	return expenses, nil
}

func (r *Repository) CreateExpense(ctx context.Context, shopID string, dto *CreateExpenseDTO) (*Expense, error) {
	category := dto.Category
	if category == "" {
		category = "other"
	}
	date := dto.Date
	if date == "" {
		date = time.Now().Format("2006-01-02")
	}
	var e Expense
	var createdAt time.Time
	err := r.pool.QueryRow(ctx,
		`INSERT INTO fin_expenses (shop_id, category, amount, description, date)
		 VALUES ($1, $2, $3, $4, $5::date)
		 RETURNING id, shop_id, category, amount, COALESCE(description,''), date::text, created_at`,
		shopID, category, dto.Amount, dto.Description, date).
		Scan(&e.ID, &e.ShopID, &e.Category, &e.Amount, &e.Description, &e.Date, &createdAt)
	if err != nil {
		return nil, fmt.Errorf("failed to create expense: %w", err)
	}
	e.CreatedAt = createdAt.Format(time.RFC3339)
	return &e, nil
}

func (r *Repository) UpdateExpense(ctx context.Context, expenseID string, dto *UpdateExpenseDTO) (*Expense, error) {
	if dto.Category != nil {
		_, _ = r.pool.Exec(ctx, "UPDATE fin_expenses SET category = $2 WHERE id = $1", expenseID, *dto.Category)
	}
	if dto.Amount != nil {
		_, _ = r.pool.Exec(ctx, "UPDATE fin_expenses SET amount = $2 WHERE id = $1", expenseID, *dto.Amount)
	}
	if dto.Description != nil {
		_, _ = r.pool.Exec(ctx, "UPDATE fin_expenses SET description = $2 WHERE id = $1", expenseID, *dto.Description)
	}
	if dto.Date != nil {
		_, _ = r.pool.Exec(ctx, "UPDATE fin_expenses SET date = $2::date WHERE id = $1", expenseID, *dto.Date)
	}
	var e Expense
	var createdAt time.Time
	err := r.pool.QueryRow(ctx,
		`SELECT id, shop_id, category, amount, COALESCE(description,''), date::text, created_at
		 FROM fin_expenses WHERE id = $1`, expenseID).
		Scan(&e.ID, &e.ShopID, &e.Category, &e.Amount, &e.Description, &e.Date, &createdAt)
	if err != nil {
		return nil, err
	}
	e.CreatedAt = createdAt.Format(time.RFC3339)
	return &e, nil
}

func (r *Repository) DeleteExpense(ctx context.Context, expenseID string) error {
	_, err := r.pool.Exec(ctx, "DELETE FROM fin_expenses WHERE id = $1", expenseID)
	return err
}

// ---------------------------------------------------------------------------
// Taxes
// ---------------------------------------------------------------------------

func (r *Repository) ListTaxes(ctx context.Context, shopID string) ([]Tax, error) {
	rows, err := r.pool.Query(ctx,
		`SELECT id, shop_id, name, rate, type, COALESCE(applied_to,''), status, created_at
		 FROM fin_taxes WHERE shop_id = $1 ORDER BY created_at ASC`, shopID)
	if err != nil {
		return nil, fmt.Errorf("failed to list taxes: %w", err)
	}
	defer rows.Close()

	taxes := make([]Tax, 0)
	for rows.Next() {
		var tx Tax
		var createdAt time.Time
		if err := rows.Scan(&tx.ID, &tx.ShopID, &tx.Name, &tx.Rate, &tx.Type, &tx.AppliedTo, &tx.Status, &createdAt); err != nil {
			continue
		}
		tx.CreatedAt = createdAt.Format(time.RFC3339)
		taxes = append(taxes, tx)
	}
	return taxes, nil
}

func (r *Repository) CreateTax(ctx context.Context, shopID string, dto *CreateTaxDTO) (*Tax, error) {
	taxType := dto.Type
	if taxType == "" {
		taxType = "inclusive"
	}
	status := dto.Status
	if status == "" {
		status = "active"
	}
	var tx Tax
	var createdAt time.Time
	err := r.pool.QueryRow(ctx,
		`INSERT INTO fin_taxes (shop_id, name, rate, type, applied_to, status)
		 VALUES ($1, $2, $3, $4, $5, $6)
		 RETURNING id, shop_id, name, rate, type, COALESCE(applied_to,''), status, created_at`,
		shopID, dto.Name, dto.Rate, taxType, dto.AppliedTo, status).
		Scan(&tx.ID, &tx.ShopID, &tx.Name, &tx.Rate, &tx.Type, &tx.AppliedTo, &tx.Status, &createdAt)
	if err != nil {
		return nil, fmt.Errorf("failed to create tax: %w", err)
	}
	tx.CreatedAt = createdAt.Format(time.RFC3339)
	return &tx, nil
}

func (r *Repository) UpdateTax(ctx context.Context, taxID string, dto *UpdateTaxDTO) (*Tax, error) {
	if dto.Name != nil {
		_, _ = r.pool.Exec(ctx, "UPDATE fin_taxes SET name = $2, updated_at = NOW() WHERE id = $1", taxID, *dto.Name)
	}
	if dto.Rate != nil {
		_, _ = r.pool.Exec(ctx, "UPDATE fin_taxes SET rate = $2, updated_at = NOW() WHERE id = $1", taxID, *dto.Rate)
	}
	if dto.Type != nil {
		_, _ = r.pool.Exec(ctx, "UPDATE fin_taxes SET type = $2, updated_at = NOW() WHERE id = $1", taxID, *dto.Type)
	}
	if dto.AppliedTo != nil {
		_, _ = r.pool.Exec(ctx, "UPDATE fin_taxes SET applied_to = $2, updated_at = NOW() WHERE id = $1", taxID, *dto.AppliedTo)
	}
	if dto.Status != nil {
		_, _ = r.pool.Exec(ctx, "UPDATE fin_taxes SET status = $2, updated_at = NOW() WHERE id = $1", taxID, *dto.Status)
	}
	var tx Tax
	var createdAt time.Time
	err := r.pool.QueryRow(ctx,
		`SELECT id, shop_id, name, rate, type, COALESCE(applied_to,''), status, created_at
		 FROM fin_taxes WHERE id = $1`, taxID).
		Scan(&tx.ID, &tx.ShopID, &tx.Name, &tx.Rate, &tx.Type, &tx.AppliedTo, &tx.Status, &createdAt)
	if err != nil {
		return nil, err
	}
	tx.CreatedAt = createdAt.Format(time.RFC3339)
	return &tx, nil
}

func (r *Repository) DeleteTax(ctx context.Context, taxID string) error {
	_, err := r.pool.Exec(ctx, "DELETE FROM fin_taxes WHERE id = $1", taxID)
	return err
}

// ---------------------------------------------------------------------------
// Wallets
// ---------------------------------------------------------------------------

func (r *Repository) ListWallets(ctx context.Context, shopID string) ([]Wallet, error) {
	rows, err := r.pool.Query(ctx,
		`SELECT id, shop_id, name, type, balance, currency, COALESCE(number,''), status, created_at
		 FROM fin_wallets WHERE shop_id = $1 ORDER BY created_at ASC`, shopID)
	if err != nil {
		return nil, fmt.Errorf("failed to list wallets: %w", err)
	}
	defer rows.Close()

	wallets := make([]Wallet, 0)
	for rows.Next() {
		var w Wallet
		var createdAt time.Time
		if err := rows.Scan(&w.ID, &w.ShopID, &w.Name, &w.Type, &w.Balance, &w.Currency, &w.Number, &w.Status, &createdAt); err != nil {
			continue
		}
		w.CreatedAt = createdAt.Format(time.RFC3339)
		wallets = append(wallets, w)
	}
	return wallets, nil
}

func (r *Repository) CreateWallet(ctx context.Context, shopID string, dto *CreateWalletDTO) (*Wallet, error) {
	walletType := dto.Type
	if walletType == "" {
		walletType = "cash"
	}
	currency := dto.Currency
	if currency == "" {
		currency = "EGP"
	}
	status := dto.Status
	if status == "" {
		status = "active"
	}
	var w Wallet
	var createdAt time.Time
	err := r.pool.QueryRow(ctx,
		`INSERT INTO fin_wallets (shop_id, name, type, balance, currency, number, status)
		 VALUES ($1, $2, $3, $4, $5, $6, $7)
		 RETURNING id, shop_id, name, type, balance, currency, COALESCE(number,''), status, created_at`,
		shopID, dto.Name, walletType, dto.Balance, currency, dto.Number, status).
		Scan(&w.ID, &w.ShopID, &w.Name, &w.Type, &w.Balance, &w.Currency, &w.Number, &w.Status, &createdAt)
	if err != nil {
		return nil, fmt.Errorf("failed to create wallet: %w", err)
	}
	w.CreatedAt = createdAt.Format(time.RFC3339)
	return &w, nil
}

func (r *Repository) UpdateWallet(ctx context.Context, walletID string, dto *UpdateWalletDTO) (*Wallet, error) {
	if dto.Name != nil {
		_, _ = r.pool.Exec(ctx, "UPDATE fin_wallets SET name = $2, updated_at = NOW() WHERE id = $1", walletID, *dto.Name)
	}
	if dto.Type != nil {
		_, _ = r.pool.Exec(ctx, "UPDATE fin_wallets SET type = $2, updated_at = NOW() WHERE id = $1", walletID, *dto.Type)
	}
	if dto.Balance != nil {
		_, _ = r.pool.Exec(ctx, "UPDATE fin_wallets SET balance = $2, updated_at = NOW() WHERE id = $1", walletID, *dto.Balance)
	}
	if dto.Currency != nil {
		_, _ = r.pool.Exec(ctx, "UPDATE fin_wallets SET currency = $2, updated_at = NOW() WHERE id = $1", walletID, *dto.Currency)
	}
	if dto.Number != nil {
		_, _ = r.pool.Exec(ctx, "UPDATE fin_wallets SET number = $2, updated_at = NOW() WHERE id = $1", walletID, *dto.Number)
	}
	if dto.Status != nil {
		_, _ = r.pool.Exec(ctx, "UPDATE fin_wallets SET status = $2, updated_at = NOW() WHERE id = $1", walletID, *dto.Status)
	}
	var w Wallet
	var createdAt time.Time
	err := r.pool.QueryRow(ctx,
		`SELECT id, shop_id, name, type, balance, currency, COALESCE(number,''), status, created_at
		 FROM fin_wallets WHERE id = $1`, walletID).
		Scan(&w.ID, &w.ShopID, &w.Name, &w.Type, &w.Balance, &w.Currency, &w.Number, &w.Status, &createdAt)
	if err != nil {
		return nil, err
	}
	w.CreatedAt = createdAt.Format(time.RFC3339)
	return &w, nil
}

func (r *Repository) DeleteWallet(ctx context.Context, walletID string) error {
	_, err := r.pool.Exec(ctx, "DELETE FROM fin_wallets WHERE id = $1", walletID)
	return err
}

// ---------------------------------------------------------------------------
// Transactions
// ---------------------------------------------------------------------------

func (r *Repository) ListTransactions(ctx context.Context, shopID string) ([]Transaction, error) {
	rows, err := r.pool.Query(ctx,
		`SELECT id, shop_id, COALESCE(wallet_id::text,''), type, amount,
		        COALESCE(description,''), date::text, COALESCE(reference,''), created_at
		 FROM fin_transactions WHERE shop_id = $1 ORDER BY date DESC, created_at DESC`, shopID)
	if err != nil {
		return nil, fmt.Errorf("failed to list transactions: %w", err)
	}
	defer rows.Close()

	txs := make([]Transaction, 0)
	for rows.Next() {
		var t Transaction
		var createdAt time.Time
		if err := rows.Scan(&t.ID, &t.ShopID, &t.WalletID, &t.Type, &t.Amount,
			&t.Description, &t.Date, &t.Reference, &createdAt); err != nil {
			continue
		}
		t.CreatedAt = createdAt.Format(time.RFC3339)
		txs = append(txs, t)
	}
	return txs, nil
}

func (r *Repository) CreateTransaction(ctx context.Context, shopID string, dto *CreateTransactionDTO) (*Transaction, error) {
	txType := dto.Type
	if txType == "" {
		txType = "income"
	}
	date := dto.Date
	if date == "" {
		date = time.Now().Format("2006-01-02")
	}
	var t Transaction
	var createdAt time.Time
	err := r.pool.QueryRow(ctx,
		`INSERT INTO fin_transactions (shop_id, wallet_id, type, amount, description, date, reference)
		 VALUES ($1, NULLIF($2,'')::uuid, $3, $4, $5, $6::date, $7)
		 RETURNING id, shop_id, COALESCE(wallet_id::text,''), type, amount,
		           COALESCE(description,''), date::text, COALESCE(reference,''), created_at`,
		shopID, dto.WalletID, txType, dto.Amount, dto.Description, date, dto.Reference).
		Scan(&t.ID, &t.ShopID, &t.WalletID, &t.Type, &t.Amount,
			&t.Description, &t.Date, &t.Reference, &createdAt)
	if err != nil {
		return nil, fmt.Errorf("failed to create transaction: %w", err)
	}
	t.CreatedAt = createdAt.Format(time.RFC3339)
	return &t, nil
}

// ---------------------------------------------------------------------------
// Aggregated reports (cashflow, profit, revenue) — derived from orders table
// ---------------------------------------------------------------------------

func (r *Repository) GetCashflowSummary(ctx context.Context, shopID string) (*CashflowSummary, error) {
	now := time.Now()
	sixMonthsAgo := now.AddDate(0, -5, 0)
	start := time.Date(sixMonthsAgo.Year(), sixMonthsAgo.Month(), 1, 0, 0, 0, 0, time.UTC)

	var inflows float64
	var outflows float64

	// Inflows from delivered orders
	_ = r.pool.QueryRow(ctx,
		`SELECT COALESCE(SUM(total), 0) FROM orders
		 WHERE shop_id = $1 AND created_at >= $2
		   AND status IN ('CONFIRMED','PREPARING','READY','DELIVERED')`,
		shopID, start).Scan(&inflows)

	// Outflows from expenses table
	_ = r.pool.QueryRow(ctx,
		"SELECT COALESCE(SUM(amount), 0) FROM fin_expenses WHERE shop_id = $1 AND date >= $2",
		shopID, start).Scan(&outflows)

	monthly := make([]CashflowMonthly, 0, 6)
	for i := 0; i < 6; i++ {
		mStart := start.AddDate(0, i, 0)
		mEnd := mStart.AddDate(0, 1, 0)
		var mIn float64
		var mOut float64
		_ = r.pool.QueryRow(ctx,
			`SELECT COALESCE(SUM(total), 0) FROM orders
			 WHERE shop_id = $1 AND created_at >= $2 AND created_at < $3
			   AND status IN ('CONFIRMED','PREPARING','READY','DELIVERED')`,
			shopID, mStart, mEnd).Scan(&mIn)
		_ = r.pool.QueryRow(ctx,
			"SELECT COALESCE(SUM(amount), 0) FROM fin_expenses WHERE shop_id = $1 AND date >= $2 AND date < $3",
			shopID, mStart, mEnd).Scan(&mOut)
		monthly = append(monthly, CashflowMonthly{
			Month:   mStart.Format("Jan"),
			Inflow:  round2(mIn),
			Outflow: round2(mOut),
		})
	}

	return &CashflowSummary{
		ShopID:      shopID,
		Inflows:     round2(inflows),
		Outflows:    round2(outflows),
		NetCashflow: round2(inflows - outflows),
		Monthly:     monthly,
	}, nil
}

func (r *Repository) GetProfitSummary(ctx context.Context, shopID string) (*ProfitSummary, error) {
	var revenue float64
	var cogs float64

	_ = r.pool.QueryRow(ctx,
		`SELECT COALESCE(SUM(total), 0) FROM orders
		 WHERE shop_id = $1 AND status IN ('CONFIRMED','PREPARING','READY','DELIVERED')`,
		shopID).Scan(&revenue)

	_ = r.pool.QueryRow(ctx,
		`SELECT COALESCE(SUM(oi.quantity * COALESCE(p.cost, p.cost_price, 0)), 0)
		 FROM order_items oi
		 JOIN orders o ON oi.order_id = o.id
		 JOIN products p ON oi.product_id = p.id
		 WHERE o.shop_id = $1 AND o.status IN ('CONFIRMED','PREPARING','READY','DELIVERED')`,
		shopID).Scan(&cogs)

	grossProfit := revenue - cogs
	margin := 0.0
	if revenue > 0 {
		margin = (grossProfit / revenue) * 100
	}

	return &ProfitSummary{
		ShopID:      shopID,
		Revenue:     round2(revenue),
		COGS:        round2(cogs),
		GrossProfit: round2(grossProfit),
		Margin:      round2(margin),
	}, nil
}

func (r *Repository) GetRevenueSummary(ctx context.Context, shopID string) (*RevenueSummary, error) {
	now := time.Now()
	todayStart := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, time.Local)
	monthStart := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, time.Local)

	var totalRevenue float64
	var todayRevenue float64
	var monthRevenue float64
	var orderCount int64

	_ = r.pool.QueryRow(ctx,
		`SELECT COALESCE(SUM(total), 0), COUNT(*) FROM orders
		 WHERE shop_id = $1 AND status IN ('CONFIRMED','PREPARING','READY','DELIVERED')`,
		shopID).Scan(&totalRevenue, &orderCount)
	_ = r.pool.QueryRow(ctx,
		`SELECT COALESCE(SUM(total), 0) FROM orders
		 WHERE shop_id = $1 AND created_at >= $2 AND status IN ('CONFIRMED','PREPARING','READY','DELIVERED')`,
		shopID, todayStart).Scan(&todayRevenue)
	_ = r.pool.QueryRow(ctx,
		`SELECT COALESCE(SUM(total), 0) FROM orders
		 WHERE shop_id = $1 AND created_at >= $2 AND status IN ('CONFIRMED','PREPARING','READY','DELIVERED')`,
		shopID, monthStart).Scan(&monthRevenue)

	avgOrder := 0.0
	if orderCount > 0 {
		avgOrder = totalRevenue / float64(orderCount)
	}

	// Recent orders
	rows, err := r.pool.Query(ctx,
		`SELECT o.id, COALESCE(o.order_number, o.id::text), COALESCE(o.customer_name, ''), o.total
		 FROM orders o
		 WHERE o.shop_id = $1 AND o.status IN ('CONFIRMED','PREPARING','READY','DELIVERED')
		 ORDER BY o.created_at DESC LIMIT 10`, shopID)
	recent := make([]RevenueOrder, 0)
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var ro RevenueOrder
			if err := rows.Scan(&ro.ID, &ro.OrderNumber, &ro.CustomerName, &ro.Total); err != nil {
				continue
			}
			recent = append(recent, ro)
		}
	}

	return &RevenueSummary{
		ShopID:       shopID,
		TotalRevenue: round2(totalRevenue),
		TodayRevenue: round2(todayRevenue),
		MonthRevenue: round2(monthRevenue),
		AvgOrder:     round2(avgOrder),
		RecentOrders: recent,
	}, nil
}

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

func round2(v float64) float64 {
	if v == 0 {
		return 0
	}
	return float64(int64(v*100+0.5)) / 100
}
