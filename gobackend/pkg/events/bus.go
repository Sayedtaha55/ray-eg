// Package events provides an in-memory event bus for cross-domain communication.
// Replace Publish/Subscribe with a gRPC stream or NATS client to extract any
// domain into a standalone microservice without touching domain core logic.
package events

import (
	"context"
	"sync"
)

// Event is the envelope carried on the bus.
type Event struct {
	Topic   string
	Payload any
}

// Handler processes a single event.
type Handler func(ctx context.Context, e Event)

// Bus is a lightweight, goroutine-safe pub/sub bus.
type Bus struct {
	mu       sync.RWMutex
	handlers map[string][]Handler
}

// New returns a ready-to-use Bus.
func New() *Bus {
	return &Bus{handlers: make(map[string][]Handler)}
}

// Subscribe registers h to receive all events published on topic.
func (b *Bus) Subscribe(topic string, h Handler) {
	b.mu.Lock()
	defer b.mu.Unlock()
	b.handlers[topic] = append(b.handlers[topic], h)
}

// Publish dispatches e to every subscriber of e.Topic in separate goroutines.
func (b *Bus) Publish(ctx context.Context, e Event) {
	b.mu.RLock()
	hs := make([]Handler, len(b.handlers[e.Topic]))
	copy(hs, b.handlers[e.Topic])
	b.mu.RUnlock()

	for _, h := range hs {
		h := h
		go h(ctx, e)
	}
}

// Well-known topic constants — shared across all domains.
const (
	TopicOrderCreated      = "order.created"
	TopicStockDeducted     = "inventory.stock_deducted"
	TopicCartCheckedOut    = "cart.checked_out"
	TopicStorefrontVisited = "storefront.visited"
)
