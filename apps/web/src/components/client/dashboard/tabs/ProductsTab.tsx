'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Edit, Eye, EyeOff, Loader2 } from 'lucide-react';
import * as merchantApi from '@/lib/api/merchant';
import { useT } from '@/i18n/useT';

type Props = {
  products: any[];
  shopId: string;
  shopCategory?: string;
  shop?: any;
  onDelete: (id: string) => void;
  onAdd?: () => void;
};

const ProductsTab: React.FC<Props> = ({ products, shopId, shopCategory, shop, onDelete, onAdd }) => {
  const t = useT();
  const isRestaurant = String(shopCategory || '').toUpperCase() === 'RESTAURANT';
  const pageTitle = isRestaurant ? t('business.dashboard.products.menuTitle') : t('business.dashboard.products.inventoryTitle');
  const [togglingId, setTogglingId] = useState<string>('');
  const [editProduct, setEditProduct] = useState<any>(null);

  const handleToggleActive = async (product: any) => {
    const current = typeof product?.isActive === 'boolean' ? product.isActive : true;
    const next = !current;
    setTogglingId(String(product.id));
    try {
      await merchantApi.merchantUpdateProduct(String(product.id), { isActive: next });
    } catch {} finally { setTogglingId(''); }
  };

  return (
    <div className="bg-white p-4 sm:p-8 md:p-12 rounded-[2.5rem] sm:rounded-[3.5rem] border border-slate-100 shadow-sm">
      <div className="flex items-start sm:items-center justify-between mb-6 sm:mb-12 flex-row-reverse gap-4">
        <h3 className="text-2xl sm:text-3xl font-black">{pageTitle}</h3>
        <span className="bg-purple-100 text-[#BD00FF] px-4 md:px-6 py-2 rounded-full font-black text-[11px] md:text-xs uppercase">
          {products.length} {t('business.dashboard.products.itemsCount')}
        </span>
      </div>

      {products.length === 0 ? (
        <div className="py-32 text-center border-2 border-dashed border-slate-100 rounded-[3rem] text-slate-300 font-bold">
          {t('business.dashboard.products.noProducts')}
        </div>
      ) : (
        <div className="rounded-[2rem] border border-slate-100 overflow-hidden">
          <div className="grid grid-cols-12 bg-slate-50 px-4 py-3 text-[11px] font-black text-slate-500 uppercase tracking-widest">
            <div className="col-span-2 text-right">{t('business.dashboard.products.image')}</div>
            <div className="col-span-4 text-right">{t('business.dashboard.products.name')}</div>
            <div className="col-span-2 text-right">{t('business.dashboard.products.price')}</div>
            <div className="col-span-2 text-right">{t('business.dashboard.products.stock')}</div>
            <div className="col-span-2 text-right">{t('business.dashboard.products.actions')}</div>
          </div>
          <div className="divide-y divide-slate-100">
            {products.map((product: any) => {
              const imgSrc = String(product.imageUrl || product.image_url || '').trim();
              const isInactive = product?.isActive === false;
              return (
                <div key={product.id} className={`grid grid-cols-12 px-4 py-3 items-center ${isInactive ? 'opacity-70' : ''}`}>
                  <div className="col-span-2 flex items-center justify-end">
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                      {imgSrc ? <img src={imgSrc} alt="" className="w-full h-full object-cover" loading="lazy" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><Plus size={12} /></div>}
                    </div>
                  </div>
                  <div className="col-span-4 pr-4">
                    <div className="font-black text-slate-900 text-xs sm:text-sm truncate">{product.name}</div>
                    <div className="text-[10px] font-bold text-slate-400">{product.category?.name || product.category || t('business.dashboard.products.noCategory')}</div>
                  </div>
                  <div className="col-span-2 font-black text-slate-900 text-xs sm:text-sm">
                    {t('business.pos.egp')} {Number(product.price || 0).toLocaleString()}
                  </div>
                  <div className="col-span-2 font-black text-slate-900 text-xs sm:text-sm">
                    {product.stock ?? 0}
                  </div>
                  <div className="col-span-2 flex items-center justify-end gap-1 sm:gap-2">
                    <button onClick={() => handleToggleActive(product)} disabled={togglingId === String(product.id)}
                      className={`p-2 rounded-lg transition-all ${isInactive ? 'bg-slate-100 text-slate-400' : 'bg-emerald-50 text-emerald-600'}`}>
                      {togglingId === String(product.id) ? <Loader2 size={14} className="animate-spin" /> : (isInactive ? <EyeOff size={14} /> : <Eye size={14} />)}
                    </button>
                    <button onClick={() => onDelete(String(product.id))}
                      className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsTab;
