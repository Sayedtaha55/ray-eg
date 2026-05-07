'use client';

import React, { useRef, useState } from 'react';
import { CheckCircle2, Loader2, Upload, X } from 'lucide-react';
import * as merchantApi from '@/lib/api/merchant';
import { uploadFiles } from '@/lib/api/upload';
import { useToast } from '@/lib/hooks/useToast';
import { useT } from '@/i18n/useT';
import { useLocale } from '@/i18n/LocaleProvider';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  shopId: string;
  shopCategory?: string;
  onCreated?: () => void;
};

const AddProductModal: React.FC<Props> = ({ isOpen, onClose, shopId, shopCategory, onCreated }) => {
  const t = useT();
  const { dir } = useLocale();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const extraFilesRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [cat, setCat] = useState('');
  const [description, setDescription] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [extraPreviews, setExtraPreviews] = useState<string[]>([]);
  const [extraFiles, setExtraFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const isRestaurant = String(shopCategory || '').toUpperCase() === 'RESTAURANT';

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const mime = String(file.type || '').toLowerCase();
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(mime)) {
      toast.addToast(t('business.products.unsupportedImageType', 'نوع صورة غير مدعوم'), undefined, 'destructive');
      return;
    }
    if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleExtraImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const allowed = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
    const valid = files.filter((f) => allowed.has(String(f.type || '').toLowerCase()));
    const merged = [...extraFiles, ...valid].slice(0, 5);
    const previews = merged.map((f) => URL.createObjectURL(f));
    setExtraFiles(merged);
    setExtraPreviews(previews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.addToast(t('business.products.enterName', 'أدخل اسم المنتج'), undefined, 'destructive'); return; }
    const parsedPrice = Number(price);
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) { toast.addToast(t('business.products.invalidPrice', 'سعر غير صالح'), undefined, 'destructive'); return; }
    if (!isRestaurant) {
      const parsedStock = Number(stock);
      if (!Number.isFinite(parsedStock) || parsedStock < 0) { toast.addToast(t('business.products.invalidQuantity', 'كمية غير صالحة'), undefined, 'destructive'); return; }
    }

    setLoading(true);
    try {
      let imageUrl = '';
      if (imageFile) {
        const results = await uploadFiles([imageFile], { purpose: 'product_image', shopId });
        imageUrl = results?.[0]?.publicUrl || '';
      }

      let extraUrls: string[] = [];
      if (extraFiles.length > 0) {
        const results = await uploadFiles(extraFiles, { purpose: 'product_image', shopId });
        extraUrls = results.map((r) => r.publicUrl).filter(Boolean);
      }

      await merchantApi.merchantAddProduct({
        shopId,
        name: name.trim(),
        price: parsedPrice,
        stock: isRestaurant ? 0 : Number(stock),
        category: cat.trim() || t('business.dashboard.products.generalCategory', 'عام'),
        description: description.trim() || null,
        imageUrl,
        images: [imageUrl, ...extraUrls].filter(Boolean),
        trackStock: !isRestaurant,
      });

      toast.addToast(t('business.products.productAdded', 'تم إضافة المنتج'), undefined, 'success');
      onCreated?.();
      onClose();
    } catch (err: any) {
      toast.addToast(String(err?.message || t('business.products.addProductFailed', 'فشل إضافة المنتج')), undefined, 'destructive');
    } finally { setLoading(false); }
  };

  const resetAndClose = () => {
    setName(''); setPrice(''); setStock(''); setCat(''); setDescription('');
    setImagePreview(null); setImageFile(null); setExtraPreviews([]); setExtraFiles([]);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9998] flex items-start sm:items-center justify-center p-0 sm:p-6" dir={dir}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={resetAndClose} />
      <div className="relative bg-white w-full sm:max-w-2xl rounded-none sm:rounded-[3rem] p-6 sm:p-8 md:p-12 text-right shadow-2xl overflow-y-auto max-h-[100dvh] sm:max-h-[90vh] no-scrollbar">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl sm:text-3xl font-black">{t('business.products.addProduct', 'إضافة منتج')}</h2>
          <button onClick={resetAndClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{t('business.products.productImage', 'صورة المنتج')}</label>
            <div onClick={() => fileInputRef.current?.click()}
              className={`relative aspect-video rounded-[2rem] border-4 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden group ${imagePreview ? 'border-transparent' : 'border-slate-100 hover:border-[#00E5FF] hover:bg-cyan-50'}`}>
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="preview" className="w-full h-full object-contain sm:object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="bg-white/90 px-6 py-3 rounded-2xl font-black text-xs flex items-center gap-2"><Upload size={16} /> {t('business.products.changeImage', 'تغيير الصورة')}</div>
                  </div>
                </>
              ) : (
                <div className="text-center p-8">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300 group-hover:text-[#00E5FF] transition-colors"><Upload size={32} /></div>
                  <p className="font-black text-slate-900 mb-1">{t('business.products.clickToUpload', 'اضغط لرفع صورة')}</p>
                  <p className="text-xs text-slate-400 font-bold">JPG, PNG, WebP</p>
                </div>
              )}
              <input type="file" hidden accept="image/jpeg,image/png,image/webp" ref={fileInputRef} onChange={handleImageChange} />
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{t('business.products.itemName', 'اسم المنتج')}</label>
            <input required value={name} onChange={(e) => setName(e.target.value)} placeholder={isRestaurant ? t('business.products.placeholders.restaurant.name', 'اسم الطبق') : t('business.products.placeholders.default.name', 'اسم المنتج')} className="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] py-4 px-6 font-black text-lg text-right outline-none focus:bg-white focus:border-[#00E5FF]/20 transition-all" />
          </div>

          {/* Price & Stock */}
          <div className={`grid grid-cols-1 ${isRestaurant ? '' : 'md:grid-cols-2'} gap-6`}>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{t('business.products.priceEgp', 'السعر (ج.م)')}</label>
              <input required type="number" min={0} step={0.01} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" className="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] py-4 px-6 font-black text-lg text-right outline-none focus:bg-white focus:border-[#00E5FF]/20 transition-all" />
            </div>
            {!isRestaurant && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{t('business.products.availableQuantity', 'الكمية المتاحة')}</label>
                <input required type="number" min={0} step={1} value={stock} onChange={(e) => setStock(e.target.value)} placeholder="1" className="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] py-4 px-6 font-black text-lg text-right outline-none focus:bg-white focus:border-[#00E5FF]/20 transition-all" />
              </div>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{t('business.products.section', 'القسم')}</label>
            <input value={cat} onChange={(e) => setCat(e.target.value)} placeholder={isRestaurant ? t('business.products.placeholders.restaurant.cat', 'مشويات') : t('business.products.placeholders.default.cat', 'إلكترونيات')} className="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] py-4 px-6 font-black text-lg text-right outline-none focus:bg-white focus:border-[#00E5FF]/20 transition-all" />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{t('business.products.description', 'الوصف')}</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder={isRestaurant ? t('business.products.placeholders.restaurant.desc', 'وصف الطبق') : t('business.products.placeholders.default.desc', 'وصف المنتج')} className="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] py-4 px-6 font-bold text-right outline-none focus:bg-white focus:border-[#00E5FF]/20 transition-all min-h-[100px]" />
          </div>

          {/* Extra Images */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{t('business.products.additionalImagesOptional', 'صور إضافية (اختياري)')}</label>
            <button type="button" onClick={() => extraFilesRef.current?.click()} className="w-full py-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[1.5rem] font-black text-slate-500 hover:border-[#00E5FF]/40 hover:bg-white transition-all">{t('business.products.addImagesMax5', 'إضافة صور (أقصى 5)')}</button>
            <input type="file" hidden multiple accept="image/jpeg,image/png,image/webp" ref={extraFilesRef} onChange={handleExtraImages} />
            {extraPreviews.length > 0 && (
              <div className="grid grid-cols-5 gap-2">
                {extraPreviews.map((p, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-100">
                    <img src={p} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => { setExtraPreviews((prev) => prev.filter((_, i) => i !== idx)); setExtraFiles((prev) => prev.filter((_, i) => i !== idx)); }} className="absolute top-1 left-1 w-5 h-5 bg-white/90 rounded-full flex items-center justify-center shadow"><X size={10} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-100">
            <button type="submit" disabled={loading} className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-lg hover:bg-black transition-all flex items-center justify-center gap-3 disabled:bg-slate-300">
              {loading ? <Loader2 className="animate-spin" size={22} /> : <CheckCircle2 size={22} className="text-[#00E5FF]" />}
              {loading ? t('business.products.addingItem', 'جاري الإضافة...') : t('business.products.confirmAddItem', 'تأكيد إضافة المنتج')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
