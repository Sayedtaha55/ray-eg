import { Layout, Palette, Sliders } from 'lucide-react';
import React from 'react';

import {
  BackgroundSection,
  BannerSection,
  ButtonsSection,
  ColorsSection,
  CustomCssSection,
  HeaderFooterSection,
  HeaderTypeSection,
  LayoutSection,
  ProductPageSection,
  ProductsSection,
  TypographySection,
  VisibilitySection,
} from './sections';

export type BuilderSectionId =
  | 'colors'
  | 'background'
  | 'banner'
  | 'header'
  | 'headerFooter'
  | 'products'
  | 'productPage'
  | 'layout'
  | 'typography'
  | 'buttons'
  | 'visibility'
  | 'customCss';

export type BuilderRenderCtx = {
  config: any;
  setConfig: React.Dispatch<React.SetStateAction<any>>;
  logoDataUrl: string;
  setLogoDataUrl: React.Dispatch<React.SetStateAction<string>>;
  logoFile: File | null;
  setLogoFile: React.Dispatch<React.SetStateAction<File | null>>;
  bannerFile: File | null;
  setBannerFile: React.Dispatch<React.SetStateAction<File | null>>;
  bannerPreview: string;
  setBannerPreview: React.Dispatch<React.SetStateAction<string>>;
  backgroundFile: File | null;
  setBackgroundFile: React.Dispatch<React.SetStateAction<File | null>>;
  backgroundPreview: string;
  setBackgroundPreview: React.Dispatch<React.SetStateAction<string>>;
  headerBackgroundFile: File | null;
  setHeaderBackgroundFile: React.Dispatch<React.SetStateAction<File | null>>;
  headerBackgroundPreview: string;
  setHeaderBackgroundPreview: React.Dispatch<React.SetStateAction<string>>;
};

export type BuilderSectionConfig = {
  id: BuilderSectionId;
  title: string;
  icon: React.ReactNode;
  render: (ctx: BuilderRenderCtx) => React.ReactNode;
};

export const BUILDER_SECTIONS: BuilderSectionConfig[] = [
  {
    id: 'colors',
    title: 'الألوان',
    icon: React.createElement(Palette as any, { size: 16, className: 'text-[#00E5FF]' }),
    render: ({ config, setConfig }) => React.createElement(ColorsSection as any, { config, setConfig }),
  },
  {
    id: 'background',
    title: 'الخلفية',
    icon: React.createElement(Palette as any, { size: 16, className: 'text-slate-900' }),
    render: ({ config, setConfig, backgroundFile, setBackgroundFile, backgroundPreview, setBackgroundPreview }) =>
      React.createElement(BackgroundSection as any, {
        config,
        setConfig,
        backgroundFile,
        setBackgroundFile,
        backgroundPreview,
        setBackgroundPreview,
      }),
  },
  {
    id: 'banner',
    title: 'صورة البانر',
    icon: React.createElement(Layout as any, { size: 16, className: 'text-slate-900' }),
    render: ({ config, setConfig, bannerFile, setBannerFile, bannerPreview, setBannerPreview }) =>
      React.createElement(BannerSection as any, {
        config,
        setConfig,
        bannerFile,
        setBannerFile,
        bannerPreview,
        setBannerPreview,
      }),
  },
  {
    id: 'header',
    title: 'اللوجو',
    icon: React.createElement(Layout as any, { size: 16, className: 'text-[#BD00FF]' }),
    render: ({ config, setConfig, logoDataUrl, setLogoDataUrl, logoFile, setLogoFile }) =>
      React.createElement(HeaderTypeSection as any, { config, setConfig, logoDataUrl, setLogoDataUrl, logoFile, setLogoFile }),
  },
  {
    id: 'headerFooter',
    title: 'الهيدر والفوتر',
    icon: React.createElement(Layout as any, { size: 16, className: 'text-slate-900' }),
    render: ({
      config,
      setConfig,
      headerBackgroundFile,
      setHeaderBackgroundFile,
      headerBackgroundPreview,
      setHeaderBackgroundPreview,
    }) =>
      React.createElement(HeaderFooterSection as any, {
        config,
        setConfig,
        headerBackgroundFile,
        setHeaderBackgroundFile,
        headerBackgroundPreview,
        setHeaderBackgroundPreview,
      }),
  },
  {
    id: 'products',
    title: 'عرض المعروضات',
    icon: React.createElement(Layout as any, { size: 16, className: 'text-[#00E5FF]' }),
    render: ({ config, setConfig }) => React.createElement(ProductsSection as any, { config, setConfig }),
  },
  {
    id: 'productPage',
    title: 'صفحة المنتج',
    icon: React.createElement(Layout as any, { size: 16, className: 'text-slate-900' }),
    render: ({ config, setConfig }) => React.createElement(ProductPageSection as any, { config, setConfig }),
  },
  {
    id: 'layout',
    title: 'النمط',
    icon: React.createElement(Layout as any, { size: 16, className: 'text-[#BD00FF]' }),
    render: ({ config, setConfig }) => React.createElement(LayoutSection as any, { config, setConfig }),
  },
  {
    id: 'typography',
    title: 'الخطوط',
    icon: React.createElement(Layout as any, { size: 16, className: 'text-[#00E5FF]' }),
    render: ({ config, setConfig }) => React.createElement(TypographySection as any, { config, setConfig }),
  },
  {
    id: 'buttons',
    title: 'الأزرار',
    icon: React.createElement(Layout as any, { size: 16, className: 'text-[#BD00FF]' }),
    render: ({ config, setConfig }) => React.createElement(ButtonsSection as any, { config, setConfig }),
  },
  {
    id: 'visibility',
    title: 'إظهار / إخفاء',
    icon: React.createElement(Sliders as any, { size: 16, className: 'text-slate-900' }),
    render: ({ config, setConfig }) => React.createElement(VisibilitySection as any, { config, setConfig }),
  },
  {
    id: 'customCss',
    title: 'CSS مخصص',
    icon: React.createElement(Sliders as any, { size: 16, className: 'text-[#BD00FF]' }),
    render: ({ config, setConfig }) => React.createElement(CustomCssSection as any, { config, setConfig }),
  },
];
