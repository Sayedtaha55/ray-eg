'use client';

import React from 'react';
import { Megaphone, Plus } from 'lucide-react';
import { useT } from '@/i18n/useT';

type Props = {
  shopId: string;
  offers: any[];
  onDelete: (id: string) => void;
  onCreateOffer: () => void;
};

const PromotionsTab: React.FC<Props> = ({ offers, onCreateOffer }) => {
  const t = useT();
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm text-right">
      <div className="flex items-center justify-between mb-8 flex-row-reverse">
        <h2 className="text-2xl font-black text-slate-900">{t('business.dashboardTabs.promotions')}</h2>
        <button onClick={onCreateOffer} className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2">
          <Plus size={18} /> {t('business.promotions.createOffer')}
        </button>
      </div>
      <Megaphone size={48} className="mx-auto text-slate-200 mb-4" />
      <p className="text-slate-400 font-bold text-center">{t('business.promotions.noOffers')}</p>
    </div>
  );
};

export default PromotionsTab;
