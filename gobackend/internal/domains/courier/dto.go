package courier

// CourierResponse represents a courier response
type CourierResponse struct {
	Success bool     `json:"success"`
	Data    *Courier `json:"data,omitempty"`
	Error   string   `json:"error,omitempty"`
}

// CouriersListResponse represents a list of couriers response
type CouriersListResponse struct {
	Success bool      `json:"success"`
	Data    []Courier `json:"data,omitempty"`
	Total   int64     `json:"total,omitempty"`
	Error   string    `json:"error,omitempty"`
}
