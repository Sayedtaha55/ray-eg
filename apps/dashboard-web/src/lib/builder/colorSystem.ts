// ============================================================================
// COLOR UNIFICATION SYSTEM
// نظام توحيد الألوان بين النظام القديم والجديد
// ============================================================================

import { UnifiedBuilderConfig, ColorPalette } from '@/types/builder';

/**
 * الحصول على الألوان الموحدة من الكونفيج
 * هذا الدالة ترجع الألوان من النظام الجديد إذا وجد، وإلا من النظام القديم
 */
export function getUnifiedColors(config: UnifiedBuilderConfig): ColorPalette {
  // إذا كان النظام الجديد موجوداً، استخدمه
  if (config.colors && Object.keys(config.colors).length > 0) {
    return config.colors;
  }

  // خلاف ذلك، أنشئ ColorPalette من النظام القديم
  return {
    primary: config.primaryColor || '#00E5FF',
    secondary: config.secondaryColor || '#BD00FF',
    accent: config.secondaryColor || '#BD00FF', // استخدام الثانوي كـ accent
    background: config.pageBackgroundColor || config.backgroundColor || '#FFFFFF',
    surface: config.surface || '#F8FAFC',
    text: {
      primary: config.headerTextColor || '#0F172A',
      secondary: config.footerTextColor || '#64748B',
      disabled: '#94A3B8',
    },
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
  };
}

/**
 * تحديث الكونفيج مع الألوان الموحدة
 * هذا الدالة تحدث كل من النظام القديم والجديد
 */
export function updateUnifiedColors(
  config: UnifiedBuilderConfig,
  colors: Partial<ColorPalette>
): UnifiedBuilderConfig {
  const updated = { ...config };

  // تحديث النظام الجديد
  if (!updated.colors) {
    updated.colors = getUnifiedColors(config);
  }
  updated.colors = { ...updated.colors, ...colors };

  // تحديث النظام القديم للحفاظ على التوافق
  if (colors.primary) updated.primaryColor = colors.primary;
  if (colors.secondary) updated.secondaryColor = colors.secondary;
  if (colors.background) updated.pageBackgroundColor = colors.background;
  if (colors.surface) updated.surface = colors.surface;
  if (colors.text?.primary) updated.headerTextColor = colors.text.primary;
  if (colors.text?.secondary) updated.footerTextColor = colors.text.secondary;

  return updated;
}

/**
 * الحصول على لون معين مع دعم Dark Mode
 */
export function getColorWithDarkMode(
  config: UnifiedBuilderConfig,
  colorKey: keyof ColorPalette,
  darkModeKey?: keyof NonNullable<UnifiedBuilderConfig['darkModeColors']>
): string {
  const colors = getUnifiedColors(config);
  
  // إذا كان Dark Mode مفعلاً والمفتاح موجود
  if (config.darkMode && config.darkModeColors) {
    if (darkModeKey && config.darkModeColors[darkModeKey]) {
      return config.darkModeColors[darkModeKey] as string;
    }
    
    // Mapping تلقائي للألوان الشائعة
    if (colorKey === 'background' && config.darkModeColors.background) {
      return config.darkModeColors.background;
    }
    if (colorKey === 'surface' && config.darkModeColors.surface) {
      return config.darkModeColors.surface;
    }
    if (colorKey === 'text' && config.darkModeColors.text?.primary) {
      return config.darkModeColors.text.primary;
    }
  }

  // إرجاع اللون العادي
  if (colorKey === 'text') {
    return colors.text.primary;
  }
  return colors[colorKey] || '#000000';
}

/**
 * تطبيق ثيم سريع على الكونفيج
 */
