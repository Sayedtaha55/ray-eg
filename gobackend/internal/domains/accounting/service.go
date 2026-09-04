package accounting

import "context"

// Service handles accounting business logic.
type Service struct {
	repo *Repository
}

// NewService creates a new accounting service.
func NewService(repo *Repository) *Service { return &Service{repo: repo} }

// Accounts
func (s *Service) ListAccounts(ctx context.Context, shopID string) ([]AccountWithBalance, error) {
	if err := s.repo.EnsureDefaultCOA(ctx, shopID); err != nil {
		return nil, err
	}
	return s.repo.ListAccounts(ctx, shopID)
}
func (s *Service) CreateAccount(ctx context.Context, shopID string, dto *CreateAccountDTO) (*Account, error) {
	return s.repo.CreateAccount(ctx, shopID, dto)
}
func (s *Service) UpdateAccount(ctx context.Context, id string, dto *UpdateAccountDTO) (*Account, error) {
	return s.repo.UpdateAccount(ctx, id, dto)
}
func (s *Service) DeleteAccount(ctx context.Context, id string) error {
	has, err := s.repo.AccountHasJournalLines(ctx, id)
	if err != nil {
		return err
	}
	if has {
		return ErrAccountInUse
	}
	return s.repo.DeleteAccount(ctx, id)
}

// Journal
func (s *Service) ListJournalEntries(ctx context.Context, shopID, status, from, to string) ([]JournalEntry, error) {
	return s.repo.ListJournalEntries(ctx, shopID, status, from, to)
}
func (s *Service) GetJournalEntry(ctx context.Context, id string) (*JournalEntry, error) {
	return s.repo.GetJournalEntry(ctx, id)
}
func (s *Service) CreateJournalEntry(ctx context.Context, shopID, userID string, dto *CreateJournalEntryDTO) (*JournalEntry, error) {
	if err := validateBalanced(dto.Lines); err != nil {
		return nil, err
	}
	return s.repo.CreateJournalEntry(ctx, shopID, userID, dto)
}
func (s *Service) UpdateJournalEntry(ctx context.Context, id string, dto *UpdateJournalEntryDTO) (*JournalEntry, error) {
	if len(dto.Lines) > 0 {
		if err := validateBalancedLines(dto.Lines); err != nil {
			return nil, err
		}
	}
	return s.repo.UpdateJournalEntry(ctx, id, dto)
}
func (s *Service) PostJournalEntry(ctx context.Context, id, userID string) (*JournalEntry, error) {
	return s.repo.PostJournalEntry(ctx, id, userID)
}
func (s *Service) ReverseJournalEntry(ctx context.Context, id, userID string) (*JournalEntry, error) {
	return s.repo.ReverseJournalEntry(ctx, id, userID)
}
func (s *Service) DeleteJournalEntry(ctx context.Context, id string) error {
	return s.repo.DeleteJournalEntry(ctx, id)
}

// Reports
func (s *Service) TrialBalance(ctx context.Context, shopID, from, to string) (*TrialBalance, error) {
	return s.repo.TrialBalance(ctx, shopID, from, to)
}

// IncomeStatement builds the P&L from posted entries in a period.
func (s *Service) IncomeStatement(ctx context.Context, shopID, from, to string) (*IncomeStatement, error) {
	accounts, err := s.repo.ListAccounts(ctx, shopID)
	if err != nil {
		return nil, err
	}
	totals, err := s.repo.AccountTotals(ctx, shopID, from, to)
	if err != nil {
		return nil, err
	}
	is := &IncomeStatement{ShopID: shopID, FromDate: from, ToDate: to}
	for _, a := range accounts {
		if a.IsGroup {
			continue
		}
		t, ok := totals[a.ID]
		if !ok {
			continue
		}
		var amount float64
		switch a.Type {
		case "revenue":
			amount = t[1] - t[0] // credit - debit
			if amount == 0 {
				continue
			}
			is.Revenue = append(is.Revenue, StatementLine{Code: a.Code, Name: a.Name, Type: a.Type, Amount: amount})
			is.TotalRevenue += amount
		case "expense":
			amount = t[0] - t[1] // debit - credit
			if amount == 0 {
				continue
			}
			is.Expenses = append(is.Expenses, StatementLine{Code: a.Code, Name: a.Name, Type: a.Type, Amount: amount})
			is.TotalExpenses += amount
		}
	}
	is.NetProfit = is.TotalRevenue - is.TotalExpenses
	return is, nil
}

// BalanceSheet builds the financial position report as of a date.
func (s *Service) BalanceSheet(ctx context.Context, shopID, asOf string) (*BalanceSheet, error) {
	accounts, err := s.repo.ListAccounts(ctx, shopID)
	if err != nil {
		return nil, err
	}
	totals, err := s.repo.AccountTotals(ctx, shopID, "", asOf)
	if err != nil {
		return nil, err
	}
	bs := &BalanceSheet{ShopID: shopID, AsOf: asOf}
	var retainedEarnings float64
	for _, a := range accounts {
		if a.IsGroup {
			continue
		}
		t, ok := totals[a.ID]
		if !ok {
			continue
		}
		var amount float64
		switch a.Type {
		case "asset":
			amount = a.OpeningBalance + t[0] - t[1]
			bs.Assets = append(bs.Assets, StatementLine{Code: a.Code, Name: a.Name, Type: a.Type, Amount: amount})
			bs.TotalAssets += amount
		case "liability":
			amount = a.OpeningBalance + t[1] - t[0]
			bs.Liabilities = append(bs.Liabilities, StatementLine{Code: a.Code, Name: a.Name, Type: a.Type, Amount: amount})
			bs.TotalLiabilities += amount
		case "equity":
			amount = a.OpeningBalance + t[1] - t[0]
			bs.Equity = append(bs.Equity, StatementLine{Code: a.Code, Name: a.Name, Type: a.Type, Amount: amount})
			bs.TotalEquity += amount
		case "revenue":
			retainedEarnings += t[1] - t[0]
		case "expense":
			retainedEarnings -= t[0] - t[1]
		}
	}
	bs.NetProfit = retainedEarnings
	bs.TotalEquity += retainedEarnings
	bs.TotalAssets = 0
	for _, l := range bs.Assets {
		bs.TotalAssets += l.Amount
	}
	bs.IsBalanced = absEq(bs.TotalAssets, bs.TotalLiabilities+bs.TotalEquity)
	return bs, nil
}

// validateBalanced ensures a new entry has both sides and is balanced.
func validateBalanced(lines []JournalLineInput) error {
	var d, c float64
	for _, l := range lines {
		if l.Debit > 0 && l.Credit > 0 {
			return ErrLineBothSides
		}
		if l.Debit == 0 && l.Credit == 0 {
			return ErrLineEmpty
		}
		d += l.Debit
		c += l.Credit
	}
	if d == 0 || c == 0 {
		return ErrNoBothSides
	}
	if !absEq(d, c) {
		return ErrUnbalanced
	}
	return nil
}

func validateBalancedLines(lines []JournalLineInput) error {
	var d, c float64
	for _, l := range lines {
		d += l.Debit
		c += l.Credit
	}
	if d == 0 || c == 0 {
		return ErrNoBothSides
	}
	if !absEq(d, c) {
		return ErrUnbalanced
	}
	return nil
}