package config

import (
	"errors"
	"fmt"
	"net/url"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/caarlos0/env/v11"
	"github.com/joho/godotenv"
)

// Config holds all application configuration. Values are loaded from environment
// variables; an optional .env file is supported for local development.
type Config struct {
	App AppConfig
	DB  DBConfig
	Redis
	HTTP HTTPConfig
	Auth AuthConfig
	Security
	RateLimit
	Log  LogConfig
	S3   S3Config
	SMTP SMTPConfig
	External
	Compression CompressionConfig
}

// AppConfig groups general application settings.
type AppConfig struct {
	Name        string `env:"APP_NAME" envDefault:"ray-backend-go"`
	Env         string `env:"APP_ENV" envDefault:"development"`
	Version     string `env:"APP_VERSION" envDefault:"0.1.0"`
	Port        int    `env:"PORT" envDefault:"4000"`
	Host        string `env:"HOST" envDefault:"0.0.0.0"`
	FrontendURL string `env:"FRONTEND_APP_URL,required"`
}

// DBConfig holds PostgreSQL connection parameters.
type DBConfig struct {
	URL             string        `env:"DATABASE_URL,required"`
	MaxOpenConns    int           `env:"DB_MAX_OPEN_CONNS" envDefault:"25"`
	MaxIdleConns    int           `env:"DB_MAX_IDLE_CONNS" envDefault:"5"`
	ConnMaxLifetime time.Duration `env:"DB_CONN_MAX_LIFETIME" envDefault:"30m"`
	ConnMaxIdleTime time.Duration `env:"DB_CONN_MAX_IDLE_TIME" envDefault:"10m"`
	MigrationsPath  string        `env:"DB_MIGRATIONS_PATH" envDefault:"./migrations"`
	MigrateOnBoot   bool          `env:"DB_MIGRATE_ON_BOOT" envDefault:"false"`
}

// Redis holds Redis settings used for cache, sessions, queues and rate limiting.
type Redis struct {
	URL         string        `env:"REDIS_URL"`
	Host        string        `env:"REDIS_HOST" envDefault:"localhost"`
	Port        int           `env:"REDIS_PORT" envDefault:"6379"`
	Password    string        `env:"REDIS_PASSWORD"`
	DB          int           `env:"REDIS_DB" envDefault:"0"`
	DialTimeout time.Duration `env:"REDIS_DIAL_TIMEOUT" envDefault:"3s"`
}

// Addr returns the Redis address as host:port.
func (r Redis) Addr() string {
	if r.URL != "" {
		return r.URL
	}
	return r.Host + ":" + strconv.Itoa(r.Port)
}

// HTTPConfig holds HTTP server tuning.
type HTTPConfig struct {
	BodyLimit        string        `env:"HTTP_BODY_LIMIT" envDefault:"10M"`
	ReadTimeout      time.Duration `env:"HTTP_READ_TIMEOUT" envDefault:"10s"`
	WriteTimeout     time.Duration `env:"HTTP_WRITE_TIMEOUT" envDefault:"30s"`
	IdleTimeout      time.Duration `env:"HTTP_IDLE_TIMEOUT" envDefault:"120s"`
	ShutdownTimeout  time.Duration `env:"HTTP_SHUTDOWN_TIMEOUT" envDefault:"15s"`
	TrustedProxies   []string      `env:"HTTP_TRUSTED_PROXIES" envSeparator:","`
	DisableKeepalive bool          `env:"HTTP_DISABLE_KEEPALIVE" envDefault:"false"`
}

