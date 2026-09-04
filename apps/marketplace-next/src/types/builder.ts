export type ViewportBreakpoint = 'desktop' | 'tablet' | 'mobile';

export type CartMode = 'standalone' | 'unified';

export interface CartItem {
  id: string;
  title: string;
  price: number;
  priceFormatted: string;
  image: string;
  category?: string;
  badge?: string;
  quantity: number;
  tenantId?: string;
  tenantName?: string;
}

export interface DropdownSubItem {
  id: string;
  title: string;
  description?: string;
  url?: string;
  pageId?: string;
  iconName?: string;
  badge?: string;
}

export interface ProductCategoryFilter {
  id: string;
  label: string;
  count?: number;
  iconName?: string;
}

export type ComponentCategory = 
  | 'layout'
  | 'typography'
  | 'media'
  | 'action'
  | 'section'
  | 'commerce'
  | 'forms'
  | 'form'
  | 'navigation'
  | 'interactive';

export type ComponentType =
  | 'product_filter_tabs'
  | 'website'
  | 'page'
  | 'header'
  | 'hero'
  | 'features'
  | 'bento'
  | 'bento-grid'
  | 'services'
  | 'products'
  | 'pricing'
  | 'testimonials'
  | 'gallery'
  | 'team'
  | 'stats'
  | 'faq'
  | 'cta'
  | 'contact'
  | 'footer'
  | 'navigation'
  | 'form'
  | 'container'
  | 'grid'
  | 'flex'
  | 'heading'
  | 'paragraph'
  | 'button'
  | 'image'
  | 'badge'
  | 'card'
  | 'divider'
  | 'icon'
  | 'input'
  | 'custom-code';

export type BusinessActivity =
  | 'automotive' // سيارات ومعارض
  | 'real_estate' // عقارات ومقاولات
  | 'ecommerce' // متاجر إلكترونية
  | 'tech_saas' // تقنية وبرمجيات
  | 'clinic_health' // عيادات ومراكز طبية
  | 'restaurant' // مطاعم ومقاهي
  | 'agency' // وكالات واستشارات
  | 'education' // تعليم وتدريب
  | 'furniture' // أثاث وتصميم
  | 'car_rental' // تأجير سيارات
  | 'flowers' // زهور وهدايا
  | 'accounting' // محاسبة ومالية
  | 'gym_fitness' // رياضة وجيم
  | 'salon_beauty' // صالونات وتجميل
  | 'gold_jewelry' // ذهب ومجوهرات
  | 'fashion_boutique' // أزياء وبوتيك
  | 'grocery_supermarket' // سوبرماركت وتموين
  | 'home_services' // صيانة منزلية
  | 'travel_tourism' // سياحة وسفر
  | 'law_firm' // محاماة وقانون
  | 'general'; // عام

export interface ResponsiveValue<T> {
  desktop?: T;
  tablet?: T;
  mobile?: T;
}

export interface StyleProperties {
  // Layout
  display?: 'block' | 'flex' | 'grid' | 'inline-block' | 'none';
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
  flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  flex?: string;
  gridColumns?: string;
  gap?: string;
  
  // Dimensions
  width?: string;
  minWidth?: string;
  maxWidth?: string;
  height?: string;
  minHeight?: string;
  maxHeight?: string;
  
  // Spacing
  padding?: string;
  paddingTop?: string;
  paddingRight?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  margin?: string;
  marginTop?: string;
  marginRight?: string;
  marginBottom?: string;
  marginLeft?: string;

  // Typography
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: '300' | '400' | '500' | '600' | '700' | '800' | '900';
  fontStyle?: 'normal' | 'italic' | 'oblique';
  lineHeight?: string;
  letterSpacing?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  textColor?: string;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  whiteSpace?: string;

  // Media
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';

  // Background & Colors
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundSize?: 'cover' | 'contain' | 'auto';
  backgroundPosition?: 'center' | 'top' | 'bottom' | 'left' | 'right';
  backgroundGradient?: string;

  // Borders & Radius
  borderWidth?: string;
  borderTopWidth?: string;
  borderBottomWidth?: string;
  borderLeftWidth?: string;
  borderRightWidth?: string;
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none';
  borderColor?: string;
  borderRadius?: string;
  borderTopLeftRadius?: string;
  borderTopRightRadius?: string;
  borderBottomLeftRadius?: string;
  borderBottomRightRadius?: string;

  // Effects & Shadows
  boxShadow?: string;
  opacity?: number;
  backdropBlur?: string;
  transform?: string;
  transition?: string;
  zIndex?: number;
  overflow?: 'visible' | 'hidden' | 'scroll' | 'auto';
  position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
}

export interface AnimationConfig {
  type: 'none' | 'fade-in' | 'slide-up' | 'slide-down' | 'zoom-in' | 'bounce' | 'pulse';
  duration: number; // in seconds
  delay: number; // in seconds
  easing: string;
  hoverEffect?: 'none' | 'lift' | 'glow' | 'scale' | 'tilt';
}

