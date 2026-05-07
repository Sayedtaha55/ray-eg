'use client';

import React from 'react';
import { MapPin, Package2, Phone, ReceiptText } from 'lucide-react';
import OrderReturnsPanel from './OrderReturnsPanel';
import { parseCodLocation, isDeliveryDisabledOrder, cleanText } from './sales-formatters';

type Props = {
  open: boolean;
  onClose: () => void;
  sale: any;
  t: (key: string, fallback?: string) => string;
  locale: string;
  isArabic: boolean;
  statusLabel: string;
  egpLabel: string;
};

const SaleDetailsModal: React.FC<Props> = ({ open, onClose, sale, t, locale, isArabic, statusLabel, egpLabel }) => {
  if (!open || !sale) return null;

  const orderId = String(sale?.id || '').trim();
  const createdAtRaw = sale?.created_at || sale?.createdAt;
  const createdAt = createdAtRaw ? new Date(createdAtRaw).toLocaleString(locale) : '-';

  const loc = parseCodLocation(sale?.notes);
  const deliveryNote = cleanText(sale?.deliveryNote ?? sale?.delivery_note) || cleanText(loc?.note);
  const customerNote = cleanText(sale?.customerNote ?? sale?.customer_note);

  const customerName = cleanText(sale?.user?.fullName || sale?.user?.name);
  const customerPhone = cleanText(sale?.customerPhone || sale?.customer_phone || sale?.user?.phone || sale?.phone);

  const deliveryMethod = isDeliveryDisabledOrder(sale)
    ? t('business.sales.selfPickup', 'استلام ذاتي')
    : t('business.sales.viaCourier', 'عن طريق مندوب');

  const address = (() => {
    const manual = cleanText(sale?.deliveryAddressManual ?? sale?.delivery_address_manual ?? sale?.address ?? sale?.user?.address);
    return manual || cleanText(loc?.address) || '-';
  })();

  const items = Array.isArray(sale?.items) ? sale.items : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-[2rem] w-full max-w-3xl mx-4 p-5 sm:p-7 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        dir={isArabic ? 'rtl' : 'ltr'}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="font-black text-slate-900">{t('business.sales.orderDetails', 'تفاصيل الطلب')}</div>
          <button onClick={onClose} className="px-3 py-2 rounded-xl hover:bg-slate-100 font-black">✕</button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('business.sales.orderNumber', 'رقم الطلب')}</div>
            <div className="mt-2 text-slate-900 font-black">#{orderId.slice(0, 8).toUpperCase() || '-'}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('business.sales.colStatus', 'الحالة')}</div>
            <div className="mt-2 text-slate-900 font-black">{statusLabel}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('business.sales.colDateTime', 'التاريخ')}</div>
            <div className="mt-2 text-slate-900 font-black text-sm leading-6">{createdAt}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('business.sales.colTotal', 'الإجمالي')}</div>
            <div className="mt-2 text-slate-900 font-black">{egpLabel} {Number(sale?.total || 0).toLocaleString()}</div>
          </div>
        </div>

        <div className="mt-4 rounded-[1.5rem] border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-slate-900 font-black text-sm">
            <ReceiptText size={16} /> {t('business.sales.customerOrderSummary', 'بيانات العميل')}
          </div>
          <div className="mt-3 space-y-2 text-sm font-bold text-slate-600">
            <div className="flex items-start justify-between gap-3"><span className="text-slate-400">{t('business.sales.name', 'الاسم')}</span><span className="text-slate-900 text-left">{customerName || '-'}</span></div>
            <div className="flex items-start justify-between gap-3"><span className="text-slate-400">{t('business.sales.customerPhone', 'الهاتف')}</span><span className="text-slate-900 text-left">{customerPhone || '-'}</span></div>
            <div className="flex items-start justify-between gap-3"><span className="text-slate-400">{t('business.sales.deliveryMethod', 'طريقة التوصيل')}</span><span className="text-slate-900 text-left">{deliveryMethod}</span></div>
            <div className="flex items-start justify-between gap-3"><span className="text-slate-400">{t('business.sales.address', 'العنوان')}</span><span className="text-slate-900 text-left">{address}</span></div>
          </div>

          {isDeliveryDisabledOrder(sale) ? (
            <div className="mt-3 rounded-2xl bg-amber-50 border border-amber-100 px-3 py-2 text-[11px] font-black text-amber-700">{t('business.sales.selfPickupAddressHint', 'عنوان الاستلام')}</div>
          ) : (
            <div className="mt-3 rounded-2xl bg-sky-50 border border-sky-100 px-3 py-2 text-[11px] font-black text-sky-700">{t('business.sales.courierMapHint', 'استخدم الخريطة للتوصيل')}</div>
          )}

          {loc?.lat && loc?.lng ? (
            <button
              type="button"
              className="mt-3 w-full px-4 py-3 rounded-2xl bg-slate-900 text-white font-black text-sm flex items-center justify-center gap-2"
              onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${loc.lat},${loc.lng}`, '_blank')}
            >
              <MapPin size={18} /> {t('business.sales.openMap', 'فتح الخريطة')}
            </button>
          ) : null}
        </div>

        {(deliveryNote || customerNote) ? (
          <div className="mt-4 rounded-[1.5rem] border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 text-slate-900 font-black text-sm">
              <Phone size={16} /> {t('business.sales.importantNotes', 'ملاحظات مهمة')}
            </div>
            <div className="mt-3 space-y-2 text-sm font-bold text-slate-700">
              {deliveryNote ? <div><span className="text-slate-400">{t('business.sales.deliveryNote', 'ملاحظة توصيل')}:</span> {deliveryNote}</div> : null}
              {customerNote ? <div><span className="text-slate-400">{t('business.sales.customerNote', 'ملاحظة العميل')}:</span> {customerNote}</div> : null}
            </div>
          </div>
        ) : null}

        <div className="mt-4 rounded-[1.5rem] border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-slate-900 font-black text-sm">
            <Package2 size={16} /> {t('business.sales.products', 'المنتجات')}
          </div>
          <div className="mt-3 space-y-3">
            {items.map((it: any, idx: number) => {
              const name = it?.product?.name || it?.name || it?.title || t('business.sales.productFallback', 'منتج');
              const qty = Number(it?.quantity || it?.qty || 1);
              const price = Number(it?.price || it?.unitPrice || 0);
              const lineTotal = (Number.isFinite(price) ? price : 0) * (Number.isFinite(qty) ? qty : 1);
              return (
                <div key={idx} className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-slate-900 font-black text-sm break-words">{name}</div>
                    </div>
                    <div className="shrink-0 text-left">
                      <div className="text-slate-900 font-black text-sm">× {Number.isFinite(qty) ? qty : 1}</div>
                      <div className="text-[11px] text-slate-500 font-bold">{egpLabel} {Number(price || 0).toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-200 text-[12px] font-black text-slate-700">{t('business.sales.lineSubtotal', 'إجمالي السطر')}: {egpLabel} {Number(lineTotal || 0).toLocaleString()}</div>
                </div>
              );
            })}
            {items.length === 0 ? (
              <div className="text-slate-400 font-bold text-sm">{t('business.sales.noProducts', 'لا توجد منتجات')}</div>
            ) : null}
          </div>
        </div>

        <details className="mt-4 rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
          <summary className="cursor-pointer list-none font-black text-sm text-slate-700">{t('business.sales.showExtraData', 'عرض بيانات إضافية')}</summary>
          <div className="mt-3 text-xs leading-6 font-bold text-slate-500 whitespace-pre-wrap break-words">{sale?.notes || t('business.sales.noExtraData', 'لا توجد بيانات إضافية')}</div>
        </details>

        <div className="mt-4">
          <OrderReturnsPanel order={sale} />
        </div>
      </div>
    </div>
  );
};

export default SaleDetailsModal;