// AuthConfig holds authentication secrets and cookie settings.
type AuthConfig struct {
	JWTSecret                string        `env:"JWT_SECRET,required"`
	AccessTokenExpiry        time.Duration `env:"AUTH_ACCESS_TOKEN_EXPIRY" envDefault:"15m"`
	RefreshTokenExpiry       time.Duration `env:"AUTH_REFRESH_TOKEN_EXPIRY" envDefault:"168h"`
	CookieName               string        `env:"AUTH_COOKIE_NAME" envDefault:"ray_session"`
	CookieMaxAge             time.Duration `env:"AUTH_COOKIE_MAX_AGE" envDefault:"168h"`
	CookieDomain             string        `env:"COOKIE_DOMAIN"`
	AdminBootstrapToken      string        `env:"ADMIN_BOOTSTRAP_TOKEN"`
	AdminBootstrapAllowReset bool          `env:"ADMIN_BOOTSTRAP_ALLOW_RESET" envDefault:"false"`
	AllowDevAdminBoot        bool          `env:"ALLOW_DEV_ADMIN_BOOTSTRAP" envDefault:"false"`
	AllowDevMerchantBoot     bool          `env:"ALLOW_DEV_MERCHANT_BOOTSTRAP" envDefault:"false"`
	AllowDevCourierBoot      bool          `env:"ALLOW_DEV_COURIER_BOOTSTRAP" envDefault:"false"`
	AllowDevCustomerBoot     bool          `env:"ALLOW_DEV_CUSTOMER_BOOTSTRAP" envDefault:"false"`
}

// Security groups security toggles.
type Security struct {
	CORSOrigins          []string `env:"CORS_ORIGIN" envSeparator:","`
	CSRFDisabled         bool     `env:"CSRF_DISABLED" envDefault:"false"`
	AdminIPAllowlist     []string `env:"ADMIN_IP_ALLOWLIST" envSeparator:","`
	EnableRequestSigning bool     `env:"SECURITY_ENABLE_REQUEST_SIGNING" envDefault:"false"`
}

// RateLimit configures rate limiting behavior.
type RateLimit struct {
	GlobalMax      int           `env:"GLOBAL_RATE_LIMIT_MAX" envDefault:"10000"`
	GlobalWindow   time.Duration `env:"GLOBAL_RATE_LIMIT_WINDOW" envDefault:"15m"`
	AuthMax        int           `env:"AUTH_RATE_LIMIT_MAX" envDefault:"10"`
	AuthWindow     time.Duration `env:"AUTH_RATE_LIMIT_WINDOW" envDefault:"1m"`
	AuthLockoutMax time.Duration `env:"AUTH_RATE_LIMIT_LOCKOUT_MAX" envDefault:"15m"`
}

// LogConfig holds logging configuration.
type LogConfig struct {
	Level  string `env:"LOG_LEVEL" envDefault:"info"`
	Format string `env:"LOG_FORMAT" envDefault:"json"`
}

// S3Config configures S3-compatible storage (AWS S3 / Cloudflare R2).
type S3Config struct {
	Region          string `env:"S3_REGION" envDefault:"auto"`
	Endpoint        string `env:"S3_ENDPOINT"`
	AccessKeyID     string `env:"S3_ACCESS_KEY_ID"`
	SecretAccessKey string `env:"S3_SECRET_ACCESS_KEY"`
	Bucket          string `env:"S3_BUCKET"`
	PublicBaseURL   string `env:"S3_PUBLIC_BASE_URL"`
	MaxUploadSizeMB int64  `env:"MEDIA_MAX_UPLOAD_MB" envDefault:"4096"`
}

// SMTPConfig holds email server configuration.
type SMTPConfig struct {
	Host     string `env:"SMTP_HOST"`
	Port     int    `env:"SMTP_PORT" envDefault:"587"`
	User     string `env:"SMTP_USER"`
	Password string `env:"SMTP_PASS"`
	From     string `env:"SMTP_FROM"`
	FromName string `env:"SMTP_FROM_NAME"`
	Secure   bool   `env:"SMTP_SECURE" envDefault:"false"`
}

