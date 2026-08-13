package notification

import (
	"context"
	"fmt"
	"time"

	"github.com/Sayedtaha55/ray-eg/gobackend/internal/platform/jobs"
	"github.com/Sayedtaha55/ray-eg/gobackend/internal/platform/logger"
)

// Service handles notification business logic
type Service struct {
	repo    *Repository
	webPush *WebPushService
	jobs    *jobs.Client
}

// NewService creates a new notification service. jobsClient is optional; when
// provided, push notification fan-out is enqueued for the background worker
// instead of running on an unbounded goroutine per request.
func NewService(repo *Repository, webPush *WebPushService, jobsClient *jobs.Client) *Service {
	return &Service{
		repo:    repo,
		webPush: webPush,
		jobs:    jobsClient,
	}
}

// CreateNotification creates a new notification and sends it via configured channels
func (s *Service) CreateNotification(ctx context.Context, data *NotificationData) (*Notification, error) {
	// Create notification in database
	notification, err := s.repo.CreateNotification(ctx, data)
	if err != nil {
		return nil, fmt.Errorf("failed to create notification: %w", err)
	}

	// Send push notifications if configured
	if s.webPush != nil && s.webPush.IsConfigured() {
		s.dispatchPushNotifications(ctx, data)
	}

	return notification, nil
}

// dispatchPushNotifications enqueues a push fan-out job for the background
// worker. If no jobs client is configured it falls back to sending on a
// detached goroutine so callers are never blocked.
func (s *Service) dispatchPushNotifications(ctx context.Context, data *NotificationData) {
	url := ""
	if data.ShopID != nil {
		url = fmt.Sprintf("/business/dashboard?notification=%s", data.Type)
	} else if data.UserID != nil {
		url = "/profile?tab=notifications"
	}

	payload := jobs.NotificationPushPayload{
		ShopID: data.ShopID,
		UserID: data.UserID,
		Title:  data.Title,
		Body:   data.Content,
		URL:    url,
		Tag:    string(data.Type),
	}

	if s.jobs != nil {
		if err := s.jobs.EnqueueNotificationPush(ctx, payload); err == nil {
			return
		}
		logger.Global().Warn("failed to enqueue notification push job, falling back to inline send")
	}

	go s.sendPushNotifications(context.Background(), data)
}

// sendPushNotifications sends push notifications based on notification data.
// This is the fallback path used when no jobs client is configured; the
// worker's handler performs the same logic for queued jobs.
func (s *Service) sendPushNotifications(ctx context.Context, data *NotificationData) {
	payload := &PushPayload{
		Title: data.Title,
		Body:  data.Content,
		Tag:   string(data.Type),
	}

	// Build URL based on notification type
	if data.ShopID != nil {
		payload.URL = fmt.Sprintf("/business/dashboard?notification=%s", data.Type)
	} else if data.UserID != nil {
		payload.URL = "/profile?tab=notifications"
	}

	// Send to shop subscribers
	if data.ShopID != nil {
		subscriptions, err := s.repo.GetMerchantPushSubscriptions(ctx, *data.ShopID)
		if err == nil {
			s.webPush.SendToMerchantShop(subscriptions, payload)
		}
	}

	// Send to user subscribers
	if data.UserID != nil {
		subscriptions, err := s.repo.GetCustomerPushSubscriptions(ctx, *data.UserID)
		if err == nil {
			s.webPush.SendToCustomerUser(subscriptions, payload)
		}
	}
}

// GetNotificationsByUserID retrieves notifications for a user
func (s *Service) GetNotificationsByUserID(ctx context.Context, userID string, limit, offset int) ([]Notification, int64, error) {
	if limit <= 0 {
		limit = 20
	}
	if limit > 100 {
		limit = 100
	}

	return s.repo.GetNotificationsByUserID(ctx, userID, limit, offset)
}

// GetNotificationsByShopID retrieves notifications for a shop
func (s *Service) GetNotificationsByShopID(ctx context.Context, shopID string, limit, offset int) ([]Notification, int64, error) {
	if limit <= 0 {
		limit = 20
	}
	if limit > 100 {
		limit = 100
	}

	return s.repo.GetNotificationsByShopID(ctx, shopID, limit, offset)
}

// GetUnreadCountByUserID returns unread count for a user
func (s *Service) GetUnreadCountByUserID(ctx context.Context, userID string) (int64, error) {
	return s.repo.GetUnreadCountByUserID(ctx, userID)
}

// GetUnreadCountByShopID returns unread count for a shop
func (s *Service) GetUnreadCountByShopID(ctx context.Context, shopID string) (int64, error) {
	return s.repo.GetUnreadCountByShopID(ctx, shopID)
}

// MarkAsRead marks a specific notification as read
func (s *Service) MarkAsRead(ctx context.Context, notificationID string) error {
	return s.repo.MarkAsRead(ctx, notificationID)
}

