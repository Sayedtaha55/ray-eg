package middleware

import (
	"context"
	"strconv"
	"strings"
	"time"

	"github.com/Sayedtaha55/ray-eg/gobackend/internal/config"
	"github.com/Sayedtaha55/ray-eg/gobackend/internal/platform/errors"
	"github.com/gofiber/fiber/v2"
	"github.com/redis/go-redis/v9"
	"github.com/ulule/limiter/v3"
	"github.com/ulule/limiter/v3/drivers/store/memory"
	sredis "github.com/ulule/limiter/v3/drivers/store/redis"
	"go.uber.org/zap"
)

// RateLimiter wraps an ulule/limiter instance and exposes Fiber middleware.
type RateLimiter struct {
	global *limiter.Limiter
	auth   *limiter.Limiter
}

// NewRateLimiter creates the global and auth limiters backed by Redis when
// available, otherwise in-memory.
func NewRateLimiter(cfg *config.Config, client redis.UniversalClient) (*RateLimiter, error) {
	globalStore, err := newStore(client, "rl_global", limiter.Rate{
		Period: cfg.RateLimit.GlobalWindow,
		Limit:  int64(cfg.RateLimit.GlobalMax),
	})
	if err != nil {
		return nil, err
	}

	authStore, err := newStore(client, "rl_auth", limiter.Rate{
		Period: cfg.RateLimit.AuthWindow,
		Limit:  int64(cfg.RateLimit.AuthMax),
	})
	if err != nil {
		return nil, err
	}

	return &RateLimiter{
		global: limiter.New(globalStore, limiter.Rate{
			Period: cfg.RateLimit.GlobalWindow,
			Limit:  int64(cfg.RateLimit.GlobalMax),
		}),
		auth: limiter.New(authStore, limiter.Rate{
			Period: cfg.RateLimit.AuthWindow,
			Limit:  int64(cfg.RateLimit.AuthMax),
		}),
	}, nil
}

// Global middleware applies the global rate limit to every request.
func (rl *RateLimiter) Global() fiber.Handler {
	return rl.handle(rl.global, "global")
}

// Auth middleware applies a stricter rate limit to authentication endpoints.
func (rl *RateLimiter) Auth() fiber.Handler {
	return func(c *fiber.Ctx) error {
		if !isAuthPath(c.Path()) {
			return c.Next()
		}
		return rl.handle(rl.auth, "auth")(c)
	}
}

func (rl *RateLimiter) handle(instance *limiter.Limiter, _ string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		key := c.IP()
		if key == "" {
			key = "unknown"
		}

		ctx, cancel := context.WithTimeout(c.UserContext(), 2*time.Second)
		defer cancel()

		limitCtx, err := instance.Get(ctx, key)
		if err != nil {
			zap.L().Warn("rate limiter error", zap.Error(err), zap.String("path", c.Path()))
			return c.Next()
		}

		setRateHeaders(c, limitCtx)

		if limitCtx.Reached {
			retryAfter := time.Until(time.Unix(limitCtx.Reset, 0)).Seconds()
			if retryAfter < 1 {
				retryAfter = 1
			}
			c.Set("Retry-After", strconv.Itoa(int(retryAfter)))
			return errors.RateLimit("تم تجاوز عدد الطلبات المسموح به. حاول مرة أخرى لاحقاً.")
		}

		return c.Next()
	}
}

func newStore(client redis.UniversalClient, prefix string, _ limiter.Rate) (limiter.Store, error) {
	if client == nil {
		return memory.NewStore(), nil
	}

	// The ulule redis store expects a concrete *redis.Client. If Redis is
	// running in cluster mode we fall back to the in-memory store for now.
	c, ok := client.(*redis.Client)
	if !ok {
		zap.L().Warn("redis cluster not supported by ulule limiter, falling back to memory store", zap.String("prefix", prefix))
		return memory.NewStore(), nil
	}

	store, err := sredis.NewStoreWithOptions(c, limiter.StoreOptions{
		Prefix: prefix,
	})
	if err != nil {
		return nil, err
	}
	return store, nil
}

func setRateHeaders(c *fiber.Ctx, ctx limiter.Context) {
	c.Set("X-RateLimit-Limit", strconv.FormatInt(ctx.Limit, 10))
	c.Set("X-RateLimit-Remaining", strconv.FormatInt(ctx.Remaining, 10))
	c.Set("X-RateLimit-Reset", time.Unix(ctx.Reset, 0).Format(time.RFC3339))
}

func isAuthPath(path string) bool {
	prefixes := []string{
		"/api/v1/auth/login",
		"/api/v1/auth/signup",
		"/api/v1/auth/courier-signup",
		"/api/v1/auth/password/forgot",
		"/api/v1/auth/password/reset",
		"/api/v1/auth/bootstrap-admin",
		"/api/v1/auth/google",
		"/api/v1/auth/dev-merchant-login",
		"/api/v1/auth/dev-courier-login",
		"/api/v1/auth/dev-portal-login",
		// 2FA endpoints: brute-force protection on TOTP verification.
		"/api/v1/auth/2fa/verify",
		"/api/v1/auth/2fa/enable",
		"/api/v1/auth/2fa/generate",
		"/api/v1/auth/2fa/confirm",
	}
	path = strings.ToLower(path)
	for _, p := range prefixes {
		if strings.HasPrefix(path, p) {
			return true
		}
	}
	return false
}