// External groups third-party service URLs and keys.
type External struct {
	ElasticsearchURL string `env:"ELASTICSEARCH_URL" envDefault:"http://localhost:9200"`
	GeminiAPIKey     string `env:"GEMINI_API_KEY"`
	GroqAPIKey       string `env:"GROQ_API_KEY"`
	OpenAIAPIKey     string `env:"OPENAI_API_KEY"`
	SentryDSN        string `env:"SENTRY_DSN"`
	JaegerEndpoint   string `env:"JAEGER_ENDPOINT"`
	VAPIDSubject     string `env:"VAPID_SUBJECT"`
	VAPIDPublicKey   string `env:"VAPID_PUBLIC_KEY"`
	VAPIDPrivateKey  string `env:"VAPID_PRIVATE_KEY"`
}

// CompressionConfig holds image compression settings.
type CompressionConfig struct {
	Enabled        bool   `env:"COMPRESSION_ENABLED" envDefault:"true"`
	DefaultQuality string `env:"COMPRESSION_DEFAULT_QUALITY" envDefault:"high"`
	MaxWidth       int    `env:"COMPRESSION_MAX_WIDTH" envDefault:"2560"`
	MaxHeight      int    `env:"COMPRESSION_MAX_HEIGHT" envDefault:"2560"`
	TargetFormat   string `env:"COMPRESSION_TARGET_FORMAT" envDefault:"webp"`
	StripMetadata  bool   `env:"COMPRESSION_STRIP_METADATA" envDefault:"true"`
	EnableMultiple bool   `env:"COMPRESSION_ENABLE_MULTIPLE" envDefault:"true"`
}

// Load reads environment variables, optionally loads .env files, and validates
// the resulting configuration. In production it fails fast on missing secrets.
func Load() (*Config, error) {
	loadDotEnv()

	var cfg Config
	if err := env.Parse(&cfg); err != nil {
		return nil, fmt.Errorf("failed to parse config: %w", err)
	}

	cfg.App.Env = strings.ToLower(cfg.App.Env)

	if err := cfg.validate(); err != nil {
		return nil, err
	}

	return &cfg, nil
}

func loadDotEnv() {
	// Load .env files in order of precedence; missing files are ignored.
	_ = godotenv.Load(".env.local")
	if env := os.Getenv("APP_ENV"); env != "" {
		_ = godotenv.Load(filepath.Join(".env." + env + ".local"))
		_ = godotenv.Load(filepath.Join(".env." + env))
	}
	_ = godotenv.Load(".env")
}

