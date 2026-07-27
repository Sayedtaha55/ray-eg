export type SectionType =
  | 'hero' | 'features' | 'products' | 'categories' | 'testimonials'
  | 'gallery' | 'faq' | 'cta' | 'contact' | 'about' | 'services'
  | 'projects' | 'booking' | 'providers' | 'menu' | 'map' | 'stats'
  | 'team' | 'newsletter' | 'social' | 'custom';

export type SectionLayout = 'grid' | 'list' | 'carousel' | 'masonry' | 'full-width' | 'split';

export type StylePreset =
  | 'modern' | 'luxury' | 'minimal' | 'glass' | 'dark'
  | 'elegant' | 'corporate' | 'playful' | 'bold';

export interface DesignTokensColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  headerBg: string;
  headerText: string;
  footerBg: string;
  footerText: string;
}

export interface DesignTokens {
  colors: DesignTokensColors;
  typography: {
    fontFamily: string;
    headingFamily: string;
    headingSize: 'sm' | 'base' | 'lg' | 'xl';
    textSize: 'xs' | 'sm' | 'base' | 'lg';
    fontWeight: 'normal' | 'medium' | 'bold' | 'black';
  };
  spacing: {
    sectionGap: 'compact' | 'normal' | 'loose';
    itemGap: 'tight' | 'normal' | 'wide';
    pagePadding: 'none' | 'sm' | 'md' | 'lg';
  };
  radius: {
    card: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
    button: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
    input: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  };
  shadow: {
    card: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    button: 'none' | 'sm' | 'md';
  };
  animation: {
    entrance: 'none' | 'fade' | 'slide-up' | 'slide-right' | 'scale';
    duration: 'fast' | 'normal' | 'slow';
  };
  buttonStyle: {
    shape: 'solid' | 'outline' | 'ghost' | 'gradient';
    size: 'sm' | 'md' | 'lg';
    fullWidth: boolean;
  };
  cardStyle: {
    layout: 'standard' | 'overlay' | 'minimal' | 'glass';
    imageAspect: 'square' | 'portrait' | 'landscape';
    showShadow: boolean;
    showBorder: boolean;
  };
}

export interface PageSection {
  id: string;
  type: SectionType;
  layout?: SectionLayout;
  title?: string;
  subtitle?: string;
  visible: boolean;
  content?: Record<string, any>;
  style?: {
    background?: string;
    padding?: 'compact' | 'normal' | 'loose';
    columns?: number;
    itemsPerRow?: number;
  };
}

export interface PageSchema {
  version: string;
  sections: PageSection[];
}

export interface BrandIdentity {
  brandName: string;
  tagline: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
  };
  typography: {
    fontFamily: string;
    headingFamily: string;
    fontWeight: string;
  };
  stylePreset: StylePreset;
  iconSet: string;
  cardStyle: 'standard' | 'overlay' | 'minimal' | 'glass';
  buttonShape: 'solid' | 'outline' | 'ghost' | 'gradient';
  bannerText: string;
  heroText: string;
  suggestedImages: string[];
}

export const DEFAULT_DESIGN_TOKENS: DesignTokens = {
  colors: {
    primary: '#00E5FF',
    secondary: '#BD00FF',
    accent: '#0F172A',
    background: '#FFFFFF',
    surface: '#F8FAFC',
    text: '#0F172A',
    textMuted: '#64748B',
    headerBg: '#FFFFFF',
    headerText: '#0F172A',
    footerBg: '#0F172A',
    footerText: '#CBD5E1',
  },
  typography: {
    fontFamily: 'Cairo',
    headingFamily: 'Cairo',
    headingSize: 'xl',
    textSize: 'sm',
    fontWeight: 'bold',
  },
  spacing: {
    sectionGap: 'normal',
    itemGap: 'normal',
    pagePadding: 'md',
  },
  radius: {
    card: '2xl',
    button: '2xl',
    input: 'xl',
  },
  shadow: {
    card: 'md',
    button: 'sm',
  },
  animation: {
    entrance: 'fade',
    duration: 'normal',
  },
  buttonStyle: {
    shape: 'solid',
    size: 'md',
    fullWidth: false,
  },
  cardStyle: {
    layout: 'standard',
    imageAspect: 'square',
    showShadow: true,
    showBorder: true,
  },
};

// Deep partial for preset overrides
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
