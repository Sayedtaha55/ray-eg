import { Monitor } from 'lucide-react';
import { MODULE_REGISTRY } from './registry';
import type { ModuleDef, ModuleId } from './types';

export const websiteModule: ModuleDef = {
  id: 'website',
  name: 'Website & Store Builder',
  nameKey: 'modules.website.name',
  nameAr: 'بناء الموقع والمتجر',
  description: 'Page builder, theme customization, gallery, custom pages, and storefront design.',
  descriptionKey: 'modules.website.description',
  descriptionAr: 'منشئ الصفحات، تخصيص الثيم، معرض الصور، صفحات مخصصة، وتصميم المتجر.',
  icon: Monitor,
  category: 'core',
  color: '#0EA5E9',
  dependencies: ['core'],
  features: [
    { id: 'builder', label: 'Page Builder & Theme Designer', labelAr: 'منشئ الصفحات', defaultEnabled: true },
    { id: 'gallery', label: 'Image Gallery', labelAr: 'معرض الصور', defaultEnabled: true },
    { id: 'pages', label: 'Pages', labelAr: 'الصفحات', defaultEnabled: false },
    { id: 'templates', label: 'Templates', labelAr: 'القوالب', defaultEnabled: false },
    { id: 'seo', label: 'SEO', labelAr: 'SEO', defaultEnabled: false },
    { id: 'blog', label: 'Blog', labelAr: 'المدونة', defaultEnabled: false },
    { id: 'forms', label: 'Forms', labelAr: 'النماذج', defaultEnabled: false },
    { id: 'media', label: 'Media', labelAr: 'الوسائط', defaultEnabled: false },
    { id: 'domains', label: 'Domains', labelAr: 'الدومينات', defaultEnabled: false },
    { id: 'publishing', label: 'Publishing', labelAr: 'النشر', defaultEnabled: false },
  ],
  pages: [
    { id: 'builder', label: 'Page Builder', route: '/business/dashboard?tab=builder', tabId: 'builder', existing: true },
    { id: 'gallery', label: 'Gallery', route: '/business/dashboard?tab=gallery', tabId: 'gallery', existing: true },
    { id: 'pages', label: 'Pages', route: '/business/dashboard?tab=pages', tabId: 'pages' },
    { id: 'templates', label: 'Templates', route: '/business/dashboard?tab=templates', tabId: 'templates' },
    { id: 'seo', label: 'SEO', route: '/business/dashboard?tab=seo', tabId: 'seo' },
    { id: 'blog', label: 'Blog', route: '/business/dashboard?tab=blog', tabId: 'blog' },
    { id: 'forms', label: 'Forms', route: '/business/dashboard?tab=forms', tabId: 'forms' },
    { id: 'media', label: 'Media', route: '/business/dashboard?tab=media', tabId: 'media' },
    { id: 'domains', label: 'Domains', route: '/business/dashboard?tab=domains', tabId: 'domains' },
    { id: 'publishing', label: 'Publishing', route: '/business/dashboard?tab=publishing', tabId: 'publishing' },
  ],
  navigation: [
    {
      id: 'website',
      title: 'Website',
      titleKey: 'dashboard.sections.website',
      order: 60,
      items: [
        { id: 'builder', label: 'Page Builder', labelKey: 'business.dashboardTabs.builder', route: '/business/dashboard?tab=builder', tabId: 'builder', icon: 'Palette', order: 0 },
        { id: 'gallery', label: 'Gallery', labelKey: 'business.dashboardTabs.gallery', route: '/business/dashboard?tab=gallery', tabId: 'gallery', icon: 'Camera', order: 1 },
        { id: 'pages', label: 'Pages', labelKey: 'business.dashboardTabs.pages', route: '/business/dashboard?tab=pages', tabId: 'pages', icon: 'FileText', order: 2 },
        { id: 'templates', label: 'Templates', labelKey: 'business.dashboardTabs.templates', route: '/business/dashboard?tab=templates', tabId: 'templates', icon: 'LayoutDashboard', order: 3 },
        { id: 'seo', label: 'SEO', labelKey: 'business.dashboardTabs.seo', route: '/business/dashboard?tab=seo', tabId: 'seo', icon: 'Search', order: 4 },
        { id: 'blog', label: 'Blog', labelKey: 'business.dashboardTabs.blog', route: '/business/dashboard?tab=blog', tabId: 'blog', icon: 'Newspaper', order: 5 },
        { id: 'forms', label: 'Forms', labelKey: 'business.dashboardTabs.forms', route: '/business/dashboard?tab=forms', tabId: 'forms', icon: 'ClipboardList', order: 6 },
        { id: 'media', label: 'Media', labelKey: 'business.dashboardTabs.media', route: '/business/dashboard?tab=media', tabId: 'media', icon: 'Camera', order: 7 },
        { id: 'domains', label: 'Domains', labelKey: 'business.dashboardTabs.domains', route: '/business/dashboard?tab=domains', tabId: 'domains', icon: 'Globe', order: 8 },
        { id: 'publishing', label: 'Publishing', labelKey: 'business.dashboardTabs.publishing', route: '/business/dashboard?tab=publishing', tabId: 'publishing', icon: 'Rocket', order: 9 },
      ],
    },
  ],
  dashboardWidgets: [
    { id: 'store_preview', label: 'Store Preview', labelKey: 'modules.website.widgetPreview', component: 'StorePreview', order: 15, size: 'medium' },
  ],
  permissions: [
    { id: 'website.view', label: 'View Builder' },
    { id: 'website.manage', label: 'Manage Builder' },
  ],
  settingsSections: [
    { id: 'builder', label: 'Builder Settings', labelKey: 'dashboard.settings.builder' },
    { id: 'seo', label: 'SEO Settings', labelKey: 'dashboard.settings.seo' },
  ],
  defaultEnabled: true,
  optional: true,
  estimatedSetupMinutes: 15,
};

export const MODULE_DEFINITIONS: ModuleDef[] = [...MODULE_REGISTRY, websiteModule];

export const MODULE_MAP: Record<ModuleId, ModuleDef> = MODULE_DEFINITIONS.reduce(
  (acc, mod) => { acc[mod.id] = mod; return acc; },
  {} as Record<ModuleId, ModuleDef>,
);

export const getModuleDef = (id: ModuleId): ModuleDef | undefined => MODULE_MAP[id];

export const OPTIONAL_MODULES = MODULE_DEFINITIONS.filter((m) => m.optional);
export const CORE_MODULES = MODULE_DEFINITIONS.filter((m) => !m.optional);
