import React from 'react';
import { CalendarCheck, Clock, Phone, User, UserCheck } from 'lucide-react';
import { Reservation } from '@/types';
import SmartImage from '@/components/common/ui/SmartImage';
import { ReservationFilter } from './types';
import { getReservationActivityTitle, normalizeReservationStatus } from './reservationUtils';

type Props = {
  reservations: Reservation[];
  filter: ReservationFilter;
  locale: string;
  labels: {
    amountDue: string;
    cancelReservation: string;
    cancelled: string;
    completedEmpty: string;
    currency: string;
    customer: string;
    expiredEmpty: string;
    noReservations: string;
    pendingEmpty: string;
    received: string;
  };
  onUpdateStatus: (id: string, status: string) => void;
};

const ReservationCardsList: React.FC<Props> = ({ reservations, filter, locale, labels, onUpdateStatus }) => {
  const emptyLabel = filter === 'pending'
    ? labels.pendingEmpty
    : filter === 'completed'
      ? labels.completedEmpty
      : filter === 'expired'
        ? labels.expiredEmpty
        : labels.noReservations;

  if (reservations.length === 0) {
    return (
      <div className="py-32 text-center border-2 border-dashed border-slate-100 rounded-[3rem] text-slate-300">
        <CalendarCheck size={64} className="mx-auto mb-6 opacity-10" />
        <p className="font-black text-xl">{emptyLabel}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reservations.map((reservation) => {
        const normalized = normalizeReservationStatus((reservation as any).status);
        const activityTitle = getReservationActivityTitle(reservation);
        return (
          <div
            key={reservation.id}
            className="bg-slate-50/50 p-5 md:p-8 rounded-[2.5rem] border border-slate-100 flex flex-col lg:flex-row items-center justify-between gap-6 md:gap-8 hover:bg-slate-50 transition-all group"
          >
            <div className="flex items-center gap-4 md:gap-8 flex-row-reverse w-full lg:w-auto min-w-0">
              <SmartImage
                src={(reservation as any).itemImage}
                className="w-20 h-20 md:w-24 md:h-24 rounded-3xl"
                imgClassName="object-cover rounded-3xl shadow-xl group-hover:rotate-3 transition-transform"
                loading="lazy"
              />
              <div className="text-right min-w-0 flex-1">
                <div className="mb-2 flex items-center justify-end gap-2 flex-wrap">
                  {activityTitle && (
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black text-emerald-700 border border-emerald-100">
                      {activityTitle}
                    </span>
                  )}
                  <p className="font-black text-xl md:text-2xl text-slate-900 break-words">
                    {(reservation as any).itemName}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-500 font-black text-sm flex items-center justify-end gap-2 break-words">
                    <User size={14} /> {labels.customer}: {(reservation as any).customerName}
                  </p>
                  <p className="text-slate-400 font-bold text-sm flex items-center justify-end gap-2 break-all">
                    <Phone size={14} /> {(reservation as any).customerPhone}
                  </p>
                </div>
                <p className="text-[10px] text-[#00E5FF] font-black mt-3 uppercase tracking-tighter flex items-center justify-end gap-1">
                  <Clock size={12} /> {new Date((reservation as any).createdAt).toLocaleString(locale)}
                </p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-6 w-full lg:w-auto">
              <div className="text-right md:text-left px-0 md:px-8">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{labels.amountDue}</p>
                <p className="text-2xl md:text-3xl font-black text-slate-900">{labels.currency} {(reservation as any).itemPrice}</p>
              </div>
              {normalized === 'pending' ? (
                <div className="flex gap-3 w-full md:w-auto">
                  <button
                    onClick={() => onUpdateStatus(reservation.id, 'completed')}
                    className="flex-1 md:w-40 py-4 md:py-5 bg-green-500 text-white rounded-2xl font-black text-xs hover:bg-green-600 transition-all shadow-lg shadow-green-100 flex items-center justify-center gap-2"
                  >
                    <UserCheck size={14} /> {labels.received}
                  </button>
                  <button
                    onClick={() => onUpdateStatus(reservation.id, 'expired')}
                    className="flex-1 md:w-40 py-4 md:py-5 bg-white border border-slate-200 text-red-500 rounded-2xl font-black text-xs hover:bg-red-50 transition-all"
                  >
                    {labels.cancelReservation}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  {normalized === 'completed' ? (
                    <span className="bg-green-100 text-green-600 px-4 py-2 rounded-xl font-black text-xs">{labels.received}</span>
                  ) : (
                    <span className="bg-red-100 text-red-600 px-4 py-2 rounded-xl font-black text-xs">{labels.cancelled}</span>
                  )}
                  <span className="text-slate-400 font-black text-xs">{new Date((reservation as any).createdAt).toLocaleDateString(locale)}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ReservationCardsList;
