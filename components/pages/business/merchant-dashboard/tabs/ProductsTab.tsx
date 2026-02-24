import React, { Suspense, lazy, useEffect, useState, memo } from 'react';
import { Plus, Trash2, Edit, Eye, EyeOff, Loader2, ShoppingCart } from 'lucide-react';
import { Product } from '@/types';
import { ApiService } from '@/services/api.service';
import { useToast } from '@/components/common/feedback/Toaster';
import SmartImage from '@/components/common/ui/SmartImage';
import { compressImage } from '@/lib/image-utils';
import { backendPost } from '@/services/api/httpClient';

const EditProductModal = lazy(() => import('../modals/EditProductModal'));
const ProductEditorLegacyModal = lazy(() => import('../modals/ProductEditorLegacyModal'));

const ProductRow = memo(({ 
  product, 
  togglingId, 
  handleEdit, 
  handleToggleActive, 
  onDelete, 
  setPreviewImageSrc 
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
            <SmartImage src={imgSrc} className="w-full h-full" imgClassName="object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300">
              <Plus size={12} />
            </div>
          )}
        </button>
      </div>
      <div className="col-span-4 pr-4">
        <div className="font-black text-slate-900 text-xs sm:text-sm truncate">{product.name}</div>
        <div className="text-[10px] font-bold text-slate-400">{product.category?.name || 'بدون تصنيف'}</div>
      </div>
      <div className="col-span-2 font-black text-slate-900 text-xs sm:text-sm">
        ج.م {Number(product.price || 0).toLocaleString()}
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
  products: Product[];
  onAdd: () => void;
  onDelete: (id: string) => void;
  onUpdate: (product: Product) => void;
  shopId: string;
  shopCategory?: string;
  shop?: any;
};

