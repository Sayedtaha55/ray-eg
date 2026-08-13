'use client';

import React from 'react';
import { ColorPalette } from '@/types/builder';
import { useBuilderTheme } from '@/contexts/BuilderThemeContext';

interface ColorsSectionProps {
  colors?: ColorPalette;
  onChange?: (colors: ColorPalette) => void;
}

export default function ColorsSection({ colors: propColors, onChange: propOnChange }: ColorsSectionProps) {
  // استخدام Context إذا لم يتم توفير props
  const themeContext = useBuilderTheme();
  const colors = propColors || themeContext.colors;
  const onChange = propOnChange || themeContext.updateColors;
  
  const handleColorChange = (key: keyof ColorPalette, value: string) => {
    onChange({
      ...colors,
      [key]: value,
    });
  };

  const handleTextColorChange = (key: keyof ColorPalette['text'], value: string) => {
    onChange({
      ...colors,
      text: {
        ...colors.text,
        [key]: value,
      },
    });
  };

  const presetPalettes: ColorPalette[] = [
    {
      primary: '#00E5FF',
      secondary: '#BD00FF',
      accent: '#FF6B6B',
      background: '#FFFFFF',
      surface: '#F8FAFC',
      text: {
        primary: '#1A1A1A',
        secondary: '#64748B',
        disabled: '#94A3B8',
      },
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
    },
    {
      primary: '#3B82F6',
      secondary: '#8B5CF6',
      accent: '#EC4899',
      background: '#FFFFFF',
      surface: '#F1F5F9',
      text: {
        primary: '#0F172A',
        secondary: '#475569',
        disabled: '#94A3B8',
      },
      success: '#22C55E',
      warning: '#F59E0B',
      error: '#EF4444',
    },
    {
      primary: '#10B981',
      secondary: '#06B6D4',
      accent: '#F59E0B',
      background: '#FFFFFF',
      surface: '#F0FDF4',
      text: {
        primary: '#064E3B',
        secondary: '#047857',
        disabled: '#6EE7B7',
      },
      success: '#059669',
      warning: '#D97706',
      error: '#DC2626',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Preset Palettes */}
      <div>
        <h3 className="font-bold text-sm mb-3">لوحات جاهزة</h3>
        <div className="grid grid-cols-3 gap-2">
          {presetPalettes.map((palette, index) => (
            <button
              key={index}
              onClick={() => onChange(palette)}
              className="p-2 rounded-xl border-2 border-transparent hover:border-brand-cyan transition-all"
            >
              <div className="flex gap-1 mb-2">
                <div
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: palette.primary }}
                />
                <div
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: palette.secondary }}
                />
                <div
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: palette.accent }}
                />
              </div>
              <span className="text-xs font-bold">لوحة {index + 1}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Colors */}
      <div>
        <h3 className="font-bold text-sm mb-3">الألوان الرئيسية</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-slate-600 mb-1 block">اللون الأساسي</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={colors.primary}
                onChange={(e) => handleColorChange('primary', e.target.value)}
                className="w-12 h-10 rounded-lg cursor-pointer border-0"
              />
              <input
                type="text"
                value={colors.primary}
                onChange={(e) => handleColorChange('primary', e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 mb-1 block">اللون الثانوي</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={colors.secondary}
                onChange={(e) => handleColorChange('secondary', e.target.value)}
                className="w-12 h-10 rounded-lg cursor-pointer border-0"
              />
              <input
                type="text"
                value={colors.secondary}
                onChange={(e) => handleColorChange('secondary', e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 mb-1 block">لون التمييز</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={colors.accent}
                onChange={(e) => handleColorChange('accent', e.target.value)}
                className="w-12 h-10 rounded-lg cursor-pointer border-0"
              />
              <input
                type="text"
                value={colors.accent}
                onChange={(e) => handleColorChange('accent', e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Background Colors */}
      <div>
        <h3 className="font-bold text-sm mb-3">ألوان الخلفية</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-slate-600 mb-1 block">لون الخلفية</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={colors.background}
                onChange={(e) => handleColorChange('background', e.target.value)}
                className="w-12 h-10 rounded-lg cursor-pointer border-0"
              />
              <input
                type="text"
                value={colors.background}
                onChange={(e) => handleColorChange('background', e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 mb-1 block">لون السطح</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={colors.surface}
                onChange={(e) => handleColorChange('surface', e.target.value)}
                className="w-12 h-10 rounded-lg cursor-pointer border-0"
              />
              <input
                type="text"
                value={colors.surface}
                onChange={(e) => handleColorChange('surface', e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Text Colors */}
      <div>
        <h3 className="font-bold text-sm mb-3">ألوان النص</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-slate-600 mb-1 block">النص الأساسي</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={colors.text.primary}
                onChange={(e) => handleTextColorChange('primary', e.target.value)}
                className="w-12 h-10 rounded-lg cursor-pointer border-0"
              />
              <input
                type="text"
                value={colors.text.primary}
                onChange={(e) => handleTextColorChange('primary', e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 mb-1 block">النص الثانوي</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={colors.text.secondary}
                onChange={(e) => handleTextColorChange('secondary', e.target.value)}
                className="w-12 h-10 rounded-lg cursor-pointer border-0"
              />
              <input
                type="text"
                value={colors.text.secondary}
                onChange={(e) => handleTextColorChange('secondary', e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 mb-1 block">النص المعطل</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={colors.text.disabled}
                onChange={(e) => handleTextColorChange('disabled', e.target.value)}
                className="w-12 h-10 rounded-lg cursor-pointer border-0"
              />
              <input
                type="text"
                value={colors.text.disabled}
                onChange={(e) => handleTextColorChange('disabled', e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Status Colors */}
      <div>
        <h3 className="font-bold text-sm mb-3">ألوان الحالة</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-slate-600 mb-1 block">النجاح</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={colors.success}
                onChange={(e) => handleColorChange('success', e.target.value)}
                className="w-12 h-10 rounded-lg cursor-pointer border-0"
              />
              <input
                type="text"
                value={colors.success}
                onChange={(e) => handleColorChange('success', e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 mb-1 block">التحذير</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={colors.warning}
                onChange={(e) => handleColorChange('warning', e.target.value)}
                className="w-12 h-10 rounded-lg cursor-pointer border-0"
              />
              <input
                type="text"
                value={colors.warning}
                onChange={(e) => handleColorChange('warning', e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 mb-1 block">الخطأ</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={colors.error}
                onChange={(e) => handleColorChange('error', e.target.value)}
                className="w-12 h-10 rounded-lg cursor-pointer border-0"
              />
              <input
                type="text"
                value={colors.error}
                onChange={(e) => handleColorChange('error', e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm font-mono"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}