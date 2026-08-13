'use client';

import React from 'react';
import { UnifiedBuilderConfig } from '@/types/builder';
import ShopProfilePreview from './ShopProfilePreview';
import LandingPagePreview from './LandingPagePreview';
import ProductPagePreview from './ProductPagePreview';
import ClinicPublicPreview from './ClinicPublicPreview';

interface PreviewRendererProps {
  config: UnifiedBuilderConfig;
  previewPage: 'home' | 'products' | 'product' | 'gallery' | 'info' | 'custom' | 'landing' | 'clinic';
  previewMode: 'desktop' | 'tablet' | 'mobile';
  shop?: {
    name?: string;
    description?: string;
    logoUrl?: string;
    phone?: string;
    email?: string;
    city?: string;
    governorate?: string;
    followers?: number;
    address?: string;
  };
}

export default function PreviewRenderer({
  config,
  previewPage,
  previewMode,
  shop = {},
}: PreviewRendererProps) {
  // Use different preview components based on page type
  if (previewPage === 'clinic') {
    return (
      <ClinicPublicPreview
        config={config}
        previewMode={previewMode}
        shop={shop}
      />
    );
  }

  if (previewPage === 'landing') {
    return (
      <LandingPagePreview
        config={config}
        previewMode={previewMode}
        shop={shop}
      />
    );
  }

  if (previewPage === 'product') {
    return (
      <ProductPagePreview
        config={config}
        previewMode={previewMode}
        shop={shop}
      />
    );
  }

  // Default to ShopProfilePreview for home, products, gallery, info, custom
  return (
    <ShopProfilePreview
      config={config}
      previewMode={previewMode}
      shop={shop}
    />
  );
}