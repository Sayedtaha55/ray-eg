import { useEffect, useState } from 'react';
import { Reservation } from '@/types';
import { ApiService } from '@/services/api.service';
import {
  ACTIVITY_MODULES,
  BookingActivityType,
  getBookingActivityDefinition,
  getBookingActivityScopedList,
  getBookingActivityTypeFromPath,
  getBookingRouteFromActivityType,
} from '@/components/pages/business/clinic/bookingActivityConfig';
import { ReadinessItem } from './types';

type UseBookingActivityLaunchArgs = {
  reservations: Reservation[];
  navigate: (path: string) => void;
};

export const useBookingActivityLaunch = ({ reservations, navigate }: UseBookingActivityLaunchArgs) => {
  const [defaultBookingRoute, setDefaultBookingRoute] = useState('clinic');
  const [shop, setShop] = useState<any>(null);
  const [activitySaving, setActivitySaving] = useState('');
  const [activitySaveError, setActivitySaveError] = useState('');

  useEffect(() => {
    let cancelled = false;
    ApiService.getMyShop()
      .then((loadedShop: any) => {
        if (cancelled) return;
        setShop(loadedShop || null);
        setDefaultBookingRoute(getBookingRouteFromActivityType(loadedShop?.pageDesign?.bookingActivityType));
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedActivityType = getBookingActivityTypeFromPath(defaultBookingRoute);
  const selectedActivityDefinition = getBookingActivityDefinition(selectedActivityType);
  const selectedActivityProviders = getBookingActivityScopedList(shop?.pageDesign, selectedActivityType, 'providers');
  const selectedActivityServices = getBookingActivityScopedList(shop?.pageDesign, selectedActivityType, 'services');
  const selectedActivityExtraModules = (ACTIVITY_MODULES[selectedActivityType] || []).filter((module) => module.isExtra);
  const selectedActivityPages = shop?.pageDesign?.bookingActivityPagesByActivity?.[selectedActivityType] || {};

  const completedExtraPages = selectedActivityExtraModules.filter((module) => {
    const pageId = String(module.route || '').split('/').pop() || module.id;
    return Array.isArray(selectedActivityPages?.[pageId]?.items) && selectedActivityPages[pageId].items.length > 0;
  }).length;

  const firstMissingExtraModule = selectedActivityExtraModules.find((module) => {
    const pageId = String(module.route || '').split('/').pop() || module.id;
    return !Array.isArray(selectedActivityPages?.[pageId]?.items) || selectedActivityPages[pageId].items.length === 0;
  });

  const readinessItems: ReadinessItem[] = [
    {
      label: selectedActivityDefinition.primaryTabLabel,
      done: selectedActivityProviders.length > 0,
      value: selectedActivityProviders.length,
      actionLabel: `إضافة ${selectedActivityDefinition.primaryTabLabel}`,
      actionPath: `/business/${defaultBookingRoute}/doctors`,
    },
    {
      label: selectedActivityDefinition.secondaryTabLabel,
      done: selectedActivityServices.length > 0,
      value: selectedActivityServices.length,
      actionLabel: `إضافة ${selectedActivityDefinition.secondaryTabLabel}`,
      actionPath: `/business/${defaultBookingRoute}/services`,
    },
    {
      label: 'صفحات النشاط الخاصة',
      done: completedExtraPages >= selectedActivityExtraModules.length && selectedActivityExtraModules.length > 0,
      value: `${completedExtraPages}/${selectedActivityExtraModules.length}`,
      actionLabel: firstMissingExtraModule ? `إكمال ${firstMissingExtraModule.label}` : 'مراجعة الصفحات',
      actionPath: `/business/${defaultBookingRoute}/${firstMissingExtraModule?.route || selectedActivityExtraModules[0]?.route || 'overview'}`,
    },
    {
      label: 'حجوزات مسجلة',
      done: reservations.length > 0,
      value: reservations.length,
      actionLabel: 'إدارة الحجوزات',
      actionPath: `/business/${defaultBookingRoute}/bookings`,
    },
  ];

  const readinessPercent = Math.round((readinessItems.filter((item) => item.done).length / readinessItems.length) * 100);

  const handleSelectActivity = async (activityId: BookingActivityType) => {
    const route = getBookingRouteFromActivityType(activityId);
    setDefaultBookingRoute(route);
    setActivitySaving(activityId);
    setActivitySaveError('');
    try {
      const updatedShop = await ApiService.updateMyShop({
        pageDesign: {
          ...(shop?.pageDesign || {}),
          bookingActivityType: activityId,
          bookingDashboardScope: 'booking_only',
        },
      });
      setShop(updatedShop || { ...(shop || {}), pageDesign: { ...(shop?.pageDesign || {}), bookingActivityType: activityId } });
    } catch (err: any) {
      setActivitySaveError(err?.message || 'تعذر حفظ النشاط المختار حالياً، سيتم فتحه فقط بدون حفظ دائم.');
    } finally {
      setActivitySaving('');
      navigate(`/business/${route}/overview`);
    }
  };

  return {
    activitySaveError,
    activitySaving,
    defaultBookingRoute,
    handleSelectActivity,
    readinessItems,
    readinessPercent,
    selectedActivityDefinition,
  };
};
