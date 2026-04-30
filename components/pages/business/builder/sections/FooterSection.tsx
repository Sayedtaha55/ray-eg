import React from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff } from 'lucide-react';

type Props = {
  config: any;
  setConfig: React.Dispatch<React.SetStateAction<any>>;
};

const FooterSection: React.FC<Props> = ({ config, setConfig }) => {
  const { t } = useTranslation();

  const toggleVisibility = (key: string, fallback: boolean = true) => {
    const current = config?.elementsVisibility || {};
    const next = { ...current, [key]: !(current[key] ?? fallback) };
    setConfig({ ...config, elementsVisibility: next });
  };

  const isVisible = (key: string, fallback: boolean = true) => {
    const current = config?.elementsVisibility || {};
    if (current[key] === undefined || current[key] === null) return fallback;
    return Boolean(current[key]);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-black text-sm">{t('business.builder.footer.showFooter')}</span>
          <button
            type="button"
            onClick={() => toggleVisibility('footer', true)}
            className={`p-2 rounded-xl transition-all ${isVisible('footer', true) ? 'bg-[#00E5FF]/10 text-[#00E5FF]' : 'bg-slate-100 text-slate-400'}`}
          >
            {isVisible('footer', true) ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-black text-sm">{t('business.builder.footer.showContact')}</span>
          <button
            type="button"
            onClick={() => toggleVisibility('footerContact', true)}
            className={`p-2 rounded-xl transition-all ${isVisible('footerContact', true) ? 'bg-[#00E5FF]/10 text-[#00E5FF]' : 'bg-slate-100 text-slate-400'}`}
          >
            {isVisible('footerContact', true) ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-black text-sm">{t('business.builder.footer.showQuickLinks')}</span>
          <button
            type="button"
            onClick={() => toggleVisibility('footerQuickLinks', true)}
            className={`p-2 rounded-xl transition-all ${isVisible('footerQuickLinks', true) ? 'bg-[#00E5FF]/10 text-[#00E5FF]' : 'bg-slate-100 text-slate-400'}`}
          >
            {isVisible('footerQuickLinks', true) ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">{t('business.builder.footer.backgroundColor')}</label>
          <input
            type="color"
            value={String(config.footerBackgroundColor || '#FFFFFF')}
            onChange={(e) => setConfig({ ...config, footerBackgroundColor: e.target.value })}
            className="w-full h-10 rounded-xl border border-slate-200 cursor-pointer"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">{t('business.builder.footer.textColor')}</label>
          <input
            type="color"
            value={String(config.footerTextColor || '#0F172A')}
            onChange={(e) => setConfig({ ...config, footerTextColor: e.target.value })}
            className="w-full h-10 rounded-xl border border-slate-200 cursor-pointer"
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-black text-sm">{t('business.builder.footer.transparent')}</span>
          <input
            type="checkbox"
            checked={Boolean(config.footerTransparent)}
            onChange={(e) => setConfig({ ...config, footerTransparent: e.target.checked })}
          />
        </div>
        {config.footerTransparent && (
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">{t('business.builder.footer.opacity')}</label>
            <input
              type="range"
              min={0}
              max={100}
              value={Number(config.footerOpacity ?? 90)}
              onChange={(e) => setConfig({ ...config, footerOpacity: Number(e.target.value) })}
              className="w-full accent-[#00E5FF]"
            />
            <span className="text-xs text-slate-400 font-bold">{config.footerOpacity ?? 90}%</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default FooterSection;
