import React from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Check } from 'lucide-react';

type Props = {
  config: any;
  setConfig: React.Dispatch<React.SetStateAction<any>>;
};

const HEADER_STYLES = [
  { id: 'centered', title: 'افتراضي متناسق (Centered)', desc: 'شعار المتجر بالوسط (أو اليمين)، القائمة بالوسط، الأزرار باليسار' },
  { id: 'split_branding', title: 'شعار مميز (Split Branding)', desc: 'الشعار والاسم بالوسط، القائمة باليمين، الأزرار باليسار' },
  { id: 'minimal_left', title: 'بسيط جداً (Minimal)', desc: 'الشعار باليمين، القائمة والأزرار معاً باليسار' },
  { id: 'search_bar', title: 'تركيز على البحث (Search Focused)', desc: 'شريط بحث عريض بالوسط، الشعار باليمين، الأزرار باليسار' },
  { id: 'stacked_bold', title: 'شكل كبير وعريض (Large Stacked)', desc: 'صفين: الصف العلوي للشعار والاسم، الصف السفلي للقائمة والبحث' },
];

const HeaderFooterSection: React.FC<Props> = ({
  config,
  setConfig,
}) => {
  const { t } = useTranslation();

  const TOP_VIS_KEYS = [
    'headerNavHome', 'headerNavGallery', 'headerNavInfo',
    'headerChatButton', 'headerShareButton',
    'shopFollowersCount', 'shopFollowButton',
  ] as const;

  const getVis = (key: string, fallback = true) => {
    const cur = config?.elementsVisibility || {};
    if (cur[key] === undefined || cur[key] === null) return fallback;
    return Boolean(cur[key]);
  };

  const setVis = (key: string, value: boolean) => {
    setConfig((prev: any) => {
      const base = (prev?.elementsVisibility && typeof prev.elementsVisibility === 'object') ? prev.elementsVisibility : {};
      return { ...prev, elementsVisibility: { ...base, [key]: value } };
    });
  };

  return (
    <div className="space-y-6">
      {/* ─── Header Style Customization ─── */}
      <div className="space-y-3">
        <label className="text-xs font-black text-slate-400 uppercase tracking-widest block text-right pr-1">أشكال الهيدر (Header Styles)</label>
        <div className="grid grid-cols-1 gap-3">
          {HEADER_STYLES.map((style) => {
            const isActive = String(config.headerType || 'centered') === style.id;
            return (
              <button
                key={style.id}
                type="button"
                onClick={() => setConfig((prev: any) => ({ ...prev, headerType: style.id }))}
                className={`p-4 rounded-[1.5rem] border text-right transition-all flex items-start justify-between flex-row-reverse ${
                  isActive 
                    ? 'border-[#00E5FF] bg-cyan-50/50 shadow-sm' 
                    : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                  isActive ? 'border-[#00E5FF] bg-[#00E5FF] text-white' : 'border-slate-300'
                }`}>
                  {isActive && <Check size={12} className="stroke-[3]" />}
                </div>
                <div className="flex-1 space-y-1 pl-4 pr-1">
                  <h4 className="font-black text-sm text-slate-800 leading-tight">{style.title}</h4>
                  <p className="text-[11px] font-bold text-slate-400 leading-normal">{style.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-px bg-slate-100" />

      {/* ─── Top Section Visibility Toggles ─── */}
      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right pr-1">إظهار وإخفاء عناصر الهيدر</label>
        <div className="grid grid-cols-1 gap-2">
          {TOP_VIS_KEYS.map((key) => (
            <div key={key} className="flex items-center justify-between p-3 rounded-2xl border border-slate-50 bg-slate-50/60 flex-row-reverse text-right">
              <span className="font-black text-xs text-slate-700">{t(`business.builder.visibility.items.${key}`)}</span>
              <button
                type="button"
                onClick={() => setVis(key, !getVis(key))}
                className={`p-1.5 rounded-xl transition-all ${getVis(key) ? 'bg-[#00E5FF]/10 text-[#00E5FF]' : 'bg-slate-250 text-slate-400'}`}
              >
                {getVis(key) ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="h-px bg-slate-100" />

      {/* ─── Header Background & Colors ─── */}
      <div className="space-y-4">
        <label className="text-xs font-black text-slate-400 uppercase tracking-widest block text-right pr-1">ألوان وتنسيق الهيدر</label>
        
        <div className="flex items-center justify-between flex-row-reverse text-right p-3 bg-slate-50/40 rounded-2xl border border-slate-50">
          <span className="font-black text-xs text-slate-700">{t('business.builder.headerFooter.headerTransparent')}</span>
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-slate-350 text-[#00E5FF] focus:ring-[#00E5FF]/40"
            checked={Boolean(config.headerTransparent)}
            onChange={(e) => {
              const checked = e.target.checked;
              setConfig((prev: any) => ({ ...prev, headerTransparent: checked, headerOpacity: checked ? (prev.headerOpacity ?? 60) : 100 }));
            }}
          />
        </div>

        <div className="flex items-center justify-between flex-row-reverse text-right p-3 bg-slate-50/40 rounded-2xl border border-slate-50">
          <span className="font-black text-xs text-slate-700">{t('business.builder.headerFooter.headerOverlayBanner')}</span>
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-slate-350 text-[#00E5FF] focus:ring-[#00E5FF]/40"
            checked={Boolean(config.headerOverlayBanner)}
            onChange={(e) => {
              const val = e.target.checked;
              setConfig((prev: any) => ({ ...prev, headerOverlayBanner: val }));
            }}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5 text-right">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{t('business.builder.headerFooter.backgroundColor')}</label>
            <div className="relative flex items-center justify-center h-11 rounded-2xl border border-slate-100 bg-white p-1">
              <input
                type="color"
                value={String(config.headerBackgroundColor || '#FFFFFF')}
                onChange={(e) => {
                  const val = e.target.value;
                  setConfig((prev: any) => ({ ...prev, headerBackgroundColor: val }));
                }}
                className="w-full h-full rounded-xl cursor-pointer border-0 p-0 bg-transparent"
              />
            </div>
          </div>
          <div className="space-y-1.5 text-right">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{t('business.builder.headerFooter.textColor')}</label>
            <div className="relative flex items-center justify-center h-11 rounded-2xl border border-slate-100 bg-white p-1">
              <input
                type="color"
                value={String(config.headerTextColor || '#0F172A')}
                onChange={(e) => {
                  const val = e.target.value;
                  setConfig((prev: any) => ({ ...prev, headerTextColor: val }));
                }}
                className="w-full h-full rounded-xl cursor-pointer border-0 p-0 bg-transparent"
              />
            </div>
          </div>
        </div>

        <div className="space-y-1.5 text-right">
          <div className="flex justify-between flex-row-reverse text-right">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{t('business.builder.headerFooter.backgroundOpacity')}</label>
            <span className="text-[10px] font-black text-slate-500">{config.headerOpacity ?? 60}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={Number(config.headerOpacity ?? 60)}
            onChange={(e) => {
              const val = Number(e.target.value);
              setConfig((prev: any) => ({ ...prev, headerOpacity: val }));
            }}
            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#00E5FF] disabled:opacity-30 disabled:cursor-not-allowed"
            disabled={!Boolean(config.headerTransparent)}
          />
        </div>
      </div>
    </div>
  );
};

export default HeaderFooterSection;
