package redis

import (
	"context"
	"fmt"
	"os"
	"time"

	"github.com/redis/go-redis/v9"
)

// Client wraps go-redis with lifecycle helpers.
type Client struct {
	redis.UniversalClient
}

// New creates a Redis client from the REDIS_URL env var.
// Returns nil if REDIS_URL is not set (degraded mode — no cache/rate-limit).
func New(ctx context.Context) *Client {
	url := os.Getenv("REDIS_URL")
	if url == "" {
		url = "redis://localhost:6379"
	}

	opt, err := redis.ParseURL(url)
	if err != nil {
		// Fallback to standalone client.
		client := redis.NewClient(&redis.Options{
			Addr:         "localhost:6379",
			DialTimeout:  3 * time.Second,
			ReadTimeout:  3 * time.Second,
			WriteTimeout: 3 * time.Second,
			PoolSize:     20,
			MinIdleConns: 5,
			MaxRetries:   3,
		})
		return &Client{UniversalClient: client}
	}

	client := redis.NewClient(opt)
	return &Client{UniversalClient: client}
}

// IsHealthy pings Redis and returns true if reachable.
func (c *Client) IsHealthy(ctx context.Context) bool {
	if c == nil || c.UniversalClient == nil {
		return false
	}
	ctx, cancel := context.WithTimeout(ctx, 2*time.Second)
	defer cancel()
	return c.UniversalClient.Ping(ctx).Err() == nil
}

// Close closes the Redis connection.
func (c *Client) Close() error {
	if c == nil || c.UniversalClient == nil {
		return nil
	}
	return c.UniversalClient.Close()
}

// Cache provides simple get/set with TTL.
type Cache struct {
	client *Client
	prefix string
}

func NewCache(client *Client, prefix string) *Cache {
	if prefix == "" {
		prefix = "saas"
	}
	return &Cache{client: client, prefix: prefix}
}

func (c *Cache) key(k string) string {
	return fmt.Sprintf("%s:%s", c.prefix, k)
}

// Get retrieves a cached value. Returns empty string and nil if not found.
func (c *Cache) Get(ctx context.Context, key string) (string, error) {
	if c.client == nil {
		return "", nil
	}
	val, err := c.client.UniversalClient.Get(ctx, c.key(key)).Result()
	if err == redis.Nil {
		return "", nil
	}
	return val, err
}

// Set stores a value with TTL.
func (c *Cache) Set(ctx context.Context, key, value string, ttl time.Duration) error {
	if c.client == nil {
		return nil
	}
	return c.client.UniversalClient.Set(ctx, c.key(key), value, ttl).Err()
}

// Del removes a key.
func (c *Cache) Del(ctx context.Context, keys ...string) error {
	if c.client == nil {
		return nil
	}
	fullKeys := make([]string, len(keys))
	for i, k := range keys {
		fullKeys[i] = c.key(k)
	}
	return c.client.UniversalClient.Del(ctx, fullKeys...).Err()
}

// Exists checks if a key exists.
func (c *Cache) Exists(ctx context.Context, key string) (bool, error) {
	if c.client == nil {
		return false, nil
	}
	n, err := c.client.UniversalClient.Exists(ctx, c.key(key)).Result()
	return n > 0, err
}
