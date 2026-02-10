import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Loader2, Plus, Save, X } from 'lucide-react';
import { ApiService } from '@/services/api.service';
import type { ShopImageMapHotspot } from '../types';
import { resolveBackendMediaUrl } from '../utils';
import { activateShopImageMap, analyzeShopImageMap, createShopImageMap, listShopImageMapsForManage, saveShopImageMapLayout } from '../api';

type Props = {
  open: boolean;
  onClose: () => void;
  shopId: string;
  products: any[];
};

type EditorHotspot = {
  id: string;
  x: number;
  y: number;
  label?: string | null;
  productId?: string | null;
  priceOverride?: number | null;
};

function normalizeHotspotsFromMap(map: any): EditorHotspot[] {
  const hs = Array.isArray(map?.hotspots) ? map.hotspots : [];
  return hs
    .map((h: any) => ({
      id: String(h?.id || ''),
      x: Number(h?.x || 0),
      y: Number(h?.y || 0),
      label: h?.label ?? null,
      productId: h?.productId ?? h?.product_id ?? (h?.product?.id ? String(h.product.id) : null),
      priceOverride:
        typeof h?.priceOverride === 'number'
          ? h.priceOverride
          : typeof h?.price_override === 'number'
            ? h.price_override
            : null,
    }))
    .filter((h: any) => Boolean(h?.id));
}

