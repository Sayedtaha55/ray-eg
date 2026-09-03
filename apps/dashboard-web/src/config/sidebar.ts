import {
  LayoutDashboard, Bell, CreditCard, Package, DollarSign, Megaphone,
  Users, Calendar, UserCog, BarChart3, Globe, Bot, Settings, ExternalLink,
  Gift, Sparkles,
  Home, Shield, Store, FileText, Puzzle, LayoutGrid, Clock, Share2, TrendingUp, User,
  Plus, ShoppingCart, RotateCcw,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type SidebarItem = {
  id: string;
  label: string;
  labelAr: string;
  icon: LucideIcon;
  href: string;
};

export type SidebarSection = {
  id: string;
  title: string;
  titleAr: string;
  moduleId?: string;
  icon?: LucideIcon;
  items: SidebarItem[];
  mainHref?: string;
};

export const sidebarSections: SidebarSection[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    titleAr: 'الرئيسية',
    items: [
      { id: 'overview', label: 'Overview', labelAr: 'نظرة عامة', icon: LayoutDashboard, href: '/dashboard' },
      { id: 'notifications', label: 'Notifications', labelAr: 'الإشعارات', icon: Bell, href: '/dashboard/notifications' },
    ],
  },
  {
    id: 'sales',
    title: 'Sales',
    titleAr: 'المبيعات',
    moduleId: 'sales',
    icon: CreditCard,
    items: [
      { id: 'sales', label: 'Orders', labelAr: 'الطلبات', icon: CreditCard, href: '/dashboard/sales' },
      { id: 'quotes', label: 'Quotes', labelAr: 'عروض الأسعار', icon: CreditCard, href: '/dashboard/sales/quotes' },
      { id: 'returns', label: 'Returns', labelAr: 'المرتجعات', icon: CreditCard, href: '/dashboard/sales/returns' },
      { id: 'abandonedCart', label: 'Abandoned Carts', labelAr: 'السلات المتروكة', icon: CreditCard, href: '/dashboard/sales/abandoned-cart' },
      { id: 'loyalty', label: 'Loyalty Points', labelAr: 'نقاط الولاء', icon: CreditCard, href: '/dashboard/sales/loyalty' },
      { id: 'loyaltyCard', label: 'Loyalty Card', labelAr: 'بطاقة الولاء', icon: Gift, href: '/dashboard/sales/loyalty-card' },
      { id: 'subscriptions', label: 'Subscriptions', labelAr: 'الاشتراكات', icon: CreditCard, href: '/dashboard/sales/subscriptions' },
      { id: 'epayment', label: 'E-Payment', labelAr: 'الدفع الإلكتروني', icon: CreditCard, href: '/dashboard/sales/epayment' },
      { id: 'orderStatus', label: 'Order Status', labelAr: 'حالة الطلب', icon: CreditCard, href: '/dashboard/sales/order-status' },
      { id: 'payments', label: 'Payments', labelAr: 'المدفوعات', icon: CreditCard, href: '/dashboard/sales/payments' },
    ],
  },
  {
    id: 'pos',
    title: 'POS / Cashier',
    titleAr: 'الكاشير',
    moduleId: 'pos',
    icon: ShoppingCart,
    mainHref: '/dashboard/pos',
    items: [
      { id: 'posCheckout', label: 'Cashier', labelAr: 'الكاشير', icon: ShoppingCart, href: '/dashboard/pos' },
      { id: 'posInvoices', label: 'POS Invoices', labelAr: 'فواتير الكاشير', icon: FileText, href: '/dashboard/pos/invoices' },
      { id: 'posReturns', label: 'POS Returns', labelAr: 'مرتجعات الكاشير', icon: RotateCcw, href: '/dashboard/pos/returns' },
      { id: 'posWebsiteReturns', label: 'Website Returns', labelAr: 'مرتجعات الموقع', icon: Globe, href: '/dashboard/pos/website-returns' },
      { id: 'posShifts', label: 'Shifts', labelAr: 'الورديات', icon: Clock, href: '/dashboard/pos/shifts' },
      { id: 'posReports', label: 'POS Reports', labelAr: 'تقارير الكاشير', icon: BarChart3, href: '/dashboard/pos/reports' },
    ],
  },
  {
    id: 'inventory',
    title: 'Inventory',
    titleAr: 'المخزون',
    moduleId: 'inventory',
    icon: Package,
    items: [
      { id: 'products', label: 'Products', labelAr: 'المنتجات', icon: Package, href: '/dashboard/inventory' },
      { id: 'addProduct', label: 'Add Product', labelAr: 'إضافة منتج', icon: Package, href: '/dashboard/inventory/add-product' },
      { id: 'categories', label: 'Categories', labelAr: 'الفئات', icon: Package, href: '/dashboard/inventory/categories' },
      { id: 'variants', label: 'Variants', labelAr: 'الأنواع', icon: Package, href: '/dashboard/inventory/variants' },
      { id: 'stocktake', label: 'Stock Take', labelAr: 'جرد المخزون', icon: Package, href: '/dashboard/inventory/stocktake' },
      { id: 'suppliers', label: 'Suppliers', labelAr: 'الموردين', icon: Package, href: '/dashboard/inventory/suppliers' },
      { id: 'purchaseOrders', label: 'Purchase Orders', labelAr: 'أوامر الشراء', icon: Package, href: '/dashboard/inventory/purchase-orders' },
      { id: 'warehouses', label: 'Warehouses', labelAr: 'المخازن', icon: Package, href: '/dashboard/inventory/warehouses' },
      { id: 'transfers', label: 'Transfers', labelAr: 'النقل بين المخازن', icon: Package, href: '/dashboard/inventory/transfers' },
      { id: 'barcode', label: 'Barcode', labelAr: 'الباركود', icon: Package, href: '/dashboard/inventory/barcode' },
      { id: 'qrCode', label: 'QR Code', labelAr: 'QR Code', icon: Package, href: '/dashboard/inventory/qr-code' },
      { id: 'stockTracking', label: 'Stock Tracking', labelAr: 'تتبع الكميات', icon: Package, href: '/dashboard/inventory/stock-tracking' },
      { id: 'lowStockAlerts', label: 'Low Stock', labelAr: 'تنبيهات النفاد', icon: Package, href: '/dashboard/inventory/low-stock' },
    ],
  },
  {
    id: 'finance',
    title: 'Finance',
    titleAr: 'المالية',
    moduleId: 'finance',
    icon: DollarSign,
    items: [
      { id: 'invoice', label: 'Invoices', labelAr: 'الفواتير', icon: DollarSign, href: '/dashboard/finance' },
      { id: 'newInvoice', label: 'New Invoice', labelAr: 'فاتورة جديدة', icon: Plus, href: '/dashboard/finance?action=new' },
      { id: 'expenses', label: 'Expenses', labelAr: 'المصروفات', icon: DollarSign, href: '/dashboard/finance/expenses' },
      { id: 'revenue', label: 'Revenue', labelAr: 'الإيرادات', icon: DollarSign, href: '/dashboard/finance/revenue' },
      { id: 'taxes', label: 'Taxes', labelAr: 'الضرائب', icon: DollarSign, href: '/dashboard/finance/taxes' },
      { id: 'cashflow', label: 'Cash Flow', labelAr: 'التدفق النقدي', icon: DollarSign, href: '/dashboard/finance/cashflow' },
      { id: 'accounts', label: 'Accounts', labelAr: 'الحسابات', icon: DollarSign, href: '/dashboard/finance/accounts' },
      { id: 'wallets', label: 'Wallets', labelAr: 'المحافظ', icon: DollarSign, href: '/dashboard/finance/wallets' },
      { id: 'profits', label: 'Profits', labelAr: 'الأرباح', icon: DollarSign, href: '/dashboard/finance/profits' },
      { id: 'journal', label: 'Journal Entries', labelAr: 'القيود', icon: DollarSign, href: '/dashboard/finance/journal' },
      { id: 'financialReports', label: 'Financial Reports', labelAr: 'التقارير المالية', icon: DollarSign, href: '/dashboard/finance/financial-reports' },
    ],
  },
  {
    id: 'marketing',
    title: 'Marketing',
    titleAr: 'التسويق',
    moduleId: 'marketing',
    icon: Megaphone,
    items: [
      { id: 'promotions', label: 'Promotions', labelAr: 'الترويج', icon: Megaphone, href: '/dashboard/marketing' },
      { id: 'campaigns', label: 'Campaigns', labelAr: 'الحملات', icon: Megaphone, href: '/dashboard/marketing/campaigns' },
      { id: 'coupons', label: 'Coupons', labelAr: 'الكوبونات', icon: Megaphone, href: '/dashboard/marketing/coupons' },
      { id: 'discounts', label: 'Discounts', labelAr: 'الخصومات', icon: Megaphone, href: '/dashboard/marketing/discounts' },
      { id: 'messages', label: 'Messages', labelAr: 'الرسائل', icon: Megaphone, href: '/dashboard/marketing/messages' },
      { id: 'emailCampaigns', label: 'Email Campaigns', labelAr: 'حملات الإيميل', icon: Megaphone, href: '/dashboard/marketing/email-campaigns' },
      { id: 'smsCampaigns', label: 'SMS Campaigns', labelAr: 'حملات SMS', icon: Megaphone, href: '/dashboard/marketing/sms-campaigns' },
      { id: 'loyaltyPrograms', label: 'Loyalty Programs', labelAr: 'برامج الولاء', icon: Megaphone, href: '/dashboard/marketing/loyalty-programs' },
      { id: 'pushNotifications', label: 'Push Notifications', labelAr: 'الإشعارات الفورية', icon: Megaphone, href: '/dashboard/marketing/push-notifications' },
      { id: 'seasonalOffers', label: 'Seasonal Offers', labelAr: 'العروض الموسمية', icon: Megaphone, href: '/dashboard/marketing/seasonal-offers' },
      { id: 'marketingHub', label: 'Marketing Hub', labelAr: 'مركز التسويق', icon: Megaphone, href: '/dashboard/marketing/hub' },
    ],
  },
  {
    id: 'customers',
    title: 'Customers',
    titleAr: 'العملاء',
    moduleId: 'customers',
    icon: Users,
    items: [
      { id: 'customers', label: 'Customers', labelAr: 'العملاء', icon: Users, href: '/dashboard/crm' },
      { id: 'customerSegments', label: 'Segments', labelAr: 'الشرائح', icon: Users, href: '/dashboard/customers/segments' },
      { id: 'customerTags', label: 'Tags', labelAr: 'الوسوم', icon: Users, href: '/dashboard/customers/tags' },
    ],
  },
  {
    id: 'crm',
    title: 'Customer Service',
    titleAr: 'خدمة العملاء',
    moduleId: 'crm',
    icon: Users,
    items: [
      { id: 'chats', label: 'Chats', labelAr: 'المحادثات', icon: Users, href: '/dashboard/crm/chats' },
      { id: 'tickets', label: 'Tickets', labelAr: 'التذاكر', icon: Users, href: '/dashboard/crm/tickets' },
      { id: 'complaints', label: 'Complaints', labelAr: 'الشكاوى', icon: Users, href: '/dashboard/crm/complaints' },
      { id: 'reviews', label: 'Reviews', labelAr: 'التقييمات', icon: Users, href: '/dashboard/crm/reviews' },
    ],
  },
  {
    id: 'bookings',
    title: 'Booking Management',
    titleAr: 'الحجوزات',
    moduleId: 'bookings',
    icon: Calendar,
    mainHref: '/dashboard/bookings',
    items: [
      { id: 'bookingsOverview', label: 'Overview', labelAr: 'نظرة عامة', icon: Calendar, href: '/dashboard/bookings?tab=overview' },
      { id: 'reservations', label: 'Reservations', labelAr: 'الحجوزات', icon: Calendar, href: '/dashboard/bookings?tab=reservations' },
      { id: 'calendar', label: 'Calendar', labelAr: 'التقويم', icon: Calendar, href: '/dashboard/bookings?tab=calendar' },
      { id: 'appointments', label: 'Appointments', labelAr: 'جدول المواعيد', icon: Calendar, href: '/dashboard/bookings?tab=appointments' },
      { id: 'doctors', label: 'Doctors', labelAr: 'الأطباء والمقدمون', icon: Calendar, href: '/dashboard/bookings?tab=doctors' },
      { id: 'rooms', label: 'Rooms', labelAr: 'الغرف والقاعات', icon: Calendar, href: '/dashboard/bookings?tab=rooms' },
      { id: 'tables', label: 'Tables', labelAr: 'الطاولات والأماكن', icon: Calendar, href: '/dashboard/bookings?tab=tables' },
      { id: 'bookingsNotifications', label: 'Notifications', labelAr: 'الإشعارات', icon: Bell, href: '/dashboard/bookings?tab=notifications' },
      { id: 'bookingsSettings', label: 'Settings', labelAr: 'الإعدادات', icon: Settings, href: '/dashboard/bookings?tab=settings' },
    ],
  },
  {
    id: 'hr',
    title: 'Human Resources',
    titleAr: 'الموارد البشرية',
    moduleId: 'hr',
    icon: UserCog,
    items: [
      { id: 'employees', label: 'Employees', labelAr: 'الموظفين', icon: UserCog, href: '/dashboard/hr' },
      { id: 'permissions', label: 'Permissions', labelAr: 'الصلاحيات', icon: UserCog, href: '/dashboard/hr/permissions' },
      { id: 'attendance', label: 'Attendance', labelAr: 'الحضور', icon: UserCog, href: '/dashboard/hr/attendance' },
      { id: 'checkout', label: 'Check-out', labelAr: 'الانصراف', icon: UserCog, href: '/dashboard/hr/check-out' },
      { id: 'payroll', label: 'Payroll', labelAr: 'الرواتب', icon: UserCog, href: '/dashboard/hr/payroll' },
      { id: 'leaves', label: 'Leaves', labelAr: 'الإجازات', icon: UserCog, href: '/dashboard/hr/leaves' },
      { id: 'tasks', label: 'Tasks', labelAr: 'المهام', icon: UserCog, href: '/dashboard/hr/tasks' },
    ],
  },
  {
    id: 'website',
    title: 'Website',
    titleAr: 'الموقع الإلكتروني',
    moduleId: 'website',
    icon: Globe,
    mainHref: '/dashboard/website',
    items: [
      { id: 'website', label: 'Website', labelAr: 'الموقع الإلكتروني', icon: Globe, href: '/dashboard/website' },
    ],
  },
  {
    id: 'analytics',
    title: 'Analytics',
    titleAr: 'التحليلات',
    moduleId: 'analytics',
    icon: BarChart3,
    items: [
      { id: 'reports', label: 'Reports', labelAr: 'التقارير', icon: BarChart3, href: '/dashboard/analytics' },
      { id: 'kpi', label: 'KPIs', labelAr: 'المؤشرات', icon: BarChart3, href: '/dashboard/analytics/kpi' },
      { id: 'charts', label: 'Charts', labelAr: 'الرسوم البيانية', icon: BarChart3, href: '/dashboard/analytics/charts' },
      { id: 'salesPerformance', label: 'Sales Performance', labelAr: 'أداء المبيعات', icon: BarChart3, href: '/dashboard/analytics/sales-performance' },
      { id: 'productPerformance', label: 'Product Performance', labelAr: 'أداء المنتجات', icon: BarChart3, href: '/dashboard/analytics/product-performance' },
      { id: 'visitors', label: 'Visitors', labelAr: 'الزوار', icon: BarChart3, href: '/dashboard/analytics/visitors' },
      { id: 'conversions', label: 'Conversions', labelAr: 'التحويلات', icon: BarChart3, href: '/dashboard/analytics/conversions' },
    ],
  },
  {
    id: 'ai',
    title: 'AI Assistant',
    titleAr: 'الذكاء الاصطناعي',
    moduleId: 'ai',
    icon: Bot,
    items: [
      { id: 'aiContent', label: 'AI Content', labelAr: 'كتابة المحتوى', icon: Bot, href: '/dashboard/ai' },
      { id: 'aiTheme', label: 'AI Theme Generator', labelAr: 'مولد الثيم', icon: Bot, href: '/dashboard/ai/theme-generator' },
      { id: 'aiPages', label: 'AI Pages Generator', labelAr: 'مولد صفحات AI', icon: Bot, href: '/dashboard/ai/ai-pages' },
      { id: 'aiBrand', label: 'Brand Identity', labelAr: 'هوية العلامة', icon: Bot, href: '/dashboard/ai/brand-identity' },
      { id: 'aiDesign', label: 'Design Assistant', labelAr: 'مساعد التصميم', icon: Bot, href: '/dashboard/ai/design-assistant' },
      { id: 'aiImages', label: 'AI Images', labelAr: 'إنشاء الصور', icon: Bot, href: '/dashboard/ai/images' },
      { id: 'aiSEO', label: 'AI SEO', labelAr: 'تحسين SEO', icon: Bot, href: '/dashboard/ai/seo' },
      { id: 'aiAnalysis', label: 'AI Analysis', labelAr: 'تحليل النشاط', icon: Bot, href: '/dashboard/ai/analysis' },
      { id: 'aiReplies', label: 'AI Replies', labelAr: 'الردود التلقائية', icon: Bot, href: '/dashboard/ai/replies' },
      { id: 'aiSuggestions', label: 'AI Suggestions', labelAr: 'الاقتراحات', icon: Bot, href: '/dashboard/ai/suggestions' },
      { id: 'aiPageGen', label: 'AI Page Builder', labelAr: 'إنشاء الصفحات', icon: Bot, href: '/dashboard/ai/page-builder' },
      { id: 'aiDataAnalysis', label: 'AI Data Analysis', labelAr: 'تحليل البيانات', icon: Bot, href: '/dashboard/ai/data-analysis' },
      { id: 'aiInsights', label: 'AI Insights', labelAr: 'رؤى AI', icon: Bot, href: '/dashboard/ai/insights' },
      { id: 'aiAutomations', label: 'AI Automations', labelAr: 'أتمتة AI', icon: Bot, href: '/dashboard/ai/automations' },
    ],
  },
  {
    id: 'settings',
    moduleId: 'settings',
    title: 'Settings',
    titleAr: 'الإعدادات',
    items: [
      { id: 'settings_overview', label: 'Overview', labelAr: 'النظرة العامة', icon: Home, href: '/dashboard/settings?tab=overview' },
      { id: 'settings_account', label: 'Account', labelAr: 'الحساب', icon: User, href: '/dashboard/settings?tab=account' },
      { id: 'settings_security', label: 'Security', labelAr: 'الأمان', icon: Shield, href: '/dashboard/settings?tab=security' },
      { id: 'settings_store', label: 'Store', labelAr: 'المتجر', icon: Store, href: '/dashboard/settings?tab=store' },
      { id: 'settings_modules', label: 'Modules', labelAr: 'الوحدات', icon: Puzzle, href: '/dashboard/settings?tab=modules' },
      { id: 'settings_apps', label: 'Apps', labelAr: 'التطبيقات', icon: LayoutGrid, href: '/dashboard/settings?tab=apps' },
      { id: 'settings_receipt_theme', label: 'Receipt Theme', labelAr: 'تصميم الإيصال', icon: FileText, href: '/dashboard/settings?tab=receipt_theme' },
      { id: 'settings_payments', label: 'Payments', labelAr: 'المدفوعات', icon: CreditCard, href: '/dashboard/settings?tab=payments' },
      { id: 'settings_social_media', label: 'Social Media', labelAr: 'السوشيال ميديا', icon: Share2, href: '/dashboard/settings?tab=social_media' },
      { id: 'settings_notifications', label: 'Notifications', labelAr: 'الإشعارات', icon: Bell, href: '/dashboard/settings?tab=notifications' },
    ],
  },
];
