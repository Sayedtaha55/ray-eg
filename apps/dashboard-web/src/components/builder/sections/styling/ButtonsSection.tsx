'use client';

import React from 'react';
import { UnifiedBuilderConfig } from '@/types/builder';
import { getUnifiedColors, updateUnifiedColors } from '@/lib/builder/colorSystem';

interface ButtonsSectionProps {
  config: UnifiedBuilderConfig;
  onChange: (config: UnifiedBuilderConfig) => void;
}

const SHAPES = ['rounded-none', 'rounded-xl', 'rounded-2xl', 'rounded-3xl', 'rounded-full'];
const PADDINGS = ['px-3 py-2', 'px-4 py-2.5', 'px-6 py-3', 'px-8 py-4'];
const PRESETS = ['primary', 'ghost', 'premium', 'urgent'] as const;

export default function ButtonsSection({ config, onChange }: ButtonsSectionProps) {
  const colors = getUnifiedColors(config);
  
  const setVal = (key: string, value: any) => {
    onChange({ ...config, [key]: value });
  };
  
  const setButtonColor = (colorKey: string, value: string) => {
    // تحديث ألوان الأزرار مع الحفاظ على التوافق
    const updated = { ...config } as UnifiedBuilderConfig;
    
    if (colorKey === 'backgroundColor') {
      updated.buttonBackgroundColor = value;
      // أيضاً تحديث اللون الأساسي إذا كان المستخدم يريد ربط الأزرار بالثيم
      if (!config.buttonBackgroundColor || config.buttonBackgroundColor === colors.primary) {
        const colorUpdated = updateUnifiedColors(config, { primary: value });
        Object.assign(updated, colorUpdated);
      }
    } else if (colorKey === 'textColor') {
      updated.buttonTextColor = value;
    } else if (colorKey === 'hoverColor') {
      updated.buttonHoverColor = value;
      // أيضاً تحديث اللون الثانوي
      if (!config.buttonHoverColor || config.buttonHoverColor === colors.secondary) {
        const colorUpdated = updateUnifiedColors(config, { secondary: value });
        Object.assign(updated, colorUpdated);
      }
    }
    
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block text-right">شكل الزر</label>
        <div className="grid grid-cols-3 gap-2">
          {SHAPES.map((shape) => (
            <button
              key={shape}
              onClick={() => setVal('buttonShape', shape)}
              className={`p-3 rounded-xl border text-right transition-all hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:ring-offset-2 active:scale-[0.99] ${config.buttonShape === shape ? 'border-[#00E5FF] bg-cyan-50' : 'border-slate-100 bg-white hover:bg-slate-50'}`}
            >
              <div className={`h-6 bg-slate-900 ${shape}`}></div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block text-right">حجم الزر</label>
        <div className="grid grid-cols-2 gap-2">
          {PADDINGS.map((padding) => (
            <button
              key={padding}
              onClick={() => setVal('buttonPadding', padding)}
              className={`p-3 rounded-xl border text-right transition-all hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:ring-offset-2 active:scale-[0.99] ${config.buttonPadding === padding ? 'border-[#00E5FF] bg-cyan-50' : 'border-slate-100 bg-white hover:bg-slate-50'}`}
            >
              <p className="font-black text-xs">{padding}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block text-right">نمط الزر</label>
        <div className="grid grid-cols-2 gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setVal('buttonPreset', preset)}
              className={`p-3 rounded-xl border text-right transition-all ${String(config.buttonPreset || 'primary') === preset ? 'border-[#00E5FF] bg-cyan-50' : 'border-slate-100 bg-white hover:bg-slate-50'}`}
            >
              <p className="font-black text-xs">
                {preset === 'primary' ? 'Primary' : preset === 'ghost' ? 'Ghost' : preset === 'premium' ? 'Premium' : 'Urgent'}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block text-right">لون التحويم</label>
        <input
          type="text"
          value={config.buttonHover || ''}
          onChange={(e) => setVal('buttonHover', e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-mono"
          placeholder="bg-slate-900"
        />
      </div>

      {/* Button Colors with Theme Integration */}
      <div className="pt-4 border-t border-slate-100">
        <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 block text-right">
          ألوان الأزرار (مرتبطة بالثيم)
        </label>
        
        <div className="space-y-3">
          <div>
            <label className="text-[10px] font-bold text-slate-500 mb-1 block text-right">لون الخلفية</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={(config as any).buttonBackgroundColor || colors.primary}
                onChange={(e) => setButtonColor('backgroundColor', e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer border-0"
              />
              <input
                type="text"
                value={(config as any).buttonBackgroundColor || colors.primary}
                onChange={(e) => setButtonColor('backgroundColor', e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm font-mono"
              />
            </div>
          </div>
          
          <div>
            <label className="text-[10px] font-bold text-slate-500 mb-1 block text-right">لون النص</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={(config as any).buttonTextColor || '#FFFFFF'}
                onChange={(e) => setButtonColor('textColor', e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer border-0"
              />
              <input
                type="text"
                value={(config as any).buttonTextColor || '#FFFFFF'}
                onChange={(e) => setButtonColor('textColor', e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm font-mono"
              />
            </div>
          </div>
          
          <div>
            <label className="text-[10px] font-bold text-slate-500 mb-1 block text-right">لون التحويم</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={(config as any).buttonHoverColor || colors.secondary}
                onChange={(e) => setButtonColor('hoverColor', e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer border-0"
              />
              <input
                type="text"
                value={(config as any).buttonHoverColor || colors.secondary}
                onChange={(e) => setButtonColor('hoverColor', e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Live Preview */}
      <div className="pt-4 border-t border-slate-100">
        <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 block text-right">
          معاينة الأزرار
        </label>
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
          <button
            className="w-full py-3 px-6 font-bold text-white"
            style={{
              backgroundColor: (config as any).buttonBackgroundColor || colors.primary,
              color: (config as any).buttonTextColor || '#FFFFFF',
              borderRadius: config.buttonShape || 'rounded-2xl',
              padding: config.buttonPadding || 'px-6 py-3',
            }}
          >
            زر أساسي
          </button>
          <button
            className="w-full py-3 px-6 font-bold border-2"
            style={{
              borderColor: (config as any).buttonHoverColor || colors.secondary,
              color: (config as any).buttonHoverColor || colors.secondary,
              borderRadius: config.buttonShape || 'rounded-2xl',
              padding: config.buttonPadding || 'px-6 py-3',
            }}
          >
            زر ثانوي
          </button>
        </div>
      </div>
    </div>
  );
}