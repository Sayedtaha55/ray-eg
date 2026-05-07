'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  Palette, Save, Loader2, Monitor, Smartphone, ChevronDown,
  Image, Type, LayoutGrid, Sliders, Eye,
} from 'lucide-react';
import * as merchantApi from '@/lib/api/merchant';
import { useT } from '@/i18n/useT';
import { useLocale } from '@/i18n/LocaleProvider';

type Props = { shop: any; onSaved?: () => void };

const LAYOUT_OPTIONS = [
  { value: 'modern', labelKey: 'business.design.layoutModern' },
  { value: 'classic', labelKey: 'business.design.layoutClassic' },
  { value: 'minimal', labelKey: 'business.design.layoutMinimal' },
];

const HEADER_OPTIONS = [
  { value: 'centered', labelKey: 'business.design.headerCentered' },
  { value: 'left', labelKey: 'business.design.headerLeft' },
  { value: 'split', labelKey: 'business.design.headerSplit' },
];

const PRODUCT_DISPLAY_OPTIONS = [
  { value: 'cards', labelKey: 'business.design.displayCards' },
  { value: 'list', labelKey: 'business.design.displayList' },
  { value: 'minimal', labelKey: 'business.design.displayMinimal' },
];

const ASPECT_RATIO_OPTIONS = [
  { value: 'square', labelKey: 'business.design.aspectSquare' },
  { value: 'portrait', labelKey: 'business.design.aspectPortrait' },
  { value: 'landscape', labelKey: 'business.design.aspectLandscape' },
];

type SectionId = 'colors' | 'banner' | 'header' | 'products' | 'typography' | 'advanced';

