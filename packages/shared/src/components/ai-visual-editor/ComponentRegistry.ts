import type { ComponentRegistryEntry, AllowedComponent, AiSuggestion } from './types';

// ─── Component Registry ───────────────────────────────────────
// Whitelist of all components the AI Visual Editor can interact with.
// Any component NOT in this list is invisible to the editor.

export const COMPONENT_REGISTRY: ComponentRegistryEntry[] = [
  {
    name: 'Hero',
    label: 'Hero Section',
    labelAr: 'الواجهة الرئيسية',
    category: 'layout',
    icon: 'Layout',
    allowedTokens: ['colors', 'typography', 'spacing', 'radius', 'shadow', 'animation', 'buttonStyle'],
    allowedChanges: ['variant', 'primaryColor', 'secondaryColor', 'backgroundColor', 'fontFamily', 'fontSize', 'fontWeight', 'buttonStyle', 'borderRadius', 'spacing', 'shadow', 'animation', 'layout', 'gradient'],
  },
  {
    name: 'ProductsGrid',
    label: 'Products Grid',
    labelAr: 'شبكة المنتجات',
    category: 'commerce',
    icon: 'ShoppingBag',
    allowedTokens: ['colors', 'radius', 'shadow', 'cardStyle', 'spacing'],
    allowedChanges: ['layout', 'columns', 'primaryColor', 'borderRadius', 'shadow', 'spacing', 'imageAspect', 'showBorder', 'showShadow'],
  },
  {
    name: 'Testimonials',
    label: 'Testimonials',
    labelAr: 'آراء العملاء',
    category: 'content',
    icon: 'MessageCircle',
    allowedTokens: ['colors', 'typography', 'radius', 'shadow', 'animation'],
    allowedChanges: ['variant', 'layout', 'primaryColor', 'backgroundColor', 'borderRadius', 'shadow', 'animation', 'columns'],
  },
  {
    name: 'Cards',
    label: 'Cards',
    labelAr: 'البطاقات',
    category: 'content',
    icon: 'CreditCard',
    allowedTokens: ['colors', 'radius', 'shadow', 'cardStyle'],
    allowedChanges: ['variant', 'primaryColor', 'backgroundColor', 'borderRadius', 'shadow', 'imageAspect', 'showBorder', 'showShadow', 'columns'],
  },
  {
    name: 'Navbar',
    label: 'Navigation Bar',
    labelAr: 'شريط التنقل',
    category: 'layout',
    icon: 'Menu',
    allowedTokens: ['colors', 'typography', 'radius'],
    allowedChanges: ['variant', 'primaryColor', 'backgroundColor', 'textColor', 'fontFamily', 'fontSize', 'fontWeight', 'borderRadius', 'layout'],
  },
  {
    name: 'Footer',
    label: 'Footer',
    labelAr: 'التذييل',
    category: 'layout',
    icon: 'Layout',
    allowedTokens: ['colors', 'typography', 'spacing'],
    allowedChanges: ['variant', 'primaryColor', 'backgroundColor', 'textColor', 'fontFamily', 'fontSize', 'spacing', 'columns'],
  },
  {
    name: 'Gallery',
    label: 'Gallery',
    labelAr: 'معرض الصور',
    category: 'content',
    icon: 'Image',
    allowedTokens: ['colors', 'radius', 'shadow', 'spacing', 'animation'],
    allowedChanges: ['layout', 'columns', 'borderRadius', 'shadow', 'spacing', 'animation', 'imageAspect'],
  },
  {
    name: 'FAQ',
    label: 'FAQ Section',
    labelAr: 'الأسئلة الشائعة',
    category: 'content',
    icon: 'HelpCircle',
    allowedTokens: ['colors', 'typography', 'radius', 'shadow'],
    allowedChanges: ['variant', 'primaryColor', 'backgroundColor', 'borderRadius', 'shadow', 'layout'],
  },
  {
    name: 'Pricing',
    label: 'Pricing Table',
    labelAr: 'جدول الأسعار',
    category: 'commerce',
    icon: 'DollarSign',
    allowedTokens: ['colors', 'typography', 'radius', 'shadow', 'buttonStyle'],
    allowedChanges: ['variant', 'primaryColor', 'secondaryColor', 'borderRadius', 'shadow', 'buttonStyle', 'columns', 'layout'],
  },
  {
    name: 'Contact',
    label: 'Contact Section',
    labelAr: 'تواصل معنا',
    category: 'utility',
    icon: 'Mail',
    allowedTokens: ['colors', 'typography', 'radius', 'spacing'],
    allowedChanges: ['variant', 'primaryColor', 'backgroundColor', 'borderRadius', 'spacing', 'layout'],
  },
  {
    name: 'Booking',
    label: 'Booking Section',
    labelAr: 'الحجز',
    category: 'booking',
    icon: 'Calendar',
    allowedTokens: ['colors', 'typography', 'radius', 'shadow', 'buttonStyle', 'spacing'],
    allowedChanges: ['variant', 'primaryColor', 'secondaryColor', 'borderRadius', 'shadow', 'buttonStyle', 'spacing', 'layout'],
  },
  {
    name: 'Banner',
    label: 'Banner',
    labelAr: 'البانر',
    category: 'layout',
    icon: 'Image',
    allowedTokens: ['colors', 'typography', 'radius', 'shadow', 'animation'],
    allowedChanges: ['variant', 'primaryColor', 'secondaryColor', 'backgroundColor', 'fontFamily', 'fontSize', 'fontWeight', 'borderRadius', 'shadow', 'animation', 'gradient'],
  },
  {
    name: 'Features',
    label: 'Features Section',
    labelAr: 'المميزات',
    category: 'content',
    icon: 'Zap',
    allowedTokens: ['colors', 'typography', 'radius', 'shadow', 'spacing', 'animation'],
    allowedChanges: ['variant', 'primaryColor', 'backgroundColor', 'borderRadius', 'shadow', 'spacing', 'animation', 'columns', 'layout'],
  },
  {
    name: 'Stats',
    label: 'Stats Section',
    labelAr: 'الإحصائيات',
    category: 'content',
    icon: 'BarChart',
    allowedTokens: ['colors', 'typography', 'radius', 'shadow'],
    allowedChanges: ['variant', 'primaryColor', 'backgroundColor', 'borderRadius', 'shadow', 'columns', 'layout'],
  },
  {
    name: 'Team',
    label: 'Team Section',
    labelAr: 'الفريق',
    category: 'content',
    icon: 'Users',
    allowedTokens: ['colors', 'typography', 'radius', 'shadow', 'cardStyle'],
    allowedChanges: ['variant', 'primaryColor', 'borderRadius', 'shadow', 'imageAspect', 'columns', 'layout', 'showBorder', 'showShadow'],
  },
  {
    name: 'Services',
    label: 'Services Section',
    labelAr: 'الخدمات',
    category: 'content',
    icon: 'Sparkles',
    allowedTokens: ['colors', 'typography', 'radius', 'shadow', 'spacing', 'animation'],
    allowedChanges: ['variant', 'primaryColor', 'backgroundColor', 'borderRadius', 'shadow', 'spacing', 'animation', 'columns', 'layout'],
  },
  {
    name: 'Projects',
    label: 'Projects Section',
    labelAr: 'المشاريع',
    category: 'content',
    icon: 'Briefcase',
    allowedTokens: ['colors', 'radius', 'shadow', 'spacing', 'cardStyle'],
    allowedChanges: ['variant', 'primaryColor', 'borderRadius', 'shadow', 'spacing', 'imageAspect', 'columns', 'layout'],
  },
  {
    name: 'Newsletter',
    label: 'Newsletter',
    labelAr: 'النشرة البريدية',
    category: 'utility',
    icon: 'Mail',
    allowedTokens: ['colors', 'typography', 'radius', 'shadow', 'buttonStyle'],
    allowedChanges: ['variant', 'primaryColor', 'backgroundColor', 'borderRadius', 'shadow', 'buttonStyle', 'layout'],
  },
  {
    name: 'Social',
    label: 'Social Links',
    labelAr: 'روابط التواصل',
    category: 'utility',
    icon: 'Share',
    allowedTokens: ['colors', 'radius'],
    allowedChanges: ['variant', 'primaryColor', 'backgroundColor', 'borderRadius', 'layout'],
  },
  {
    name: 'CTA',
    label: 'Call to Action',
    labelAr: 'دعوة للعمل',
    category: 'layout',
    icon: 'MousePointerClick',
    allowedTokens: ['colors', 'typography', 'radius', 'shadow', 'buttonStyle', 'animation'],
    allowedChanges: ['variant', 'primaryColor', 'secondaryColor', 'backgroundColor', 'buttonStyle', 'borderRadius', 'shadow', 'animation', 'gradient'],
  },
  {
    name: 'About',
    label: 'About Section',
    labelAr: 'من نحن',
    category: 'content',
    icon: 'Info',
    allowedTokens: ['colors', 'typography', 'spacing', 'radius'],
    allowedChanges: ['variant', 'primaryColor', 'backgroundColor', 'fontFamily', 'fontSize', 'spacing', 'layout'],
  },
  {
    name: 'Menu',
    label: 'Menu Section',
    labelAr: 'القائمة',
    category: 'commerce',
    icon: 'Utensils',
    allowedTokens: ['colors', 'typography', 'radius', 'spacing'],
    allowedChanges: ['variant', 'primaryColor', 'backgroundColor', 'fontFamily', 'fontSize', 'borderRadius', 'spacing', 'layout', 'columns'],
  },
  {
    name: 'Map',
    label: 'Map Section',
    labelAr: 'الخريطة',
    category: 'utility',
    icon: 'MapPin',
    allowedTokens: ['colors', 'radius', 'shadow'],
    allowedChanges: ['variant', 'primaryColor', 'borderRadius', 'shadow', 'layout'],
  },
];

