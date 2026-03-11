import React from 'react';
import { MapPin, CheckCircle, Banknote, Phone, Copy } from 'lucide-react';

type OrderItem = {
  id: string;
  quantity: number;
  price: number;
  product?: { name?: string };
};

const asCleanText = (v: any) => {
  const s = typeof v === 'string' ? v : (v == null ? '' : String(v));
  const t = s.trim();
  return t ? t : '';
};

const formatAddonsCompact = (raw: any): string => {
  if (!raw) return '';
  const list = Array.isArray(raw) ? raw : (Array.isArray((raw as any)?.items) ? (raw as any).items : null);
  if (!Array.isArray(list) || list.length === 0) return '';

  const parts = list
    .map((a: any) => {
      if (typeof a === 'string') {
        const s = asCleanText(a);
        return s ? `+ ${s}` : '';
      }
      if (!a || typeof a !== 'object') return '';

      const name = asCleanText(a?.optionName || a?.name || a?.title || a?.label);
      const size = asCleanText(a?.variantLabel || a?.variant || a?.size || a?.sizeLabel || a?.sizeName);
      const priceRaw = typeof a?.price === 'number' ? a.price : Number(a?.price ?? NaN);
      const priceText = Number.isFinite(priceRaw) && priceRaw >= 0 ? ` (ج.م ${Math.round(priceRaw * 100) / 100})` : '';
      const core = [name, size].filter(Boolean).join(' ');
      return core ? `+ ${core}${priceText}`.trim() : '';
    })
    .filter(Boolean);

  return parts.join(' ');
};

