/**
 * ═══════════════════════════════════════════
 * bookings/BookingLayout.tsx
 * اللوحة الرئيسية للحجوزات - تدير كل الأنشطة
 * ═══════════════════════════════════════════
 */
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import * as ReactRouterDOM from 'react-router-dom';
import { LayoutDashboard, CalendarCheck, Palette, Settings, Eye, Users, ListChecks, Loader2 } from 'lucide-react';
import type { BookingActivityType } from './config';
import {
  SHARED_BOOKING_BUTTONS,
  getActivitySpecificButtons,
  getLocalizedActivityTitle,
  getLocalizedButtonLabel,
  BOOKING_ACTIVITIES,
} from './config';

// Lazy load shared pages
const BookingOverviewPage = React.lazy(() => import('./shared/BookingOverviewPage'));
const BookingBookingsPage = React.lazy(() => import('./shared/BookingBookingsPage'));
const BookingSettingsPage = React.lazy(() => import('./shared/BookingSettingsPage'));
const BookingProvidersPage = React.lazy(() => import('./shared/BookingProvidersPage'));
const BookingServicesPage = React.lazy(() => import('./shared/BookingServicesPage'));
// Lazy load PageBuilder for integrated design mode
const PageBuilder = React.lazy(() => import('../PageBuilder'));
// Lazy load activity-specific pages
const ActivityRoomsPage = React.lazy(() => import('./activity/ActivityRoomsPage'));
const ActivityPatientsPage = React.lazy(() => import('./activity/ActivityPatientsPage'));
const ActivityInventoryPage = React.lazy(() => import('./activity/ActivityInventoryPage'));
const ActivityPackagesPage = React.lazy(() => import('./activity/ActivityPackagesPage'));
const ActivitySeasonsPage = React.lazy(() => import('./activity/ActivitySeasonsPage'));
const ActivityPoliciesPage = React.lazy(() => import('./activity/ActivityPoliciesPage'));
const ActivityAvailabilityPage = React.lazy(() => import('./activity/ActivityAvailabilityPage'));
const ActivityCapacityPage = React.lazy(() => import('./activity/ActivityCapacityPage'));
const ActivityRequestsPage = React.lazy(() => import('./activity/ActivityRequestsPage'));
const ActivityTicketsPage = React.lazy(() => import('./activity/ActivityTicketsPage'));
const ActivitySchedulePage = React.lazy(() => import('./activity/ActivitySchedulePage'));
const ActivityInsurancePage = React.lazy(() => import('./activity/ActivityInsurancePage'));
const ActivityLocationsPage = React.lazy(() => import('./activity/ActivityLocationsPage'));
const ActivitySubscriptionsPage = React.lazy(() => import('./activity/ActivitySubscriptionsPage'));
const ActivityLevelsPage = React.lazy(() => import('./activity/ActivityLevelsPage'));
const ActivityZonesPage = React.lazy(() => import('./activity/ActivityZonesPage'));
const ActivityFeesPage = React.lazy(() => import('./activity/ActivityFeesPage'));

const { useSearchParams } = ReactRouterDOM as any;

// Icon map for shared buttons
const ICON_MAP: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard size={18} />,
  CalendarCheck: <CalendarCheck size={18} />,
  Palette: <Palette size={18} />,
  Settings: <Settings size={18} />,
  Eye: <Eye size={18} />,
  Stethoscope: <Users size={18} />,
  ListChecks: <ListChecks size={18} />,
};

// ============================================
// خريطة أسماء التابات التي تشير إلى صفحة مقدمي الخدمة
// ============================================
const PROVIDER_ROUTES = new Set([
  'doctors', 'experts', 'therapists', 'units', 'rooms', 'tables',
  'venues', 'vehicles', 'coaches', 'instructors', 'technicians', 'providers',
]);

// ============================================
// خريطة أسماء التابات التي تشير إلى صفحة الخدمات
// ============================================
const SERVICE_ROUTES = new Set([
  'services',
]);

// ============================================
// خريطة الراوتات الخاصة بكل نشاط → الصفحة المناسبة
// ============================================
const ACTIVITY_ROUTE_PAGE_MAP: Record<string, React.FC<{ activityType: BookingActivityType }>> = {
  // غرف / كراسي / عيادات فرعية
  'activity/rooms': ActivityRoomsPage,
  'activity/chairs': ActivityRoomsPage,
  // ملفات مرضى
  'activity/patients': ActivityPatientsPage,
  'activity/inventory': ActivityInventoryPage,
  // باقات
  'activity/packages': ActivityPackagesPage,
  // مواسم وأسعار
  'activity/seasons': ActivitySeasonsPage,
  // سياسات دخول / وصول / قواعد مواعيد
  'activity/policies': ActivityPoliciesPage,
  'activity/rules': ActivityPoliciesPage,
  // توافر ليلي
  'activity/availability': ActivityAvailabilityPage,
  // قواعد سعة
  'activity/capacity': ActivityCapacityPage,
  // طلبات عملاء
  'activity/special': ActivityRequestsPage,
  // تذاكر
  'activity/tickets': ActivityTicketsPage,
  // جدول فعاليات
  'activity/schedule': ActivitySchedulePage,
  // تأمين وشروط
  'activity/insurance': ActivityInsurancePage,
  // مواقع / فروع
  'activity/locations': ActivityLocationsPage,
  'activity/branches': ActivityLocationsPage,
  // اشتراكات
  'activity/subscriptions': ActivitySubscriptionsPage,
  // مستويات
  'activity/levels': ActivityLevelsPage,
  // مناطق خدمة
  'activity/zones': ActivityZonesPage,
  // رسوم انتقال
  'activity/fees': ActivityFeesPage,
};

