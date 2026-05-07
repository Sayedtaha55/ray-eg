'use client';

import React from 'react';
import Image from 'next/image';
import { Eye, EyeOff } from 'lucide-react';
import { useT } from '@/i18n/useT';

type Props = {
  config: any;
  setConfig: React.Dispatch<React.SetStateAction<any>>;
  logoDataUrl: string;
  setLogoDataUrl: (val: string) => void;
  logoFile: File | null;
  setLogoFile: (val: File | null) => void;
  logoSaving: boolean;
  onSaveLogo: () => void;
  shop?: any;
};

const TOP_VIS_KEYS = ['headerNavHome', 'headerNavGallery', 'headerNavInfo', 'headerChatButton', 'headerShareButton', 'shopFollowersCount', 'shopFollowButton', 'profileBanner', 'floatingChatButton', 'purchaseModeButton'] as const;

const HeaderTypeSection: React.FC<Props> = ({ config, setConfig, logoDataUrl, setLogoDataUrl, logoFile, setLogoFile, logoSaving, onSaveLogo, shop }) => {
  const t = useT();

  const getVis = (key: string, fallback = true) => {
    const cur = config?.elementsVisibility || {};
    if (cur[key] === undefined || cur[key] === null) return fallback;
    return Boolean(cur[key]);
  };
  const setVis = (key: string, value: boolean) => {
    const base = (config?.elementsVisibility && typeof config.elementsVisibility === 'object') ? config.elementsVisibility : {};
    setConfig({ ...config, elementsVisibility: { ...base, [key]: value } });
  };

  return (
    <div className="space-y-3">
      <div className="space-y-3">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-2">{t('business.builder.headerType.storeLogo', 'شعار المتجر')}</label>
        <div className="flex gap-4 items-center flex-row-reverse">
          <label className="w-28 h-28 rounded-[2rem] overflow-hidden bg-slate-50 border border-slate-100 shrink-0 cursor-pointer">
            <input type="file" hidden accept="image/*" onChange={e => { const file = e.target.files?.[0]; if (!file) return; try { if (logoDataUrl && logoDataUrl.startsWith('blob:')) URL.revokeObjectURL(logoDataUrl); } catch {} setLogoFile(file); setLogoDataUrl(URL.createObjectURL(file)); }} />
            {logoDataUrl ? (
              <Image src={logoDataUrl} alt="logo" fill className="object-cover" sizes="112px" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300 font-black text-xs">LOGO</div>
            )}
          </label>
          <div className="flex-1 flex flex-col gap-3">
            <button type="button" onClick={onSaveLogo} disabled={logoSaving || !logoFile} className="w-full py-4 bg-slate-900 text-white rounded-[1.5rem] font-black text-sm hover:bg-black transition-all disabled:opacity-60">{logoSaving ? t('business.builder.headerType.savingLogo', 'جاري الحفظ...') : t('business.builder.headerType.saveLogo', 'حفظ الشعار')}</button>
            <label className="w-full py-4 bg-slate-900 text-white rounded-[1.5rem] font-black text-sm hover:bg-black transition-all cursor-pointer text-center">
              {t('business.builder.headerType.chooseFromDevice', 'اختر من جهازك')}
              <input type="file" hidden accept="image/*" onChange={e => { const file = e.target.files?.[0]; if (!file) return; try { if (logoDataUrl && logoDataUrl.startsWith('blob:')) URL.revokeObjectURL(logoDataUrl); } catch {} setLogoFile(file); setLogoDataUrl(URL.createObjectURL(file)); }} />
            </label>
            <button type="button" onClick={() => { try { if (logoDataUrl && logoDataUrl.startsWith('blob:')) URL.revokeObjectURL(logoDataUrl); } catch {} setLogoFile(null); setLogoDataUrl(''); try { setConfig({ ...config, logoUrl: '' }); } catch {} }} className="w-full py-4 bg-slate-50 text-slate-500 rounded-[1.5rem] font-black text-sm hover:bg-slate-100 transition-all">{t('business.builder.headerType.deleteImage', 'حذف الصورة')}</button>
          </div>
        </div>
      </div>
      <div className="h-px bg-slate-100" />
      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-2">{t('business.builder.visibility.showHide', 'إظهار/إخفاء')}</label>
        {TOP_VIS_KEYS.map(key => (
          <div key={key} className="flex items-center justify-between p-3 rounded-xl bg-slate-50/60">
            <span className="font-black text-xs text-slate-700">{t(`business.builder.visibility.items.${key}`, key)}</span>
            <button type="button" onClick={() => setVis(key, !getVis(key))} className={`p-1.5 rounded-lg transition-all ${getVis(key) ? 'bg-[#00E5FF]/10 text-[#00E5FF]' : 'bg-slate-200 text-slate-400'}`}>{getVis(key) ? <Eye size={14} /> : <EyeOff size={14} />}</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeaderTypeSection;
