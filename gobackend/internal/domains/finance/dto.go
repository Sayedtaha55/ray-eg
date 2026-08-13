package finance

import "github.com/go-playground/validator/v10"

// ---------------------------------------------------------------------------
// Accounts
// ---------------------------------------------------------------------------

type CreateAccountDTO struct {
	Code   string  `json:"code" validate:"required,min=1,max=40"`
	Name   string  `json:"name" validate:"required,min=1,max=160"`
	Type   string  `json:"type,omitempty" validate:"omitempty,oneof=asset liability equity revenue expense"`
	Balance float64 `json:"balance,omitempty"`
	Status string  `json:"status,omitempty" validate:"omitempty,oneof=active inactive"`
}

func (r *CreateAccountDTO) Validate(v *validator.Validate) error { return v.Struct(r) }

type UpdateAccountDTO struct {
	Name   *string  `json:"name,omitempty" validate:"omitempty,min=1,max=160"`
	Type   *string  `json:"type,omitempty" validate:"omitempty,oneof=asset liability equity revenue expense"`
	Balance *float64 `json:"balance,omitempty"`
	Status *string  `json:"status,omitempty" validate:"omitempty,oneof=active inactive"`
}

func (r *UpdateAccountDTO) Validate(v *validator.Validate) error { return v.Struct(r) }

// ---------------------------------------------------------------------------
// Journal Entries
// ---------------------------------------------------------------------------

type CreateJournalEntryDTO struct {
	Date        string  `json:"date,omitempty"`
	Description string  `json:"description" validate:"required,min=1,max=240"`
	Account     string  `json:"account,omitempty" validate:"omitempty,max=160"`
	Debit       float64 `json:"debit,omitempty"`
	Credit      float64 `json:"credit,omitempty"`
	Reference   string  `json:"reference,omitempty" validate:"omitempty,max=80"`
}

func (r *CreateJournalEntryDTO) Validate(v *validator.Validate) error { return v.Struct(r) }

// ---------------------------------------------------------------------------
// Expenses
// ---------------------------------------------------------------------------

type CreateExpenseDTO struct {
	Category    string  `json:"category,omitempty" validate:"omitempty,max=40"`
	Amount      float64 `json:"amount" validate:"required,min=0"`
	Description string  `json:"description,omitempty"`
	Date        string  `json:"date,omitempty"`
}

func (r *CreateExpenseDTO) Validate(v *validator.Validate) error { return v.Struct(r) }

type UpdateExpenseDTO struct {
	Category    *string  `json:"category,omitempty" validate:"omitempty,max=40"`
	Amount      *float64 `json:"amount,omitempty" validate:"omitempty,min=0"`
	Description *string  `json:"description,omitempty"`
	Date        *string  `json:"date,omitempty"`
}

func (r *UpdateExpenseDTO) Validate(v *validator.Validate) error { return v.Struct(r) }

// ---------------------------------------------------------------------------
// Taxes
// ---------------------------------------------------------------------------

type CreateTaxDTO struct {
	Name      string  `json:"name" validate:"required,min=1,max=120"`
	Rate      float64 `json:"rate" validate:"required,min=0,max=100"`
	Type      string  `json:"type,omitempty" validate:"omitempty,oneof=inclusive exclusive"`
	AppliedTo string  `json:"appliedTo,omitempty" validate:"omitempty,max=160"`
	Status    string  `json:"status,omitempty" validate:"omitempty,oneof=active inactive"`
}

func (r *CreateTaxDTO) Validate(v *validator.Validate) error { return v.Struct(r) }

type UpdateTaxDTO struct {
	Name      *string  `json:"name,omitempty" validate:"omitempty,min=1,max=120"`
	Rate      *float64 `json:"rate,omitempty" validate:"omitempty,min=0,max=100"`
	Type      *string  `json:"type,omitempty" validate:"omitempty,oneof=inclusive exclusive"`
	AppliedTo *string  `json:"appliedTo,omitempty" validate:"omitempty,max=160"`
	Status    *string  `json:"status,omitempty" validate:"omitempty,oneof=active inactive"`
}

func (r *UpdateTaxDTO) Validate(v *validator.Validate) error { return v.Struct(r) }

// ---------------------------------------------------------------------------
// Wallets
// ---------------------------------------------------------------------------

