package telemetry

import (
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/prometheus/client_golang/prometheus"
)

// Metrics bundles all application-level Prometheus metrics.
type Metrics struct {
	HTTPRequestDuration *prometheus.HistogramVec
	HTTPRequestTotal    *prometheus.CounterVec
	DBQueryDuration     *prometheus.HistogramVec
	CacheHits           prometheus.Counter
	CacheMisses         prometheus.Counter
}

// Register creates and registers default metrics with the default registry.
func Register(appName string) (*Metrics, error) {
	httpDur := prometheus.NewHistogramVec(prometheus.HistogramOpts{
		Name:    "http_request_duration_seconds",
		Help:    "HTTP request duration distribution",
		Buckets: prometheus.DefBuckets,
	}, []string{"method", "route", "status"})

	httpTotal := prometheus.NewCounterVec(prometheus.CounterOpts{
		Name: "http_requests_total",
		Help: "Total HTTP requests",
	}, []string{"method", "route", "status"})

	dbDur := prometheus.NewHistogramVec(prometheus.HistogramOpts{
		Name:    "db_query_duration_seconds",
		Help:    "Database query duration distribution",
		Buckets: prometheus.ExponentialBuckets(0.0001, 2, 15),
	}, []string{"query", "table"})

	cacheHits := prometheus.NewCounter(prometheus.CounterOpts{
		Name: "cache_hits_total",
		Help: "Total cache hits",
	})
	cacheMisses := prometheus.NewCounter(prometheus.CounterOpts{
		Name: "cache_misses_total",
		Help: "Total cache misses",
	})

	for _, c := range []prometheus.Collector{httpDur, httpTotal, dbDur, cacheHits, cacheMisses} {
		if err := prometheus.Register(c); err != nil {
			return nil, err
		}
	}

	return &Metrics{
		HTTPRequestDuration: httpDur,
		HTTPRequestTotal:    httpTotal,
		DBQueryDuration:     dbDur,
		CacheHits:           cacheHits,
		CacheMisses:         cacheMisses,
	}, nil
}

// FiberMiddleware returns a Fiber middleware that records Prometheus metrics.
func (m *Metrics) FiberMiddleware() fiber.Handler {
	return func(c *fiber.Ctx) error {
		start := time.Now()
		err := c.Next()
		duration := time.Since(start).Seconds()

		status := c.Response().StatusCode()
		method := c.Method()
		route := c.Route().Path
		if route == "" {
			route = c.Path()
		}
		statusStr := strconv.Itoa(status)

		m.HTTPRequestDuration.WithLabelValues(method, route, statusStr).Observe(duration)
		m.HTTPRequestTotal.WithLabelValues(method, route, statusStr).Inc()

		return err
	}
}

// RecordDBQuery records the duration of a database query.
func (m *Metrics) RecordDBQuery(query, table string, duration time.Duration) {
	m.DBQueryDuration.WithLabelValues(query, table).Observe(duration.Seconds())
}
