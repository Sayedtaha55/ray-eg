'use client';

import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { UnifiedBuilderConfig } from '@/types/builder';
import { getUnifiedColors } from '@/lib/builder/colorSystem';

interface DarkModeSectionProps {
  config: UnifiedBuilderConfig;
  onChange: (config: Partial<UnifiedBuilderConfig>) => void;
}

export default function DarkModeSection({ config, onChange }: DarkModeSectionProps) {
  const colors = getUnifiedColors(config);
  
  const setVal = (key: string, value: any) => {
    onChange({ [key]: value });
  };

  const updateDarkColor = (path: string, value: string) => {
    const darkColors = config.darkModeColors || {};
    const newColors = { ...darkColors };
    
    if (path === 'background') {
      newColors.background = value;
    } else if (path === 'surface') {
      newColors.surface = value;
    } else if (path === 'textPrimary') {
      newColors.text = { ...newColors.text, primary: value };
    } else if (path === 'textSecondary') {
      newColors.text = { ...newColors.text, secondary: value };
    }
    
    onChange({ darkModeColors: newColors });
  };

  const applyDarkModePreset = (preset: 'slate' | 'black' | 'blue' | 'green') => {
    const presets = {
      slate: {
        background: '#0F172A',
        surface: '#1E293B',
        text: { primary: '#F8FAFC', secondary: '#94A3B8' }
      },
      black: {
        background: '#000000',
        surface: '#1A1A1A',
        text: { primary: '#FFFFFF', secondary: '#A3A3A3' }
      },
      blue: {
        background: '#0C1929',
        surface: '#1E3A5F',
        text: { primary: '#E0F2FE', secondary: '#7DD3FC' }
      },
      green: {
        background: '#052E16',
        surface: '#14532D',
        text: { primary: '#DCFCE7', secondary: '#86EFAC' }
      }
    };
    
    onChange({ darkModeColors: presets[preset] });
  };

  const darkColors = config.darkModeColors || {};

  return (
    <div className="space-y-5 text-right" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-gradient-to-l from-slate-800 to-slate-900 rounded-2xl border border-slate-700">
        <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center text-white shadow-lg">
          <Moon size={20} />
        </div>
        <div className="flex-1">
          <h3 className="font-black text-sm text-white">الوضع الليل</h3>
          <p className="text-[11px] font-bold text-slate-400 mt-0.5">تخصيص ألوان الوضع الليل</p>
        </div>
      </div>

      {/* Enable Dark Mode Toggle */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
            {config.darkMode ? <Moon size={18} className="text-white" /> : <Sun size={18} className="text-yellow-500" />}
          </div>
          <div>
            <p className="font-black text-sm text-slate-900">تفعيل الوضع الليل</p>
            <p className="text-[10px] font-bold text-slate-500">السماح للمستخدمين بالتبديل للوضع الليل</p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={config.darkMode || false}
            onChange={(e) => setVal('darkMode', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cyan-400/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-900" />
        </label>
      </div>

      {config.darkMode && (
        <>
          <div className="h-px bg-slate-100 my-4" />

          {/* Dark Mode Colors */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-2">
              ألوان الوضع الليل
            </label>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 block text-right">خلفية الوضع الليل</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={darkColors.background || '#0F172A'}
                    onChange={(e) => updateDarkColor('background', e.target.value)}
                    className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={darkColors.background || '#0F172A'}
                    onChange={(e) => updateDarkColor('background', e.target.value)}
                    className="flex-1 p-2 rounded-xl border border-slate-200 text-sm font-bold bg-slate-50"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 block text-right">سطح الوضع الليل</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={darkColors.surface || '#1E293B'}
                    onChange={(e) => updateDarkColor('surface', e.target.value)}
                    className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={darkColors.surface || '#1E293B'}
                    onChange={(e) => updateDarkColor('surface', e.target.value)}
                    className="flex-1 p-2 rounded-xl border border-slate-200 text-sm font-bold bg-slate-50"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 block text-right">نص أساسي</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={darkColors.text?.primary || '#F8FAFC'}
                    onChange={(e) => updateDarkColor('textPrimary', e.target.value)}
                    className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={darkColors.text?.primary || '#F8FAFC'}
                    onChange={(e) => updateDarkColor('textPrimary', e.target.value)}
                    className="flex-1 p-2 rounded-xl border border-slate-200 text-sm font-bold bg-slate-50"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 block text-right">نص ثانوي</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={darkColors.text?.secondary || '#94A3B8'}
                    onChange={(e) => updateDarkColor('textSecondary', e.target.value)}
                    className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={darkColors.text?.secondary || '#94A3B8'}
                    onChange={(e) => updateDarkColor('textSecondary', e.target.value)}
                    className="flex-1 p-2 rounded-xl border border-slate-200 text-sm font-bold bg-slate-50"
                  />
                </div>
              </div>
            </div>

            {/* Preset Dark Themes */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 block text-right">ثيمات الوضع الليل الجاهزة</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => applyDarkModePreset('slate')}
                  className="p-3 rounded-xl border border-slate-200 text-right hover:bg-slate-50 transition-all"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 rounded-full bg-slate-900" />
                    <span className="font-black text-xs">رمادي داكن</span>
                  </div>
                  <div className="flex gap-1">
                    <div className="w-6 h-6 rounded bg-slate-800" />
                    <div className="w-6 h-6 rounded bg-slate-700" />
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => applyDarkModePreset('black')}
                  className="p-3 rounded-xl border border-slate-200 text-right hover:bg-slate-50 transition-all"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 rounded-full bg-black" />
                    <span className="font-black text-xs">أسود نقي</span>
                  </div>
                  <div className="flex gap-1">
                    <div className="w-6 h-6 rounded bg-neutral-900" />
                    <div className="w-6 h-6 rounded bg-neutral-800" />
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => applyDarkModePreset('blue')}
                  className="p-3 rounded-xl border border-slate-200 text-right hover:bg-slate-50 transition-all"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 rounded-full bg-blue-900" />
                    <span className="font-black text-xs">أزرق ليلي</span>
                  </div>
                  <div className="flex gap-1">
                    <div className="w-6 h-6 rounded bg-blue-950" />
                    <div className="w-6 h-6 rounded bg-blue-900" />
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => applyDarkModePreset('green')}
                  className="p-3 rounded-xl border border-slate-200 text-right hover:bg-slate-50 transition-all"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 rounded-full bg-green-900" />
                    <span className="font-black text-xs">أخضر ليلي</span>
                  </div>
                  <div className="flex gap-1">
                    <div className="w-6 h-6 rounded bg-green-950" />
                    <div className="w-6 h-6 rounded bg-green-900" />
                  </div>
                </button>
              </div>
            </div>

            {/* Sync with Light Mode */}
            <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <label className="text-[10px] font-bold text-slate-400 block text-right mb-2">
                مزامنة تلقائية مع الوضع الفاتح
              </label>
              <p className="text-[10px] font-bold text-slate-500 mb-2">
                سيتم توليد ألوان الوضع الليل تلقائياً بناءً على ألوان الثيم الحالي
              </p>
              <button
                type="button"
                onClick={() => {
                  // توليد ألوان داكنة من الألوان الفاتحة
                  const darkBackground = adjustColorBrightness(colors.background, -80);
                  const darkSurface = adjustColorBrightness(colors.surface, -60);
                  const darkTextPrimary = adjustColorBrightness(colors.text.primary, 180);
                  const darkTextSecondary = adjustColorBrightness(colors.text.secondary, 120);
                  
                  onChange({
                    darkModeColors: {
                      background: darkBackground,
                      surface: darkSurface,
                      text: {
                        primary: darkTextPrimary,
                        secondary: darkTextSecondary
                      }
                    }
                  });
                }}
                className="w-full py-2 px-4 rounded-lg bg-slate-800 text-white font-bold text-xs hover:bg-slate-700 transition-all"
              >
                توليد ألوان تلقائية
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// دالة مساعدة لضبط سطوع اللون
function adjustColorBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  
  const newR = Math.max(0, Math.min(255, R));
  const newG = Math.max(0, Math.min(255, G));
  const newB = Math.max(0, Math.min(255, B));
  
  return '#' + (0x1000000 + newR * 0x10000 + newG * 0x100 + newB).toString(16).slice(1);
}
