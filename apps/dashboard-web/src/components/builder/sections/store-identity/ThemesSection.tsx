'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import { UnifiedBuilderConfig } from '@/types/builder';
import { applyQuickTheme, updateUnifiedColors } from '@/lib/builder/colorSystem';

interface ThemesSectionProps {
  config: UnifiedBuilderConfig;
  onChange: (config: UnifiedBuilderConfig) => void;
  activityType: 'COMMERCIAL' | 'RESERVATIONS' | 'HYBRID';
}

type ThemePreset = {
  id: string;
  name: string;
  subtitle: string;
  patch: Record<string, any>;
};

// ثيمات الأنشطة العادية (متاجر، مطاعم، إلكترونيات...)
const REGULAR_PRESETS: ThemePreset[] = [
  {
    id: 'restaurant_pro',
    name: 'Restaurant Pro',
    subtitle: 'بانر كبير + عروض + منتجات بكروت فاخرة',
    patch: {
      quickTheme: 'restaurant_pro',
      primaryColor: '#C2410C',
      secondaryColor: '#7C2D12',
      headerBackgroundColor: '#FFF7ED',
      headerTextColor: '#7C2D12',
      footerBackgroundColor: '#431407',
      footerTextColor: '#FED7AA',
      productDisplay: 'cards',
      productsLayout: 'vertical',
      imageAspectRatio: 'square',
      homeLayoutMode: 'banner_ads_story',
      productCardOverlayBgColor: '#7C2D12'
    },
  },
  {
    id: 'catalog_clean',
    name: 'Catalog Clean',
    subtitle: 'منتجات مباشرة + عرض بسيط وواضح',
    patch: {
      quickTheme: 'catalog_clean',
      primaryColor: '#0369A1',
      secondaryColor: '#1E293B',
      headerBackgroundColor: '#F8FAFC',
      headerTextColor: '#0F172A',
      footerBackgroundColor: '#E2E8F0',
      footerTextColor: '#0F172A',
      productDisplay: 'list',
      productsLayout: 'vertical',
      imageAspectRatio: 'landscape',
      homeLayoutMode: 'banner_products',
      productCardOverlayBgColor: '#0F172A'
    },
  },
  {
    id: 'tech_modern',
    name: 'Tech Modern',
    subtitle: 'تصميم تقني نظيف للالكترونيات والخدمات',
    patch: {
      quickTheme: 'tech_modern',
      primaryColor: '#0EA5E9',
      secondaryColor: '#1E293B',
      headerBackgroundColor: '#0F172A',
      headerTextColor: '#E2E8F0',
      footerBackgroundColor: '#020617',
      footerTextColor: '#94A3B8',
      productDisplay: 'minimal',
      productsLayout: 'horizontal',
      imageAspectRatio: 'landscape',
      homeLayoutMode: 'banner_products',
      productCardOverlayBgColor: '#1E293B'
    },
  },
  {
    id: 'luxury_gold',
    name: 'Luxury Gold',
    subtitle: 'تصميم فاخر ذهبي للمتاجر الراقية',
    patch: {
      quickTheme: 'luxury_gold',
      primaryColor: '#D4AF37',
      secondaryColor: '#1A1A1A',
      headerBackgroundColor: '#1A1A1A',
      headerTextColor: '#D4AF37',
      footerBackgroundColor: '#0D0D0D',
      footerTextColor: '#D4AF37',
      productDisplay: 'cards',
      productsLayout: 'vertical',
      imageAspectRatio: 'square',
      homeLayoutMode: 'banner_ads_story',
      productCardOverlayBgColor: '#1A1A1A',
      buttonShape: 'rounded-lg',
      buttonPadding: 'px-8 py-3',
    },
  },
  {
    id: 'nature_green',
    name: 'Nature Green',
    subtitle: 'تصميم طبيعي أخضر للمنتجات العضوية',
    patch: {
      quickTheme: 'nature_green',
      primaryColor: '#22C55E',
      secondaryColor: '#166534',
      headerBackgroundColor: '#F0FDF4',
      headerTextColor: '#166534',
      footerBackgroundColor: '#14532D',
      footerTextColor: '#BBF7D0',
      productDisplay: 'cards',
      productsLayout: 'vertical',
      imageAspectRatio: 'square',
      homeLayoutMode: 'banner_products',
      productCardOverlayBgColor: '#166534',
    },
  },
  {
    id: 'minimal_white',
    name: 'Minimal White',
    subtitle: 'تصميم أبيض بسيط ونظيف',
    patch: {
      quickTheme: 'minimal_white',
      primaryColor: '#64748B',
      secondaryColor: '#94A3B8',
      headerBackgroundColor: '#FFFFFF',
      headerTextColor: '#1E293B',
      footerBackgroundColor: '#F8FAFC',
      footerTextColor: '#64748B',
      productDisplay: 'minimal',
      productsLayout: 'vertical',
      imageAspectRatio: 'square',
      homeLayoutMode: 'products_only',
      productCardOverlayBgColor: '#1E293B',
      buttonShape: 'rounded-none',
      buttonPadding: 'px-6 py-2',
    },
  },
  {
    id: 'gradient_neon',
    name: 'Gradient Neon',
    subtitle: 'تصميم نيون عصري وجذاب',
    patch: {
      quickTheme: 'gradient_neon',
      primaryColor: '#F472B6',
      secondaryColor: '#8B5CF6',
      headerBackgroundColor: '#1E1B4B',
      headerTextColor: '#E0E7FF',
      footerBackgroundColor: '#0F0A29',
      footerTextColor: '#C7D2FE',
      productDisplay: 'cards',
      productsLayout: 'horizontal',
      imageAspectRatio: 'portrait',
      homeLayoutMode: 'banner_products',
      productCardOverlayBgColor: '#1E1B4B',
      buttonShape: 'rounded-full',
      buttonPadding: 'px-8 py-3',
    },
  },
];