const BookingLayout: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');

  // ============================================
  // قراءة النشاط + التاب النشط من الـ URL
  // ============================================
  const activityParam = searchParams.get('activity') || 'clinic';
  const activeTabParam = searchParams.get('tab') || 'overview';

  const validActivity = BOOKING_ACTIVITIES.find(a => a.id === activityParam)
    ? (activityParam as BookingActivityType)
    : ('clinic' as BookingActivityType);

  const lang = i18n.language;
  const activityButtons = getActivitySpecificButtons(validActivity);

  // ============================================
  // التبديل بين الأنشطة والتابات
  // ============================================
  const setActivity = useCallback((activity: string) => {
    const next = new URLSearchParams(searchParams);
    next.set('activity', activity);
    next.set('tab', 'overview');
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  const setTab = useCallback((tab: string) => {
    const next = new URLSearchParams(searchParams);
    if (!tab || tab === 'overview') {
      next.delete('tab');
    } else {
      next.set('tab', tab);
    }
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  // ============================================
  // اختيار الصفحة المناسبة حسب التاب النشط
  // ============================================
  const renderPage = () => {
    // 1) الصفحات المشتركة
    switch (activeTabParam) {
      case 'overview':
        return <BookingOverviewPage activityType={validActivity} loading={false} onNavigate={setTab} />;
      case 'bookings':
        return <BookingBookingsPage activityType={validActivity} loading={false} />;
      case 'design':
        return <PageBuilder onClose={() => setTab('overview')} integrated forceBookingMode bookingActivityType={validActivity} />;
      case 'settings':
        return <BookingSettingsPage activityType={validActivity} />;
    }

    // 2) صفحة مقدمي الخدمة (doctors, experts, therapists, coaches, instructors, providers, ...)
    if (PROVIDER_ROUTES.has(activeTabParam)) {
      return <BookingProvidersPage activityType={validActivity} />;
    }

    // 3) صفحة الخدمات (services)
    if (SERVICE_ROUTES.has(activeTabParam)) {
      return <BookingServicesPage activityType={validActivity} />;
    }

    // 4) صفحات الأزرار الخاصة (activity/*)
    const ActivityPage = ACTIVITY_ROUTE_PAGE_MAP[activeTabParam];
    if (ActivityPage) {
      return <ActivityPage activityType={validActivity} />;
    }

    // 5) fallback → نظرة عامة
    return <BookingOverviewPage activityType={validActivity} loading={false} onNavigate={setTab} />;
  };

  return (
    <div className="min-h-screen bg-slate-50/50" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* ─── شريط الأنشطة (Activity Tabs) ──────────────── */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between flex-row-reverse mb-3">
            <h1 className="text-lg font-black text-slate-900">{t('booking.layout.title')}</h1>
          </div>

          {/* نشاط selector - كل 12 نشاط ظاهرين */}
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar flex-row-reverse">
            {BOOKING_ACTIVITIES.map((activity) => (
              <button
                key={activity.id}
                onClick={() => setActivity(activity.id)}
                className={`whitespace-nowrap px-4 py-2 rounded-xl font-black text-xs transition-all ${validActivity === activity.id
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
              >
                {getLocalizedActivityTitle(activity, lang)}
              </button>
            ))}
          </div>

          {/* الأزرار المشتركة والخاصة */}
          <div className="flex gap-2 overflow-x-auto pb-1 flex-row-reverse mt-2">
            {/* الأزرار المشتركة أولاً */}
            {SHARED_BOOKING_BUTTONS.map((btn) => (
              <button
                key={btn.id}
                onClick={() => setTab(btn.route)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-lg font-black text-[10px] transition-all flex items-center gap-1.5 ${activeTabParam === btn.route
                  ? 'bg-[#00E5FF]/10 text-[#0097A7]'
                  : 'text-slate-400 hover:text-slate-600'
                  }`}
              >
                {ICON_MAP[btn.icon] || null}
                {getLocalizedButtonLabel(btn, lang)}
              </button>
            ))}

            {/* فاصل */}
            <div className="w-px bg-slate-200 mx-1" />

            {/* الأزرار الخاصة بالنشاط الحالي */}
            {activityButtons.map((btn) => (
              <button
                key={btn.id}
                onClick={() => setTab(btn.route)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-lg font-black text-[10px] transition-all flex items-center gap-1.5 ${activeTabParam === btn.route
                  ? 'bg-amber-50 text-amber-700'
                  : 'text-slate-400 hover:text-slate-600'
                  }`}
              >
                {getLocalizedButtonLabel(btn, lang)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── المحتوى الرئيسي ────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <React.Suspense
          fallback={
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="animate-spin text-[#00E5FF] w-8 h-8" />
              <p className="font-bold text-slate-400">{t('booking.loading')}</p>
            </div>
          }
        >
          {renderPage()}
        </React.Suspense>
      </div>
    </div>
  );
};

export default BookingLayout;