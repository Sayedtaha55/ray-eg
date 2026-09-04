package accounting

import (
	"context"
	"fmt"
	"time"

	"github.com/Sayedtaha55/ray-eg/gobackend/internal/platform/db"
	"github.com/jackc/pgx/v5"
)

// Repository handles database operations for the accounting module.
type Repository struct {
	pool *db.Pool
}

// NewRepository creates a new accounting repository.
func NewRepository(pool *db.Pool) *Repository { return &Repository{pool: pool} }

// ---------------------------------------------------------------------------
// Default chart of accounts template (seeded per shop on first load)
// ---------------------------------------------------------------------------

type seedAccount struct {
	Code, Name, Type string
	Parent           string // parent code
	IsGroup          bool
}

var defaultCOA = []seedAccount{
	{"1000", "الأصول", "asset", "", true},
	{"1100", "الأصول المتداولة", "asset", "1000", true},
	{"1110", "النقدية بالصندوق", "asset", "1100", false},
	{"1120", "النقدية بالبنوك", "asset", "1100", false},
	{"1130", "العملاء والمدينون", "asset", "1100", false},
	{"1140", "المخزون", "asset", "1100", false},
	{"1150", "مصروفات مقدمة", "asset", "1100", false},
	{"1200", "الأصول الثابتة", "asset", "1000", true},
	{"1210", "أثاث ومفروشات", "asset", "1200", false},
	{"1220", "معدات وأجهزة", "asset", "1200", false},
	{"1230", "مباني", "asset", "1200", false},
	{"1240", "مركبات", "asset", "1200", false},
	{"1290", "مجمع الإهلاك", "asset", "1200", false},
	{"2000", "الالتزامات", "liability", "", true},
	{"2100", "الموردون والدائنون", "liability", "2000", false},
	{"2200", "ضرائب مستحقة", "liability", "2000", false},
	{"2300", "رواتب مستحقة", "liability", "2000", false},
	{"2400", "قروض قصيرة الأجل", "liability", "2000", false},
	{"2500", "قروض طويلة الأجل", "liability", "2000", false},
	{"3000", "حقوق الملكية", "equity", "", true},
	{"3100", "رأس المال", "equity", "3000", false},
	{"3200", "الأرباح المحتجزة", "equity", "3000", false},
	{"3300", "المسحوبات الشخصية", "equity", "3000", false},
	{"4000", "الإيرادات", "revenue", "", true},
	{"4100", "إيرادات المبيعات", "revenue", "4000", false},
	{"4200", "إيرادات الخدمات", "revenue", "4000", false},
	{"4300", "إيرادات أخرى", "revenue", "4000", false},
	{"5000", "المصروفات", "expense", "", true},
	{"5100", "تكلفة البضاعة المباعة", "expense", "5000", false},
	{"5200", "الرواتب والأجور", "expense", "5000", false},
	{"5300", "الإيجار", "expense", "5000", false},
	{"5400", "كهرباء ومياه", "expense", "5000", false},
	{"5500", "تسويق وإعلان", "expense", "5000", false},
	{"5600", "نقل وشحن", "expense", "5000", false},
	{"5700", "اتصالات وإنترنت", "expense", "5000", false},
	{"5800", "مصروفات أخرى", "expense", "5000", false},
}

// EnsureDefaultCOA seeds the standard chart of accounts for a shop that has none.
func (r *Repository) EnsureDefaultCOA(ctx context.Context, shopID string) error {
	var count int
	if err := r.pool.QueryRow(ctx, `SELECT COUNT(*) FROM acc_accounts WHERE shop_id = $1`, shopID).Scan(&count); err != nil {
		return fmt.Errorf("count accounts: %w", err)
	}
	if count > 0 {
		return nil
	}
	ids := map[string]string{} // code -> id
	for _, sa := range defaultCOA {
		var parentID *string
		if sa.Parent != "" {
			if pid, ok := ids[sa.Parent]; ok {
				parentID = &pid
			}
		}
		var id string
		err := r.pool.QueryRow(ctx,
			`INSERT INTO acc_accounts (shop_id, code, name, type, parent_id, is_group, is_system)
			 VALUES ($1,$2,$3,$4,$5,$6,TRUE) RETURNING id`,
			shopID, sa.Code, sa.Name, sa.Type, parentID, sa.IsGroup).Scan(&id)
		if err != nil {
			return fmt.Errorf("seed account %s: %w", sa.Code, err)
		}
		ids[sa.Code] = id
	}
	return nil
}

