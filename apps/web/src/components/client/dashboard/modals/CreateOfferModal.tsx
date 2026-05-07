'use client';

import React, { useState } from 'react';
import { CheckCircle2, Loader2, Percent, X } from 'lucide-react';
import * as merchantApi from '@/lib/api/merchant';
import { useToast } from '@/lib/hooks/useToast';
import { useT } from '@/i18n/useT';
import { useLocale } from '@/i18n/LocaleProvider';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  shopId: string;
  seedProduct?: any;
  onCreated?: () => void;
};

const CreateOfferModal: React.FC<Props> = ({ isOpen, onClose, shopId, seedProduct, onCreated }) => {
  const t = useT();
  const { dir } = useLocale();
  const toast = useToast();

  const [title, setTitle] = useState(seedProduct?.name || '');
  const [discount, setDiscount] = useState('');
  const [oldPrice, setOldPrice] = useState(String(seedProduct?.price || ''));
  const [newPrice, setNewPrice] = useState('');
  const [imageUrl, setImageUrl] = useState(seedProduct?.imageUrl || seedProduct?.image_url || '');
  const [productId, setProductId] = useState(String(seedProduct?.id || ''));
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { toast.addToast(t('business.promotions.enterTitle', 'أدخل عنوان العرض'), undefined, 'destructive'); return; }
    const parsedDiscount = Number(discount);
    if (!Number.isFinite(parsedDiscount) || parsedDiscount <= 0 || parsedDiscount > 100) { toast.addToast(t('business.promotions.invalidDiscount', 'نسبة خصم غير صالحة'), undefined, 'destructive'); return; }

    setLoading(true);
    try {
      const payload: any = {
        shopId,
        title: title.trim(),
        discount: parsedDiscount,
        imageUrl: imageUrl.trim() || undefined,
      };
      if (productId) payload.productId = productId;
      if (oldPrice) payload.oldPrice = Number(oldPrice);
      if (newPrice) payload.newPrice = Number(newPrice);

      await merchantApi.merchantCreateOffer(payload);
      toast.addToast(t('business.promotions.offerCreated', 'تم إنشاء العرض'), undefined, 'success');
      onCreated?.();
      onClose();
    } catch (err: any) {
      toast.addToast(String(err?.message || t('business.promotions.createOfferFailed', 'فشل إنشاء العرض')), undefined, 'destructive');
    } finally { setLoading(false); }
  };

  const resetAndClose = () => {
    setTitle(''); setDiscount(''); setOldPrice(''); setNewPrice(''); setImageUrl(''); setProductId('');
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9998] flex items-start sm:items-center justify-center p-0 sm:p-6" dir={dir}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={resetAndClose} />
      <div className="relative bg-white w-full sm:max-w-lg rounded-none sm:rounded-[3rem] p-6 sm:p-8 md:p-12 text-right shadow-2xl overflow-y-auto max-h-[100dvh] sm:max-h-[90vh] no-scrollbar">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl sm:text-3xl font-black">{t('business.promotions.createOffer', 'إنشاء عرض')}</h2>
          <button onClick={resetAndClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{t('business.promotions.offerTitle', 'عنوان العرض')}</label>
            <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('business.promotions.offerTitlePlaceholder', 'خصم 20% على كل المنتجات')} className="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] py-4 px-6 font-black text-lg text-right outline-none focus:bg-white focus:border-[#00E5FF]/20 transition-all" />
          </div>

          {/* Discount */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{t('business.promotions.discountPercent', 'نسبة الخصم %')}</label>
            <div className="relative">
              <input required type="number" min={1} max={100} value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="20" className="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] py-4 px-6 font-black text-lg text-right outline-none focus:bg-white focus:border-[#00E5FF]/20 transition-all" />
              <Percent size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          {/* Old & New Price */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{t('business.promotions.oldPrice', 'السعر قبل')}</label>
              <input type="number" min={0} step={0.01} value={oldPrice} onChange={(e) => setOldPrice(e.target.value)} placeholder="0.00" className="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] py-4 px-6 font-black text-lg text-right outline-none focus:bg-white focus:border-[#00E5FF]/20 transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{t('business.promotions.newPrice', 'السعر بعد')}</label>
              <input type="number" min={0} step={0.01} value={newPrice} onChange={(e) => setNewPrice(e.target.value)} placeholder="0.00" className="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] py-4 px-6 font-black text-lg text-right outline-none focus:bg-white focus:border-[#00E5FF]/20 transition-all" />
            </div>
          </div>

          {/* Image URL */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{t('business.promotions.imageUrl', 'رابط صورة العرض')}</label>
            <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." className="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] py-4 px-6 font-bold text-right outline-none focus:bg-white focus:border-[#00E5FF]/20 transition-all" />
          </div>

          {/* Preview */}
          {imageUrl && (
            <div className="relative rounded-2xl overflow-hidden border border-slate-100 aspect-video">
              <img src={imageUrl} alt="preview" className="w-full h-full object-cover" />
              {discount && <div className="absolute top-4 left-4 bg-[#BD00FF] text-white px-4 py-1.5 rounded-xl font-black text-sm shadow-xl">-{discount}%</div>}
            </div>
          )}

          {/* Submit */}
          <div className="pt-4 border-t border-slate-100">
            <button type="submit" disabled={loading} className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-lg hover:bg-black transition-all flex items-center justify-center gap-3 disabled:bg-slate-300">
              {loading ? <Loader2 className="animate-spin" size={22} /> : <CheckCircle2 size={22} className="text-[#00E5FF]" />}
              {loading ? t('business.promotions.creating', 'جاري الإنشاء...') : t('business.promotions.confirmCreate', 'تأكيد إنشاء العرض')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateOfferModal;
