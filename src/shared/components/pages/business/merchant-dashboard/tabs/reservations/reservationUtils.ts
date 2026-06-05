import { Reservation } from '@/types';
import { ReservationFilter } from './types';
import { getBookingActivityDefinition, getBookingActivityTypeFromParam } from '@/components/pages/business/clinic/bookingActivityConfig';

export const normalizeReservationStatus = (status: any): 'pending' | 'completed' | 'expired' => {
  const s = String(status || '').trim().toUpperCase();
  if (s === 'COMPLETED') return 'completed';
  if (s === 'CANCELLED' || s === 'CANCELED' || s === 'EXPIRED') return 'expired';
  return 'pending';
};

export const filterReservations = (reservations: Reservation[], filter: ReservationFilter): Reservation[] => {
  if (filter === 'all') return reservations;
  return reservations.filter((reservation) => normalizeReservationStatus((reservation as any).status) === filter);
};

export const countReservationsByStatus = (reservations: Reservation[]) => ({
  pending: reservations.filter((reservation) => normalizeReservationStatus((reservation as any).status) === 'pending').length,
  completed: reservations.filter((reservation) => normalizeReservationStatus((reservation as any).status) === 'completed').length,
  expired: reservations.filter((reservation) => normalizeReservationStatus((reservation as any).status) === 'expired').length,
  all: reservations.length,
});

export const getReservationActivityTitle = (reservation: any): string => {
  const rawType = reservation?.bookingActivityType
    || reservation?.activityType
    || reservation?.metadata?.bookingActivityType
    || reservation?.metadata?.activityType
    || reservation?.bookingActivityRoute
    || reservation?.metadata?.bookingActivityRoute
    || '';
  if (!rawType) return '';
  return getBookingActivityDefinition(getBookingActivityTypeFromParam(String(rawType))).title;
};
