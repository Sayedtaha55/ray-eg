'use client';

import React from 'react';
import { useT } from '@/i18n/useT';

type Props = { config: any; setConfig: React.Dispatch<React.SetStateAction<any>> };

const HeaderFooterSection: React.FC<Props> = ({ config, setConfig }) => {
  const t = useT();
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-black text-sm">{t('business.builder.headerFooter.headerTransparent', 'هيدر شفاف')}</span>
          <input type="checkbox" checked={Boolean(config.headerTransparent)} onChange={e => { const c = e.target.checked; setConfig({ ...config, headerTransparent: c, headerOpacity: c ? (config.headerOpacity ?? 60) : 100 }); }} />
        </div>
        <div className="flex items-center justify-between">
          <span className="font-black text-sm">{t('business.builder.headerFooter.headerOverlayBanner', 'هيدر فوق البانر')}</span>
          <input type="checkbox" checked={Boolean(config.headerOverlayBanner)} onChange={e => setConfig({ ...config, headerOverlayBanner: e.target.checked })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">{t('business.builder.headerFooter.backgroundColor', 'لون الخلفية')}</label>
            <input type="color" value={String(config.headerBackgroundColor || '#FFFFFF')} onChange={e => setConfig({ ...config, headerBackgroundColor: e.target.value })} className="w-full h-10 rounded-xl border border-slate-200 bg-white" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">{t('business.builder.headerFooter.textColor', 'لون النص')}</label>
            <input type="color" value={String(config.headerTextColor || '#0F172A')} onChange={e => setConfig({ ...config, headerTextColor: e.target.value })} className="w-full h-10 rounded-xl border border-slate-200 bg-white" />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">{t('business.builder.headerFooter.backgroundOpacity', 'شفافية الخلفية')}</label>
          <input type="range" min={0} max={100} value={Number(config.headerOpacity ?? 60)} onChange={e => setConfig({ ...config, headerOpacity: Number(e.target.value) })} className="w-full" disabled={!Boolean(config.headerTransparent)} />
        </div>
      </div>
    </div>
  );
};

export default HeaderFooterSection;