// ---------------------------------------------------------------------------
// Accounts
// ---------------------------------------------------------------------------

const accountCols = `id, shop_id, code, name, type, parent_id, is_group, is_system, opening_balance, status, created_at`

func scanAccount(row pgx.Row) (*Account, error) {
	var a Account
	var createdAt time.Time
	if err := row.Scan(&a.ID, &a.ShopID, &a.Code, &a.Name, &a.Type, &a.ParentID, &a.IsGroup, &a.IsSystem, &a.OpeningBalance, &a.Status, &createdAt); err != nil {
		return nil, err
	}
	a.CreatedAt = createdAt.Format(time.RFC3339)
	return &a, nil
}

func (r *Repository) ListAccounts(ctx context.Context, shopID string) ([]AccountWithBalance, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT `+accountCols+`,
			COALESCE(b.debit, 0) AS debit_balance,
			COALESCE(b.credit, 0) AS credit_balance
		FROM acc_accounts a
		LEFT JOIN (
			SELECT l.account_id, SUM(l.debit) AS debit, SUM(l.credit) AS credit
			FROM acc_journal_lines l
			JOIN acc_journal_entries e ON e.id = l.entry_id
			WHERE e.status = 'posted' AND e.shop_id = $1
			GROUP BY l.account_id
		) b ON b.account_id = a.id
		WHERE a.shop_id = $1
		ORDER BY a.code ASC`, shopID)
	if err != nil {
		return nil, fmt.Errorf("list accounts: %w", err)
	}
	defer rows.Close()

	out := make([]AccountWithBalance, 0)
	for rows.Next() {
		var a AccountWithBalance
		var createdAt time.Time
		if err := rows.Scan(&a.ID, &a.ShopID, &a.Code, &a.Name, &a.Type, &a.ParentID, &a.IsGroup, &a.IsSystem, &a.OpeningBalance, &a.Status, &createdAt, &a.DebitBalance, &a.CreditBalance); err != nil {
			continue
		}
		a.CreatedAt = createdAt.Format(time.RFC3339)
		out = append(out, a)
	}
	return out, rows.Err()
}

func (r *Repository) GetAccount(ctx context.Context, id string) (*Account, error) {
	a, err := scanAccount(r.pool.QueryRow(ctx, `SELECT `+accountCols+` FROM acc_accounts WHERE id = $1`, id))
	if err != nil {
		return nil, fmt.Errorf("get account: %w", err)
	}
	return a, nil
}

func (r *Repository) CreateAccount(ctx context.Context, shopID string, dto *CreateAccountDTO) (*Account, error) {
	row := r.pool.QueryRow(ctx,
		`INSERT INTO acc_accounts (shop_id, code, name, type, parent_id, is_group, opening_balance)
		 VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING `+accountCols,
		shopID, dto.Code, dto.Name, dto.Type, dto.ParentID, dto.IsGroup, dto.OpeningBalance)
	a, err := scanAccount(row)
	if err != nil {
		return nil, fmt.Errorf("create account: %w", err)
	}
	return a, nil
}

func (r *Repository) UpdateAccount(ctx context.Context, id string, dto *UpdateAccountDTO) (*Account, error) {
	row := r.pool.QueryRow(ctx,
		`UPDATE acc_accounts SET
			name = COALESCE($2, name),
			parent_id = COALESCE($3, parent_id),
			status = COALESCE($4, status),
			updated_at = NOW()
		 WHERE id = $1 RETURNING `+accountCols,
		id, dto.Name, dto.ParentID, dto.Status)
	a, err := scanAccount(row)
	if err != nil {
		return nil, fmt.Errorf("update account: %w", err)
	}
	return a, nil
}

func (r *Repository) DeleteAccount(ctx context.Context, id string) error {
	ct, err := r.pool.Exec(ctx, `DELETE FROM acc_accounts WHERE id = $1 AND is_system = FALSE AND is_group = FALSE`, id)
	if err != nil {
		return fmt.Errorf("delete account: %w", err)
	}
	if ct.RowsAffected() == 0 {
		return fmt.Errorf("حساب نظامي أو مجموعة لا يمكن حذفها")
	}
	return nil
}

// AccountHasJournalLines reports whether an account is used by journal lines.
func (r *Repository) AccountHasJournalLines(ctx context.Context, id string) (bool, error) {
	var n int
	if err := r.pool.QueryRow(ctx, `SELECT COUNT(*) FROM acc_journal_lines WHERE account_id = $1`, id).Scan(&n); err != nil {
		return false, err
	}
	return n > 0, nil
}

// ---------------------------------------------------------------------------
// Journal entries (double-entry)
// ---------------------------------------------------------------------------

func (r *Repository) nextEntryNumber(ctx context.Context, tx pgx.Tx, shopID string) (string, error) {
	var n int
	if err := tx.QueryRow(ctx,
		`SELECT COALESCE(MAX(SUBSTRING(number FROM 4)::INT), 0) + 1
		 FROM acc_journal_entries WHERE shop_id = $1 AND number LIKE 'JE-%'`, shopID).Scan(&n); err != nil {
		return "", err
	}
	return fmt.Sprintf("JE-%06d", n), nil
}

// CreateJournalEntry inserts a draft entry with its lines atomically.
func (r *Repository) CreateJournalEntry(ctx context.Context, shopID, createdBy string, dto *CreateJournalEntryDTO) (*JournalEntry, error) {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("begin tx: %w", err)
	}
	defer tx.Rollback(ctx)

	number, err := r.nextEntryNumber(ctx, tx, shopID)
	if err != nil {
		return nil, fmt.Errorf("next number: %w", err)
	}

	var e JournalEntry
	var postedAt *time.Time
	var createdAt time.Time
	err = tx.QueryRow(ctx,
		`INSERT INTO acc_journal_entries (shop_id, number, entry_date, description, reference, status, created_by)
		 VALUES ($1,$2,$3,$4,$5,'draft',$6)
		 RETURNING id, shop_id, number, entry_date, description, reference, status, total_debit, total_credit, posted_at, posted_by, reversed_by_entry_id, created_by, created_at`,
		shopID, number, dto.EntryDate, dto.Description, dto.Reference, createdBy).
		Scan(&e.ID, &e.ShopID, &e.Number, &e.EntryDate, &e.Description, &e.Reference, &e.Status, &e.TotalDebit, &e.TotalCredit, &postedAt, &e.PostedBy, &e.ReversedByEntryID, &e.CreatedBy, &createdAt)
	if err != nil {
		return nil, fmt.Errorf("insert entry: %w", err)
	}
	e.CreatedAt = createdAt.Format(time.RFC3339)

	for i, l := range dto.Lines {
		if _, err := tx.Exec(ctx,
			`INSERT INTO acc_journal_lines (entry_id, account_id, description, debit, credit, line_no)
			 VALUES ($1,$2,$3,$4,$5,$6)`,
			e.ID, l.AccountID, l.Description, l.Debit, l.Credit, i+1); err != nil {
			return nil, fmt.Errorf("insert line %d: %w", i+1, err)
		}
	}
	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("commit: %w", err)
	}
	return r.GetJournalEntry(ctx, e.ID)
}

// UpdateJournalEntry replaces editable fields of a draft entry.
func (r *Repository) UpdateJournalEntry(ctx context.Context, id string, dto *UpdateJournalEntryDTO) (*JournalEntry, error) {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	ct, err := tx.Exec(ctx,
		`UPDATE acc_journal_entries SET
			entry_date = COALESCE(NULLIF($2,''), entry_date),
			description = COALESCE(NULLIF($3,''), description),
			reference = COALESCE($4, reference),
			updated_at = NOW()
		 WHERE id = $1 AND status = 'draft'`, id, dto.EntryDate, dto.Description, dto.Reference)
	if err != nil {
		return nil, err
	}
	if ct.RowsAffected() == 0 {
		return nil, fmt.Errorf("القيد غير موجود أو مرحَّل ولا يمكن تعديله")
	}
	if len(dto.Lines) > 0 {
		if _, err := tx.Exec(ctx, `DELETE FROM acc_journal_lines WHERE entry_id = $1`, id); err != nil {
			return nil, err
		}
		for i, l := range dto.Lines {
			if _, err := tx.Exec(ctx,
				`INSERT INTO acc_journal_lines (entry_id, account_id, description, debit, credit, line_no)
				 VALUES ($1,$2,$3,$4,$5,$6)`, id, l.AccountID, l.Description, l.Debit, l.Credit, i+1); err != nil {
				return nil, err
			}
		}
	}
	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}
	return r.GetJournalEntry(ctx, id)
}

// PostJournalEntry validates balance and posts the entry.
func (r *Repository) PostJournalEntry(ctx context.Context, id, postedBy string) (*JournalEntry, error) {
	var d, c float64
	if err := r.pool.QueryRow(ctx,
		`SELECT COALESCE(SUM(debit),0), COALESCE(SUM(credit),0) FROM acc_journal_lines WHERE entry_id = $1`, id).
		Scan(&d, &c); err != nil {
		return nil, err
	}
	if d == 0 || c == 0 {
		return nil, fmt.Errorf("لا يمكن ترحيل قيد بدون أطراف مدين ودائن")
	}
	if d != c {
		return nil, fmt.Errorf("القيد غير متوازن: مدين %.2f ≠ دائن %.2f", d, c)
	}
	if _, err := r.pool.Exec(ctx,
		`UPDATE acc_journal_entries SET status='posted', posted_at=NOW(), posted_by=$2, total_debit=$4, total_credit=$5, updated_at=NOW()
		 WHERE id=$1 AND status='draft'`, id, postedBy, d, c); err != nil {
		return nil, err
	}
	return r.GetJournalEntry(ctx, id)
}

// ReverseJournalEntry posts an opposite entry and marks the original reversed.
func (r *Repository) ReverseJournalEntry(ctx context.Context, id, postedBy string) (*JournalEntry, error) {
	orig, err := r.GetJournalEntry(ctx, id)
	if err != nil {
		return nil, err
	}
	if orig.Status != "posted" {
		return nil, fmt.Errorf("يمكن عكس القيود المرحَّلة فقط")
	}
	if orig.ReversedByEntryID != "" {
		return nil, fmt.Errorf("القيد معكوس بالفعل")
	}

	dto := CreateJournalEntryDTO{
		EntryDate:   time.Now().Format("2006-01-02"),
		Description: "قيد عكسي للقيد " + orig.Number + ": " + orig.Description,
		Reference:   orig.Number,
		Lines:       make([]JournalLineInput, 0, len(orig.Lines)),
	}
	for _, l := range orig.Lines {
		dto.Lines = append(dto.Lines, JournalLineInput{
			AccountID:   l.AccountID,
			Description: l.Description,
			Debit:       l.Credit,
			Credit:      l.Debit,
		})
	}

	rev, err := r.CreateJournalEntry(ctx, orig.ShopID, postedBy, &dto)
	if err != nil {
		return nil, err
	}
	if _, err := r.PostJournalEntry(ctx, rev.ID, postedBy); err != nil {
		return nil, err
	}
	if _, err := r.pool.Exec(ctx,
		`UPDATE acc_journal_entries SET status='reversed', reversed_by_entry_id=$2, updated_at=NOW() WHERE id=$1`,
		id, rev.ID); err != nil {
		return nil, err
	}
	return r.GetJournalEntry(ctx, rev.ID)
}

func (r *Repository) DeleteJournalEntry(ctx context.Context, id string) error {
	ct, err := r.pool.Exec(ctx, `DELETE FROM acc_journal_entries WHERE id=$1 AND status='draft'`, id)
	if err != nil {
		return err
	}
	if ct.RowsAffected() == 0 {
		return fmt.Errorf("القيد غير موجود أو مرحَّل ولا يمكن حذفه")
	}
	return nil
}

const entryCols = `e.id, e.shop_id, e.number, e.entry_date, e.description, e.reference, e.status, e.total_debit, e.total_credit, e.posted_at, e.posted_by, COALESCE(e.reversed_by_entry_id::TEXT,''), COALESCE(e.created_by,''), e.created_at`

func (r *Repository) GetJournalEntry(ctx context.Context, id string) (*JournalEntry, error) {
	var e JournalEntry
	var entryDate time.Time
	var postedAt *time.Time
	var createdAt time.Time
	err := r.pool.QueryRow(ctx,
		`SELECT `+entryCols+` FROM acc_journal_entries e WHERE e.id=$1`, id).
		Scan(&e.ID, &e.ShopID, &e.Number, &entryDate, &e.Description, &e.Reference, &e.Status, &e.TotalDebit, &e.TotalCredit, &postedAt, &e.PostedBy, &e.ReversedByEntryID, &e.CreatedBy, &createdAt)
	if err != nil {
		return nil, fmt.Errorf("get entry: %w", err)
	}
	e.EntryDate = entryDate.Format("2006-01-02")
	if postedAt != nil {
		e.PostedAt = postedAt.Format(time.RFC3339)
	}
	e.CreatedAt = createdAt.Format(time.RFC3339)
	lines, err := r.entryLines(ctx, e.ID)
	if err != nil {
		return nil, err
	}
	e.Lines = lines
	return &e, nil
}

func (r *Repository) entryLines(ctx context.Context, entryID string) ([]JournalLine, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT l.id, l.entry_id, l.account_id, COALESCE(a.code,''), COALESCE(a.name,''),
		       COALESCE(l.description,''), l.debit, l.credit, l.line_no
		FROM acc_journal_lines l
		LEFT JOIN acc_accounts a ON a.id = l.account_id
		WHERE l.entry_id = $1 ORDER BY l.line_no ASC`, entryID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := make([]JournalLine, 0)
	for rows.Next() {
		var l JournalLine
		if err := rows.Scan(&l.ID, &l.EntryID, &l.AccountID, &l.AccountCode, &l.AccountName, &l.Description, &l.Debit, &l.Credit, &l.LineNo); err != nil {
			continue
		}
		out = append(out, l)
	}
	return out, rows.Err()
}

