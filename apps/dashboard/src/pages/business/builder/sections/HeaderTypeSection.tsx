import React from 'react';
import SmartImage from '@/components/common/ui/SmartImage';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Check } from 'lucide-react';

type Props = {
  config: any;
  setConfig: React.Dispatch<React.SetStateAction<any>>;
  logoDataUrl: string;
  setLogoDataUrl: React.Dispatch<React.SetStateAction<string>>;
  logoFile: File | null;
  setLogoFile: React.Dispatch<React.SetStateAction<File | null>>;
  logoSaving: boolean;
  onSaveLogo: () => void;
  shop?: any;
};

const HEADER_STYLES = [
  { id: 'centered', title: 'افتراضي متناسق (Centered)', desc: 'شعار المتجر بالوسط (أو اليمين)، القائمة بالوسط، الأزرار باليسار' },
  { id: 'split_branding', title: 'شعار مميز (Split Branding)', desc: 'الشعار والاسم بالوسط، القائمة باليمين، الأزرار باليسار' },
  { id: 'minimal_left', title: 'بسيط جداً (Minimal)', desc: 'الشعار باليمين، القائمة والأزرار معاً باليسار' },
  { id: 'search_bar', title: 'تركيز على البحث (Search Focused)', desc: 'شريط بحث عريض بالوسط، الشعار باليمين، الأزرار باليسار' },
  { id: 'stacked_bold', title: 'شكل كبير وعريض (Large Stacked)', desc: 'صفين: الصف العلوي للشعار والاسم، الصف السفلي للقائمة والبحث' },
];

const HeaderTypeSection: React.FC<Props> = ({
  config,
  setConfig,
  logoDataUrl,
  setLogoDataUrl,
  logoFile,
  setLogoFile,
  logoSaving,
  onSaveLogo,
  shop,
}) => {
  const { t } = useTranslation();

  // ─── Visibility helpers ────────────────────────────────────────────────
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
    <div className="space-y-3">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-2">{t('business.builder.headerType.storeLogo')}</label>
      <div className="flex gap-4 items-center flex-row-reverse">
        <label
          className="w-28 h-28 rounded-[2rem] overflow-hidden bg-slate-50 border border-slate-100 shrink-0 cursor-pointer"
        >
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              try {
                if (logoDataUrl && logoDataUrl.startsWith('blob:')) {
                  URL.revokeObjectURL(logoDataUrl);
                }
              } catch {
              }
              setLogoFile(file);
              setLogoDataUrl(URL.createObjectURL(file));
            }}
          />
          {logoDataUrl ? (
            <SmartImage
              src={logoDataUrl}
              alt="logo"
              className="w-full h-full"
              imgClassName="object-cover"
              loading="eager"
              fetchPriority="high"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300 font-black text-xs">LOGO</div>
          )}
        </label>
        <div className="flex-1 flex flex-col gap-3">
          <button
            type="button"
            onClick={onSaveLogo}
            disabled={logoSaving || !logoFile}
            className="w-full py-4 bg-slate-900 text-white rounded-[1.5rem] font-black text-sm hover:bg-black transition-all disabled:opacity-60 disabled:pointer-events-none"
          >
            {logoSaving ? t('business.builder.headerType.savingLogo') : t('business.builder.headerType.saveLogo')}
          </button>
          <label className="w-full py-4 bg-slate-900 text-white rounded-[1.5rem] font-black text-sm hover:bg-black transition-all cursor-pointer text-center">
            {t('business.builder.headerType.chooseFromDevice')}
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  if (logoDataUrl && logoDataUrl.startsWith('blob:')) {
                    URL.revokeObjectURL(logoDataUrl);
                  }
                } catch {
                }
                setLogoFile(file);
                setLogoDataUrl(URL.createObjectURL(file));
              }}
            />
          </label>
          <button
            type="button"
            onClick={() => {
              try {
                if (logoDataUrl && logoDataUrl.startsWith('blob:')) {
                  URL.revokeObjectURL(logoDataUrl);
                }
              } catch {
              }
              setLogoFile(null);
              setLogoDataUrl('');
              try {
                setConfig((prev: any) => ({ ...prev, logoUrl: '' }));
              } catch {
              }
            }}
            className="w-full py-4 bg-slate-50 text-slate-500 rounded-[1.5rem] font-black text-sm hover:bg-slate-100 transition-all"
          >
            {t('business.builder.headerType.deleteImage')}
          </button>
        </div>
      </div>
    </div>

    {/* ─── Header Style Customization ─── */}
    <div className="h-px bg-slate-100" />
    <div className="space-y-3">
      <label className="text-xs font-black text-slate-400 uppercase tracking-widest block pr-2">أشكال الهيدر (Header Styles)</label>
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

    {/* ─── Top Section Visibility Toggles ─── */}
    <div className="h-px bg-slate-100" />
    <div className="space-y-2">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-2">{t('business.builder.visibility.showHide')}</label>
      {TOP_VIS_KEYS.map((key) => (
        <div key={key} className="flex items-center justify-between p-3 rounded-xl bg-slate-50/60">
          <span className="font-black text-xs text-slate-700">{t(`business.builder.visibility.items.${key}`)}</span>
          <button
            type="button"
            onClick={() => setVis(key, !getVis(key))}
            className={`p-1.5 rounded-lg transition-all ${getVis(key) ? 'bg-[#00E5FF]/10 text-[#00E5FF]' : 'bg-slate-200 text-slate-400'}`}
          >
            {getVis(key) ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
        </div>
      ))}
    </div>
  </div>
  );
};

export default HeaderTypeSection;