const DesignTab: React.FC<Props> = ({ shop, onSaved }) => {
  const t = useT();
  const { dir } = useLocale();
  const isArabic = dir === 'rtl';

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [openSection, setOpenSection] = useState<SectionId>('colors');

  const [config, setConfig] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!shop?.pageDesign) return;
    const pd = shop.pageDesign;
    setConfig({
      primaryColor: pd.primaryColor || '#00E5FF',
      secondaryColor: pd.secondaryColor || '#BD00FF',
      layout: pd.layout || 'modern',
      bannerUrl: pd.bannerUrl || '',
      bannerPosX: pd.bannerPosX ?? 50,
      bannerPosY: pd.bannerPosY ?? 50,
      headerType: pd.headerType || 'centered',
      headerBackgroundColor: pd.headerBackgroundColor || '#FFFFFF',
      headerTextColor: pd.headerTextColor || '#0F172A',
      headerTransparent: pd.headerTransparent ?? true,
      pageBackgroundColor: pd.pageBackgroundColor || '#FFFFFF',
      productDisplay: pd.productDisplay || 'cards',
      productsLayout: pd.productsLayout || 'vertical',
      imageAspectRatio: pd.imageAspectRatio || 'square',
      headingSize: pd.headingSize || 'text-4xl',
      textSize: pd.textSize || 'text-sm',
      buttonShape: pd.buttonShape || 'rounded-2xl',
      buttonPreset: pd.buttonPreset || 'primary',
      footerBackgroundColor: pd.footerBackgroundColor || '#FFFFFF',
      footerTextColor: pd.footerTextColor || '#0F172A',
    });
  }, [shop]);

  const updateConfig = useCallback((key: string, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }, []);

  const handleSave = async () => {
    if (!shop?.id) return;
    setSaving(true);
    try {
      await merchantApi.merchantUpdateMyShop({ pageDesign: config });
      setSaved(true);
      onSaved?.();
    } catch {} finally { setSaving(false); }
  };

  const toggleSection = (id: SectionId) => {
    setOpenSection((prev) => (prev === id ? prev : id));
  };

  const sections: { id: SectionId; icon: React.ReactNode; label: string }[] = [
    { id: 'colors', icon: <Palette size={18} />, label: t('business.design.sectionColors', 'الألوان') },
    { id: 'banner', icon: <Image size={18} />, label: t('business.design.sectionBanner', 'البانر') },
    { id: 'header', icon: <LayoutGrid size={18} />, label: t('business.design.sectionHeader', 'الهيدر') },
    { id: 'products', icon: <Sliders size={18} />, label: t('business.design.sectionProducts', 'عرض المنتجات') },
    { id: 'typography', icon: <Type size={18} />, label: t('business.design.sectionTypography', 'الخطوط') },
    { id: 'advanced', icon: <Eye size={18} />, label: t('business.design.sectionAdvanced', 'متقدم') },
  ];

  return (
    <div className="space-y-6" dir={dir}>
      {/* Header */}
      <div className="bg-white p-6 md:p-10 rounded-[3rem] border border-slate-100 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 flex-row-reverse">
          <div className="text-right">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900">{t('business.design.title', 'التصميم')}</h2>
            <p className="mt-1 text-xs sm:text-sm font-bold text-slate-400">{t('business.design.subtitle', 'تخصيص شكل صفحة المحل')}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving} className="px-5 py-3 rounded-2xl bg-slate-900 text-white font-black text-sm flex items-center gap-2 hover:bg-black transition-all disabled:opacity-60">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {t('common.save', 'حفظ')}
            </button>
            {saved && <span className="px-4 py-3 rounded-2xl bg-green-50 text-green-600 font-black text-sm flex items-center gap-2"><Eye size={14} /> {t('business.design.saved', 'تم الحفظ')}</span>}
          </div>
        </div>
      </div>

      {/* Section Navigation */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {sections.map((s) => (
          <button key={s.id} onClick={() => toggleSection(s.id)}
            className={`px-4 py-2.5 rounded-2xl font-black text-xs flex items-center gap-2 whitespace-nowrap transition-all ${openSection === s.id ? 'bg-slate-900 text-white' : 'bg-white border border-slate-100 text-slate-600 hover:bg-slate-50'}`}>
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      {/* Colors Section */}
      {openSection === 'colors' && (
        <div className="bg-white p-6 md:p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
          <h3 className="text-xl font-black text-slate-900 text-right">{t('business.design.sectionColors', 'الألوان')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 text-right">{t('business.design.primaryColor', 'اللون الأساسي')}</label>
              <div className="flex items-center gap-3 flex-row-reverse">
                <input type="color" value={String(config.primaryColor || '#00E5FF')} onChange={(e) => updateConfig('primaryColor', e.target.value)} className="w-12 h-12 rounded-xl border border-slate-200 cursor-pointer" />
                <input type="text" value={String(config.primaryColor || '')} onChange={(e) => updateConfig('primaryColor', e.target.value)} className="flex-1 bg-slate-50 rounded-xl px-4 py-3 font-bold text-slate-900 text-right border border-slate-200" />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 text-right">{t('business.design.secondaryColor', 'اللون الثانوي')}</label>
              <div className="flex items-center gap-3 flex-row-reverse">
                <input type="color" value={String(config.secondaryColor || '#BD00FF')} onChange={(e) => updateConfig('secondaryColor', e.target.value)} className="w-12 h-12 rounded-xl border border-slate-200 cursor-pointer" />
                <input type="text" value={String(config.secondaryColor || '')} onChange={(e) => updateConfig('secondaryColor', e.target.value)} className="flex-1 bg-slate-50 rounded-xl px-4 py-3 font-bold text-slate-900 text-right border border-slate-200" />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 text-right">{t('business.design.pageBg', 'خلفية الصفحة')}</label>
              <div className="flex items-center gap-3 flex-row-reverse">
                <input type="color" value={String(config.pageBackgroundColor || '#FFFFFF')} onChange={(e) => updateConfig('pageBackgroundColor', e.target.value)} className="w-12 h-12 rounded-xl border border-slate-200 cursor-pointer" />
                <input type="text" value={String(config.pageBackgroundColor || '')} onChange={(e) => updateConfig('pageBackgroundColor', e.target.value)} className="flex-1 bg-slate-50 rounded-xl px-4 py-3 font-bold text-slate-900 text-right border border-slate-200" />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 text-right">{t('business.design.layout', 'التخطيط')}</label>
              <select value={String(config.layout || 'modern')} onChange={(e) => updateConfig('layout', e.target.value)} className="w-full bg-slate-50 rounded-xl px-4 py-3 font-bold text-slate-900 text-right border border-slate-200 appearance-none">
                {LAYOUT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{t(o.labelKey, o.value)}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Banner Section */}
      {openSection === 'banner' && (
        <div className="bg-white p-6 md:p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
          <h3 className="text-xl font-black text-slate-900 text-right">{t('business.design.sectionBanner', 'البانر')}</h3>
          <div>
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 text-right">{t('business.design.bannerUrl', 'رابط صورة البانر')}</label>
            <input type="url" value={String(config.bannerUrl || '')} onChange={(e) => updateConfig('bannerUrl', e.target.value)} placeholder="https://..." className="w-full bg-slate-50 rounded-xl px-4 py-3 font-bold text-slate-900 text-right border border-slate-200" />
          </div>
          {config.bannerUrl && (
            <div className="relative rounded-2xl overflow-hidden border border-slate-100 aspect-video">
              <img src={String(config.bannerUrl)} alt="Banner preview" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 text-right">{t('business.design.bannerPosX', 'موضع أفقي %')}</label>
              <input type="range" min={0} max={100} value={Number(config.bannerPosX ?? 50)} onChange={(e) => updateConfig('bannerPosX', Number(e.target.value))} className="w-full accent-[#00E5FF]" />
              <div className="text-center text-xs font-bold text-slate-400 mt-1">{Number(config.bannerPosX ?? 50)}%</div>
            </div>
            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 text-right">{t('business.design.bannerPosY', 'موضع عمودي %')}</label>
              <input type="range" min={0} max={100} value={Number(config.bannerPosY ?? 50)} onChange={(e) => updateConfig('bannerPosY', Number(e.target.value))} className="w-full accent-[#00E5FF]" />
              <div className="text-center text-xs font-bold text-slate-400 mt-1">{Number(config.bannerPosY ?? 50)}%</div>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      {openSection === 'header' && (
        <div className="bg-white p-6 md:p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
          <h3 className="text-xl font-black text-slate-900 text-right">{t('business.design.sectionHeader', 'الهيدر')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 text-right">{t('business.design.headerType', 'نوع الهيدر')}</label>
              <select value={String(config.headerType || 'centered')} onChange={(e) => updateConfig('headerType', e.target.value)} className="w-full bg-slate-50 rounded-xl px-4 py-3 font-bold text-slate-900 text-right border border-slate-200 appearance-none">
                {HEADER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{t(o.labelKey, o.value)}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-3 flex-row-reverse">
              <input type="checkbox" id="headerTransparent" checked={Boolean(config.headerTransparent)} onChange={(e) => updateConfig('headerTransparent', e.target.checked)} className="w-5 h-5 rounded accent-[#00E5FF]" />
              <label htmlFor="headerTransparent" className="text-sm font-black text-slate-700">{t('business.design.headerTransparent', 'هيدر شفاف')}</label>
            </div>
            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 text-right">{t('business.design.headerBgColor', 'لون خلفية الهيدر')}</label>
              <div className="flex items-center gap-3 flex-row-reverse">
                <input type="color" value={String(config.headerBackgroundColor || '#FFFFFF')} onChange={(e) => updateConfig('headerBackgroundColor', e.target.value)} className="w-12 h-12 rounded-xl border border-slate-200 cursor-pointer" />
                <input type="text" value={String(config.headerBackgroundColor || '')} onChange={(e) => updateConfig('headerBackgroundColor', e.target.value)} className="flex-1 bg-slate-50 rounded-xl px-4 py-3 font-bold text-slate-900 text-right border border-slate-200" />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 text-right">{t('business.design.headerTextColor', 'لون نص الهيدر')}</label>
              <div className="flex items-center gap-3 flex-row-reverse">
                <input type="color" value={String(config.headerTextColor || '#0F172A')} onChange={(e) => updateConfig('headerTextColor', e.target.value)} className="w-12 h-12 rounded-xl border border-slate-200 cursor-pointer" />
                <input type="text" value={String(config.headerTextColor || '')} onChange={(e) => updateConfig('headerTextColor', e.target.value)} className="flex-1 bg-slate-50 rounded-xl px-4 py-3 font-bold text-slate-900 text-right border border-slate-200" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Products Section */}
      {openSection === 'products' && (
        <div className="bg-white p-6 md:p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
          <h3 className="text-xl font-black text-slate-900 text-right">{t('business.design.sectionProducts', 'عرض المنتجات')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 text-right">{t('business.design.productDisplay', 'طريقة العرض')}</label>
              <select value={String(config.productDisplay || 'cards')} onChange={(e) => updateConfig('productDisplay', e.target.value)} className="w-full bg-slate-50 rounded-xl px-4 py-3 font-bold text-slate-900 text-right border border-slate-200 appearance-none">
                {PRODUCT_DISPLAY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{t(o.labelKey, o.value)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 text-right">{t('business.design.productsLayout', 'التخطيط')}</label>
              <select value={String(config.productsLayout || 'vertical')} onChange={(e) => updateConfig('productsLayout', e.target.value)} className="w-full bg-slate-50 rounded-xl px-4 py-3 font-bold text-slate-900 text-right border border-slate-200 appearance-none">
                <option value="vertical">{t('business.design.layoutVertical', 'عمودي')}</option>
                <option value="horizontal">{t('business.design.layoutHorizontal', 'أفقي')}</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 text-right">{t('business.design.imageAspectRatio', 'نسبة الصورة')}</label>
              <select value={String(config.imageAspectRatio || 'square')} onChange={(e) => updateConfig('imageAspectRatio', e.target.value)} className="w-full bg-slate-50 rounded-xl px-4 py-3 font-bold text-slate-900 text-right border border-slate-200 appearance-none">
                {ASPECT_RATIO_OPTIONS.map((o) => <option key={o.value} value={o.value}>{t(o.labelKey, o.value)}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Typography Section */}
      {openSection === 'typography' && (
        <div className="bg-white p-6 md:p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
          <h3 className="text-xl font-black text-slate-900 text-right">{t('business.design.sectionTypography', 'الخطوط')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 text-right">{t('business.design.headingSize', 'حجم العناوين')}</label>
              <select value={String(config.headingSize || 'text-4xl')} onChange={(e) => updateConfig('headingSize', e.target.value)} className="w-full bg-slate-50 rounded-xl px-4 py-3 font-bold text-slate-900 text-right border border-slate-200 appearance-none">
                <option value="text-2xl">Small</option>
                <option value="text-3xl">Medium</option>
                <option value="text-4xl">Large</option>
                <option value="text-5xl">X-Large</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 text-right">{t('business.design.textSize', 'حجم النص')}</label>
              <select value={String(config.textSize || 'text-sm')} onChange={(e) => updateConfig('textSize', e.target.value)} className="w-full bg-slate-50 rounded-xl px-4 py-3 font-bold text-slate-900 text-right border border-slate-200 appearance-none">
                <option value="text-xs">XS</option>
                <option value="text-sm">SM</option>
                <option value="text-base">MD</option>
                <option value="text-lg">LG</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 text-right">{t('business.design.buttonShape', 'شكل الزر')}</label>
              <select value={String(config.buttonShape || 'rounded-2xl')} onChange={(e) => updateConfig('buttonShape', e.target.value)} className="w-full bg-slate-50 rounded-xl px-4 py-3 font-bold text-slate-900 text-right border border-slate-200 appearance-none">
                <option value="rounded-none">Square</option>
                <option value="rounded-xl">Rounded</option>
                <option value="rounded-2xl">Extra Rounded</option>
                <option value="rounded-full">Pill</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 text-right">{t('business.design.buttonPreset', 'ستايل الزر')}</label>
              <select value={String(config.buttonPreset || 'primary')} onChange={(e) => updateConfig('buttonPreset', e.target.value)} className="w-full bg-slate-50 rounded-xl px-4 py-3 font-bold text-slate-900 text-right border border-slate-200 appearance-none">
                <option value="primary">Primary</option>
                <option value="ghost">Ghost</option>
                <option value="premium">Premium</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Section */}
      {openSection === 'advanced' && (
        <div className="bg-white p-6 md:p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
          <h3 className="text-xl font-black text-slate-900 text-right">{t('business.design.sectionAdvanced', 'متقدم')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 text-right">{t('business.design.footerBgColor', 'لون خلفية الفوتر')}</label>
              <div className="flex items-center gap-3 flex-row-reverse">
                <input type="color" value={String(config.footerBackgroundColor || '#FFFFFF')} onChange={(e) => updateConfig('footerBackgroundColor', e.target.value)} className="w-12 h-12 rounded-xl border border-slate-200 cursor-pointer" />
                <input type="text" value={String(config.footerBackgroundColor || '')} onChange={(e) => updateConfig('footerBackgroundColor', e.target.value)} className="flex-1 bg-slate-50 rounded-xl px-4 py-3 font-bold text-slate-900 text-right border border-slate-200" />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 text-right">{t('business.design.footerTextColor', 'لون نص الفوتر')}</label>
              <div className="flex items-center gap-3 flex-row-reverse">
                <input type="color" value={String(config.footerTextColor || '#0F172A')} onChange={(e) => updateConfig('footerTextColor', e.target.value)} className="w-12 h-12 rounded-xl border border-slate-200 cursor-pointer" />
                <input type="text" value={String(config.footerTextColor || '')} onChange={(e) => updateConfig('footerTextColor', e.target.value)} className="flex-1 bg-slate-50 rounded-xl px-4 py-3 font-bold text-slate-900 text-right border border-slate-200" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DesignTab;
