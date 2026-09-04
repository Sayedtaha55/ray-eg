package accounting

import "github.com/go-playground/validator/v10"

// ----------------------------- Accounts -----------------------------------

type CreateAccountDTO struct {
	Code           string  `json:"code" validate:"required,min=1,max=40"`
	Name           string  `json:"name" validate:"required,min=1,max=160"`
	Type           string  `json:"type" validate:"required,oneof=asset liability equity revenue expense"`
	ParentID       *string `json:"parent_id,omitempty" validate:"omitempty,uuid"`
	IsGroup        bool    `json:"is_group,omitempty"`
	OpeningBalance float64 `json:"opening_balance,omitempty"`
}

func (d *CreateAccountDTO) Validate(v *validator.Validate) error { return v.Struct(d) }

type UpdateAccountDTO struct {
	Name     *string `json:"name,omitempty" validate:"omitempty,min=1,max=160"`
	ParentID *string `json:"parent_id,omitempty" validate:"omitempty,uuid"`
	Status   *string `json:"status,omitempty" validate:"omitempty,oneof=active inactive"`
}

func (d *UpdateAccountDTO) Validate(v *validator.Validate) error { return v.Struct(d) }

// --------------------------- Journal entries ------------------------------

type JournalLineInput struct {
	AccountID   string  `json:"account_id" validate:"required,uuid"`
	Description string  `json:"description,omitempty" validate:"omitempty,max=240"`
	Debit       float64 `json:"debit,omitempty" validate:"gte=0"`
	Credit      float64 `json:"credit,omitempty" validate:"gte=0"`
}

type CreateJournalEntryDTO struct {
	EntryDate   string             `json:"entry_date" validate:"required,datetime=2006-01-02"`
	Description string             `json:"description" validate:"required,min=1,max=240"`
	Reference   string             `json:"reference,omitempty" validate:"omitempty,max=80"`
	Lines       []JournalLineInput `json:"lines" validate:"required,min=2,dive"`
}

func (d *CreateJournalEntryDTO) Validate(v *validator.Validate) error { return v.Struct(d) }

type UpdateJournalEntryDTO struct {
	EntryDate   string             `json:"entry_date,omitempty" validate:"omitempty,datetime=2006-01-02"`
	Description string             `json:"description,omitempty" validate:"omitempty,min=1,max=240"`
	Reference   string             `json:"reference,omitempty" validate:"omitempty,max=80"`
	Lines       []JournalLineInput `json:"lines,omitempty" validate:"omitempty,min=2,dive"`
}

func (d *UpdateJournalEntryDTO) Validate(v *validator.Validate) error { return v.Struct(d) }