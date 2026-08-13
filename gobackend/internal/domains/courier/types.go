package courier

// CourierStatus represents the status of a courier
type CourierStatus string

const (
	CourierStatusAvailable CourierStatus = "AVAILABLE"
	CourierStatusBusy      CourierStatus = "BUSY"
	CourierStatusOffline   CourierStatus = "OFFLINE"
)

// Courier represents a courier entity
type Courier struct {
	ID          string         `json:"id"`
	UserID      string         `json:"user_id"`
	Name        string         `json:"name"`
	Phone       string         `json:"phone"`
	Email       string         `json:"email"`
	Status      CourierStatus `json:"status"`
	Location    string         `json:"location"`
	Rating      float64        `json:"rating"`
	TotalOrders int64          `json:"total_orders"`
	CreatedAt   string         `json:"created_at"`
	UpdatedAt   string         `json:"updated_at"`
}

// CourierOrder represents an order assigned to a courier
type CourierOrder struct {
	ID         string `json:"id"`
	OrderID    string `json:"order_id"`
	CourierID  string `json:"courier_id"`
	Status     string `json:"status"`
	PickedUpAt *string `json:"picked_up_at,omitempty"`
	DeliveredAt *string `json:"delivered_at,omitempty"`
	CreatedAt  string `json:"created_at"`
}
