import React, { useMemo } from 'react';
import { Tag, TrendingUp, Eye, Percent, Calendar, Clock, Flame } from 'lucide-react';
import { Offer } from '@/types';
import SmartImage from '@/components/common/ui/SmartImage';
import { useTranslation } from 'react-i18next';
import { getShopActivityVocabulary } from '@/utils/businessActivityVocabulary';

type Props = {
  offers: Offer[];
  onDelete: (id: string) => void;
  onCreate: () => void;
  shop?: any;
};

const PromotionsTab: React.FC<Props> = ({ offers, onDelete, onCreate, shop }) => {
  const { t, i18n } = useTranslation();
  const activityVocab = getShopActivityVocabulary(shop, i18n.language);
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const locale = isArabic ? 'ar-EG' : 'en-US';

  const stats = useMemo(() => {
    const totalOffers = offers.length;
    const avgDiscount = totalOffers > 0
      ? Math.round(offers.reduce((sum, o: any) => sum + Number(o.discount || 0), 0) / totalOffers)
      : 0;
    const totalSavings = offers.reduce((sum, o: any) => sum + Math.max(0, Number(o.oldPrice || 0) - Number(o.newPrice || 0)), 0);
    const maxDiscount = offers.reduce((max, o: any) => Math.max(max, Number(o.discount || 0)), 0);
    return { totalOffers, avgDiscount, totalSavings, maxDiscount };
  }, [offers]);

  const getExpiryStatus = (offer: any): { daysLeft: number | null; label: string; color: string } => {
    const expiry = offer.expiresAt || offer.endDate || offer.validUntil;
    if (!expiry) return { daysLeft: null, label: 'بدون تاريخ انتهاء', color: 'text-slate-400' };
    const days = Math.floor((new Date(expiry).getTime() - Date.now()) / (86400000));
    if (days < 0) return { daysLeft: days, label: 'منتهي', color: 'text-red-500' };
    if (days === 0) return { daysLeft: 0, label: 'ينتهي اليوم', color: 'text-orange-500' };
    if (days <= 3) return { daysLeft: days, label: `ينتهي خلال ${days} أيام`, color: 'text-amber-600' };
    if (days <= 7) return { daysLeft: days, label: `ينتهي خلال ${days} أيام`, color: 'text-blue-500' };
    return { daysLeft: days, label: `ينتهي خلال ${days} يوم`, color: 'text-slate-400' };
  };

  return (
  <div className="space-y-6">
    {/* Stats Cards */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
            <Tag className="w-5 h-5 text-purple-600" />
          </div>
          <span className="text-xs font-black text-slate-400 uppercase tracking-wide">العروض النشطة</span>
        </div>
        <p className="text-3xl font-black text-slate-900">{stats.totalOffers}</p>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Percent className="w-5 h-5 text-blue-600" />
          </div>
          <span className="text-xs font-black text-slate-400 uppercase tracking-wide">متوسط الخصم</span>
        </div>
        <p className="text-3xl font-black text-slate-900">{stats.avgDiscount}%</p>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <span className="text-xs font-black text-slate-400 uppercase tracking-wide">إجمالي التوفير</span>
        </div>
        <p className="text-3xl font-black text-slate-900">{t('business.promotions.currency')} {stats.totalSavings.toLocaleString()}</p>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
            <Flame className="w-5 h-5 text-orange-600" />
          </div>
          <span className="text-xs font-black text-slate-400 uppercase tracking-wide">أعلى خصم</span>
        </div>
        <p className="text-3xl font-black text-slate-900">{stats.maxDiscount}%</p>
      </div>
    </div>

    {/* Main Content */}
    <div className="bg-white p-8 md:p-12 rounded-[3.5rem] border border-slate-100 shadow-sm">
      <div className="flex items-start md:items-center justify-between mb-10 flex-row-reverse gap-4">
        <h3 className="text-3xl font-black">{activityVocab.promotionsTabLabel}</h3>
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 flex-row-reverse w-full md:w-auto">
          <button
            onClick={onCreate}
            className="px-4 md:px-6 py-2 md:py-3 bg-slate-900 text-white rounded-2xl font-black text-[11px] md:text-xs flex items-center justify-center gap-2 hover:bg-black transition-all"
          >
            <Tag size={14} className="md:hidden" />
            <Tag size={16} className="hidden md:block" />
            {t('business.promotions.createNewOffer')}
          </button>
          <span className="bg-purple-100 text-[#BD00FF] px-4 md:px-6 py-2 rounded-full font-black text-[11px] md:text-xs uppercase text-center">{offers.length} {t('business.promotions.activeOffers')}</span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {offers.length === 0 ? (
          <div className="col-span-full py-32 text-center border-2 border-dashed border-slate-100 rounded-[3rem] text-slate-300 font-bold">
            {t('business.promotions.noActiveOffers')}
          </div>
        ) : (
          offers.map((offer: any) => {
            const expiry = getExpiryStatus(offer);
            return (
              <div key={offer.id} className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 flex flex-col gap-4 group hover:shadow-xl transition-all">
                <div className="relative aspect-video rounded-3xl overflow-hidden shadow-sm">
                  <SmartImage
                    src={offer.imageUrl}
                    className="w-full h-full"
                    imgClassName="object-cover group-hover:scale-105 transition-transform"
                    loading="lazy"
                  />
                  <div className="absolute top-4 left-4 bg-[#BD00FF] text-white px-4 py-1.5 rounded-xl font-black text-sm shadow-xl shadow-purple-500/20">
                    -{offer.discount}%
                  </div>
                  {expiry.daysLeft !== null && expiry.daysLeft <= 3 && (
                    <div className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1 rounded-lg font-black text-[10px] shadow-lg flex items-center gap-1">
                      <Clock size={10} />
                      {expiry.label}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-black text-xl text-slate-900 mb-1">{offer.title}</p>
                  <div className="flex items-center justify-end gap-4">
                    <span className="text-slate-300 line-through font-bold">{t('business.promotions.currency')} {offer.oldPrice}</span>
                    <span className="text-[#BD00FF] font-black text-2xl">{t('business.promotions.currency')} {offer.newPrice}</span>
                  </div>
                </div>
                {/* Expiry Info */}
                <div className="flex items-center justify-between bg-white rounded-xl px-3 py-2 border border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={12} className="text-slate-400" />
                    <span className={`text-[10px] font-black ${expiry.color}`}>{expiry.label}</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">
                    توفير {t('business.promotions.currency')} {Math.max(0, Number(offer.oldPrice || 0) - Number(offer.newPrice || 0)).toLocaleString()}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 py-3 bg-white border border-slate-100 rounded-2xl font-black text-xs text-slate-400 hover:bg-slate-50 transition-all">{t('business.promotions.editDesign')}</button>
                  <button
                    onClick={() => onDelete(offer.id)}
                    className="flex-1 py-3 bg-red-50 text-red-500 rounded-2xl font-black text-xs hover:bg-red-500 hover:text-white transition-all"
                  >
                    {t('business.promotions.stopOffer')}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  </div>
  );
};

export default PromotionsTab;
