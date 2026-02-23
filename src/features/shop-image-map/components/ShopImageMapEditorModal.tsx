import React, { useEffect, useMemo, useRef, useState, useCallback, memo } from 'react';
import { Loader2, Plus, Save, X, Brain } from 'lucide-react';
import { ApiService } from '@/services/api.service';
import type { ShopImageMapHotspot } from '../types';
import { resolveBackendMediaUrl } from '../utils';
import { activateShopImageMap, analyzeShopImageMap, createShopImageMap, listShopImageMapsForManage, saveShopImageMapLayout } from '../api';

// Sub-components
import CanvasArea from './ImageMapEditor/CanvasArea';
import Sidebar from './ImageMapEditor/Sidebar';

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

  const loadMaps = useCallback(async () => {
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
  }, [shopId]);

  useEffect(() => {
    if (open) {
      loadMaps();
    }
  }, [open, loadMaps]);

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

  const selected = useMemo(() => hotspots.find((h) => String(h.id) === String(selectedId)) || null, [hotspots, selectedId]);
  
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

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
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
  }, [addingMode]);

  const updateSelected = useCallback((patch: Partial<EditorHotspot>) => {
    if (!selectedId) return;
    setHotspots((prev) => prev.map((h) => (h.id === selectedId ? { ...h, ...patch } : h)));
  }, [selectedId]);

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
        sections: [{ name: 'منتجات', sortOrder: 0 }],
        hotspots: hotspots.map((h, idx) => ({
          x: h.x,
          y: h.y,
          label: h.label,
          productId: h.productId,
          priceOverride: h.priceOverride,
          sortOrder: idx,
          sectionIndex: 0,
        })),
      });

      const list = await listShopImageMapsForManage(shopId);
      setMaps(Array.isArray(list) ? list : []);
    } finally {
      setSaving(false);
    }
  };

  const mapImageUrl = resolveBackendMediaUrl(activeMap?.imageUrl || activeMap?.image_url);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[300] bg-black/70 backdrop-blur-sm flex items-center justify-center p-0 md:p-4 transition-all duration-300">
      <div className="w-full max-w-6xl h-full md:h-[90vh] bg-white rounded-none md:rounded-[2.5rem] overflow-hidden border border-slate-200 shadow-2xl flex flex-col" dir="rtl">
        {/* Header */}
        <div className="h-14 sm:h-16 px-4 sm:px-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white z-20">
          <div className="font-black text-slate-900 hidden lg:block text-sm">تحرير المنتجات بالصورة</div>
          <div className="flex items-center gap-1.5 sm:gap-3 w-full lg:w-auto justify-between lg:justify-end">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={runAi}
                className="px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl font-black text-[10px] sm:text-xs bg-slate-900 text-white transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                disabled={analyzing || saving || !activeMap}
                type="button"
              >
                {analyzing ? <Loader2 size={12} className="animate-spin" /> : <Brain size={12} />}
                <span className="inline">AI</span>
                <span className="hidden xs:inline">تحليل</span>
              </button>
              <button
                onClick={() => {
                  setAddingMode((v) => !v);
                  setSelectedId('');
                }}
                className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl font-black text-[10px] sm:text-xs border transition-all active:scale-95 flex items-center gap-1.5 ${addingMode ? 'bg-green-500 text-white border-green-500 shadow-inner' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
                disabled={!activeMap || !mapImageUrl}
                type="button"
              >
                <Plus size={12} />
                <span>نقطة</span>
              </button>
            </div>
            
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={saveLayout}
                className="px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl font-black text-[10px] sm:text-xs bg-[#00E5FF] text-black transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5 shadow-lg shadow-cyan-500/10"
                disabled={saving || !activeMap}
                type="button"
              >
                {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                <span>حفظ</span>
              </button>
              <button 
                onClick={onClose} 
                className="p-1.5 sm:p-2 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all active:scale-90" 
                type="button"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[1fr_360px] overflow-y-auto lg:overflow-hidden scrollbar-hide">
          <div className="min-h-[350px] sm:min-h-[450px] lg:h-full lg:overflow-hidden border-b lg:border-b-0">
            <CanvasArea
              mapImageUrl={mapImageUrl}
              hotspots={hotspots}
              selectedId={selectedId}
              addingMode={addingMode}
              loading={loading}
              imageUploading={imageUploading}
              onCanvasClick={handleCanvasClick}
              onHotspotClick={setSelectedId}
              canvasRef={canvasRef}
              fileInputRef={fileInputRef}
            />
          </div>

          <div className="lg:h-full lg:overflow-hidden">
            <Sidebar
              selected={selected}
              selectedProduct={selectedProduct}
              productEditName={productEditName}
              setProductEditName={setProductEditName}
              productEditPrice={productEditPrice}
              setProductEditPrice={setProductEditPrice}
              productEditStock={productEditStock}
              setProductEditStock={setProductEditStock}
              productSaving={productSaving}
              saveLinkedProduct={saveLinkedProduct}
              updateSelected={updateSelected}
              productOptions={productOptions}
              hotspots={hotspots}
              setHotspots={setHotspots}
              setSelectedId={setSelectedId}
              activeMap={activeMap}
              maps={maps}
              setActiveMap={setActiveMap}
              normalizeHotspotsFromMap={normalizeHotspotsFromMap}
              setAddingMode={setAddingMode}
              fileInputRef={fileInputRef}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopImageMapEditorModal;
