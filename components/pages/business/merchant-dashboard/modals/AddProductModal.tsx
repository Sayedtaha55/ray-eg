import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, Video } from 'lucide-react';
import { ApiService } from '@/services/api.service';
import { useToast } from '@/components/common/feedback/Toaster';
import { Category } from '@/types';
import { generateVideoThumbnail } from '@/lib/image-utils';

// Sub-components
import ImageUploadSection from './AddProduct/ImageUploadSection';
import BasicInfoSection from './AddProduct/BasicInfoSection';
import PackOptionsSection from './AddProduct/PackOptionsSection';
import RestaurantMenuSection from './AddProduct/RestaurantMenuSection';
import AdditionalImagesSection from './AddProduct/AdditionalImagesSection';
import FashionOptionsSection from './AddProduct/FashionOptionsSection';
import FurnitureOptionsSection from './AddProduct/FurnitureOptionsSection';
import FormFooter from './AddProduct/FormFooter';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  shopId: string;
  shopCategory?: Category | string;
};

const MotionDiv = motion.div as any;

const AddProductModal: React.FC<Props> = ({ isOpen, onClose, shopId, shopCategory }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [cat, setCat] = useState('عام');
  const [unit, setUnit] = useState('');
  const [furnitureUnit, setFurnitureUnit] = useState('');
  const [furnitureLengthCm, setFurnitureLengthCm] = useState('');
  const [furnitureWidthCm, setFurnitureWidthCm] = useState('');
  const [furnitureHeightCm, setFurnitureHeightCm] = useState('');
  const [packOptionItems, setPackOptionItems] = useState<Array<{ id: string; qty: string; price: string }>>([]);
  const [description, setDescription] = useState('');
  const [fashionSizeItems, setFashionSizeItems] = useState<Array<{ label: string; price: string }>>([]);
  const [menuVariantItems, setMenuVariantItems] = useState<
    Array<{
      id: string;
      name: string;
      hasSmall: boolean;
      hasMedium: boolean;
      hasLarge: boolean;
      priceSmall: string;
      priceMedium: string;
      priceLarge: string;
    }>
  >([]);
  const [addonItems, setAddonItems] = useState<
    Array<{
      id: string;
      name: string;
      imagePreview: string | null;
      imageUploadFile: File | null;
      priceSmall: string;
      priceMedium: string;
      priceLarge: string;
    }>
  >([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUploadFile, setImageUploadFile] = useState<File | null>(null);
  const [extraImagePreviews, setExtraImagePreviews] = useState<string[]>([]);
  const [extraImageUploadFiles, setExtraImageUploadFiles] = useState<File[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);
  const [selectedColors, setSelectedColors] = useState<Array<{ name: string; value: string }>>([]);
  const [customColor, setCustomColor] = useState('#000000');
  const [customSize, setCustomSize] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const extraFilesInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  const shopCategoryUpper = String(shopCategory || '').toUpperCase();
  const isRestaurant = shopCategoryUpper === 'RESTAURANT';
  const isFashion = shopCategoryUpper === 'FASHION';
  const isFood = shopCategoryUpper === 'FOOD';
  const isService = shopCategoryUpper === 'SERVICE';
  const isRetail = shopCategoryUpper === 'RETAIL';
  const isFurnitureActivity = !isFood && !isRestaurant;
  const allowPackOptions = isFood || isRetail;

  const furnitureMeta = (() => {
    if (!isFurnitureActivity) return undefined;
    const u = String((furnitureUnit || unit || '').trim());
    const l = parseNumberInput(furnitureLengthCm);
    const w = parseNumberInput(furnitureWidthCm);
    const h = parseNumberInput(furnitureHeightCm);

    const lengthCm = Number.isFinite(l) && l > 0 ? Math.round(l * 100) / 100 : undefined;
    const widthCm = Number.isFinite(w) && w > 0 ? Math.round(w * 100) / 100 : undefined;
    const heightCm = Number.isFinite(h) && h > 0 ? Math.round(h * 100) / 100 : undefined;

    const meta: any = {
      ...(u ? { unit: u } : {}),
      ...(typeof lengthCm === 'number' ? { lengthCm } : {}),
      ...(typeof widthCm === 'number' ? { widthCm } : {}),
      ...(typeof heightCm === 'number' ? { heightCm } : {}),
    };

    return Object.keys(meta).length ? meta : undefined;
  })();

  const presetColors: Array<{ name: string; value: string }> = [
    { name: 'أسود', value: '#111827' },
    { name: 'أبيض', value: '#ffffff' },
    { name: 'رمادي', value: '#9ca3af' },
    { name: 'أحمر', value: '#ef4444' },
    { name: 'وردي', value: '#ec4899' },
    { name: 'بنفسجي', value: '#a855f7' },
    { name: 'أزرق', value: '#3b82f6' },
    { name: 'سماوي', value: '#06b6d4' },
    { name: 'أخضر', value: '#22c55e' },
    { name: 'أصفر', value: '#eab308' },
    { name: 'برتقالي', value: '#f97316' },
    { name: 'بني', value: '#a16207' },
  ];

  const presetSizes: string[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];

  function toLatinDigits(input: string) {
    const map: Record<string, string> = {
      '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4', '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
      '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4', '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9',
    };
    return String(input || '').replace(/[٠-٩۰-۹]/g, (d) => map[d] || d);
  }

  function parseNumberInput(value: any) {
    if (typeof value === 'number') return value;
    const raw = String(value ?? '').trim();
    if (!raw) return NaN;
    const cleaned = toLatinDigits(raw)
      .replace(/[٬،]/g, '')
      .replace(/[٫]/g, '.')
      .replace(/\s+/g, '');
    const n = Number(cleaned);
    return n;
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const mime = String(file.type || '').toLowerCase().trim();
      const allowed = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'video/mp4']);
      if (!mime || !allowed.has(mime)) {
        addToast('نوع الملف غير مدعوم. استخدم صور أو فيديو MP4', 'error');
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
        addToast('نوع الصورة غير مدعوم', 'error');
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
      addToast('يرجى اختيار صورة للمنتج أولاً', 'info');
      return;
    }

    const sizes = (() => {
      if (!isFashion) return undefined;
      const list = Array.isArray(fashionSizeItems) ? fashionSizeItems : [];
      if (list.length === 0) return [];
      const mapped = list
        .map((s) => {
          const label = String(s?.label || '').trim();
          const p = parseNumberInput((s as any)?.price);
          if (!label) return null;
          if (!Number.isFinite(p) || p < 0) return null;
          return { label, price: Math.round(p * 100) / 100 };
        })
        .filter(Boolean) as any[];
      if (mapped.length !== list.length) return '__INVALID__';
      return mapped;
    })();

    if (sizes === '__INVALID__') {
      addToast('يرجى إدخال المقاسات والأسعار بشكل صحيح', 'error');
      return;
    }

    const menuVariants = (() => {
      if (!isRestaurant) return undefined;
      const list = Array.isArray(menuVariantItems) ? menuVariantItems : [];
      if (list.length === 0) return undefined;
      const mapped = list
        .map((t) => {
          const tid = String(t?.id || '').trim();
          const tname = String(t?.name || '').trim();
          if (!tid || !tname) return null;
          const sizes: Array<{ id: string; label: string; price: number }> = [];

          if (t?.hasSmall) {
            const ps = parseNumberInput(t.priceSmall);
            if (!Number.isFinite(ps) || ps <= 0) return null;
            sizes.push({ id: 'small', label: 'صغير', price: ps });
          }
          if (t?.hasMedium) {
            const pm = parseNumberInput(t.priceMedium);
            if (!Number.isFinite(pm) || pm <= 0) return null;
            sizes.push({ id: 'medium', label: 'وسط', price: pm });
          }
          if (t?.hasLarge) {
            const pl = parseNumberInput(t.priceLarge);
            if (!Number.isFinite(pl) || pl <= 0) return null;
            sizes.push({ id: 'large', label: 'كبير', price: pl });
          }

          if (sizes.length === 0) return null;
          return { id: tid, name: tname, sizes };
        })
        .filter(Boolean);

      return mapped.length !== list.length ? '__INVALID__' : mapped;
    })();

    if (menuVariants === '__INVALID__') {
      addToast('يرجى إدخال النوع والسعر للمقاسات المتاحة', 'error');
      return;
    }

    const parsedPrice = parseNumberInput(price);
    const resolvedBasePrice = (() => {
      if (isFashion && Array.isArray(sizes) && sizes.length > 0) {
        const min = Math.min(...sizes.map((t: any) => Number(t?.price || 0)).filter((n: any) => Number.isFinite(n) && n >= 0));
        return Number.isFinite(min) ? min : parsedPrice;
      }
      return parsedPrice;
    })();

    if (!Number.isFinite(resolvedBasePrice) || resolvedBasePrice < 0) {
      addToast('السعر غير صحيح', 'error');
      return;
    }

    const parsedStock = isRestaurant ? 0 : parseNumberInput(stock);
    if (!isRestaurant && (!Number.isFinite(parsedStock) || parsedStock < 0)) {
      addToast('الكمية غير صحيحة', 'error');
      return;
    }

    setLoading(true);
    setIsCompressing(true);
    setCompressionProgress(10);
    try {
      const mime = String((imageUploadFile as any)?.type || '').toLowerCase();
      let finalImageUrl = '';
      let finalVideoUrl = '';
      let finalPosterUrl = '';

      if (mime.startsWith('video/')) {
        setCompressionProgress(20);
        const thumbnail = await generateVideoThumbnail(imageUploadFile);
        const thumbUpload = await ApiService.uploadMediaRobust({ file: thumbnail, purpose: 'product_video_poster', shopId });
        finalPosterUrl = thumbUpload.url;
        setCompressionProgress(40);
        const upload = await ApiService.uploadMediaRobust({ file: imageUploadFile, purpose: 'product_video', shopId });
        finalVideoUrl = upload.url;
        finalImageUrl = finalPosterUrl;
      } else if (mime.startsWith('image/')) {
        setCompressionProgress(40);
        const upload = await ApiService.uploadMediaRobust({ file: imageUploadFile, purpose: 'product_image', shopId });
        finalImageUrl = upload.url;
      }

      setCompressionProgress(70);
      let extraUrls: string[] = [];
      if (!isRestaurant && extraImageUploadFiles.length > 0) {
        const uploads = await Promise.all(extraImageUploadFiles.map((f) => ApiService.uploadMediaRobust({ file: f, purpose: 'product_image', shopId })));
        extraUrls = uploads.map(u => String(u?.url || '')).filter(Boolean);
      }

      setCompressionProgress(90);

      await ApiService.addProduct({
        shopId,
        name,
        price: resolvedBasePrice,
        stock: isRestaurant ? 0 : parsedStock,
        category: String(cat || '').trim() || 'عام',
        unit: unit ? unit : (isFurnitureActivity ? furnitureUnit : undefined),
        imageUrl: finalImageUrl,
        videoUrl: finalVideoUrl,
        bannerPosterUrl: finalPosterUrl,
        description: description ? description : null,
        trackStock: !isRestaurant,
        furnitureMeta: isFurnitureActivity ? furnitureMeta : undefined,
        packOptions: allowPackOptions ? packOptionItems.map(p => ({ ...p, price: parseNumberInput(p.price), qty: parseNumberInput(p.qty) })) : undefined,
        menuVariants: isRestaurant ? menuVariants : undefined,
        images: isRestaurant ? undefined : [finalImageUrl, ...extraUrls].filter(Boolean),
        colors: isFashion ? selectedColors : undefined,
        sizes: isFashion ? sizes : undefined,
      });

      addToast('تمت إضافة المنتج بنجاح!', 'success');
      onClose();
    } catch (err: any) {
      addToast(err?.message || 'فشل في إضافة المنتج', 'error');
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
          <h2 className="text-3xl font-black">إضافة صنف جديد</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 pb-24 sm:pb-0">
          <ImageUploadSection 
            imagePreview={imagePreview} 
            fileInputRef={fileInputRef} 
            handleImageChange={handleImageChange} 
          />

          {isFood && (
            <div className="space-y-3">
              <label className="text-[10px] font-black text-[#00E5FF] uppercase tracking-widest block pr-4">وحدة البيع</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-6 font-black text-right focus:bg-white focus:border-[#00E5FF]/20 transition-all outline-none appearance-none"
              >
                <option value="">بدون</option>
                <option value="PIECE">قطعة</option>
                <option value="KG">كيلو</option>
                <option value="G">جرام</option>
                <option value="L">لتر</option>
                <option value="ML">ملّي</option>
                <option value="PACK">عبوة</option>
              </select>
            </div>
          )}

          <BasicInfoSection 
            name={name} setName={setName}
            price={price} setPrice={setPrice}
            stock={stock} setStock={setStock}
            cat={cat} setCat={setCat}
            description={description} setDescription={setDescription}
            isRestaurant={isRestaurant}
            isFashion={isFashion}
            fashionSizeItems={fashionSizeItems}
          />

          {isFurnitureActivity && (
            <FurnitureOptionsSection
              furnitureUnit={furnitureUnit}
              setFurnitureUnit={setFurnitureUnit}
              furnitureLengthCm={furnitureLengthCm}
              setFurnitureLengthCm={setFurnitureLengthCm}
              furnitureWidthCm={furnitureWidthCm}
              setFurnitureWidthCm={setFurnitureWidthCm}
              furnitureHeightCm={furnitureHeightCm}
              setFurnitureHeightCm={setFurnitureHeightCm}
              unit={unit}
            />
          )}

          {allowPackOptions && (
            <PackOptionsSection 
              packOptionItems={packOptionItems} 
              setPackOptionItems={setPackOptionItems} 
              unit={unit} 
            />
          )}

          {isRestaurant && (
            <RestaurantMenuSection
              menuVariantItems={menuVariantItems}
              setMenuVariantItems={setMenuVariantItems}
              parseNumberInput={parseNumberInput}
            />
          )}

          {!isRestaurant && (
            <>
              <AdditionalImagesSection
                extraImagePreviews={extraImagePreviews}
                extraFilesInputRef={extraFilesInputRef}
                handleExtraImagesChange={handleExtraImagesChange}
                setExtraImagePreviews={setExtraImagePreviews}
                setExtraImageUploadFiles={setExtraImageUploadFiles}
              />

              {isFashion && (
                <FashionOptionsSection
                  presetColors={presetColors}
                  selectedColors={selectedColors}
                  setSelectedColors={setSelectedColors}
                  customColor={customColor}
                  setCustomColor={setCustomColor}
                  presetSizes={presetSizes}
                  fashionSizeItems={fashionSizeItems}
                  setFashionSizeItems={setFashionSizeItems}
                  customSize={customSize}
                  setCustomSize={setCustomSize}
                />
              )}
            </>
          )}

          <FormFooter 
            loading={loading}
            isCompressing={isCompressing}
            compressionProgress={compressionProgress}
            submitLabel="تأكيد وحفظ الصنف"
            processingLabel="جاري الحفظ..."
          />
        </form>
      </MotionDiv>
    </div>
  );
};

export default AddProductModal;
