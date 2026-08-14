// Package events provides cross-domain event wiring.
// Call Wire() from internal/app/app.go after all services are initialized.
package events

import (
	"context"
	"fmt"

	"github.com/Sayedtaha55/ray-eg/gobackend/pkg/domain/cart"
	"github.com/Sayedtaha55/ray-eg/gobackend/pkg/domain/erp"
	"go.uber.org/zap"
)

// CheckoutPayload is published on TopicCartCheckedOut.
type CheckoutPayload struct {
	Result *cart.CheckoutResult
	Items  []cart.LineItem
}

// Wire subscribes ERP handlers to cart/storefront events.
// Add new subscriptions here as domains grow — no changes to domain packages.
func Wire(bus *Bus, inv erp.InventoryService, log *zap.Logger) {
	bus.Subscribe(TopicCartCheckedOut, func(ctx context.Context, e Event) {
		payload, ok := e.Payload.(CheckoutPayload)
		if !ok {
			log.Error("invalid payload for cart.checked_out")
			return
		}

		items := make([]erp.StockItem, 0, len(payload.Items))
		for _, li := range payload.Items {
			items = append(items, erp.StockItem{
				ProductID: li.ProductID,
				ShopID:    li.ShopID,
				Quantity:  li.Qty,
			})
		}

		if err := inv.DeductStock(ctx, items); err != nil {
			log.Error("stock deduction failed",
				zap.String("order_id", payload.Result.OrderID.String()),
				zap.Error(err),
			)
		} else {
			log.Info("stock deducted",
				zap.String("order_id", payload.Result.OrderID.String()),
				zap.Int("item_count", len(items)),
			)
		}
	})

	log.Info(fmt.Sprintf("event bus wired: %d topics", 1))
}
