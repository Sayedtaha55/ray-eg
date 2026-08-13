'use client';

import React from 'react';
import { UnifiedBuilderConfig } from '@/types/builder';
import PreviewRenderer from './PreviewRenderer';

interface LivePreviewProps {
  config: UnifiedBuilderConfig;
  previewMode: 'desktop' | 'tablet' | 'mobile';
  previewPage?: 'home' | 'products' | 'product' | 'gallery' | 'info' | 'custom' | 'landing' | 'clinic';
}

export default function LivePreview({ config, previewMode, previewPage = 'home' }: LivePreviewProps) {
  return (
    <PreviewRenderer
      config={config}
      previewMode={previewMode}
      previewPage={previewPage}
      shop={{
        name: config.homePageName || 'المتجر',
        description: 'أفضل المنتجات بجودة عالية',
        followers: 1234,
      }}
    />
  );
}