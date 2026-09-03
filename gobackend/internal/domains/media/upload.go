package media

import (
	"context"
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"

	"github.com/Sayedtaha55/ray-eg/gobackend/internal/platform/errors"
	"github.com/Sayedtaha55/ray-eg/gobackend/internal/platform/storage"
	"github.com/google/uuid"
)

// localStorageDir is where locally stored uploads are written when object
// storage (S3/R2) is not configured.
const localStorageDir = "./uploads"

// DirectUpload stores a multipart file on local disk and records a media row.
// It powers the legacy POST /media/upload endpoint used by the dashboard,
// which sends multipart/form-data instead of using the presign flow.
func (s *Service) DirectUpload(ctx context.Context, userID, actorRole, actorShopID, shopID, purpose string, fh *multipart.FileHeader) (*Media, error) {
	if err := s.authorizeShop(shopID, actorRole, actorShopID); err != nil {
		return nil, err
	}

	purpose = strings.TrimSpace(purpose)
	if purpose == "" {
		purpose = "images"
	}

	ct := strings.ToLower(fh.Header.Get("Content-Type"))
	if ct == "" || !storage.IsAllowedContentType(ct) {
		return nil, errors.Validation("invalid_content_type", "نوع الملف غير مدعوم")
	}
	if max := s.maxUploadBytes(); max > 0 && fh.Size > max {
		return nil, errors.Validation("file_too_large", "حجم الملف أكبر من المسموح")
	}

	key, err := makeLocalKey(shopID, purpose, fh.Filename)
	if err != nil {
		return nil, errors.Validation("invalid_filename", "اسم الملف غير صالح")
	}

	src, err := fh.Open()
	if err != nil {
		return nil, errors.Internal("upload_open_failed", err)
	}
	defer src.Close()

	dstPath := filepath.Join(localStorageDir, filepath.FromSlash(key))
	if err := os.MkdirAll(filepath.Dir(dstPath), 0o755); err != nil {
		return nil, errors.Internal("upload_mkdir_failed", err)
	}
	dst, err := os.Create(dstPath)
	if err != nil {
		return nil, errors.Internal("upload_create_failed", err)
	}
	defer dst.Close()
	if _, err := io.Copy(dst, src); err != nil {
		return nil, errors.Internal("upload_write_failed", err)
	}

	size := fh.Size
	m := &Media{
		ShopID:      shopID,
		UploadedBy:  strPtr(userID),
		Purpose:     purpose,
		OriginalKey: key,
		OriginalURL: s.localPublicURL(key),
		MimeType:    ct,
		FileSize:    &size,
	}
	return s.repo.Create(ctx, m)
}

// makeLocalKey builds a storage key of the form
// "<shopId>/<purpose>/<uuid><ext>" with a sanitized extension.
func makeLocalKey(shopID, purpose, filename string) (string, error) {
	ext := strings.ToLower(filepath.Ext(filename))
	if ext == "." || len(ext) > 10 {
		return "", errors.Validation("invalid_filename", "اسم الملف غير صالح")
	}
	for _, r := range ext[1:] {
		if !(r >= 'a' && r <= 'z' || r >= '0' && r <= '9') {
			return "", errors.Validation("invalid_filename", "اسم الملف غير صالح")
		}
	}
	if shopID == "" || purpose == "" {
		return "", errors.Validation("invalid_filename", "اسم الملف غير صالح")
	}
	return shopID + "/" + purpose + "/" + uuid.NewString() + ext, nil
}

func (s *Service) localPublicURL(key string) string {
	base := strings.TrimRight(s.cfg.App.PublicURL, "/")
	if base == "" {
		base = fmt.Sprintf("http://localhost:%d", s.cfg.App.Port)
	}
	return base + "/uploads/" + key
}