// ثيمات أنشطة الحجوزات (عيادات، صالونات، سبا، فنادق...)
const BOOKING_PRESETS: ThemePreset[] = [
  {
    id: 'clinic_elegant_blue',
    name: 'إليجانت بلو',
    subtitle: 'شبكة كلاسيكية + ألوان طبية هادئة',
    patch: {
      quickTheme: 'clinic_elegant_blue',
      clinicLayout: 'classic_grid',
      primaryColor: '#0EA5E9',
      secondaryColor: '#0369A1',
      headerBackgroundColor: '#FFFFFF',
      headerTextColor: '#0F172A',
      footerBackgroundColor: '#FFFFFF',
      footerTextColor: '#0F172A',
      pageBackgroundColor: '#FFFFFF',
      homeLayoutMode: 'banner_ads_story'
    },
  },
  {
    id: 'clinic_warm_coral',
    name: 'كورال دافئ',
    subtitle: 'بانر ترويجي + حجز مباشر + ألوان دافئة',
    patch: {
      quickTheme: 'clinic_warm_coral',
      clinicLayout: 'banner_promo_booking',
      primaryColor: '#F97316',
      secondaryColor: '#C2410C',
      headerBackgroundColor: '#FFF7ED',
      headerTextColor: '#7C2D12',
      footerBackgroundColor: '#431407',
      footerTextColor: '#FED7AA',
      pageBackgroundColor: '#FFFBEB',
      homeLayoutMode: 'banner_ads_story'
    },
  },
  {
    id: 'clinic_spa_green',
    name: 'عيادات كبرى ومستشفيات',
    subtitle: 'صفحة معالج + ألوان طبية احترافية',
    patch: {
      quickTheme: 'clinic_spa_green',
      clinicLayout: 'wizard_full_page',
      primaryColor: '#10B981',
      secondaryColor: '#065F46',
      headerBackgroundColor: '#ECFDF5',
      headerTextColor: '#064E3B',
      footerBackgroundColor: '#022C22',
      footerTextColor: '#A7F3D0',
      pageBackgroundColor: '#F0FDF4',
      homeLayoutMode: 'banner_ads_story'
    },
  },
  {
    id: 'clinic_modern',
    name: 'العياده',
    subtitle: 'تصميم عصري بسيط + ألوان أنيقة',
    patch: {
      quickTheme: 'clinic_modern',
      clinicLayout: 'modern_clean',
      primaryColor: '#6366F1',
      secondaryColor: '#4338CA',
      headerBackgroundColor: '#0F172A',
      headerTextColor: '#F8FAFC',
      footerBackgroundColor: '#0F172A',
      footerTextColor: '#94A3B8',
      pageBackgroundColor: '#F8FAFC',
      homeLayoutMode: 'banner_ads_story'
    },
  },
  {
    id: 'salon_pink',
    name: 'صالون وردي',
    subtitle: 'تصميم أنيق للصالونات والتجميل',
    patch: {
      quickTheme: 'salon_pink',
      clinicLayout: 'modern_clean',
      primaryColor: '#EC4899',
      secondaryColor: '#BE185D',
      headerBackgroundColor: '#FDF2F8',
      headerTextColor: '#831843',
      footerBackgroundColor: '#831843',
      footerTextColor: '#FCE7F3',
      pageBackgroundColor: '#FDF2F8',
      homeLayoutMode: 'banner_ads_story'
    },
  },
  {
    id: 'hotel_luxury',
    name: 'فندق فاخر',
    subtitle: 'تصميم فاخر للفنادق والمنتجعات',
    patch: {
      quickTheme: 'hotel_luxury',
      clinicLayout: 'classic_grid',
      primaryColor: '#D4AF37',
      secondaryColor: '#1A1A1A',
      headerBackgroundColor: '#1A1A1A',
      headerTextColor: '#D4AF37',
      footerBackgroundColor: '#0D0D0D',
      footerTextColor: '#D4AF37',
      pageBackgroundColor: '#FAFAFA',
      homeLayoutMode: 'banner_ads_story'
    },
  },
  {
    id: 'gym_energy',
    name: 'جيم طاقة',
    subtitle: 'تصميم ديناميكي للصالات الرياضية',
    patch: {
      quickTheme: 'gym_energy',
      clinicLayout: 'modern_clean',
      primaryColor: '#EF4444',
      secondaryColor: '#1E293B',
      headerBackgroundColor: '#1E293B',
      headerTextColor: '#F8FAFC',
      footerBackgroundColor: '#0F172A',
      footerTextColor: '#94A3B8',
      pageBackgroundColor: '#F8FAFC',
      homeLayoutMode: 'banner_products'
    },
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

export default function ThemesSection({ config, onChange, activityType }: ThemesSectionProps) {
  const presets = activityType === 'RESERVATIONS' || activityType === 'HYBRID' 
    ? BOOKING_PRESETS 
    : REGULAR_PRESETS;

  const handleThemeSelect = (theme: ThemePreset) => {
    // استخدام نظام توحيد الألوان لتطبيق الثيم
    const updatedConfig = applyQuickTheme(config, theme.id);
    
    // تطبيق الإعدادات الإضافية من الـ patch
    const finalConfig = {
      ...updatedConfig,
      ...theme.patch,
      selectedTheme: theme.id
    };
    
    onChange(finalConfig);
  };

  const isSelected = (themeId: string) => config.selectedTheme === themeId || config.quickTheme === themeId;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h3 className="text-sm font-black text-slate-800">اختر طابع متجرك</h3>
        <p className="text-xs text-slate-400 font-bold leading-relaxed">
          قم بتغيير شكل المتجر بالكامل بضغطة واحدة. يمكنك تخصيص الألوان لاحقاً.
        </p>
      </div>
      
      {/* Desktop: 3 columns, Tablet: 2 columns, Mobile: 1 column */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pb-20 md:pb-0">
        {presets.map((theme) => (
          <button
            key={theme.id}
            onClick={() => handleThemeSelect(theme)}
            className={`group relative p-4 rounded-2xl border-2 transition-all text-right ${
              isSelected(theme.id)
                ? 'border-brand-cyan bg-brand-cyan/5 shadow-lg shadow-cyan-500/10'
                : 'border-slate-200 hover:border-brand-cyan/50 hover:shadow-md hover:shadow-cyan-500/5 bg-white'
            }`}
          >
            {/* Theme Preview */}
            <div className="mb-4 rounded-xl overflow-hidden shadow-sm">
              <ThemeCardPreview patch={theme.patch} />
            </div>
            
            {/* Theme Info */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-slate-900">{theme.name}</h4>
                {isSelected(theme.id) && (
                  <div className="w-5 h-5 rounded-full bg-brand-cyan flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">{theme.subtitle}</p>
            </div>
            
            {/* Hover effect border */}
            <div className={`absolute inset-0 rounded-2xl border-2 transition-opacity pointer-events-none ${
              isSelected(theme.id) ? 'border-brand-cyan' : 'border-brand-cyan/0 group-hover:border-brand-cyan/30'
            }`} />
          </button>
        ))}
      </div>
      
      {/* Mobile hint */}
      <p className="text-xs text-slate-400 text-center sm:hidden">
        اسحب يميناً أو يساراً لرؤية المزيد من الثيمات
      </p>
    </div>
  );
}