// MarkAllAsReadForUser marks all notifications as read for a user
func (s *Service) MarkAllAsReadForUser(ctx context.Context, userID string) error {
	return s.repo.MarkAllAsReadForUser(ctx, userID)
}

// MarkAllAsReadForShop marks all notifications as read for a shop
func (s *Service) MarkAllAsReadForShop(ctx context.Context, shopID string) error {
	return s.repo.MarkAllAsReadForShop(ctx, shopID)
}

// RegisterMerchantPushSubscription registers a merchant push subscription
func (s *Service) RegisterMerchantPushSubscription(ctx context.Context, shopID, endpoint string, subscription map[string]interface{}) (*MerchantPushSubscription, error) {
	return s.repo.CreateMerchantPushSubscription(ctx, shopID, endpoint, subscription)
}

// UnregisterMerchantPushSubscription unregisters a merchant push subscription
func (s *Service) UnregisterMerchantPushSubscription(ctx context.Context, shopID, endpoint string) error {
	return s.repo.DeactivateMerchantPushSubscription(ctx, shopID, endpoint)
}

// RegisterCustomerPushSubscription registers a customer push subscription
func (s *Service) RegisterCustomerPushSubscription(ctx context.Context, userID, endpoint string, subscription map[string]interface{}) (*CustomerPushSubscription, error) {
	return s.repo.CreateCustomerPushSubscription(ctx, userID, endpoint, subscription)
}

// UnregisterCustomerPushSubscription unregisters a customer push subscription
func (s *Service) UnregisterCustomerPushSubscription(ctx context.Context, userID, endpoint string) error {
	return s.repo.DeactivateCustomerPushSubscription(ctx, userID, endpoint)
}

// GetNotificationPreferences retrieves notification preferences for a user
func (s *Service) GetNotificationPreferences(ctx context.Context, userID string) (*NotificationPreferences, error) {
	prefs, err := s.repo.GetNotificationPreferences(ctx, userID)
	if err != nil {
		// Return default preferences if not found
		return &NotificationPreferences{
			UserID:       userID,
			EmailEnabled: true,
			SMSEnabled:   false,
			PushEnabled:  true,
			InAppEnabled: true,
			TypeSettings: make(map[NotificationType]TypePreference),
			CreatedAt:    time.Now().UTC().Format(time.RFC3339),
			UpdatedAt:    time.Now().UTC().Format(time.RFC3339),
		}, nil
	}
	return prefs, nil
}

// UpdateNotificationPreferences updates notification preferences for a user
func (s *Service) UpdateNotificationPreferences(ctx context.Context, prefs *NotificationPreferences) error {
	prefs.UpdatedAt = time.Now().UTC().Format(time.RFC3339)
	return s.repo.CreateOrUpdateNotificationPreferences(ctx, prefs)
}

// NotifyNewFollower sends a notification when a user follows a shop
func (s *Service) NotifyNewFollower(ctx context.Context, shopID string, followerID string, followerName string) error {
	data := &NotificationData{
		Type:     NotificationTypeNewFollower,
		Title:    "متابع جديد",
		Content:  fmt.Sprintf("قام %s بمتابعة متجرك", followerName),
		ShopID:   &shopID,
		Priority: NotificationPriorityMedium,
		Channels: []NotificationChannel{NotificationChannelInApp, NotificationChannelPush},
		Metadata: map[string]interface{}{
			"follower_id":   followerID,
			"follower_name": followerName,
		},
	}

	_, err := s.CreateNotification(ctx, data)
	return err
}

// NotifyNewOrder sends a notification when a new order is placed
func (s *Service) NotifyNewOrder(ctx context.Context, shopID string, orderID string, orderNumber string, total float64) error {
	data := &NotificationData{
		Type:     NotificationTypeNewOrder,
		Title:    "طلب جديد",
		Content:  fmt.Sprintf("طلب #%s بقيمة %.2f", orderNumber, total),
		ShopID:   &shopID,
		OrderID:  &orderID,
		Priority: NotificationPriorityHigh,
		Channels: []NotificationChannel{NotificationChannelInApp, NotificationChannelPush},
		Metadata: map[string]interface{}{
			"order_id":     orderID,
			"order_number": orderNumber,
			"total":        total,
		},
	}

	_, err := s.CreateNotification(ctx, data)
	return err
}

// NotifyOrderStatusChanged sends a notification when order status changes
func (s *Service) NotifyOrderStatusChanged(ctx context.Context, userID string, orderID string, orderNumber string, status string) error {
	data := &NotificationData{
		Type:     NotificationTypeOrderStatusChanged,
		Title:    "تحديث حالة الطلب",
		Content:  fmt.Sprintf("تم تحديث حالة طلبك #%s إلى %s", orderNumber, status),
		UserID:   &userID,
		OrderID:  &orderID,
		Priority: NotificationPriorityHigh,
		Channels: []NotificationChannel{NotificationChannelInApp, NotificationChannelPush},
		Metadata: map[string]interface{}{
			"order_id":     orderID,
			"order_number": orderNumber,
			"status":       status,
		},
	}

	_, err := s.CreateNotification(ctx, data)
	return err
}

