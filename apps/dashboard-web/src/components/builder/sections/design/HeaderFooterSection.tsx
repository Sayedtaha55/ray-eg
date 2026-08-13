'use client';

import React from 'react';
import { ActivityType } from '@/types/builder';

interface HeaderFooterSectionProps {
  config: any;
  onChange: (updates: any) => void;
  activityType: ActivityType;
}

const HEADER_PRESETS = [
  { id: 'centered', name: 'مركزي', icon: '🎯' },
  { id: 'split_branding', name: 'علامة منقسمة', icon: '🔀' },
  { id: 'minimal_left', name: 'بسيط يسار', icon: '⬅️' },
  { id: 'search_bar', name: 'شريط بحث', icon: '🔍' },
  { id: 'stacked_bold', name: 'مكدس عريض', icon: '📚' },
];

export default function HeaderFooterSection({
  config,
  onChange,
  activityType,
}: HeaderFooterSectionProps) {
  const handleChange = (key: string, value: any) => {
    onChange({ [key]: value });
  };

  return (
    <div className="space-y-6">
      {/* Header Style */}
      <div>
        <h3 className="font-bold text-sm mb-3">نمط الترويسة</h3>
        <div className="grid grid-cols-2 gap-2">
          {HEADER_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleChange('headerType', preset.id)}
              className={`p-3 rounded-xl border-2 transition-all text-sm font-bold ${
                config.headerType === preset.id
                  ? 'border-brand-cyan bg-brand-cyan/10'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="text-2xl mb-1">{preset.icon}</div>
              <div>{preset.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Header Visibility */}
      <div>
        <h3 className="font-bold text-sm mb-3">عناصر الترويسة</h3>
        <div className="space-y-3">
          {[
            { key: 'headerShowNav', label: 'إظهار التنقل' },
            { key: 'headerShowChat', label: 'إظهار زر المحادثة' },
            { key: 'headerShowShare', label: 'إظهار زر المشاركة' },
            { key: 'headerShowFollowers', label: 'إظهار عدد المتابعين' },
            { key: 'headerShowFollowButton', label: 'إظهار زر المتابعة' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <span className="text-sm font-bold">{item.label}</span>
              <button
                onClick={() => handleChange(item.key, !config[item.key])}
                className={`w-12 h-6 rounded-full transition-all ${
                  config[item.key]
                    ? 'bg-brand-cyan'
                    : 'bg-slate-200'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-all ${
                    config[item.key] ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Header Colors */}
      <div>
        <h3 className="font-bold text-sm mb-3">ألوان الترويسة</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-slate-600 mb-1 block">لون الخلفية</label>
            <input
              type="color"
              value={config.headerBackgroundColor || '#FFFFFF'}
              onChange={(e) => handleChange('headerBackgroundColor', e.target.value)}
              className="w-full h-10 rounded-lg cursor-pointer"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600 mb-1 block">لون النص</label>
            <input
              type="color"
              value={config.headerTextColor || '#0F172A'}
              onChange={(e) => handleChange('headerTextColor', e.target.value)}
              className="w-full h-10 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Header Transparency */}
      <div>
        <h3 className="font-bold text-sm mb-3">شفافية الترويسة</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold">شفاف</span>
            <button
              onClick={() => handleChange('headerTransparent', !config.headerTransparent)}
              className={`w-12 h-6 rounded-full transition-all ${
                config.headerTransparent
                  ? 'bg-brand-cyan'
                  : 'bg-slate-200'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-all ${
                  config.headerTransparent ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">الشفافية: {config.headerOpacity || 60}%</label>
            <input
              type="range"
              min="0"
              max="100"
              value={config.headerOpacity || 60}
              onChange={(e) => handleChange('headerOpacity', parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Header Overlay Banner */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold">تراكب الشعار</span>
        <button
          onClick={() => handleChange('headerOverlayBanner', !config.headerOverlayBanner)}
          className={`w-12 h-6 rounded-full transition-all ${
            config.headerOverlayBanner
              ? 'bg-brand-cyan'
              : 'bg-slate-200'
          }`}
        >
          <div
            className={`w-5 h-5 rounded-full bg-white transition-all ${
              config.headerOverlayBanner ? 'translate-x-6' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      {/* Footer Settings */}
      <div>
        <h3 className="font-bold text-sm mb-3">التذييل</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-slate-600 mb-1 block">لون الخلفية</label>
            <input
              type="color"
              value={config.footerBackgroundColor || '#FFFFFF'}
              onChange={(e) => handleChange('footerBackgroundColor', e.target.value)}
              className="w-full h-10 rounded-lg cursor-pointer"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600 mb-1 block">لون النص</label>
            <input
              type="color"
              value={config.footerTextColor || '#0F172A'}
              onChange={(e) => handleChange('footerTextColor', e.target.value)}
              className="w-full h-10 rounded-lg cursor-pointer"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold">شفاف</span>
            <button
              onClick={() => handleChange('footerTransparent', !config.footerTransparent)}
              className={`w-12 h-6 rounded-full transition-all ${
                config.footerTransparent
                  ? 'bg-brand-cyan'
                  : 'bg-slate-200'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-all ${
                  config.footerTransparent ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}