package handlers

import (
	"fmt"
	"io"
	"strings"
	"time"

	"github.com/Sayedtaha55/ray-eg/saas-backend/internal/db"
	"github.com/Sayedtaha55/ray-eg/saas-backend/internal/middleware"
	"github.com/Sayedtaha55/ray-eg/saas-backend/internal/storage"
	"github.com/gofiber/fiber/v2"
)

type MediaHandler struct {
	queries  *db.Queries
	storage  storage.Storage
	maxBytes int64
}

func NewMediaHandler(q *db.Queries, s storage.Storage) *MediaHandler {
	maxBytes := int64(10 * 1024 * 1024) // 10MB default
	return &MediaHandler{queries: q, storage: s, maxBytes: maxBytes}
}

type PresignUploadRequest struct {
	Filename    string  `json:"filename"`
	ContentType string  `json:"content_type"`
	Purpose     string  `json:"purpose"`
	FileSize    *int64  `json:"file_size"`
	LinkedType  *string `json:"linked_type"`
	LinkedID    *string `json:"linked_id"`
}

type PresignUploadResponse struct {
	URL         string `json:"url"`
	Key         string `json:"key"`
	PublicURL   string `json:"public_url"`
	ContentType string `json:"content_type"`
	ExpiresIn   int    `json:"expires_in"`
	Backend     string `json:"backend"`
}

type CompleteUploadRequest struct {
	Key        string  `json:"key"`
	MimeType   string  `json:"mime_type"`
	Purpose    string  `json:"purpose"`
	FileSize   *int64  `json:"file_size"`
	Width      *int32  `json:"width"`
	Height     *int32  `json:"height"`
	PublicURL  *string `json:"public_url"`
	LinkedType *string `json:"linked_type"`
	LinkedID   *string `json:"linked_id"`
}

type MediaResponse struct {
	ID           string    `json:"id"`
	StoreID      string    `json:"store_id"`
	Purpose      string    `json:"purpose"`
	OriginalURL  string    `json:"original_url"`
	MimeType     string    `json:"mime_type"`
	FileSize     *int64    `json:"file_size"`
	Width        *int32    `json:"width"`
	Height       *int32    `json:"height"`
	ThumbURL     *string   `json:"thumb_url"`
	SmallURL     *string   `json:"small_url"`
	MediumURL    *string   `json:"medium_url"`
	OptimizedURL *string   `json:"optimized_url"`
	LinkedType   *string   `json:"linked_type"`
	LinkedID     *string   `json:"linked_id"`
	CreatedAt    time.Time `json:"created_at"`
}

// PresignUpload generates a presigned URL for direct upload.
func (h *MediaHandler) PresignUpload(c *fiber.Ctx) error {
	store := middleware.GetTenantStore(c)
	if store == nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "tenant_required", "message": "Tenant context is required"})
	}

	var req PresignUploadRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid_body", "message": "Invalid request body"})
	}

	filename := strings.TrimSpace(req.Filename)
	if filename == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "validation_error", "message": "filename is required"})
	}

	ct := strings.ToLower(strings.TrimSpace(req.ContentType))
	if ct == "" {
		ct = storage.ParseContentTypeFromFilename(filename)
	}
	if !storage.IsAllowedContentType(ct) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid_content_type", "message": "File type not supported"})
	}

	if req.FileSize != nil && *req.FileSize > 0 && *req.FileSize > h.maxBytes {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "file_too_large", "message": fmt.Sprintf("Max file size: %d bytes", h.maxBytes)})
	}

	purpose := strings.TrimSpace(req.Purpose)
	if purpose == "" {
		purpose = "images"
	}

	key := h.storage.MakeKey(store.ID, purpose, filename)
	expires := 15 * time.Minute

	url, err := h.storage.PresignUpload(c.UserContext(), key, ct, expires)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "presign_failed", "message": err.Error()})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data": PresignUploadResponse{
			URL:         url,
			Key:         key,
			PublicURL:   h.storage.PublicURL(key),
			ContentType: ct,
			ExpiresIn:   int(expires.Seconds()),
			Backend:     h.storage.Backend(),
		},
	})
}

// DirectUpload handles file upload for local storage backend.
// The client sends the file as multipart/form-data with "file" field
// and "key" as a query param (from PresignUpload response).
func (h *MediaHandler) DirectUpload(c *fiber.Ctx) error {
	store := middleware.GetTenantStore(c)
	if store == nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "tenant_required", "message": "Tenant context is required"})
	}

	if h.storage.Backend() != "local" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "not_local", "message": "Direct upload only for local storage"})
	}

	key := strings.TrimSpace(c.Query("key"))
	if key == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "validation_error", "message": "key is required"})
	}

	file, err := c.FormFile("file")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "no_file", "message": "file field is required"})
	}

	if file.Size > h.maxBytes {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "file_too_large", "message": fmt.Sprintf("Max: %d bytes", h.maxBytes)})
	}

	src, err := file.Open()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "internal_error", "message": "Failed to open file"})
	}
	defer src.Close()

	data, err := io.ReadAll(src)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "internal_error", "message": "Failed to read file"})
	}

	ct := file.Header.Get("Content-Type")
	if ct == "" {
		ct = storage.ParseContentTypeFromFilename(file.Filename)
	}
	if !storage.IsAllowedContentType(ct) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid_content_type", "message": "File type not supported"})
	}

	if err := h.storage.SaveFile(key, data, ct); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "save_failed", "message": err.Error()})
	}

	publicURL := h.storage.PublicURL(key)
	var fileSize int64 = int64(len(data))

	// Auto-create media record.
	media, err := h.queries.CreateMedia(c.UserContext(), db.CreateMediaParams{
		StoreID:     store.ID,
		Purpose:     "images",
		OriginalKey: key,
		OriginalURL: publicURL,
		MimeType:    ct,
		FileSize:    &fileSize,
	})
	if err != nil {
		// File saved but DB record failed — still return the URL.
		return c.JSON(fiber.Map{
			"success": true,
			"data": MediaResponse{
				OriginalURL: publicURL,
				MimeType:    ct,
				FileSize:    &fileSize,
			},
			"warning": "File saved but media record creation failed",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"data":    toMediaResponse(media),
	})
}

