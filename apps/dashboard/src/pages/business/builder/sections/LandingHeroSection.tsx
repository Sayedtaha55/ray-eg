import React from 'react';
import { Image as ImageIcon, ToggleLeft, ToggleRight } from 'lucide-react';

type Props = {
  config: any;
  setConfig: React.Dispatch<React.SetStateAction<any>>;
  shop?: any;
};

const CTA_STYLES = [
  { id: 'solid', label: 'صلب' },
  { id: 'gradient', label: 'تدرج' },
  { id: 'outline', label: 'حدود' },
];

const LandingHeroSection: React.FC<Props> = ({ config, setConfig }) => {
  const landing = (config?.landingPage || {}) as Record<string, any>;

  const update = (key: string, value: any) => {
    setConfig({ ...config, landingPage: { ...landing, [key]: value } });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-4 bg-gradient-to-l from-rose-50 to-amber-50 rounded-2xl border border-rose-100">
        <div className="w-10 h-10 rounded-xl bg-rose-500 flex items-center justify-center text-white shadow-lg">
          <ImageIcon size={20} />
        </div>
        <div className="flex-1">
          <h3 className="font-black text-sm text-slate-900">القسم الرئيسي (Hero)</h3>
          <p className="text-[11px] font-bold text-slate-500 mt-0.5">إعدادات الزر والعرض</p>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">عنوان CTA الرئيسي</label>
        <input
          type="text"
          value={String(landing.ctaText || 'أضف للسلة')}
          onChange={(e) => update('ctaText', e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-right"
          placeholder="أضف للسلة"
        />
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">نص زر الاحتياطي</label>
        <input
          type="text"
          value={String(landing.reserveText || 'احجز الآن')}
          onChange={(e) => update('reserveText', e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-right"
          placeholder="احجز الآن"
        />
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">نص CTA النهائي</label>
        <input
          type="text"
          value={String(landing.finalCtaText || 'احصل عليه الآن')}
          onChange={(e) => update('finalCtaText', e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-right"
          placeholder="احصل عليه الآن"
        />
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">شكل زر CTA</label>
        <div className="grid grid-cols-3 gap-2">
          {CTA_STYLES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => update('ctaStyle', s.id)}
              className={`px-3 py-2 rounded-xl border-2 text-xs font-black transition-all ${String(landing.ctaStyle || 'solid') === s.id ? 'border-slate-900 bg-slate-50' : 'border-slate-100 hover:border-slate-200'}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
      <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 cursor-pointer">
        <span className="text-xs font-black text-slate-700">إظهار عداد الكمية</span>
        {landing.showQuantity !== false ? (
          <ToggleRight size={24} className="text-emerald-500" onClick={() => update('showQuantity', false)} />
        ) : (
          <ToggleLeft size={24} className="text-slate-300" onClick={() => update('showQuantity', true)} />
        )}
      </label>
      <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 cursor-pointer">
        <span className="text-xs font-black text-slate-700">إظهار شارة الخصم</span>
        {landing.showDiscountBadge !== false ? (
          <ToggleRight size={24} className="text-emerald-500" onClick={() => update('showDiscountBadge', false)} />
        ) : (
          <ToggleLeft size={24} className="text-slate-300" onClick={() => update('showDiscountBadge', true)} />
        )}
      </label>
      <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 cursor-pointer">
        <span className="text-xs font-black text-slate-700">إظهار النجوم (تقييم)</span>
        {landing.showRating !== false ? (
          <ToggleRight size={24} className="text-emerald-500" onClick={() => update('showRating', false)} />
        ) : (
          <ToggleLeft size={24} className="text-slate-300" onClick={() => update('showRating', true)} />
        )}
      </label>
      <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 cursor-pointer">
        <span className="text-xs font-black text-slate-700">إظهار زر المفضلة</span>
        {landing.showFavorite !== false ? (
          <ToggleRight size={24} className="text-emerald-500" onClick={() => update('showFavorite', false)} />
        ) : (
          <ToggleLeft size={24} className="text-slate-300" onClick={() => update('showFavorite', true)} />
        )}
      </label>
      <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 cursor-pointer">
        <span className="text-xs font-black text-slate-700">إظهار زر المشاركة</span>
        {landing.showShare !== false ? (
          <ToggleRight size={24} className="text-emerald-500" onClick={() => update('showShare', false)} />
        ) : (
          <ToggleLeft size={24} className="text-slate-300" onClick={() => update('showShare', true)} />
        )}
      </label>
      <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 cursor-pointer">
        <span className="text-xs font-black text-slate-700">إظهار زر واتساب</span>
        {landing.showWhatsapp !== false ? (
          <ToggleRight size={24} className="text-emerald-500" onClick={() => update('showWhatsapp', false)} />
        ) : (
          <ToggleLeft size={24} className="text-slate-300" onClick={() => update('showWhatsapp', true)} />
        )}
      </label>
    </div>
  );
};

export default LandingHeroSection;
