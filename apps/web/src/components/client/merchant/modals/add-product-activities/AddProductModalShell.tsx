'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Box, RotateCw, X } from 'lucide-react';
import { clientFetch } from '@/lib/api/client';
import { useT } from '@/i18n/useT';

import ImageUploadSection from '../AddProduct/ImageUploadSection';
import BasicInfoSection from '../AddProduct/BasicInfoSection';
import AdditionalImagesSection from '../AddProduct/AdditionalImagesSection';
import FormFooter from '../AddProduct/FormFooter';

const MotionDiv = motion.div as any;

type Props = {
  isOpen: boolean;
  onClose: () => void;
  shopId: string;
  isRestaurant: boolean;
  isFashion: boolean;
  fashionSizeItems?: any[];
  allowExtraImages: boolean;
  title: string;
  renderExtras?: (ctx: { parseNumberInput: (v: any) => number; groceryPackEnabled: boolean }) => React.ReactNode;
  buildExtrasPayload?: (ctx: { parseNumberInput: (v: any) => number; basePrice: number }) => { payload?: any; resolvedBasePrice?: number };
  shopCategory?: any;
  restaurantBaseSizesEnabled?: boolean;
  setRestaurantBaseSizesEnabled?: (v: boolean) => void;
  restaurantPriceSmall?: string;
  setRestaurantPriceSmall?: (v: string) => void;
  restaurantPriceMedium?: string;
  setRestaurantPriceMedium?: (v: string) => void;
  restaurantPriceLarge?: string;
  setRestaurantPriceLarge?: (v: string) => void;
};

const RESTAURANT_SIZE_NONE = '__NONE__';

function toLatinDigits(input: string) {
  const map: Record<string, string> = { '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4', '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9', '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4', '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9' };
  return String(input || '').replace(/[٠-٩۰-۹]/g, d => map[d] || d);
}

function parseNumberInput(value: any) {
  if (typeof value === 'number') return value;
  const raw = String(value ?? '').trim();
  if (!raw) return NaN;
  const cleaned = toLatinDigits(raw).replace(/[٬،]/g, '').replace(/[٫]/g, '.').replace(/\s+/g, '');
  return Number(cleaned);
}

