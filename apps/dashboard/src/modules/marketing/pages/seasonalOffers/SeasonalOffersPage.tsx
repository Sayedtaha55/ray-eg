import React, { useState } from 'react';
import { CalendarHeart, Plus, Search, Edit, Trash2, X, Snowflake, Sun, Flower, Leaf } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Props = { shopId: string; shop?: any };

type SeasonalOffer = { id: string; name: string; season: 'winter' | 'spring' | 'summer' | 'autumn' | 'ramadan' | 'newyear'; discount: number; startDate: string; endDate: string; status: 'active' | 'inactive' | 'scheduled' };

const SEASON_ICONS: Record<string, React.ReactNode> = {
  winter: <Snowflake size={20} />, spring: <Flower size={20} />, summer: <Sun size={20} />, autumn: <Leaf size={20} />, ramadan: <CalendarHeart size={20} />, newyear: <CalendarHeart size={20} />,
};

const SeasonalOffersPage: React.FC<Props> = ({ shopId, shop }) => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [offers, setOffers] = useState<SeasonalOffer[]>([
    { id: '1', name: isArabic ? 'عرض رمضان' : 'Ramadan Offer', season: 'ramadan', discount: 25, startDate: '2026-03-01', endDate: '2026-03-30', status: 'inactive' },
    { id: '2', name: isArabic ? 'عرض الصيف' : 'Summer Sale', season: 'summer', discount: 30, startDate: '2026-07-01', endDate: '2026-08-31', status: 'active' },
    { id: '3', name: isArabic ? 'عرض رأس السنة' : 'New Year Deal', season: 'newyear', discount: 40, startDate: '2026-12-20', endDate: '2026-12-31', status: 'scheduled' },
  ]);

  const filtered = offers.filter(o => o.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="bg-white p-4 sm:p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div><h3 className="text-xl sm:text-2xl md:text-3xl font-black">{isArabic ? 'العروض الموسمية' : 'Seasonal Offers'}</h3><p className="mt-1 text-xs sm:text-sm font-bold text-slate-400">{isArabic ? 'عروض المواسم والمناسبات' : 'Seasonal and holiday offers'}</p></div>
        <button onClick={() => setShowModal(true)} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors"><Plus size={18} /> {isArabic ? 'عرض جديد' : 'New Offer'}</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: isArabic ? 'إجمالي العروض' : 'Total Offers', value: offers.length, color: 'bg-blue-50 text-blue-600' },
          { label: isArabic ? 'نشطة' : 'Active', value: offers.filter(o => o.status === 'active').length, color: 'bg-green-50 text-green-600' },
          { label: isArabic ? 'مجدولة' : 'Scheduled', value: offers.filter(o => o.status === 'scheduled').length, color: 'bg-amber-50 text-amber-600' },
          { label: isArabic ? 'متوسط الخصم' : 'Avg Discount', value: offers.length ? Math.round(offers.reduce((s, o) => s + o.discount, 0) / offers.length) + '%' : '0%', color: 'bg-purple-50 text-purple-600' },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100">
            <div className={`p-2 rounded-xl ${s.color}`}><CalendarHeart size={20} /></div>
            <div><p className="text-xs font-bold text-slate-400">{s.label}</p><p className="text-lg font-black">{s.value}</p></div>
          </div>
        ))}
      </div>

      <div className="relative mb-4">
        <Search className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-300" size={18} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={isArabic ? 'بحث...' : 'Search...'} className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((o) => (
          <div key={o.id} className="p-5 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3"><div className="p-2 rounded-xl bg-purple-50 text-purple-600">{SEASON_ICONS[o.season] || <CalendarHeart size={20} />}</div><div><p className="font-bold text-sm">{o.name}</p><p className="text-xs text-slate-400 capitalize">{o.season}</p></div></div>
              <div className="flex items-center gap-2"><Edit size={16} className="text-slate-400 hover:text-slate-600 cursor-pointer" /><Trash2 size={16} className="text-slate-400 hover:text-red-500 cursor-pointer" /></div>
            </div>
            <div className="text-center py-3 mb-3 rounded-xl bg-gradient-to-r from-purple-50 to-blue-50">
              <p className="text-3xl font-black text-purple-600">{o.discount}%</p>
              <p className="text-xs text-slate-400">{isArabic ? 'خصم' : 'discount'}</p>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>{new Date(o.startDate).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US')}</span>
              <span>→</span>
              <span>{new Date(o.endDate).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US')}</span>
            </div>
            <span className={`px-2 py-1 rounded-lg text-xs font-bold ${o.status === 'active' ? 'bg-green-100 text-green-600' : o.status === 'scheduled' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>{o.status === 'active' ? (isArabic ? 'نشط' : 'Active') : o.status === 'scheduled' ? (isArabic ? 'مجدول' : 'Scheduled') : (isArabic ? 'غير نشط' : 'Inactive')}</span>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4"><h4 className="text-lg font-black">{isArabic ? 'عرض جديد' : 'New Offer'}</h4><button onClick={() => setShowModal(false)}><X size={20} className="text-slate-400" /></button></div>
            <div className="space-y-3">
              <input placeholder={isArabic ? 'اسم العرض' : 'Offer name'} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"><option>{isArabic ? 'شتاء' : 'Winter'}</option><option>{isArabic ? 'ربيع' : 'Spring'}</option><option>{isArabic ? 'صيف' : 'Summer'}</option><option>{isArabic ? 'خريف' : 'Autumn'}</option><option>{isArabic ? 'رمضان' : 'Ramadan'}</option><option>{isArabic ? 'رأس السنة' : 'New Year'}</option></select>
              <input type="number" placeholder={isArabic ? 'نسبة الخصم %' : 'Discount %'} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <div className="grid grid-cols-2 gap-3"><input type="date" className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm" /><input type="date" className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm" /></div>
              <button onClick={() => setShowModal(false)} className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold">{isArabic ? 'إنشاء' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeasonalOffersPage;
