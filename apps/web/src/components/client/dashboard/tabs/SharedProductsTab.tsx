'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Tag, Trash2, Edit, Eye, EyeOff, Loader2, Package } from 'lucide-react';
import Image from 'next/image';
import { clientFetch } from '@/lib/api/client';
import { useT } from '@/i18n/useT';

type Product = {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isActive?: boolean;
  [key: string]: any;
};

type Props = {
  products: Product[];
  onAdd: () => void;
  onMakeOffer: (product: Product) => void;
  onDelete: (id: string) => void;
  onUpdate: (product: Product) => void;
  shopId?: string;
  shopCategory?: string;
  shop?: any;
};

const SharedProductsTab: React.FC<Props> = ({ products, onAdd, onMakeOffer, onDelete, onUpdate, shopId, shopCategory }) => {
  const t = useT();
  const [togglingId, setTogglingId] = useState('');
  const [renderCount, setRenderCount] = useState(0);

  const isRestaurant = String(shopCategory || '').toUpperCase() === 'RESTAURANT';
  const pageTitle = isRestaurant ? t('business.sharedProducts.menu', 'القائمة') : t('business.sharedProducts.inventory', 'المخزون');

  const isLowEndDevice = useMemo(() => {
    try {
      const mem = typeof (navigator as any)?.deviceMemory === 'number' ? Number((navigator as any).deviceMemory) : undefined;
      const cores = typeof navigator?.hardwareConcurrency === 'number' ? Number(navigator.hardwareConcurrency) : undefined;
      if (typeof mem === 'number' && mem > 0 && mem <= 4) return true;
      if (typeof cores === 'number' && cores > 0 && cores <= 4) return true;
      return false;
    } catch { return false; }
  }, []);

  const initialBatch = isLowEndDevice ? 18 : 30;
  const batchSize = isLowEndDevice ? 12 : 20;

  useEffect(() => { setRenderCount(Math.min(initialBatch, products.length)); }, [initialBatch, products.length]);

  useEffect(() => {
    if (renderCount >= products.length) return;
    const timer = setTimeout(() => setRenderCount(prev => Math.min(prev + batchSize, products.length)), 0);
    return () => clearTimeout(timer);
  }, [batchSize, products.length, renderCount]);

  const handleToggleActive = async (product: Product) => {
    if (!shopId || togglingId) return;
    setTogglingId(product.id);
    try {
      await clientFetch<any>(`/v1/products/${product.id}`, { method: 'PATCH', body: JSON.stringify({ isActive: !product.isActive }) });
      onUpdate({ ...product, isActive: !product.isActive });
    } catch {} finally { setTogglingId(''); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black">{pageTitle}</h2>
        <button onClick={onAdd} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-all"><Plus size={20} />{t('business.sharedProducts.addProduct', 'إضافة منتج')}</button>
      </div>
      {products.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <p className="font-bold">{t('business.sharedProducts.noProducts', 'لا توجد منتجات')}</p>
          <button onClick={onAdd} className="mt-4 px-6 py-3 bg-[#00E5FF] text-black rounded-xl font-black hover:brightness-110 transition-all">{t('business.sharedProducts.addFirstProduct', 'أضف أول منتج')}</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.slice(0, renderCount).map(product => (
            <div key={product.id} className="bg-white border border-slate-100 rounded-2xl p-4 hover:shadow-lg transition-all">
              <div className="relative aspect-square rounded-xl bg-slate-50 mb-4 overflow-hidden">
                {product.imageUrl ? <Image src={product.imageUrl} alt={product.name} fill className="object-cover" sizes="(max-width:768px) 100vw, 33vw" /> : <div className="w-full h-full flex items-center justify-center"><Package className="w-10 h-10 text-slate-200" /></div>}
                <div className="absolute top-2 right-2 flex gap-1">
                  <button onClick={() => handleToggleActive(product)} disabled={togglingId === product.id} className="p-2 bg-white/90 backdrop-blur rounded-lg shadow-sm hover:bg-white transition-all" title={product.isActive ? t('business.sharedProducts.hide', 'إخفاء') : t('business.sharedProducts.show', 'إظهار')}>
                    {togglingId === product.id ? <Loader2 size={16} className="animate-spin" /> : product.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                </div>
              </div>
              <h3 className="font-black text-lg mb-2 line-clamp-1">{product.name}</h3>
              <p className="text-slate-500 font-bold mb-4">{t('business.sharedProducts.currency', 'ج.م')} {product.price}</p>
              <div className="flex gap-2">
                <button onClick={() => {}} className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-100 rounded-xl font-bold hover:bg-slate-200 transition-all"><Edit size={16} />{t('business.sharedProducts.edit', 'تعديل')}</button>
                <button onClick={() => onMakeOffer(product)} className="flex-1 flex items-center justify-center gap-2 py-2 bg-[#BD00FF]/10 text-[#BD00FF] rounded-xl font-bold hover:bg-[#BD00FF]/20 transition-all"><Tag size={16} />{t('business.sharedProducts.offer', 'عرض')}</button>
                <button onClick={() => onDelete(product.id)} className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-all"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SharedProductsTab;
