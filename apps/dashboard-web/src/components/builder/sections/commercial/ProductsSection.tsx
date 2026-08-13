'use client';

import React from 'react';
import { ProductConfig } from '@/types/builder';

interface ProductsSectionProps {
  config: ProductConfig;
  onChange: (config: ProductConfig) => void;
}

export default function ProductsSection({ config, onChange }: ProductsSectionProps) {
  const handleChange = (key: keyof ProductConfig, value: any) => {
    onChange({
      ...config,
      [key]: value,
    });
  };

  return (
    <div className="space-y-6">
      {/* Display Mode */}
      <div>
        <h3 className="font-bold text-sm mb-3">طريقة العرض</h3>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: 'grid', label: 'شبكة', icon: '⊞' },
            { value: 'list', label: 'قائمة', icon: '☰' },
            { value: 'minimal', label: 'بسيط', icon: '◻' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => handleChange('display', option.value)}
              className={`p-3 rounded-xl border-2 transition-all ${
                config.display === option.value
                  ? 'border-brand-cyan bg-brand-cyan/10'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="text-2xl mb-1">{option.icon}</div>
              <div className="text-xs font-bold">{option.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Grid Columns */}
      <div>
        <h3 className="font-bold text-sm mb-3">عدد الأعمدة</h3>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="2"
            max="6"
            value={config.gridColumns}
            onChange={(e) => handleChange('gridColumns', parseInt(e.target.value))}
            className="flex-1"
          />
          <span className="text-sm font-bold w-8 text-center">{config.gridColumns}</span>
        </div>
      </div>

      {/* Card Style */}
      <div>
        <h3 className="font-bold text-sm mb-3">نمط البطاقة</h3>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: 'modern', label: 'عصري' },
            { value: 'classic', label: 'كلاسيكي' },
            { value: 'minimal', label: 'بسيط' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => handleChange('cardStyle', option.value)}
              className={`p-3 rounded-xl border-2 transition-all text-sm font-bold ${
                config.cardStyle === option.value
                  ? 'border-brand-cyan bg-brand-cyan/10'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Image Aspect Ratio */}
      <div>
        <h3 className="font-bold text-sm mb-3">نسبة أبعاد الصورة</h3>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: 'square', label: 'مربع (1:1)' },
            { value: 'portrait', label: 'طولي (3:4)' },
            { value: 'landscape', label: 'عريض (16:9)' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => handleChange('imageAspectRatio', option.value)}
              className={`p-3 rounded-xl border-2 transition-all text-sm font-bold ${
                config.imageAspectRatio === option.value
                  ? 'border-brand-cyan bg-brand-cyan/10'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Toggle Options */}
      <div>
        <h3 className="font-bold text-sm mb-3">خيارات العرض</h3>
        <div className="space-y-3">
          {[
            { key: 'showCategories', label: 'إظهار الفئات' },
            { key: 'showFilters', label: 'إظهار الفلاتر' },
            { key: 'showSort', label: 'إظهار الترتيب' },
            { key: 'showQuickView', label: 'إظهار المعاينة السريعة' },
            { key: 'showWishlist', label: 'إظهار المفضلة' },
          ].map((option) => (
            <div key={option.key} className="flex items-center justify-between">
              <span className="text-sm font-bold">{option.label}</span>
              <button
                onClick={() => handleChange(option.key as keyof ProductConfig, !config[option.key as keyof ProductConfig])}
                className={`w-12 h-6 rounded-full transition-all ${
                  config[option.key as keyof ProductConfig]
                    ? 'bg-brand-cyan'
                    : 'bg-slate-200'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-all ${
                    config[option.key as keyof ProductConfig] ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div>
        <h3 className="font-bold text-sm mb-3">معاينة</h3>
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
          <div
            className="grid gap-3"
            style={{
              gridTemplateColumns: `repeat(${Math.min(config.gridColumns, 4)}, 1fr)`,
            }}
          >
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-lg p-3 border border-slate-200"
              >
                <div
                  className="bg-slate-200 rounded mb-2"
                  style={{
                    aspectRatio:
                      config.imageAspectRatio === 'square'
                        ? '1/1'
                        : config.imageAspectRatio === 'portrait'
                        ? '3/4'
                        : '16/9',
                  }}
                />
                <div className="h-3 bg-slate-200 rounded mb-1 w-3/4" />
                <div className="h-2 bg-slate-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}