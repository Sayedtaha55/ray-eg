'use client';

import React from 'react';
import { MapPin, CheckCircle, Banknote, Phone, Copy } from 'lucide-react';
import { useT } from '@/i18n/useT';

type OrderItem = {
  id: string;
  quantity: number;
  price: number;
  product?: { name?: string };
  addons?: any;
  extras?: any;
  addOns?: any;
};

const asCleanText = (v: any) => {
  const s = typeof v === 'string' ? v : (v == null ? '' : String(v));
  return s.trim();
};

const formatAddonsCompact = (raw: any, t: any): string => {
  if (!raw) return '';
  const list = Array.isArray(raw) ? raw : (Array.isArray((raw as any)?.items) ? (raw as any).items : null);
  if (!Array.isArray(list) || list.length === 0) return '';
  return list
    .map((a: any) => {
      if (typeof a === 'string') { const s = asCleanText(a); return s ? `+ ${s}` : ''; }
      if (!a || typeof a !== 'object') return '';
      const name = asCleanText(a?.optionName || a?.name || a?.title || a?.label);
      const size = asCleanText(a?.variantLabel || a?.variant || a?.size || a?.sizeLabel || a?.sizeName);
      const priceRaw = typeof a?.price === 'number' ? a.price : Number(a?.price ?? NaN);
      const priceText = Number.isFinite(priceRaw) && priceRaw >= 0 ? ` (${t('courier.common.egpAbbr', 'ج.م')} ${Math.round(priceRaw * 100) / 100})` : '';
      const core = [name, size].filter(Boolean).join(' ');
      return core ? `+ ${core}${priceText}`.trim() : '';
    })
    .filter(Boolean)
    .join(' ');
};

type Props = {
  activeTab: 'orders' | 'offers' | 'delivered' | 'settings';
  loading: boolean;
  visibleOrders: any[];
  buildGoogleMapsLink: (payload: { lat: number; lng: number; originLat?: number; originLng?: number }) => string;
  parseCodLocation: (notes: any) => { lat: number; lng: number; note?: string; address?: string } | null;
  getDeliveryFeeFromNotes: (notes: any) => number | null;
  copyText: (value: string, fallbackLabel: string) => void;
  updateOrder: (id: string, payload: { status?: string; codCollected?: boolean }) => Promise<void>;
};