func (r *Repository) ListJournalEntries(ctx context.Context, shopID, status, from, to string) ([]JournalEntry, error) {
	where := "e.shop_id = $1"
	args := []any{shopID}
	if status != "" {
		args = append(args, status)
		where += fmt.Sprintf(" AND e.status = $%d", len(args))
	}
	if from != "" {
		args = append(args, from)
		where += fmt.Sprintf(" AND e.entry_date >= $%d", len(args))
	}
	if to != "" {
		args = append(args, to)
		where += fmt.Sprintf(" AND e.entry_date <= $%d", len(args))
	}
	rows, err := r.pool.Query(ctx,
		`SELECT `+entryCols+` FROM acc_journal_entries e WHERE `+where+` ORDER BY e.entry_date DESC, e.number DESC LIMIT 500`, args...)
	if err != nil {
		return nil, fmt.Errorf("list entries: %w", err)
	}
	defer rows.Close()

	out := make([]JournalEntry, 0)
	for rows.Next() {
		var e JournalEntry
		var entryDate time.Time
		var postedAt *time.Time
		var createdAt time.Time
		if err := rows.Scan(&e.ID, &e.ShopID, &e.Number, &entryDate, &e.Description, &e.Reference, &e.Status, &e.TotalDebit, &e.TotalCredit, &postedAt, &e.PostedBy, &e.ReversedByEntryID, &e.CreatedBy, &createdAt); err != nil {
			continue
		}
		e.EntryDate = entryDate.Format("2006-01-02")
		if postedAt != nil {
			e.PostedAt = postedAt.Format(time.RFC3339)
		}
		e.CreatedAt = createdAt.Format(time.RFC3339)
		out = append(out, e)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	for i := range out {
		if lines, err := r.entryLines(ctx, out[i].ID); err == nil {
			out[i].Lines = lines
		}
	}
	return out, nil
}

func (r *Repository) TrialBalance(ctx context.Context, shopID, from, to string) (*TrialBalance, error) {
	dateFilter := "e.status = 'posted' AND e.shop_id = $1"
	args := []any{shopID}
	if from != "" {
		args = append(args, from)
		dateFilter += fmt.Sprintf(" AND e.entry_date >= $%d", len(args))
	}
	if to != "" {
		args = append(args, to)
		dateFilter += fmt.Sprintf(" AND e.entry_date <= $%d", len(args))
	}
	rows, err := r.pool.Query(ctx, `
		SELECT a.id, a.code, a.name, a.type, COALESCE(SUM(l.debit),0), COALESCE(SUM(l.credit),0)
		FROM acc_accounts a
		LEFT JOIN acc_journal_lines l ON l.account_id = a.id
		LEFT JOIN acc_journal_entries e ON e.id = l.entry_id AND `+dateFilter+`
		WHERE a.shop_id = $1 AND a.is_group = FALSE
		GROUP BY a.id, a.code, a.name, a.type
		HAVING COALESCE(SUM(l.debit),0) <> 0 OR COALESCE(SUM(l.credit),0) <> 0
		ORDER BY a.code ASC`, args...)
	if err != nil {
		return nil, fmt.Errorf("trial balance: %w", err)
	}
	defer rows.Close()

	tb := &TrialBalance{ShopID: shopID, FromDate: from, ToDate: to, Rows: make([]TrialBalanceRow, 0)}
	for rows.Next() {
		var row TrialBalanceRow
		if err := rows.Scan(&row.AccountID, &row.Code, &row.Name, &row.Type, &row.DebitTotal, &row.CreditTotal); err != nil {
			continue
		}
		switch row.Type {
		case "asset", "expense":
			row.DebitBalance = row.DebitTotal - row.CreditTotal
		default:
			row.CreditBalance = row.CreditTotal - row.DebitTotal
		}
		tb.TotalDebit += row.DebitBalance
		tb.TotalCredit += row.CreditBalance
		tb.Rows = append(tb.Rows, row)
	}
	tb.IsBalanced = absEq(tb.TotalDebit, tb.TotalCredit)
	return tb, rows.Err()
}

// AccountTotals aggregates posted debit/credit per leaf account in a period.
func (r *Repository) AccountTotals(ctx context.Context, shopID, from, to string) (map[string][2]float64, error) {
	dateFilter := "e.status = 'posted' AND e.shop_id = $1"
	args := []any{shopID}
	if from != "" {
		args = append(args, from)
		dateFilter += fmt.Sprintf(" AND e.entry_date >= $%d", len(args))
	}
	if to != "" {
		args = append(args, to)
		dateFilter += fmt.Sprintf(" AND e.entry_date <= $%d", len(args))
	}
	rows, err := r.pool.Query(ctx, `
		SELECT l.account_id, COALESCE(SUM(l.debit),0), COALESCE(SUM(l.credit),0)
		FROM acc_journal_lines l
		JOIN acc_journal_entries e ON e.id = l.entry_id
		WHERE `+dateFilter+`
		GROUP BY l.account_id`, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := map[string][2]float64{}
	for rows.Next() {
		var id string
		var d, c float64
		if err := rows.Scan(&id, &d, &c); err != nil {
			continue
		}
		out[id] = [2]float64{d, c}
	}
	return out, rows.Err()
}

func absEq(a, b float64) bool {
	const eps = 0.005
	d := a - b
	if d < 0 {
		d = -d
	}
	return d < eps
}