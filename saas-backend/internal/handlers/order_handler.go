package handlers

import (
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/Sayedtaha55/ray-eg/saas-backend/internal/db"
	"github.com/Sayedtaha55/ray-eg/saas-backend/internal/middleware"
	"github.com/gofiber/fiber/v2"
)

type OrderHandler struct {
	queries *db.Queries
}

func NewOrderHandler(q *db.Queries) *OrderHandler {
	return &OrderHandler{queries: q}
}

type OrderItemInput struct {
	ProductID   *string `json:"product_id"`
	Name        string  `json:"name"`
	Description *string `json:"description"`
	Price       float64 `json:"price"`
	Quantity    int32   `json:"quantity"`
}

type CreateOrderRequest struct {
	Items []OrderItemInput `json:"items"`

	Tax       float64 `json:"tax"`
	Shipping  float64 `json:"shipping"`
	Discount  float64 `json:"discount"`
	Currency  string  `json:"currency"`
	Notes     *string `json:"notes"`

	CustomerName   *string `json:"customer_name"`
	CustomerEmail  *string `json:"customer_email"`
	CustomerPhone  *string `json:"customer_phone"`
	ShippingAddress interface{} `json:"shipping_address"`
	BillingAddress  interface{} `json:"billing_address"`
}

type UpdateOrderStatusRequest struct {
	Status string `json:"status"`
}

type OrderItemResponse struct {
	ID          string    `json:"id"`
	ProductID   *string   `json:"product_id"`
	Name        string    `json:"name"`
	Description *string   `json:"description"`
	Price       float64   `json:"price"`
	Quantity    int32     `json:"quantity"`
	Subtotal    float64   `json:"subtotal"`
	CreatedAt   time.Time `json:"created_at"`
}

type OrderResponse struct {
	ID              string             `json:"id"`
	StoreID         string             `json:"store_id"`
	UserID          *string            `json:"user_id"`
	OrderNumber     string             `json:"order_number"`
	Status          string             `json:"status"`
	Subtotal        float64            `json:"subtotal"`
	Tax             float64            `json:"tax"`
	Shipping        float64            `json:"shipping"`
	Discount        float64            `json:"discount"`
	Total           float64            `json:"total"`
	Currency        string             `json:"currency"`
	CustomerName    *string            `json:"customer_name"`
	CustomerEmail   *string            `json:"customer_email"`
	CustomerPhone   *string            `json:"customer_phone"`
	ShippingAddress json.RawMessage    `json:"shipping_address"`
	BillingAddress  json.RawMessage    `json:"billing_address"`
	Notes           *string            `json:"notes"`
	Items           []OrderItemResponse `json:"items"`
	CreatedAt       time.Time          `json:"created_at"`
	UpdatedAt       time.Time          `json:"updated_at"`
}

func (h *OrderHandler) Create(c *fiber.Ctx) error {
	store := middleware.GetTenantStore(c)
	if store == nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "tenant_required", "message": "Tenant context is required"})
	}

	var req CreateOrderRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid_body", "message": "Invalid request body"})
	}

	if len(req.Items) == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "validation_error", "message": "At least one order item is required"})
	}

	// Calculate subtotal from items.
	var subtotal float64
	for _, item := range req.Items {
		name := strings.TrimSpace(item.Name)
		if name == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "validation_error", "message": "Each item must have a name"})
		}
		if item.Quantity <= 0 {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "validation_error", "message": "Quantity must be > 0"})
		}
		if item.Price < 0 {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "validation_error", "message": "Price must be >= 0"})
		}
		subtotal += item.Price * float64(item.Quantity)
	}

	currency := strings.TrimSpace(req.Currency)
	if currency == "" {
		currency = "USD"
	}

	total := subtotal + req.Tax + req.Shipping - req.Discount
	if total < 0 {
		total = 0
	}

	// Generate order number: ORD-{timestamp}-{random}
	orderNumber := fmt.Sprintf("ORD-%d", time.Now().UnixNano()/1e6)

	// Marshal addresses.
	var shippingAddr, billingAddr json.RawMessage
	if req.ShippingAddress != nil {
		b, _ := json.Marshal(req.ShippingAddress)
		shippingAddr = b
	} else {
		shippingAddr = json.RawMessage(`null`)
	}
	if req.BillingAddress != nil {
		b, _ := json.Marshal(req.BillingAddress)
		billingAddr = b
	} else {
		billingAddr = json.RawMessage(`null`)
	}

	// Get user ID from JWT if authenticated.
	var userID *string
	if uid, ok := c.Locals("user_id").(string); ok && uid != "" {
		userID = &uid
	}

	order, err := h.queries.CreateOrder(c.UserContext(), db.CreateOrderParams{
		StoreID:         store.ID,
		UserID:          userID,
		OrderNumber:     orderNumber,
		Status:          db.OrderStatusPending,
		Subtotal:        subtotal,
		Tax:             req.Tax,
		Shipping:        req.Shipping,
		Discount:        req.Discount,
		Total:           total,
		Currency:        currency,
		CustomerName:    req.CustomerName,
		CustomerEmail:   req.CustomerEmail,
		CustomerPhone:   req.CustomerPhone,
		ShippingAddress: shippingAddr,
		BillingAddress:  billingAddr,
		Notes:           req.Notes,
		Metadata:        json.RawMessage(`{}`),
	})
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "internal_error", "message": fmt.Sprintf("Failed to create order: %v", err)})
	}

	// Create order items.
	for _, item := range req.Items {
		itemSubtotal := item.Price * float64(item.Quantity)
		_, err := h.queries.CreateOrderItem(c.UserContext(), db.CreateOrderItemParams{
			OrderID:     order.ID,
			ProductID:   item.ProductID,
			Name:        item.Name,
			Description: item.Description,
			Price:       item.Price,
			Quantity:    item.Quantity,
			Subtotal:    itemSubtotal,
			Metadata:    json.RawMessage(`{}`),
		})
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   "internal_error",
				"message": fmt.Sprintf("Failed to create order item: %v", err),
			})
		}
	}

	// Fetch order with items.
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"data":    h.toOrderResponseWithItems(c, order),
	})
}