const CourierOrdersTab: React.FC<Props> = ({
  activeTab, loading, visibleOrders, buildGoogleMapsLink,
  parseCodLocation, getDeliveryFeeFromNotes, copyText, updateOrder,
}) => {
  const t = useT();

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin h-6 w-6 rounded-full border-2 border-white/20 border-t-[#00E5FF]" /></div>;
  }

  if (visibleOrders.length === 0) {
    return (
      <div className="bg-slate-900 border border-white/5 rounded-[2rem] md:rounded-[2.5rem] p-10 md:p-12 text-center text-slate-400 font-bold">
        {activeTab === 'delivered' ? t('courier.ordersTab.noDeliveredOrders', 'لا توجد طلبات مسلمة') : t('courier.ordersTab.noAssignedOrders', 'لا توجد طلبات مسندة')}
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
        const handedToCourier = Boolean(order?.handedToCourierAt || order?.handed_to_courier_at);
        const deliveryEnabledForCourier = !Boolean(order?.shop?.deliveryDisabled ?? order?.shop?.delivery_disabled ?? false);
        const location = (() => {
          const lat = Number(order?.deliveryLat ?? order?.delivery_lat);
          const lng = Number(order?.deliveryLng ?? order?.delivery_lng);
          if (Number.isFinite(lat) && Number.isFinite(lng)) {
            const note = String(order?.deliveryNote ?? order?.delivery_note ?? '').trim() || undefined;
            const address = String(order?.deliveryAddressManual ?? order?.delivery_address_manual ?? '').trim() || undefined;
            return { lat, lng, note, address };
          }
          return parseCodLocation(order.notes);
        })();
        const shopLat = Number(order?.shop?.latitude);
        const shopLng = Number(order?.shop?.longitude);
        const hasShopCoords = Number.isFinite(shopLat) && Number.isFinite(shopLng);
        const customerPhone = String(order?.customerPhone ?? order?.customer_phone ?? order?.user?.phone ?? '').trim();
        const customerName = String(order?.user?.name || t('courier.common.unknown', 'مجهول'));
        const shopName = String(order?.shop?.name || t('courier.common.unknownShop', 'متجر مجهول'));
        const manualAddress = String(order?.deliveryAddressManual ?? order?.delivery_address_manual ?? '').trim();
        const deliveryNote = String(order?.deliveryNote ?? order?.delivery_note ?? '').trim();
        const customerNote = String(order?.customerNote ?? order?.customer_note ?? '').trim();

        return (
          <div key={order.id} className="bg-slate-900 border border-white/5 rounded-[2rem] md:rounded-[2.5rem] p-4 md:p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 md:gap-6">
              <div className="space-y-1 md:space-y-2">
                <p className="text-xs text-slate-500 font-black uppercase">{t('courier.ordersTab.orderLabel', 'طلب #{{id}}').replace('{{id}}', String(order.id).slice(0, 8))}</p>
                <h3 className="text-lg md:text-xl font-black">{shopName}</h3>
                <p className="text-xs md:text-sm text-slate-400 font-bold">
                  {t('courier.common.customer', 'العميل')}: {customerName} {customerPhone ? `• ${customerPhone}` : ''}
                </p>
                {!deliveryEnabledForCourier && <p className="text-[11px] md:text-xs text-amber-300 font-black">{t('courier.ordersTab.shopInternalDeliveryNote', 'التوصيل الداخلي للمتجر')}</p>}
                <p className="text-xs text-slate-500">{new Date(order.created_at || order.createdAt).toLocaleString('ar-EG')}</p>
              </div>

              <div className="flex flex-wrap gap-2 md:gap-3">
                {deliveryEnabledForCourier && location && (
                  <a href={buildGoogleMapsLink({ lat: location.lat, lng: location.lng, ...(hasShopCoords ? { originLat: shopLat, originLng: shopLng } : {}) })} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-2xl bg-[#00E5FF]/10 text-[#00E5FF] font-black text-xs">
                    <MapPin size={12} /> {t('courier.common.openMap', 'الخريطة')}
                  </a>
                )}
                {customerPhone && (
                  <a href={`tel:${customerPhone}`} className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-2xl bg-white/5 text-slate-200 hover:bg-white/10 font-black text-xs">
                    <Phone size={12} /> {t('courier.common.call', 'اتصال')}
                  </a>
                )}
                {customerPhone && (
                  <button type="button" onClick={() => copyText(customerPhone, t('courier.ordersTab.copyCustomerPhoneFallback', 'نسخ رقم العميل'))} className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-2xl bg-white/5 text-slate-200 hover:bg-white/10 font-black text-xs">
                    <Copy size={12} /> {t('courier.common.copyNumber', 'نسخ الرقم')}
                  </button>
                )}
                <span className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-2xl bg-white/5 text-slate-200 font-black text-xs">
                  {t('courier.common.total', 'الإجمالي')}: {t('courier.common.egpAbbr', 'ج.م')} {Number.isFinite(grandTotal) ? grandTotal.toLocaleString() : '0'}
                </span>
                {fee > 0 && (
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-2xl bg-amber-500/10 text-amber-300 font-black text-xs">
                    {t('courier.ordersTab.deliveryFee', 'رسوم التوصيل')}: {t('courier.common.egpAbbr', 'ج.م')} {fee}
                  </span>
                )}
              </div>

              {deliveryEnabledForCourier && (manualAddress || location?.address || deliveryNote || location?.note || customerNote) && (
                <div className="bg-slate-950/50 border border-white/5 rounded-2xl p-3 md:p-4">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('courier.ordersTab.deliveryInfo', 'معلومات التوصيل')}</div>
                  <div className="mt-3 text-slate-200 font-bold text-sm space-y-1">
                    {(manualAddress || location?.address) && <div>{t('courier.common.address', 'العنوان')}: {manualAddress || location?.address}</div>}
                    {(deliveryNote || location?.note) && <div>{t('courier.ordersTab.deliveryNote', 'ملاحظة التوصيل')}: {deliveryNote || location?.note}</div>}
                    {customerNote && <div>{t('courier.ordersTab.orderNote', 'ملاحظة الطلب')}: {customerNote}</div>}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 md:mt-6 grid md:grid-cols-2 gap-4 md:gap-6">
              <div className="bg-slate-950/50 border border-white/5 rounded-2xl p-3 md:p-4">
                <p className="text-xs text-slate-500 font-black mb-2 md:mb-3">{t('courier.ordersTab.items', 'الأصناف')}</p>
                <ul className="space-y-1 md:space-y-2 text-xs md:text-sm text-slate-300">
                  {(order.items || []).map((item: OrderItem) => (
                    <li key={item.id} className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate">{item.product?.name || t('courier.ordersTab.product', 'منتج')}</div>
                        {(() => {
                          const addonsText = formatAddonsCompact(item?.addons ?? item?.extras ?? item?.addOns, t);
                          if (!addonsText) return null;
                          return <div className="text-[10px] md:text-xs text-slate-500 font-black mt-1 break-words">{addonsText}</div>;
                        })()}
                      </div>
                      <div className="shrink-0 text-left">
                        {(() => {
                          const qty = Number(item.quantity || 0);
                          const unitPrice = typeof item?.price === 'number' ? item.price : Number(item?.price ?? NaN);
                          const safeQty = Number.isFinite(qty) && qty > 0 ? qty : 1;
                          const lineTotal = Number.isFinite(unitPrice) ? unitPrice * safeQty : NaN;
                          const priceText = Number.isFinite(unitPrice) && unitPrice >= 0 ? `${t('courier.common.egpAbbr', 'ج.م')} ${Math.round(unitPrice * 100) / 100}` : '';
                          const totalText = safeQty > 1 && Number.isFinite(lineTotal) ? ` (${t('courier.common.total', 'الإجمالي')} ${Math.round(lineTotal * 100) / 100})` : '';
                          return priceText ? <div className="text-slate-200 font-black text-xs md:text-sm whitespace-nowrap">{priceText}{totalText}</div> : null;
                        })()}
                        <div className="text-slate-400 font-black text-[10px] md:text-xs whitespace-nowrap">× {item.quantity}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-950/50 border border-white/5 rounded-2xl p-3 md:p-4 space-y-3 md:space-y-4">
                <div>
                  <p className="text-xs text-slate-500 font-black">{t('courier.ordersTab.currentStatus', 'الحالة الحالية')}</p>
                  <p className="text-xs md:text-sm font-black text-white">{String(order.status || 'PENDING')}</p>
                </div>
                <div className="flex flex-wrap gap-2 md:gap-3">
                  <button disabled className={`inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-2xl text-xs font-black ${['CONFIRMED','PREPARING','READY','DELIVERED'].includes(status) ? 'bg-emerald-500/15 text-emerald-300' : 'bg-white/5 text-slate-500'}`}>
                    <CheckCircle size={12} /> {t('courier.ordersTab.accepted', 'مقبول')}
                  </button>
                  <button disabled className={`inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-2xl text-xs font-black ${['PREPARING','READY','DELIVERED'].includes(status) ? 'bg-amber-500/15 text-amber-300' : 'bg-white/5 text-slate-500'}`}>
                    <CheckCircle size={12} /> {t('courier.ordersTab.inProgress', 'قيد التنفيذ')}
                  </button>
                  <button disabled className={`inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-2xl text-xs font-black ${['READY','DELIVERED'].includes(status) ? 'bg-indigo-500/15 text-indigo-300' : 'bg-white/5 text-slate-500'}`}>
                    <CheckCircle size={12} /> {t('courier.ordersTab.ready', 'جاهز')}
                  </button>
                  <button disabled className={`inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-2xl text-xs font-black ${handedToCourier ? 'bg-sky-500/15 text-sky-300' : 'bg-white/5 text-slate-500'}`}>
                    <CheckCircle size={12} /> {t('courier.ordersTab.handedToCourier', 'سُلّم للمندوب')}
                  </button>
                  <button
                    disabled={delivered || status !== 'READY' || !handedToCourier}
                    onClick={async () => {
                      if (delivered || status !== 'READY' || !handedToCourier) return;
                      if (!window.confirm(t('courier.ordersTab.confirmDelivered', 'تأكيد التسليم؟'))) return;
                      await updateOrder(String(order.id), { status: 'DELIVERED' });
                    }}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-2xl text-xs font-black ${delivered || status !== 'READY' || !handedToCourier ? 'bg-white/5 text-slate-500 cursor-not-allowed' : 'bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25'}`}
                  >
                    <CheckCircle size={12} /> {t('courier.ordersTab.delivered', 'تم التسليم')}
                  </button>
                  <button
                    disabled={codCollected}
                    onClick={async () => {
                      if (codCollected) return;
                      if (!window.confirm(t('courier.ordersTab.confirmCashCollected', 'تأكيد استلام النقود؟'))) return;
                      await updateOrder(String(order.id), { codCollected: true });
                    }}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-2xl text-xs font-black ${codCollected ? 'bg-white/5 text-slate-500 cursor-not-allowed' : 'bg-amber-500/15 text-amber-300 hover:bg-amber-500/25'}`}
                  >
                    <Banknote size={12} /> {codCollected ? t('courier.ordersTab.cashCollected', 'تم التحصيل') : t('courier.ordersTab.collectCash', 'تحصيل نقدي')}
                  </button>
                  {location?.address && (
                    <button type="button" onClick={() => copyText(String(location.address), t('courier.ordersTab.copyAddressFallback', 'نسخ العنوان'))} className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-2xl text-xs font-black bg-white/5 text-slate-200 hover:bg-white/10">
                      <Copy size={12} /> {t('courier.common.copyAddress', 'نسخ العنوان')}
                    </button>
                  )}
                </div>
                {(location?.address || location?.note) && (
                  <div className="text-xs text-slate-400">
                    {location?.address && <p>{t('courier.common.address', 'العنوان')}: {location.address}</p>}
                    {location?.note && <p>{t('courier.ordersTab.notes', 'ملاحظات')}: {location.note}</p>}
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
