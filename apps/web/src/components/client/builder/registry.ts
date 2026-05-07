'use client';

import { Layout, Palette, Sliders, ShoppingBag } from 'lucide-react';
import React from 'react';
import { useT } from '@/i18n/useT';

import {
  BackgroundSection, BannerSection, ButtonsSection, CategorySection,
  ColorsSection, CustomCssSection, HeaderFooterSection, HeaderTypeSection,
  ProductCardSection, ProductEditorSection, LayoutSection, ProductPageSection,
  ProductsSection, TypographySection, VisibilitySection, ImageMapVisibilitySection,
  ImageShapeSection, ShoppingModeSection, FooterSection,
} from './sections';

export type BuilderSectionId =
  | 'colors' | 'background' | 'banner' | 'header' | 'headerFooter'
  | 'productCard' | 'categories' | 'productEditor' | 'productPage'
  | 'imageShape' | 'layout' | 'typography' | 'buttons' | 'customCss'
  | 'shoppingMode' | 'footer';

export type BuilderRenderCtx = {
  config: any;
  setConfig: React.Dispatch<React.SetStateAction<any>>;
  shop?: any;
  logoDataUrl: string;
  setLogoDataUrl: React.Dispatch<React.SetStateAction<string>>;
  logoFile: File | null;
  setLogoFile: React.Dispatch<React.SetStateAction<File | null>>;
  logoSaving: boolean;
  onSaveLogo: () => void;
  bannerFile: File | null;
  setBannerFile: React.Dispatch<React.SetStateAction<File | null>>;
  bannerPreview: string;
  setBannerPreview: React.Dispatch<React.SetStateAction<string>>;
  backgroundFile: File | null;
  setBackgroundFile: React.Dispatch<React.SetStateAction<File | null>>;
  backgroundPreview: string;
  setBackgroundPreview: React.Dispatch<React.SetStateAction<string>>;
};

export type BuilderSectionConfig = {
  id: BuilderSectionId;
  title: string;
  icon: React.ReactNode;
  render: (ctx: BuilderRenderCtx) => React.ReactNode;
};

