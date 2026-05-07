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
          <input type="checkbox" checked={Boolean(config.headerTransparent)} onChange={e => { const c = e.target.checked; setConfig({ ...config, headerTransparent: c, headerOpacity: c ? 0 : config.headerOpacity }); }} />
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
          <input type="range" min={0} max={100} value={Number(config.headerOpacity ?? 60)} onChange={e => setConfig({ ...config, headerOpacity: Number(e.target.value) })} className="w-full" disabled={Boolean(config.headerTransparent)} />
        </div>
        <div className="h-px bg-slate-100" />
      </div>
      <div className="h-px bg-slate-100" />
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-black text-sm">{t('business.builder.headerFooter.footerTransparent', 'فوتر شفاف')}</span>
          <input type="checkbox" checked={Boolean(config.footerTransparent)} onChange={e => { const c = e.target.checked; setConfig({ ...config, footerTransparent: c, footerOpacity: c ? 0 : config.footerOpacity }); }} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">{t('business.builder.headerFooter.backgroundColor', 'لون الخلفية')}</label>
            <input type="color" value={String(config.footerBackgroundColor || '#FFFFFF')} onChange={e => setConfig({ ...config, footerBackgroundColor: e.target.value })} className="w-full h-10 rounded-xl border border-slate-200 bg-white" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">{t('business.builder.headerFooter.textColor', 'لون النص')}</label>
            <input type="color" value={String(config.footerTextColor || '#0F172A')} onChange={e => setConfig({ ...config, footerTextColor: e.target.value })} className="w-full h-10 rounded-xl border border-slate-200 bg-white" />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">{t('business.builder.headerFooter.backgroundOpacity', 'شفافية الخلفية')}</label>
          <input type="range" min={0} max={100} value={Number(config.footerOpacity ?? 90)} onChange={e => setConfig({ ...config, footerOpacity: Number(e.target.value) })} className="w-full" disabled={Boolean(config.footerTransparent)} />
        </div>
      </div>
    </div>
  );
};

export default HeaderFooterSection;
