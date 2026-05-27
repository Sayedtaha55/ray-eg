import React from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
  config: any;
  setConfig: React.Dispatch<React.SetStateAction<any>>;
};

const HeaderFooterSection: React.FC<Props> = ({
  config,
  setConfig,
}) => {
  const { t } = useTranslation();
  return (
  <div className="space-y-6">
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-black text-sm">{t('business.builder.headerFooter.headerTransparent')}</span>
        <input
          type="checkbox"
          checked={Boolean(config.headerTransparent)}
          onChange={(e) => {
            const checked = e.target.checked;
            setConfig({ ...config, headerTransparent: checked, headerOpacity: checked ? (config.headerOpacity ?? 60) : 100 });
          }}
        />
      </div>
      <div className="flex items-center justify-between">
        <span className="font-black text-sm">{t('business.builder.headerFooter.headerOverlayBanner')}</span>
        <input
          type="checkbox"
          checked={Boolean(config.headerOverlayBanner)}
          onChange={(e) => setConfig({ ...config, headerOverlayBanner: e.target.checked })}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">{t('business.builder.headerFooter.backgroundColor')}</label>
          <input
            type="color"
            value={String(config.headerBackgroundColor || '#FFFFFF')}
            onChange={(e) => setConfig({ ...config, headerBackgroundColor: e.target.value })}
            className="w-full h-10 rounded-xl border border-slate-200 bg-white"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">{t('business.builder.headerFooter.textColor')}</label>
          <input
            type="color"
            value={String(config.headerTextColor || '#0F172A')}
            onChange={(e) => setConfig({ ...config, headerTextColor: e.target.value })}
            className="w-full h-10 rounded-xl border border-slate-200 bg-white"
          />
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">{t('business.builder.headerFooter.backgroundOpacity')}</label>
        <input
          type="range"
          min={0}
          max={100}
          value={Number(config.headerOpacity ?? 60)}
          onChange={(e) => setConfig({ ...config, headerOpacity: Number(e.target.value) })}
          className="w-full"
          disabled={!Boolean(config.headerTransparent)}
        />
      </div>

      <div className="h-px bg-slate-100" />
    </div>
  </div>
  );
};

export default HeaderFooterSection;
