'use client';

import React, { useEffect, useState } from 'react';
import { Camera, Plus, Trash2, Loader2 } from 'lucide-react';
import * as merchantApi from '@/lib/api/merchant';
import { uploadFiles } from '@/lib/api/upload';
import { useT } from '@/i18n/useT';

type Props = {
  images: any[];
  onImagesChange: (images: any[]) => void;
  shopId: string;
  primaryColor: string;
};

const GalleryTab: React.FC<Props> = ({ images, onImagesChange, shopId, primaryColor }) => {
  const t = useT();
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    try {
      await uploadFiles(Array.from(files), { purpose: 'gallery', shopId });
      const updated = await merchantApi.merchantGetGallery(shopId);
      onImagesChange(updated || []);
    } catch {} finally { setUploading(false); }
  };

  const handleDelete = async (imageId: string) => {
    try {
      await merchantApi.merchantDeleteGalleryImage(shopId, imageId);
      onImagesChange(images.filter((img: any) => String(img.id) !== imageId));
    } catch {}
  };

  return (
    <div className="bg-white p-8 md:p-12 rounded-[3.5rem] border border-slate-100 shadow-sm">
      <div className="flex items-start md:items-center justify-between mb-10 flex-row-reverse gap-4">
        <h3 className="text-3xl font-black">{t('business.activities.gallery')}</h3>
        <label className={`px-4 md:px-6 py-2 md:py-3 rounded-2xl font-black text-[11px] md:text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${uploading ? 'bg-slate-200 text-slate-400' : 'bg-slate-900 text-white hover:bg-black'}`}>
          <Camera size={16} />
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          {t('business.gallery.addImages')}
          <input type="file" multiple accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
        </label>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {images.length === 0 ? (
          <div className="col-span-full py-32 text-center border-2 border-dashed border-slate-100 rounded-[3rem] text-slate-300 font-bold">{t('business.gallery.noImages')}</div>
        ) : (
          images.map((img: any) => (
            <div key={img.id} className="relative group aspect-square rounded-3xl overflow-hidden border border-slate-100">
              <img src={img.url || img.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
              <button onClick={() => handleDelete(String(img.id))} className="absolute top-3 left-3 p-2 bg-red-500 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default GalleryTab;
