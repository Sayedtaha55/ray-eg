import { useEffect, useState } from 'react';
import { Reservation } from '@/types';
import { ApiService } from '@/services/api.service';
import {
  ACTIVITY_MODULES,
  getBookingActivityDefinition,
  getBookingActivityScopedList,
  getBookingActivityTypeFromPath,
  getBookingRouteFromActivityType,
  getBookingActivityTypeFromParam,
  getBookingActivityById,
  BookingActivityType,
} from '@/components/pages/business/bookings/config';
import { getBookingActivityTypeFromCategory } from '../../activities';
import { ReadinessItem } from './types';

const matchesActivity = (b: any, currentActivity: BookingActivityType) => {
  const rawType = b.bookingActivityType 
    || b.activityType 
    || b.metadata?.bookingActivityType 
    || b.metadata?.activityType
    || b.bookingActivityRoute
    || b.metadata?.bookingActivityRoute;
  
  if (!rawType) {
    const shop = (() => {
      try {
        return JSON.parse(localStorage.getItem('ray_last_shop') || '{}');
      } catch { return {}; }
    })();
    const rawShopActivity = shop?.pageDesign?.bookingActivityType;
    const shopActivity = (rawShopActivity && getBookingActivityById(rawShopActivity)) ? rawShopActivity : (getBookingActivityTypeFromCategory(shop?.category) || 'clinic');
    return currentActivity === shopActivity;
  }
  
  return getBookingActivityTypeFromParam(String(rawType)) === currentActivity;
};

type UseBookingActivityLaunchArgs = {
  reservations: Reservation[];
  navigate: (path: string) => void;
};

export const useBookingActivityLaunch = ({ reservations, navigate }: UseBookingActivityLaunchArgs) => {
  // دالة مساعدة لبناء مسار كل نشاط (مستقل عن تبويب الحجوزات)
  const buildActivityRoute = (bookingModule: string) => {
    return `/business/dashboard?activity=${selectedActivityType}&bookingModule=${bookingModule}`;
  };
  const [defaultBookingRoute, setDefaultBookingRoute] = useState('clinic');
  const [shop, setShop] = useState<any>(null);

  useEffect(() => {
    let cancelled = false;
    ApiService.getMyShop()
      .then((loadedShop: any) => {
        if (cancelled) return;
        setShop(loadedShop || null);
        const rawActivityType = loadedShop?.pageDesign?.bookingActivityType;
        const resolvedActivityType = (rawActivityType && getBookingActivityById(rawActivityType)) ? rawActivityType : (getBookingActivityTypeFromCategory(loadedShop?.category) || 'clinic');
        setDefaultBookingRoute(getBookingRouteFromActivityType(resolvedActivityType));
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedActivityType = getBookingActivityTypeFromPath(defaultBookingRoute);
  const filteredReservations = reservations.filter(r => matchesActivity(r, selectedActivityType));
  const selectedActivityDefinition = getBookingActivityDefinition(selectedActivityType);
  const selectedActivityProviders = getBookingActivityScopedList(shop?.pageDesign, selectedActivityType, 'providers');
  const selectedActivityServices = getBookingActivityScopedList(shop?.pageDesign, selectedActivityType, 'services');
  const selectedActivityExtraModules = (ACTIVITY_MODULES[selectedActivityType] || []).filter((m) => m.isExtra);
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
      actionPath: buildActivityRoute(ACTIVITY_MODULES[selectedActivityType]?.[0]?.route || 'providers'),
    },
    {
      label: selectedActivityDefinition.secondaryTabLabel,
      done: selectedActivityServices.length > 0,
      value: selectedActivityServices.length,
      actionLabel: `إضافة ${selectedActivityDefinition.secondaryTabLabel}`,
      actionPath: buildActivityRoute('services'),
    },
    {
      label: 'صفحات النشاط الخاصة',
      done: completedExtraPages >= selectedActivityExtraModules.length && selectedActivityExtraModules.length > 0,
      value: `${completedExtraPages}/${selectedActivityExtraModules.length}`,
      actionLabel: firstMissingExtraModule ? `إكمال ${firstMissingExtraModule.label}` : 'مراجعة الصفحات',
      actionPath: buildActivityRoute(firstMissingExtraModule?.route || selectedActivityExtraModules[0]?.route || 'overview'),
    },
    {
      label: 'حجوزات مسجلة',
      done: filteredReservations.length > 0,
      value: filteredReservations.length,
      actionLabel: 'إدارة الحجوزات',
      actionPath: `/business/dashboard?activity=${selectedActivityType}`,
    },
  ];

  const readinessPercent = Math.round(
    (readinessItems.filter((item) => item.done).length / readinessItems.length) * 100,
  );

  return {
    defaultBookingRoute,
    readinessItems,
    readinessPercent,
    selectedActivityDefinition,
  };
};
