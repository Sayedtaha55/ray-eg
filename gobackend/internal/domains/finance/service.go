package finance

import "context"

// Service handles Finance business logic
type Service struct {
	repo *Repository
}

// NewService creates a new Finance service
func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

// Accounts
func (s *Service) ListAccounts(ctx context.Context, shopID string) ([]Account, error) {
	return s.repo.ListAccounts(ctx, shopID)
}
func (s *Service) CreateAccount(ctx context.Context, shopID string, dto *CreateAccountDTO) (*Account, error) {
	return s.repo.CreateAccount(ctx, shopID, dto)
}
func (s *Service) UpdateAccount(ctx context.Context, accountID string, dto *UpdateAccountDTO) (*Account, error) {
	return s.repo.UpdateAccount(ctx, accountID, dto)
}
func (s *Service) DeleteAccount(ctx context.Context, accountID string) error {
	return s.repo.DeleteAccount(ctx, accountID)
}

// Journal Entries
func (s *Service) ListJournalEntries(ctx context.Context, shopID string) ([]JournalEntry, error) {
	return s.repo.ListJournalEntries(ctx, shopID)
}
func (s *Service) CreateJournalEntry(ctx context.Context, shopID string, dto *CreateJournalEntryDTO) (*JournalEntry, error) {
	return s.repo.CreateJournalEntry(ctx, shopID, dto)
}
func (s *Service) DeleteJournalEntry(ctx context.Context, entryID string) error {
	return s.repo.DeleteJournalEntry(ctx, entryID)
}

// Expenses
func (s *Service) ListExpenses(ctx context.Context, shopID string) ([]Expense, error) {
	return s.repo.ListExpenses(ctx, shopID)
}
func (s *Service) CreateExpense(ctx context.Context, shopID string, dto *CreateExpenseDTO) (*Expense, error) {
	return s.repo.CreateExpense(ctx, shopID, dto)
}
func (s *Service) UpdateExpense(ctx context.Context, expenseID string, dto *UpdateExpenseDTO) (*Expense, error) {
	return s.repo.UpdateExpense(ctx, expenseID, dto)
}
func (s *Service) DeleteExpense(ctx context.Context, expenseID string) error {
	return s.repo.DeleteExpense(ctx, expenseID)
}

// Taxes
func (s *Service) ListTaxes(ctx context.Context, shopID string) ([]Tax, error) {
	return s.repo.ListTaxes(ctx, shopID)
}
func (s *Service) CreateTax(ctx context.Context, shopID string, dto *CreateTaxDTO) (*Tax, error) {
	return s.repo.CreateTax(ctx, shopID, dto)
}
func (s *Service) UpdateTax(ctx context.Context, taxID string, dto *UpdateTaxDTO) (*Tax, error) {
	return s.repo.UpdateTax(ctx, taxID, dto)
}
func (s *Service) DeleteTax(ctx context.Context, taxID string) error {
	return s.repo.DeleteTax(ctx, taxID)
}

// Wallets
func (s *Service) ListWallets(ctx context.Context, shopID string) ([]Wallet, error) {
	return s.repo.ListWallets(ctx, shopID)
}
func (s *Service) CreateWallet(ctx context.Context, shopID string, dto *CreateWalletDTO) (*Wallet, error) {
	return s.repo.CreateWallet(ctx, shopID, dto)
}
func (s *Service) UpdateWallet(ctx context.Context, walletID string, dto *UpdateWalletDTO) (*Wallet, error) {
	return s.repo.UpdateWallet(ctx, walletID, dto)
}
func (s *Service) DeleteWallet(ctx context.Context, walletID string) error {
	return s.repo.DeleteWallet(ctx, walletID)
}

// Transactions
func (s *Service) ListTransactions(ctx context.Context, shopID string) ([]Transaction, error) {
	return s.repo.ListTransactions(ctx, shopID)
}
func (s *Service) CreateTransaction(ctx context.Context, shopID string, dto *CreateTransactionDTO) (*Transaction, error) {
	return s.repo.CreateTransaction(ctx, shopID, dto)
}

// Reports
func (s *Service) GetCashflowSummary(ctx context.Context, shopID string) (*CashflowSummary, error) {
	return s.repo.GetCashflowSummary(ctx, shopID)
}
func (s *Service) GetProfitSummary(ctx context.Context, shopID string) (*ProfitSummary, error) {
	return s.repo.GetProfitSummary(ctx, shopID)
}
func (s *Service) GetRevenueSummary(ctx context.Context, shopID string) (*RevenueSummary, error) {
	return s.repo.GetRevenueSummary(ctx, shopID)
}
