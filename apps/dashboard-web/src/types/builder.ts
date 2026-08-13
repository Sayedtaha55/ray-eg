// ============================================================================
// UNIFIED BUILDER SYSTEM - TYPE DEFINITIONS (MIGRATED FROM REACT LEGACY)
// ============================================================================

import React from 'react';

export type ActivityType = 'COMMERCIAL' | 'RESERVATIONS' | 'HYBRID';

export interface UnifiedBuilderConfig {
  activityType: ActivityType;
  
  // Store Identity (هوية المتجر)
  primaryColor: string;
  secondaryColor: string;
  layout: string;
  bannerUrl: string;
  bannerPosX?: number;
  bannerPosY?: number;
  headerType: string;
  headerBackgroundColor?: string;
  headerBackgroundImageUrl?: string;
  headerTextColor?: string;
  headerTransparent?: boolean;
  headerOverlayBanner?: boolean;
  headerOpacity?: number;
  pageBackgroundColor: string;
  backgroundColor?: string;
  backgroundImageUrl?: string;
  
  // Home Page (الصفحة الرئيسية)
  homeLayoutMode?: string;
  homeRightAdTitle?: string;
  homeLeftAdTitle?: string;
  homeIntroText?: string;
  homeStoryText?: string;
  bannerSize?: string;
  bannerTitle?: string;
  bannerSubtitle?: string;
  bannerTextPosition?: string;
  
  // Products (المنتجات)
  productDisplay?: 'cards' | 'list' | 'minimal';
  productsLayout?: 'vertical' | 'horizontal';
  imageAspectRatio?: 'square' | 'portrait' | 'landscape';
  rowsConfig?: Array<{
    id: string;
    imageShape: 'square' | 'portrait' | 'landscape';
    displayMode: 'cards' | 'list' | 'minimal';
    itemsPerRow: number;
    rowMode?: 'grid' | 'carousel';
    layoutDirection?: 'rtl' | 'ltr';
    showArrows?: boolean;
    productNames?: string[];
    scheduleStartAt?: string;
    scheduleEndAt?: string;
    sortMode?: 'default' | 'inStockFirst' | 'topSelling';
    hideOutOfStock?: boolean;
  }>;
  
  // Product Card (بطاقة المنتج)
  productCardOverlayBgColor?: string;
  productCardOverlayOpacity?: number;
  productCardTitleColor?: string;
  productCardPriceColor?: string;
  
  // Categories (الأقسام)
  categoryIconShape?: 'circular' | 'square' | 'large';
  categoryIconSize?: 'small' | 'medium' | 'large';
  showProductsInCategories?: boolean;
  categoryIconImage?: string;
  categoryImages?: Record<string, string>;
  
  // Typography (الخطوط)
  headingSize?: string;
  textSize?: string;
  fontWeight?: string;
  
  // Buttons (الأزرار)
  buttonShape?: string;
  buttonPadding?: string;
  buttonPreset?: 'primary' | 'ghost' | 'premium' | 'urgent';
  buttonHover?: string;
  buttonBackgroundColor?: string;
  buttonTextColor?: string;
  buttonHoverColor?: string;
  
  // Footer (الفوتر)
  footerBackgroundColor?: string;
  footerTextColor?: string;
  footerTransparent?: boolean;
  footerOpacity?: number;
  
  // Surface (سطح العرض)
  surface?: string;
  
  // Spacing (المسافات)
  pagePadding?: string;
  itemGap?: string;
  
  // Advanced (إعدادات إضافية)
  customCss?: string;
  elementsVisibility?: Record<string, boolean>;
  productEditorVisibility?: Record<string, boolean>;
  imageMapVisibility?: Record<string, boolean>;
  navIcons?: Record<string, string>;
  
  // Product Page (صفحة المنتج)
  productPageMode?: 'standard' | 'landing';
  productPageBackgroundColor?: string;
  productPageTextColor?: string;
  productPagePriceColor?: string;
  productPageButtonColor?: string;
  landingPage?: Record<string, any>;
  
  // Custom Pages (صفحات مخصصة)
  customPages?: Array<{
    id: string;
    title: string;
    slug?: string;
    content: string;
    isActive?: boolean;
    showStandalone?: boolean;
    showInHeader?: boolean;
    showInHome?: boolean;
    createdAt?: string;
    updatedAt?: string;
  }>;
  
  // Quick Theme (الثيم السريع)
  quickTheme?: string;
  selectedTheme?: string;
  
  // Landing Pages (صفحات الهبوط)
  homePageName?: string;
  allProductsPageName?: string;
  
  // Footer (الفوتر)
  footerCopyright?: string;
  footerInstagram?: string;
  footerTwitter?: string;
  footerFacebook?: string;
  footerWhatsApp?: string;
  footerEmail?: string;
  footerPhone?: string;
  footerAddress?: string;
  
  // Dark Mode (الوضع الليل)
  darkMode?: boolean;
  darkModeColors?: {
    background?: string;
    surface?: string;
    text?: {
      primary?: string;
      secondary?: string;
    };
  };
  
  // Reservations (الحجوزات)
  bookingProviders?: any;
  bookingServices?: any;
  bookingSlots?: any;
  clinicDoctorsList?: any[];
  clinicSpecialtiesList?: any[];
  clinicSlotsList?: Array<{ time: string; label: string; available: boolean }>;
  
  // Commercial (التجاري)
  commercial?: any;
  reservations?: any;
  
  // Theme (الثيم)
  theme?: ThemeConfig;
  colors?: ColorPalette;
  typography?: TypographyConfig;
  layoutConfig?: LayoutConfig;
}