func (c *Config) validate() error {
	if c.App.Port < 1 || c.App.Port > 65535 {
		return fmt.Errorf("PORT must be between 1 and 65535")
	}
	if c.DB.MaxOpenConns < 1 {
		return fmt.Errorf("DB_MAX_OPEN_CONNS must be greater than 0")
	}
	if c.DB.MaxIdleConns < 0 {
		return fmt.Errorf("DB_MAX_IDLE_CONNS cannot be negative")
	}
	if c.DB.MaxIdleConns > c.DB.MaxOpenConns {
		return fmt.Errorf("DB_MAX_IDLE_CONNS cannot exceed DB_MAX_OPEN_CONNS")
	}
	if err := validatePositiveDuration("DB_CONN_MAX_LIFETIME", c.DB.ConnMaxLifetime); err != nil {
		return err
	}
	if err := validatePositiveDuration("DB_CONN_MAX_IDLE_TIME", c.DB.ConnMaxIdleTime); err != nil {
		return err
	}
	if c.Redis.Port < 1 || c.Redis.Port > 65535 {
		return fmt.Errorf("REDIS_PORT must be between 1 and 65535")
	}
	if err := validatePositiveDuration("REDIS_DIAL_TIMEOUT", c.Redis.DialTimeout); err != nil {
		return err
	}
	if err := validatePositiveDuration("HTTP_READ_TIMEOUT", c.HTTP.ReadTimeout); err != nil {
		return err
	}
	if err := validatePositiveDuration("HTTP_WRITE_TIMEOUT", c.HTTP.WriteTimeout); err != nil {
		return err
	}
	if err := validatePositiveDuration("HTTP_IDLE_TIMEOUT", c.HTTP.IdleTimeout); err != nil {
		return err
	}
	if err := validatePositiveDuration("HTTP_SHUTDOWN_TIMEOUT", c.HTTP.ShutdownTimeout); err != nil {
		return err
	}
	if c.RateLimit.GlobalMax < 1 {
		return fmt.Errorf("GLOBAL_RATE_LIMIT_MAX must be greater than 0")
	}
	if c.RateLimit.AuthMax < 1 {
		return fmt.Errorf("AUTH_RATE_LIMIT_MAX must be greater than 0")
	}
	if err := validatePositiveDuration("GLOBAL_RATE_LIMIT_WINDOW", c.RateLimit.GlobalWindow); err != nil {
		return err
	}
	if err := validatePositiveDuration("AUTH_RATE_LIMIT_WINDOW", c.RateLimit.AuthWindow); err != nil {
		return err
	}
	if err := validatePositiveDuration("AUTH_RATE_LIMIT_LOCKOUT_MAX", c.RateLimit.AuthLockoutMax); err != nil {
		return err
	}
	if c.S3.MaxUploadSizeMB < 1 {
		return fmt.Errorf("MEDIA_MAX_UPLOAD_MB must be greater than 0")
	}
	if c.Compression.MaxWidth < 1 || c.Compression.MaxHeight < 1 {
		return fmt.Errorf("COMPRESSION_MAX_WIDTH and COMPRESSION_MAX_HEIGHT must be greater than 0")
	}

	if err := validateHTTPURL("FRONTEND_APP_URL", c.App.FrontendURL); err != nil {
		return err
	}

	for _, origin := range c.Security.CORSOrigins {
		origin = strings.TrimSpace(origin)
		if origin == "" || origin == "*" {
			continue
		}
		if err := validateHTTPURL("CORS_ORIGIN", origin); err != nil {
			return err
		}
	}

	if c.App.Env == "production" {
		if len(c.Auth.JWTSecret) < 32 {
			return errors.New("JWT_SECRET must be at least 32 characters in production")
		}
		if c.Auth.AdminBootstrapToken == "change-this-to-secure-random-string-in-production" {
			return errors.New("ADMIN_BOOTSTRAP_TOKEN is using default value in production")
		}
		if c.Security.CSRFDisabled {
			return errors.New("CSRF_DISABLED cannot be true in production")
		}
		if containsWildcard(c.Security.CORSOrigins) {
			return errors.New("CORS_ORIGIN wildcard (*) is not allowed in production")
		}
	}

	// Validate Redis config consistency.
	if c.Redis.URL == "" && c.Redis.Host == "" {
		// In production Redis is required for distributed features.
		if c.App.Env == "production" {
			return errors.New("REDIS_URL or REDIS_HOST must be set in production")
		}
	}

	return nil
}

func containsWildcard(origins []string) bool {
	for _, o := range origins {
		if strings.TrimSpace(o) == "*" {
			return true
		}
	}
	return false
}

func validatePositiveDuration(name string, value time.Duration) error {
	if value <= 0 {
		return fmt.Errorf("%s must be greater than 0", name)
	}
	return nil
}

func validateHTTPURL(name, raw string) error {
	parsed, err := url.ParseRequestURI(strings.TrimSpace(raw))
	if err != nil || parsed.Scheme == "" || parsed.Host == "" {
		return fmt.Errorf("%s must be a valid absolute URL", name)
	}
	if parsed.Scheme != "http" && parsed.Scheme != "https" {
		return fmt.Errorf("%s must use http or https", name)
	}
	return nil
}

// IsProduction returns true when running in production mode.
func (c *Config) IsProduction() bool {
	return c.App.Env == "production"
}

// IsDevelopment returns true when running in development mode.
func (c *Config) IsDevelopment() bool {
	return c.App.Env == "development" || c.App.Env == "dev" || c.App.Env == ""
}

// Addr returns the host:port string for the HTTP server.
func (c *Config) Addr() string {
	return c.App.Host + ":" + strconv.Itoa(c.App.Port)
}
