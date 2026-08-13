package middleware

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/Sayedtaha55/ray-eg/saas-backend/internal/redis"
	"github.com/gofiber/fiber/v2"
)

// CacheMiddleware provides Redis-backed caching for GET responses.
// It caches responses by URL path + tenant domain.
type CacheMiddleware struct {
	cache *redis.Cache
	ttl   time.Duration
}

func NewCacheMiddleware(cache *redis.Cache, ttl time.Duration) *CacheMiddleware {
	if ttl == 0 {
		ttl = 5 * time.Minute
	}
	return &CacheMiddleware{cache: cache, ttl: ttl}
}

// Middleware returns a Fiber middleware that caches GET responses.
func (m *CacheMiddleware) Middleware() fiber.Handler {
	return func(c *fiber.Ctx) error {
		if c.Method() != fiber.MethodGet {
			return c.Next()
		}

		// Don't cache if no Redis.
		if m.cache == nil {
			return c.Next()
		}

		cacheKey := m.buildKey(c)

		// Try cache.
		cached, err := m.cache.Get(c.UserContext(), cacheKey)
		if err == nil && cached != "" {
			var data struct {
				Body    []byte `json:"body"`
				Headers map[string]string `json:"headers"`
			}
			if err := json.Unmarshal([]byte(cached), &data); err == nil {
				for k, v := range data.Headers {
					c.Set(k, v)
				}
				c.Set("X-Cache", "HIT")
				return c.Send(data.Body)
			}
		}

		// Cache miss — proceed to handler.
		err = c.Next()
		if err != nil {
			return err
		}

		// Only cache successful responses.
		if c.Response().StatusCode() >= 200 && c.Response().StatusCode() < 300 {
			headers := map[string]string{
				"Content-Type": c.GetRespHeader("Content-Type"),
			}
			data := struct {
				Body    []byte `json:"body"`
				Headers map[string]string `json:"headers"`
			}{
				Body:    c.Response().Body(),
				Headers: headers,
			}
			if encoded, err := json.Marshal(data); err == nil {
				_ = m.cache.Set(c.UserContext(), cacheKey, string(encoded), m.ttl)
			}
			c.Set("X-Cache", "MISS")
		}

		return nil
	}
}

func (m *CacheMiddleware) buildKey(c *fiber.Ctx) string {
	tenant := c.Get("X-Tenant-Domain")
	if tenant == "" {
		tenant = "global"
	}
	return fmt.Sprintf("cache:%s:%s", tenant, c.OriginalURL())
}

// InvalidateCache removes cached entries for a store.
func (m *CacheMiddleware) InvalidateCache(ctx context.Context, storeID string, patterns ...string) {
	if m.cache == nil {
		return
	}
	for _, p := range patterns {
		_ = m.cache.Del(ctx, fmt.Sprintf("cache:%s", p))
	}
}
