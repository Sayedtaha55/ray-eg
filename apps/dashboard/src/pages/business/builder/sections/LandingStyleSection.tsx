import React from 'react';
import { Palette } from 'lucide-react';

type Props = {
  config: any;
  setConfig: React.Dispatch<React.SetStateAction<any>>;
  shop?: any;
};

const LandingStyleSection: React.FC<Props> = ({ config, setConfig }) => {
  const landing = (config?.landingPage || {}) as Record<string, any>;

  const update = (key: string, value: any) => {
    setConfig({ ...config, landingPage: { ...landing, [key]: value } });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-4 bg-gradient-to-l from-rose-50 to-amber-50 rounded-2xl border border-rose-100">
        <div className="w-10 h-10 rounded-xl bg-rose-500 flex items-center justify-center text-white shadow-lg">
          <Palette size={20} />
        </div>
        <div className="flex-1">
          <h3 className="font-black text-sm text-slate-900">الألوان والتصميم</h3>
          <p className="text-[11px] font-bold text-slate-500 mt-0.5">تخصيص ألوان وشكل صفحة الهبوط</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">لون CTA</label>
          <input
            type="color"
            value={String(landing.ctaColor || '#00E5FF')}
            onChange={(e) => update('ctaColor', e.target.value)}
            className="w-full h-10 rounded-xl border border-slate-200 bg-white"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">لون النص</label>
          <input
            type="color"
            value={String(landing.ctaTextColor || '#FFFFFF')}
            onChange={(e) => update('ctaTextColor', e.target.value)}
            className="w-full h-10 rounded-xl border border-slate-200 bg-white"
          />
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">لون خلفية القسم النهائي</label>
        <input
          type="color"
          value={String(landing.finalCtaBg || '#0F172A')}
          onChange={(e) => update('finalCtaBg', e.target.value)}
          className="w-full h-10 rounded-xl border border-slate-200 bg-white"
        />
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">شكل الصورة</label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'rounded', label: 'دائري' },
            { id: 'sharp', label: 'حاد' },
            { id: 'circle', label: 'بيضاوي' },
          ].map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => update('imageShape', s.id)}
              className={`px-3 py-2 rounded-xl border-2 text-xs font-black transition-all ${String(landing.imageShape || 'rounded') === s.id ? 'border-slate-900 bg-slate-50' : 'border-slate-100 hover:border-slate-200'}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LandingStyleSection;
