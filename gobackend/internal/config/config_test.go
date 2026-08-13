package config

import (
	"os"
	"testing"
)

func TestLoadProductionRequiresLongJWT(t *testing.T) {
	_ = os.Setenv("APP_ENV", "production")
	_ = os.Setenv("JWT_SECRET", "short")
	_ = os.Setenv("DATABASE_URL", "postgres://localhost/test")
	_ = os.Setenv("FRONTEND_APP_URL", "http://localhost:5174")
	defer os.Clearenv()

	_, err := Load()
	if err == nil {
		t.Fatal("expected validation error for short JWT_SECRET in production")
	}
}

func TestLoadDevelopmentDefaults(t *testing.T) {
	_ = os.Setenv("DATABASE_URL", "postgres://localhost/test")
	_ = os.Setenv("FRONTEND_APP_URL", "http://localhost:5174")
	_ = os.Setenv("JWT_SECRET", "dev-secret-32-chars-long-minimum")
	defer os.Clearenv()

	cfg, err := Load()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if cfg.App.Port != 4000 {
		t.Fatalf("expected default port 4000, got %d", cfg.App.Port)
	}
	if cfg.Redis.Host != "localhost" {
		t.Fatalf("expected default redis host localhost, got %s", cfg.Redis.Host)
	}
}
