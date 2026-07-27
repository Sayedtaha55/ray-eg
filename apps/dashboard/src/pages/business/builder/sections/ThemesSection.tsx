import React from 'react';

type ThemePreset = {
  id: string;
  name: string;
  subtitle: string;
  patch: Record<string, any>;
};

// ============================================
// ثيمات الأنشطة العادية (متاجر، مطاعم، إلكترونيات...)
// ============================================
const REGULAR_PRESETS: ThemePreset[] = [
  {
    id: 'restaurant_pro', name: 'Restaurant Pro', subtitle: 'بانر كبير + عروض + منتجات بكروت فاخرة',
    patch: { quickTheme: 'restaurant_pro', primaryColor: '#C2410C', secondaryColor: '#7C2D12', headerBackgroundColor: '#FFF7ED', headerTextColor: '#7C2D12', footerBackgroundColor: '#431407', footerTextColor: '#FED7AA', productDisplay: 'cards', productsLayout: 'vertical', imageAspectRatio: 'square', homeLayoutMode: 'banner_ads_story', productCardOverlayBgColor: '#7C2D12' },
  },
  {
    id: 'catalog_clean', name: 'Catalog Clean', subtitle: 'منتجات مباشرة + عرض بسيط وواضح',
    patch: { quickTheme: 'catalog_clean', primaryColor: '#0369A1', secondaryColor: '#1E293B', headerBackgroundColor: '#F8FAFC', headerTextColor: '#0F172A', footerBackgroundColor: '#E2E8F0', footerTextColor: '#0F172A', productDisplay: 'list', productsLayout: 'vertical', imageAspectRatio: 'landscape', homeLayoutMode: 'banner_products', productCardOverlayBgColor: '#0F172A' },
  },
  {
    id: 'tech_modern', name: 'Tech Modern', subtitle: 'تصميم تقني نظيف للالكترونيات والخدمات',
    patch: { quickTheme: 'tech_modern', primaryColor: '#0EA5E9', secondaryColor: '#1E293B', headerBackgroundColor: '#0F172A', headerTextColor: '#E2E8F0', footerBackgroundColor: '#020617', footerTextColor: '#94A3B8', productDisplay: 'minimal', productsLayout: 'horizontal', imageAspectRatio: 'landscape', homeLayoutMode: 'banner_products', productCardOverlayBgColor: '#1E293B' },
  },
];

// ============================================
// ثيمات أنشطة الحجوزات (عيادات، صالونات، سبا، فنادق...)
// كل ثيم يضبط clinicLayout + ألوان مناسبة لنشاط الحجوزات
// ============================================
const BOOKING_PRESETS: ThemePreset[] = [
  {
    id: 'clinic_elegant_blue', name: 'إليجانت بلو', subtitle: 'شبكة كلاسيكية + ألوان طبية هادئة',
    patch: { quickTheme: 'clinic_elegant_blue', clinicLayout: 'classic_grid', primaryColor: '#0EA5E9', secondaryColor: '#0369A1', headerBackgroundColor: '#FFFFFF', headerTextColor: '#0F172A', footerBackgroundColor: '#FFFFFF', footerTextColor: '#0F172A', pageBackgroundColor: '#FFFFFF', homeLayoutMode: 'banner_ads_story' },
  },
  {
    id: 'clinic_warm_coral', name: 'كورال دافئ', subtitle: 'بانر ترويجي + حجز مباشر + ألوان دافئة',
    patch: { quickTheme: 'clinic_warm_coral', clinicLayout: 'banner_promo_booking', primaryColor: '#F97316', secondaryColor: '#C2410C', headerBackgroundColor: '#FFF7ED', headerTextColor: '#7C2D12', footerBackgroundColor: '#431407', footerTextColor: '#FED7AA', pageBackgroundColor: '#FFFBEB', homeLayoutMode: 'banner_ads_story' },
  },
  {
    id: 'clinic_spa_green', name: 'عيادات كبرى ومستشفيات', subtitle: 'صفحة معالج + ألوان طبية احترافية للمستشفيات والعيادات الكبيرة',
    patch: { quickTheme: 'clinic_spa_green', clinicLayout: 'wizard_full_page', primaryColor: '#10B981', secondaryColor: '#065F46', headerBackgroundColor: '#ECFDF5', headerTextColor: '#064E3B', footerBackgroundColor: '#022C22', footerTextColor: '#A7F3D0', pageBackgroundColor: '#F0FDF4', homeLayoutMode: 'banner_ads_story' },
  },
  {
    id: 'clinic_modern', name: 'العياده', subtitle: 'تصميم عصري بسيط + ألوان أنيقة + كل الأقسام متاحة',
    patch: { quickTheme: 'clinic_modern', clinicLayout: 'modern_clean', primaryColor: '#6366F1', secondaryColor: '#4338CA', headerBackgroundColor: '#0F172A', headerTextColor: '#F8FAFC', footerBackgroundColor: '#0F172A', footerTextColor: '#94A3B8', pageBackgroundColor: '#F8FAFC', homeLayoutMode: 'banner_ads_story' },
  },
];