const ShopImageMapEditorModal: React.FC<Props> = ({ open, onClose, shopId, products }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [productSaving, setProductSaving] = useState(false);
  const [maps, setMaps] = useState<any[]>([]);
  const [activeMap, setActiveMap] = useState<any | null>(null);
  const [hotspots, setHotspots] = useState<EditorHotspot[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [addingMode, setAddingMode] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [productsState, setProductsState] = useState<any[]>(Array.isArray(products) ? products : []);
  const [productEditName, setProductEditName] = useState('');
  const [productEditPrice, setProductEditPrice] = useState<string>('');
  const [productEditStock, setProductEditStock] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const productOptions = useMemo(() => {
    return (Array.isArray(productsState) ? productsState : [])
      .map((p: any) => ({ id: String(p?.id || ''), name: String(p?.name || '') }))
      .filter((p) => p.id && p.name);
  }, [productsState]);

  useEffect(() => {
    setProductsState(Array.isArray(products) ? products : []);
  }, [products]);

  useEffect(() => {
    if (!open) return;
    const load = async () => {
      setLoading(true);
      try {
        const list = await listShopImageMapsForManage(shopId);
        setMaps(Array.isArray(list) ? list : []);
        const currentActive = (Array.isArray(list) ? list : []).find((m: any) => Boolean(m?.isActive)) || (Array.isArray(list) ? list : [])[0] || null;
        setActiveMap(currentActive);
        setHotspots(normalizeHotspotsFromMap(currentActive));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [open, shopId]);

  const runAi = async () => {
    if (!activeMap?.id) return;
    const img = String(activeMap?.imageUrl || activeMap?.image_url || '').trim();
    if (!img) return;
    setAnalyzing(true);
    try {
      const res = await analyzeShopImageMap(shopId, { imageUrl: img, language: 'ar' });
      const hs = Array.isArray(res?.hotspots) ? res.hotspots : [];
      const next: EditorHotspot[] = hs.map((h: any, idx: number) => ({
        id: `ai_${Date.now()}_${idx}`,
        x: Number(h?.x || 0),
        y: Number(h?.y || 0),
        label: String(h?.label || '').trim() || null,
        productId: null,
        priceOverride: null,
      }));
      if (next.length > 0) {
        setHotspots(next);
        setSelectedId('');
        setAddingMode(false);
      }
    } finally {
      setAnalyzing(false);
    }
  };

  if (!open) return null;

  const mapImageUrl = resolveBackendMediaUrl(activeMap?.imageUrl || activeMap?.image_url);
  const selected = hotspots.find((h) => String(h.id) === String(selectedId)) || null;
  const selectedProduct = useMemo(() => {
    if (!selected?.productId) return null;
    const pid = String(selected.productId || '').trim();
    if (!pid) return null;
    return (Array.isArray(productsState) ? productsState : []).find((p: any) => String(p?.id || '') === pid) || null;
  }, [productsState, selected?.productId]);

  useEffect(() => {
    if (!selectedProduct) {
      setProductEditName('');
      setProductEditPrice('');
      setProductEditStock('');
      return;
    }

    setProductEditName(String(selectedProduct?.name || ''));
    const price = Number((selectedProduct as any)?.price || 0);
    setProductEditPrice(Number.isFinite(price) ? String(price) : '');
    const stock = (selectedProduct as any)?.stock;
    const nStock = typeof stock === 'number' ? stock : Number(stock || 0);
    setProductEditStock(Number.isFinite(nStock) ? String(nStock) : '');
  }, [selectedProduct]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!addingMode) return;
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const id = `hs_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    const next: EditorHotspot = {
      id,
      x,
      y,
      label: null,
      productId: null,
      priceOverride: null,
    };
    setHotspots((prev) => [...prev, next]);
    setSelectedId(id);
    setAddingMode(false);
  };

  const updateSelected = (patch: Partial<EditorHotspot>) => {
    if (!selected) return;
    setHotspots((prev) => prev.map((h) => (h.id === selected.id ? { ...h, ...patch } : h)));
  };

  const saveLinkedProduct = async () => {
    if (!selectedProduct) return;
    const pid = String(selectedProduct?.id || '').trim();
    if (!pid) return;

    const nextName = String(productEditName || '').trim();
    const nextPriceRaw = String(productEditPrice ?? '').trim();
    const nextStockRaw = String(productEditStock ?? '').trim();
    const nextStockParsed = nextStockRaw ? Number(nextStockRaw) : NaN;
    const nextStock = Number.isFinite(nextStockParsed) ? Math.max(0, Math.floor(nextStockParsed)) : 0;

    setProductSaving(true);
    try {
      await ApiService.updateProduct(pid, {
        name: nextName,
        ...(nextPriceRaw ? { price: nextPriceRaw } : {}),
      });
      if (nextStockRaw) {
        await ApiService.updateProductStock(pid, nextStock);
      }

      setProductsState((prev) =>
        (Array.isArray(prev) ? prev : []).map((p: any) =>
          String(p?.id || '') === pid
            ? {
                ...p,
                name: nextName,
                ...(nextPriceRaw ? { price: Number(nextPriceRaw) } : {}),
                ...(nextStockRaw ? { stock: nextStock } : {}),
              }
            : p,
        ),
      );
    } finally {
      setProductSaving(false);
    }
  };

  const createNewMapFromUpload = async (file: File) => {
    setImageUploading(true);
    try {
      const upload = await ApiService.uploadMedia({ file, purpose: 'shop_image_map', shopId });
      const url = String(upload?.url || '').trim();
      if (!url) throw new Error('Upload failed');

      const created = await createShopImageMap(shopId, { imageUrl: url });
      const activated = await activateShopImageMap(shopId, created?.id);

      const list = await listShopImageMapsForManage(shopId);
      setMaps(Array.isArray(list) ? list : []);
      setActiveMap(activated);
      setHotspots([]);
      setSelectedId('');
    } finally {
      setImageUploading(false);
    }
  };

  const saveLayout = async () => {
    if (!activeMap?.id) return;
    setSaving(true);
    try {
      await saveShopImageMapLayout(shopId, String(activeMap.id), {
        sections: [],
        hotspots: hotspots.map((h, idx) => ({
          x: h.x,
          y: h.y,
          label: h.label,
          productId: h.productId,
          priceOverride: h.priceOverride,
          sortOrder: idx,
        })),
      });

      const list = await listShopImageMapsForManage(shopId);
      setMaps(Array.isArray(list) ? list : []);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-6xl h-[85vh] bg-white rounded-[2.5rem] overflow-hidden border border-slate-200 shadow-2xl" dir="rtl">
        <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between">
          <div className="font-black">تحرير المنتجات بالصورة</div>
          <div className="flex items-center gap-3">
            <button
              onClick={runAi}
              className="px-4 py-2 rounded-2xl font-black text-xs bg-slate-900 text-white"
              disabled={analyzing || saving || !activeMap}
              type="button"
            >
              {analyzing ? <Loader2 size={16} className="animate-spin inline ml-2" /> : null}
              تحليل بالذكاء الصناعي
            </button>
            <button
              onClick={() => {
                setAddingMode((v) => !v);
                setSelectedId('');
              }}
              className={`px-4 py-2 rounded-2xl font-black text-xs border ${addingMode ? 'bg-green-500 text-white border-green-500' : 'bg-white text-slate-700 border-slate-200'}`}
              disabled={!activeMap || !mapImageUrl}
              type="button"
            >
              <Plus size={16} className="inline ml-2" />
              إضافة نقطة
            </button>
            <button
              onClick={saveLayout}
              className="px-4 py-2 rounded-2xl font-black text-xs bg-[#00E5FF] text-black"
              disabled={saving || !activeMap}
              type="button"
            >
              {saving ? <Loader2 size={16} className="animate-spin inline ml-2" /> : <Save size={16} className="inline ml-2" />}
              حفظ
            </button>
            <button onClick={onClose} className="p-2 rounded-2xl bg-slate-100" type="button">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="h-[calc(85vh-4rem)] grid grid-cols-1 lg:grid-cols-[1fr_360px]">
          <div className="relative bg-black flex items-center justify-center">
            {loading || imageUploading ? (
              <div className="text-white flex items-center gap-3">
                <Loader2 className="animate-spin" />
                تحميل...
              </div>
            ) : mapImageUrl ? (
              <div
                ref={canvasRef}
                onClick={handleCanvasClick}
                className={`relative w-full h-full flex items-center justify-center p-3 ${addingMode ? 'cursor-crosshair' : 'cursor-default'}`}
              >
                {String(mapImageUrl || '').trim() ? (
                  <img src={String(mapImageUrl).trim()} className="max-w-full max-h-full object-contain" alt="map" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/70 font-black">لا توجد صورة</div>
                )}

                {hotspots.map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedId(h.id);
                      setAddingMode(false);
                    }}
                    className={`absolute w-7 h-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 ${selectedId === h.id ? 'bg-cyan-500 border-white' : 'bg-white/20 border-white/70'}`}
                    style={{ left: `${h.x}%`, top: `${h.y}%` }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-white text-center space-y-4">
                <div className="font-black">لا توجد صورة خريطة بعد</div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 rounded-2xl bg-white text-black font-black"
                  type="button"
                >
                  رفع صورة جديدة
                </button>
              </div>
            )}
          </div>

          <div className="border-t lg:border-t-0 lg:border-l border-slate-100 p-4 overflow-y-auto">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="text-xs font-black text-slate-500">الصورة</div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-900 text-white font-black text-sm"
                  type="button"
                >
                  رفع/تغيير صورة الخريطة
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    createNewMapFromUpload(f).catch(() => {});
                    try {
                      e.target.value = '';
                    } catch {
                    }
                  }}
                />
              </div>

              <div className="space-y-2">
                <div className="text-xs font-black text-slate-500">اختيار خريطة</div>
                <select
                  value={String(activeMap?.id || '')}
                  onChange={(e) => {
                    const id = String(e.target.value || '');
                    const m = maps.find((x: any) => String(x?.id) === id) || null;
                    setActiveMap(m);
                    setHotspots(normalizeHotspotsFromMap(m));
                    setSelectedId('');
                    setAddingMode(false);
                  }}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 font-bold"
                >
                  <option value="">بدون</option>
                  {maps.map((m: any) => (
                    <option key={m.id} value={String(m.id)}>
                      {String(m.title || m.imageUrl || m.image_url || '').slice(0, 40)}{m.isActive ? ' (Active)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {selected ? (
                <div className="space-y-3 p-4 rounded-3xl bg-slate-50 border border-slate-100">
                  <div className="font-black">تعديل النقطة</div>

                  <div className="space-y-1">
                    <div className="text-[10px] font-black text-slate-500">الاسم</div>
                    <input
                      value={selected.label || ''}
                      onChange={(e) => updateSelected({ label: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="text-[10px] font-black text-slate-500">ربط بمنتج</div>
                    <select
                      value={selected.productId || ''}
                      onChange={(e) => {
                        const nextId = String(e.target.value || '').trim() || null;
                        const nextProduct = nextId
                          ? (Array.isArray(productsState) ? productsState : []).find((p: any) => String(p?.id || '') === nextId) || null
                          : null;
                        updateSelected({
                          productId: nextId,
                          ...(nextProduct && !selected.label ? { label: String(nextProduct?.name || '') } : {}),
                        });
                      }}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 font-bold"
                    >
                      <option value="">بدون</option>
                      {productOptions.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  {selectedProduct ? (
                    <div className="space-y-3 p-4 rounded-3xl bg-white border border-slate-200">
                      <div className="font-black text-sm">بيانات المنتج (حفظ حقيقي)</div>

                      <div className="space-y-1">
                        <div className="text-[10px] font-black text-slate-500">اسم المنتج</div>
                        <input
                          value={productEditName}
                          onChange={(e) => setProductEditName(e.target.value)}
                          className="w-full px-4 py-3 rounded-2xl border border-slate-200 font-bold"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="text-[10px] font-black text-slate-500">سعر المنتج</div>
                        <input
                          type="number"
                          value={productEditPrice}
                          onChange={(e) => setProductEditPrice(e.target.value)}
                          className="w-full px-4 py-3 rounded-2xl border border-slate-200 font-bold"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="text-[10px] font-black text-slate-500">المخزون (رقم)</div>
                        <input
                          type="number"
                          inputMode="numeric"
                          value={productEditStock}
                          onChange={(e) => setProductEditStock(e.target.value)}
                          className="w-full px-4 py-3 rounded-2xl border border-slate-200 font-bold"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => saveLinkedProduct().catch(() => {})}
                        className="w-full px-4 py-3 rounded-2xl bg-slate-900 text-white font-black text-sm"
                        disabled={productSaving || saving || analyzing}
                      >
                        {productSaving ? <Loader2 size={16} className="animate-spin inline ml-2" /> : null}
                        حفظ بيانات المنتج
                      </button>
                    </div>
                  ) : null}

                  <div className="space-y-1">
                    <div className="text-[10px] font-black text-slate-500">سعر خاص (اختياري)</div>
                    <input
                      type="number"
                      value={typeof selected.priceOverride === 'number' ? String(selected.priceOverride) : ''}
                      onChange={(e) => {
                        const n = Number(e.target.value);
                        updateSelected({ priceOverride: Number.isFinite(n) ? n : null });
                      }}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 font-bold"
                      placeholder="اتركه فاضي لاستخدام سعر المنتج"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setHotspots((prev) => prev.filter((h) => h.id !== selected.id));
                        setSelectedId('');
                      }}
                      className="px-4 py-3 rounded-2xl bg-red-50 text-red-600 font-black border border-red-100"
                    >
                      حذف
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedId('')}
                      className="px-4 py-3 rounded-2xl bg-white text-slate-700 font-black border border-slate-200"
                    >
                      إغلاق
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100 text-slate-500 font-bold text-sm">
                  اختر نقطة لتعديلها أو اضغط "إضافة نقطة".
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopImageMapEditorModal;
