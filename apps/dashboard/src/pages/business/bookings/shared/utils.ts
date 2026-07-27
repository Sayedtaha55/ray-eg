import type { BookingActivityType } from '../config';
import { getBookingActivityTypeFromParam } from '../config';

export const getShop = (): any => {
  try {
    return JSON.parse(localStorage.getItem('ray_last_shop') || '{}');
  } catch {
    return {};
  }
};

export const getEffectiveShop = (shop?: any): any => {
  return shop || getShop();
};

export const matchesActivity = (
  b: any,
  currentActivity: BookingActivityType,
  shop?: any
): boolean => {
  const rawType =
    b.bookingActivityType ||
    b.activityType ||
    b.metadata?.bookingActivityType ||
    b.metadata?.activityType ||
    b.bookingActivityRoute ||
    b.metadata?.bookingActivityRoute;

  if (!rawType) {
    const shopActivity = shop?.pageDesign?.bookingActivityType || 'clinic';
    return currentActivity === shopActivity;
  }

  return getBookingActivityTypeFromParam(String(rawType)) === currentActivity;
};

export const statusConfig: Record<
  string,
  { label: string; labelEn: string; icon: string; color: string; bg: string }
> = {
  confirmed: {
    label: 'مؤكد',
    labelEn: 'Confirmed',
    icon: 'CheckCircle2',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50 border-emerald-200',
  },
  pending: {
    label: 'انتظار',
    labelEn: 'Pending',
    icon: 'Clock',
    color: 'text-amber-700',
    bg: 'bg-amber-50 border-amber-200',
  },
  completed: {
    label: 'مكتمل',
    labelEn: 'Completed',
    icon: 'CheckCircle2',
    color: 'text-blue-700',
    bg: 'bg-blue-50 border-blue-200',
  },
  cancelled: {
    label: 'ملغي',
    labelEn: 'Cancelled',
    icon: 'XCircle',
    color: 'text-red-700',
    bg: 'bg-red-50 border-red-200',
  },
};

export const ALL_STATUSES = [
  'all',
  'pending',
  'confirmed',
  'completed',
  'cancelled',
];

export const STATUS_LABELS: Record<string, string> = {
  all: 'الكل',
  pending: 'انتظار',
  confirmed: 'مؤكد',
  completed: 'مكتمل',
  cancelled: 'ملغي',
};

export const STATUS_LABELS_EN: Record<string, string> = {
  all: 'All',
  pending: 'Pending',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const getLocalizedStatusLabels = (lang?: string): Record<string, string> => {
  const isEn = String(lang || '').toLowerCase().startsWith('en');
  return isEn ? STATUS_LABELS_EN : STATUS_LABELS;
};

export const DAYS_AR = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
export const DAYS_EN = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export const getLocalizedDays = (lang?: string): string[] => {
  const isEn = String(lang || '').toLowerCase().startsWith('en');
  return isEn ? DAYS_EN : DAYS_AR;
};

export const getLocalizedStatusConfigLabel = (status: string, lang?: string): string => {
  const cfg = statusConfig[status];
  if (!cfg) return status;
  const isEn = String(lang || '').toLowerCase().startsWith('en');
  return isEn ? (cfg.labelEn || cfg.label) : cfg.label;
};
