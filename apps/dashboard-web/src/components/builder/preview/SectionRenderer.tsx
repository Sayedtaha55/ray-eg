'use client';

import React from 'react';
import { UnifiedBuilderConfig } from '@/types/builder';
import HeaderFooterSection from '@/components/builder/sections/design/HeaderFooterSection';
import ColorsSectionEnhanced from '@/components/builder/sections/design/ColorsSectionEnhanced';
import TypographySection from '@/components/builder/sections/design/TypographySection';
import BannerPositionEditor from '@/components/builder/sections/design/BannerPositionEditor';
import BackgroundManager from '@/components/builder/sections/design/BackgroundManager';
import ProductCardSection from '@/components/builder/sections/commercial/ProductCardSection';
import ProductsSection from '@/components/builder/sections/commercial/ProductsSection';
import ProvidersSection from '@/components/builder/sections/reservations/ProvidersSection';
import ServicesSectionEnhanced from '@/components/builder/sections/reservations/ServicesSectionEnhanced';
import ServicesSection from '@/components/builder/sections/reservations/ServicesSection';

interface SectionRendererProps {
  sectionId: string;
  config: UnifiedBuilderConfig;
  onChange: (updates: any) => void;
  activityType: 'COMMERCIAL' | 'RESERVATIONS' | 'HYBRID';
}

export default function SectionRenderer({
  sectionId,
  config,
  onChange,
  activityType,
}: SectionRendererProps) {
  const handleChange = (updates: any) => {
    onChange(updates);
  };

  const renderSection = () => {
    switch (sectionId) {
      // Design Sections
      case 'themes':
        return (
          <div className="space-y-4">
            <h3 className="font-bold text-sm mb-3">السمات</h3>
            <p className="text-sm text-slate-500">اختر سمة جاهزة أو قم بتخصيص تصميمك</p>
            <div className="grid grid-cols-2 gap-2">
              {['عصري', 'كلاسيكي', 'بسيط', 'داكن'].map((theme) => (
                <button
                  key={theme}
                  className="p-4 rounded-xl border-2 border-slate-200 hover:border-brand-cyan transition-all text-sm font-bold"
                >
                  {theme}
                </button>
              ))}
            </div>
          </div>
        );

      case 'colors':
        return <ColorsSectionEnhanced config={config} onChange={handleChange} />;

      case 'typography':
        return <TypographySection typography={config.typography || {
          fontFamily: { heading: 'Inter', body: 'Inter', arabic: 'Cairo' },
          fontSize: { xs: '0.75rem', sm: '0.875rem', base: '1rem' },
          fontWeight: { light: 300, normal: 400, medium: 500, semibold: 600, bold: 700 }
        } as any} onChange={handleChange} />;

      case 'headerFooter':
        return <HeaderFooterSection config={config} onChange={handleChange} activityType={activityType} />;

      case 'background':
        return (
          <div className="p-6 text-center text-slate-400">
            <p>إدارة الخلفية - قيد التطوير</p>
          </div>
        );

      case 'banner':
        return (
          <div className="p-6 text-center text-slate-400">
            <p>إدارة البانر - قيد التطوير</p>
          </div>
        );

      // Commercial Sections
      case 'products':
        if (activityType === 'COMMERCIAL' || activityType === 'HYBRID') {
          return <ProductsSection config={config.commercial?.products} onChange={handleChange} />;
        }
        return <div className="text-center text-slate-500">غير متاح لهذا النوع</div>;

      case 'productCard':
        if (activityType === 'COMMERCIAL' || activityType === 'HYBRID') {
          return <ProductCardSection config={config} onChange={handleChange} />;
        }
        return <div className="text-center text-slate-500">غير متاح لهذا النوع</div>;

      // Reservations Sections
      case 'providers':
        if (activityType === 'RESERVATIONS' || activityType === 'HYBRID') {
          return <ProvidersSection config={config} onChange={handleChange} activityType="GENERAL" />;
        }
        return <div className="text-center text-slate-500">غير متاح لهذا النوع</div>;

      case 'services':
        if (activityType === 'RESERVATIONS' || activityType === 'HYBRID') {
          return <ServicesSection config={config.reservations?.services} onChange={handleChange} />;
        }
        return <div className="text-center text-slate-500">غير متاح لهذا النوع</div>;

      // Content Sections
      case 'features':
        return (
          <div className="space-y-4">
            <h3 className="font-bold text-sm mb-3">قسم المميزات</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">عدد الأعمدة</label>
                <select className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm">
                  <option>2</option>
                  <option>3</option>
                  <option>4</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-4">
            <h3 className="font-bold text-sm mb-3">قسم التواصل</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold">إظهار الخريطة</span>
                <button className="w-12 h-6 rounded-full bg-brand-cyan">
                  <div className="w-5 h-5 rounded-full bg-white translate-x-6" />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold">إظهار العنوان</span>
                <button className="w-12 h-6 rounded-full bg-brand-cyan">
                  <div className="w-5 h-5 rounded-full bg-white translate-x-6" />
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <p className="text-slate-500">قسم: {sectionId}</p>
            <p className="text-sm text-slate-400 mt-2">قيد التطوير...</p>
          </div>
        );
    }
  };

  return (
    <div className="p-4">
      {renderSection()}
    </div>
  );
}