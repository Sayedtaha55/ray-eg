'use client';

import React from 'react';
import { updateUnifiedColors } from '@/lib/builder/colorSystem';

interface ColorsSectionEnhancedProps {
  config: any;
  onChange: (updates: any) => void;
}

const COLOR_PRESETS = [
  '#00E5FF', '#BD00FF', '#FF6B6B', '#10B981', '#F59E0B',
  '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316',
];

const BUTTON_SHAPES = [
  { id: 'sharp', name: 'حاد', value: 'rounded-none' },
  { id: 'circular', name: 'دائري', value: 'rounded-full' },
  { id: 'medium', name: 'متوسط', value: 'rounded-xl' },
  { id: 'large', name: 'كبير', value: 'rounded-2xl' },
];

export default function ColorsSectionEnhanced({
  config,
  onChange,
}: ColorsSectionEnhancedProps) {
  const handleChange = (key: string, value: any) => {
    // استخدام نظام توحيد الألوان لتحديث الألوان
    if (['primaryColor', 'secondaryColor', 'pageBackgroundColor'].includes(key)) {
      const colorKeyMap: Record<string, keyof any> = {
        primaryColor: 'primary',
        secondaryColor: 'secondary',
        pageBackgroundColor: 'background',
      };
      const updatedConfig = updateUnifiedColors(config, {
        [colorKeyMap[key]]: value
      });
      onChange(updatedConfig);
    } else {
      onChange({ [key]: value });
    }
  };

  return (
    <div className="space-y-6">
      {/* Primary Color */}
      <div>
        <h3 className="font-bold text-sm mb-3">اللون الأساسي</h3>
        <div className="flex gap-2 mb-3">
          {COLOR_PRESETS.map((color) => (
            <button
              key={color}
              onClick={() => handleChange('primaryColor', color)}
              className={`w-10 h-10 rounded-lg transition-all ${
                config.primaryColor === color
                  ? 'ring-2 ring-brand-cyan ring-offset-2'
                  : 'hover:scale-110'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <input
          type="color"
          value={config.primaryColor || '#00E5FF'}
          onChange={(e) => handleChange('primaryColor', e.target.value)}
          className="w-full h-10 rounded-lg cursor-pointer"
        />
      </div>

      {/* Secondary Color */}
      <div>
        <h3 className="font-bold text-sm mb-3">اللون الثانوي</h3>
        <div className="flex gap-2 mb-3">
          {COLOR_PRESETS.map((color) => (
            <button
              key={color}
              onClick={() => handleChange('secondaryColor', color)}
              className={`w-10 h-10 rounded-lg transition-all ${
                config.secondaryColor === color
                  ? 'ring-2 ring-brand-cyan ring-offset-2'
                  : 'hover:scale-110'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <input
          type="color"
          value={config.secondaryColor || '#BD00FF'}
          onChange={(e) => handleChange('secondaryColor', e.target.value)}
          className="w-full h-10 rounded-lg cursor-pointer"
        />
      </div>

      {/* Page Background */}
      <div>
        <h3 className="font-bold text-sm mb-3">لون الخلفية</h3>
        <div className="flex gap-2 mb-3">
          {COLOR_PRESETS.map((color) => (
            <button
              key={color}
              onClick={() => handleChange('pageBackgroundColor', color)}
              className={`w-10 h-10 rounded-lg transition-all ${
                config.pageBackgroundColor === color
                  ? 'ring-2 ring-brand-cyan ring-offset-2'
                  : 'hover:scale-110'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <input
          type="color"
          value={config.pageBackgroundColor || '#FFFFFF'}
          onChange={(e) => handleChange('pageBackgroundColor', e.target.value)}
          className="w-full h-10 rounded-lg cursor-pointer"
        />
      </div>

      {/* Button Customization */}
      <div>
        <h3 className="font-bold text-sm mb-3">تخصيص الأزرار</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-slate-600 mb-1 block">لون الخلفية</label>
            <input
              type="color"
              value={(config as any).buttonBackgroundColor || config.primaryColor}
              onChange={(e) => handleChange('buttonBackgroundColor', e.target.value)}
              className="w-full h-10 rounded-lg cursor-pointer"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600 mb-1 block">لون النص</label>
            <input
              type="color"
              value={(config as any).buttonTextColor || '#FFFFFF'}
              onChange={(e) => handleChange('buttonTextColor', e.target.value)}
              className="w-full h-10 rounded-lg cursor-pointer"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600 mb-1 block">لون التحويم</label>
            <input
              type="color"
              value={(config as any).buttonHoverColor || '#0F172A'}
              onChange={(e) => handleChange('buttonHoverColor', e.target.value)}
              className="w-full h-10 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Button Shape */}
      <div>
        <h3 className="font-bold text-sm mb-3">شكل الأزرار</h3>
        <div className="grid grid-cols-2 gap-2">
          {BUTTON_SHAPES.map((shape) => (
            <button
              key={shape.id}
              onClick={() => handleChange('buttonShape', shape.value)}
              className={`p-3 rounded-xl border-2 transition-all text-sm font-bold ${
                config.buttonShape === shape.value
                  ? 'border-brand-cyan bg-brand-cyan/10'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {shape.name}
            </button>
          ))}
        </div>
      </div>

      {/* Live Preview */}
      <div>
        <h3 className="font-bold text-sm mb-3">معاينة الأزرار</h3>
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
          <button
            className="w-full py-3 px-6 font-bold text-white"
            style={{
              backgroundColor: config.buttonBackgroundColor || config.primaryColor,
              color: config.buttonTextColor || '#FFFFFF',
              borderRadius: config.buttonShape || 'rounded-xl',
            }}
          >
            زر أساسي
          </button>
          <button
            className="w-full py-3 px-6 font-bold border-2"
            style={{
              borderColor: config.secondaryColor || '#BD00FF',
              color: config.secondaryColor || '#BD00FF',
              borderRadius: config.buttonShape || 'rounded-xl',
            }}
          >
            زر ثانوي
          </button>
        </div>
      </div>
    </div>
  );
}