export interface InteractionConfig {
  onClickAction?: 'none' | 'navigate' | 'scroll-to' | 'open-modal' | 'toggle-element' | 'custom-script';
  targetUrl?: string;
  targetElementId?: string;
  openInNewTab?: boolean;
  customJsSnippet?: string;
}

export interface DataBinding {
  field: string;
  sourceKey: string; // e.g. 'tenant.products[0].name' or 'tenant.profile.phone'
  fallbackValue?: string;
}

export interface CustomCodeScope {
  tsx?: string;
  css?: string;
  js?: string;
  tsxSnippet?: string;
  cssSnippet?: string;
  jsSnippet?: string;
  propsSchema?: string;
}

export interface ComponentNode {
  id: string;
  name: string;
  type: ComponentType;
  category: ComponentCategory;
  parentId: string | null;
  childrenIds: string[];
  
  // Content and props
  props: Record<string, any>;
  
  // Scoped & Responsive Styles
  styles: {
    desktop: StyleProperties;
    tablet?: StyleProperties;
    mobile?: StyleProperties;
  };
  
  // Animation & Interaction
  animation?: AnimationConfig;
  interaction?: InteractionConfig;
  
  // Dynamic Data Bindings
  dataBindings?: Record<string, DataBinding>;
  
  // Component Custom Code Workspace
  customCode?: CustomCodeScope;
  
  // Metadata & State
  isLocked?: boolean;
  isHidden?: boolean;
  isGlobal?: boolean; // If true, synched across all pages (e.g. Header, Footer)
  globalComponentKey?: string;
  activityTags?: BusinessActivity[];
  notes?: string;
}

export type PagePlacementMode =
  | 'header_direct'       // رابط مباشر في شريط الهيدر
  | 'header_dropdown'     // داخل قائمة منسدلة لقسم في الهيدر
  | 'standalone'          // صفحة مستقلة فقط (لا تظهر في الهيدر)
  | 'header_and_footer';  // في الهيدر والفوتر معاً

export interface AddPageOptions {
  name: string;
  slug: string;
  placement?: PagePlacementMode;
  headerTitle?: string;
  parentNavId?: string;
  dropdownDescription?: string;
  dropdownBadge?: string;
  includeHeaderFooter?: boolean;
  pageTemplate?: 'blank' | 'hero_services' | 'catalog_grid' | 'contact_form' | 'landing_page';
}

export interface PageMetadata {
  title: string;
  description: string;
  slug: string;
  canonicalUrl?: string;
  robots?: 'index, follow' | 'noindex, follow' | 'index, nofollow' | 'noindex, nofollow';
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  structuredDataJson?: string;
  isHomePage?: boolean;
  placement?: PagePlacementMode;
  headerTitle?: string;
  parentNavId?: string;
}

export interface Page {
  id: string;
  name: string;
  slug: string;
  rootNodeId: string;
  metadata: PageMetadata;
  customHeadCode?: string;
  customBodyCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DesignTokens {
  colors: {
    primary: string;
    primaryHover: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    border: string;
    success: string;
    warning: string;
    error: string;
  };
  typography: {
    fontHeading: string;
    fontBody: string;
    scaleRatio: number; // e.g. 1.25
    baseFontSize: string; // e.g. '16px'
  };
  radius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    glow: string;
  };
  spacingUnit: number; // 4px baseline
}

export interface Website {
  id: string;
  tenantId: string;
  name: string;
  domain: string;
  subdomain: string;
  activity: BusinessActivity;
  language: 'ar' | 'en' | 'both';
  defaultDirection: 'rtl' | 'ltr';
  pages: Page[];
  components: Record<string, ComponentNode>;
  theme: DesignTokens;
  globalHeaderId?: string;
  globalFooterId?: string;
  publishedVersionId?: string;
  currentDraftVersion: number;
}

export interface Tenant {
  id: string;
  name: string;
  ownerEmail: string;
  businessActivity: BusinessActivity;
  plan: 'starter' | 'pro' | 'enterprise';
  createdAt: string;
  customDomain?: string;
  businessInfo: {
    brandName: string;
    phone: string;
    email: string;
    address: string;
    whatsappNumber: string;
    currency: string;
    logoUrl: string;
  };
  dataSources: {
    productsCount: number;
    servicesCount: number;
    testimonialsCount: number;
  };
}

export interface VersionHistoryItem {
  id: string;
  versionNumber: number;
  label: string;
  description: string;
  timestamp: string;
  author: string;
  websiteSnapshot: Website;
  isPublished?: boolean;
}

export interface HistoryAction {
  id: string;
  description: string;
  timestamp: string;
  undo: () => void;
  redo: () => void;
}

export interface PublishingPipelineStatus {
  status: 'idle' | 'validating' | 'building_nextjs' | 'generating_metadata' | 'purging_cache' | 'published' | 'failed';
  currentStep: number;
  totalSteps: number;
  stepMessage: string;
  liveUrl?: string;
  publishedAt?: string;
  errors?: string[];
  buildStats?: {
    pagesCount: number;
    totalSizeKb: number;
    staticRoutes: number;
    ssrRoutes: number;
    firstLoadJsKb: number;
    coreWebVitalsEstimatedScore: number;
  };
}