const AddProductModalShell: React.FC<Props> = ({
  isOpen, onClose, shopId, isRestaurant, isFashion, fashionSizeItems, allowExtraImages, title, renderExtras, buildExtrasPayload, shopCategory,
  restaurantBaseSizesEnabled: externalRestaurantBaseSizesEnabled, setRestaurantBaseSizesEnabled: externalSetRestaurantBaseSizesEnabled,
  restaurantPriceSmall: externalRestaurantPriceSmall, setRestaurantPriceSmall: externalSetRestaurantPriceSmall,
  restaurantPriceMedium: externalRestaurantPriceMedium, setRestaurantPriceMedium: externalSetRestaurantPriceMedium,
  restaurantPriceLarge: externalRestaurantPriceLarge, setRestaurantPriceLarge: externalSetRestaurantPriceLarge,
}) => {
  const t = useT();
  const [name, setName] = React.useState('');
  const [price, setPrice] = React.useState('');
  const [groceryPackEnabled, setGroceryPackEnabled] = React.useState(false);
  const [restaurantBaseSizesEnabled, setRestaurantBaseSizesEnabled] = React.useState(externalRestaurantBaseSizesEnabled || false);
  const [restaurantPriceSmall, setRestaurantPriceSmall] = React.useState(externalRestaurantPriceSmall || '');
  const [restaurantPriceMedium, setRestaurantPriceMedium] = React.useState(externalRestaurantPriceMedium || '');
  const [restaurantPriceLarge, setRestaurantPriceLarge] = React.useState(externalRestaurantPriceLarge || '');
  const [stock, setStock] = React.useState('');
  const [cat, setCat] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [imageUploadFile, setImageUploadFile] = React.useState<File | null>(null);
  const [extraImagePreviews, setExtraImagePreviews] = React.useState<string[]>([]);
  const [extraImageUploadFiles, setExtraImageUploadFiles] = React.useState<File[]>([]);
  const [isCompressing, setIsCompressing] = React.useState(false);
  const [compressionProgress, setCompressionProgress] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [model3dFile, setModel3dFile] = React.useState<File | null>(null);
  const [model3dPreview, setModel3dPreview] = React.useState<string | null>(null);
  const [spinImageFiles, setSpinImageFiles] = React.useState<File[]>([]);
  const [spinImagePreviews, setSpinImagePreviews] = React.useState<string[]>([]);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const extraFilesInputRef = React.useRef<HTMLInputElement>(null);
  const model3dInputRef = React.useRef<HTMLInputElement>(null);
  const spinImagesInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => { if (typeof externalSetRestaurantBaseSizesEnabled === 'function') externalSetRestaurantBaseSizesEnabled(restaurantBaseSizesEnabled); }, [restaurantBaseSizesEnabled, externalSetRestaurantBaseSizesEnabled]);
  React.useEffect(() => { if (typeof externalSetRestaurantPriceSmall === 'function') externalSetRestaurantPriceSmall(restaurantPriceSmall); }, [restaurantPriceSmall, externalSetRestaurantPriceSmall]);
  React.useEffect(() => { if (typeof externalSetRestaurantPriceMedium === 'function') externalSetRestaurantPriceMedium(restaurantPriceMedium); }, [restaurantPriceMedium, externalSetRestaurantPriceMedium]);
  React.useEffect(() => { if (typeof externalSetRestaurantPriceLarge === 'function') externalSetRestaurantPriceLarge(restaurantPriceLarge); }, [restaurantPriceLarge, externalSetRestaurantPriceLarge]);

  const shopCategoryUpper = (() => { const raw: any = shopCategory; if (typeof raw === 'string') return raw.trim().toUpperCase(); if (raw && typeof raw === 'object') { const v = raw.name ?? raw.slug ?? raw.id ?? raw.value; return String(v || '').trim().toUpperCase(); } return String(raw || '').trim().toUpperCase(); })();
  const allowGroceryPackToggle = !isRestaurant && shopCategoryUpper === 'FOOD';

  const basicPlaceholders = (() => {
    if (shopCategoryUpper === 'RESTAURANT') return { name: t('business.products.placeholders.restaurant.name', 'اسم الطبق'), cat: t('business.products.placeholders.restaurant.cat', 'أطباق رئيسية'), desc: t('business.products.placeholders.restaurant.desc', 'وصف الطبق') };
    if (shopCategoryUpper === 'FASHION') return { name: t('business.products.placeholders.fashion.name', 'اسم القطعة'), cat: t('business.products.placeholders.fashion.cat', 'ملابس'), desc: t('business.products.placeholders.fashion.desc', 'وصف القطعة') };
    if (shopCategoryUpper === 'HEALTH') return { name: t('business.products.placeholders.health.name', 'اسم المنتج'), cat: t('business.products.placeholders.health.cat', 'صحة'), desc: t('business.products.placeholders.health.desc', 'وصف المنتج') };
    if (shopCategoryUpper === 'ELECTRONICS') return { name: t('business.products.placeholders.electronics.name', 'اسم المنتج'), cat: t('business.products.placeholders.electronics.cat', 'إلكترونيات'), desc: t('business.products.placeholders.electronics.desc', 'وصف المنتج') };
    if (shopCategoryUpper === 'FOOD') return { name: t('business.products.placeholders.food.name', 'اسم المنتج'), cat: t('business.products.placeholders.food.cat', 'بقالة'), desc: t('business.products.placeholders.food.desc', 'وصف المنتج') };
    if (shopCategoryUpper === 'RETAIL') return { name: t('business.products.placeholders.retail.name', 'اسم المنتج'), cat: t('business.products.placeholders.retail.cat', 'تجزئة'), desc: t('business.products.placeholders.retail.desc', 'وصف المنتج') };
    return { name: t('business.products.placeholders.default.name', 'اسم المنتج'), cat: t('business.products.placeholders.default.cat', 'عام'), desc: t('business.products.placeholders.default.desc', 'وصف المنتج') };
  })();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const mime = String(file.type || '').toLowerCase().trim();
      const allowed = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
      if (!mime || !allowed.has(mime)) return;
      try { if (imagePreview && imagePreview.startsWith('blob:')) URL.revokeObjectURL(imagePreview); } catch {}
      setImageUploadFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleExtraImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const allowed = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
    const nextFiles: File[] = []; const nextPreviews: string[] = [];
    for (const file of files) { const mime = String(file.type || '').toLowerCase().trim(); if (!mime || !allowed.has(mime)) continue; nextFiles.push(file); nextPreviews.push(URL.createObjectURL(file)); }
    setExtraImageUploadFiles([...extraImageUploadFiles, ...nextFiles].slice(0, 5));
    setExtraImagePreviews([...extraImagePreviews, ...nextPreviews].slice(0, 5));
    try { if (extraFilesInputRef.current) extraFilesInputRef.current.value = ''; } catch {}
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!imageUploadFile) return;

    const parsedPrice = parseNumberInput(price);
    const baseSizes = (() => {
      if (!isRestaurant || !restaurantBaseSizesEnabled) return null;
      const sizes: Array<{ id: string; label: string; price: number }> = [];
      if (String(restaurantPriceSmall ?? '') !== RESTAURANT_SIZE_NONE) { const ps = parseNumberInput(restaurantPriceSmall); if (!Number.isFinite(ps) || ps <= 0) return '__INVALID__' as const; sizes.push({ id: 'small', label: t('business.dashboard.products.sizeSmall', 'صغير'), price: ps }); }
      if (String(restaurantPriceMedium ?? '') !== RESTAURANT_SIZE_NONE) { const pm = parseNumberInput(restaurantPriceMedium); if (!Number.isFinite(pm) || pm <= 0) return '__INVALID__' as const; sizes.push({ id: 'medium', label: t('business.dashboard.products.sizeMedium', 'وسط'), price: pm }); }
      if (String(restaurantPriceLarge ?? '') !== RESTAURANT_SIZE_NONE) { const pl = parseNumberInput(restaurantPriceLarge); if (!Number.isFinite(pl) || pl <= 0) return '__INVALID__' as const; sizes.push({ id: 'large', label: t('business.dashboard.products.sizeLarge', 'كبير'), price: pl }); }
      if (sizes.length === 0) return '__INVALID__' as const;
      return sizes;
    })();
    if (baseSizes === '__INVALID__') return;

    const basePrice = (() => { if (Array.isArray(baseSizes) && baseSizes.length > 0) { const min = Math.min(...baseSizes.map((s: any) => Number(s?.price || 0)).filter((n: any) => Number.isFinite(n) && n > 0)); return Number.isFinite(min) ? min : parsedPrice; } return parsedPrice; })();
    const parsedStock = isRestaurant ? 0 : parseNumberInput(stock);
    if (!isRestaurant && (!Number.isFinite(parsedStock) || parsedStock < 0)) return;

    const extras = (() => {
      if (!buildExtrasPayload) return { payload: undefined as any, resolvedBasePrice: undefined as any };
      try {
        const res = buildExtrasPayload({ parseNumberInput, basePrice });
        const payload = (res && typeof res === 'object') ? (res as any).payload : undefined;
        const merged = { ...(payload && typeof payload === 'object' ? payload : {}) } as any;
        if (Array.isArray(baseSizes) && baseSizes.length > 0) { const existing = merged?.menuVariants; const list = Array.isArray(existing) ? existing : []; merged.menuVariants = [{ id: 'base', name: String(name || '').trim() || t('business.products.product', 'منتج'), sizes: baseSizes }, ...list]; }
        return { ...res, payload: merged };
      } catch (e: any) { return '__INVALID__' as const; }
    })();
    if (extras === '__INVALID__') return;

    const isPackEnabledByExtras = (() => { const packOptions = (extras as any)?.payload?.packOptions; return Array.isArray(packOptions) && packOptions.length > 0; })();
    const resolvedBasePrice = (() => { if (typeof (extras as any)?.resolvedBasePrice === 'number') return (extras as any).resolvedBasePrice; if (isPackEnabledByExtras) { const packOptions = (extras as any)?.payload?.packOptions; const first = Array.isArray(packOptions) ? packOptions[0] : null; const p = first ? parseNumberInput((first as any)?.price) : NaN; return Number.isFinite(p) ? p : basePrice; } return basePrice; })();

    if (!isPackEnabledByExtras && (!Number.isFinite(resolvedBasePrice) || resolvedBasePrice < 0)) return;
    if (isPackEnabledByExtras && (!Number.isFinite(resolvedBasePrice) || resolvedBasePrice <= 0)) return;

    setLoading(true); setIsCompressing(true); setCompressionProgress(10);
    try {
      const mime = String((imageUploadFile as any)?.type || '').toLowerCase();
      let finalImageUrl = '';
      if (mime.startsWith('image/')) {
        setCompressionProgress(40);
        const formData = new FormData(); formData.append('file', imageUploadFile); formData.append('purpose', 'product_image'); formData.append('shopId', shopId);
        const upload = await clientFetch<any>('/v1/media/upload', { method: 'POST', body: formData as any, headers: {} as any });
        finalImageUrl = String(upload?.url || '').trim();
      }
      setCompressionProgress(70);
      let extraUrls: string[] = [];
      if (allowExtraImages && extraImageUploadFiles.length > 0) {
        const uploads = await Promise.all(extraImageUploadFiles.map(async f => { const fd = new FormData(); fd.append('file', f); fd.append('purpose', 'product_image'); fd.append('shopId', shopId); const u = await clientFetch<any>('/v1/media/upload', { method: 'POST', body: fd as any, headers: {} as any }); return String(u?.url || ''); }));
        extraUrls = uploads.filter(Boolean);
      }
      setCompressionProgress(90);

      const corePayload: any = {
        shopId, name, price: resolvedBasePrice, stock: isRestaurant ? 0 : parsedStock,
        category: String(cat || '').trim() || t('business.dashboard.products.generalCategory', 'عام'),
        description: description || null, trackStock: !isRestaurant,
        ...(allowExtraImages ? { images: [finalImageUrl, ...extraUrls].filter(Boolean) } : {}),
      };

      await clientFetch<any>('/v1/products', { method: 'POST', body: JSON.stringify({ ...corePayload, ...(extras?.payload && typeof extras.payload === 'object' ? extras.payload : {}) }) });
      try { window.dispatchEvent(new CustomEvent('ray-products-updated', { detail: { shopId } })); } catch {}
      onClose();
    } catch {} finally { setLoading(false); setIsCompressing(false); setCompressionProgress(0); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[400] flex items-start sm:items-center justify-center p-0 sm:p-6">
      <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
      <MotionDiv initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="relative bg-white w-full sm:max-w-2xl rounded-none sm:rounded-[3rem] p-4 sm:p-8 md:p-12 text-right shadow-2xl overflow-hidden h-[100dvh] sm:h-auto sm:max-h-[90vh] overflow-y-auto no-scrollbar">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-black">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors"><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-8 pb-24 sm:pb-0">
          <ImageUploadSection imagePreview={imagePreview} fileInputRef={fileInputRef} handleImageChange={handleImageChange} />
          <BasicInfoSection name={name} setName={setName} price={price} setPrice={setPrice} groceryPackEnabled={groceryPackEnabled} setGroceryPackEnabled={allowGroceryPackToggle ? setGroceryPackEnabled : undefined} restaurantBaseSizesEnabled={restaurantBaseSizesEnabled} setRestaurantBaseSizesEnabled={setRestaurantBaseSizesEnabled} restaurantPriceSmall={restaurantPriceSmall} setRestaurantPriceSmall={setRestaurantPriceSmall} restaurantPriceMedium={restaurantPriceMedium} setRestaurantPriceMedium={setRestaurantPriceMedium} restaurantPriceLarge={restaurantPriceLarge} setRestaurantPriceLarge={setRestaurantPriceLarge} stock={stock} setStock={setStock} cat={cat} setCat={setCat} description={description} setDescription={setDescription} isRestaurant={isRestaurant} isFashion={isFashion} fashionSizeItems={Array.isArray(fashionSizeItems) ? fashionSizeItems : []} namePlaceholder={basicPlaceholders.name} categoryPlaceholder={basicPlaceholders.cat} descriptionPlaceholder={basicPlaceholders.desc} />
          {typeof renderExtras === 'function' ? renderExtras({ parseNumberInput, groceryPackEnabled }) : null}
          {allowExtraImages && <AdditionalImagesSection extraImagePreviews={extraImagePreviews} extraFilesInputRef={extraFilesInputRef} handleExtraImagesChange={handleExtraImagesChange} setExtraImagePreviews={setExtraImagePreviews} setExtraImageUploadFiles={setExtraImageUploadFiles} />}
          <FormFooter loading={loading} isCompressing={isCompressing} compressionProgress={compressionProgress} submitLabel={t('business.products.confirmAddItem', 'تأكيد إضافة العنصر')} processingLabel={t('business.products.addingItem', 'جاري إضافة العنصر')} />
        </form>
      </MotionDiv>
    </div>
  );
};

export default AddProductModalShell;
