import React from 'react';
import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Props = {
  config: any;
  setConfig: React.Dispatch<React.SetStateAction<any>>;
};

const COLORS = ['#1A1A1A', '#00E5FF', '#BD00FF', '#FF0055', '#FFCC00', '#00FF77', '#0077FF', '#FF6600', '#7C3AED', '#EC4899'];

const ColorRow: React.FC<{ label: string; value: string; onChange: (v: string) => void }> = ({ label, value, onChange }) => (
  <div className="space-y-1.5 text-right">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{label}</label>
    <div className="flex items-center gap-2">
      <div className="relative flex items-center justify-center h-11 rounded-2xl border border-slate-100 bg-white p-1 flex-1">
        <input
          type="color"
          value={String(value)}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-full rounded-xl cursor-pointer border-0 p-0 bg-transparent"
        />
      </div>
      <input
        type="text"
        value={String(value)}
        onChange={(e) => onChange(e.target.value)}
        className="w-20 h-11 rounded-xl border border-slate-200 text-xs font-bold text-center bg-white"
      />
    </div>
  </div>
);

const BTN_RADIUS_OPTIONS = [
  { label: 'حاد', value: '0px' },
  { label: 'دائري', value: '9999px' },
  { label: 'متوسط', value: '12px' },
  { label: 'كبير', value: '20px' },
];

const ColorsSection: React.FC<Props> = ({ config, setConfig }) => {
  const { t } = useTranslation();
  const set = (key: string, val: string) => setConfig((prev: any) => ({ ...prev, [key]: val }));

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Theme Accent Colors */}
      <div className="space-y-3">
        <label className="text-xs font-black text-slate-900 border-r-4 border-cyan-400 pr-2 block">ألوان الثيم (اللمسات والعناصر)</label>
        <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 space-y-4">
          <ColorRow
            label="اللون الأساسي (الشعارات والنقاط والعناصر)"
            value={String(config.primaryColor || '#00E5FF')}
            onChange={(v) => set('primaryColor', v)}
          />
          <div className="grid grid-cols-5 gap-2">
            {COLORS.map((color) => (
              <button
                key={color}
                onClick={() => set('primaryColor', color)}
                className={`aspect-square rounded-xl border-2 transition-all relative hover:opacity-100 active:scale-[0.98] ${config.primaryColor === color ? 'scale-110 shadow-lg border-white ring-2 ring-slate-200' : 'border-transparent opacity-60'}`}
                style={{ backgroundColor: color }}
              >
                {config.primaryColor === color && <Check className="w-3.5 h-3.5 text-white mx-auto" />}
              </button>
            ))}
          </div>
          <ColorRow
            label="اللون الثانوي (التدرجات والخلفيات الفرعية)"
            value={String(config.secondaryColor || '#1E293B')}
            onChange={(v) => set('secondaryColor', v)}
          />
          <div className="grid grid-cols-5 gap-2">
            {COLORS.map((color) => (
              <button
                key={color}
                onClick={() => set('secondaryColor', color)}
                className={`aspect-square rounded-xl border-2 transition-all relative hover:opacity-100 active:scale-[0.98] ${config.secondaryColor === color ? 'scale-110 shadow-lg border-white ring-2 ring-slate-200' : 'border-transparent opacity-60'}`}
                style={{ backgroundColor: color }}
              >
                {config.secondaryColor === color && <Check className="w-3.5 h-3.5 text-white mx-auto" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="h-px bg-slate-100" />

      {/* Page Background */}
      <div className="space-y-3">
        <label className="text-xs font-black text-slate-900 border-r-4 border-cyan-400 pr-2 block">خلفية الصفحة</label>
        <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 space-y-3">
          <ColorRow
            label="لون خلفية الصفحة الرئيسي"
            value={String(config.pageBackgroundColor || '#FFFFFF')}
            onChange={(v) => set('pageBackgroundColor', v)}
          />
        </div>
      </div>

      <div className="h-px bg-slate-100" />

      {/* Button Colors - Full Control */}
      <div className="space-y-3">
        <label className="text-xs font-black text-slate-900 border-r-4 border-cyan-400 pr-2 block">ألوان الأزرار (تحكم كامل)</label>
        <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 space-y-4">
          {/* Button Background */}
          <ColorRow
            label="لون خلفية الأزرار"
            value={String(config.buttonBackgroundColor || config.primaryColor || '#00E5FF')}
            onChange={(v) => set('buttonBackgroundColor', v)}
          />
          <div className="grid grid-cols-5 gap-2">
            {COLORS.map((color) => (
              <button
                key={color}
                onClick={() => set('buttonBackgroundColor', color)}
                className={`aspect-square rounded-xl border-2 transition-all relative hover:opacity-100 active:scale-[0.98] ${(config.buttonBackgroundColor || config.primaryColor) === color ? 'scale-110 shadow-lg border-white ring-2 ring-slate-200' : 'border-transparent opacity-60'}`}
                style={{ backgroundColor: color }}
              >
                {(config.buttonBackgroundColor || config.primaryColor) === color && <Check className="w-3.5 h-3.5 text-white mx-auto" />}
              </button>
            ))}
          </div>

          {/* Button Text Color */}
          <ColorRow
            label="لون نص الأزرار"
            value={String(config.buttonTextColor || '#FFFFFF')}
            onChange={(v) => set('buttonTextColor', v)}
          />

          {/* Button Hover Color */}
          <ColorRow
            label="لون الأزرار عند المرور (Hover)"
            value={String(config.buttonHoverColor || config.buttonBackgroundColor || config.primaryColor || '#00C2D9')}
            onChange={(v) => set('buttonHoverColor', v)}
          />

          {/* Button Border Radius */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">شكل حواف الأزرار</label>
            <div className="grid grid-cols-4 gap-2">
              {BTN_RADIUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => set('buttonBorderRadius', opt.value)}
                  className={`py-2.5 text-[10px] font-black transition-all active:scale-95 ${(config.buttonBorderRadius || '12px') === opt.value ? 'bg-slate-900 text-white shadow' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  style={{ borderRadius: opt.value }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Live Preview */}
          <div className="pt-2 border-t border-slate-100">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">معاينة</label>
            <button
              type="button"
              className="px-6 py-3 font-black text-xs transition-all"
              style={{
                backgroundColor: config.buttonBackgroundColor || config.primaryColor || '#00E5FF',
                color: config.buttonTextColor || '#FFFFFF',
                borderRadius: config.buttonBorderRadius || '12px',
              }}
            >
              مثال على الزر
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorsSection;
