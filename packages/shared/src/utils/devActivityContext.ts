import { getBookingActivityById } from '@/components/pages/business/bookings/config';
import { getBusinessActivityById, getBusinessActivityThemePatch } from '@/utils/businessActivityCatalog';

export const getSelectedDevActivityId = (): string => {
  if (!import.meta.env.DEV || typeof window === 'undefined') return '';
  try {
    return String(localStorage.getItem('ray_dev_activity_id') || '').trim();
  } catch {
    return '';
  }
};

export const applyDevActivityContext = (shop: any): any => {
  if (!shop) return shop;

  const activityId = getSelectedDevActivityId();
  if (!activityId) return shop;

  const pageDesign = shop?.pageDesign && typeof shop.pageDesign === 'object'
    ? shop.pageDesign
    : {};
  const bookingActivity = getBookingActivityById(activityId) || (activityId === 'bookings' ? getBookingActivityById('clinic') : undefined);

  if (bookingActivity) {
    return {
      ...shop,
      pageDesign: {
        ...pageDesign,
        businessActivityId: 'bookings',
        businessActivityTitle: bookingActivity.title,
        businessActivityGroupId: 'bookings',
        businessActivityGroupTitle: 'الحجوزات والمواعيد',
        bookingActivityType: bookingActivity.id,
        bookingDashboardScope: 'booking_only',
      },
    };
  }

  const legacyActivity = getBusinessActivityById(activityId);
  if (!legacyActivity) return shop;

  const legacyPageDesign = { ...pageDesign };
  delete legacyPageDesign.bookingActivityType;
  delete legacyPageDesign.bookingDashboardScope;

  return {
    ...shop,
    category: legacyActivity.category,
    pageDesign: {
      ...legacyPageDesign,
      ...getBusinessActivityThemePatch(legacyActivity.id),
      businessActivityId: legacyActivity.id,
      businessActivityTitle: legacyActivity.title,
      businessActivityGroupId: legacyActivity.groupId,
      businessActivityGroupTitle: legacyActivity.groupTitle,
    },
  };
};
