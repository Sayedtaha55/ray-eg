import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { ApiService } from '@/services/api.service';
import { useToast } from '@/components/common/feedback/Toaster';
import { Category } from '@/types';
import { generateVideoThumbnail } from '@/lib/image-utils';

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
  renderExtras?: (ctx: { parseNumberInput: (v: any) => number }) => React.ReactNode;
  buildExtrasPayload?: (ctx: { parseNumberInput: (v: any) => number; basePrice: number }) => { payload?: any; resolvedBasePrice?: number };
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
}) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [cat, setCat] = useState('عام');
  const [description, setDescription] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUploadFile, setImageUploadFile] = useState<File | null>(null);
  const [extraImagePreviews, setExtraImagePreviews] = useState<string[]>([]);
  const [extraImageUploadFiles, setExtraImageUploadFiles] = useState<File[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const extraFilesInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

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

    const parsedPrice = parseNumberInput(price);
    const basePrice = parsedPrice;
    if (!Number.isFinite(basePrice) || basePrice < 0) {
      addToast('السعر غير صحيح', 'error');
      return;
    }

    const parsedStock = isRestaurant ? 0 : parseNumberInput(stock);
    if (!isRestaurant && (!Number.isFinite(parsedStock) || parsedStock < 0)) {
      addToast('الكمية غير صحيحة', 'error');
      return;
    }

    const extras = (() => {
      if (!buildExtrasPayload) return { payload: undefined as any, resolvedBasePrice: undefined as any };
      try {
        return buildExtrasPayload({ parseNumberInput, basePrice });
      } catch (e: any) {
        const msg = e?.message ? String(e.message) : 'بيانات النشاط غير صحيحة';
        addToast(msg, 'error');
        return '__INVALID__' as const;
      }
    })();

    if (extras === '__INVALID__') {
      return;
    }

    const resolvedBasePrice = typeof extras?.resolvedBasePrice === 'number' ? extras.resolvedBasePrice : basePrice;
    if (!Number.isFinite(resolvedBasePrice) || resolvedBasePrice < 0) {
      addToast('السعر غير صحيح', 'error');
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
      if (allowExtraImages && extraImageUploadFiles.length > 0) {
        const uploads = await Promise.all(
          extraImageUploadFiles.map((f) => ApiService.uploadMediaRobust({ file: f, purpose: 'product_image', shopId })),
        );
        extraUrls = uploads.map((u) => String(u?.url || '')).filter(Boolean);
      }

      setCompressionProgress(90);

      const corePayload: any = {
        shopId,
        name,
        price: resolvedBasePrice,
        stock: isRestaurant ? 0 : parsedStock,
        category: String(cat || '').trim() || 'عام',
        imageUrl: finalImageUrl,
        videoUrl: finalVideoUrl,
        bannerPosterUrl: finalPosterUrl,
        description: description ? description : null,
        trackStock: !isRestaurant,
        ...(allowExtraImages ? { images: [finalImageUrl, ...extraUrls].filter(Boolean) } : {}),
      };

      await ApiService.addProduct({
        ...corePayload,
        ...(extras?.payload && typeof extras.payload === 'object' ? extras.payload : {}),
      });

      addToast('تم إضافة المنتج بنجاح!', 'success');
      try {
        window.dispatchEvent(new CustomEvent('ray-products-updated', { detail: { shopId } }));
      } catch {
      }
      onClose();
    } catch (err: any) {
      const msg = err?.message ? String(err.message) : 'فشل في إضافة المنتج';
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
            stock={stock}
            setStock={setStock}
            cat={cat}
            setCat={setCat}
            description={description}
            setDescription={setDescription}
            isRestaurant={isRestaurant}
            isFashion={isFashion}
            fashionSizeItems={Array.isArray(fashionSizeItems) ? fashionSizeItems : []}
          />

          {typeof renderExtras === 'function' ? renderExtras({ parseNumberInput }) : null}

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

          <FormFooter
            loading={loading}
            isCompressing={isCompressing}
            compressionProgress={compressionProgress}
            submitLabel="تأكيد إضافة الصنف"
            processingLabel="جاري إضافة الصنف..."
          />
        </form>
      </MotionDiv>
    </div>
  );
};

export default AddProductModalShell;
