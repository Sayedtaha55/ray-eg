'use client';

import React from 'react';

interface ProductCardSectionProps {
  config: any;
  onChange: (updates: any) => void;
}

export default function ProductCardSection({
  config,
  onChange,
}: ProductCardSectionProps) {
  const handleChange = (key: string, value: any) => {
    onChange({ [key]: value });
  };

  return (
    <div className="space-y-6">
      {/* Overlay Customization */}
      <div>
        <h3 className="font-bold text-sm mb-3">تخصيص التراكب</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-slate-600 mb-1 block">لون الخلفية</label>
            <input
              type="color"
              value={config.productCardOverlayBgColor || '#0F172A'}
              onChange={(e) => handleChange('productCardOverlayBgColor', e.target.value)}
              className="w-full h-10 rounded-lg cursor-pointer"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">
              الشفافية: {config.productCardOverlayOpacity || 70}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={config.productCardOverlayOpacity || 70}
              onChange={(e) => handleChange('productCardOverlayOpacity', parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Text Colors */}
      <div>
        <h3 className="font-bold text-sm mb-3">ألوان النص</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-slate-600 mb-1 block">لون العنوان</label>
            <input
              type="color"
              value={config.productCardTitleColor || '#FFFFFF'}
              onChange={(e) => handleChange('productCardTitleColor', e.target.value)}
              className="w-full h-10 rounded-lg cursor-pointer"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600 mb-1 block">لون السعر</label>
            <input
              type="color"
              value={config.productCardPriceColor || '#FFFFFF'}
              onChange={(e) => handleChange('productCardPriceColor', e.target.value)}
              className="w-full h-10 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Card Elements Visibility */}
      <div>
        <h3 className="font-bold text-sm mb-3">عناصر البطاقة</h3>
        <div className="space-y-3">
          {[
            { key: 'productCardShowPrice', label: 'إظهار السعر' },
            { key: 'productCardShowStock', label: 'إظهار المخزون' },
            { key: 'productCardAddToCart', label: 'إظهار زر الإضافة للسلة' },
            { key: 'productCardReserve', label: 'إظهار زر الحجز' },
            { key: 'productCardTabs', label: 'إظهار التبويبات' },
            { key: 'productCardShare', label: 'إظهار زر المشاركة' },
            { key: 'productCardQuickSpecs', label: 'إظهار المواصفات السريعة' },
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

      {/* Image Map Visibility */}
      <div>
        <h3 className="font-bold text-sm mb-3">خريطة الصورة</h3>
        <div className="space-y-3">
          {[
            { key: 'imageMapCardPrice', label: 'إظهار السعر' },
            { key: 'imageMapCardStock', label: 'إظهار المخزون' },
            { key: 'imageMapCardAddToCart', label: 'إظهار زر الإضافة' },
            { key: 'imageMapCardDescription', label: 'إظهار الوصف' },
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

      {/* Preview */}
      <div>
        <h3 className="font-bold text-sm mb-3">معاينة البطاقة</h3>
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
          <div
            className="relative rounded-xl overflow-hidden"
            style={{
              aspectRatio: '1/1',
              backgroundColor: '#e2e8f0',
            }}
          >
            <div
              className="absolute inset-0 flex flex-col justify-end p-4"
              style={{
                backgroundColor: config.productCardOverlayBgColor || '#0F172A',
                opacity: (config.productCardOverlayOpacity || 70) / 100,
              }}
            >
              {config.productCardShowPrice && (
                <div
                  className="font-bold text-lg mb-1"
                  style={{ color: config.productCardPriceColor || '#FFFFFF' }}
                >
                  199 ر.س
                </div>
              )}
              <div
                className="font-bold text-sm"
                style={{ color: config.productCardTitleColor || '#FFFFFF' }}
              >
                منتج تجريبي
              </div>
              {config.productCardAddToCart && (
                <button className="mt-2 py-2 px-4 rounded-lg bg-white text-black text-xs font-bold">
                  إضافة للسلة
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}