'use client';

import React from 'react';
import { ServiceConfig } from '@/types/builder';

interface ServicesSectionProps {
  config: ServiceConfig;
  onChange: (config: ServiceConfig) => void;
}

export default function ServicesSection({ config, onChange }: ServicesSectionProps) {
  const handleChange = (key: keyof ServiceConfig, value: any) => {
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
            { value: 'detailed', label: 'مفصل', icon: '📋' },
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

      {/* Toggle Options */}
      <div>
        <h3 className="font-bold text-sm mb-3">معلومات الخدمة</h3>
        <div className="space-y-3">
          {[
            { key: 'showDuration', label: 'إظهار المدة' },
            { key: 'showPrice', label: 'إظهار السعر' },
            { key: 'showDescription', label: 'إظهار الوصف' },
            { key: 'showBookingButton', label: 'إظهار زر الحجز' },
          ].map((option) => (
            <div key={option.key} className="flex items-center justify-between">
              <span className="text-sm font-bold">{option.label}</span>
              <button
                onClick={() => handleChange(option.key as keyof ServiceConfig, !config[option.key as keyof ServiceConfig])}
                className={`w-12 h-6 rounded-full transition-all ${
                  config[option.key as keyof ServiceConfig]
                    ? 'bg-brand-cyan'
                    : 'bg-slate-200'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-all ${
                    config[option.key as keyof ServiceConfig] ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Group by Category */}
      <div>
        <h3 className="font-bold text-sm mb-3">التنظيم</h3>
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold">تجميع حسب الفئة</span>
          <button
            onClick={() => handleChange('groupByCategory', !config.groupByCategory)}
            className={`w-12 h-6 rounded-full transition-all ${
              config.groupByCategory ? 'bg-brand-cyan' : 'bg-slate-200'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-all ${
                config.groupByCategory ? 'translate-x-6' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Preview */}
      <div>
        <h3 className="font-bold text-sm mb-3">معاينة</h3>
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg p-4 border border-slate-200">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="h-4 bg-slate-200 rounded mb-1 w-3/4" />
                    {config.showDuration && (
                      <div className="h-2 bg-slate-100 rounded w-1/2" />
                    )}
                  </div>
                  {config.showPrice && (
                    <div className="h-4 bg-brand-cyan/20 rounded w-12" />
                  )}
                </div>
                {config.showDescription && (
                  <div className="h-2 bg-slate-100 rounded w-full mb-2" />
                )}
                {config.showBookingButton && (
                  <div className="h-8 bg-brand-cyan rounded w-full" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}