// Hook to build sections with current locale
export function useBuilderSections() {
  const t = useT();

  const BUILDER_SECTIONS: BuilderSectionConfig[] = [
    { id: 'colors', title: t('business.builder.sections.colors', 'الألوان'), icon: React.createElement(Palette as any, { size: 16, className: 'text-[#00E5FF]' }), render: ({ config, setConfig }) => React.createElement(ColorsSection as any, { config, setConfig }) },
    { id: 'background', title: t('business.builder.sections.background', 'الخلفية'), icon: React.createElement(Palette as any, { size: 16, className: 'text-slate-900' }), render: ({ config, setConfig, backgroundFile, setBackgroundFile, backgroundPreview, setBackgroundPreview }) => React.createElement(BackgroundSection as any, { config, setConfig, backgroundFile, setBackgroundFile, backgroundPreview, setBackgroundPreview }) },
    { id: 'banner', title: t('business.builder.sections.banner', 'البانر'), icon: React.createElement(Layout as any, { size: 16, className: 'text-slate-900' }), render: ({ config, setConfig, bannerFile, setBannerFile, bannerPreview, setBannerPreview }) => React.createElement(BannerSection as any, { config, setConfig, bannerFile, setBannerFile, bannerPreview, setBannerPreview }) },
    { id: 'header', title: t('business.builder.sections.logo', 'الشعار'), icon: React.createElement(Layout as any, { size: 16, className: 'text-[#BD00FF]' }), render: ({ config, setConfig, logoDataUrl, setLogoDataUrl, logoFile, setLogoFile, logoSaving, onSaveLogo, shop }) => React.createElement(HeaderTypeSection as any, { config, setConfig, logoDataUrl, setLogoDataUrl, logoFile, setLogoFile, logoSaving, onSaveLogo, shop }) },
    { id: 'headerFooter', title: t('business.builder.sections.headerFooter', 'هيدر/فوتر'), icon: React.createElement(Layout as any, { size: 16, className: 'text-slate-900' }), render: ({ config, setConfig }) => React.createElement(HeaderFooterSection as any, { config, setConfig }) },
    { id: 'productCard', title: t('business.builder.sections.productCard', 'بطاقة المنتج'), icon: React.createElement(Palette as any, { size: 16, className: 'text-slate-900' }), render: ({ config, setConfig, shop }) => React.createElement(ProductCardSection as any, { config, setConfig, shop }) },
    { id: 'categories', title: t('business.builder.sections.categories', 'الفئات'), icon: React.createElement(ShoppingBag as any, { size: 16, className: 'text-slate-900' }), render: ({ config, setConfig, shop }) => React.createElement(CategorySection as any, { config, setConfig, shopId: shop?.id }) },
    { id: 'productEditor', title: t('business.builder.sections.productEditor', 'محرر المنتج'), icon: React.createElement(ShoppingBag as any, { size: 16, className: 'text-slate-900' }), render: ({ config, setConfig }) => React.createElement(ProductEditorSection as any, { config, setConfig }) },
    { id: 'productPage', title: t('business.builder.sections.productPage', 'صفحة المنتج'), icon: React.createElement(Layout as any, { size: 16, className: 'text-slate-900' }), render: ({ config, setConfig }) => React.createElement(ProductPageSection as any, { config, setConfig }) },
    { id: 'imageShape', title: t('business.builder.sections.imageShape', 'شكل الصورة'), icon: React.createElement(Layout as any, { size: 16, className: 'text-[#00E5FF]' }), render: ({ config, setConfig }) => React.createElement(ImageShapeSection as any, { config, setConfig }) },
    { id: 'layout', title: t('business.builder.sections.layout', 'التخطيط'), icon: React.createElement(Layout as any, { size: 16, className: 'text-[#BD00FF]' }), render: ({ config, setConfig }) => React.createElement(LayoutSection as any, { config, setConfig }) },
    { id: 'typography', title: t('business.builder.sections.typography', 'الخطوط'), icon: React.createElement(Layout as any, { size: 16, className: 'text-[#00E5FF]' }), render: ({ config, setConfig }) => React.createElement(TypographySection as any, { config, setConfig }) },
    { id: 'buttons', title: t('business.builder.sections.buttons', 'الأزرار'), icon: React.createElement(Layout as any, { size: 16, className: 'text-[#BD00FF]' }), render: ({ config, setConfig }) => React.createElement(ButtonsSection as any, { config, setConfig }) },
    { id: 'customCss', title: t('business.builder.sections.customCss', 'CSS مخصص'), icon: React.createElement(Sliders as any, { size: 16, className: 'text-[#BD00FF]' }), render: ({ config, setConfig }) => React.createElement(CustomCssSection as any, { config, setConfig }) },
    { id: 'shoppingMode', title: t('business.builder.sections.shoppingMode', 'وضع التسوق'), icon: React.createElement(ShoppingBag as any, { size: 16, className: 'text-[#00E5FF]' }), render: ({ config, setConfig }) => React.createElement(ShoppingModeSection as any, { config, setConfig }) },
    { id: 'footer', title: t('business.builder.sections.footer', 'الفوتر'), icon: React.createElement(Layout as any, { size: 16, className: 'text-slate-900' }), render: ({ config, setConfig }) => React.createElement(FooterSection as any, { config, setConfig }) },
  ];

  return BUILDER_SECTIONS;
}

// Static list for ID checks (no hook needed)
export const BUILDER_SECTION_IDS: BuilderSectionId[] = [
  'colors', 'background', 'banner', 'header', 'headerFooter',
  'productCard', 'categories', 'productEditor', 'productPage',
  'imageShape', 'layout', 'typography', 'buttons', 'customCss',
  'shoppingMode', 'footer',
];
