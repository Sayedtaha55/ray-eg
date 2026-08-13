package storage

import (
	"context"
	"fmt"
	"os"
	"path"
	"strings"
	"time"
)

// Storage is the interface for file storage backends.
type Storage interface {
	// PresignUpload returns a URL the client can PUT to directly.
	// For local storage, this returns a relative URL pointing to our upload endpoint.
	PresignUpload(ctx context.Context, key, contentType string, expires time.Duration) (string, error)
	// PublicURL returns the publicly accessible URL for a key.
	PublicURL(key string) string
	// MakeKey builds a storage key for a store media file.
	MakeKey(storeID, purpose, filename string) string
	// IsValidPublicURL checks whether a URL belongs to this storage.
	IsValidPublicURL(raw string) bool
	// SaveFile saves bytes to local storage (only for local backend).
	SaveFile(key string, data []byte, contentType string) error
	// Backend returns the storage type name.
	Backend() string
}

// New creates a storage backend from env vars.
// If S3_BUCKET is set, uses S3-compatible storage.
// Otherwise, uses local disk storage.
func New() (Storage, error) {
	bucket := os.Getenv("S3_BUCKET")
	if bucket != "" {
		return newS3Storage()
	}
	return newLocalStorage()
}

// ============ Local Storage ============

type localStorage struct {
	baseDir   string
	publicURL string
}

func newLocalStorage() (*localStorage, error) {
	baseDir := os.Getenv("LOCAL_STORAGE_DIR")
	if baseDir == "" {
		baseDir = "./uploads"
	}
	publicURL := os.Getenv("LOCAL_STORAGE_URL")
	if publicURL == "" {
		publicURL = "/uploads"
	}

	if err := os.MkdirAll(baseDir, 0o755); err != nil {
		return nil, fmt.Errorf("create storage dir: %w", err)
	}

	return &localStorage{baseDir: baseDir, publicURL: strings.TrimSuffix(publicURL, "/")}, nil
}

func (l *localStorage) PresignUpload(ctx context.Context, key, contentType string, expires time.Duration) (string, error) {
	// For local storage, we return a relative URL that points to our upload endpoint.
	// The client sends the file to POST /api/v1/media/upload?key=...
	return fmt.Sprintf("/api/v1/media/upload?key=%s", key), nil
}

func (l *localStorage) PublicURL(key string) string {
	return fmt.Sprintf("%s/%s", l.publicURL, strings.TrimPrefix(key, "/"))
}

func (l *localStorage) MakeKey(storeID, purpose, filename string) string {
	ext := path.Ext(filename)
	base := strings.TrimSuffix(path.Base(filename), ext)
	base = sanitizeKeyComponent(base)
	storeID = sanitizeKeyComponent(storeID)
	purpose = sanitizeKeyComponent(purpose)
	return fmt.Sprintf("stores/%s/%s/%d-%s%s", storeID, purpose, time.Now().UnixMilli(), base, ext)
}

func (l *localStorage) IsValidPublicURL(raw string) bool {
	return strings.HasPrefix(raw, l.publicURL)
}

func (l *localStorage) SaveFile(key string, data []byte, contentType string) error {
	fullPath := path.Join(l.baseDir, key)
	dir := path.Dir(fullPath)
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return fmt.Errorf("create dir: %w", err)
	}
	if err := os.WriteFile(fullPath, data, 0o644); err != nil {
		return fmt.Errorf("write file: %w", err)
	}
	return nil
}

func (l *localStorage) Backend() string { return "local" }

// ============ S3 Storage (stub — requires AWS SDK) ============

type s3Storage struct {
	bucket      string
	endpoint    string
	publicURL   string
	accessKey   string
	secretKey   string
	region      string
}

func newS3Storage() (*s3Storage, error) {
	s := &s3Storage{
		bucket:    os.Getenv("S3_BUCKET"),
		endpoint:  os.Getenv("S3_ENDPOINT"),
		publicURL: os.Getenv("S3_PUBLIC_URL"),
		accessKey: os.Getenv("S3_ACCESS_KEY_ID"),
		secretKey: os.Getenv("S3_SECRET_ACCESS_KEY"),
		region:    os.Getenv("S3_REGION"),
	}
	if s.region == "" {
		s.region = "us-east-1"
	}
	if s.publicURL == "" {
		s.publicURL = fmt.Sprintf("%s/%s", strings.TrimSuffix(s.endpoint, "/"), s.bucket)
	}
	return s, nil
}

func (s *s3Storage) PresignUpload(ctx context.Context, key, contentType string, expires time.Duration) (string, error) {
	// In a full implementation, this would use the AWS SDK to generate a presigned URL.
	// For now, return a placeholder — the local storage path is used by default.
	return "", fmt.Errorf("S3 presign not implemented — use LOCAL_STORAGE or configure AWS SDK")
}

func (s *s3Storage) PublicURL(key string) string {
	return fmt.Sprintf("%s/%s", strings.TrimSuffix(s.publicURL, "/"), strings.TrimPrefix(key, "/"))
}

func (s *s3Storage) MakeKey(storeID, purpose, filename string) string {
	ext := path.Ext(filename)
	base := strings.TrimSuffix(path.Base(filename), ext)
	base = sanitizeKeyComponent(base)
	storeID = sanitizeKeyComponent(storeID)
	purpose = sanitizeKeyComponent(purpose)
	return fmt.Sprintf("stores/%s/%s/%d-%s%s", storeID, purpose, time.Now().UnixMilli(), base, ext)
}

func (s *s3Storage) IsValidPublicURL(raw string) bool {
	return strings.HasPrefix(raw, s.publicURL)
}

func (s *s3Storage) SaveFile(key string, data []byte, contentType string) error {
	return fmt.Errorf("S3 direct save not implemented — use presigned uploads")
}

func (s *s3Storage) Backend() string { return "s3" }

// ============ Helpers ============

func sanitizeKeyComponent(s string) string {
	s = strings.ReplaceAll(s, " ", "-")
	var b strings.Builder
	for _, r := range s {
		if (r >= 'a' && r <= 'z') || (r >= 'A' && r <= 'Z') || (r >= '0' && r <= '9') || r == '-' || r == '_' || r == '/' || r == '.' {
			b.WriteRune(r)
		} else {
			b.WriteRune('-')
		}
	}
	res := b.String()
	res = strings.Trim(res, "/.")
	if res == "" {
		return "file"
	}
	return res
}

// IsAllowedContentType validates an allowed image/video mime type.
func IsAllowedContentType(ct string) bool {
	ct = strings.ToLower(strings.TrimSpace(ct))
	allowed := []string{
		"image/jpeg", "image/png", "image/webp", "image/avif", "image/gif",
		"video/mp4", "video/webm", "video/quicktime",
	}
	for _, a := range allowed {
		if ct == a {
			return true
		}
	}
	if strings.HasPrefix(ct, "image/") || strings.HasPrefix(ct, "video/") {
		return true
	}
	return false
}

// ParseContentTypeFromFilename returns a mime type based on extension.
func ParseContentTypeFromFilename(name string) string {
	ext := strings.ToLower(path.Ext(name))
	switch ext {
	case ".jpg", ".jpeg":
		return "image/jpeg"
	case ".png":
		return "image/png"
	case ".webp":
		return "image/webp"
	case ".avif":
		return "image/avif"
	case ".gif":
		return "image/gif"
	case ".mp4":
		return "video/mp4"
	case ".webm":
		return "video/webm"
	case ".mov":
		return "video/quicktime"
	}
	return "application/octet-stream"
}
