package finance

// Account represents a chart-of-accounts entry
type Account struct {
	ID        string  `json:"id"`
	ShopID    string  `json:"shop_id"`
	Code      string  `json:"code"`
	Name      string  `json:"name"`
	Type      string  `json:"type"`
	Balance   float64 `json:"balance"`
	Status    string  `json:"status"`
	CreatedAt string  `json:"created_at"`
}

// JournalEntry represents a single journal entry
type JournalEntry struct {
	ID          string  `json:"id"`
	ShopID      string  `json:"shop_id"`
	Date        string  `json:"date"`
	Description string  `json:"description"`
	Account     string  `json:"account"`
	Debit       float64 `json:"debit"`
	Credit      float64 `json:"credit"`
	Reference   string  `json:"reference"`
	CreatedAt   string  `json:"created_at"`
}

// Expense represents a single expense record
type Expense struct {
	ID          string  `json:"id"`
	ShopID      string  `json:"shop_id"`
	Category    string  `json:"category"`
	Amount      float64 `json:"amount"`
	Description string  `json:"description"`
	Date        string  `json:"date"`
	CreatedAt   string  `json:"created_at"`
}

// Tax represents a tax configuration
type Tax struct {
	ID        string  `json:"id"`
	ShopID    string  `json:"shop_id"`
	Name      string  `json:"name"`
	Rate      float64 `json:"rate"`
	Type      string  `json:"type"`
	AppliedTo string  `json:"appliedTo"`
	Status    string  `json:"status"`
	CreatedAt string  `json:"created_at"`
}

// Wallet represents a cash/bank/mobile wallet
type Wallet struct {
	ID        string  `json:"id"`
	ShopID    string  `json:"shop_id"`
	Name      string  `json:"name"`
	Type      string  `json:"type"`
	Balance   float64 `json:"balance"`
	Currency  string  `json:"currency"`
	Number    string  `json:"number"`
	Status    string  `json:"status"`
	CreatedAt string  `json:"created_at"`
}

// Transaction represents a wallet transaction (income/expense)
type Transaction struct {
	ID          string  `json:"id"`
	ShopID      string  `json:"shop_id"`
	WalletID    string  `json:"wallet_id"`
	Type        string  `json:"type"`
	Amount      float64 `json:"amount"`
	Description string  `json:"description"`
	Date        string  `json:"date"`
	Reference   string  `json:"reference"`
	CreatedAt   string  `json:"created_at"`
}

// CashflowSummary represents aggregated cashflow data
type CashflowSummary struct {
	ShopID      string             `json:"shop_id"`
	Inflows     float64            `json:"inflows"`
	Outflows    float64            `json:"outflows"`
	NetCashflow float64            `json:"net_cashflow"`
	Monthly     []CashflowMonthly  `json:"monthly"`
}

// CashflowMonthly represents a single month in the cashflow chart
type CashflowMonthly struct {
	Month    string  `json:"month"`
	Inflow   float64 `json:"inflow"`
	Outflow  float64 `json:"outflow"`
}

// ProfitSummary represents profit & margin analysis
type ProfitSummary struct {
	ShopID      string  `json:"shop_id"`
	Revenue     float64 `json:"revenue"`
	COGS        float64 `json:"cogs"`
	GrossProfit float64 `json:"gross_profit"`
	Margin      float64 `json:"margin"`
}

// RevenueSummary represents revenue stats
type RevenueSummary struct {
	ShopID        string  `json:"shop_id"`
	TotalRevenue  float64 `json:"total_revenue"`
	TodayRevenue  float64 `json:"today_revenue"`
	MonthRevenue  float64 `json:"month_revenue"`
	AvgOrder      float64 `json:"avg_order"`
	RecentOrders  []RevenueOrder `json:"recent_orders"`
}

// RevenueOrder represents a recent order in the revenue page
type RevenueOrder struct {
	ID           string  `json:"id"`
	OrderNumber  string  `json:"order_number"`
	CustomerName string  `json:"customer_name"`
	Total        float64 `json:"total"`
}
