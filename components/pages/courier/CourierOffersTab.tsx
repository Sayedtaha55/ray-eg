import React from 'react';
import { MapPin, Loader2, CheckCircle, RefreshCw, X } from 'lucide-react';

const CourierOffersTab: React.FC<{
  offers: any[];
  offersLoading: boolean;
  offersRefreshing: boolean;
  acceptingOfferId: string | null;
  onRefresh: () => void;
  onAccept: (offerId: string) => void;
  onReject: (offerId: string) => void;
  parseCodLocation: (notes: any) => { lat: number; lng: number; note?: string; address?: string } | null;
  getDeliveryFeeFromNotes: (notes: any) => number | null;
  buildGoogleMapsLink: (payload: { lat: number; lng: number; originLat?: number; originLng?: number }) => string;
}> = ({
  offers,
  offersLoading,
  offersRefreshing,
  acceptingOfferId,
  onRefresh,
  onAccept,
  onReject,
  parseCodLocation,
  getDeliveryFeeFromNotes,
  buildGoogleMapsLink,
}) => {
  if (offersLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-amber-300" /></div>;
  }

  if ((offers || []).length === 0) {
    return (
      <div className="bg-slate-900 border border-white/5 rounded-[2rem] md:rounded-[2.5rem] p-10 md:p-12 text-center text-slate-400 font-bold">
        لا توجد عروض جديدة حالياً.
      </div>
    );
  }

  return (
    <div className="space-y-3 md:space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg md:text-xl font-black">عروض جديدة</h3>
        <button
          onClick={onRefresh}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/5 hover:bg-white/10 text-xs font-black"
        >
          <RefreshCw size={14} className={offersRefreshing ? 'animate-spin' : ''} />
          تحديث
        </button>
      </div>

      {(offers || [])
        .filter((o) => String(o?.status || '').toUpperCase() === 'PENDING')
        .map((offer) => {
          const order = offer?.order;
          const fee = getDeliveryFeeFromNotes(order?.notes) || 0;
          const grandTotal = Number(order?.total || 0) + fee;
          const location = parseCodLocation(order?.notes);
          const shopLat = Number((order as any)?.shop?.latitude);
          const shopLng = Number((order as any)?.shop?.longitude);
          const hasShopCoords = Number.isFinite(shopLat) && Number.isFinite(shopLng);

          return (
            <div key={String(offer.id)} className="bg-slate-900 border border-white/5 rounded-[2rem] md:rounded-[2.5rem] p-4 md:p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 font-black uppercase">عرض طلب</p>
                  <h3 className="text-lg font-black">{order?.shop?.name || 'متجر غير معروف'}</h3>
                  <p className="text-xs text-slate-400 font-bold">
                    العميل: {order?.user?.name || 'غير معروف'} {order?.user?.phone ? `• ${order.user.phone}` : ''}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/5 text-slate-200 font-black text-xs">
                      الإجمالي: ج.م {Number.isFinite(grandTotal) ? grandTotal.toLocaleString() : '0'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {location && (
                    <a
                      href={buildGoogleMapsLink({
                        lat: location.lat,
                        lng: location.lng,
                        ...(hasShopCoords ? { originLat: shopLat, originLng: shopLng } : {}),
                      })}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-[#00E5FF]/10 text-[#00E5FF] font-black text-xs"
                    >
                      <MapPin size={12} /> فتح الخريطة
                    </a>
                  )}

                  <button
                    onClick={() => onAccept(String(offer.id))}
                    disabled={acceptingOfferId === String(offer.id)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 font-black text-xs disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {acceptingOfferId === String(offer.id) ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <CheckCircle size={12} />
                    )}
                    {acceptingOfferId === String(offer.id) ? 'جاري القبول...' : 'قبول'}
                  </button>

                  <button
                    onClick={() => onReject(String(offer.id))}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-red-500/10 text-red-300 hover:bg-red-500/15 font-black text-xs"
                  >
                    <X size={12} /> رفض
                  </button>
                </div>
              </div>
            </div>
          );
        })}
    </div>
  );
};

export default CourierOffersTab;
