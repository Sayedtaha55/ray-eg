//go:build ignore

package main

import (
	"fmt"
	"os"
	"strings"

	"github.com/Sayedtaha55/ray-eg/gobackend/internal/config"
	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/pgx/v5"
	_ "github.com/golang-migrate/migrate/v4/source/file"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		fmt.Fprintf(os.Stderr, "config load failed: %v\n", err)
		os.Exit(1)
	}

	if len(os.Args) < 2 {
		fmt.Fprintf(os.Stderr, "usage: go run scripts/migrate.go [up|down|version]\n")
		os.Exit(1)
	}

	command := os.Args[1]
	dbURL := cfg.DB.URL
	if strings.HasPrefix(dbURL, "postgresql://") {
		dbURL = "pgx5" + strings.TrimPrefix(dbURL, "postgresql")
	} else if strings.HasPrefix(dbURL, "postgres://") {
		dbURL = "pgx5" + strings.TrimPrefix(dbURL, "postgres")
	}

	m, err := migrate.New("file://"+cfg.DB.MigrationsPath, dbURL)
	if err != nil {
		fmt.Fprintf(os.Stderr, "create migrator failed: %v\n", err)
		os.Exit(1)
	}

	switch command {
	case "up":
		err = m.Up()
	case "down":
		err = m.Down()
	case "version":
		v, dirty, errV := m.Version()
		if errV != nil {
			fmt.Fprintf(os.Stderr, "version failed: %v\n", errV)
			os.Exit(1)
		}
		fmt.Printf("version: %d dirty: %v\n", v, dirty)
		return
	default:
		fmt.Fprintf(os.Stderr, "unknown command: %s\n", command)
		os.Exit(1)
	}

	if err != nil && err.Error() != "no change" {
		fmt.Fprintf(os.Stderr, "migration failed: %v\n", err)
		os.Exit(1)
	}
}