func (h *OrderHandler) GetByID(c *fiber.Ctx) error {
	store := middleware.GetTenantStore(c)
	if store == nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "tenant_required", "message": "Tenant context is required"})
	}

	id := strings.TrimSpace(c.Params("id"))
	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "validation_error", "message": "id is required"})
	}

	order, err := h.queries.GetOrderByID(c.UserContext(), db.GetOrderByIDParams{ID: id, StoreID: store.ID})
	if err != nil {
		if isNoRows(err) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "not_found", "message": "Order not found"})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "internal_error", "message": fmt.Sprintf("Failed: %v", err)})
	}

	return c.JSON(fiber.Map{"success": true, "data": h.toOrderResponseWithItems(c, order)})
}

func (h *OrderHandler) List(c *fiber.Ctx) error {
	store := middleware.GetTenantStore(c)
	if store == nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "tenant_required", "message": "Tenant context is required"})
	}

	limit := int32(c.QueryInt("limit", 20))
	if limit <= 0 || limit > 100 {
		limit = 20
	}
	offset := int32(c.QueryInt("offset", 0))

	statusFilter := strings.TrimSpace(c.Query("status"))

	var orders []db.Order
	var err error

	if statusFilter != "" {
		orders, err = h.queries.ListOrdersByStatus(c.UserContext(), db.ListOrdersByStatusParams{
			StoreID: store.ID,
			Status:  db.OrderStatus(statusFilter),
			Limit:   limit,
			Offset:  offset,
		})
	} else {
		orders, err = h.queries.ListOrdersByStore(c.UserContext(), db.ListOrdersByStoreParams{
			StoreID: store.ID,
			Limit:   limit,
			Offset:  offset,
		})
	}

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "internal_error", "message": fmt.Sprintf("Failed: %v", err)})
	}

	resp := make([]OrderResponse, len(orders))
	for i, o := range orders {
		resp[i] = h.toOrderResponseWithItems(c, o)
	}

	return c.JSON(fiber.Map{"success": true, "data": resp})
}

func (h *OrderHandler) UpdateStatus(c *fiber.Ctx) error {
	store := middleware.GetTenantStore(c)
	if store == nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "tenant_required", "message": "Tenant context is required"})
	}

	id := strings.TrimSpace(c.Params("id"))
	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "validation_error", "message": "id is required"})
	}

	var req UpdateOrderStatusRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid_body", "message": "Invalid request body"})
	}

	status := strings.TrimSpace(req.Status)
	validStatuses := map[string]bool{
		"pending": true, "confirmed": true, "processing": true,
		"shipped": true, "delivered": true, "cancelled": true, "refunded": true,
	}
	if !validStatuses[status] {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "validation_error",
			"message": "Invalid status. Valid: pending, confirmed, processing, shipped, delivered, cancelled, refunded",
		})
	}

	order, err := h.queries.UpdateOrderStatus(c.UserContext(), db.UpdateOrderStatusParams{
		ID:      id,
		Status:  db.OrderStatus(status),
		StoreID: store.ID,
	})
	if err != nil {
		if isNoRows(err) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "not_found", "message": "Order not found"})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "internal_error", "message": fmt.Sprintf("Failed: %v", err)})
	}

	return c.JSON(fiber.Map{"success": true, "data": h.toOrderResponseWithItems(c, order)})
}

func (h *OrderHandler) toOrderResponseWithItems(c *fiber.Ctx, order db.Order) OrderResponse {
	resp := OrderResponse{
		ID:              order.ID,
		StoreID:         order.StoreID,
		UserID:          order.UserID,
		OrderNumber:     order.OrderNumber,
		Status:          string(order.Status),
		Subtotal:        order.Subtotal,
		Tax:             order.Tax,
		Shipping:        order.Shipping,
		Discount:        order.Discount,
		Total:           order.Total,
		Currency:        order.Currency,
		CustomerName:    order.CustomerName,
		CustomerEmail:   order.CustomerEmail,
		CustomerPhone:   order.CustomerPhone,
		ShippingAddress: order.ShippingAddress,
		BillingAddress:  order.BillingAddress,
		Notes:           order.Notes,
		CreatedAt:       order.CreatedAt,
		UpdatedAt:       order.UpdatedAt,
	}

	items, err := h.queries.GetOrderItems(c.UserContext(), order.ID)
	if err == nil {
		resp.Items = make([]OrderItemResponse, len(items))
		for i, item := range items {
			resp.Items[i] = OrderItemResponse{
				ID:          item.ID,
				ProductID:   item.ProductID,
				Name:        item.Name,
				Description: item.Description,
				Price:       item.Price,
				Quantity:    item.Quantity,
				Subtotal:    item.Subtotal,
				CreatedAt:   item.CreatedAt,
			}
		}
	}

	return resp
}
