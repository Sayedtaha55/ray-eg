import React, { useState } from 'react';
import { Reservation } from '@/types';
import { useTranslation } from 'react-i18next';
import * as ReactRouterDOM from 'react-router-dom';
import BookingActivitySelectorPanel from './reservations/BookingActivitySelectorPanel';
import BookingCoreActionsPanel from './reservations/BookingCoreActionsPanel';
import BookingLaunchReadinessPanel from './reservations/BookingLaunchReadinessPanel';
import ReservationCardsList from './reservations/ReservationCardsList';
import ReservationFilterTabs from './reservations/ReservationFilterTabs';
import ReservationsHeader from './reservations/ReservationsHeader';
import { ReservationFilter } from './reservations/types';
import { countReservationsByStatus, filterReservations } from './reservations/reservationUtils';
import { useBookingActivityLaunch } from './reservations/useBookingActivityLaunch';

type Props = {
  reservations: Reservation[];
  onUpdateStatus: (id: string, s: string) => void;
};

export const ReservationsTab: React.FC<Props> = ({ reservations, onUpdateStatus }) => {
  const { t, i18n } = useTranslation();
  const { useNavigate } = ReactRouterDOM as any;
  const navigate = useNavigate();
  const locale = String(i18n.language || '').toLowerCase().startsWith('ar') ? 'ar-EG' : 'en-US';
  const [filter, setFilter] = useState<ReservationFilter>('pending');

  const {
    activitySaveError,
    activitySaving,
    defaultBookingRoute,
    handleSelectActivity,
    readinessItems,
    readinessPercent,
    selectedActivityDefinition,
  } = useBookingActivityLaunch({ reservations, navigate });

  const counts = countReservationsByStatus(reservations);
  const filteredReservations = filterReservations(reservations, filter);

  return (
    <div className="bg-white p-8 md:p-12 rounded-[3.5rem] border border-slate-100 shadow-sm">
      <ReservationsHeader
        title={t('business.reservations.title')}
        subtitle={t('business.reservations.autoAddNote')}
        pendingCount={counts.pending}
        completedCount={counts.completed}
        expiredCount={counts.expired}
        pendingLabel={t('business.reservations.pending')}
        completedLabel={t('business.reservations.completed')}
        rejectedLabel={t('business.reservations.rejected')}
      />

      <div className="grid grid-cols-1 xl:grid-cols-[0.9fr_1.1fr] gap-5 mb-8" dir="rtl">
        <BookingCoreActionsPanel bookingRoute={defaultBookingRoute} navigate={navigate} />
        <BookingActivitySelectorPanel
          activeRoute={defaultBookingRoute}
          savingActivity={activitySaving}
          saveError={activitySaveError}
          onSelectActivity={handleSelectActivity}
        />
      </div>

      <BookingLaunchReadinessPanel
        activityTitle={selectedActivityDefinition.title}
        readinessItems={readinessItems}
        readinessPercent={readinessPercent}
        navigate={navigate}
      />

      <ReservationFilterTabs
        filter={filter}
        counts={counts}
        labels={{
          pending: t('business.reservations.newReservations'),
          completed: t('business.reservations.completedReservations'),
          expired: t('business.reservations.rejectedReservations'),
          all: t('business.reservations.all'),
        }}
        onChange={setFilter}
      />

      <ReservationCardsList
        reservations={filteredReservations}
        filter={filter}
        locale={locale}
        labels={{
          amountDue: t('business.reservations.amountDue'),
          cancelReservation: t('business.reservations.cancelReservation'),
          cancelled: t('business.reservations.cancelled'),
          completedEmpty: t('business.reservations.noCompletedReservations'),
          currency: t('business.reservations.currency'),
          customer: t('business.reservations.customer'),
          expiredEmpty: t('business.reservations.noRejectedReservations'),
          noReservations: t('business.reservations.noReservations'),
          pendingEmpty: t('business.reservations.noNewReservations'),
          received: t('business.reservations.received'),
        }}
        onUpdateStatus={onUpdateStatus}
      />
    </div>
  );
};

export default ReservationsTab;
