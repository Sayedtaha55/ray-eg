import React from 'react';
import { MapPin, CheckCircle, Banknote, Phone, Copy } from 'lucide-react';

type OrderItem = {
  id: string;
  quantity: number;
  price: number;
  product?: { name?: string };
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
        const delivered = String(order.status || '').toUpperCase() === 'DELIVERED';
        const codCollected = !!order.codCollectedAt;
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
                    <li key={item.id} className="flex items-center justify-between">
                      <span>{item.product?.name || 'منتج'}</span>
                      <span className="text-slate-400">× {item.quantity}</span>
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
                    disabled={delivered}
                    onClick={async () => {
                      if (delivered) return;
                      const ok = window.confirm('تأكيد: تم تسليم الطلب للعميل؟');
                      if (!ok) return;
                      await updateOrder(String(order.id), { status: 'DELIVERED' });
                    }}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-2xl text-xs font-black ${delivered ? 'bg-white/5 text-slate-500 cursor-not-allowed' : 'bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25'}`}
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
