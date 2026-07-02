/**
 * ═══════════════════════════════════════════
 * bookings/types.ts
 * الأنواع المشتركة لنظام الحجوزات
 * ═══════════════════════════════════════════
 */

// ============================================
// مقدم الخدمة (طبيب، مصفف، شاليه، إلخ)
// ============================================
export type BookingProvider = {
  id: string;
  name: string;
  title?: string | null;
  imageUrl?: string | null;
  nextSlot?: string | null;
  sortOrder?: number;
  isActive?: boolean;
  activityType?: string;
  metadata?: Record<string, any>;
};

// ============================================
// الخدمة
// ============================================
export type BookingService = {
  id: string;
  name: string;
  description?: string | null;
  price?: number;
  durationMinutes?: number;
  isActive?: boolean;
  activityType?: string;
  metadata?: Record<string, any>;
};

// ============================================
// الحجز
// ============================================
export type BookingReservation = {
  id: string;
  providerId?: string;
  serviceId?: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  date: string;
  startTime: string;
  endTime?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  price?: number;
  activityType?: string;
  createdAt: string;
  updatedAt?: string;
};

// ============================================
// بيانات النشاط في الـ PageDesign
// ============================================
export type BookingActivityData = {
  providers?: BookingProvider[];
  services?: BookingService[];
  reservations?: BookingReservation[];
  settings?: Record<string, any>;
};

// ============================================
// تجهيزات الـ activity data داخل pageDesign
// ============================================
export type PageDesignBookingData = {
  bookingActivityType?: string;
  bookingActivityData?: Record<string, BookingActivityData>;
};

// ============================================
// أزرار السايدبار
// ============================================
export type SidebarItem = {
  id: string;
  label: string;
  icon: string;
  route: string;
  isExtra?: boolean;
};