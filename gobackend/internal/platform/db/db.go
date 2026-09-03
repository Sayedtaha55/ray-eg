package db

import (
	"context"
	"errors"
	"fmt"
	"net/url"
	"strings"
	"time"

	"github.com/Sayedtaha55/ray-eg/gobackend/internal/config"
	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/pgx/v5"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	"github.com/jackc/pgx/v5/pgxpool"
	"go.uber.org/zap"
)

// Pool wraps pgxpool.Pool with lifecycle helpers.
type Pool struct {
	*pgxpool.Pool
	cfg config.DBConfig
}

// New creates a new pgx connection pool and optionally runs migrations.
func New(ctx context.Context, cfg config.DBConfig, log *zap.Logger) (*Pool, error) {
	if err := validateURL(cfg.URL); err != nil {
		return nil, fmt.Errorf("invalid DATABASE_URL: %w", err)
	}

	// The DATABASE_URL may carry Prisma-only query parameters (e.g. `schema`)
	// that the pgx driver forwards to the server, which rejects them with
	// "unrecognized configuration parameter". Strip those so the pool can
	// connect; otherwise the whole backend starts with a nil pool and every
	// /api/v1 route returns "Cannot POST …".
	cleanURL, err := stripPrismaOnlyParams(cfg.URL)
	if err != nil {
		return nil, fmt.Errorf("normalize DATABASE_URL: %w", err)
	}

	pgxCfg, err := pgxpool.ParseConfig(cleanURL)
	if err != nil {
		return nil, fmt.Errorf("parse database url: %w", err)
	}

	pgxCfg.MaxConns = int32(cfg.MaxOpenConns)
	pgxCfg.MinConns = int32(cfg.MaxIdleConns)
	pgxCfg.MaxConnLifetime = cfg.ConnMaxLifetime
	pgxCfg.MaxConnIdleTime = cfg.ConnMaxIdleTime
	pgxCfg.HealthCheckPeriod = 30 * time.Second

	pool, err := pgxpool.NewWithConfig(ctx, pgxCfg)
	if err != nil {
		return nil, fmt.Errorf("create pool: %w", err)
	}

	// Verify connectivity with a short timeout.
	pingCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()
	if err := pool.Ping(pingCtx); err != nil {
		pool.Close()
		return nil, fmt.Errorf("ping database: %w", err)
	}

	p := &Pool{Pool: pool, cfg: cfg}

	if cfg.MigrateOnBoot {
		if err := p.MigrateUp(); err != nil {
			log.Error("migration failed", zap.Error(err))
			return nil, err
		}
	}

	log.Info("database connected",
		zap.String("host", pgxCfg.ConnConfig.Host),
		zap.Int32("max_conns", pgxCfg.MaxConns),
	)

	return p, nil
}

// Close releases the pool.
func (p *Pool) Close() {
	if p.Pool != nil {
		p.Pool.Close()
	}
}

// MigrateUp applies pending migrations from the configured migrations path.
func (p *Pool) MigrateUp() error {
	m, err := migrate.New(
		"file://"+p.cfg.MigrationsPath,
		toMigrateURL(p.cfg.URL),
	)
	if err != nil {
		return fmt.Errorf("create migrator: %w", err)
	}
	if err := m.Up(); err != nil && !errors.Is(err, migrate.ErrNoChange) {
		return fmt.Errorf("migrate up: %w", err)
	}
	return nil
}

// toMigrateURL rewrites postgres/postgresql schemes to the pgx5 driver scheme
// expected by golang-migrate.
func toMigrateURL(raw string) string {
	if strings.HasPrefix(raw, "postgresql://") {
		return "pgx5" + strings.TrimPrefix(raw, "postgresql")
	}
	if strings.HasPrefix(raw, "postgres://") {
		return "pgx5" + strings.TrimPrefix(raw, "postgres")
	}
	return raw
}

func validateURL(raw string) error {
	u, err := url.Parse(raw)
	if err != nil {
		return err
	}
	if u.Scheme != "postgres" && u.Scheme != "postgresql" {
		return fmt.Errorf("expected postgres:// or postgresql:// scheme")
	}
	if u.Host == "" {
		return fmt.Errorf("missing host")
	}
	return nil
}

// stripPrismaOnlyParams removes query parameters that are specific to Prisma
// and not understood by PostgreSQL/pgx (e.g. `schema=public`). Keeping them in
// the URL causes a FATAL "unrecognized configuration parameter" error.
func stripPrismaOnlyParams(raw string) (string, error) {
	u, err := url.Parse(raw)
	if err != nil {
		return "", err
	}
	q := u.Query()
	if q.Has("schema") {
		q.Del("schema")
		u.RawQuery = q.Encode()
	}
	return u.String(), nil
}