const ThemeCardPreview: React.FC<{ patch: Record<string, any> }> = ({ patch }) => {
  const headerBg = String(patch.headerBackgroundColor || '#FFFFFF');
  const headerText = String(patch.headerTextColor || '#0F172A');
  const pageBg = String(patch.pageBackgroundColor || '#FFFFFF');
  const primary = String(patch.primaryColor || '#00E5FF');
  const secondary = String(patch.secondaryColor || '#1E293B');
  const footerBg = String(patch.footerBackgroundColor || '#FFFFFF');
  const footerText = String(patch.footerTextColor || '#0F172A');
  const isHorizontal = patch.productsLayout === 'horizontal';
  const isList = patch.productDisplay === 'list';

  return (
    <div className="w-full aspect-[16/10] rounded-xl overflow-hidden border border-slate-100 bg-white flex flex-col" style={{ backgroundColor: pageBg }}>
      {/* Mini header */}
      <div className="px-2 py-1.5 flex items-center justify-between" style={{ backgroundColor: headerBg }}>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: primary }} />
          <div className="h-1.5 w-8 rounded-full" style={{ backgroundColor: headerText, opacity: 0.7 }} />
        </div>
        <div className="flex gap-1">
          <div className="h-1.5 w-4 rounded-full" style={{ backgroundColor: headerText, opacity: 0.4 }} />
          <div className="h-1.5 w-4 rounded-full" style={{ backgroundColor: headerText, opacity: 0.4 }} />
          <div className="h-1.5 w-4 rounded-full" style={{ backgroundColor: headerText, opacity: 0.4 }} />
        </div>
      </div>

      {/* Mini banner */}
      <div className="px-2 py-1" style={{ backgroundColor: secondary, opacity: 0.9 }}>
        <div className="h-2 w-full rounded" style={{ backgroundColor: primary, opacity: 0.6 }} />
      </div>

      {/* Mini content area */}
      <div className="flex-1 px-2 py-1.5 flex gap-1.5" style={{ flexDirection: isHorizontal ? 'row' : 'column' }}>
        {isList ? (
          <>
            <div className="flex-1 flex items-center gap-1.5 rounded p-1" style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(0,0,0,0.05)' }}>
              <div className="w-6 h-6 rounded" style={{ backgroundColor: primary, opacity: 0.2 }} />
              <div className="flex-1 space-y-0.5">
                <div className="h-1 w-12 rounded-full bg-slate-300" />
                <div className="h-1 w-8 rounded-full bg-slate-200" />
              </div>
            </div>
            <div className="flex-1 flex items-center gap-1.5 rounded p-1" style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(0,0,0,0.05)' }}>
              <div className="w-6 h-6 rounded" style={{ backgroundColor: primary, opacity: 0.2 }} />
              <div className="flex-1 space-y-0.5">
                <div className="h-1 w-10 rounded-full bg-slate-300" />
                <div className="h-1 w-6 rounded-full bg-slate-200" />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex-1 rounded p-1 flex flex-col gap-0.5" style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(0,0,0,0.05)' }}>
              <div className="w-full aspect-square rounded" style={{ backgroundColor: primary, opacity: 0.15 }} />
              <div className="h-1 w-full rounded-full bg-slate-300" />
              <div className="h-1.5 w-6 rounded-full" style={{ backgroundColor: primary }} />
            </div>
            <div className="flex-1 rounded p-1 flex flex-col gap-0.5" style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(0,0,0,0.05)' }}>
              <div className="w-full aspect-square rounded" style={{ backgroundColor: secondary, opacity: 0.15 }} />
              <div className="h-1 w-full rounded-full bg-slate-300" />
              <div className="h-1.5 w-6 rounded-full" style={{ backgroundColor: primary }} />
            </div>
          </>
        )}
      </div>

      {/* Mini footer */}
      <div className="px-2 py-1 flex items-center justify-between" style={{ backgroundColor: footerBg }}>
        <div className="h-1 w-6 rounded-full" style={{ backgroundColor: footerText, opacity: 0.5 }} />
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: primary, opacity: 0.6 }} />
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: secondary, opacity: 0.6 }} />
        </div>
      </div>
    </div>
  );
};

