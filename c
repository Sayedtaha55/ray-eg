package middleware

import (
	"sync"
	"time"

	"github.com/gofiber/fiber/v2"
)

// CircuitState represents the state of a circuit breaker.
type CircuitState string

const (
	CircuitClosed    CircuitState = "closed"
	CircuitOpen      CircuitState = "open"
	CircuitHalfOpen  CircuitState = "half-open"
)

// CircuitBreakerOptions configures the circuit breaker behavior.
type CircuitBreakerOptions struct {
	FailureThreshold  int           // Number of failures before opening the circuit
	ResetTimeout      time.Duration // Time before trying half-open state
	HalfOpenMaxAttempts int         // Max attempts in half-open before reopening
}

// CircuitBreaker protects the service from cascading failures by opening
// the circuit when too many 5xx responses occur.
type CircuitBreaker struct {
	mu               sync.Mutex
	state            CircuitState
	failureCount     int
	lastFailureTime  time.Time
	halfOpenAttempts int
	opts             CircuitBreakerOptions
}

// NewCircuitBreaker creates a circuit breaker with default options.
func NewCircuitBreaker(opts ...CircuitBreakerOptions) *CircuitBreaker {
	o := CircuitBreakerOptions{
		FailureThreshold:   5,
		ResetTimeout:       30 * time.Second,
		HalfOpenMaxAttempts: 3,
	}
	if len(opts) > 0 {
		if opts[0].FailureThreshold > 0 {
			o.FailureThreshold = opts[0].FailureThreshold
		}
		if opts[0].ResetTimeout > 0 {
			o.ResetTimeout = opts[0].ResetTimeout
		}
		if opts[0].HalfOpenMaxAttempts > 0 {
			o.HalfOpenMaxAttempts = opts[0].HalfOpenMaxAttempts
		}
	}
	return &CircuitBreaker{state: CircuitClosed, opts: o}
}

// Middleware returns a Fiber handler that wraps the circuit breaker logic.
func (cb *CircuitBreaker) Middleware() fiber.Handler {
	return func(c *fiber.Ctx) error {
		cb.mu.Lock()
		if cb.state == CircuitOpen {
			elapsed := time.Since(cb.lastFailureTime)
			if elapsed >= cb.opts.ResetTimeout {
				cb.state = CircuitHalfOpen
				cb.halfOpenAttempts = 0
			} else {
				cb.mu.Unlock()
				return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
					"error":        "Service Unavailable",
					"message":      "Circuit breaker is open — please retry later",
					"retryAfterMs": (cb.opts.ResetTimeout - elapsed).Milliseconds(),
				})
			}
		}

		if cb.state == CircuitHalfOpen && cb.halfOpenAttempts >= cb.opts.HalfOpenMaxAttempts {
			cb.state = CircuitOpen
			cb.lastFailureTime = time.Now()
			cb.mu.Unlock()
			return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
				"error":        "Service Unavailable",
				"message":      "Circuit breaker is open — please retry later",
				"retryAfterMs": cb.opts.ResetTimeout.Milliseconds(),
			})
		}

		if cb.state == CircuitHalfOpen {
			cb.halfOpenAttempts++
		}
		cb.mu.Unlock()

		// Call the next handler and track the response status.
		err := c.Next()

		cb.mu.Lock()
		defer cb.mu.Unlock()

		status := c.Response().StatusCode()
		if status >= 500 {
			cb.onFailureLocked()
		} else if status < 400 {
			cb.onSuccessLocked()
		}

		return err
	}
}

// GetState returns the current circuit state.
func (cb *CircuitBreaker) GetState() CircuitState {
	cb.mu.Lock()
	defer cb.mu.Unlock()
	return cb.state
}

// GetStats returns circuit breaker statistics.
func (cb *CircuitBreaker) GetStats() map[string]any {
	cb.mu.Lock()
	defer cb.mu.Unlock()
	return map[string]any{
		"state":             cb.state,
		"failureCount":      cb.failureCount,
		"lastFailureTime":   cb.lastFailureTime,
		"halfOpenAttempts":  cb.halfOpenAttempts,
	}
}

func (cb *CircuitBreaker) onSuccessLocked() {
	if cb.state == CircuitHalfOpen {
		cb.state = CircuitClosed
		cb.failureCount = 0
		cb.halfOpenAttempts = 0
	}
}

func (cb *CircuitBreaker) onFailureLocked() {
	cb.failureCount++
	cb.lastFailureTime = time.Now()

	if cb.state == CircuitHalfOpen {
		cb.state = CircuitOpen
		return
	}

	if cb.failureCount >= cb.opts.FailureThreshold {
		cb.state = CircuitOpen
	}
}