export function applyQuickTheme(
  config: UnifiedBuilderConfig,
  themeId: string
): UnifiedBuilderConfig {
  const themePresets: Record<string, Partial<ColorPalette>> = {
    restaurant_pro: {
      primary: '#C2410C',
      secondary: '#7C2D12',
      accent: '#F97316',
      background: '#FFF7ED',
      surface: '#FED7AA',
      text: { primary: '#7C2D12', secondary: '#9A3412', disabled: '#FDBA74' },
    },
    catalog_clean: {
      primary: '#0369A1',
      secondary: '#1E293B',
      accent: '#0EA5E9',
      background: '#F8FAFC',
      surface: '#E2E8F0',
      text: { primary: '#0F172A', secondary: '#475569', disabled: '#94A3B8' },
    },
    tech_modern: {
      primary: '#0EA5E9',
      secondary: '#1E293B',
      accent: '#6366F1',
      background: '#0F172A',
      surface: '#1E293B',
      text: { primary: '#E2E8F0', secondary: '#94A3B8', disabled: '#64748B' },
    },
    luxury_gold: {
      primary: '#D4AF37',
      secondary: '#1A1A1A',
      accent: '#B8860B',
      background: '#1A1A1A',
      surface: '#2D2D2D',
      text: { primary: '#D4AF37', secondary: '#F5DEB3', disabled: '#8B7355' },
    },
    nature_green: {
      primary: '#22C55E',
      secondary: '#166534',
      accent: '#10B981',
      background: '#F0FDF4',
      surface: '#BBF7D0',
      text: { primary: '#166534', secondary: '#15803D', disabled: '#86EFAC' },
    },
    minimal_white: {
      primary: '#64748B',
      secondary: '#94A3B8',
      accent: '#475569',
      background: '#FFFFFF',
      surface: '#F8FAFC',
      text: { primary: '#1E293B', secondary: '#64748B', disabled: '#CBD5E1' },
    },
    gradient_neon: {
      primary: '#F472B6',
      secondary: '#8B5CF6',
      accent: '#EC4899',
      background: '#1E1B4B',
      surface: '#312E81',
      text: { primary: '#E0E7FF', secondary: '#A5B4FC', disabled: '#6366F1' },
    },
  };

  const themeColors = themePresets[themeId];
  if (!themeColors) return config;

  const updated = updateUnifiedColors(config, themeColors);
  updated.quickTheme = themeId;
  updated.selectedTheme = themeId;
  
  // تحديث theme object
  if (!updated.theme) {
    updated.theme = { id: themeId, name: themeId, variant: 'light' };
  } else {
    updated.theme.id = themeId;
    updated.theme.name = themeId;
  }

  return updated;
}

/**
 * الحصول على ألوان الأزرار من الكونفيج
 */
export function getButtonColors(config: UnifiedBuilderConfig) {
  const colors = getUnifiedColors(config);
  
  return {
    backgroundColor: (config as any).buttonBackgroundColor || colors.primary,
    textColor: (config as any).buttonTextColor || '#FFFFFF',
    hoverColor: (config as any).buttonHoverColor || colors.secondary,
    borderColor: colors.secondary,
    shape: config.buttonShape || 'rounded-2xl',
    padding: config.buttonPadding || 'px-6 py-3',
  };
}

/**
 * الحصول على ألوان الهيدر من الكونفيج
 */
export function getHeaderColors(config: UnifiedBuilderConfig) {
  const colors = getUnifiedColors(config);
  
  return {
    backgroundColor: config.headerBackgroundColor || colors.background,
    textColor: config.headerTextColor || colors.text.primary,
    transparent: config.headerTransparent || false,
    opacity: config.headerOpacity || 100,
    overlayBanner: config.headerOverlayBanner || false,
  };
}

/**
 * الحصول على ألوان الفوتر من الكونفيج
 */
export function getFooterColors(config: UnifiedBuilderConfig) {
  const colors = getUnifiedColors(config);
  
  return {
    backgroundColor: config.footerBackgroundColor || colors.background,
    textColor: config.footerTextColor || colors.text.primary,
    transparent: config.footerTransparent || false,
    opacity: config.footerOpacity || 100,
  };
}

/**
 * الحصول على ألوان بطاقة المنتج من الكونفيج
 */
export function getProductCardColors(config: UnifiedBuilderConfig) {
  const colors = getUnifiedColors(config);
  
  return {
    overlayBgColor: config.productCardOverlayBgColor || colors.surface,
    overlayOpacity: config.productCardOverlayOpacity || 70,
    titleColor: config.productCardTitleColor || colors.text.primary,
    priceColor: config.productCardPriceColor || colors.primary,
  };
}
