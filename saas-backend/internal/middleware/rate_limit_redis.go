package middleware

import (
	"context"
	"fmt"
	"os"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/limiter"
	"github.com/redis/go-redis/v9"
)

// RedisRateLimiter creates a Fiber rate limiter backed by Redis.
// Falls back to in-memory if Redis client is nil.
func RedisRateLimiter(client redis.UniversalClient) fiber.Handler {
	rpm := 100
	if v := os.Getenv("RATE_LIMIT_RPM"); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n > 0 {
			rpm = n
		}
	}

	cfg := limiter.Config{
		Max:        rpm,
		Expiration: 60 * time.Second,
		KeyGenerator: func(c *fiber.Ctx) string {
			return c.IP()
		},
		LimitReached: func(c *fiber.Ctx) error {
			return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{
				"error":   "rate_limit_exceeded",
				"message": fmt.Sprintf("Rate limit: %d requests per minute", rpm),
			})
		},
	}

	if client != nil {
		cfg.Storage = &redisStorage{client: client}
	}

	return limiter.New(cfg)
}

// redisStorage implements fiber.Storage interface for the limiter middleware.
type redisStorage struct {
	client redis.UniversalClient
}

func (r *redisStorage) Get(key string) []byte {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()
	val, err := r.client.Get(ctx, "rl:"+key).Bytes()
	if err != nil {
		return nil
	}
	return val
}

func (r *redisStorage) Set(key string, val []byte, exp time.Duration) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()
	r.client.Set(ctx, "rl:"+key, val, exp)
}

func (r *redisStorage) Delete(key string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()
	return r.client.Del(ctx, "rl:"+key).Err()
}

func (r *redisStorage) Reset() {
	// No-op: we don't want to flush the entire Redis DB.
}

func (r *redisStorage) Close() error {
	// Don't close the shared client here.
	return nil
}