const REGISTRY_MAP = new Map<string, ComponentRegistryEntry>(
  COMPONENT_REGISTRY.map((c) => [c.name, c])
);

export function getComponentFromRegistry(name: string): ComponentRegistryEntry | undefined {
  return REGISTRY_MAP.get(name);
}

export function isComponentAllowed(name: string): boolean {
  return REGISTRY_MAP.has(name);
}

export function getAllowedComponents(): AllowedComponent[] {
  return COMPONENT_REGISTRY.map((c) => c.name);
}

// ─── AI Style Suggestions ─────────────────────────────────────

export const AI_SUGGESTIONS: AiSuggestion[] = [
  {
    id: 'modern',
    label: 'Modern',
    labelAr: 'عصري',
    description: 'Clean lines, vibrant accents, rounded corners',
    descriptionAr: 'خطوط نظيفة، ألوان حيوية، زوايا دائرية',
    preview: { primaryColor: '#00E5FF', secondaryColor: '#BD00FF', backgroundColor: '#FFFFFF', borderRadius: '24px', shadow: '0 4px 6px rgba(0,0,0,0.1)', animation: 'fade' },
  },
  {
    id: 'luxury',
    label: 'Luxury',
    labelAr: 'فاخر',
    description: 'Gold accents, elegant serif fonts, soft shadows',
    descriptionAr: 'لمسات ذهبية، خطوط أنيقة، ظلال ناعمة',
    preview: { primaryColor: '#D97706', secondaryColor: '#78350F', backgroundColor: '#FFFBEB', borderRadius: '12px', shadow: '0 10px 15px rgba(0,0,0,0.1)', animation: 'fade' },
  },
  {
    id: 'apple',
    label: 'Apple Style',
    labelAr: 'ستايل آبل',
    description: 'Minimal, large typography, glassmorphism',
    descriptionAr: 'بساطة، خطوط كبيرة، زجاجية',
    preview: { primaryColor: '#007AFF', secondaryColor: '#5856D6', backgroundColor: '#F5F5F7', borderRadius: '20px', shadow: '0 8px 30px rgba(0,0,0,0.08)', animation: 'slide-up' },
  },
  {
    id: 'glass',
    label: 'Glass',
    labelAr: 'زجاجي',
    description: 'Frosted glass effect, blur backgrounds, translucent',
    descriptionAr: 'تأثير زجاجي، خلفيات ضبابية، شفافية',
    preview: { primaryColor: '#0EA5E9', secondaryColor: '#6366F1', backgroundColor: '#F0F9FF', borderRadius: '24px', shadow: '0 10px 15px rgba(0,0,0,0.1)', animation: 'scale' },
  },
  {
    id: 'dark',
    label: 'Dark',
    labelAr: 'داكن',
    description: 'Dark background, neon accents, bold contrast',
    descriptionAr: 'خلفية داكنة، ألوان نيون، تباين جريء',
    preview: { primaryColor: '#00E5FF', secondaryColor: '#BD00FF', backgroundColor: '#0F172A', borderRadius: '16px', shadow: '0 10px 15px rgba(0,0,0,0.3)', animation: 'fade' },
  },
  {
    id: 'elegant',
    label: 'Elegant',
    labelAr: 'أنيق',
    description: 'Subtle colors, refined spacing, serif headings',
    descriptionAr: 'ألوان هادئة، مسافات مدروسة، عناوين مزخرفة',
    preview: { primaryColor: '#64748B', secondaryColor: '#334155', backgroundColor: '#F8FAFC', borderRadius: '12px', shadow: '0 4px 6px rgba(0,0,0,0.07)', animation: 'fade' },
  },
  {
    id: 'minimal',
    label: 'Minimal',
    labelAr: 'بسيط',
    description: 'Whitespace, monochrome, no shadows',
    descriptionAr: 'مساحات بيضاء، أحادية اللون، بلا ظلال',
    preview: { primaryColor: '#0F172A', secondaryColor: '#334155', backgroundColor: '#FFFFFF', borderRadius: '8px', shadow: 'none', animation: 'none' },
  },
];