export interface BuilderState {
  config: UnifiedBuilderConfig;
  previewMode: 'desktop' | 'tablet' | 'mobile';
  previewPage: 'home' | 'products' | 'product' | 'gallery' | 'info' | 'custom' | 'landing' | 'clinic';
  openSection: string | null;
  isDirty: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
}

export interface BuilderSectionConfig {
  id: string;
  title: string;
  icon: React.ReactNode;
  category: 'store-identity' | 'home-page' | 'products' | 'landing-pages' | 'styling' | 'advanced' | 'reservations' | 'preview-pages';
  activityTypes: ActivityType[];
  render: (ctx: BuilderRenderCtx) => React.ReactNode;
}

export interface BuilderRenderCtx {
  config: UnifiedBuilderConfig;
  setConfig: (updates: Partial<UnifiedBuilderConfig>) => void;
  state: BuilderState;
  setState: React.Dispatch<React.SetStateAction<BuilderState>>;
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
}

export type BuilderSectionId =
  | 'themes'
  | 'colors'
  | 'background'
  | 'banner'
  | 'header'
  | 'headerFooter'
  | 'productCard'
  | 'categories'
  | 'productEditor'
  | 'productPage'
  | 'imageShape'
  | 'layout'
  | 'typography'
  | 'buttons'
  | 'customCss'
  | 'shoppingMode'
  | 'footer'
  | 'homeExperience'
  | 'customPages'
  | 'bookingProviders'
  | 'bookingServices'
  | 'bookingSlots'
  | 'navIcons'
  | 'landingTheme'
  | 'landingHero'
  | 'landingFeatures'
  | 'landingSections'
  | 'landingFaq'
  | 'landingStyle'
  | 'landingUrl';

export interface ThemeConfig {
  id: string;
  name: string;
  variant: 'light' | 'dark' | 'auto';
  customSettings?: Record<string, any>;
}

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: {
    primary: string;
    secondary: string;
    disabled: string;
  };
  success: string;
  warning: string;
  error: string;
}

export interface TypographyConfig {
  fontFamily: {
    heading: string;
    body: string;
    arabic: string;
  };
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
  };
  fontWeight: {
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
    extrabold: number;
  };
}

export interface LayoutConfig {
  containerWidth: string;
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    full: string;
  };
  header: {
    height: string;
    position: 'fixed' | 'sticky' | 'static';
    transparent: boolean;
  };
  footer: {
    position: 'fixed' | 'sticky' | 'static';
    transparent: boolean;
  };
}

// ============================================================================
// PRODUCT CONFIGURATIONS
// ============================================================================

export interface ProductConfig {
  display: 'grid' | 'list' | 'minimal';
  gridColumns: number;
  showCategories: boolean;
  showFilters: boolean;
  showSort: boolean;
  cardStyle: 'modern' | 'classic' | 'minimal';
  imageAspectRatio: 'square' | 'portrait' | 'landscape';
  showQuickView: boolean;
  showWishlist: boolean;
}

export interface CategoryConfig {
  display: 'grid' | 'list' | 'icons';
  showProductCount: boolean;
  showImage: boolean;
  iconStyle: 'circular' | 'square' | 'rounded';
  maxColumns: number;
}

export interface ShoppingModeConfig {
  enabled: boolean;
  allowGuestCheckout: boolean;
  requireAccount: boolean;
  showCartSummary: boolean;
  showShippingCalculator: boolean;
  showTaxCalculator: boolean;
}

export interface ProductPageConfig {
  showRelatedProducts: boolean;
  showReviews: boolean;
  showSpecifications: boolean;
  showStockStatus: boolean;
  showVariantSelector: boolean;
  showQuantitySelector: boolean;
}

// ============================================================================
// RESERVATION CONFIGURATIONS
// ============================================================================

export interface ProviderConfig {
  display: 'grid' | 'list' | 'cards';
  showRating: boolean;
  showReviews: boolean;
  showSpecialties: boolean;
  showAvailability: boolean;
  showBookingButton: boolean;
}

export interface ServiceConfig {
  display: 'grid' | 'list' | 'detailed';
  showDuration: boolean;
  showPrice: boolean;
  showDescription: boolean;
  showBookingButton: boolean;
  groupByCategory: boolean;
}

export interface SlotConfig {
  display: 'list' | 'calendar' | 'timeline';
  showAvailability: boolean;
  showDuration: boolean;
  showPrice: boolean;
  allowMultiBooking: boolean;
  maxBookingsPerSlot: number;
}

export interface BookingSettings {
  requireDeposit: boolean;
  depositAmount: number;
  depositType: 'fixed' | 'percentage';
  advanceBookingHours: number;
  advanceBookingDays?: number;
  cancellationHours: number;
  allowRescheduling: boolean;
  allowCancellation: boolean;
  autoConfirm: boolean;
}

// ============================================================================
// PAGE & SECTION TYPES
// ============================================================================

export interface CustomPage {
  id: string;
  title: string;
  slug: string;
  sections: PageSection[];
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PageSection {
  id: string;
  type: SectionType;
  order: number;
  config: Record<string, any>;
  visible: boolean;
}

export type SectionType = 
  | 'features'
  | 'products'
  | 'services'
  | 'testimonials'
  | 'gallery'
  | 'contact'
  | 'faq'
  | 'cta'
  | 'custom';

export interface SectionRegistry {
  [key: string]: {
    component: React.ComponentType<any>;
    title: string;
    description: string;
    icon: string;
    category: 'design' | 'content' | 'commercial' | 'reservations' | 'advanced';
    config: Record<string, any>;
  };
}