const CourierOrdersTab: React.FC<{
  activeTab: 'orders' | 'offers' | 'delivered' | 'settings';
  loading: boolean;
  visibleOrders: any[];
  buildGoogleMapsLink: (payload: { lat: number; lng: number; originLat?: number; originLng?: number }) => string;
  parseCodLocation: (notes: any) => { lat: number; lng: number; note?: string; address?: string } | null;
  getDeliveryFeeFromNotes: (notes: any) => number | null;
  copyText: (value: string, fallbackLabel: string) => void;
  updateOrder: (id: string, payload: { status?: string; codCollected?: boolean }) => Promise<void>;
}> = ({
  activeTab,
  loading,
  visibleOrders,
  buildGoogleMapsLink,
  parseCodLocation,
  getDeliveryFeeFromNotes,
  copyText,
  updateOrder,
}) => {
  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin h-6 w-6 rounded-full border-2 border-white/20 border-t-[#00E5FF]" /></div>;
  }

  if (visibleOrders.length === 0) {
    return (
      <div className="bg-slate-900 border border-white/5 rounded-[2rem] md:rounded-[2.5rem] p-10 md:p-12 text-center text-slate-400 font-bold">
        {activeTab === 'delivered' ? 'لا توجد طلبات تم توصيلها بعد.' : 'لا توجد طلبات مخصصة لك حالياً.'}
      </div>
    );
  }

  return (
    <div className="space-y-3 md:space-y-6">
      {visibleOrders.map((order) => {
        const fee = getDeliveryFeeFromNotes(order.notes) || 0;
        const grandTotal = Number(order.total || 0) + fee;
        const status = String(order.status || '').toUpperCase();
        const delivered = status === 'DELIVERED';
        const codCollected = !!order.codCollectedAt;
        const handedToCourier = Boolean((order as any)?.handedToCourierAt || (order as any)?.handed_to_courier_at);
        const location = parseCodLocation(order.notes);
        const shopLat = Number((order as any)?.shop?.latitude);
        const shopLng = Number((order as any)?.shop?.longitude);
        const hasShopCoords = Number.isFinite(shopLat) && Number.isFinite(shopLng);
        const customerPhone = String(order?.user?.phone || '').trim();
        const customerName = String(order?.user?.name || 'غير معروف');
        const shopName = String(order?.shop?.name || 'متجر غير معروف');

        return (
          <div key={order.id} className="bg-slate-900 border border-white/5 rounded-[2rem] md:rounded-[2.5rem] p-4 md:p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 md:gap-6">
              <div className="space-y-1 md:space-y-2">
                <p className="text-xs text-slate-500 font-black uppercase">طلب #{String(order.id).slice(0, 8)}</p>
                <h3 className="text-lg md:text-xl font-black">{shopName}</h3>
                <p className="text-xs md:text-sm text-slate-400 font-bold">
                  العميل: {customerName} {customerPhone ? `• ${customerPhone}` : ''}
                </p>
                <p className="text-xs text-slate-500">{new Date(order.created_at || order.createdAt).toLocaleString('ar-EG')}</p>
              </div>

              <div className="flex flex-wrap gap-2 md:gap-3">
                {location && (
                  <a
                    href={buildGoogleMapsLink({
                      lat: location.lat,
                      lng: location.lng,
                      ...(hasShopCoords ? { originLat: shopLat, originLng: shopLng } : {}),
                    })}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-2xl bg-[#00E5FF]/10 text-[#00E5FF] font-black text-xs"
                  >
                    <MapPin size={12} /> فتح الخريطة
                  </a>
                )}

                {customerPhone ? (
                  <a
                    href={`tel:${customerPhone}`}
                    className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-2xl bg-white/5 text-slate-200 hover:bg-white/10 font-black text-xs"
                  >
                    <Phone size={12} /> اتصال
                  </a>
                ) : null}

                {customerPhone ? (
                  <button
                    type="button"
                    onClick={() => copyText(customerPhone, 'انسخ رقم العميل')}
                    className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-2xl bg-white/5 text-slate-200 hover:bg-white/10 font-black text-xs"
                  >
                    <Copy size={12} /> نسخ الرقم
                  </button>
                ) : null}

                <span className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-2xl bg-white/5 text-slate-200 font-black text-xs">
                  الإجمالي: ج.م {Number.isFinite(grandTotal) ? grandTotal.toLocaleString() : '0'}
                </span>

                {fee > 0 && (
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-2xl bg-amber-500/10 text-amber-300 font-black text-xs">
                    رسوم التوصيل: ج.م {fee}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4 md:mt-6 grid md:grid-cols-2 gap-4 md:gap-6">
              <div className="bg-slate-950/50 border border-white/5 rounded-2xl p-3 md:p-4">
                <p className="text-xs text-slate-500 font-black mb-2 md:mb-3">الأصناف</p>
                <ul className="space-y-1 md:space-y-2 text-xs md:text-sm text-slate-300">
                  {(order.items || []).map((item: OrderItem) => (
                    <li key={item.id} className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate">{item.product?.name || 'منتج'}</div>
                        {(() => {
                          const addonsText = formatAddonsCompact((item as any)?.addons ?? (item as any)?.extras ?? (item as any)?.addOns);
                          if (!addonsText) return null;
                          return <div className="text-[10px] md:text-xs text-slate-500 font-black mt-1 break-words">{addonsText}</div>;
                        })()}
                      </div>
                      <div className="shrink-0 text-left">
                        {(() => {
                          const qty = Number(item.quantity || 0);
                          const unitPrice = typeof (item as any)?.price === 'number' ? (item as any).price : Number((item as any)?.price ?? NaN);
                          const safeQty = Number.isFinite(qty) && qty > 0 ? qty : 1;
                          const lineTotal = Number.isFinite(unitPrice) ? unitPrice * safeQty : NaN;
                          const priceText = Number.isFinite(unitPrice) && unitPrice >= 0 ? `ج.م ${Math.round(unitPrice * 100) / 100}` : '';
                          const totalText = safeQty > 1 && Number.isFinite(lineTotal) ? ` (الإجمالي ${Math.round(lineTotal * 100) / 100})` : '';
                          return priceText ? (
                            <div className="text-slate-200 font-black text-xs md:text-sm whitespace-nowrap">
                              {priceText}{totalText}
                            </div>
                          ) : null;
                        })()}
                        <div className="text-slate-400 font-black text-[10px] md:text-xs whitespace-nowrap">× {item.quantity}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-950/50 border border-white/5 rounded-2xl p-3 md:p-4 space-y-3 md:space-y-4">
                <div>
                  <p className="text-xs text-slate-500 font-black">الحالة الحالية</p>
                  <p className="text-xs md:text-sm font-black text-white">{String(order.status || 'PENDING')}</p>
                </div>

                <div className="flex flex-wrap gap-2 md:gap-3">
                  <button
                    disabled
                    className={`inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-2xl text-xs font-black ${status === 'CONFIRMED' || status === 'PREPARING' || status === 'READY' || status === 'DELIVERED' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-white/5 text-slate-500'}`}
                  >
                    <CheckCircle size={12} /> قبول
                  </button>

                  <button
                    disabled
                    className={`inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-2xl text-xs font-black ${status === 'PREPARING' || status === 'READY' || status === 'DELIVERED' ? 'bg-amber-500/15 text-amber-300' : 'bg-white/5 text-slate-500'}`}
                  >
                    <CheckCircle size={12} /> قيد التنفيذ
                  </button>

                  <button
                    disabled
                    className={`inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-2xl text-xs font-black ${status === 'READY' || status === 'DELIVERED' ? 'bg-indigo-500/15 text-indigo-300' : 'bg-white/5 text-slate-500'}`}
                  >
                    <CheckCircle size={12} /> جاهز
                  </button>

                  <button
                    disabled
                    className={`inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-2xl text-xs font-black ${handedToCourier ? 'bg-sky-500/15 text-sky-300' : 'bg-white/5 text-slate-500'}`}
                  >
                    <CheckCircle size={12} /> تم تسليمه للتوصيل
                  </button>

                  <button
                    disabled={delivered || status !== 'READY' || !handedToCourier}
                    onClick={async () => {
                      if (delivered || status !== 'READY' || !handedToCourier) return;
                      const ok = window.confirm('تأكيد: تم تسليم الطلب للعميل؟');
                      if (!ok) return;
                      await updateOrder(String(order.id), { status: 'DELIVERED' });
                    }}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-2xl text-xs font-black ${delivered || status !== 'READY' || !handedToCourier ? 'bg-white/5 text-slate-500 cursor-not-allowed' : 'bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25'}`}
                  >
                    <CheckCircle size={12} /> تم التوصيل
                  </button>

                  <button
                    disabled={codCollected}
                    onClick={async () => {
                      if (codCollected) return;
                      const ok = window.confirm('تأكيد: تم تحصيل الكاش من العميل؟');
                      if (!ok) return;
                      await updateOrder(String(order.id), { codCollected: true });
                    }}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-2xl text-xs font-black ${codCollected ? 'bg-white/5 text-slate-500 cursor-not-allowed' : 'bg-amber-500/15 text-amber-300 hover:bg-amber-500/25'}`}
                  >
                    <Banknote size={12} /> {codCollected ? 'تم تحصيل الكاش' : 'تحصيل الكاش'}
                  </button>

                  {location?.address ? (
                    <button
                      type="button"
                      onClick={() => copyText(String(location.address), 'انسخ العنوان')}
                      className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-2xl text-xs font-black bg-white/5 text-slate-200 hover:bg-white/10"
                    >
                      <Copy size={12} /> نسخ العنوان
                    </button>
                  ) : null}
                </div>

                {(location?.address || location?.note) && (
                  <div className="text-xs text-slate-400">
                    {location?.address && <p>العنوان: {location.address}</p>}
                    {location?.note && <p>ملاحظات: {location.note}</p>}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CourierOrdersTab;
