'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Box, RotateCw, X, Upload } from 'lucide-react';
import { clientFetch } from '@/lib/api/client';
import { useT } from '@/i18n/useT';

import ImageUploadSection from './AddProduct/ImageUploadSection';
import BasicInfoSection from './AddProduct/BasicInfoSection';
import PackOptionsSection from './AddProduct/PackOptionsSection';
import RestaurantMenuSection from './AddProduct/RestaurantMenuSection';
import type { RestaurantMenuVariantItem } from './AddProduct/RestaurantMenuSection';
import AdditionalImagesSection from './AddProduct/AdditionalImagesSection';
import FashionOptionsSection from './AddProduct/FashionOptionsSection';
import FurnitureOptionsSection from './AddProduct/FurnitureOptionsSection';
import FormFooter from './AddProduct/FormFooter';

const MotionDiv = motion.div as any;
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

type Props = {
  isOpen: boolean;
  onClose: () => void;
  shopId: string;
  shopCategory?: any;
  product: any | null;
  onUpdate: (product: any) => void;
};

const EditProductModal: React.FC<Props> = ({ isOpen, onClose, shopId, shopCategory, product, onUpdate }) => {
  const t = useT();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [groceryPackEnabled, setGroceryPackEnabled] = useState(false);
  const [restaurantBaseSizesEnabled, setRestaurantBaseSizesEnabled] = useState(false);
  const [restaurantPriceSmall, setRestaurantPriceSmall] = useState('');
  const [restaurantPriceMedium, setRestaurantPriceMedium] = useState('');
  const [restaurantPriceLarge, setRestaurantPriceLarge] = useState('');
  const [stock, setStock] = useState('');
  const [cat, setCat] = useState('');
  const [unit, setUnit] = useState('');
  const [furnitureUnit, setFurnitureUnit] = useState('');
  const [furnitureLengthCm, setFurnitureLengthCm] = useState('');
  const [furnitureWidthCm, setFurnitureWidthCm] = useState('');
  const [furnitureHeightCm, setFurnitureHeightCm] = useState('');
  const [packOptionItems, setPackOptionItems] = useState<Array<{ id: string; qty: string; price: string }>>([]);
  const [description, setDescription] = useState('');
  const [fashionSizeItems, setFashionSizeItems] = useState<Array<{ label: string; price: string }>>([]);
  const [menuVariantItems, setMenuVariantItems] = useState<RestaurantMenuVariantItem[]>([]);
  const [addonItems, setAddonItems] = useState<Array<{ id: string; name: string; price: string; imagePreviews: string[]; imageUrls: string[]; imageUploadFiles: File[]; selectedColors: Array<{ name: string; value: string }>; customColor: string; selectedSizes: string[]; customSize: string }>>([]);
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

  const shopCategoryUpper = (() => { const raw: any = shopCategory; if (typeof raw === 'string') return raw.trim().toUpperCase(); if (raw && typeof raw === 'object') { const v = raw.name ?? raw.slug ?? raw.id ?? raw.value; return String(v || '').trim().toUpperCase(); } return String(raw || '').trim().toUpperCase(); })();
  const isRestaurant = shopCategoryUpper === 'RESTAURANT';
  const isFashion = shopCategoryUpper === 'FASHION';
  const isFood = shopCategoryUpper === 'FOOD';
  const isRetail = shopCategoryUpper === 'RETAIL';
  const isFurniture = shopCategoryUpper === 'FURNITURE';
  const allowPackOptions = isFood || isRetail;
  const allowGroceryPackToggle = isFood;

  const presetColors: Array<{ name: string; value: string }> = [
    { name: t('business.products.colors.black', 'أسود'), value: '#111827' },
    { name: t('business.products.colors.white', 'أبيض'), value: '#ffffff' },
    { name: t('business.products.colors.gray', 'رمادي'), value: '#9ca3af' },
    { name: t('business.products.colors.red', 'أحمر'), value: '#ef4444' },
    { name: t('business.products.colors.pink', 'وردي'), value: '#ec4899' },
    { name: t('business.products.colors.purple', 'بنفسجي'), value: '#a855f7' },
    { name: t('business.products.colors.blue', 'أزرق'), value: '#3b82f6' },
    { name: t('business.products.colors.cyan', 'سماوي'), value: '#06b6d4' },
    { name: t('business.products.colors.green', 'أخضر'), value: '#22c55e' },
    { name: t('business.products.colors.yellow', 'أصفر'), value: '#eab308' },
    { name: t('business.products.colors.orange', 'برتقالي'), value: '#f97316' },
    { name: t('business.products.colors.brown', 'بني'), value: '#a16207' },
  ];
  const presetSizes: string[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const mime = String(file.type || '').toLowerCase().trim();
      const allowed = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
      if (!mime || !allowed.has(mime)) return;
      try { if (imagePreview && imagePreview.startsWith('blob:')) URL.revokeObjectURL(imagePreview); } catch {}
      setImageUploadFile(file);
      setImagePreview(URL.createObjectURL(file));
      setImageChanged(true);
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

  const handleAddonImagesChange = (addonId: string, files: File[]) => {
    const allowed = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
    const nextFiles: File[] = []; const nextPreviews: string[] = [];
    for (const file of Array.isArray(files) ? files : []) { const mime = String(file?.type || '').toLowerCase().trim(); if (!mime || !allowed.has(mime)) continue; nextFiles.push(file); nextPreviews.push(URL.createObjectURL(file)); }
    if (nextFiles.length === 0) return;
    setAddonItems(prev => (Array.isArray(prev) ? prev : []).map(x => { if (x.id !== addonId) return x; return { ...x, imageUploadFiles: [...(x.imageUploadFiles || []), ...nextFiles].slice(0, 5), imagePreviews: [...(x.imagePreviews || []), ...nextPreviews].slice(0, 5) }; }));
  };

  const handleRemoveAddonImage = (addonId: string, idx: number) => {
    setAddonItems(prev => (Array.isArray(prev) ? prev : []).map(x => {
      if (x.id !== addonId) return x;
      const previews = Array.isArray(x.imagePreviews) ? [...x.imagePreviews] : [];
      const urls = Array.isArray(x.imageUrls) ? [...x.imageUrls] : [];
      const files = Array.isArray(x.imageUploadFiles) ? [...x.imageUploadFiles] : [];
      const target = previews[idx];
      try { if (target && target.startsWith('blob:')) URL.revokeObjectURL(target); } catch {}
      previews.splice(idx, 1); urls.splice(idx, 1); files.splice(idx, 1);
      return { ...x, imagePreviews: previews, imageUrls: urls, imageUploadFiles: files };
    }));
  };

  useEffect(() => {
    if (isOpen && product) {
      try { if (imagePreview && imagePreview.startsWith('blob:')) URL.revokeObjectURL(imagePreview); } catch {}
      try { for (const p of extraImagePreviews) { if (p && p.startsWith('blob:')) URL.revokeObjectURL(p); } } catch {}
      setImageUploadFile(null); setImageChanged(false); setExtraImageUploadFiles([]);
      setName(product.name || ''); setPrice(String(product.price || '')); setStock(String(product.stock || ''));
      setCat(product.category || t('business.dashboard.products.generalCategory', 'عام'));
      setDescription(product.description || '');
      setUnit(typeof (product as any)?.unit === 'string' ? String((product as any).unit) : '');
      const fm = (product as any)?.furnitureMeta;
      setFurnitureUnit(typeof fm?.unit === 'string' ? String(fm.unit) : '');
      setFurnitureLengthCm(typeof fm?.lengthCm === 'number' ? String(fm.lengthCm) : (fm?.lengthCm != null ? String(fm.lengthCm) : ''));
      setFurnitureWidthCm(typeof fm?.widthCm === 'number' ? String(fm.widthCm) : (fm?.widthCm != null ? String(fm.widthCm) : ''));
      setFurnitureHeightCm(typeof fm?.heightCm === 'number' ? String(fm.heightCm) : (fm?.heightCm != null ? String(fm.heightCm) : ''));
      const menuVariantsRaw = (product as any)?.menuVariants ?? (product as any)?.menu_variants;
      const baseVariant = Array.isArray(menuVariantsRaw) ? menuVariantsRaw.find((v: any) => String(v?.id || '').trim() === 'base') : null;
      const hasBaseSizes = baseVariant && Array.isArray(baseVariant.sizes) && baseVariant.sizes.length > 0;
      setRestaurantBaseSizesEnabled(hasBaseSizes);
      if (hasBaseSizes) {
        const small = baseVariant?.sizes?.find((s: any) => String(s?.id || '').trim() === 'small');
        const medium = baseVariant?.sizes?.find((s: any) => String(s?.id || '').trim() === 'medium');
        const large = baseVariant?.sizes?.find((s: any) => String(s?.id || '').trim() === 'large');
        setRestaurantPriceSmall(typeof small?.price === 'number' ? String(small.price) : RESTAURANT_SIZE_NONE);
        setRestaurantPriceMedium(typeof medium?.price === 'number' ? String(medium.price) : RESTAURANT_SIZE_NONE);
        setRestaurantPriceLarge(typeof large?.price === 'number' ? String(large.price) : RESTAURANT_SIZE_NONE);
      } else { setRestaurantPriceSmall(''); setRestaurantPriceMedium(''); setRestaurantPriceLarge(''); }
      setPackOptionItems(() => { const raw = (product as any)?.packOptions ?? (product as any)?.pack_options; const list = Array.isArray(raw) ? raw : []; return list.map((p: any, idx: number) => ({ id: String(p?.id || '').trim() || `pack_${idx + 1}`, qty: typeof p?.qty === 'number' ? String(p.qty) : (p?.qty != null ? String(p.qty) : ''), price: typeof p?.price === 'number' ? String(p.price) : (p?.price != null ? String(p.price) : '') })); });
      setGroceryPackEnabled(() => { if (!allowGroceryPackToggle) return false; const raw = (product as any)?.packOptions ?? (product as any)?.pack_options; return Array.isArray(raw) && raw.length > 0; });
      setImagePreview((product as any).imageUrl || (product as any).image_url || null);
      setMenuVariantItems(() => {
        const raw = menuVariantsRaw; const list = Array.isArray(raw) ? raw : [];
        const getSizePrice = (type: any, sizeId: string) => { const sizes = Array.isArray(type?.sizes) ? type.sizes : []; const found = sizes.find((s: any) => String(s?.id || s?.sizeId || '').trim() === sizeId); const p = typeof found?.price === 'number' ? found.price : Number(found?.price || NaN); return Number.isFinite(p) ? String(p) : ''; };
        const hasSize = (type: any, sizeId: string) => { const sizes = Array.isArray(type?.sizes) ? type.sizes : []; return Boolean(sizes.find((s: any) => String(s?.id || s?.sizeId || '').trim() === sizeId)); };
        return list.filter((t: any) => String(t?.id || '').trim() !== 'base').map((t: any) => { const id = String(t?.id || t?.typeId || t?.variantId || '').trim(); const name = String(t?.name || t?.label || '').trim(); if (!id) return null; return { id, name, hasSmall: hasSize(t, 'small'), hasMedium: hasSize(t, 'medium'), hasLarge: hasSize(t, 'large'), priceSmall: getSizePrice(t, 'small'), priceMedium: getSizePrice(t, 'medium'), priceLarge: getSizePrice(t, 'large') }; }).filter(Boolean) as any;
      });
      setAddonItems(() => { const raw = (product as any)?.addons; const groups = Array.isArray(raw) ? raw : []; const first = groups[0]; const options = Array.isArray(first?.options) ? first.options : []; return options.map((o: any) => { const optId = String(o?.id || '').trim(); if (!optId) return null; const img = typeof o?.imageUrl === 'string' ? String(o.imageUrl) : (typeof o?.image_url === 'string' ? String(o.image_url) : ''); const imagesRaw = (o as any)?.images; const extraImgs = Array.isArray(imagesRaw) ? imagesRaw.map((u: any) => (typeof u === 'string' ? String(u) : '')).filter(Boolean) : []; const allImgs = [img, ...extraImgs].map((u: any) => String(u || '').trim()).filter(Boolean); const priceRaw = typeof (o as any)?.price === 'number' ? (o as any).price : ((o as any)?.price != null ? Number((o as any).price) : NaN); const price = Number.isFinite(priceRaw) && priceRaw >= 0 ? String(Math.round(priceRaw * 100) / 100) : ''; const colorsArr = Array.isArray(o?.colors) ? o.colors.map((x: any) => String(x || '').trim()).filter(Boolean) : []; const sizesArr = Array.isArray(o?.sizes) ? o.sizes.map((x: any) => String(x || '').trim()).filter(Boolean) : []; return { id: optId, name: String(o?.name || o?.title || '').trim(), price, imagePreviews: allImgs, imageUrls: allImgs, imageUploadFiles: [], selectedColors: colorsArr.map((c: string) => { const found = presetColors.find(p => p.name === c); return found || { name: c, value: '#111827' }; }), customColor: '#000000', selectedSizes: sizesArr, customSize: '' }; }).filter(Boolean) as any; });
      const images = (product as any).images || [];
      if (Array.isArray(images)) setExtraImagePreviews(images.filter((img: any) => typeof img === 'string'));
      const colors = (product as any).colors || [];
      if (Array.isArray(colors)) setSelectedColors(colors.filter((c: any) => c && typeof c === 'object' && c.name && c.value));
      const sizes = (product as any).sizes || [];
      if (Array.isArray(sizes)) { const mapped = sizes.map((s: any) => { if (typeof s === 'string') { const label = String(s || '').trim(); return label ? { label, price: '' } : null; } if (s && typeof s === 'object') { const label = String(s?.label || s?.name || s?.size || s?.id || '').trim(); if (!label) return null; const p = typeof s?.price === 'number' ? s.price : Number(s?.price); const price = Number.isFinite(p) ? String(Math.round(p * 100) / 100) : ''; return { label, price }; } return null; }).filter(Boolean) as any; setFashionSizeItems(mapped); }
    }
  }, [isOpen, product]);

  useEffect(() => { if (!allowGroceryPackToggle || !groceryPackEnabled) return; if (Array.isArray(packOptionItems) && packOptionItems.length > 0) return; setPackOptionItems([{ id: `pack_${Date.now()}_${Math.random().toString(16).slice(2)}`, qty: '', price: '' }]); }, [allowGroceryPackToggle, groceryPackEnabled]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!product) return;
    const packModeEnabled = Boolean(allowGroceryPackToggle && groceryPackEnabled);
    const packOptions = (() => {
      if (!allowPackOptions) return undefined;
      const list = Array.isArray(packOptionItems) ? packOptionItems : [];
      if (list.length === 0) return [];
      const mapped = list.map(p => { const qty = parseNumberInput(p?.qty); const pr = parseNumberInput(p?.price); if (!Number.isFinite(qty) || qty <= 0) return null; if (!Number.isFinite(pr) || pr < 0) return null; return { id: String(p?.id || '').trim() || `pack_${Date.now()}`, qty: Math.round(qty * 1000) / 1000, unit: unit ? String(unit).trim() : null, price: Math.round(pr * 100) / 100 }; }).filter(Boolean);
      if (mapped.length !== list.length) return '__INVALID__';
      return mapped;
    })();
    if (packOptions === '__INVALID__') return;
    if (packModeEnabled && Array.isArray(packOptions) && packOptions.length === 0) return;

    const sizes = (() => { if (!isFashion) return undefined; const list = Array.isArray(fashionSizeItems) ? fashionSizeItems : []; if (list.length === 0) return []; const mapped = list.map(s => { const label = String(s?.label || '').trim(); const p = parseNumberInput((s as any)?.price); if (!label) return null; if (!Number.isFinite(p) || p < 0) return null; return { label, price: Math.round(p * 100) / 100 }; }).filter(Boolean) as any[]; if (mapped.length !== list.length) return '__INVALID__'; return mapped; })();
    if (sizes === '__INVALID__') return;

    const menuVariants = (() => {
      if (!isRestaurant) return undefined;
      let list = Array.isArray(menuVariantItems) ? menuVariantItems : [];
      if (list.length === 0 && !restaurantBaseSizesEnabled) return undefined;
      const baseSizes = (() => { if (!restaurantBaseSizesEnabled) return null; const sizes: Array<{ id: string; label: string; price: number }> = []; if (String(restaurantPriceSmall ?? '') !== RESTAURANT_SIZE_NONE) { const ps = parseNumberInput(restaurantPriceSmall); if (!Number.isFinite(ps) || ps <= 0) return '__INVALID__' as const; sizes.push({ id: 'small', label: t('business.dashboard.products.sizeSmall', 'صغير'), price: ps }); } if (String(restaurantPriceMedium ?? '') !== RESTAURANT_SIZE_NONE) { const pm = parseNumberInput(restaurantPriceMedium); if (!Number.isFinite(pm) || pm <= 0) return '__INVALID__' as const; sizes.push({ id: 'medium', label: t('business.dashboard.products.sizeMedium', 'وسط'), price: pm }); } if (String(restaurantPriceLarge ?? '') !== RESTAURANT_SIZE_NONE) { const pl = parseNumberInput(restaurantPriceLarge); if (!Number.isFinite(pl) || pl <= 0) return '__INVALID__' as const; sizes.push({ id: 'large', label: t('business.dashboard.products.sizeLarge', 'كبير'), price: pl }); } if (sizes.length === 0) return '__INVALID__' as const; return sizes; })();
      if (baseSizes === '__INVALID__') return '__INVALID__' as const;
      const mapped = list.map(variant => { const tid = String(variant?.id || '').trim(); const tname = String(variant?.name || '').trim(); if (!tid || !tname) return null; const sizes: Array<{ id: string; label: string; price: number }> = []; if (variant?.hasSmall) { const ps = parseNumberInput(variant.priceSmall); if (!Number.isFinite(ps) || ps <= 0) return null; sizes.push({ id: 'small', label: t('business.dashboard.products.sizeSmall', 'صغير'), price: ps }); } if (variant?.hasMedium) { const pm = parseNumberInput(variant.priceMedium); if (!Number.isFinite(pm) || pm <= 0) return null; sizes.push({ id: 'medium', label: t('business.dashboard.products.sizeMedium', 'وسط'), price: pm }); } if (variant?.hasLarge) { const pl = parseNumberInput(variant.priceLarge); if (!Number.isFinite(pl) || pl <= 0) return null; sizes.push({ id: 'large', label: t('business.dashboard.products.sizeLarge', 'كبير'), price: pl }); } if (sizes.length === 0) return null; return { id: tid, name: tname, sizes }; }).filter(Boolean);
      if (mapped.length !== list.length) return '__INVALID__';
      return Array.isArray(baseSizes) ? [{ id: 'base', name: String(name || '').trim() || t('business.products.product', 'منتج'), sizes: baseSizes }, ...mapped] : mapped;
    })();
    if (menuVariants === '__INVALID__') return;

    const parsedPrice = parseNumberInput(price);
    const resolvedBasePrice = (() => {
      if (packModeEnabled && Array.isArray(packOptions) && packOptions.length > 0) { const first = (packOptions as any[])[0]; const p = typeof (first as any)?.price === 'number' ? (first as any).price : Number((first as any)?.price || NaN); return Number.isFinite(p) ? p : parsedPrice; }
      if (isFashion && Array.isArray(sizes) && sizes.length > 0) { const min = Math.min(...sizes.map((t: any) => Number(t?.price || 0)).filter((n: any) => Number.isFinite(n) && n >= 0)); return Number.isFinite(min) ? min : parsedPrice; }
      if (isRestaurant && restaurantBaseSizesEnabled) { const ps = parseNumberInput(restaurantPriceSmall); const pm = parseNumberInput(restaurantPriceMedium); const pl = parseNumberInput(restaurantPriceLarge); const prices = [ps, pm, pl].filter(n => Number.isFinite(n) && n > 0); const min = prices.length > 0 ? Math.min(...prices) : NaN; return Number.isFinite(min) ? min : parsedPrice; }
      return parsedPrice;
    })();
    if (!packModeEnabled && (!Number.isFinite(resolvedBasePrice) || resolvedBasePrice < 0)) return;
    if (packModeEnabled && (!Number.isFinite(resolvedBasePrice) || resolvedBasePrice <= 0)) return;

    const parsedStock = isRestaurant ? 0 : parseNumberInput(stock);
    if (!isRestaurant && (!Number.isFinite(parsedStock) || parsedStock < 0)) return;

    const colors = isFashion ? (selectedColors || []).map(c => ({ name: String(c?.name || '').trim(), value: String(c?.value || '').trim() })).filter(c => c.name && c.value) : [];
    if (isFashion && colors.length === 0) return;
    if (isFashion && Array.isArray(sizes) && sizes.length === 0) return;

    setLoading(true); setIsCompressing(true); setCompressionProgress(10);
    try {
      let imageUrl = (product as any).imageUrl || (product as any).image_url || '';
      if (imageChanged && imageUploadFile) {
        setCompressionProgress(40);
        const formData = new FormData(); formData.append('file', imageUploadFile); formData.append('purpose', 'product_image'); formData.append('shopId', shopId);
        const upload = await clientFetch<any>('/v1/media/upload', { method: 'POST', body: formData as any, headers: {} as any });
        imageUrl = String(upload?.url || '').trim();
      }
      setCompressionProgress(70);
      let extraUrls: string[] = [];
      if (!isRestaurant && extraImageUploadFiles.length > 0) {
        const uploads = await Promise.all(extraImageUploadFiles.map(async f => { const fd = new FormData(); fd.append('file', f); fd.append('purpose', 'product_image'); fd.append('shopId', shopId); const u = await clientFetch<any>('/v1/media/upload', { method: 'POST', body: fd as any, headers: {} as any }); return String(u?.url || ''); }));
        extraUrls = uploads.filter(Boolean);
      }
      setCompressionProgress(90);

      const existingExtraUrls = (extraImagePreviews || []).map(u => typeof u === 'string' ? u : '').filter(Boolean).filter(u => !u.startsWith('blob:')).filter(u => u !== imageUrl).slice(0, 5);
      const nextExtraUrls = [...existingExtraUrls, ...extraUrls].filter(Boolean).slice(0, 5);
      const nextImages = [imageUrl, ...nextExtraUrls].filter(Boolean);

      const addons = await (async () => {
        if (isRestaurant) return undefined;
        const list = Array.isArray(addonItems) ? addonItems : [];
        const uploaded = await Promise.all(list.map(async (a, idx) => {
          const optId = String(a?.id || '').trim() || `addon_${idx + 1}_${Date.now()}`;
          const optName = String(a?.name || '').trim();
          if (!optName) return null;
          const existingUrls = (Array.isArray(a?.imageUrls) ? a.imageUrls : []).map((u: any) => typeof u === 'string' ? String(u) : '').filter(Boolean).filter((u: string) => !u.startsWith('blob:')).slice(0, 5);
          const uploadFiles = Array.isArray(a?.imageUploadFiles) ? a.imageUploadFiles : [];
          const uploadedUrls: string[] = [];
          for (const f of uploadFiles.slice(0, 5)) { const fd = new FormData(); fd.append('file', f); fd.append('purpose', 'product_image'); fd.append('shopId', shopId); const u = await clientFetch<any>('/v1/media/upload', { method: 'POST', body: fd as any, headers: {} as any }); const url = String(u?.url || '').trim(); if (url) uploadedUrls.push(url); }
          const images = [...existingUrls, ...uploadedUrls].filter(Boolean).slice(0, 5);
          const addonImageUrl = images.length > 0 ? String(images[0] || '').trim() : null;
          const addonColors = (Array.isArray(a?.selectedColors) ? a.selectedColors : []).map((c: any) => String(c?.name || '').trim()).filter(Boolean);
          const addonSizes = (Array.isArray(a?.selectedSizes) ? a.selectedSizes : []).map((s: any) => String(s || '').trim()).filter(Boolean);
          return { id: optId, name: optName, imageUrl: addonImageUrl, ...(images.length > 0 ? { images } : {}), ...(Number.isFinite(parseNumberInput((a as any)?.price)) && parseNumberInput((a as any)?.price) >= 0 ? { price: Math.round(parseNumberInput((a as any)?.price) * 100) / 100 } : {}), colors: addonColors, sizes: addonSizes };
        }));
        const options = uploaded.filter(Boolean);
        return options.length > 0 ? [{ id: 'addons', name: t('business.sales.addons', 'إضافات'), label: t('business.sales.addons', 'إضافات'), title: t('business.sales.addons', 'إضافات'), options }] : [];
      })();

      const updatePayload: any = {
        name, price: resolvedBasePrice,
        category: String(cat || '').trim() || t('business.dashboard.products.generalCategory', 'عام'),
        description: description || null, imageUrl,
        trackStock: isRestaurant ? false : true,
        ...(allowPackOptions ? { unit: unit ? String(unit).trim() : null, packOptions } : {}),
        ...(isRestaurant ? { menuVariants } : {}),
        ...(!isRestaurant ? { images: nextImages, ...(isFashion ? { colors, sizes } : {}), ...(typeof addons !== 'undefined' ? { addons } : {}) } : {}),
      };
      if (isFurniture) {
        const u = String((furnitureUnit || unit || '').trim());
        const l = parseNumberInput(furnitureLengthCm); const w = parseNumberInput(furnitureWidthCm); const h = parseNumberInput(furnitureHeightCm);
        const hasAny = Boolean(u || String(furnitureLengthCm || '').trim() || String(furnitureWidthCm || '').trim() || String(furnitureHeightCm || '').trim());
        updatePayload.unit = u || null;
        updatePayload.furnitureMeta = hasAny ? { ...(u ? { unit: u } : {}), ...(Number.isFinite(l) && l > 0 ? { lengthCm: l } : {}), ...(Number.isFinite(w) && w > 0 ? { widthCm: w } : {}), ...(Number.isFinite(h) && h > 0 ? { heightCm: h } : {}) } : null;
      }
      if (!isRestaurant) updatePayload.stock = parsedStock;

      const updated = await clientFetch<any>(`/v1/products/${product.id}`, { method: 'PUT', body: JSON.stringify(updatePayload) });
      try { window.dispatchEvent(new CustomEvent('ray-products-updated', { detail: { shopId } })); } catch {}
      onUpdate(updated);
      onClose();
    } catch {} finally { setLoading(false); setIsCompressing(false); setCompressionProgress(0); }
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-[400] flex items-start sm:items-center justify-center p-0 sm:p-6">
      <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
      <MotionDiv initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="relative bg-white w-full sm:max-w-2xl rounded-none sm:rounded-[3rem] p-4 sm:p-8 md:p-12 text-right shadow-2xl overflow-hidden h-[100dvh] sm:h-auto sm:max-h-[90vh] overflow-y-auto no-scrollbar">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-black">{t('business.products.editItem', 'تعديل العنصر')}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors"><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-8 pb-24 sm:pb-0">
          <ImageUploadSection imagePreview={imagePreview} fileInputRef={fileInputRef} handleImageChange={handleImageChange} />
          <BasicInfoSection name={name} setName={setName} price={price} setPrice={setPrice} groceryPackEnabled={groceryPackEnabled} setGroceryPackEnabled={allowGroceryPackToggle ? setGroceryPackEnabled : undefined} restaurantBaseSizesEnabled={restaurantBaseSizesEnabled} setRestaurantBaseSizesEnabled={setRestaurantBaseSizesEnabled} restaurantPriceSmall={restaurantPriceSmall} setRestaurantPriceSmall={setRestaurantPriceSmall} restaurantPriceMedium={restaurantPriceMedium} setRestaurantPriceMedium={setRestaurantPriceMedium} restaurantPriceLarge={restaurantPriceLarge} setRestaurantPriceLarge={setRestaurantPriceLarge} stock={stock} setStock={setStock} cat={cat} setCat={setCat} description={description} setDescription={setDescription} isRestaurant={isRestaurant} isFashion={isFashion} fashionSizeItems={fashionSizeItems} />
          {isFurniture && <FurnitureOptionsSection furnitureUnit={furnitureUnit} setFurnitureUnit={setFurnitureUnit} furnitureLengthCm={furnitureLengthCm} setFurnitureLengthCm={setFurnitureLengthCm} furnitureWidthCm={furnitureWidthCm} setFurnitureWidthCm={setFurnitureWidthCm} furnitureHeightCm={furnitureHeightCm} setFurnitureHeightCm={setFurnitureHeightCm} unit={unit} />}
          {allowPackOptions && (!allowGroceryPackToggle || groceryPackEnabled) && <PackOptionsSection packOptionItems={packOptionItems} setPackOptionItems={setPackOptionItems} unit={unit} />}
          {isRestaurant && <RestaurantMenuSection menuVariantItems={menuVariantItems} setMenuVariantItems={setMenuVariantItems} parseNumberInput={parseNumberInput} />}
          {!isRestaurant && (
            <>
              <AdditionalImagesSection extraImagePreviews={extraImagePreviews} extraFilesInputRef={extraFilesInputRef} handleExtraImagesChange={handleExtraImagesChange} setExtraImagePreviews={setExtraImagePreviews} setExtraImageUploadFiles={setExtraImageUploadFiles} />
              {isFashion && <FashionOptionsSection presetColors={presetColors} selectedColors={selectedColors} setSelectedColors={setSelectedColors} customColor={customColor} setCustomColor={setCustomColor} presetSizes={presetSizes} fashionSizeItems={fashionSizeItems} setFashionSizeItems={setFashionSizeItems} customSize={customSize} setCustomSize={setCustomSize} />}
              {isFashion && (
                <div className="p-5 sm:p-6 rounded-3xl border border-slate-200 bg-slate-50/60 space-y-4">
                  <div className="flex items-center justify-between flex-row-reverse">
                    <div className="text-right"><h4 className="font-black text-slate-900">{t('business.products.complementaryProducts', 'منتجات مكملة')}</h4><p className="text-[11px] font-bold text-slate-500">{t('business.products.complementaryProductsHint', 'إضافة منتجات مكملة')}</p></div>
                    <button type="button" onClick={() => setAddonItems(prev => [...(Array.isArray(prev) ? prev : []), { id: `addon_${Date.now()}_${Math.random().toString(16).slice(2)}`, name: '', price: '', imagePreviews: [], imageUrls: [], imageUploadFiles: [], selectedColors: [], customColor: '#000000', selectedSizes: [], customSize: '' }])} className="px-4 py-2 rounded-2xl bg-slate-900 text-white text-xs font-black">+ {t('business.products.addComplementaryItem', 'أضف منتج مكمل')}</button>
                  </div>
                  {(addonItems || []).length === 0 ? <div className="text-[12px] text-slate-500 font-bold text-right">{t('business.products.noComplementaryItems', 'لا توجد منتجات مكملة')}</div> : (
                    <div className="space-y-3">{(addonItems || []).map(a => (
                      <div key={a.id} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center justify-between flex-row-reverse gap-3">
                          <input value={a.name} onChange={e => setAddonItems(prev => prev.map(x => x.id === a.id ? { ...x, name: e.target.value } : x))} placeholder={t('business.products.complementaryItemName', 'اسم المنتج المكمل')} className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 font-bold text-right outline-none" />
                          <input value={String((a as any).price || '')} onChange={e => setAddonItems(prev => prev.map(x => x.id === a.id ? { ...x, price: e.target.value } : x))} placeholder={t('business.products.price', 'السعر')} inputMode="decimal" className="w-36 bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 font-bold text-right outline-none" />
                          <button type="button" onClick={() => { try { for (const p of (a.imagePreviews || [])) { if (p && String(p).startsWith('blob:')) URL.revokeObjectURL(String(p)); } } catch {} setAddonItems(prev => prev.filter(x => x.id !== a.id)); }} className="px-3 py-2 rounded-xl bg-red-50 text-red-600 font-black text-xs">{t('business.invoice.delete', 'حذف')}</button>
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-1">{t('business.products.complementaryItemImages', 'صور المنتج المكمل')}</label>
                          <div className="flex flex-wrap gap-2 justify-end">
                            {(Array.isArray(a.imagePreviews) ? a.imagePreviews : []).map((u, idx) => (
                              <div key={`${a.id}_${idx}`} className="relative">
                                <img src={u} alt="addon" className="w-16 h-16 rounded-2xl object-cover border border-slate-200" />
                                <button type="button" onClick={() => handleRemoveAddonImage(a.id, idx)} className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center"><X size={14} /></button>
                              </div>
                            ))}
                            <label className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-slate-900 text-white font-black text-xs cursor-pointer"><Upload size={14} />{t('business.products.addImages', 'أضف صور')}<input type="file" accept="image/*" multiple className="hidden" onChange={e => { const files = Array.from(e.target.files || []); if (files.length) handleAddonImagesChange(a.id, files); try { e.currentTarget.value = ''; } catch {} }} /></label>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-1">{t('business.dashboard.products.colors', 'الألوان')}</label>
                            <div className="bg-slate-50 rounded-[1.25rem] p-3 border border-slate-200">
                              <div className="flex flex-wrap gap-2 justify-end">{presetColors.map(c => { const isActive = (a.selectedColors || []).some(x => x.value === c.value); return <button key={c.value} type="button" onClick={() => setAddonItems(prev => (Array.isArray(prev) ? prev : []).map(x => { if (x.id !== a.id) return x; const exists = (x.selectedColors || []).some(t => t.value === c.value); return { ...x, selectedColors: exists ? (x.selectedColors || []).filter(t => t.value !== c.value) : [...(x.selectedColors || []), c] }; }))} className={`flex items-center gap-2 px-3 py-2 rounded-full border font-black text-xs transition-all ${isActive ? 'bg-white border-[#00E5FF]/30' : 'bg-white/70 border-slate-200 hover:bg-white'}`}><span className="w-4 h-4 rounded-full border border-slate-200" style={{ background: c.value }} />{c.name}</button>; })}</div>
                              <div className="flex items-center justify-between mt-3 gap-3 flex-row-reverse">
                                <button type="button" onClick={() => setAddonItems(prev => (Array.isArray(prev) ? prev : []).map(x => { if (x.id !== a.id) return x; const hex = String(x.customColor || '').trim(); if (!hex) return x; const exists = (x.selectedColors || []).some(t => t.value === hex); if (exists) return x; return { ...x, selectedColors: [...(x.selectedColors || []), { name: hex.toUpperCase(), value: hex }] }; }))} className="px-4 py-2 rounded-xl font-black text-xs bg-slate-900 text-white">{t('business.products.addColor', 'أضف لون')}</button>
                                <div className="flex items-center gap-3"><input type="color" value={String(a.customColor || '#000000')} onChange={e => setAddonItems(prev => prev.map(x => x.id === a.id ? { ...x, customColor: e.target.value } : x))} className="w-12 h-10 rounded-xl border border-slate-200 bg-white" /><div className="text-xs font-black text-slate-500">{t('business.products.customColor', 'لون مخصص')}</div></div>
                              </div>
                              {(a.selectedColors || []).length > 0 && <div className="mt-3 flex flex-wrap gap-2 justify-end">{(a.selectedColors || []).map(c => <span key={c.value} className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white border border-slate-200 font-black text-xs"><span className="w-4 h-4 rounded-full border border-slate-200" style={{ background: c.value }} />{c.name}<button type="button" onClick={() => setAddonItems(prev => prev.map(x => x.id === a.id ? { ...x, selectedColors: (x.selectedColors || []).filter(t => t.value !== c.value) } : x))} className="p-1 rounded-full hover:bg-slate-50"><X size={14} /></button></span>)}</div>}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-1">{t('business.dashboard.products.sizes', 'المقاسات')}</label>
                            <div className="bg-slate-50 rounded-[1.25rem] p-3 border border-slate-200">
                              <div className="flex flex-wrap gap-2 justify-end">{presetSizes.map(s => { const isActive = (a.selectedSizes || []).some(x => String(x).trim() === String(s).trim()); return <button key={s} type="button" onClick={() => setAddonItems(prev => (Array.isArray(prev) ? prev : []).map(x => { if (x.id !== a.id) return x; const label = String(s || '').trim(); const exists = (x.selectedSizes || []).some(t => String(t).trim() === label); return { ...x, selectedSizes: exists ? (x.selectedSizes || []).filter(t => String(t).trim() !== label) : [...(x.selectedSizes || []), label] }; }))} className={`px-4 py-2 rounded-full border font-black text-xs transition-all ${isActive ? 'bg-white border-[#00E5FF]/30' : 'bg-white/70 border-slate-200 hover:bg-white'}`}>{s}</button>; })}</div>
                              <div className="flex flex-col md:flex-row-reverse md:items-center md:justify-between mt-3 gap-3">
                                <button type="button" onClick={() => setAddonItems(prev => (Array.isArray(prev) ? prev : []).map(x => { if (x.id !== a.id) return x; const v = String(x.customSize || '').trim(); if (!v) return x; const exists = (x.selectedSizes || []).some(t => String(t).trim() === v); if (exists) return { ...x, customSize: '' }; return { ...x, selectedSizes: [...(x.selectedSizes || []), v], customSize: '' }; }))} className="w-full md:w-auto px-4 py-3 md:py-2 rounded-xl font-black text-xs bg-slate-900 text-white">{t('business.products.addSize', 'أضف مقاس')}</button>
                                <input placeholder={t('business.products.sizePlaceholder', 'مقاس مخصص')} value={String(a.customSize || '')} onChange={e => setAddonItems(prev => prev.map(x => x.id === a.id ? { ...x, customSize: e.target.value } : x))} className="w-full md:flex-1 bg-white border border-slate-200 rounded-xl py-3 md:py-2 px-4 font-bold text-right outline-none" />
                              </div>
                              {(a.selectedSizes || []).length > 0 && <div className="mt-3 flex flex-wrap gap-2 justify-end">{(a.selectedSizes || []).map(s => <span key={s} className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white border border-slate-200 font-black text-xs"><span>{String(s)}</span><button type="button" onClick={() => setAddonItems(prev => prev.map(x => x.id === a.id ? { ...x, selectedSizes: (x.selectedSizes || []).filter(t => String(t).trim() !== String(s).trim()) } : x))} className="p-1 rounded-full hover:bg-slate-50"><X size={14} /></button></span>)}</div>}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}</div>
                  )}
                </div>
              )}
            </>
          )}
          <FormFooter loading={loading} isCompressing={isCompressing} compressionProgress={compressionProgress} submitLabel={t('business.products.confirmUpdateItem', 'تأكيد تعديل العنصر')} processingLabel={t('business.products.updatingItem', 'جاري تعديل العنصر')} />
        </form>
      </MotionDiv>
    </div>
  );
};

export default EditProductModal;
