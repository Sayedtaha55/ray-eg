package accounting

// Account is a chart-of-accounts node (hierarchical).
type Account struct {
	ID             string  `json:"id"`
	ShopID         string  `json:"shop_id"`
	Code           string  `json:"code"`
	Name           string  `json:"name"`
	Type           string  `json:"type"`
	ParentID       *string `json:"parent_id"`
	IsGroup        bool    `json:"is_group"`
	IsSystem       bool    `json:"is_system"`
	OpeningBalance float64 `json:"opening_balance"`
	Status         string  `json:"status"`
	CreatedAt      string  `json:"created_at"`
}

// AccountWithBalance adds computed balances on top of Account.
type AccountWithBalance struct {
	Account
	DebitBalance  float64 `json:"debit_balance"`
	CreditBalance float64 `json:"credit_balance"`
}

// JournalLine is one leg of a journal entry.
type JournalLine struct {
	ID          string  `json:"id"`
	EntryID     string  `json:"entry_id"`
	AccountID   string  `json:"account_id"`
	AccountCode string  `json:"account_code"`
	AccountName string  `json:"account_name"`
	Description string  `json:"description"`
	Debit       float64 `json:"debit"`
	Credit      float64 `json:"credit"`
	LineNo      int     `json:"line_no"`
}

// JournalEntry is a balanced double-entry document.
type JournalEntry struct {
	ID                 string        `json:"id"`
	ShopID             string        `json:"shop_id"`
	Number             string        `json:"number"`
	EntryDate          string        `json:"entry_date"`
	Description        string        `json:"description"`
	Reference          string        `json:"reference"`
	Status             string        `json:"status"`
	TotalDebit         float64       `json:"total_debit"`
	TotalCredit        float64       `json:"total_credit"`
	PostedAt           string        `json:"posted_at"`
	PostedBy           string        `json:"posted_by"`
	ReversedByEntryID  string        `json:"reversed_by_entry_id"`
	CreatedBy          string        `json:"created_by"`
	CreatedAt          string        `json:"created_at"`
	Lines              []JournalLine `json:"lines,omitempty"`
}

// TrialBalanceRow is one account row of the trial balance report.
type TrialBalanceRow struct {
	AccountID    string  `json:"account_id"`
	Code         string  `json:"code"`
	Name         string  `json:"name"`
	Type         string  `json:"type"`
	DebitTotal   float64 `json:"debit_total"`
	CreditTotal  float64 `json:"credit_total"`
	DebitBalance float64 `json:"debit_balance"`
	CreditBalance float64 `json:"credit_balance"`
}

// TrialBalance is the full report payload.
type TrialBalance struct {
	ShopID       string            `json:"shop_id"`
	FromDate     string            `json:"from_date"`
	ToDate       string            `json:"to_date"`
	Rows         []TrialBalanceRow `json:"rows"`
	TotalDebit   float64           `json:"total_debit"`
	TotalCredit  float64           `json:"total_credit"`
	IsBalanced   bool              `json:"is_balanced"`
}

// StatementLine is a line in income statement / balance sheet.
type StatementLine struct {
	Code    string  `json:"code"`
	Name    string  `json:"name"`
	Type    string  `json:"type"`
	Amount  float64 `json:"amount"`
}

// IncomeStatement is the P&L report.
type IncomeStatement struct {
	ShopID      string          `json:"shop_id"`
	FromDate    string          `json:"from_date"`
	ToDate      string          `json:"to_date"`
	Revenue     []StatementLine `json:"revenue"`
	Expenses    []StatementLine `json:"expenses"`
	TotalRevenue float64        `json:"total_revenue"`
	TotalExpenses float64       `json:"total_expenses"`
	NetProfit   float64         `json:"net_profit"`
}

// BalanceSheet is the financial position report.
type BalanceSheet struct {
	ShopID        string          `json:"shop_id"`
	AsOf          string          `json:"as_of"`
	Assets        []StatementLine `json:"assets"`
	Liabilities   []StatementLine `json:"liabilities"`
	Equity        []StatementLine `json:"equity"`
	NetProfit     float64         `json:"net_profit"`
	TotalAssets   float64         `json:"total_assets"`
	TotalLiabilities float64      `json:"total_liabilities"`
	TotalEquity   float64         `json:"total_equity"`
	IsBalanced    bool            `json:"is_balanced"`
}