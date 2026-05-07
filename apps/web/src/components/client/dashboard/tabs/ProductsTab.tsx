'use client';

import React, { Suspense, lazy, useEffect, useMemo, useState, memo } from 'react';
import { Plus, Trash2, Edit, Eye, EyeOff, Loader2, ShoppingCart, ChevronDown, Lock, Unlock, Upload, Download } from 'lucide-react';
import { Product } from '@/types';
import * as merchantApi from '@/lib/api/merchant';
import { useToast } from '@/lib/hooks/useToast';
import SmartImage from '@/components/common/ui/SmartImage';
import { useT } from '@/i18n/useT';

const EditProductModal = lazy(() => import('../modals/EditProductModal'));

const ProductRow = memo(({
  product,
  togglingId,
  handleEdit,
  handleToggleActive,
  onDelete,
  setPreviewImageSrc,
  t
}: any) => {
  const imgSrc = String(((product as any).imageUrl || (product as any).image_url || '')).trim();
  const isInactive = (product as any)?.isActive === false;

  return (
    <div className={`grid grid-cols-12 px-4 py-3 items-center ${isInactive ? 'opacity-70' : ''}`}>
      <div className="col-span-2 flex items-center justify-end">
        <button
          type="button"
          onClick={() => {
            if (!imgSrc) return;
            setPreviewImageSrc(imgSrc);
          }}
          className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 border border-slate-200"
        >
          {imgSrc ? (
            <SmartImage src={imgSrc} className="w-full h-full" imgClassName="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300">
              <Plus size={12} />
            </div>
          )}
        </button>
      </div>
      <div className="col-span-4 pr-4">
        <div className="font-black text-slate-900 text-xs sm:text-sm truncate">{product.name}</div>
        <div className="text-[10px] font-bold text-slate-400">{product.category?.name || t('business.products.noCategory')}</div>
      </div>
      <div className="col-span-2 font-black text-slate-900 text-xs sm:text-sm">
        {t('business.pos.egp')} {Number(product.price || 0).toLocaleString()}
      </div>
      <div className="col-span-2 font-black text-slate-900 text-xs sm:text-sm">
        {product.stock ?? 0}
      </div>
      <div className="col-span-2 flex items-center justify-end gap-1 sm:gap-2">
        <button
          onClick={() => handleToggleActive(product)}
          disabled={togglingId === String(product.id)}
          className={`p-2 rounded-lg transition-all ${isInactive ? 'bg-slate-100 text-slate-400' : 'bg-emerald-50 text-emerald-600'}`}
        >
          {togglingId === String(product.id) ? <Loader2 size={14} className="animate-spin" /> : (isInactive ? <EyeOff size={14} /> : <Eye size={14} />)}
        </button>
        <button
          onClick={() => handleEdit(product)}
          className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all"
        >
          <Edit size={14} />
        </button>
        <button
          onClick={() => onDelete(String(product.id))}
          className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
});

type Props = {
  products: any[];
  onAdd: () => void;
  onDelete: (id: string) => void;
  shopId: string;
  shopCategory?: string;
  shop?: any;
};

const ProductsTab: React.FC<Props> = ({ products, onAdd, onDelete, shopId, shopCategory, shop }) => {
  const t = useT();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [togglingId, setTogglingId] = useState<string>('');
  const [previewImageSrc, setPreviewImageSrc] = useState<string>('');
  const [renderCount, setRenderCount] = useState(50);

  const { addToast } = useToast();

  const isRestaurant = String(shopCategory || '').toUpperCase() === 'RESTAURANT';
  const pageTitle = isRestaurant ? t('business.dashboardTabs.menu') : t('business.dashboardTabs.inventory');

  const handleEdit = (product: any) => {
    setSelectedProduct(product);
    setEditModalOpen(true);
  };

  const handleToggleActive = async (product: any) => {
    // Logic for toggling active state
  };

  return (
    <div className="bg-white p-4 sm:p-8 md:p-12 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex items-start sm:items-center justify-between mb-6 sm:mb-12 flex-row-reverse gap-4">
          <h3 className="text-2xl sm:text-3xl font-black">{pageTitle}</h3>
          <div className="flex items-center gap-3">
            <button
              onClick={onAdd}
              className="px-6 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm flex items-center gap-2"
            >
              <Plus size={18} /> {t('business.products.addProduct')}
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[720px]">
              <div className="grid grid-cols-12 bg-slate-50 px-4 py-3 text-[11px] font-black text-slate-500">
                <div className="col-span-2 text-right">{t('business.products.image')}</div>
                <div className="col-span-4 text-right pr-4">{t('business.products.name')}</div>
                <div className="col-span-2 text-right">{t('business.products.price')}</div>
                <div className="col-span-2 text-right">{t('business.products.stock')}</div>
                <div className="col-span-2 text-right">{t('business.products.actions')}</div>
              </div>

              <div className="divide-y divide-slate-100">
                {products.slice(0, renderCount).map((p) => (
                  <ProductRow
                    key={p.id}
                    product={p}
                    togglingId={togglingId}
                    handleEdit={handleEdit}
                    handleToggleActive={handleToggleActive}
                    onDelete={onDelete}
                    setPreviewImageSrc={setPreviewImageSrc}
                    t={t}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <EditProductModal
           isOpen={editModalOpen}
           onClose={() => setEditModalOpen(false)}
           product={selectedProduct}
           onUpdated={() => {}}
        />
    </div>
  );
};

export default ProductsTab;
