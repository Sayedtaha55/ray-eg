'use client';

import React from 'react';
import { MapPin, Loader2, CheckCircle, RefreshCw, X } from 'lucide-react';
import { useT } from '@/i18n/useT';

type Props = {
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
};

const CourierOffersTab: React.FC<Props> = ({
  offers, offersLoading, offersRefreshing, acceptingOfferId,
  onRefresh, onAccept, onReject, parseCodLocation, getDeliveryFeeFromNotes, buildGoogleMapsLink,
}) => {
  const t = useT();

  if (offersLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-amber-300" /></div>;
  }

  if ((offers || []).length === 0) {
    return (
      <div className="bg-slate-900 border border-white/5 rounded-[2rem] md:rounded-[2.5rem] p-10 md:p-12 text-center text-slate-400 font-bold">
        {t('courier.offersTab.noOffers', 'لا توجد عروض متاحة حالياً')}
      </div>
    );
  }

  return (
    <div className="space-y-3 md:space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg md:text-xl font-black">{t('courier.offersTab.title', 'عروض التوصيل')}</h3>
        <button onClick={onRefresh} className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/5 hover:bg-white/10 text-xs font-black">
          <RefreshCw size={14} className={offersRefreshing ? 'animate-spin' : ''} />
          {t('courier.common.refresh', 'تحديث')}
        </button>
      </div>

      {(offers || [])
        .filter((o) => String(o?.status || '').toUpperCase() === 'PENDING')
        .map((offer) => {
          const order = offer?.order;
          const fee = getDeliveryFeeFromNotes(order?.notes) || 0;
          const grandTotal = Number(order?.total || 0) + fee;
          const location = parseCodLocation(order?.notes);
          const shopLat = Number(order?.shop?.latitude);
          const shopLng = Number(order?.shop?.longitude);
          const hasShopCoords = Number.isFinite(shopLat) && Number.isFinite(shopLng);

          return (
            <div key={String(offer.id)} className="bg-slate-900 border border-white/5 rounded-[2rem] md:rounded-[2.5rem] p-4 md:p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 font-black uppercase">{t('courier.offersTab.orderOffer', 'عرض توصيل')}</p>
                  <h3 className="text-lg font-black">{order?.shop?.name || t('courier.common.unknownShop', 'متجر مجهول')}</h3>
                  <p className="text-xs text-slate-400 font-bold">
                    {t('courier.common.customer', 'العميل')}: {order?.user?.name || t('courier.common.unknown', 'مجهول')} {order?.user?.phone ? `• ${order.user.phone}` : ''}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/5 text-slate-200 font-black text-xs">
                      {t('courier.common.total', 'الإجمالي')}: {t('courier.common.egpAbbr', 'ج.م')} {Number.isFinite(grandTotal) ? grandTotal.toLocaleString() : '0'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {location && (
                    <a href={buildGoogleMapsLink({ lat: location.lat, lng: location.lng, ...(hasShopCoords ? { originLat: shopLat, originLng: shopLng } : {}) })} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-[#00E5FF]/10 text-[#00E5FF] font-black text-xs">
                      <MapPin size={12} /> {t('courier.common.openMap', 'الخريطة')}
                    </a>
                  )}
                  <button onClick={() => onAccept(String(offer.id))} disabled={acceptingOfferId === String(offer.id)} className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 font-black text-xs disabled:opacity-60 disabled:cursor-not-allowed">
                    {acceptingOfferId === String(offer.id) ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                    {acceptingOfferId === String(offer.id) ? t('courier.offersTab.accepting', 'جاري القبول...') : t('courier.common.accept', 'قبول')}
                  </button>
                  <button onClick={() => onReject(String(offer.id))} className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-red-500/10 text-red-300 hover:bg-red-500/15 font-black text-xs">
                    <X size={12} /> {t('courier.common.reject', 'رفض')}
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
