package mapdomain

// MapPin represents a map pin returned by the API
type MapPin struct {
	ID           string   `json:"id,omitempty"`
	Slug         string   `json:"slug,omitempty"`
	Type         string   `json:"type"`
	Title        string   `json:"title,omitempty"`
	AddressLabel string   `json:"addressLabel,omitempty"`
	City         string   `json:"city,omitempty"`
	Latitude     *float64 `json:"latitude"`
	Longitude    *float64 `json:"longitude"`
}

// MapPinsResponse represents a map pins response
type MapPinsResponse struct {
	Success bool     `json:"success"`
	Data    []MapPin `json:"data,omitempty"`
	Error   string   `json:"error,omitempty"`
}
