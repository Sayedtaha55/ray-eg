import React from 'react';

type ThemeActivity = 'RESTAURANT' | 'FASHION' | 'TECH' | 'GENERAL' | 'CLINIC';

type ThemePreset = {
  id: string;
  name: string;
  subtitle: string;
  activity: ThemeActivity;
  patch: Record<string, any>;
};

const PRESETS: ThemePreset[] = [
  {
    id: 'restaurant_pro', name: 'Restaurant Pro', subtitle: 'بانر كبير + عروض + منتجات بكروت فاخرة', activity: 'RESTAURANT',
    patch: { quickTheme: 'restaurant_pro', primaryColor: '#C2410C', secondaryColor: '#7C2D12', headerBackgroundColor: '#FFF7ED', headerTextColor: '#7C2D12', footerBackgroundColor: '#431407', footerTextColor: '#FED7AA', productDisplay: 'cards', productsLayout: 'vertical', imageAspectRatio: 'square', homeLayoutMode: 'banner_ads_story', productCardOverlayBgColor: '#7C2D12' },
  },
  {
    id: 'catalog_clean', name: 'Catalog Clean', subtitle: 'منتجات مباشرة + عرض بسيط وواضح', activity: 'GENERAL',
    patch: { quickTheme: 'catalog_clean', primaryColor: '#0369A1', secondaryColor: '#1E293B', headerBackgroundColor: '#F8FAFC', headerTextColor: '#0F172A', footerBackgroundColor: '#E2E8F0', footerTextColor: '#0F172A', productDisplay: 'list', productsLayout: 'vertical', imageAspectRatio: 'landscape', homeLayoutMode: 'banner_products', productCardOverlayBgColor: '#0F172A' },
  },
  {
    id: 'fashion_glow', name: 'Fashion Glow', subtitle: 'ستايل بصري قوي للبراندات والملابس', activity: 'FASHION',
    patch: { quickTheme: 'fashion_glow', primaryColor: '#BE185D', secondaryColor: '#831843', headerBackgroundColor: '#FDF2F8', headerTextColor: '#831843', footerBackgroundColor: '#500724', footerTextColor: '#FBCFE8', productDisplay: 'cards', productsLayout: 'horizontal', imageAspectRatio: 'portrait', homeLayoutMode: 'banner_ads_story', productCardOverlayBgColor: '#831843' },
  },
  {
    id: 'tech_modern', name: 'Tech Modern', subtitle: 'تصميم تقني نظيف للالكترونيات والخدمات', activity: 'TECH',
    patch: { quickTheme: 'tech_modern', primaryColor: '#0EA5E9', secondaryColor: '#1E293B', headerBackgroundColor: '#0F172A', headerTextColor: '#E2E8F0', footerBackgroundColor: '#020617', footerTextColor: '#94A3B8', productDisplay: 'minimal', productsLayout: 'horizontal', imageAspectRatio: 'landscape', homeLayoutMode: 'banner_products', productCardOverlayBgColor: '#1E293B' },
  },
  {
    id: 'clinic_elegant_blue', name: 'رعاية الشفاء الكلاسيكية (أزرق)', subtitle: 'ثيم الشفاء الحديث - تصميم طبي كلاسيكي أنيق بالأزرق والرمادي الفاتح بنمط هادئ ومريح', activity: 'CLINIC',
    patch: { quickTheme: 'clinic_elegant_blue', clinicLayout: 'classic_grid', primaryColor: '#0EA5E9', secondaryColor: '#0369A1', headerBackgroundColor: '#FFFFFF', headerTextColor: '#0F172A', footerBackgroundColor: '#FFFFFF', footerTextColor: '#0F172A', pageBackgroundColor: '#FFFFFF', productDisplay: 'cards', productsLayout: 'vertical' },
  },
  {
    id: 'clinic_modern_purple', name: 'النخبة الطبية الفاخرة (بنفسجي)', subtitle: 'ثيم النخبة الفاخر - تصميم عصري متميز بالبنفسجي والوردي واللمسات الزجاجية والتأثيرات التفاعلية', activity: 'CLINIC',
    patch: { quickTheme: 'clinic_modern_purple', clinicLayout: 'banner_promo_booking', primaryColor: '#8B5CF6', secondaryColor: '#EC4899', headerBackgroundColor: '#FFFFFF', headerTextColor: '#0F172A', footerBackgroundColor: '#FFFFFF', footerTextColor: '#0F172A', pageBackgroundColor: '#FCF8FF', productDisplay: 'cards', productsLayout: 'vertical' },
  },
];

const ThemesSection: React.FC<{ config: any; setConfig: (next: any) => void; shop?: any }> = ({ config, setConfig, shop }) => {
  const rawCategory = String(shop?.category || shop?.shopCategory || '').trim().toUpperCase();
  const shopActivity: ThemeActivity = rawCategory.includes('SERVICE')
    ? 'CLINIC'
    : rawCategory.includes('RESTAURANT')
      ? 'RESTAURANT'
      : rawCategory.includes('FASHION')
        ? 'FASHION'
        : (rawCategory.includes('TECH') || rawCategory.includes('ELECTRON'))
          ? 'TECH'
          : 'GENERAL';

  const activeTheme = String(config.quickTheme || (shopActivity === 'CLINIC' ? 'clinic_elegant_blue' : 'clinic_clean'));

  const visiblePresets = PRESETS.filter((preset) => {
    if (shopActivity === 'CLINIC') {
      return preset.activity === 'CLINIC';
    }
    return preset.activity === shopActivity || preset.activity === 'GENERAL';
  });

  return (
    <div className="space-y-3">
      <p className="text-xs font-bold text-slate-500">اختار ثيم جاهز مناسب لنشاط متجرك فقط.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {visiblePresets.map((preset) => {
          const isActive = activeTheme === preset.id;
          return (
            <button key={preset.id} type="button" onClick={() => setConfig({ ...config, ...preset.patch })} className={`p-4 rounded-2xl border text-right transition-all ${isActive ? 'border-cyan-400 bg-cyan-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-black text-slate-900">{preset.name}</span>
                {isActive && <span className="text-[10px] font-black text-cyan-700">مفعل</span>}
              </div>
              <p className="mt-1 text-[11px] font-bold text-slate-500">{preset.subtitle}</p>
            </button>
          );
        })}
      </div>
      <p className="text-[11px] font-bold text-slate-400">تصنيف المتجر الحالي: {shopActivity}.</p>
    </div>
  );
};

export default ThemesSection;
