// Package erp defines the ERP domain boundary interfaces.
// All cross-domain calls must go through these interfaces — never import
// internal/domains/* directly from another domain package.
package erp

import (
	"context"
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

// ─── Domain Interfaces ───────────────────────────────────────────────────────

// InventoryService is the ERP boundary for stock management.
// cart domain calls DeductStock after a successful checkout.
type InventoryService interface {
	DeductStock(ctx context.Context, items []StockItem) error
	ReserveStock(ctx context.Context, items []StockItem) error
	ReleaseReservation(ctx context.Context, reservationID uuid.UUID) error
}

// AccountingService is the ERP boundary for financial records.
type AccountingService interface {
	RecordSale(ctx context.Context, sale SaleRecord) error
	RecordRefund(ctx context.Context, refund RefundRecord) error
}

// ─── Value Objects ───────────────────────────────────────────────────────────

type StockItem struct {
	ProductID uuid.UUID
	ShopID    uuid.UUID
	Quantity  int
}

type SaleRecord struct {
	OrderID   uuid.UUID
	ShopID    uuid.UUID
	Amount    float64
	Currency  string
	CreatedAt time.Time
}

type RefundRecord struct {
	OrderID   uuid.UUID
	Amount    float64
	Reason    string
	CreatedAt time.Time
}

// ─── Dynamic JSONB Attributes ─────────────────────────────────────────────────
// Implements Odoo-like custom fields without DDL migrations.
// Store in a jsonb column; scan into DynamicAttrs; access via Get/Set.

// DynamicAttrs holds arbitrary key-value pairs persisted as PostgreSQL JSONB.
//
//	CREATE TABLE erp_products (
//	    id   uuid PRIMARY KEY,
//	    name text NOT NULL,
//	    attrs jsonb NOT NULL DEFAULT '{}'
//	);
type DynamicAttrs map[string]any

// Scan implements sql.Scanner so pgx can decode a jsonb column directly.
func (d *DynamicAttrs) Scan(src any) error {
	var raw []byte
	switch v := src.(type) {
	case []byte:
		raw = v
	case string:
		raw = []byte(v)
	case nil:
		*d = DynamicAttrs{}
		return nil
	}
	return json.Unmarshal(raw, d)
}

// Value implements driver.Valuer so pgx can encode DynamicAttrs as jsonb.
func (d DynamicAttrs) Value() ([]byte, error) {
	if d == nil {
		return []byte("{}"), nil
	}
	return json.Marshal(d)
}

// Get returns the value for key, or nil if absent.
func (d DynamicAttrs) Get(key string) any {
	if d == nil {
		return nil
	}
	return d[key]
}

// Set stores value under key.
func (d DynamicAttrs) Set(key string, value any) {
	d[key] = value
}

// Bind unmarshals the attrs into a typed struct T.
//
//	type ClothingAttrs struct { Size string `json:"size"`; Color string `json:"color"` }
//	var ca ClothingAttrs
//	_ = product.Attrs.Bind(&ca)
func (d DynamicAttrs) Bind(dst any) error {
	b, err := json.Marshal(d)
	if err != nil {
		return err
	}
	return json.Unmarshal(b, dst)
}

// ERPProduct is an example entity that uses DynamicAttrs for custom fields.
type ERPProduct struct {
	ID    uuid.UUID    `db:"id"`
	Name  string       `db:"name"`
	Attrs DynamicAttrs `db:"attrs"` // maps to jsonb column
}
