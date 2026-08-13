import React, { lazy } from 'react';
import type { MerchantDashboardTabId } from '../../pages/business/merchant-dashboard/dashboardTabs';
import type { TabRenderer } from './salesTabs';

const ReservationsTab = lazy(() => import('../../modules/bookings/pages/ReservationsTab').then(m => ({ default: m.ReservationsTab })));
const RestaurantTablesTab = lazy(() => import('../../modules/bookings/pages/RestaurantTablesTab'));
const AppointmentsPage = lazy(() => import('../../modules/bookings/pages/appointments/AppointmentsPage'));
const CalendarPage = lazy(() => import('../../modules/bookings/pages/calendar/CalendarPage'));
const RoomsPage = lazy(() => import('../../modules/bookings/pages/rooms/RoomsPage'));
const DoctorsPage = lazy(() => import('../../modules/bookings/pages/doctors/DoctorsPage'));
const BookingConfirmPage = lazy(() => import('../../modules/bookings/pages/bookingConfirm/BookingConfirmPage'));
const BookingCancelPage = lazy(() => import('../../modules/bookings/pages/bookingCancel/BookingCancelPage'));
const BookingReminderPage = lazy(() => import('../../modules/bookings/pages/bookingReminder/BookingReminderPage'));

export const bookingsTabRenderers: Partial<Record<MerchantDashboardTabId, TabRenderer>> = {
  reservations: ({ reservations }) => <ReservationsTab reservations={reservations || []} onUpdateStatus={() => {}} />,
  restaurantTables: ({ shopId, shop }) => <RestaurantTablesTab shop={shop} onSaved={() => {}} />,
  appointments: ({ shopId, shop }) => <AppointmentsPage shopId={shopId} shop={shop} />,
  calendar: ({ shopId, shop }) => <CalendarPage shopId={shopId} shop={shop} />,
  rooms: ({ shopId, shop }) => <RoomsPage shopId={shopId} shop={shop} />,
  doctors: ({ shopId, shop }) => <DoctorsPage shopId={shopId} shop={shop} />,
  bookingConfirm: ({ shopId, shop }) => <BookingConfirmPage shopId={shopId} shop={shop} />,
  bookingCancel: ({ shopId, shop }) => <BookingCancelPage shopId={shopId} shop={shop} />,
  bookingReminder: ({ shopId, shop }) => <BookingReminderPage shopId={shopId} shop={shop} />,
};
