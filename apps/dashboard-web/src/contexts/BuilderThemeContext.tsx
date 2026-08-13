// ============================================================================
// BUILDER THEME CONTEXT
// إدارة حالة الثيمات globally في البيلدر
// ============================================================================

'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { UnifiedBuilderConfig, ColorPalette } from '@/types/builder';
import {
  getUnifiedColors,
  updateUnifiedColors,
  applyQuickTheme,
  getButtonColors,
  getHeaderColors,
  getFooterColors,
  getProductCardColors,
  getColorWithDarkMode,
} from '@/lib/builder/colorSystem';

interface BuilderThemeContextValue {
  config: UnifiedBuilderConfig;
  updateConfig: (updates: Partial<UnifiedBuilderConfig>) => void;
  updateColors: (colors: Partial<ColorPalette>) => void;
  applyTheme: (themeId: string) => void;
  toggleDarkMode: (enabled?: boolean) => void;
  updateDarkModeColors: (colors: Partial<NonNullable<UnifiedBuilderConfig['darkModeColors']>>) => void;
  
  // Getters
  colors: ColorPalette;
  buttonColors: ReturnType<typeof getButtonColors>;
  headerColors: ReturnType<typeof getHeaderColors>;
  footerColors: ReturnType<typeof getFooterColors>;
  productCardColors: ReturnType<typeof getProductCardColors>;
  isDarkMode: boolean;
}

const BuilderThemeContext = createContext<BuilderThemeContextValue | undefined>(undefined);

interface BuilderThemeProviderProps {
  children: ReactNode;
  initialConfig: UnifiedBuilderConfig;
  onConfigChange?: (config: UnifiedBuilderConfig) => void;
}

export function BuilderThemeProvider({
  children,
  initialConfig,
  onConfigChange,
}: BuilderThemeProviderProps) {
  const [config, setConfig] = useState<UnifiedBuilderConfig>(initialConfig);

  // تحديث الكونفيج
  const updateConfig = useCallback((updates: Partial<UnifiedBuilderConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    onConfigChange?.(newConfig);
  }, [config, onConfigChange]);

  // تحديث الألوان باستخدام نظام توحيد الألوان
  const updateColors = useCallback((colors: Partial<import('@/types/builder').ColorPalette>) => {
    const newConfig = updateUnifiedColors(config, colors);
    setConfig(newConfig);
    onConfigChange?.(newConfig);
  }, [config, onConfigChange]);

  // تطبيق ثيم سريع
  const applyTheme = useCallback((themeId: string) => {
    const newConfig = applyQuickTheme(config, themeId);
    setConfig(newConfig);
    onConfigChange?.(newConfig);
  }, [config, onConfigChange]);

  // تبديل Dark Mode
  const toggleDarkMode = useCallback((enabled?: boolean) => {
    const newEnabled = enabled !== undefined ? enabled : !config.darkMode;
    updateConfig({ darkMode: newEnabled });
  }, [config.darkMode, updateConfig]);

  // تحديث ألوان Dark Mode
  const updateDarkModeColors = useCallback((colors: Partial<NonNullable<UnifiedBuilderConfig['darkModeColors']>>) => {
    const currentDarkColors = config.darkModeColors || {};
    const newDarkColors = { ...currentDarkColors, ...colors };
    updateConfig({ darkModeColors: newDarkColors });
  }, [config.darkModeColors, updateConfig]);

  // الحصول على الألوان الموحدة
  const colors = getUnifiedColors(config);
  const buttonColors = getButtonColors(config);
  const headerColors = getHeaderColors(config);
  const footerColors = getFooterColors(config);
  const productCardColors = getProductCardColors(config);
  const isDarkMode = config.darkMode || false;

  const value: BuilderThemeContextValue = {
    config,
    updateConfig,
    updateColors,
    applyTheme,
    toggleDarkMode,
    updateDarkModeColors,
    colors,
    buttonColors,
    headerColors,
    footerColors,
    productCardColors,
    isDarkMode,
  };

  return (
    <BuilderThemeContext.Provider value={value}>
      {children}
    </BuilderThemeContext.Provider>
  );
}

// Hook لاستخدام الـ Context
export function useBuilderTheme() {
  const context = useContext(BuilderThemeContext);
  if (!context) {
    throw new Error('useBuilderTheme must be used within a BuilderThemeProvider');
  }
  return context;
}

// Hook للحصول على لون معين مع دعم Dark Mode
export function useThemeColor(colorKey: keyof ColorPalette, darkModeKey?: keyof NonNullable<UnifiedBuilderConfig['darkModeColors']>) {
  const { config, colors } = useBuilderTheme();
  return getColorWithDarkMode(config, colorKey, darkModeKey);
}
