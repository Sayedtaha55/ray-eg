'use client';

import React from 'react';
import { Calendar } from 'lucide-react';
import { useT } from '@/i18n/useT';

type Props = {
  reservations: any[];
  onUpdateStatus: (id: string, status: string) => void;
};

const ReservationsTab: React.FC<Props> = ({ reservations }) => {
  const t = useT();
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm text-right">
      <h2 className="text-2xl font-black text-slate-900 mb-8">{t('business.dashboardTabs.reservations')}</h2>
      {reservations.length === 0 ? (
        <div className="py-20 text-center">
          <Calendar size={48} className="mx-auto text-slate-200 mb-4" />
          <p className="text-slate-400 font-bold">{t('business.reservations.noReservations')}</p>
        </div>
      ) : null}
    </div>
  );
};

export default ReservationsTab;
