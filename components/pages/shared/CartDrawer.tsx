
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Trash2, CreditCard, Loader2, CheckCircle2, Plus, Minus } from 'lucide-react';
import { ApiService } from '@/services/api.service';
import { RayDB } from '@/constants';
import L from 'leaflet';
import markerIconUrl from 'leaflet/dist/images/marker-icon.png';
import markerIconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadowUrl from 'leaflet/dist/images/marker-shadow.png';

interface CartItem {
  id: string;
  lineId?: string;
  name: string;
  price: number;
  quantity: number;
  shopId: string;
  shopName: string;
  addons?: any;
  variantSelection?: any;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemove: (id: string) => void;
  onUpdateQuantity?: (id: string, delta: number) => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, items, onRemove, onUpdateQuantity }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');
  const [invalidLineIds, setInvalidLineIds] = useState<string[]>([]);
  const [localItems, setLocalItems] = useState<CartItem[]>(items);
  const [step, setStep] = useState<'cart' | 'cod_location'>('cart');
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationNote, setLocationNote] = useState('');
  const [fallbackAddress, setFallbackAddress] = useState('');
  const [deliveryFees, setDeliveryFees] = useState<Record<string, number | null>>({});
  const mapContainerRef = React.useRef<HTMLDivElement | null>(null);
  const mapRef = React.useRef<L.Map | null>(null);
  const markerRef = React.useRef<L.Marker | null>(null);

  React.useEffect(() => {
    // نضمن أننا نقبل فقط المصفوفات الصالحة لتجنب الأخطاء
    if (Array.isArray(items)) {
      setLocalItems(items);
    }
  }, [items]);

  React.useEffect(() => {
    if (!isOpen) {
      setStep('cart');
      setIsLocating(false);
      setLocationError('');
      setCoords(null);
      setLocationNote('');
      setFallbackAddress('');
      setError('');
      setInvalidLineIds([]);
      setDeliveryFees({});
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    }
  }, [isOpen]);

  const getLineKey = (item: any) => String(item?.lineId || `${item?.shopId || 'unknown'}:${item?.id}`);

  const getQtyStep = (item: any) => {
    try {
      return RayDB.getQuantityStepForUnit((item as any)?.unit);
    } catch {
      return 1;
    }
  };

  const isLikelyInvalidProductId = (raw: any) => {
    const id = String(raw || '').trim();
    if (!id) return true;
    if (id.toLowerCase().startsWith('ai_')) return true;
    if (id.toLowerCase().startsWith('manual_')) return true;
    return false;
  };

  const computeInvalidItems = (list: CartItem[]) => {
    const bad = (Array.isArray(list) ? list : []).filter((it: any) => {
      const shopId = String(it?.shopId || '').trim();
      const productId = String(it?.id || it?.productId || '').trim();
      if (!shopId || shopId === 'unknown') return true;
      if (isLikelyInvalidProductId(productId)) return true;
      const q = Number(it?.quantity);
      if (!Number.isFinite(q) || q <= 0) return true;
      return false;
    });
    return bad;
  };

  const removeInvalidItems = () => {
    const current = RayDB.getCart();
    const bad = computeInvalidItems(current as any);
    if (bad.length === 0) {
      setInvalidLineIds([]);
      return;
    }

    const badKeys = bad.map(getLineKey);
    let next = current as any[];
    for (const k of badKeys) {
      next = next.filter((i: any) => getLineKey(i) !== k);
    }
    RayDB.setCart(next);
    setInvalidLineIds([]);
    setError('تم حذف المنتجات غير المتاحة من السلة');
  };

  React.useEffect(() => {
    if (step !== 'cod_location') return;
    if (!coords) return;
    if (!mapContainerRef.current) return;

    const defaultIcon = L.icon({
      iconUrl: markerIconUrl,
      iconRetinaUrl: markerIconRetinaUrl,
      shadowUrl: markerShadowUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      shadowSize: [41, 41],
    });
    (L.Marker.prototype as any).options.icon = defaultIcon;

    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: false,
      }).setView([coords.lat, coords.lng], 16);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(mapRef.current);

      markerRef.current = L.marker([coords.lat, coords.lng], { draggable: true }).addTo(mapRef.current);

      markerRef.current.on('dragend', () => {
        const p = markerRef.current?.getLatLng();
        if (!p) return;
        setCoords({ lat: p.lat, lng: p.lng });
      });

      mapRef.current.on('click', (e: any) => {
        const p = e?.latlng;
        if (!p) return;
        setCoords({ lat: p.lat, lng: p.lng });
        markerRef.current?.setLatLng(p);
      });
    } else {
      mapRef.current.setView([coords.lat, coords.lng], mapRef.current.getZoom() || 16);
      markerRef.current?.setLatLng([coords.lat, coords.lng]);
    }
  }, [step, coords?.lat, coords?.lng]);

  const updateQuantity = (id: string, delta: number) => {
    onUpdateQuantity?.(id, delta);
    setLocalItems(prev => prev.map(item => {
      const key = String(item.lineId || `${item.shopId || 'unknown'}:${item.id}`);
      if (key === id) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    }));
  };

  const groupedItems = localItems.reduce((acc, item) => {
    const sId = String(item.shopId || 'unknown');
    if (!acc[sId]) {
      acc[sId] = { name: String(item.shopName || 'متجر'), items: [] };
    }
    acc[sId].items.push(item);
    return acc;
  }, {} as Record<string, { name: string; items: CartItem[] }>);

  const shopIdsKey = Object.keys(groupedItems).sort().join('|');

  React.useEffect(() => {
    if (!isOpen) return;
    const shopIds = Object.keys(groupedItems);
    if (shopIds.length === 0) return;

    let cancelled = false;
    (async () => {
      const entries = await Promise.all(
        shopIds.map(async (shopId) => {
          try {
            const shop = await ApiService.getShopBySlugOrId(String(shopId));
            const raw = (shop?.layoutConfig as any)?.deliveryFee;
            const n = typeof raw === 'number' ? raw : raw == null ? NaN : Number(raw);
            if (Number.isNaN(n) || n < 0) return [shopId, null] as const;
            return [shopId, n] as const;
          } catch {
            return [shopId, null] as const;
          }
        }),
      );

      if (cancelled) return;
      const next: Record<string, number | null> = {};
      for (const [id, fee] of entries) next[String(id)] = fee;
      setDeliveryFees(next);
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen, shopIdsKey]);

  const total = localItems.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0);

  const deliveryFeeTotal = Object.keys(groupedItems).reduce((sum, shopId) => {
    const fee = deliveryFees[String(shopId)];
    return sum + (typeof fee === 'number' && !Number.isNaN(fee) && fee >= 0 ? fee : 0);
  }, 0);

  const grandTotal = total + deliveryFeeTotal;

  const buildOrderNotes = () => {
    const payload = {
      kind: 'COD',
      coords,
      note: String(locationNote || '').trim(),
      address: String(fallbackAddress || '').trim(),
    };
    return `COD_LOCATION:${JSON.stringify(payload)}`;
  };

  const requestLocation = async () => {
    setIsLocating(true);
    setLocationError('');

    try {
      if (!navigator.geolocation) {
        setLocationError('المتصفح لا يدعم تحديد الموقع');
        setIsLocating(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = Number(pos?.coords?.latitude);
          const lng = Number(pos?.coords?.longitude);
          if (Number.isNaN(lat) || Number.isNaN(lng)) {
            setLocationError('تعذر الحصول على الموقع');
            setIsLocating(false);
            return;
          }
          setCoords({ lat, lng });
          setIsLocating(false);
        },
        () => {
          setLocationError('تعذر الحصول على الموقع. فعل صلاحية الموقع أو اكتب العنوان');
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 },
      );
    } catch {
      setLocationError('تعذر الحصول على الموقع');
      setIsLocating(false);
    }
  };

  const handleCheckout = async () => {
    if (localItems.length === 0) return;

    const bad = computeInvalidItems(localItems);
    if (bad.length > 0) {
      setInvalidLineIds(bad.map(getLineKey));
      setError('يوجد منتجات غير متاحة/غير صالحة في السلة. احذفها ثم حاول مرة أخرى.');
      return;
    }

    const token = (() => {
      try {
        return localStorage.getItem('ray_token') || '';
      } catch {
        return '';
      }
    })();

    if (step === 'cart') {
      setStep('cod_location');
      setError('');
      setInvalidLineIds([]);
      setLocationError('');
      if (!coords) {
        requestLocation();
      }
      return;
    }

    if (step === 'cod_location') {
      const hasCoords = !!coords && typeof coords.lat === 'number' && typeof coords.lng === 'number';
      const hasFallback = String(fallbackAddress || '').trim().length > 0;
      if (!hasCoords && !hasFallback) {
        setError('حدد موقعك أو اكتب العنوان');
        return;
      }
    }

    setIsProcessing(true);
    setError('');
    setInvalidLineIds([]);
    
    try {
      if (!token) {
        setIsProcessing(false);
        setError('يجب تسجيل الدخول لإتمام الشراء');
        try {
          const returnTo = encodeURIComponent(`${window.location.pathname}${window.location.search}`);
          window.location.href = `/login?returnTo=${returnTo}`;
        } catch {
          window.location.href = '/login';
        }
        return;
      }

      for (const [shopId, shop] of Object.entries(groupedItems)) {
        const items = (shop as any)?.items || [];
        const normalizedItems = (Array.isArray(items) ? items : []).map((it: any) => {
          const rawVariant = (it as any)?.variantSelection ?? (it as any)?.variant_selection;
          const hasValidVariant = (() => {
            if (!rawVariant || typeof rawVariant !== 'object') return false;
            const kind = String((rawVariant as any)?.kind || '').trim().toLowerCase();
            if (kind === 'fashion') {
              const colorValue = String((rawVariant as any)?.colorValue || (rawVariant as any)?.color?.value || '').trim();
              const size = String((rawVariant as any)?.size || '').trim();
              return Boolean(colorValue && size);
            }
            const typeId = String((rawVariant as any)?.typeId || (rawVariant as any)?.variantId || (rawVariant as any)?.type || (rawVariant as any)?.variant || '').trim();
            const sizeId = String((rawVariant as any)?.sizeId || (rawVariant as any)?.size || '').trim();
            return Boolean(typeId && sizeId);
          })();
          if (hasValidVariant) return it;

          const selectedColor = String((it as any)?.selectedColor || '').trim();
          const selectedSizeLabel = (() => {
            const s = (it as any)?.selectedSize;
            if (!s) return '';
            if (typeof s === 'string') return String(s).trim();
            if (s && typeof s === 'object') return String((s as any)?.label || '').trim();
            return '';
          })();

          if (!selectedColor || !selectedSizeLabel) return it;

          return {
            ...it,
            variantSelection: {
              kind: 'fashion',
              colorName: selectedColor,
              colorValue: selectedColor,
              size: selectedSizeLabel,
            },
          };
        });
        try {
          console.log('[CartDrawer] placeOrder payload', { shopId, items: normalizedItems });
        } catch {
        }
        const shopTotal = items.reduce((sum: number, item: any) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0);
        await ApiService.placeOrder({
          shopId,
          items: normalizedItems,
          total: shopTotal,
          paymentMethod: 'COD',
          notes: buildOrderNotes(),
        });
      }
      RayDB.clearCart();
      setIsProcessing(false);
      setShowSuccess(true);
      window.dispatchEvent(new Event('orders-updated'));
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
        window.location.reload(); 
      }, 2500);
    } catch (err: any) {
      const msg = String(err?.message || '').trim();
      if (msg.includes('غير متاحة') || msg.toLowerCase().includes('productid')) {
        const current = RayDB.getCart();
        const badNow = computeInvalidItems(current as any);
        if (badNow.length > 0) {
          setInvalidLineIds(badNow.map(getLineKey));
        }
      }
      setIsProcessing(false);
      const status = (err as any)?.status || (err as any)?.response?.status;
      if (status === 401) {
        setError('يجب تسجيل الدخول لإتمام الشراء');
        try {
          const returnTo = encodeURIComponent(`${window.location.pathname}${window.location.search}`);
          window.location.href = `/login?returnTo=${returnTo}`;
        } catch {
          window.location.href = '/login';
        }
        return;
      }
      setError(err?.message || 'حدث خطأ أثناء إتمام الشراء');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-md z-[400]" />
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-[401] shadow-2xl flex flex-col text-right" dir="rtl">
            <header className="p-8 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-2xl font-black flex items-center gap-4">
                <ShoppingBag className="w-8 h-8 text-[#00E5FF]" /> سلة التسوق
              </h2>
              <button onClick={onClose} className="p-3 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors">
                <X size={24} />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-8 space-y-10">
              {showSuccess ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                   <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-8 shadow-2xl animate-bounce">
                      <CheckCircle2 size={48} className="text-white" />
                   </div>
                   <h3 className="text-3xl font-black mb-4">تم تأكيد طلبك!</h3>
                   <p className="text-slate-400 font-bold">جاري إخطار المحل لتجهيز طلبك فوراً.</p>
                </div>
              ) : step === 'cod_location' ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-slate-900">عنوان التوصيل</h3>
                    <p className="text-slate-500 text-sm font-bold">هنحدد موقعك تلقائياً وتقدر تعدّل الـ Pin على الخريطة.</p>
                  </div>

                  {locationError && <p className="text-red-500 text-xs font-bold text-center">{String(locationError)}</p>}

                  <button
                    onClick={requestLocation}
                    disabled={isLocating}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 hover:bg-black transition-all disabled:opacity-50"
                  >
                    {isLocating ? <Loader2 className="animate-spin" /> : <>تحديد موقعي تلقائياً</>}
                  </button>

                  <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
                    <div ref={mapContainerRef} className="w-full h-64" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-600">وصف إضافي (اختياري)</label>
                    <input
                      value={locationNote}
                      onChange={(e) => setLocationNote(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-slate-900 outline-none focus:border-[#00E5FF]/60 transition-all text-sm"
                      placeholder="مثال: الدور 3 - شقة 12 - بجوار..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-600">لو الموقع مش شغال، اكتب العنوان (اختياري)</label>
                    <input
                      value={fallbackAddress}
                      onChange={(e) => setFallbackAddress(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-slate-900 outline-none focus:border-[#00E5FF]/60 transition-all text-sm"
                      placeholder="العنوان كتابة"
                    />
                  </div>

                  <button
                    onClick={() => setStep('cart')}
                    className="w-full py-3 bg-slate-100 text-slate-900 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all"
                  >
                    رجوع للسلة
                  </button>
                </div>
              ) : localItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-200">
                  <ShoppingBag size={80} className="mb-6 opacity-10" />
                  <p className="font-black text-xl">سلتك فارغة تماماً</p>
                </div>
              ) : (
                Object.entries(groupedItems).map(([shopId, shop]: [string, any]) => (
                  <div key={shopId} className="space-y-6">
                    <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                       <span className="text-[10px] font-black bg-[#00E5FF] px-2 py-1 rounded text-black">متجر</span>
                       <h3 className="font-black text-xl text-slate-900">{String(shop.name)}</h3>
                       <span className="text-[10px] font-black text-slate-400 mr-auto">
                         رسوم التوصيل: {(() => {
                           const fee = deliveryFees[String(shopId)];
                           if (fee == null) return 'غير محددة';
                           return `ج.م ${fee}`;
                         })()}
                       </span>
                    </div>
                    {shop.items.map((item: CartItem) => (
                      <div
                        key={String(item.lineId || `${item.shopId || 'unknown'}:${item.id}`)}
                        className="flex flex-col gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100"
                      >
                        <div className="flex items-center justify-between flex-row-reverse">
                          <div className="text-right">
                            <p className="font-black text-sm">{String(item.name)}</p>
                            <p className="text-[#00E5FF] font-black text-xs">ج.م {Number(item.price)}</p>
                            {(() => {
                              const sel = (item as any)?.variantSelection;
                              if (!sel || typeof sel !== 'object') return null;
                              const kind = String(sel?.kind || '').trim().toLowerCase();
                              if (kind === 'fashion') {
                                const cName = String(sel?.colorName || sel?.color?.name || '').trim();
                                const cValue = String(sel?.colorValue || sel?.color?.value || '').trim();
                                const size = String(sel?.size || '').trim();
                                if (!cValue || !size) return null;
                                return (
                                  <p className="mt-1 text-[10px] font-bold text-slate-500">
                                    {cName || cValue}{size ? ` - ${size}` : ''}
                                  </p>
                                );
                              }
                              if (kind === 'pack') {
                                const label = String(sel?.label || '').trim();
                                const qtyRaw = typeof sel?.qty === 'number' ? sel.qty : Number(sel?.qty || NaN);
                                const unit = String(sel?.unit || '').trim();

                                const packId = String(sel?.packId || sel?.id || '').trim();
                                const defs = Array.isArray((item as any)?.packOptions) ? (item as any).packOptions : [];
                                const def = packId && Array.isArray(defs)
                                  ? (defs as any[]).find((x: any) => String(x?.id || '').trim() === packId)
                                  : null;
                                const defLabel = String(def?.label || def?.name || '').trim();
                                const defQtyRaw = typeof def?.qty === 'number' ? def.qty : Number(def?.qty || NaN);
                                const defUnit = String(def?.unit || (item as any)?.unit || '').trim();

                                const fallback = Number.isFinite(qtyRaw) && qtyRaw > 0
                                  ? `${qtyRaw}${unit ? ` ${unit}` : ''}`
                                  : (Number.isFinite(defQtyRaw) && defQtyRaw > 0
                                    ? `${defQtyRaw}${defUnit ? ` ${defUnit}` : ''}`
                                    : '');
                                const text = label || defLabel || fallback;
                                if (!text) return null;
                                return (
                                  <p className="mt-1 text-[10px] font-bold text-slate-500">
                                    {text}
                                  </p>
                                );
                              }
                              const typeName = String(sel?.typeName || sel?.typeId || '').trim();
                              const sizeLabel = String(sel?.sizeLabel || sel?.sizeId || '').trim();
                              if (!typeName && !sizeLabel) return null;
                              return (
                                <p className="mt-1 text-[10px] font-bold text-slate-500">
                                  {typeName}
                                  {sizeLabel ? ` - ${sizeLabel}` : ''}
                                </p>
                              );
                            })()}
                            {Array.isArray((item as any)?.addons) && (item as any).addons.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {(item as any).addons.map((a: any, idx: number) => (
                                  <p key={idx} className="text-[10px] font-bold text-slate-500">
                                    + {String(a?.optionName || a?.optionId || 'إضافة')} ({String(a?.variantLabel || a?.variantId || '')})
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>
                          <button onClick={() => onRemove(String(item.lineId || `${item.shopId || 'unknown'}:${item.id}`))} className="text-slate-300 hover:text-red-500 transition-colors">
                            <Trash2 size={18} />
                          </button>
                        </div>
                        <div className="flex items-center justify-between flex-row-reverse">
                           <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200">
                              <button
                                onClick={() =>
                                  onUpdateQuantity?.(
                                    String(item.lineId || `${item.shopId || 'unknown'}:${item.id}`),
                                    getQtyStep(item),
                                  )
                                }
                                className="text-slate-900 hover:text-[#00E5FF]"
                              >
                                <Plus size={16} />
                              </button>
                              <span className="font-black text-sm w-4 text-center">{Number(item.quantity)}</span>
                              <button
                                onClick={() =>
                                  onUpdateQuantity?.(
                                    String(item.lineId || `${item.shopId || 'unknown'}:${item.id}`),
                                    -getQtyStep(item),
                                  )
                                }
                                className="text-slate-900 hover:text-red-500"
                              >
                                <Minus size={16} />
                              </button>
                           </div>
                           <p className="font-black text-lg text-slate-900">ج.م {Number(item.price) * Number(item.quantity)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>

            {!showSuccess && localItems.length > 0 && (
              <footer className="p-8 border-t border-slate-100 bg-slate-50 space-y-6">
                {error && <p className="text-red-500 text-xs font-bold text-center">{String(error)}</p>}
                {invalidLineIds.length > 0 && (
                  <div className="space-y-3">
                    <button
                      onClick={removeInvalidItems}
                      disabled={isProcessing}
                      className="w-full py-3 bg-red-50 text-red-700 rounded-2xl font-black text-sm hover:bg-red-100 transition-all disabled:opacity-50"
                    >
                      حذف المنتجات غير المتاحة
                    </button>
                    <button
                      onClick={() => {
                        RayDB.clearCart();
                        setInvalidLineIds([]);
                        setError('تم تفريغ السلة');
                      }}
                      disabled={isProcessing}
                      className="w-full py-3 bg-slate-100 text-slate-900 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all disabled:opacity-50"
                    >
                      تفريغ السلة بالكامل
                    </button>
                  </div>
                )}
                <div className="space-y-2">
                  <div className="flex justify-between items-center flex-row-reverse">
                    <span className="font-black text-slate-400">إجمالي المنتجات</span>
                    <span className="text-2xl font-black tracking-tighter">ج.م {total}</span>
                  </div>
                  <div className="flex justify-between items-center flex-row-reverse">
                    <span className="font-black text-slate-400">رسوم التوصيل</span>
                    <span className="text-2xl font-black tracking-tighter">ج.م {deliveryFeeTotal}</span>
                  </div>
                  <div className="flex justify-between items-center flex-row-reverse">
                    <span className="font-black text-slate-900">الإجمالي النهائي</span>
                    <span className="text-4xl font-black tracking-tighter">ج.م {grandTotal}</span>
                  </div>
                </div>
                <button 
                  onClick={handleCheckout}
                  disabled={isProcessing}
                  className="w-full py-6 bg-slate-900 text-white rounded-[2.5rem] font-black text-xl flex items-center justify-center gap-4 hover:bg-black transition-all shadow-2xl disabled:opacity-50"
                >
                  {isProcessing ? <Loader2 className="animate-spin" /> : step === 'cart' ? <>التالي <CreditCard size={24} /></> : <>تأكيد الطلب (دفع عند الاستلام) <CreditCard size={24} /></>}
                </button>
              </footer>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
