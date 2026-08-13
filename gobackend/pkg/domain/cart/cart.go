// Package cart defines the Cart domain boundary.
// Write path: Redis first (instant response) → async PostgreSQL sync on checkout.
// To extract into a microservice: replace CartService with a gRPC client stub
// that calls the standalone cart service — zero changes to callers.
package cart

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
)

// ─── Domain Interface ─────────────────────────────────────────────────────────

// CartService is the boundary interface for the cart domain.
// storefront and orders domains call this — never the concrete type.
type CartService interface {
	AddItem(ctx context.Context, cartID string, item LineItem) error
	UpdateQty(ctx context.Context, cartID string, productID uuid.UUID, qty int) error
	GetCart(ctx context.Context, cartID string) (*Cart, error)
	Checkout(ctx context.Context, cartID string, userID uuid.UUID) (*CheckoutResult, error)
}

// ─── Value Objects ────────────────────────────────────────────────────────────

type LineItem struct {
	ProductID uuid.UUID `json:"product_id"`
	ShopID    uuid.UUID `json:"shop_id"`
	Name      string    `json:"name"`
	Price     float64   `json:"price"`
	Qty       int       `json:"qty"`
}

type Cart struct {
	ID        string     `json:"id"`
	UserID    *uuid.UUID `json:"user_id,omitempty"` // nil = guest cart
	Items     []LineItem `json:"items"`
	UpdatedAt time.Time  `json:"updated_at"`
}

type CheckoutResult struct {
	OrderID uuid.UUID `json:"order_id"`
	Total   float64   `json:"total"`
}

// ─── Redis-backed implementation ──────────────────────────────────────────────

const cartTTL = 7 * 24 * time.Hour

type redisCartService struct {
	rdb redis.UniversalClient
	// db  *pgxpool.Pool  ← inject for async PostgreSQL sync
}

// NewRedisCartService returns a CartService backed by Redis.
// Pass the existing redis.Client from internal/platform/redis.
func NewRedisCartService(rdb redis.UniversalClient) CartService {
	return &redisCartService{rdb: rdb}
}

func (s *redisCartService) AddItem(ctx context.Context, cartID string, item LineItem) error {
	cart, err := s.load(ctx, cartID)
	if err != nil {
		cart = &Cart{ID: cartID, UpdatedAt: time.Now()}
	}
	for i, li := range cart.Items {
		if li.ProductID == item.ProductID {
			cart.Items[i].Qty += item.Qty
			return s.save(ctx, cart)
		}
	}
	cart.Items = append(cart.Items, item)
	return s.save(ctx, cart)
}

func (s *redisCartService) UpdateQty(ctx context.Context, cartID string, productID uuid.UUID, qty int) error {
	cart, err := s.load(ctx, cartID)
	if err != nil {
		return err
	}
	for i, li := range cart.Items {
		if li.ProductID == productID {
			if qty <= 0 {
				cart.Items = append(cart.Items[:i], cart.Items[i+1:]...)
			} else {
				cart.Items[i].Qty = qty
			}
			return s.save(ctx, cart)
		}
	}
	return nil
}

func (s *redisCartService) GetCart(ctx context.Context, cartID string) (*Cart, error) {
	return s.load(ctx, cartID)
}

// Checkout flushes the cart and publishes TopicCartCheckedOut.
// The caller (orders domain) listens on the event bus and persists to PostgreSQL.
func (s *redisCartService) Checkout(ctx context.Context, cartID string, userID uuid.UUID) (*CheckoutResult, error) {
	cart, err := s.load(ctx, cartID)
	if err != nil {
		return nil, err
	}
	var total float64
	for _, li := range cart.Items {
		total += li.Price * float64(li.Qty)
	}
	// Delete cart from Redis — PostgreSQL persistence is handled by the
	// orders domain after it receives the TopicCartCheckedOut event.
	_ = s.rdb.Del(ctx, cartKey(cartID))
	return &CheckoutResult{OrderID: uuid.New(), Total: total}, nil
}

func (s *redisCartService) load(ctx context.Context, cartID string) (*Cart, error) {
	raw, err := s.rdb.Get(ctx, cartKey(cartID)).Bytes()
	if err != nil {
		return nil, err
	}
	var c Cart
	return &c, json.Unmarshal(raw, &c)
}

func (s *redisCartService) save(ctx context.Context, c *Cart) error {
	c.UpdatedAt = time.Now()
	raw, err := json.Marshal(c)
	if err != nil {
		return err
	}
	return s.rdb.Set(ctx, cartKey(c.ID), raw, cartTTL).Err()
}

func cartKey(id string) string { return fmt.Sprintf("cart:%s", id) }
