'use client';

import React from 'react';
import { Camera, Plus } from 'lucide-react';
import { useT } from '@/i18n/useT';

type Props = {
  images: any[];
  onImagesChange: (imgs: any[]) => void;
  shopId: string;
  primaryColor: string;
};

const GalleryTab: React.FC<Props> = ({ images }) => {
  const t = useT();
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm text-right">
      <div className="flex items-center justify-between mb-8 flex-row-reverse">
        <h2 className="text-2xl font-black text-slate-900">{t('business.activities.gallery')}</h2>
        <button className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2">
          <Plus size={18} /> {t('business.gallery.addImage')}
        </button>
      </div>
      <Camera size={48} className="mx-auto text-slate-200 mb-4" />
      <p className="text-slate-400 font-bold text-center">{t('business.gallery.noImages')}</p>
    </div>
  );
};

export default GalleryTab;
