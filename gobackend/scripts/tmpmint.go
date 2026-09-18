//go:build ignore

// Temporary verification helper (not part of the build). Mints a local admin
// JWT so the /analytics/visits endpoints can be smoke-tested end to end.
package main

import (
	"fmt"
	"time"

	"github.com/Sayedtaha55/ray-eg/gobackend/internal/config"
	"github.com/golang-jwt/jwt/v5"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		panic(err)
	}
	claims := jwt.MapClaims{
		"sub":   "00000000-0000-0000-0000-000000000001",
		"email": "admin@local.test",
		"role":  "admin",
		"iat":   time.Now().Unix(),
		"exp":   time.Now().Add(30 * time.Minute).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := token.SignedString([]byte(cfg.Auth.JWTSecret))
	if err != nil {
		panic(err)
	}
	fmt.Print(signed)
}
