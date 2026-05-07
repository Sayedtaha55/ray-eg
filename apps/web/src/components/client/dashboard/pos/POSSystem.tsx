'use client';

import React from 'react';
import { Smartphone, X } from 'lucide-react';
import { useT } from '@/i18n/useT';

type Props = {
  onClose: () => void;
  shopId: string;
  shop: any;
};

const POSSystem: React.FC<Props> = ({ onClose }) => {
  const t = useT();
  return (
    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white min-h-[600px] relative">
      <button onClick={onClose} className="absolute top-6 left-6 text-slate-500 hover:text-white">
        <X size={24} />
      </button>
      <div className="flex flex-col items-center justify-center h-full pt-20">
        <Smartphone size={64} className="text-[#00E5FF] mb-6" />
        <h2 className="text-3xl font-black mb-4">{t('business.dashboard.smartPOS')}</h2>
        <p className="text-slate-400 font-bold max-w-md text-center">
          {t('business.pos.description', 'نظام نقطة البيع الذكي متاح الآن لمتجرك.')}
        </p>
      </div>
    </div>
  );
};

export default POSSystem;
