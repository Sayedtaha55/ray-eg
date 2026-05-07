'use client';

import React, { useState } from 'react';
import { Save, Loader2 } from 'lucide-react';
import * as merchantApi from '@/lib/api/merchant';
import { useT } from '@/i18n/useT';
import { useLocale } from '@/i18n/LocaleProvider';

type Props = { shop: any; onSaved?: () => void };

const SettingsTab: React.FC<Props> = ({ shop, onSaved }) => {
  const t = useT();
  const { dir } = useLocale();
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(shop?.name || '');
  const [phone, setPhone] = useState(shop?.phone || '');
  const [city, setCity] = useState(shop?.city || '');
  const [address, setAddress] = useState(shop?.addressDetailed || shop?.address_detailed || '');
  const [description, setDescription] = useState(shop?.description || '');

  const handleSave = async () => {
    setSaving(true);
    try {
      await merchantApi.merchantUpdateMyShop({ name, phone, city, addressDetailed: address, description });
      onSaved?.();
    } catch {} finally { setSaving(false); }
  };

  return (
    <div className="bg-white p-8 md:p-12 rounded-[3.5rem] border border-slate-100 shadow-sm" dir={dir}>
      <div className="flex items-center justify-between mb-10 flex-row-reverse">
        <h3 className="text-3xl font-black">{t('business.dashboardTabs.settings')}</h3>
      </div>
      <div className="space-y-6 max-w-2xl">
        <div>
          <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 text-right">{t('business.settings.shopName')}</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-black text-slate-900 text-right focus:ring-2 focus:ring-[#00E5FF]/20 outline-none transition-all" />
        </div>
        <div>
          <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 text-right">{t('business.settings.phone')}</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-black text-slate-900 text-right focus:ring-2 focus:ring-[#00E5FF]/20 outline-none transition-all" />
        </div>
        <div>
          <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 text-right">{t('business.settings.city')}</label>
          <input value={city} onChange={(e) => setCity(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-black text-slate-900 text-right focus:ring-2 focus:ring-[#00E5FF]/20 outline-none transition-all" />
        </div>
        <div>
          <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 text-right">{t('business.settings.address')}</label>
          <input value={address} onChange={(e) => setAddress(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-black text-slate-900 text-right focus:ring-2 focus:ring-[#00E5FF]/20 outline-none transition-all" />
        </div>
        <div>
          <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 text-right">{t('business.settings.description')}</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-black text-slate-900 text-right focus:ring-2 focus:ring-[#00E5FF]/20 outline-none transition-all resize-none" />
        </div>
        <button type="button" onClick={handleSave} disabled={saving} className="w-full py-4 rounded-2xl bg-slate-900 text-white font-black text-sm flex items-center justify-center gap-2 hover:bg-black transition-all disabled:opacity-60">
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {t('common.save')}
        </button>
      </div>
    </div>
  );
};

export default SettingsTab;
