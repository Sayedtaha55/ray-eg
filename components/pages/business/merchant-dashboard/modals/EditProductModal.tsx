import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, Video } from 'lucide-react';
import { ApiService } from '@/services/api.service';
import { useToast } from '@/components/common/feedback/Toaster';
import { Category, Product } from '@/types';
import { compressImage, generateVideoThumbnail } from '@/lib/image-utils';

// Sub-components
import ImageUploadSection from './EditProduct/ImageUploadSection';
import BasicInfoSection from './EditProduct/BasicInfoSection';
import PackOptionsSection from './EditProduct/PackOptionsSection';
import RestaurantMenuSection from './EditProduct/RestaurantMenuSection';
import type { RestaurantMenuVariantItem } from './EditProduct/RestaurantMenuSection';
import AdditionalImagesSection from './EditProduct/AdditionalImagesSection';
import FashionOptionsSection from './EditProduct/FashionOptionsSection';
import FurnitureOptionsSection from './EditProduct/FurnitureOptionsSection';
import FormFooter from './EditProduct/FormFooter';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  shopId: string;
  shopCategory?: Category | string;
  product: Product | null;
  onUpdate: (product: Product) => void;
};

const MotionDiv = motion.div as any;

const EditProductModal: React.FC<Props> = ({ isOpen, onClose, shopId, shopCategory, product, onUpdate }) => {
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
  const [menuVariantItems, setMenuVariantItems] = useState<RestaurantMenuVariantItem[]>([]);
  const [addonItems, setAddonItems] = useState<
    Array<{
      id: string;
      name: string;
      imagePreview: string | null;
      imageUrl: string | null;
      imageUploadFile: File | null;
      priceSmall: string;
      priceMedium: string;
      priceLarge: string;
    }>
  >([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUploadFile, setImageUploadFile] = useState<File | null>(null);
  const [imageChanged, setImageChanged] = useState(false);
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
  const devActivityId = (() => {
    try {
      return String(localStorage.getItem('ray_dev_activity_id') || '').trim();
    } catch {
      return '';
    }
  })();
  const isFurniture = shopCategoryUpper === 'FURNITURE';
  const allowPackOptions = isFood || isRetail;

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

  const toLatinDigits = (input: string) => {
    const map: Record<string, string> = {
      '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4', '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
      '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4', '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9',
    };
    return String(input || '').replace(/[٠-٩۰-۹]/g, (d) => map[d] || d);
  };

  const parseNumberInput = (value: any) => {
    if (typeof value === 'number') return value;
    const raw = String(value ?? '').trim();
    if (!raw) return NaN;
    const cleaned = toLatinDigits(raw)
      .replace(/[٬،]/g, '')
      .replace(/[٫]/g, '.')
      .replace(/\s+/g, '');
    const n = Number(cleaned);
    return n;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const mime = String(file.type || '').toLowerCase().trim();
      const allowed = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'video/mp4']);
      if (!mime || !allowed.has(mime)) {
        addToast('نوع الصورة غير مدعوم. استخدم JPG أو PNG أو WEBP أو AVIF أو MP4', 'error');
        try {
          if (fileInputRef.current) fileInputRef.current.value = '';
        } catch {
        }
        return;
      }
      try {
        if (imagePreview && imagePreview.startsWith('blob:')) {
          URL.revokeObjectURL(imagePreview);
        }
      } catch {
        // ignore
      }
      setImageUploadFile(file);
      setImagePreview(URL.createObjectURL(file));
      setImageChanged(true);
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
        addToast('نوع الصورة غير مدعوم. استخدم JPG أو PNG أو WEBP أو AVIF', 'error');
        continue;
      }
      nextFiles.push(file);
      nextPreviews.push(URL.createObjectURL(file));
    }

    const combinedFiles = [...extraImageUploadFiles, ...nextFiles].slice(0, 5);
    const combinedPreviews = [...extraImagePreviews, ...nextPreviews].slice(0, 5);

    setExtraImageUploadFiles(combinedFiles);
    setExtraImagePreviews(combinedPreviews);

    try {
      if (extraFilesInputRef.current) extraFilesInputRef.current.value = '';
    } catch {
    }
  };

  // Load product data when modal opens
  useEffect(() => {
    if (isOpen && product) {
      // Reset transient image state to avoid leaking previous modal session state across products
      try {
        if (imagePreview && imagePreview.startsWith('blob:')) {
          URL.revokeObjectURL(imagePreview);
        }
      } catch {
      }
      try {
        for (const p of extraImagePreviews) {
          if (p && p.startsWith('blob:')) URL.revokeObjectURL(p);
        }
      } catch {
      }
      setImageUploadFile(null);
      setImageChanged(false);
      setExtraImageUploadFiles([]);

      setName(product.name || '');
      setPrice(String(product.price || ''));
      setStock(String(product.stock || ''));
      setCat(product.category || 'عام');
      setDescription(product.description || '');
      setUnit(typeof (product as any)?.unit === 'string' ? String((product as any).unit) : '');

      const fm = (product as any)?.furnitureMeta;
      setFurnitureUnit(typeof fm?.unit === 'string' ? String(fm.unit) : '');
      setFurnitureLengthCm(typeof fm?.lengthCm === 'number' ? String(fm.lengthCm) : (fm?.lengthCm != null ? String(fm.lengthCm) : ''));
      setFurnitureWidthCm(typeof fm?.widthCm === 'number' ? String(fm.widthCm) : (fm?.widthCm != null ? String(fm.widthCm) : ''));
      setFurnitureHeightCm(typeof fm?.heightCm === 'number' ? String(fm.heightCm) : (fm?.heightCm != null ? String(fm.heightCm) : ''));
      setPackOptionItems(() => {
        const raw = (product as any)?.packOptions ?? (product as any)?.pack_options;
        const list = Array.isArray(raw) ? raw : [];
        return list.map((p: any, idx: number) => {
          const id = String(p?.id || '').trim() || `pack_${idx + 1}`;
          const qty = typeof p?.qty === 'number' ? String(p.qty) : (p?.qty != null ? String(p.qty) : '');
          const price = typeof p?.price === 'number' ? String(p.price) : (p?.price != null ? String(p.price) : '');
          return { id, qty, price };
        });
      });
      setImagePreview((product as any).imageUrl || (product as any).image_url || null);
      setMenuVariantItems(() => {
        const raw = (product as any)?.menuVariants ?? (product as any)?.menu_variants;
        const list = Array.isArray(raw) ? raw : [];
        const getSizePrice = (type: any, sizeId: string) => {
          const sizes = Array.isArray(type?.sizes) ? type.sizes : [];
          const found = sizes.find((s: any) => String(s?.id || s?.sizeId || '').trim() === sizeId);
          const p = typeof found?.price === 'number' ? found.price : Number(found?.price || NaN);
          return Number.isFinite(p) ? String(p) : '';
        };
        const hasSize = (type: any, sizeId: string) => {
          const sizes = Array.isArray(type?.sizes) ? type.sizes : [];
          return Boolean(sizes.find((s: any) => String(s?.id || s?.sizeId || '').trim() === sizeId));
        };
        return list
          .map((t: any) => {
            const id = String(t?.id || t?.typeId || t?.variantId || '').trim();
            const name = String(t?.name || t?.label || '').trim();
            if (!id) return null;
            return {
              id,
              name,
              hasSmall: hasSize(t, 'small'),
              hasMedium: hasSize(t, 'medium'),
              hasLarge: hasSize(t, 'large'),
              priceSmall: getSizePrice(t, 'small'),
              priceMedium: getSizePrice(t, 'medium'),
              priceLarge: getSizePrice(t, 'large'),
            };
          })
          .filter(Boolean) as any;
      });
      setAddonItems(() => {
        const raw = (product as any)?.addons;
        const groups = Array.isArray(raw) ? raw : [];
        const first = groups[0];
        const options = Array.isArray(first?.options) ? first.options : [];
        const mapped = options
          .map((o: any) => {
            const optId = String(o?.id || '').trim();
            if (!optId) return null;
            const vars = Array.isArray(o?.variants) ? o.variants : [];
            const getPrice = (vid: string) => {
              const v = vars.find((x: any) => String(x?.id || '').trim() === vid);
              const p = typeof v?.price === 'number' ? v.price : Number(v?.price || 0);
              return Number.isFinite(p) ? String(p) : '';
            };
            const img = typeof o?.imageUrl === 'string' ? String(o.imageUrl) : (typeof o?.image_url === 'string' ? String(o.image_url) : '');
            return {
              id: optId,
              name: String(o?.name || o?.title || '').trim(),
              imagePreview: img || null,
              imageUrl: img || null,
              imageUploadFile: null,
              priceSmall: getPrice('small'),
              priceMedium: getPrice('medium'),
              priceLarge: getPrice('large'),
            };
          })
          .filter(Boolean);
        return mapped as any;
      });
      
      // Load extra images if available
      const images = (product as any).images || [];
      if (Array.isArray(images)) {
        setExtraImagePreviews(images.filter((img: any) => typeof img === 'string'));
      }
      
      // Load colors if available
      const colors = (product as any).colors || [];
      if (Array.isArray(colors)) {
        setSelectedColors(colors.filter((c: any) => c && typeof c === 'object' && c.name && c.value));
      }
      
      // Load sizes if available
      const sizes = (product as any).sizes || [];
      if (Array.isArray(sizes)) {
        const mapped = sizes
          .map((s: any) => {
            if (typeof s === 'string') {
              const label = String(s || '').trim();
              if (!label) return null;
              return { label, price: '' };
            }
            if (s && typeof s === 'object') {
              const label = String(s?.label || s?.name || s?.size || s?.id || '').trim();
              if (!label) return null;
              const p = typeof s?.price === 'number' ? s.price : Number(s?.price);
              const price = Number.isFinite(p) ? String(Math.round(p * 100) / 100) : '';
              return { label, price };
            }
            return null;
          })
          .filter(Boolean) as any;
        setFashionSizeItems(mapped);
      }
    }
  }, [isOpen, product]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!product) return;

    const packOptions = (() => {
      if (!allowPackOptions) return undefined;
      const list = Array.isArray(packOptionItems) ? packOptionItems : [];
      if (list.length === 0) return [];
      const mapped = list
        .map((p) => {
          const qty = parseNumberInput(p?.qty);
          const pr = parseNumberInput(p?.price);
          if (!Number.isFinite(qty) || qty <= 0) return null;
          if (!Number.isFinite(pr) || pr < 0) return null;
          return {
            id: String(p?.id || '').trim() || `pack_${Date.now()}_${Math.random().toString(16).slice(2)}`,
            qty: Math.round(qty * 1000) / 1000,
            unit: unit ? String(unit).trim() : null,
            price: Math.round(pr * 100) / 100,
          };
        })
        .filter(Boolean);
      if (mapped.length !== list.length) return '__INVALID__';
      return mapped;
    })();

    if (packOptions === '__INVALID__') {
      addToast('يرجى إدخال باقات البيع بشكل صحيح', 'error');
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
          return {
            id: tid,
            name: tname,
            sizes,
          };
        })
        .filter(Boolean);

      if (mapped.length !== list.length) {
        return '__INVALID__';
      }
      return mapped;
    })();

    if (menuVariants === '__INVALID__') {
      addToast('يرجى إدخال النوع والسعر للمقاسات المتاحة (واختر "لا يوجد" للمقاسات غير المتوفرة)', 'error');
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
      let imageUrl = (product as any).imageUrl || (product as any).image_url || '';
      let videoUrl = (product as any).videoUrl || (product as any).video_url || '';
      let posterUrl = (product as any).bannerPosterUrl || '';
      
      // Upload new main image if changed
      if (imageChanged && imageUploadFile) {
        const mime = String((imageUploadFile as any)?.type || '').toLowerCase();
        
        if (mime.startsWith('video/')) {
          setCompressionProgress(20);
          // Generate thumbnail for video
          const thumbnail = await generateVideoThumbnail(imageUploadFile);
          const thumbUpload = await ApiService.uploadMediaRobust({
            file: thumbnail,
            purpose: 'product_video_poster',
            shopId,
          });
          posterUrl = thumbUpload.url;
          
          setCompressionProgress(40);
          // Upload video directly
          const upload = await ApiService.uploadMediaRobust({
            file: imageUploadFile,
            purpose: 'product_video',
            shopId,
          });
          videoUrl = upload.url;
          imageUrl = posterUrl; // Fallback image is the poster
        } else if (mime.startsWith('image/')) {
          setCompressionProgress(40);
          const upload = await ApiService.uploadMediaRobust({
            file: imageUploadFile,
            purpose: 'product_image',
            shopId,
          });
          imageUrl = upload.url;
        }
      }

      setCompressionProgress(70);
      // Upload extra images if new ones added
      let extraUrls: string[] = [];
      if (!isRestaurant && extraImageUploadFiles.length > 0) {
        const uploads = await Promise.all(
          extraImageUploadFiles.map((f) =>
            ApiService.uploadMediaRobust({
              file: f,
              purpose: 'product_image',
              shopId,
            })
          )
        );
        extraUrls = uploads.map((u) => String(u?.url || '')).filter(Boolean);
      }
      
      setCompressionProgress(90);

      const colors = isFashion
        ? (selectedColors || [])
            .map((c) => ({ name: String(c?.name || '').trim(), value: String(c?.value || '').trim() }))
            .filter((c) => c.name && c.value)
        : [];

      if (isFashion && colors.length === 0) {
        addToast('يرجى اختيار لون واحد على الأقل', 'error');
        return;
      }
      if (isFashion && Array.isArray(sizes) && sizes.length === 0) {
        addToast('يرجى إضافة مقاس واحد على الأقل مع السعر', 'error');
        return;
      }

      const existingExtraUrls = (extraImagePreviews || [])
        .map((u) => (typeof u === 'string' ? u : ''))
        .filter(Boolean)
        .filter((u) => !u.startsWith('blob:'))
        .filter((u) => u !== imageUrl)
        .slice(0, 5);
      const nextExtraUrls = [...existingExtraUrls, ...extraUrls].filter(Boolean).slice(0, 5);
      const nextImages = [imageUrl, ...nextExtraUrls].filter(Boolean);

      const addons = await (async () => {
        if (isRestaurant) return undefined;
        const list = Array.isArray(addonItems) ? addonItems : [];

        const uploaded = await Promise.all(
          list.map(async (a, idx) => {
            const optId = String(a?.id || '').trim() || `addon_${idx + 1}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
            const optName = String(a?.name || '').trim();
            if (!optName) return null;

            let imageUrl: string | null = a?.imageUrl ? String(a.imageUrl).trim() : null;
            const file = a?.imageUploadFile;
            if (file) {
              const compressedFile = await compressImage(file, { maxSizeMB: 0.2, maxWidthOrHeight: 600 });
              const upload = await ApiService.uploadMediaRobust({
                file: compressedFile as File,
                purpose: 'product_image',
                shopId,
              });
              imageUrl = String(upload?.url || '').trim() || null;
            }

            const pSmall = parseNumberInput(a?.priceSmall);
            const pMed = parseNumberInput(a?.priceMedium);
            const pLarge = parseNumberInput(a?.priceLarge);

            const variants: Array<{ id: string; label: string; price: number }> = [];
            if (Number.isFinite(pSmall) && pSmall > 0) variants.push({ id: 'small', label: 'صغير', price: Math.round(pSmall * 100) / 100 });
            if (Number.isFinite(pMed) && pMed > 0) variants.push({ id: 'medium', label: 'وسط', price: Math.round(pMed * 100) / 100 });
            if (Number.isFinite(pLarge) && pLarge > 0) variants.push({ id: 'large', label: 'كبير', price: Math.round(pLarge * 100) / 100 });

            if (variants.length === 0) return null;

            return {
              id: optId,
              name: optName,
              imageUrl,
              variants,
            };
          }),
        );

        const options = uploaded.filter(Boolean);
        return options.length > 0
          ? [
              {
                id: 'addons',
                name: 'إضافات',
                label: 'إضافات',
                title: 'إضافات',
                options,
              },
            ]
          : [];
      })();

      // Prepare update payload
      const updatePayload: any = {
        name,
        price: resolvedBasePrice,
        category: String(cat || '').trim() || 'عام',
        description: description ? description : null,
        imageUrl,
        videoUrl,
        bannerPosterUrl: posterUrl,
        trackStock: isRestaurant ? false : true,
        ...(allowPackOptions ? { unit: unit ? String(unit).trim() : null, packOptions } : {}),
        ...(isRestaurant ? { menuVariants } : {}),
        ...(isRestaurant
          ? {}
          : {
              images: nextImages,
              ...(isFashion ? { colors, sizes } : {}),
              ...(typeof addons !== 'undefined' ? { addons } : {}),
            }),
      };

      if (isFurniture) {
        const u = String((furnitureUnit || unit || '').trim());
        const l = parseNumberInput(furnitureLengthCm);
        const w = parseNumberInput(furnitureWidthCm);
        const h = parseNumberInput(furnitureHeightCm);
        const hasAny = Boolean(u || String(furnitureLengthCm || '').trim() || String(furnitureWidthCm || '').trim() || String(furnitureHeightCm || '').trim());
        updatePayload.unit = u || null;
        updatePayload.furnitureMeta = hasAny
          ? {
              ...(u ? { unit: u } : {}),
              ...(Number.isFinite(l) && l > 0 ? { lengthCm: l } : {}),
              ...(Number.isFinite(w) && w > 0 ? { widthCm: w } : {}),
              ...(Number.isFinite(h) && h > 0 ? { heightCm: h } : {}),
            }
          : null;
      }

      // Only include stock if not restaurant
      if (!isRestaurant) {
        updatePayload.stock = parsedStock;
      }

      // Update product via API
      const updated = await ApiService.updateProduct(product.id, updatePayload);
      
      addToast('تم تحديث المنتج بنجاح!', 'success');
      try {
        window.dispatchEvent(new CustomEvent('ray-products-updated', { detail: { shopId } }));
      } catch {
      }
      onUpdate(updated);
      onClose();
    } catch (err: any) {
      const msg = err?.message ? String(err.message) : 'فشل في تحديث المنتج';
      addToast(msg, 'error');
    } finally {
      setLoading(false);
      setIsCompressing(false);
      setCompressionProgress(0);
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-[400] flex items-start sm:items-center justify-center p-0 sm:p-6">
      <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
      <MotionDiv
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative bg-white w-full sm:max-w-2xl rounded-none sm:rounded-[3rem] p-4 sm:p-8 md:p-12 text-right shadow-2xl overflow-hidden h-[100dvh] sm:h-auto sm:max-h-[90vh] overflow-y-auto no-scrollbar"
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-black">تعديل الصنف</h2>
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

          {isFurniture && (
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
            submitLabel="تأكيد تحديث الصنف"
            processingLabel="جاري التحديث..."
          />
        </form>
      </MotionDiv>
    </div>
  );
};

export default EditProductModal;
