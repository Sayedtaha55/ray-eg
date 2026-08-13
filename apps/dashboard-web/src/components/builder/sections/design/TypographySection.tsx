'use client';

import React from 'react';
import { TypographyConfig } from '@/types/builder';

interface TypographySectionProps {
  typography: TypographyConfig;
  onChange: (typography: TypographyConfig) => void;
}

export default function TypographySection({ typography, onChange }: TypographySectionProps) {
  const handleFontFamilyChange = (key: keyof TypographyConfig['fontFamily'], value: string) => {
    onChange({
      ...typography,
      fontFamily: {
        ...typography.fontFamily,
        [key]: value,
      },
    });
  };

  const handleFontSizeChange = (key: keyof TypographyConfig['fontSize'], value: string) => {
    onChange({
      ...typography,
      fontSize: {
        ...typography.fontSize,
        [key]: value,
      },
    });
  };

  const handleFontWeightChange = (key: keyof TypographyConfig['fontWeight'], value: number) => {
    onChange({
      ...typography,
      fontWeight: {
        ...typography.fontWeight,
        [key]: value,
      },
    });
  };

  const fontOptions = [
    { value: 'Inter', label: 'Inter' },
    { value: 'Cairo', label: 'Cairo' },
    { value: 'Tajawal', label: 'Tajawal' },
    { value: 'Almarai', label: 'Almarai' },
    { value: 'IBM Plex Sans Arabic', label: 'IBM Plex Sans Arabic' },
    { value: 'Noto Sans Arabic', label: 'Noto Sans Arabic' },
  ];

  const sizeOptions = [
    { value: '0.75rem', label: 'XS (12px)' },
    { value: '0.875rem', label: 'SM (14px)' },
    { value: '1rem', label: 'Base (16px)' },
    { value: '1.125rem', label: 'LG (18px)' },
    { value: '1.25rem', label: 'XL (20px)' },
    { value: '1.5rem', label: '2XL (24px)' },
    { value: '1.875rem', label: '3XL (30px)' },
    { value: '2.25rem', label: '4XL (36px)' },
  ];

  const weightOptions = [
    { value: 300, label: 'Light (300)' },
    { value: 400, label: 'Normal (400)' },
    { value: 500, label: 'Medium (500)' },
    { value: 600, label: 'Semibold (600)' },
    { value: 700, label: 'Bold (700)' },
    { value: 800, label: 'Extrabold (800)' },
  ];

  return (
    <div className="space-y-6">
      {/* Font Families */}
      <div>
        <h3 className="font-bold text-sm mb-3">خطوط النص</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-slate-600 mb-1 block">خط العناوين</label>
            <select
              value={typography.fontFamily.heading}
              onChange={(e) => handleFontFamilyChange('heading', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
            >
              {fontOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 mb-1 block">خط النص الأساسي</label>
            <select
              value={typography.fontFamily.body}
              onChange={(e) => handleFontFamilyChange('body', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
            >
              {fontOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 mb-1 block">خط العربي</label>
            <select
              value={typography.fontFamily.arabic}
              onChange={(e) => handleFontFamilyChange('arabic', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
            >
              {fontOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Font Sizes */}
      <div>
        <h3 className="font-bold text-sm mb-3">أحجام الخطوط</h3>
        <div className="space-y-3">
          {Object.entries(typography.fontSize).map(([key, value]) => (
            <div key={key}>
              <label className="text-xs font-bold text-slate-600 mb-1 block capitalize">
                {key}
              </label>
              <select
                value={value}
                onChange={(e) => handleFontSizeChange(key as keyof TypographyConfig['fontSize'], e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
              >
                {sizeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Font Weights */}
      <div>
        <h3 className="font-bold text-sm mb-3">أوزان الخطوط</h3>
        <div className="space-y-3">
          {Object.entries(typography.fontWeight).map(([key, value]) => (
            <div key={key}>
              <label className="text-xs font-bold text-slate-600 mb-1 block capitalize">
                {key}
              </label>
              <select
                value={value}
                onChange={(e) => handleFontWeightChange(key as keyof TypographyConfig['fontWeight'], parseInt(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
              >
                {weightOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div>
        <h3 className="font-bold text-sm mb-3">معاينة</h3>
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
          <div
            style={{
              fontFamily: typography.fontFamily.heading,
              fontSize: typography.fontSize['4xl'],
              fontWeight: typography.fontWeight.bold,
            }}
            className="text-slate-900"
          >
            عنوان رئيسي
          </div>
          <div
            style={{
              fontFamily: typography.fontFamily.heading,
              fontSize: typography.fontSize['2xl'],
              fontWeight: typography.fontWeight.semibold,
            }}
            className="text-slate-800"
          >
            عنوان فرعي
          </div>
          <div
            style={{
              fontFamily: typography.fontFamily.body,
              fontSize: typography.fontSize.base,
              fontWeight: typography.fontWeight.normal,
            }}
            className="text-slate-600"
          >
            هذا نص تجريبي لمعاينة الخطوط. يمكنك رؤية كيف سيظهر النص على موقعك الفعلي.
          </div>
          <div
            style={{
              fontFamily: typography.fontFamily.body,
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.normal,
            }}
            className="text-slate-500"
          >
            نص صغير
          </div>
        </div>
      </div>
    </div>
  );
}