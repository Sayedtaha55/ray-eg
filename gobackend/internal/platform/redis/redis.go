package redis

import (
	"context"
	"fmt"
	"time"

	"github.com/Sayedtaha55/ray-eg/gobackend/internal/config"
	"github.com/redis/go-redis/v9"
	"go.uber.org/zap"
)

// Client wraps go-redis with lifecycle helpers.
type Client struct {
	redis.UniversalClient
	cfg config.Redis
	log *zap.Logger
}

// New creates a Redis client from configuration. If Redis is unavailable it
// still returns a client; callers should check IsHealthy before using it for
// features that require Redis (rate limiting, queues, etc.).
func New(cfg config.Redis, log *zap.Logger) *Client {
	var client redis.UniversalClient
	if cfg.URL != "" {
		opt, err := redis.ParseURL(cfg.URL)
		if err != nil {
			log.Warn("failed to parse REDIS_URL, falling back to host/port", zap.Error(err))
			client = standaloneClient(cfg)
		} else {
			client = redis.NewClient(opt)
		}
	} else {
		client = standaloneClient(cfg)
	}

	return &Client{UniversalClient: client, cfg: cfg, log: log}
}

func standaloneClient(cfg config.Redis) redis.UniversalClient {
	return redis.NewClient(&redis.Options{
		Addr:            fmt.Sprintf("%s:%d", cfg.Host, cfg.Port),
		Password:        cfg.Password,
		DB:              cfg.DB,
		DialTimeout:     cfg.DialTimeout,
		ReadTimeout:     3 * time.Second,
		WriteTimeout:    3 * time.Second,
		PoolSize:        20,
		MinIdleConns:    5,
		MaxRetries:      3,
		MinRetryBackoff: 100 * time.Millisecond,
		MaxRetryBackoff: 2 * time.Second,
	})
}

// IsHealthy pings Redis and returns true if reachable.
func (c *Client) IsHealthy(ctx context.Context) bool {
	if c.UniversalClient == nil {
		return false
	}
	ctx, cancel := context.WithTimeout(ctx, 2*time.Second)
	defer cancel()
	return c.Ping(ctx).Err() == nil
}

// Close closes the Redis connection.
func (c *Client) Close() error {
	if c.UniversalClient != nil {
		return c.UniversalClient.Close()
	}
	return nil
}
