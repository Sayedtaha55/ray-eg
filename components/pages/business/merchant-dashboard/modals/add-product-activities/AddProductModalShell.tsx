import React from 'react';
import { motion } from 'framer-motion';
import { Box, RotateCw, X } from 'lucide-react';
import { ApiService } from '@/services/api.service';
import { useToast } from '@/components/common/feedback/Toaster';
import { Category } from '@/types';
import { useTranslation } from 'react-i18next';

import ImageUploadSection from '../AddProduct/ImageUploadSection';
import BasicInfoSection from '../AddProduct/BasicInfoSection';
import AdditionalImagesSection from '../AddProduct/AdditionalImagesSection';
import FormFooter from '../AddProduct/FormFooter';

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
  shopCategory?: Category | string;
  restaurantBaseSizesEnabled?: boolean;
  setRestaurantBaseSizesEnabled?: (v: boolean) => void;
  restaurantPriceSmall?: string;
  setRestaurantPriceSmall?: (v: string) => void;
  restaurantPriceMedium?: string;
  setRestaurantPriceMedium?: (v: string) => void;
  restaurantPriceLarge?: string;
  setRestaurantPriceLarge?: (v: string) => void;
};

const MotionDiv = motion.div as any;

const AddProductModalShell: React.FC<Props> = ({
  isOpen,
  onClose,
  shopId,
  isRestaurant,
  isFashion,
  fashionSizeItems,
  allowExtraImages,
  title,
  renderExtras,
  buildExtrasPayload,
  shopCategory,
  restaurantBaseSizesEnabled: externalRestaurantBaseSizesEnabled,
  setRestaurantBaseSizesEnabled: externalSetRestaurantBaseSizesEnabled,
  restaurantPriceSmall: externalRestaurantPriceSmall,
  setRestaurantPriceSmall: externalSetRestaurantPriceSmall,
  restaurantPriceMedium: externalRestaurantPriceMedium,
  setRestaurantPriceMedium: externalSetRestaurantPriceMedium,
  restaurantPriceLarge: externalRestaurantPriceLarge,
  setRestaurantPriceLarge: externalSetRestaurantPriceLarge,
}) => {
  const { t } = useTranslation();
  const RESTAURANT_SIZE_NONE = '__NONE__';
  const enable3dMedia = (() => {
    const raw = (import.meta as any)?.env?.VITE_ENABLE_3D_MEDIA;
    const s = String(raw ?? '').trim().toLowerCase();
    if (!s) return true;
    return s === 'true';
  })();
  const [name, setName] = React.useState('');
  const [price, setPrice] = React.useState('');
  const [groceryPackEnabled, setGroceryPackEnabled] = React.useState(false);
  const [restaurantBaseSizesEnabled, setRestaurantBaseSizesEnabled] = React.useState(externalRestaurantBaseSizesEnabled || false);
  const [restaurantPriceSmall, setRestaurantPriceSmall] = React.useState(externalRestaurantPriceSmall || '');
  const [restaurantPriceMedium, setRestaurantPriceMedium] = React.useState(externalRestaurantPriceMedium || '');
  const [restaurantPriceLarge, setRestaurantPriceLarge] = React.useState(externalRestaurantPriceLarge || '');
  const [stock, setStock] = React.useState('');
  const [cat, setCat] = React.useState(''); // default category label, overridden by t() in UI
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

  const canUse3dMedia = enable3dMedia;

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const extraFilesInputRef = React.useRef<HTMLInputElement>(null);
  const model3dInputRef = React.useRef<HTMLInputElement>(null);
  const spinImagesInputRef = React.useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  React.useEffect(() => {
    if (typeof externalSetRestaurantBaseSizesEnabled === 'function') {
      externalSetRestaurantBaseSizesEnabled(restaurantBaseSizesEnabled);
    }
  }, [restaurantBaseSizesEnabled, externalSetRestaurantBaseSizesEnabled]);

  React.useEffect(() => {
    if (typeof externalSetRestaurantPriceSmall === 'function') {
      externalSetRestaurantPriceSmall(restaurantPriceSmall);
    }
  }, [restaurantPriceSmall, externalSetRestaurantPriceSmall]);

  React.useEffect(() => {
    if (typeof externalSetRestaurantPriceMedium === 'function') {
      externalSetRestaurantPriceMedium(restaurantPriceMedium);
    }
  }, [restaurantPriceMedium, externalSetRestaurantPriceMedium]);

  React.useEffect(() => {
    if (typeof externalSetRestaurantPriceLarge === 'function') {
      externalSetRestaurantPriceLarge(restaurantPriceLarge);
    }
  }, [restaurantPriceLarge, externalSetRestaurantPriceLarge]);

  const shopCategoryUpper = (() => {
    const raw: any = shopCategory;
    if (typeof raw === 'string') return raw.trim().toUpperCase();
    if (raw && typeof raw === 'object') {
      const v = raw.name ?? raw.slug ?? raw.id ?? raw.value;
      return String(v || '').trim().toUpperCase();
    }
    return String(raw || '').trim().toUpperCase();
  })();

  const allowGroceryPackToggle = !isRestaurant && shopCategoryUpper === 'FOOD';
  const devActivityId = (() => {
    try {
      return String(localStorage.getItem('ray_dev_activity_id') || '').trim();
    } catch {
      return '';
    }
  })();

  const basicPlaceholders = (() => {
    if (shopCategoryUpper === 'RESTAURANT') {
      return {
        name: t('business.products.placeholders.restaurant.name'),
        cat: t('business.products.placeholders.restaurant.cat'),
        desc: t('business.products.placeholders.restaurant.desc'),
      };
    }

    if (shopCategoryUpper === 'FASHION') {
      return {
        name: t('business.products.placeholders.fashion.name'),
        cat: t('business.products.placeholders.fashion.cat'),
        desc: t('business.products.placeholders.fashion.desc'),
      };
    }

    if (shopCategoryUpper === 'HEALTH') {
      return {
        name: t('business.products.placeholders.health.name'),
        cat: t('business.products.placeholders.health.cat'),
        desc: t('business.products.placeholders.health.desc'),
      };
    }

    if (shopCategoryUpper === 'ELECTRONICS') {
      return {
        name: t('business.products.placeholders.electronics.name'),
        cat: t('business.products.placeholders.electronics.cat'),
        desc: t('business.products.placeholders.electronics.desc'),
      };
    }

    if (shopCategoryUpper === 'FOOD') {
      return {
        name: t('business.products.placeholders.food.name'),
        cat: t('business.products.placeholders.food.cat'),
        desc: t('business.products.placeholders.food.desc'),
      };
    }

    if (shopCategoryUpper === 'RETAIL') {
      if (devActivityId === 'homeGoods') {
        return {
          name: t('business.products.placeholders.homeGoods.name'),
          cat: t('business.products.placeholders.homeGoods.cat'),
          desc: t('business.products.placeholders.homeGoods.desc'),
        };
      }

      return {
        name: t('business.products.placeholders.retail.name'),
        cat: t('business.products.placeholders.retail.cat'),
        desc: t('business.products.placeholders.retail.desc'),
      };
    }

    return {
      name: t('business.products.placeholders.default.name'),
      cat: t('business.products.placeholders.default.cat'),
      desc: t('business.products.placeholders.default.desc'),
    };
  })();

  function toLatinDigits(input: string) {
    const map: Record<string, string> = {
      '٠': '0',
      '١': '1',
      '٢': '2',
      '٣': '3',
      '٤': '4',
      '٥': '5',
      '٦': '6',
      '٧': '7',
      '٨': '8',
      '٩': '9',
      '۰': '0',
      '۱': '1',
      '۲': '2',
      '۳': '3',
      '۴': '4',
      '۵': '5',
      '۶': '6',
      '۷': '7',
      '۸': '8',
      '۹': '9',
    };
    return String(input || '').replace(/[٠-٩۰-۹]/g, (d) => map[d] || d);
  }

  function parseNumberInput(value: any) {
    if (typeof value === 'number') return value;
    const raw = String(value ?? '').trim();
    if (!raw) return NaN;
    const cleaned = toLatinDigits(raw).replace(/[٬،]/g, '').replace(/[٫]/g, '.').replace(/\s+/g, '');
    const n = Number(cleaned);
    return n;
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const mime = String(file.type || '').toLowerCase().trim();
      const allowed = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
      if (!mime || !allowed.has(mime)) {
        addToast(t('business.dashboard.products.unsupportedImageType'), 'error');
        return;
      }
      try {
        if (imagePreview && imagePreview.startsWith('blob:')) {
          URL.revokeObjectURL(imagePreview);
        }
      } catch {
      }
      setImageUploadFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleExtraImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const allowed = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
    const nextFiles: File[] = [];
    const nextPreviews: string[] = [];

    for (const file of files) {
      const mime = String(file.type || '').toLowerCase().trim();
      if (!mime || !allowed.has(mime)) {
        addToast(t('business.dashboard.products.unsupportedImageType'), 'error');
        continue;
      }
      nextFiles.push(file);
      nextPreviews.push(URL.createObjectURL(file));
    }

    setExtraImageUploadFiles([...extraImageUploadFiles, ...nextFiles].slice(0, 5));
    setExtraImagePreviews([...extraImagePreviews, ...nextPreviews].slice(0, 5));

    try {
      if (extraFilesInputRef.current) extraFilesInputRef.current.value = '';
    } catch {
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!imageUploadFile) {
      addToast(t('business.products.selectImageFirst'), 'info');
      return;
    }

    const parsedPrice = parseNumberInput(price);
    const baseSizes = (() => {
      if (!isRestaurant) return null;
      if (!restaurantBaseSizesEnabled) return null;
      const sizes: Array<{ id: string; label: string; price: number }> = [];

      const smallEnabled = String(restaurantPriceSmall ?? '') !== RESTAURANT_SIZE_NONE;
      const mediumEnabled = String(restaurantPriceMedium ?? '') !== RESTAURANT_SIZE_NONE;
      const largeEnabled = String(restaurantPriceLarge ?? '') !== RESTAURANT_SIZE_NONE;

      if (smallEnabled) {
        const ps = parseNumberInput(restaurantPriceSmall);
        if (!Number.isFinite(ps) || ps <= 0) return '__INVALID__' as const;
        sizes.push({ id: 'small', label: t('business.dashboard.products.sizeSmall'), price: ps });
      }

      if (mediumEnabled) {
        const pm = parseNumberInput(restaurantPriceMedium);
        if (!Number.isFinite(pm) || pm <= 0) return '__INVALID__' as const;
        sizes.push({ id: 'medium', label: t('business.dashboard.products.sizeMedium'), price: pm });
      }

      if (largeEnabled) {
        const pl = parseNumberInput(restaurantPriceLarge);
        if (!Number.isFinite(pl) || pl <= 0) return '__INVALID__' as const;
        sizes.push({ id: 'large', label: t('business.dashboard.products.sizeLarge'), price: pl });
      }

      if (sizes.length === 0) return '__INVALID__' as const;
      return sizes;
    })();

    if (baseSizes === '__INVALID__') {
      addToast(t('business.products.enterValidSizePrice'), 'error');
      return;
    }

    const basePrice = (() => {
      if (Array.isArray(baseSizes) && baseSizes.length > 0) {
        const min = Math.min(...baseSizes.map((s: any) => Number(s?.price || 0)).filter((n: any) => Number.isFinite(n) && n > 0));
        return Number.isFinite(min) ? min : parsedPrice;
      }
      return parsedPrice;
    })();

    const parsedStock = isRestaurant ? 0 : parseNumberInput(stock);
    if (!isRestaurant && (!Number.isFinite(parsedStock) || parsedStock < 0)) {
      addToast(t('business.products.invalidQuantity'), 'error');
      return;
    }

    const extras = (() => {
      if (!buildExtrasPayload) return { payload: undefined as any, resolvedBasePrice: undefined as any };
      try {
        const res = buildExtrasPayload({ parseNumberInput, basePrice });
        const payload = (res && typeof res === 'object') ? (res as any).payload : undefined;
        const merged = {
          ...(payload && typeof payload === 'object' ? payload : {}),
        } as any;

        if (Array.isArray(baseSizes) && baseSizes.length > 0) {
          const existing = merged?.menuVariants;
          const list = Array.isArray(existing) ? existing : [];
          merged.menuVariants = [
            { id: 'base', name: String(name || '').trim() || t('business.products.product'), sizes: baseSizes },
            ...list,
          ];
        }

        return { ...res, payload: merged };
      } catch (e: any) {
        const msg = e?.message ? String(e.message) : t('business.products.invalidActivityData');
        addToast(msg, 'error');
        return '__INVALID__' as const;
      }
    })();

    if (extras === '__INVALID__') {
      return;
    }

    const isPackEnabledByExtras = (() => {
      const packOptions = (extras as any)?.payload?.packOptions;
      return Array.isArray(packOptions) && packOptions.length > 0;
    })();

    const resolvedBasePrice = (() => {
      if (typeof (extras as any)?.resolvedBasePrice === 'number') return (extras as any).resolvedBasePrice;
      if (isPackEnabledByExtras) {
        const packOptions = (extras as any)?.payload?.packOptions;
        const first = Array.isArray(packOptions) ? packOptions[0] : null;
        const p = first ? parseNumberInput((first as any)?.price) : NaN;
        return Number.isFinite(p) ? p : basePrice;
      }
      return basePrice;
    })();

    if (!isPackEnabledByExtras) {
      if (!Number.isFinite(resolvedBasePrice) || resolvedBasePrice < 0) {
        addToast(t('business.products.invalidPrice'), 'error');
        return;
      }
    }

    if (isPackEnabledByExtras) {
      if (!Number.isFinite(resolvedBasePrice) || resolvedBasePrice <= 0) {
        addToast(t('business.products.enterValidPackPrice'), 'error');
        return;
      }
    }

    setLoading(true);
    setIsCompressing(true);
    setCompressionProgress(10);
    try {
      const mime = String((imageUploadFile as any)?.type || '').toLowerCase();
      let finalImageUrl = '';

      if (mime.startsWith('image/')) {
        setCompressionProgress(40);
        const upload = await ApiService.uploadMediaRobust({ file: imageUploadFile, purpose: 'product_image', shopId });
        finalImageUrl = upload.url;
      }

      setCompressionProgress(70);
      let extraUrls: string[] = [];
      if (allowExtraImages && extraImageUploadFiles.length > 0) {
        const uploads = await Promise.all(
          extraImageUploadFiles.map((f) => ApiService.uploadMediaRobust({ file: f, purpose: 'product_image', shopId })),
        );
        extraUrls = uploads.map((u) => String(u?.url || '')).filter(Boolean);
      }

      setCompressionProgress(90);

      // Upload 3D model if provided
      let model3dUrl = '';
      if (canUse3dMedia && model3dFile) {
        const modelMime = String(model3dFile.type || '').toLowerCase();
        const purpose = modelMime.includes('gltf') ? '3d_models' : '3d_models';
        const modelUpload = await ApiService.uploadMediaRobust({ file: model3dFile, purpose, shopId });
        model3dUrl = modelUpload.url;
      }

      // Upload spin images if provided
      let spinUrls: string[] = [];
      if (canUse3dMedia && spinImageFiles.length >= 2) {
        const spinUploads = await Promise.all(
          spinImageFiles.map((f) => ApiService.uploadMediaRobust({ file: f, purpose: 'spin_images', shopId })),
        );
        spinUrls = spinUploads.map((u) => String(u?.url || '')).filter(Boolean);
      }

      const corePayload: any = {
        shopId,
        name,
        price: resolvedBasePrice,
        stock: isRestaurant ? 0 : parsedStock,
        category: String(cat || '').trim() || t('business.dashboard.products.generalCategory'),
        description: description ? description : null,
        trackStock: !isRestaurant,
        ...(allowExtraImages ? { images: [finalImageUrl, ...extraUrls].filter(Boolean) } : {}),
        ...(canUse3dMedia ? { ...(model3dUrl ? { model3dUrl } : {}), ...(spinUrls.length >= 2 ? { spinImages: spinUrls } : {}) } : {}),
      };

      await ApiService.addProduct({
        ...corePayload,
        ...(extras?.payload && typeof extras.payload === 'object' ? extras.payload : {}),
      });

      addToast(t('business.products.productAdded'), 'success');
      try {
        window.dispatchEvent(new CustomEvent('ray-products-updated', { detail: { shopId } }));
      } catch {
      }
      onClose();
    } catch (err: any) {
      const msg = err?.message ? String(err.message) : t('business.products.addProductFailed');
      addToast(msg, 'error');
    } finally {
      setLoading(false);
      setIsCompressing(false);
      setCompressionProgress(0);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[400] flex items-start sm:items-center justify-center p-0 sm:p-6">
      <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
      <MotionDiv
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative bg-white w-full sm:max-w-2xl rounded-none sm:rounded-[3rem] p-4 sm:p-8 md:p-12 text-right shadow-2xl overflow-hidden h-[100dvh] sm:h-auto sm:max-h-[90vh] overflow-y-auto no-scrollbar"
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-black">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 pb-24 sm:pb-0">
          <ImageUploadSection imagePreview={imagePreview} fileInputRef={fileInputRef} handleImageChange={handleImageChange} />

          <BasicInfoSection
            name={name}
            setName={setName}
            price={price}
            setPrice={setPrice}
            groceryPackEnabled={groceryPackEnabled}
            setGroceryPackEnabled={allowGroceryPackToggle ? setGroceryPackEnabled : undefined}
            restaurantBaseSizesEnabled={restaurantBaseSizesEnabled}
            setRestaurantBaseSizesEnabled={setRestaurantBaseSizesEnabled}
            restaurantPriceSmall={restaurantPriceSmall}
            setRestaurantPriceSmall={setRestaurantPriceSmall}
            restaurantPriceMedium={restaurantPriceMedium}
            setRestaurantPriceMedium={setRestaurantPriceMedium}
            restaurantPriceLarge={restaurantPriceLarge}
            setRestaurantPriceLarge={setRestaurantPriceLarge}
            stock={stock}
            setStock={setStock}
            cat={cat}
            setCat={setCat}
            description={description}
            setDescription={setDescription}
            isRestaurant={isRestaurant}
            isFashion={isFashion}
            fashionSizeItems={Array.isArray(fashionSizeItems) ? fashionSizeItems : []}
            namePlaceholder={basicPlaceholders.name}
            categoryPlaceholder={basicPlaceholders.cat}
            descriptionPlaceholder={basicPlaceholders.desc}
          />

          {typeof renderExtras === 'function' ? renderExtras({ parseNumberInput, groceryPackEnabled }) : null}

          {allowExtraImages && (
            <>
              <AdditionalImagesSection
                extraImagePreviews={extraImagePreviews}
                extraFilesInputRef={extraFilesInputRef}
                handleExtraImagesChange={handleExtraImagesChange}
                setExtraImagePreviews={setExtraImagePreviews}
                setExtraImageUploadFiles={setExtraImageUploadFiles}
              />
            </>
          )}

          <>
            <div className="space-y-3">
              <h3 className="text-sm font-black text-slate-700 flex items-center gap-2">
                <Box size={16} />
                موديل 3D (اختياري)
              </h3>
              <input
                ref={model3dInputRef}
                type="file"
                accept=".glb,.gltf"
                className="hidden"
                disabled={!canUse3dMedia}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    setModel3dFile(f);
                    setModel3dPreview(f.name);
                  }
                }}
              />
              <button
                type="button"
                onClick={() => {
                  if (!canUse3dMedia) {
                    addToast('ميزة 3D متاحة لوكل فقط حالياً', 'info');
                    return;
                  }
                  model3dInputRef.current?.click();
                }}
                className={`w-full border-2 border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center gap-2 transition-colors ${
                  canUse3dMedia ? 'hover:border-slate-400' : 'opacity-60 cursor-not-allowed'
                }`}
              >
                {model3dPreview ? (
                  <div className="flex items-center gap-2 text-slate-700">
                    <Box size={20} className="text-emerald-500" />
                    <span className="text-sm font-bold">{model3dPreview}</span>
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        setModel3dFile(null);
                        setModel3dPreview(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          e.stopPropagation();
                          setModel3dFile(null);
                          setModel3dPreview(null);
                        }
                      }}
                      className="text-red-400 hover:text-red-600 cursor-pointer"
                      aria-label="Remove 3D model"
                    >
                      <X size={14} />
                    </span>
                  </div>
                ) : (
                  <>
                    <Box size={24} className="text-slate-300" />
                    <span className="text-xs text-slate-400 font-bold">ارفع موديل 3D (GLB / GLTF)</span>
                  </>
                )}
              </button>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-black text-slate-700 flex items-center gap-2">
                <RotateCw size={16} />
                صور 360° (اختياري — 8 صورة على الأقل)
              </h3>
              <input
                ref={spinImagesInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                disabled={!canUse3dMedia}
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  if (files.length > 0) {
                    setSpinImageFiles((prev) => [...prev, ...files]);
                    const previews = files.map((f) => URL.createObjectURL(f));
                    setSpinImagePreviews((prev) => [...prev, ...previews]);
                  }
                }}
              />
              <button
                type="button"
                onClick={() => {
                  if (!canUse3dMedia) {
                    addToast('ميزة 3D متاحة لوكل فقط حالياً', 'info');
                    return;
                  }
                  spinImagesInputRef.current?.click();
                }}
                className={`w-full border-2 border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center gap-2 transition-colors ${
                  canUse3dMedia ? 'hover:border-slate-400' : 'opacity-60 cursor-not-allowed'
                }`}
              >
                <RotateCw size={24} className="text-slate-300" />
                <span className="text-xs text-slate-400 font-bold">ارفع صور من زوايا مختلفة</span>
              </button>
              {spinImagePreviews.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {spinImagePreviews.map((src, idx) => (
                    <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200">
                      <img src={src} className="w-full h-full object-cover" alt={`spin ${idx + 1}`} />
                      <button
                        type="button"
                        onClick={() => {
                          setSpinImagePreviews((prev) => prev.filter((_, i) => i !== idx));
                          setSpinImageFiles((prev) => prev.filter((_, i) => i !== idx));
                        }}
                        className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center"
                      >
                        <X size={8} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>

          <FormFooter
            loading={loading}
            isCompressing={isCompressing}
            compressionProgress={compressionProgress}
            submitLabel={t('business.products.confirmAddItem')}
            processingLabel={t('business.products.addingItem')}
          />
        </form>
      </MotionDiv>
    </div>
  );
};

export default AddProductModalShell;