// ============================================
// معاينة مصغرة لثيمات الحجوزات — تعرض أطباء/مواعيد بدلاً من منتجات
// ============================================
const BookingThemeCardPreview: React.FC<{ patch: Record<string, any> }> = ({ patch }) => {
  const headerBg = String(patch.headerBackgroundColor || '#FFFFFF');
  const headerText = String(patch.headerTextColor || '#0F172A');
  const pageBg = String(patch.pageBackgroundColor || '#FFFFFF');
  const primary = String(patch.primaryColor || '#0EA5E9');
  const secondary = String(patch.secondaryColor || '#0369A1');
  const footerBg = String(patch.footerBackgroundColor || '#FFFFFF');
  const footerText = String(patch.footerTextColor || '#0F172A');
  const layout = String(patch.clinicLayout || 'classic_grid');

  return (
    <div className="w-full aspect-[16/10] rounded-xl overflow-hidden border border-slate-100 bg-white flex flex-col" style={{ backgroundColor: pageBg }}>
      {/* Mini header */}
      <div className="px-2 py-1.5 flex items-center justify-between" style={{ backgroundColor: headerBg }}>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: primary }} />
          <div className="h-1.5 w-8 rounded-full" style={{ backgroundColor: headerText, opacity: 0.7 }} />
        </div>
        <div className="flex gap-1">
          <div className="h-1.5 w-4 rounded-full" style={{ backgroundColor: headerText, opacity: 0.4 }} />
          <div className="h-1.5 w-4 rounded-full" style={{ backgroundColor: headerText, opacity: 0.4 }} />
        </div>
      </div>

      {/* Mini banner */}
      <div className="px-2 py-1" style={{ backgroundColor: secondary, opacity: 0.85 }}>
        <div className="h-2 w-3/4 rounded" style={{ backgroundColor: primary, opacity: 0.5 }} />
      </div>

      {/* Mini content — doctor cards + booking slots */}
      <div className="flex-1 px-2 py-1.5 flex gap-1.5" style={{ flexDirection: layout === 'wizard_full_page' ? 'column' : 'row' }}>
        {/* Doctor card 1 */}
        <div className="flex-1 rounded p-1 flex flex-col gap-0.5" style={{ backgroundColor: '#FFFFFF', border: `1px solid ${primary}20` }}>
          <div className="w-full aspect-square rounded-full" style={{ backgroundColor: primary, opacity: 0.12 }} />
          <div className="h-1 w-full rounded-full bg-slate-300" />
          <div className="h-1.5 w-6 rounded-full" style={{ backgroundColor: primary }} />
        </div>
        {/* Booking slots */}
        <div className="flex-1 flex flex-col gap-0.5">
          <div className="h-2 w-full rounded" style={{ backgroundColor: primary, opacity: 0.15 }} />
          <div className="h-2 w-full rounded" style={{ backgroundColor: primary, opacity: 0.25 }} />
          <div className="h-2 w-full rounded" style={{ backgroundColor: primary, opacity: 0.15 }} />
          <div className="h-2 w-2/3 rounded" style={{ backgroundColor: secondary, opacity: 0.3 }} />
        </div>
      </div>

      {/* Mini footer */}
      <div className="px-2 py-1 flex items-center justify-between" style={{ backgroundColor: footerBg }}>
        <div className="h-1 w-6 rounded-full" style={{ backgroundColor: footerText, opacity: 0.5 }} />
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: primary, opacity: 0.6 }} />
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: secondary, opacity: 0.6 }} />
        </div>
      </div>
    </div>
  );
};

const ThemesSection: React.FC<{ config: any; setConfig: (next: any) => void; shop?: any; isBookingActivity?: boolean }> = ({ config, setConfig, shop, isBookingActivity = false }) => {
  const activeTheme = String(config.quickTheme || (isBookingActivity ? 'clinic_elegant_blue' : 'catalog_clean'));
  const presets = isBookingActivity ? BOOKING_PRESETS : REGULAR_PRESETS;
  const Preview = isBookingActivity ? BookingThemeCardPreview : ThemeCardPreview;

  return (
    <div className="space-y-3">
      <p className="text-xs font-bold text-slate-500">
        {isBookingActivity ? 'اختار ثيم جاهز مناسب لنشاط الحجوزات الخاص بك.' : 'اختار ثيم جاهز مناسب لنشاط متجرك.'}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {presets.map((preset) => {
          const isActive = activeTheme === preset.id;
          return (
            <button key={preset.id} type="button" onClick={() => setConfig({ ...config, ...preset.patch })} className={`rounded-2xl border text-right transition-all overflow-hidden flex flex-col ${isActive ? 'border-cyan-400 bg-cyan-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
              <div className="p-2">
                <Preview patch={preset.patch} />
              </div>
              <div className="px-3 pb-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-black text-slate-900">{preset.name}</span>
                  {isActive && <span className="text-[10px] font-black text-cyan-700">مفعل</span>}
                </div>
                {preset.subtitle && <p className="mt-0.5 text-[11px] font-bold text-slate-400">{preset.subtitle}</p>}
              </div>
            </button>
          );
        })}
      </div>
      <p className="text-[11px] font-bold text-slate-400">الثيمات تتطبق فور الضغط عليها. الألوان والتخطيط هيتغيروا في المعاينة.</p>
    </div>
  );
};

export default ThemesSection;