// CompleteUpload records a media row after the client uploads directly to S3.
func (h *MediaHandler) CompleteUpload(c *fiber.Ctx) error {
	store := middleware.GetTenantStore(c)
	if store == nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "tenant_required", "message": "Tenant context is required"})
	}

	var req CompleteUploadRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid_body", "message": "Invalid request body"})
	}

	key := strings.TrimSpace(req.Key)
	if key == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "validation_error", "message": "key is required"})
	}

	mimeType := strings.TrimSpace(req.MimeType)
	if mimeType == "" {
		mimeType = storage.ParseContentTypeFromFilename(key)
	}

	// Check if already exists.
	existing, err := h.queries.GetMediaByKey(c.UserContext(), key)
	if err == nil && existing.ID != "" {
		return c.JSON(fiber.Map{"success": true, "data": toMediaResponse(existing)})
	}

	purpose := strings.TrimSpace(req.Purpose)
	if purpose == "" {
		purpose = "images"
	}

	publicURL := h.storage.PublicURL(key)
	if req.PublicURL != nil && *req.PublicURL != "" && h.storage.IsValidPublicURL(*req.PublicURL) {
		publicURL = *req.PublicURL
	}

	media, err := h.queries.CreateMedia(c.UserContext(), db.CreateMediaParams{
		StoreID:     store.ID,
		Purpose:     purpose,
		OriginalKey: key,
		OriginalURL: publicURL,
		MimeType:    mimeType,
		FileSize:    req.FileSize,
		Width:       req.Width,
		Height:      req.Height,
		LinkedType:  req.LinkedType,
		LinkedID:    req.LinkedID,
	})
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "internal_error", "message": fmt.Sprintf("Failed: %v", err)})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"success": true, "data": toMediaResponse(media)})
}

// List returns media for the current store.
func (h *MediaHandler) List(c *fiber.Ctx) error {
	store := middleware.GetTenantStore(c)
	if store == nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "tenant_required", "message": "Tenant context is required"})
	}

	limit := int32(c.QueryInt("limit", 20))
	if limit <= 0 || limit > 100 {
		limit = 20
	}
	offset := int32(c.QueryInt("offset", 0))
	purpose := strings.TrimSpace(c.Query("purpose"))

	media, err := h.queries.ListMediaByStore(c.UserContext(), db.ListMediaByStoreParams{
		StoreID: store.ID,
		Purpose: purpose,
		Limit:   limit,
		Offset:  offset,
	})
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "internal_error", "message": fmt.Sprintf("Failed: %v", err)})
	}

	resp := make([]MediaResponse, len(media))
	for i, m := range media {
		resp[i] = toMediaResponse(m)
	}

	return c.JSON(fiber.Map{"success": true, "data": resp})
}

// GetByID returns a single media record.
func (h *MediaHandler) GetByID(c *fiber.Ctx) error {
	store := middleware.GetTenantStore(c)
	if store == nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "tenant_required", "message": "Tenant context is required"})
	}

	id := strings.TrimSpace(c.Params("id"))
	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "validation_error", "message": "id is required"})
	}

	media, err := h.queries.GetMediaByID(c.UserContext(), db.GetMediaByIDParams{ID: id, StoreID: store.ID})
	if err != nil {
		if isNoRows(err) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "not_found", "message": "Media not found"})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "internal_error", "message": fmt.Sprintf("Failed: %v", err)})
	}

	return c.JSON(fiber.Map{"success": true, "data": toMediaResponse(media)})
}

// Delete soft-deletes a media record.
func (h *MediaHandler) Delete(c *fiber.Ctx) error {
	store := middleware.GetTenantStore(c)
	if store == nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "tenant_required", "message": "Tenant context is required"})
	}

	id := strings.TrimSpace(c.Params("id"))
	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "validation_error", "message": "id is required"})
	}

	if err := h.queries.DeleteMedia(c.UserContext(), db.DeleteMediaParams{ID: id, StoreID: store.ID}); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "internal_error", "message": fmt.Sprintf("Failed: %v", err)})
	}

	return c.JSON(fiber.Map{"success": true, "message": "Media deleted"})
}

func toMediaResponse(m db.Media) MediaResponse {
	return MediaResponse{
		ID:           m.ID,
		StoreID:      m.StoreID,
		Purpose:      m.Purpose,
		OriginalURL:  m.OriginalURL,
		MimeType:     m.MimeType,
		FileSize:     m.FileSize,
		Width:        m.Width,
		Height:       m.Height,
		ThumbURL:     m.ThumbURL,
		SmallURL:     m.SmallURL,
		MediumURL:    m.MediumURL,
		OptimizedURL: m.OptimizedURL,
		LinkedType:   m.LinkedType,
		LinkedID:     m.LinkedID,
		CreatedAt:    m.CreatedAt,
	}
}
