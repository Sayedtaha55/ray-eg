import React, { useMemo, useState } from 'react';
import { CalendarCheck, Clock, Phone, UserCheck, XCircle, Calendar, TrendingUp, DollarSign } from 'lucide-react';
import { Reservation } from '@/types';
import { useTranslation } from 'react-i18next';
import ReservationCardsList from './reservations/ReservationCardsList';
import ReservationFilterTabs from './reservations/ReservationFilterTabs';
import ReservationsHeader from './reservations/ReservationsHeader';
import { ReservationFilter } from './reservations/types';
import { countReservationsByStatus, filterReservations } from './reservations/reservationUtils';

type Props = {
  reservations: Reservation[];
  onUpdateStatus: (id: string, s: string) => void;
};

export const ReservationsTab: React.FC<Props> = ({ reservations, onUpdateStatus }) => {
  const { t, i18n } = useTranslation();
  const locale = String(i18n.language || '').toLowerCase().startsWith('ar') ? 'ar-EG' : 'en-US';
  const [filter, setFilter] = useState<ReservationFilter>('pending');

  const counts = countReservationsByStatus(reservations);
  const filteredReservations = filterReservations(reservations, filter);

  const stats = useMemo(() => {
    const totalRevenue = reservations
      .filter((r: any) => String(r.status || '').toUpperCase() === 'COMPLETED')
      .reduce((sum, r: any) => sum + Number(r.itemPrice || 0), 0);
    const pendingRevenue = reservations
      .filter((r: any) => String(r.status || '').toUpperCase() === 'PENDING')
      .reduce((sum, r: any) => sum + Number(r.itemPrice || 0), 0);
    const todayReservations = reservations.filter((r: any) => {
      const d = new Date(r.createdAt);
      const now = new Date();
      return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
    return { totalRevenue, pendingRevenue, todayReservations };
  }, [reservations]);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-xs font-black text-slate-400 uppercase tracking-wide">قيد الانتظار</span>
          </div>
          <p className="text-3xl font-black text-slate-900">{counts.pending}</p>
          <p className="text-xs text-slate-400 font-bold mt-1">{t('business.reservations.currency')} {stats.pendingRevenue.toLocaleString()} معلق</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-xs font-black text-slate-400 uppercase tracking-wide">مكتملة</span>
          </div>
          <p className="text-3xl font-black text-slate-900">{counts.completed}</p>
          <p className="text-xs text-slate-400 font-bold mt-1">{t('business.reservations.currency')} {stats.totalRevenue.toLocaleString()} إيرادات</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-500" />
            </div>
            <span className="text-xs font-black text-slate-400 uppercase tracking-wide">ملغاة / منتهية</span>
          </div>
          <p className="text-3xl font-black text-slate-900">{counts.expired}</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-xs font-black text-slate-400 uppercase tracking-wide">حجوزات اليوم</span>
          </div>
          <p className="text-3xl font-black text-slate-900">{stats.todayReservations}</p>
          <p className="text-xs text-slate-400 font-bold mt-1">من {reservations.length} إجمالي</p>
        </div>
      </div>

      {/* Main Content */}
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
    </div>
  );
};

export default ReservationsTab;