type CreateWalletDTO struct {
	Name     string  `json:"name" validate:"required,min=1,max=120"`
	Type     string  `json:"type,omitempty" validate:"omitempty,oneof=cash bank mobile card"`
	Balance  float64 `json:"balance,omitempty"`
	Currency string  `json:"currency,omitempty" validate:"omitempty,max=10"`
	Number   string  `json:"number,omitempty" validate:"omitempty,max=80"`
	Status   string  `json:"status,omitempty" validate:"omitempty,oneof=active inactive"`
}

func (r *CreateWalletDTO) Validate(v *validator.Validate) error { return v.Struct(r) }

type UpdateWalletDTO struct {
	Name     *string  `json:"name,omitempty" validate:"omitempty,min=1,max=120"`
	Type     *string  `json:"type,omitempty" validate:"omitempty,oneof=cash bank mobile card"`
	Balance  *float64 `json:"balance,omitempty"`
	Currency *string  `json:"currency,omitempty" validate:"omitempty,max=10"`
	Number   *string  `json:"number,omitempty" validate:"omitempty,max=80"`
	Status   *string  `json:"status,omitempty" validate:"omitempty,oneof=active inactive"`
}

func (r *UpdateWalletDTO) Validate(v *validator.Validate) error { return v.Struct(r) }

// ---------------------------------------------------------------------------
// Transactions
// ---------------------------------------------------------------------------

type CreateTransactionDTO struct {
	WalletID    string  `json:"wallet_id,omitempty"`
	Type        string  `json:"type,omitempty" validate:"omitempty,oneof=income expense"`
	Amount      float64 `json:"amount" validate:"required,min=0"`
	Description string  `json:"description,omitempty" validate:"omitempty,max=240"`
	Date        string  `json:"date,omitempty"`
	Reference   string  `json:"reference,omitempty" validate:"omitempty,max=80"`
}

func (r *CreateTransactionDTO) Validate(v *validator.Validate) error { return v.Struct(r) }

// ---------------------------------------------------------------------------
// Responses
// ---------------------------------------------------------------------------

type AccountsResponse struct {
	Success bool      `json:"success"`
	Data    []Account `json:"data,omitempty"`
	Error   string    `json:"error,omitempty"`
}

type AccountResponse struct {
	Success bool    `json:"success"`
	Data    *Account `json:"data,omitempty"`
	Error   string  `json:"error,omitempty"`
}

type JournalResponse struct {
	Success bool           `json:"success"`
	Data    []JournalEntry `json:"data,omitempty"`
	Error   string         `json:"error,omitempty"`
}

type ExpensesResponse struct {
	Success bool      `json:"success"`
	Data    []Expense `json:"data,omitempty"`
	Error   string    `json:"error,omitempty"`
}

type ExpenseResponse struct {
	Success bool     `json:"success"`
	Data    *Expense `json:"data,omitempty"`
	Error   string   `json:"error,omitempty"`
}

type TaxesResponse struct {
	Success bool   `json:"success"`
	Data    []Tax  `json:"data,omitempty"`
	Error   string `json:"error,omitempty"`
}

type TaxResponse struct {
	Success bool   `json:"success"`
	Data    *Tax   `json:"data,omitempty"`
	Error   string `json:"error,omitempty"`
}

type WalletsResponse struct {
	Success bool      `json:"success"`
	Data    []Wallet  `json:"data,omitempty"`
	Error   string    `json:"error,omitempty"`
}

type WalletResponse struct {
	Success bool     `json:"success"`
	Data    *Wallet  `json:"data,omitempty"`
	Error   string   `json:"error,omitempty"`
}

type TransactionsResponse struct {
	Success bool         `json:"success"`
	Data    []Transaction `json:"data,omitempty"`
	Error   string       `json:"error,omitempty"`
}

type CashflowResponse struct {
	Success bool             `json:"success"`
	Data    *CashflowSummary `json:"data,omitempty"`
	Error   string           `json:"error,omitempty"`
}

type ProfitResponse struct {
	Success bool           `json:"success"`
	Data    *ProfitSummary `json:"data,omitempty"`
	Error   string         `json:"error,omitempty"`
}

type RevenueResponse struct {
	Success bool            `json:"success"`
	Data    *RevenueSummary `json:"data,omitempty"`
	Error   string          `json:"error,omitempty"`
}

type GenericResponse struct {
	Success bool   `json:"success"`
	Error   string `json:"error,omitempty"`
}