// NotifyNewMessage sends a notification when a new message is received
func (s *Service) NotifyNewMessage(ctx context.Context, shopID string, userID string, senderName string) error {
	data := &NotificationData{
		Type:     NotificationTypeNewMessage,
		Title:    "رسالة جديدة",
		Content:  fmt.Sprintf("رسالة جديدة من %s", senderName),
		ShopID:   &shopID,
		UserID:   &userID,
		Priority: NotificationPriorityMedium,
		Channels: []NotificationChannel{NotificationChannelInApp, NotificationChannelPush},
		Metadata: map[string]interface{}{
			"user_id":     userID,
			"sender_name": senderName,
		},
	}

	_, err := s.CreateNotification(ctx, data)
	return err
}

// NotifyLowStock sends a notification when product stock is low
func (s *Service) NotifyLowStock(ctx context.Context, shopID string, productID string, productName string, currentStock int) error {
	data := &NotificationData{
		Type:     NotificationTypeLowStock,
		Title:    "مخزون منخفض",
		Content:  fmt.Sprintf("المنتج %s وصل لمخزون منخفض (%d)", productName, currentStock),
		ShopID:   &shopID,
		Priority: NotificationPriorityHigh,
		Channels: []NotificationChannel{NotificationChannelInApp, NotificationChannelPush, NotificationChannelEmail},
		Metadata: map[string]interface{}{
			"product_id":    productID,
			"product_name":  productName,
			"current_stock": currentStock,
		},
	}

	_, err := s.CreateNotification(ctx, data)
	return err
}

// NotifyOrderConfirmed sends a notification when order is confirmed
func (s *Service) NotifyOrderConfirmed(ctx context.Context, userID string, orderID string, orderNumber string) error {
	data := &NotificationData{
		Type:     NotificationTypeOrderConfirmed,
		Title:    "تم تأكيد طلبك",
		Content:  fmt.Sprintf("تم تأكيد طلبك #%s", orderNumber),
		UserID:   &userID,
		OrderID:  &orderID,
		Priority: NotificationPriorityHigh,
		Channels: []NotificationChannel{NotificationChannelInApp, NotificationChannelPush},
		Metadata: map[string]interface{}{
			"order_id":     orderID,
			"order_number": orderNumber,
		},
	}

	_, err := s.CreateNotification(ctx, data)
	return err
}

// NotifyOrderShipped sends a notification when order is shipped
func (s *Service) NotifyOrderShipped(ctx context.Context, userID string, orderID string, orderNumber string) error {
	data := &NotificationData{
		Type:     NotificationTypeOrderShipped,
		Title:    "تم شحن طلبك",
		Content:  fmt.Sprintf("تم شحن طلبك #%s", orderNumber),
		UserID:   &userID,
		OrderID:  &orderID,
		Priority: NotificationPriorityHigh,
		Channels: []NotificationChannel{NotificationChannelInApp, NotificationChannelPush},
		Metadata: map[string]interface{}{
			"order_id":     orderID,
			"order_number": orderNumber,
		},
	}

	_, err := s.CreateNotification(ctx, data)
	return err
}

// NotifyOrderDelivered sends a notification when order is delivered
func (s *Service) NotifyOrderDelivered(ctx context.Context, userID string, orderID string, orderNumber string) error {
	data := &NotificationData{
		Type:     NotificationTypeOrderDelivered,
		Title:    "تم توصيل طلبك",
		Content:  fmt.Sprintf("تم توصيل طلبك #%s بنجاح", orderNumber),
		UserID:   &userID,
		OrderID:  &orderID,
		Priority: NotificationPriorityHigh,
		Channels: []NotificationChannel{NotificationChannelInApp, NotificationChannelPush},
		Metadata: map[string]interface{}{
			"order_id":     orderID,
			"order_number": orderNumber,
		},
	}

	_, err := s.CreateNotification(ctx, data)
	return err
}

// NotifyPaymentReceived sends a notification when payment is received
func (s *Service) NotifyPaymentReceived(ctx context.Context, shopID string, orderID string, orderNumber string, amount float64) error {
	data := &NotificationData{
		Type:     NotificationTypePaymentReceived,
		Title:    "تم استلام الدفع",
		Content:  fmt.Sprintf("تم استلام دفع %.2f للطلب #%s", amount, orderNumber),
		ShopID:   &shopID,
		OrderID:  &orderID,
		Priority: NotificationPriorityHigh,
		Channels: []NotificationChannel{NotificationChannelInApp, NotificationChannelPush},
		Metadata: map[string]interface{}{
			"order_id":     orderID,
			"order_number": orderNumber,
			"amount":       amount,
		},
	}

	_, err := s.CreateNotification(ctx, data)
	return err
}
