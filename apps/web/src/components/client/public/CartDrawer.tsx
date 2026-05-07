'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { X, ShoppingBag, Trash2, CreditCard, Loader2, CheckCircle2, Plus, Minus, MapPin } from 'lucide-react';
import { useLocale } from '@/i18n/LocaleProvider';
import { useT } from '@/i18n/useT';
import { cartStorage, type CartItem } from '@/lib/cart/storage';
import { locationPersistence } from '@/lib/cart/locationPersistence';
import { requestPreciseBrowserLocation, explainGeoError } from '@/lib/geolocation';
import { apiPlaceOrder, apiGetShopByIdOrSlug } from '@/lib/api/shop';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const t = useT();
  const { locale, dir } = useLocale();
  const isRtl = dir === 'rtl';

  const [localItems, setLocalItems] = useState<CartItem[]>([]);
  const [step, setStep] = useState<'cart' | 'cod_location'>('cart');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  // Location / delivery
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const checkoutDraft = useMemo(() => locationPersistence.getCheckoutLocation(), []);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(checkoutDraft.coords);
  const [locationNote, setLocationNote] = useState(checkoutDraft.locationNote);
  const [fallbackAddress, setFallbackAddress] = useState(checkoutDraft.fallbackAddress);
  const [customerPhone, setCustomerPhone] = useState(checkoutDraft.customerPhone);
  const [customerNote, setCustomerNote] = useState(checkoutDraft.customerNote);
  const [deliveryFees, setDeliveryFees] = useState<Record<string, number | null>>({});

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // Sync cart items
  useEffect(() => {
    if (isOpen) {
      setLocalItems(cartStorage.getCart());
    }
  }, [isOpen]);

  // Reset state when drawer closes
  useEffect(() => {
    if (!isOpen) {
      setStep('cart');
      setIsLocating(false);
      setLocationError('');
      setError('');
      const saved = locationPersistence.getCheckoutLocation();
      setCoords(saved.coords);
      setLocationNote(saved.locationNote);
      setFallbackAddress(saved.fallbackAddress);
      setCustomerPhone(saved.customerPhone);
      setCustomerNote(saved.customerNote);
      setDeliveryFees({});
      if (mapRef.current) {
        try { mapRef.current.remove(); } catch {}
        mapRef.current = null;
        markerRef.current = null;
      }
    }
  }, [isOpen]);

  // Persist checkout location
  useEffect(() => {
    locationPersistence.setCheckoutLocation({ coords, locationNote, fallbackAddress, customerPhone, customerNote });
  }, [coords, locationNote, fallbackAddress, customerPhone, customerNote]);

  // Cleanup map when not on cod_location step
  useEffect(() => {
    if (step !== 'cod_location' && mapRef.current) {
      try { mapRef.current.remove(); } catch {}
      mapRef.current = null;
      markerRef.current = null;
    }
  }, [step]);

  // Fetch delivery fees per shop
  const groupedItems = useMemo(() => {
    const acc: Record<string, { name: string; items: CartItem[] }> = {};
    for (const item of localItems) {
      const sId = String(item.shopId || 'unknown');
      if (!acc[sId]) acc[sId] = { name: String(item.shopName || t('common.cart', 'Cart')), items: [] };
      acc[sId].items.push(item);
    }
    return acc;
  }, [localItems, t]);

  const shopIdsKey = Object.keys(groupedItems).sort().join('|');

  useEffect(() => {
    if (!isOpen) return;
    const shopIds = Object.keys(groupedItems);
    if (shopIds.length === 0) return;

    let cancelled = false;
    (async () => {
      const entries = await Promise.all(
        shopIds.map(async (shopId) => {
          try {
            const shop = await apiGetShopByIdOrSlug(String(shopId));
            const raw = (shop?.layoutConfig as any)?.deliveryFee;
            const n = typeof raw === 'number' ? raw : raw == null ? NaN : Number(raw);
            if (Number.isNaN(n) || n < 0) return [shopId, null] as const;
            return [shopId, n] as const;
          } catch {
            return [shopId, null] as const;
          }
        })
      );
      if (cancelled) return;
      const next: Record<string, number | null> = {};
      for (const [id, fee] of entries) next[String(id)] = fee;
      setDeliveryFees(next);
    })();

    return () => { cancelled = true; };
  }, [isOpen, shopIdsKey]);

  // Leaflet map init (lazy loaded)
  useEffect(() => {
    if (step !== 'cod_location') return;
    if (!coords) return;
    if (!mapContainerRef.current) return;

    let cancelled = false;
    (async () => {
      try {
        await import('leaflet/dist/leaflet.css');
        const leaflet = await import('leaflet');
        const markerIconMod: any = await import('leaflet/dist/images/marker-icon.png');
        const markerIcon2xMod: any = await import('leaflet/dist/images/marker-icon-2x.png');
        const markerShadowMod: any = await import('leaflet/dist/images/marker-shadow.png');

        if (cancelled) return;

        const L: any = (leaflet as any)?.default || leaflet;
        const markerIconUrl: string = String(markerIconMod?.default || markerIconMod || '');
        const markerIconRetinaUrl: string = String(markerIcon2xMod?.default || markerIcon2xMod || '');
        const markerShadowUrl: string = String(markerShadowMod?.default || markerShadowMod || '');

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
            if (p) setCoords({ lat: p.lat, lng: p.lng });
          });

          mapRef.current.on('click', (e: any) => {
            const p = e?.latlng;
            if (p) {
              setCoords({ lat: p.lat, lng: p.lng });
              markerRef.current?.setLatLng(p);
            }
          });
        } else {
          mapRef.current.setView([coords.lat, coords.lng], mapRef.current.getZoom() || 16);
          markerRef.current?.setLatLng([coords.lat, coords.lng]);
        }
      } catch {}
    })();

    return () => { cancelled = true; };
  }, [step, coords?.lat, coords?.lng]);

  const requestLocation = async () => {
    setIsLocating(true);
    setLocationError('');
    try {
      const nextCoords = await requestPreciseBrowserLocation();
      setCoords(nextCoords);
    } catch (err) {
      const message = String((err as any)?.message || '').trim();
      if (message === 'GEO_UNSUPPORTED') {
        setLocationError(t('cart.locationErrors.unsupported', 'Geolocation is not supported by your browser'));
      } else if (message === 'GEO_INSECURE_CONTEXT') {
        setLocationError(t('cart.locationErrors.insecureContext', 'Location requires HTTPS'));
      } else {
        setLocationError(explainGeoError(err));
      }
    } finally {
      setIsLocating(false);
    }
  };

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

  const handleCheckout = async () => {
    if (localItems.length === 0) return;

    if (step === 'cart') {
      setStep('cod_location');
      setError('');
      setLocationError('');
      if (!coords) requestLocation();
      return;
    }

    // cod_location step
    const phone = String(customerPhone || '').trim();
    if (!phone) {
      setError(t('cart.phoneRequired', 'Phone number is required'));
      return;
    }
    const hasCoords = !!coords && typeof coords.lat === 'number' && typeof coords.lng === 'number';
    const hasFallback = String(fallbackAddress || '').trim().length > 0;
    if (!hasCoords && !hasFallback) {
      setError(t('cart.addressOrLocationRequired', 'Please provide a delivery address or location'));
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      for (const [shopId, shop] of Object.entries(groupedItems)) {
        const items = shop.items;
        const shopTotal = items.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0);
        await apiPlaceOrder({
          shopId,
          items,
          total: shopTotal,
          paymentMethod: 'COD',
          notes: buildOrderNotes(),
          customerPhone: phone,
          deliveryAddressManual: String(fallbackAddress || '').trim() || undefined,
          deliveryLat: coords ? coords.lat : undefined,
          deliveryLng: coords ? coords.lng : undefined,
          deliveryNote: String(locationNote || '').trim() || undefined,
          customerNote: String(customerNote || '').trim() || undefined,
        });
      }
      cartStorage.clearCart();
      locationPersistence.clearCheckoutLocation();
      setLocalItems([]);
      setIsProcessing(false);
      setShowSuccess(true);
      try { window.dispatchEvent(new Event('orders-updated')); } catch {}
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 2500);
    } catch (err: any) {
      setIsProcessing(false);
      const status = (err as any)?.status;
      if (status === 401) {
        setError(t('cart.authRequired', 'Please log in to place an order'));
        return;
      }
      const msg = typeof err?.message === 'string' && err.message.trim() ? err.message : '';
      setError(msg || t('cart.checkoutError', 'Checkout failed. Please try again.'));
    }
  };

  const removeFromCart = (lineId: string) => {
    cartStorage.removeFromCart(lineId);
    setLocalItems(cartStorage.getCart());
  };

  const updateQuantity = (lineId: string, delta: number) => {
    cartStorage.updateCartItemQuantity(lineId, delta);
    setLocalItems(cartStorage.getCart());
  };

  const inputCls = `w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-slate-900 outline-none focus:border-[#00E5FF]/60 transition-all text-sm ${isRtl ? 'text-right' : 'text-left'}`;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200]"
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 h-full w-[92%] max-w-md bg-white z-[210] shadow-2xl flex flex-col ${isRtl ? 'right-0' : 'left-0'}`}
        dir={dir}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-100">
          <h2 className="text-xl font-black flex items-center gap-3">
            <ShoppingBag className="text-[#00E5FF]" size={24} />
            {t('cart.title', 'Cart')}
          </h2>
          <button onClick={onClose} className="p-2 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {showSuccess ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-2xl animate-bounce">
                <CheckCircle2 size={40} className="text-white" />
              </div>
              <h3 className="text-2xl font-black mb-2">{t('cart.success.title', 'Order Placed!')}</h3>
              <p className="text-slate-400 font-bold">{t('cart.success.subtitle', 'Your order has been placed successfully.')}</p>
            </div>
          ) : step === 'cod_location' ? (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-black text-slate-900">{t('cart.deliveryAddress.title', 'Delivery Address')}</h3>
                <p className="text-slate-500 text-sm font-bold">{t('cart.deliveryAddress.subtitle', 'Provide your delivery details')}</p>
              </div>

              {locationError && <p className="text-red-500 text-xs font-bold text-center">{locationError}</p>}

              <button
                onClick={requestLocation}
                disabled={isLocating}
                className="w-full py-3 bg-slate-900 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-black transition-all disabled:opacity-50"
              >
                {isLocating ? <Loader2 className="animate-spin" size={16} /> : <MapPin size={16} />}
                {isLocating ? t('cart.locating', 'Locating...') : t('cart.locateMe', 'Locate Me')}
              </button>

              <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
                <div ref={mapContainerRef} className="w-full h-56" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-600">{t('cart.phoneLabel', 'Phone Number')}</label>
                <input
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className={inputCls}
                  placeholder="01xxxxxxxxx"
                  inputMode="tel"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-600">{t('cart.extraNoteLabel', 'Extra Note')}</label>
                <input
                  value={locationNote}
                  onChange={(e) => setLocationNote(e.target.value)}
                  className={inputCls}
                  placeholder={t('cart.extraNotePlaceholder', 'e.g. 3rd floor, apartment 5')}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-600">{t('cart.fallbackAddressLabel', 'Address (if no location)')}</label>
                <input
                  value={fallbackAddress}
                  onChange={(e) => setFallbackAddress(e.target.value)}
                  className={inputCls}
                  placeholder={t('cart.fallbackAddressPlaceholder', 'Type your address manually')}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-600">{t('cart.orderNoteLabel', 'Order Note')}</label>
                <input
                  value={customerNote}
                  onChange={(e) => setCustomerNote(e.target.value)}
                  className={inputCls}
                  placeholder={t('cart.orderNotePlaceholder', 'Any special instructions')}
                />
              </div>

              <button
                onClick={() => setStep('cart')}
                className="w-full py-3 bg-slate-100 text-slate-900 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all"
              >
                {t('cart.backToCart', 'Back to Cart')}
              </button>
            </div>
          ) : localItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-200 py-12">
              <ShoppingBag size={64} className="mb-6 opacity-10" />
              <p className="font-black text-xl text-slate-400">{t('cart.empty', 'Cart is empty')}</p>
            </div>
          ) : (
            Object.entries(groupedItems).map(([shopId, shop]) => (
              <div key={shopId} className="space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-50 pb-3">
                  <span className="text-[10px] font-black bg-[#00E5FF] px-2 py-1 rounded text-black">{t('cart.shopTag', 'Shop')}</span>
                  <h3 className="font-black text-lg text-slate-900">{shop.name}</h3>
                  <span className="text-[10px] font-black text-slate-400 mr-auto">
                    {t('cart.deliveryFeeLabel', 'Delivery')}: {(() => {
                      const fee = deliveryFees[String(shopId)];
                      if (fee == null) return t('cart.deliveryFeeUnknown', '—');
                      return `${t('common.currency', 'EGP')} ${fee}`;
                    })()}
                  </span>
                </div>
                {shop.items.map((item) => {
                  const lineKey = item.lineId || `${item.shopId}:${item.id}`;
                  const imgSrc = item.imageUrl || item.image || '';
                  return (
                    <div key={lineKey} className="flex flex-col gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                        {imgSrc && (
                          <img
                            src={imgSrc}
                            alt={item.name}
                            className="w-14 h-14 rounded-xl object-cover bg-white"
                            loading="lazy"
                          />
                        )}
                        <div className={`flex-1 ${isRtl ? 'text-right' : 'text-left'}`}>
                          <p className="font-black text-sm">{item.name}</p>
                          <p className="text-[#00E5FF] font-black text-xs">{t('common.currency', 'EGP')} {Number(item.price)}</p>
                          {item.variantSelection && (() => {
                            const sel = item.variantSelection;
                            const kind = String((sel as any)?.kind || '').trim().toLowerCase();
                            if (kind === 'fashion') {
                              const cName = String((sel as any)?.colorName || (sel as any)?.color?.name || '').trim();
                              const size = String((sel as any)?.size || '').trim();
                              if (cName || size) return <p className="mt-1 text-[10px] font-bold text-slate-500">{cName}{size ? ` - ${size}` : ''}</p>;
                            }
                            return null;
                          })()}
                        </div>
                        <button onClick={() => removeFromCart(lineKey)} className="text-slate-300 hover:text-red-500 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className={`flex items-center justify-between ${isRtl ? 'flex-row-reverse' : ''}`}>
                        <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-xl shadow-sm border border-slate-200">
                          <button onClick={() => updateQuantity(lineKey, 1)} className="text-slate-900 hover:text-[#00E5FF]">
                            <Plus size={14} />
                          </button>
                          <span className="font-black text-sm w-4 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(lineKey, -1)} className="text-slate-900 hover:text-red-500">
                            <Minus size={14} />
                          </button>
                        </div>
                        <p className="font-black text-base text-slate-900">{t('common.currency', 'EGP')} {Number(item.price) * Number(item.quantity)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {!showSuccess && localItems.length > 0 && (
          <footer className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50 space-y-4">
            {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}
            <div className="space-y-1">
              <div className={`flex justify-between items-center ${isRtl ? 'flex-row-reverse' : ''}`}>
                <span className="font-black text-slate-400">{t('cart.itemsTotal', 'Items Total')}</span>
                <span className="text-xl font-black">{t('common.currency', 'EGP')} {total}</span>
              </div>
              <div className={`flex justify-between items-center ${isRtl ? 'flex-row-reverse' : ''}`}>
                <span className="font-black text-slate-400">{t('cart.deliveryFees', 'Delivery Fees')}</span>
                <span className="text-xl font-black">{t('common.currency', 'EGP')} {deliveryFeeTotal}</span>
              </div>
              <div className={`flex justify-between items-center ${isRtl ? 'flex-row-reverse' : ''}`}>
                <span className="font-black text-slate-900">{t('cart.grandTotal', 'Grand Total')}</span>
                <span className="text-2xl font-black">{t('common.currency', 'EGP')} {grandTotal}</span>
              </div>
            </div>
            <button
              onClick={handleCheckout}
              disabled={isProcessing}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-black transition-all shadow-2xl disabled:opacity-50"
            >
              {isProcessing ? (
                <Loader2 className="animate-spin" />
              ) : step === 'cart' ? (
                <>
                  {t('cart.next', 'Next')} <CreditCard size={18} />
                </>
              ) : (
                <>
                  {t('cart.confirmCod', 'Confirm Order')} <CreditCard size={18} />
                </>
              )}
            </button>
          </footer>
        )}
      </div>
    </>
  );
}