const ProductsTab: React.FC<Props> = ({ products, onAdd, onDelete, onUpdate, shopId, shopCategory, shop }) => {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [togglingId, setTogglingId] = useState<string>('');
  const [previewImageSrc, setPreviewImageSrc] = useState<string>('');
  const [imageMapEditorOpen, setImageMapEditorOpen] = useState(false);
  const [imageMapProductsOpen, setImageMapProductsOpen] = useState(false);
  const [imageMapLoading, setImageMapLoading] = useState(false);
  const [imageMapSyncing, setImageMapSyncing] = useState(false);
  const [imageMapError, setImageMapError] = useState<string>('');
  const [activeMap, setActiveMap] = useState<any | null>(null);
  const [imageMapLinkedProductIds, setImageMapLinkedProductIds] = useState<Set<string>>(new Set());
  const [imageMapLinksReady, setImageMapLinksReady] = useState(false);
  const [imageMapRows, setImageMapRows] = useState<
    Array<{ key: string; name: string; price: number; stock: number; productId: string | null; linked: boolean; colors?: string[]; sizes?: any[] }>
  >([]);

  const { addToast } = useToast();

  const [addonItems, setAddonItems] = useState<
    Array<{
      id: string;
      name: string;
      imagePreview: string | null;
      imageUrl: string | null;
      imageUploadFile: File | null;
      hasSmall: boolean;
      hasMedium: boolean;
      hasLarge: boolean;
      priceSmall: string;
      priceMedium: string;
      priceLarge: string;
    }>
  >([]);
  const [savingAddons, setSavingAddons] = useState(false);

  const isRestaurant = String(shopCategory || '').toUpperCase() === 'RESTAURANT';
  const canUseImageMapEditor = !isRestaurant && Boolean(String(shopId || '').trim());
  const pageTitle = isRestaurant ? 'المنيو' : 'المخزون والمنتجات';

  const normalizeNumber = (v: any, fallback: number) => {
    const n = typeof v === 'number' ? v : v == null ? NaN : Number(v);
    return Number.isFinite(n) ? n : fallback;
  };

  const normalizeText = (v: any) => String(v ?? '').trim();

  const normalizeColorLabel = (c: any) => {
    if (typeof c === 'string') return normalizeText(c);
    if (!c || typeof c !== 'object') return '';
    const name = normalizeText((c as any)?.name || (c as any)?.label || (c as any)?.title);
    const value = normalizeText((c as any)?.value || (c as any)?.colorValue || (c as any)?.hex);
    return name || value;
  };

  const buildRowsFromMap = (map: any, productsIndex?: Map<string, any>) => {
    const hs = Array.isArray(map?.hotspots) ? map.hotspots : [];
    const rows: Array<{ key: string; name: string; price: number; stock: number; productId: string | null; linked: boolean; colors?: string[]; sizes?: any[] }> = [];
    for (const h of hs) {
      const name = normalizeText(h?.label || h?.product?.name || h?.name);
      if (!name) continue;
      const productId = normalizeText(h?.productId ?? h?.product_id ?? h?.product?.id) || null;
      const override = h?.priceOverride ?? h?.price_override;
      const price = normalizeNumber(override, normalizeNumber(h?.product?.price, 0));
      const stock = (() => {
        const p = productId ? productsIndex?.get(productId) : null;
        const s = p?.stock ?? h?.product?.stock;
        const n = normalizeNumber(s, 0);
        return n < 0 ? 0 : Math.floor(n);
      })();

      const linkedProduct = productId ? productsIndex?.get(productId) : null;
      const rawColors = linkedProduct?.colors ?? h?.product?.colors;
      const rawSizes = linkedProduct?.sizes ?? h?.product?.sizes;
      const colors = Array.isArray(rawColors) ? rawColors.map((c: any) => normalizeColorLabel(c)).filter(Boolean) : undefined;
      const sizes = Array.isArray(rawSizes) ? rawSizes : undefined;
      rows.push({
        key: normalizeText(h?.id) || `${name}:${rows.length}`,
        name,
        price,
        stock,
        productId,
        linked: Boolean(productId),
        colors: colors && colors.length ? colors : undefined,
        sizes: sizes && sizes.length ? sizes : undefined,
      });
    }

    rows.sort((a, b) => a.name.localeCompare(b.name, 'ar'));
    return rows;
  };

  const collectLinkedProductIdsFromMaps = (maps: any[]) => {
    const ids = new Set<string>();
    (Array.isArray(maps) ? maps : []).forEach((m: any) => {
      const hs = Array.isArray(m?.hotspots) ? m.hotspots : [];
      hs.forEach((h: any) => {
        const productId = normalizeText(h?.productId ?? h?.product_id ?? h?.product?.id);
        if (productId) ids.add(productId);
      });
    });
    return ids;
  };

  const updateRowStock = (key: string, value: any) => {
    const raw = typeof value === 'number' ? value : value == null ? NaN : Number(value);
    const nextStock = Number.isFinite(raw) ? Math.max(0, Math.floor(raw)) : 0;
    setImageMapRows((prev) => (Array.isArray(prev) ? prev.map((r) => (r.key === key ? { ...r, stock: nextStock } : r)) : prev));
  };

  const loadImageMapProducts = async () => {
    if (!shopId) return;
    setImageMapError('');
    setImageMapLoading(true);
    try {
      const [maps, manageProducts] = await Promise.all([
        ApiService.listShopImageMapsForManage(shopId),
        ApiService.getProductsForManage(shopId, { page: 1, limit: 2000 }),
      ]);

      const list = Array.isArray(maps) ? maps : [];
      setImageMapLinkedProductIds(collectLinkedProductIdsFromMaps(list));
      const current = list.find((m: any) => Boolean(m?.isActive)) || list[0] || null;
      setActiveMap(current);

      const idx = new Map<string, any>();
      (Array.isArray(manageProducts) ? manageProducts : []).forEach((p: any) => {
        const id = normalizeText(p?.id);
        if (id) idx.set(id, p);
      });

      const rows = buildRowsFromMap(current, idx);
      setImageMapRows(rows);
      if (!current) {
        setImageMapError('لا يوجد خريطة صورة مفعلة لهذا المتجر');
      } else if (!Array.isArray((current as any)?.hotspots)) {
        setImageMapError('تعذر تحميل نقاط المنتجات من خريطة الصورة');
      } else if (rows.length === 0) {
        setImageMapError('لا يوجد منتجات مضافة على الصورة');
      }
    } catch (e: any) {
      setImageMapError(String(e?.message || 'فشل تحميل منتجات الصورة'));
    } finally {
      setImageMapLoading(false);
    }
  };

  useEffect(() => {
    if (!shopId) return;
    if (!canUseImageMapEditor) return;
    let mounted = true;
    setImageMapLinksReady(false);
    (async () => {
      try {
        const maps = await ApiService.listShopImageMapsForManage(shopId);
        if (!mounted) return;
        const list = Array.isArray(maps) ? maps : [];
        setImageMapLinkedProductIds(collectLinkedProductIdsFromMaps(list));
      } catch {
        if (!mounted) return;
        setImageMapLinkedProductIds(new Set());
      } finally {
        if (!mounted) return;
        setImageMapLinksReady(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [shopId, canUseImageMapEditor]);

  const syncImageMapProducts = async () => {
    if (!shopId) return;
    const mapId = normalizeText(activeMap?.id);
    if (!mapId) {
      setImageMapError('لا يوجد خريطة صورة مفعلة');
      return;
    }

    const rawRows = Array.isArray(imageMapRows) ? imageMapRows : [];
    const items = rawRows
      .map((r) => ({
        name: normalizeText(r?.name),
        price: normalizeNumber(r?.price, NaN),
        stock: normalizeNumber(r?.stock, 0),
        category: '__IMAGE_MAP__',
        description: null,
      }))
      .filter((r) => r.name && Number.isFinite(r.price) && r.price >= 0);

    if (items.length === 0) {
      setImageMapError('لا يوجد منتجات صالحة للاعتماد');
      return;
    }

    setImageMapSyncing(true);
    setImageMapError('');
    try {
      const res = await backendPost<any>(`/api/v1/products/manage/by-shop/${encodeURIComponent(String(shopId))}/import-drafts`, {
        items,
      });

      const created = Array.isArray(res?.created) ? res.created : [];
      const updated = Array.isArray(res?.updated) ? res.updated : [];
      const nameToId = new Map<string, string>();
      for (const p of [...created, ...updated]) {
        const id = normalizeText(p?.id);
        const name = normalizeText(p?.name);
        if (id && name) nameToId.set(name, id);
      }

      const currentMap = activeMap;
      const currentHotspots = Array.isArray(currentMap?.hotspots) ? currentMap.hotspots : [];
      const currentSections = Array.isArray(currentMap?.sections) ? currentMap.sections : [];
      if (currentHotspots.length === 0) {
        throw new Error('لا يوجد نقاط لحفظها');
      }

      const nextHotspots = currentHotspots.map((h: any) => {
        const label = normalizeText(h?.label || h?.product?.name || h?.name);
        const mapped = label ? nameToId.get(label) : undefined;
        const prevPid = normalizeText(h?.productId ?? h?.product_id ?? h?.product?.id) || null;
        const productId = mapped || prevPid;
        const override = h?.priceOverride ?? h?.price_override;
        const priceOverride = typeof override === 'number' ? override : override == null ? null : Number(override);
        return {
          x: normalizeNumber(h?.x, 0),
          y: normalizeNumber(h?.y, 0),
          label: label || null,
          sortOrder: typeof h?.sortOrder === 'number' ? h.sortOrder : (typeof h?.sort_order === 'number' ? h.sort_order : 0),
          sectionId: normalizeText(h?.sectionId ?? h?.section_id) || null,
          productId: productId || null,
          priceOverride: Number.isFinite(priceOverride) ? priceOverride : null,
          width: typeof h?.width === 'number' ? h.width : (typeof h?.width === 'string' ? Number(h.width) : null),
          height: typeof h?.height === 'number' ? h.height : (typeof h?.height === 'string' ? Number(h.height) : null),
          aiMeta: h?.aiMeta ?? h?.ai_meta ?? null,
        };
      });

      const nextSections = currentSections.map((s: any, idx: number) => ({
        name: normalizeText(s?.name) || `قسم ${idx + 1}`,
        sortOrder: typeof s?.sortOrder === 'number' ? s.sortOrder : (typeof s?.sort_order === 'number' ? s.sort_order : idx),
        imageUrl: normalizeText(s?.imageUrl ?? s?.image_url) || null,
      }));

      await ApiService.saveShopImageMapLayout(String(shopId), String(mapId), {
        imageUrl: normalizeText(currentMap?.imageUrl ?? currentMap?.image_url) || '',
        title: normalizeText(currentMap?.title) || 'خريطة الصورة',
        sections: nextSections,
        hotspots: nextHotspots,
      });

      addToast('تم اعتماد وربط منتجات الصورة', 'success');
      await loadImageMapProducts();
    } catch (e: any) {
      setImageMapError(String(e?.message || 'فشل اعتماد منتجات الصورة'));
      addToast(String(e?.message || 'فشل اعتماد منتجات الصورة'), 'error');
    } finally {
      setImageMapSyncing(false);
    }
  };

  useEffect(() => {
    if (!isRestaurant) return;
    const raw = (shop as any)?.addons;
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
        const hasSize = (vid: string) => {
          const v = vars.find((x: any) => String(x?.id || '').trim() === vid);
          if (!v) return false;
          const p = typeof v?.price === 'number' ? v.price : Number(v?.price || 0);
          return Number.isFinite(p) && p > 0;
        };
        const img = typeof o?.imageUrl === 'string' ? String(o.imageUrl) : (typeof o?.image_url === 'string' ? String(o.image_url) : '');
        return {
          id: optId,
          name: String(o?.name || o?.title || '').trim(),
          imagePreview: img || null,
          imageUrl: img || null,
          imageUploadFile: null,
          hasSmall: hasSize('small'),
          hasMedium: hasSize('medium'),
          hasLarge: hasSize('large'),
          priceSmall: getPrice('small'),
          priceMedium: getPrice('medium'),
          priceLarge: getPrice('large'),
        };
      })
      .filter(Boolean);
    setAddonItems(mapped as any);
  }, [isRestaurant, shop]);

  const parseNumberInput = (value: any) => {
    if (typeof value === 'number') return value;
    const raw = String(value ?? '').trim();
    if (!raw) return NaN;
    const cleaned = raw
      .replace(/[٠-٩۰-۹]/g, (d) => {
        const map: Record<string, string> = {
          '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4', '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
          '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4', '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9',
        };
        return map[d] || d;
      })
      .replace(/[٬،]/g, '')
      .replace(/[٫]/g, '.')
      .replace(/\s+/g, '');
    const n = Number(cleaned);
    return n;
  };

  const saveShopAddons = async () => {
    if (!isRestaurant) return;
    setSavingAddons(true);
    try {
      const uploadedAddonOptions = await Promise.all(
        (addonItems || []).map(async (a) => {
          const optId = String(a?.id || '').trim() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
          const optName = String(a?.name || '').trim();
          if (!optName) return null;

          let imageUrl: string | null = a?.imageUrl ? String(a.imageUrl) : null;
          const file = a?.imageUploadFile;
          if (file) {
            // Compress addon image
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
          if ((a as any)?.hasSmall) {
            if (!Number.isFinite(pSmall) || pSmall <= 0) {
              throw new Error(`سعر غير صحيح للإضافة: ${optName} (صغير)`);
            }
            variants.push({ id: 'small', label: 'صغير', price: pSmall });
          }
          if ((a as any)?.hasMedium) {
            if (!Number.isFinite(pMed) || pMed <= 0) {
              throw new Error(`سعر غير صحيح للإضافة: ${optName} (وسط)`);
            }
            variants.push({ id: 'medium', label: 'وسط', price: pMed });
          }
          if ((a as any)?.hasLarge) {
            if (!Number.isFinite(pLarge) || pLarge <= 0) {
              throw new Error(`سعر غير صحيح للإضافة: ${optName} (كبير)`);
            }
            variants.push({ id: 'large', label: 'كبير', price: pLarge });
          }

          if (variants.length === 0) {
            throw new Error(`اختر مقاس واحد على الأقل للإضافة: ${optName}`);
          }

          return {
            id: optId,
            name: optName,
            imageUrl,
            variants,
          };
        }),
      );

      const options = uploadedAddonOptions.filter(Boolean);
      const addons = options.length > 0
        ? [
            {
              id: 'addons',
              name: 'منتجات إضافية',
              label: 'منتجات إضافية',
              title: 'منتجات إضافية',
              options,
            },
          ]
        : [];

      await ApiService.updateMyShop({ addons });
      addToast('تم حفظ إضافات المطعم', 'success');
    } catch (e: any) {
      try {
        // eslint-disable-next-line no-console
        console.error('Save shop addons failed', {
          message: e?.message,
          status: e?.status,
          path: e?.path,
          data: e?.data,
        });
      } catch {
      }
      const backendMsg = typeof e?.data?.message === 'string' ? e.data.message : undefined;
      const msg = backendMsg || (e?.message ? String(e.message) : 'فشل حفظ الإضافات');
      addToast(msg, 'error');
    } finally {
      setSavingAddons(false);
    }
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setEditModalOpen(false);
    setSelectedProduct(null);
  };

  const handleProductUpdate = (updatedProduct: Product) => {
    onUpdate(updatedProduct);
    handleEditModalClose();
  };

  const handleToggleActive = async (product: Product) => {
    const current = typeof (product as any)?.isActive === 'boolean' ? (product as any).isActive : true;
    const next = !current;
    setTogglingId(String(product.id));
    try {
      const updated = await ApiService.updateProduct(String(product.id), { isActive: next });
      onUpdate(updated);
    } catch {
    } finally {
      setTogglingId('');
    }
  };

  const isImageMapProduct = (p: any) => {
    const raw = p?.category;
    const cat =
      typeof raw === 'string'
        ? raw
        : typeof raw?.name === 'string'
          ? raw.name
          : typeof raw?.slug === 'string'
            ? raw.slug
            : '';
    const normalized = String(cat || '').trim().toUpperCase();
    return normalized === '__IMAGE_MAP__' || normalized.includes('IMAGE_MAP');
  };

  const filteredProducts = (() => {
    const list = Array.isArray(products) ? products : [];

    // When image-map feature is enabled, wait for linked-IDs to load to avoid mixing/duplicating
    // image-map-linked products in the normal products list.
    if (canUseImageMapEditor && !imageMapLinksReady) {
      return [] as any[];
    }

    return list.filter((p: any) => {
      if (!p) return false;
      if (isImageMapProduct(p)) return false;
      const id = normalizeText(p?.id);
      if (id && imageMapLinkedProductIds.has(id)) return false;
      return true;
    });
  })();

  return (
    <>
      <div className="bg-white p-4 sm:p-8 md:p-12 rounded-[2.5rem] sm:rounded-[3.5rem] border border-slate-100 shadow-sm">
        <div className="flex items-start sm:items-center justify-between mb-6 sm:mb-12 flex-row-reverse gap-4">
          <h3 className="text-2xl sm:text-3xl font-black">{pageTitle}</h3>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
            {canUseImageMapEditor && (
              <button
                onClick={() => setImageMapEditorOpen(true)}
                className="px-4 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 bg-[#00E5FF] text-black rounded-[1.5rem] sm:rounded-[2rem] font-black text-xs sm:text-sm flex items-center justify-center gap-2 sm:gap-3 shadow-2xl hover:scale-105 transition-all"
                type="button"
              >
                تحرير المنتجات بالصورة
              </button>
            )}
            {canUseImageMapEditor && (
              <button
                onClick={async () => {
                  setImageMapProductsOpen(true);
                  await loadImageMapProducts();
                }}
                className="px-4 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 bg-slate-100 text-slate-900 rounded-[1.5rem] sm:rounded-[2rem] font-black text-xs sm:text-sm flex items-center justify-center gap-2 sm:gap-3 shadow-sm hover:bg-slate-200 transition-all"
                type="button"
              >
                قائمة منتجات الصورة
              </button>
            )}
            <button
              onClick={onAdd}
              className="px-4 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 bg-slate-900 text-white rounded-[1.5rem] sm:rounded-[2rem] font-black text-xs sm:text-sm flex items-center justify-center gap-2 sm:gap-3 shadow-2xl hover:bg-black transition-all"
              type="button"
            >
              <Plus size={18} className="sm:w-5 sm:h-5 md:w-6 md:h-6" /> إضافة صنف جديد
            </button>
          </div>
        </div>

        {isRestaurant && (
          <div className="mb-12 p-6 md:p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 space-y-6">
            <div className="flex items-center justify-between flex-row-reverse">
              <div className="text-right">
                <h4 className="text-xl font-black">إضافات المطعم</h4>
                <p className="text-xs font-bold text-slate-400">تتضاف مرة واحدة وتظهر تحت كل المنتجات</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setAddonItems((prev) => [
                      ...prev,
                      {
                        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
                        name: '',
                        imagePreview: null,
                        imageUrl: null,
                        imageUploadFile: null,
                        hasSmall: true,
                        hasMedium: true,
                        hasLarge: true,
                        priceSmall: '',
                        priceMedium: '',
                        priceLarge: '',
                      },
                    ]);
                  }}
                  className="px-4 py-2 rounded-xl font-black text-xs bg-slate-900 text-white"
                >
                  + إضافة
                </button>
                <button
                  type="button"
                  onClick={saveShopAddons}
                  className="px-4 py-2 rounded-xl font-black text-xs bg-[#00E5FF] text-black"
                  disabled={savingAddons}
                >
                  {savingAddons ? <Loader2 size={16} className="animate-spin" /> : 'حفظ'}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {addonItems.map((a, idx) => (
                <div key={a.id} className="p-4 rounded-3xl bg-white border border-slate-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-black">إضافة #{idx + 1}</p>
                    <button
                      type="button"
                      onClick={() => {
                        try {
                          if (a.imagePreview && a.imagePreview.startsWith('blob:')) URL.revokeObjectURL(a.imagePreview);
                        } catch {
                        }
                        setAddonItems((prev) => prev.filter((x) => x.id !== a.id));
                      }}
                      className="text-slate-400 hover:text-red-500"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-4 mb-2">اسم الإضافة</label>
                      <input
                        value={a.name}
                        onChange={(e) => {
                          const v = e.target.value;
                          setAddonItems((prev) => prev.map((x) => (x.id === a.id ? { ...x, name: v } : x)));
                        }}
                        placeholder="مثلاً: بطاطس"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 font-bold text-right outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-4 mb-2">صورة صغيرة</label>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-white border border-slate-200">
                          {a.imagePreview ? (
                            <SmartImage src={a.imagePreview} className="w-full h-full" imgClassName="object-cover" loading="lazy" />
                          ) : null}
                        </div>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/avif"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const mime = String(file.type || '').toLowerCase().trim();
                            const allowed = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
                            if (!mime || !allowed.has(mime)) {
                              addToast('نوع الصورة غير مدعوم. استخدم JPG أو PNG أو WEBP أو AVIF', 'error');
                              return;
                            }
                            setAddonItems((prev) =>
                              prev.map((x) => {
                                if (x.id !== a.id) return x;
                                try {
                                  if (x.imagePreview && x.imagePreview.startsWith('blob:')) URL.revokeObjectURL(x.imagePreview);
                                } catch {
                                }
                                return { ...x, imageUploadFile: file, imagePreview: URL.createObjectURL(file) };
                              }),
                            );
                          }}
                          className="block w-full text-xs font-bold"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-4 mb-2">صغير (ج.م)</label>
                        <button
                          type="button"
                          onClick={() => {
                            setAddonItems((prev) =>
                              prev.map((x) =>
                                x.id === a.id
                                  ? { ...x, hasSmall: !x.hasSmall, priceSmall: !x.hasSmall ? x.priceSmall : '' }
                                  : x,
                              ),
                            );
                          }}
                          className="text-[10px] font-black px-2 py-1 rounded-lg bg-white border border-slate-200"
                        >
                          {a.hasSmall ? 'لا يوجد' : 'موجود'}
                        </button>
                      </div>
                      <input
                        type="number"
                        disabled={!a.hasSmall}
                        value={a.hasSmall ? a.priceSmall : ''}
                        onChange={(e) => setAddonItems((prev) => prev.map((x) => (x.id === a.id ? { ...x, priceSmall: e.target.value } : x)))}
                        placeholder={a.hasSmall ? '' : 'لا يوجد'}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 font-bold text-right outline-none disabled:opacity-60"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-4 mb-2">وسط (ج.م)</label>
                        <button
                          type="button"
                          onClick={() => {
                            setAddonItems((prev) =>
                              prev.map((x) =>
                                x.id === a.id
                                  ? { ...x, hasMedium: !x.hasMedium, priceMedium: !x.hasMedium ? x.priceMedium : '' }
                                  : x,
                              ),
                            );
                          }}
                          className="text-[10px] font-black px-2 py-1 rounded-lg bg-white border border-slate-200"
                        >
                          {a.hasMedium ? 'لا يوجد' : 'موجود'}
                        </button>
                      </div>
                      <input
                        type="number"
                        disabled={!a.hasMedium}
                        value={a.hasMedium ? a.priceMedium : ''}
                        onChange={(e) => setAddonItems((prev) => prev.map((x) => (x.id === a.id ? { ...x, priceMedium: e.target.value } : x)))}
                        placeholder={a.hasMedium ? '' : 'لا يوجد'}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 font-bold text-right outline-none disabled:opacity-60"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-4 mb-2">كبير (ج.م)</label>
                        <button
                          type="button"
                          onClick={() => {
                            setAddonItems((prev) =>
                              prev.map((x) =>
                                x.id === a.id
                                  ? { ...x, hasLarge: !x.hasLarge, priceLarge: !x.hasLarge ? x.priceLarge : '' }
                                  : x,
                              ),
                            );
                          }}
                          className="text-[10px] font-black px-2 py-1 rounded-lg bg-white border border-slate-200"
                        >
                          {a.hasLarge ? 'لا يوجد' : 'موجود'}
                        </button>
                      </div>
                      <input
                        type="number"
                        disabled={!a.hasLarge}
                        value={a.hasLarge ? a.priceLarge : ''}
                        onChange={(e) => setAddonItems((prev) => prev.map((x) => (x.id === a.id ? { ...x, priceLarge: e.target.value } : x)))}
                        placeholder={a.hasLarge ? '' : 'لا يوجد'}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 font-bold text-right outline-none disabled:opacity-60"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-3xl border border-slate-100 overflow-hidden" style={{ contentVisibility: 'auto', containIntrinsicSize: '0 500px' }}>
          <div className="overflow-x-auto touch-pan-x">
            <div className="min-w-[720px]">
              <div className="grid grid-cols-12 bg-slate-50 px-4 py-3 text-[11px] font-black text-slate-500">
                <div className="col-span-2 text-right">الصورة</div>
                <div className="col-span-4 text-right">الاسم</div>
                <div className="col-span-2 text-right">السعر</div>
                <div className="col-span-2 text-right">المخزون</div>
                <div className="col-span-2 text-right">تحكم</div>
              </div>

              <div className="divide-y divide-slate-100">
                {filteredProducts.map((p) => (
                  <ProductRow
                    key={p.id}
                    product={p}
                    togglingId={togglingId}
                    handleEdit={handleEdit}
                    handleToggleActive={handleToggleActive}
                    onDelete={onDelete}
                    setPreviewImageSrc={setPreviewImageSrc}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {previewImageSrc ? (
        <div className="fixed inset-0 z-[650]">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setPreviewImageSrc('')}
          />
          <div className="absolute inset-0 flex items-center justify-center p-4" dir="rtl">
            <div className="w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between flex-row-reverse">
                <div className="font-black text-sm">صورة المنتج</div>
                <button
                  type="button"
                  onClick={() => setPreviewImageSrc('')}
                  className="px-4 py-2 rounded-2xl bg-slate-100 font-black text-sm"
                >
                  إغلاق
                </button>
              </div>
              <div className="p-4 bg-slate-50">
                <img
                  src={previewImageSrc}
                  alt=""
                  className="w-full max-h-[75vh] object-contain rounded-2xl bg-white"
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {imageMapProductsOpen && (
        <div className="fixed inset-0 z-[600]">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => {
              setImageMapProductsOpen(false);
              setImageMapError('');
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-3xl bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden" dir="rtl">
              <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between flex-row-reverse">
                <div className="text-right">
                  <h3 className="text-xl md:text-2xl font-black">قائمة منتجات الصورة</h3>
                  <p className="text-xs font-bold text-slate-400 mt-1">المنتجات الموجودة على خريطة الصورة (للاستخدام في الشراء فقط)</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setImageMapProductsOpen(false);
                    setImageMapError('');
                  }}
                  className="px-4 py-2 rounded-2xl bg-slate-100 font-black text-sm"
                >
                  إغلاق
                </button>
              </div>

              <div className="p-6 md:p-8 space-y-4 max-h-[70vh] overflow-auto">
                <div className="flex items-center gap-3 justify-between flex-row-reverse">
                  <button
                    type="button"
                    onClick={loadImageMapProducts}
                    disabled={imageMapLoading || imageMapSyncing}
                    className="px-4 py-2 rounded-2xl bg-slate-100 font-black text-xs hover:bg-slate-200 disabled:opacity-50"
                  >
                    {imageMapLoading ? <Loader2 size={16} className="animate-spin" /> : 'تحديث'}
                  </button>
                  <button
                    type="button"
                    onClick={syncImageMapProducts}
                    disabled={imageMapLoading || imageMapSyncing}
                    className="px-5 py-3 rounded-2xl bg-[#00E5FF] text-black font-black text-sm disabled:opacity-50"
                  >
                    {imageMapSyncing ? <Loader2 size={18} className="animate-spin" /> : 'اعتماد/مزامنة المنتجات'}
                  </button>
                </div>

                {imageMapError && (
                  <div className="p-4 rounded-3xl bg-red-50 border border-red-100 text-red-700 text-sm font-bold text-right">
                    {imageMapError}
                  </div>
                )}

                <div className="rounded-3xl border border-slate-100 overflow-hidden">
                  <div className="grid grid-cols-12 bg-slate-50 px-4 py-3 text-[11px] font-black text-slate-500">
                    <div className="col-span-5 text-right">الاسم</div>
                    <div className="col-span-3 text-right">السعر</div>
                    <div className="col-span-2 text-right">المخزون</div>
                    <div className="col-span-2 text-right">الربط</div>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {(imageMapRows || []).map((r) => (
                      <div key={r.key} className="grid grid-cols-12 px-4 py-3 text-sm items-center">
                        <div className="col-span-5 text-right">
                          <div className="font-black text-slate-900 truncate">{r.name}</div>
                          {(Array.isArray(r.colors) && r.colors.length > 0) || (Array.isArray(r.sizes) && r.sizes.length > 0) ? (
                            <div className="mt-1 space-y-1">
                              {Array.isArray(r.colors) && r.colors.length > 0 && (
                                <div className="text-[10px] font-bold text-slate-500">
                                  الألوان: {r.colors.join(' - ')}
                                </div>
                              )}
                              {Array.isArray(r.sizes) && r.sizes.length > 0 && (
                                <div className="text-[10px] font-bold text-slate-500">
                                  المقاسات: {(r.sizes as any[])
                                    .map((s: any) => {
                                      const label = String(s?.label || '').trim();
                                      const value = label === 'custom' ? String(s?.customValue ?? '') : label;
                                      const price = typeof s?.price === 'number' ? s.price : Number(s?.price || 0);
                                      return value ? `${value} (${Number.isFinite(price) ? price : 0}ج)` : '';
                                    })
                                    .filter(Boolean)
                                    .join(' - ')}
                                </div>
                              )}
                            </div>
                          ) : null}
                        </div>
                        <div className="col-span-3 font-black text-right text-slate-700">ج.م {r.price}</div>
                        <div className="col-span-2 text-right">
                          <input
                            type="number"
                            inputMode="numeric"
                            min={0}
                            value={Number.isFinite(Number(r.stock)) ? String(Math.max(0, Math.floor(Number(r.stock)))) : '0'}
                            onChange={(e) => updateRowStock(r.key, (e.target as any).value)}
                            className="w-full max-w-[120px] bg-white border border-slate-200 rounded-xl py-2 px-3 font-black text-right outline-none focus:border-[#00E5FF]/60"
                          />
                        </div>
                        <div className="col-span-2 text-right">
                          <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black ${r.linked ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                            {r.linked ? 'مربوط' : 'غير مربوط'}
                          </span>
                        </div>
                      </div>
                    ))}
                    {(imageMapRows || []).length === 0 && !imageMapLoading && !imageMapError && (
                      <div className="p-6 text-center text-slate-400 font-black">لا يوجد منتجات</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Suspense fallback={null}>
        <EditProductModal
          isOpen={editModalOpen}
          onClose={handleEditModalClose}
          shopId={shopId}
          shopCategory={shopCategory}
          product={selectedProduct}
          onUpdate={handleProductUpdate}
        />
      </Suspense>

      <Suspense fallback={null}>
        <ProductEditorLegacyModal open={imageMapEditorOpen} onClose={() => setImageMapEditorOpen(false)} shopId={shopId} />
      </Suspense>
    </>
  );
};

export default ProductsTab;
