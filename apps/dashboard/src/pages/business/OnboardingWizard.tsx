import React, { useState, useMemo, useCallback, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check, CheckCircle2, AlertTriangle, ChevronLeft, Search, Home, ArrowRight,
  Sparkles, Loader2, AlertCircle, Eye, EyeOff, Store, Mail, Lock, Phone, User,
  LayoutDashboard, ShoppingCart, Package, Receipt, Users, Megaphone, Calendar,
  UserCog, Monitor, BarChart3, Zap, ChevronDown, Info, X, Plus,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ApiService } from '@/services/api.service';
import { Category } from '@/types';
import { clearSession, persistMerchantContext, persistSession, syncMerchantContextFromBackend } from '@/services/authStorage';
import { normalizeSafeReturnTo, resolvePostAuthDestination } from '@/services/authRedirect';
import { getBusinessActivityThemePatch } from '@/utils/businessActivityCatalog';

import {
  BUSINESS_CATEGORIES,
  BUSINESS_TYPES,
  MODULE_DEFINITIONS,
  MODULE_MAP,
  getBusinessTypesByCategory,
  getBusinessTypeById,
  getInitialModules,
  getRecommendedModules,
  toggleModule,
  resolveDependencies,
  computeSystemSummary,
} from '../../config/modules';
import type { ModuleId, BusinessCategoryDef, BusinessTypeDef } from '../../config/modules';

import SystemSummary from '../../components/onboarding/SystemSummary';

const { useNavigate, useLocation } = ReactRouterDOM as any;
const MotionDiv = motion.div as any;

type Step = 'category' | 'type' | 'specialty' | 'modules' | 'data';

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  LayoutDashboard, ShoppingCart, Package, Receipt, Users, Megaphone, Calendar,
  UserCog, Monitor, BarChart3, Sparkles, Store, Zap,
};

const CATEGORY_ICON_MAP: Record<string, React.ComponentType<any>> = {
  utensils: Store, shirt: Package, crown: Sparkles, building: Store, car: Store,
  sprout: Package, wrench: Store, smartphone: Monitor, factory: Package, plane: Store,
  fish: Package, zap: Zap, briefcase: Store, home: Store, calendar: Calendar, circle: Store,
};

const FEATURE_LABEL_AR: Record<string, string> = {
  'Dashboard Overview': 'نظرة عامة على اللوحة',
  'Notifications Center': 'مركز الإشعارات',
  'System Settings': 'إعدادات النظام',
  'Account Profile': 'ملف الحساب',
  'Orders Management': 'إدارة الطلبات',
  'Point of Sale (POS)': 'نقطة البيع (الكاشير)',
  'Abandoned Cart Recovery': 'استرداد السلات المتروكة',
  'Order Tracking & Status': 'تتبع الطلبات والحالات',
  'Products Catalog': 'كتالوج المنتجات',
  'Categories & Collections': 'الفئات والمجموعات',
  'Stock Level Tracking': 'تتبع مستوى المخزون',
  'Product Variants (Sizes/Colors)': 'متغيرات المنتج (مقاسات/ألوان)',
  'Supplier Management': 'إدارة الموردين',
  'Low Stock Alerts': 'تنبيهات نقص المخزون',
  'Invoice Management': 'إدارة الفواتير',
  'Expense Tracking': 'تتبع المصروفات',
  'Transaction History': 'سجل المعاملات',
  'Tax & VAT Tracking': 'تتبع الضرائب والضريبة',
  'Profit & Loss Statements': 'قوائم الأرباح والخسائر',
  'Customer Directory': 'دليل العملاء',
  'Customer Segments & Groups': 'شرائح ومجموعات العملاء',
  'Loyalty Points & Rewards': 'نقاط الولاء والمكافآت',
  'Communication History': 'سجل التواصل',
  'Promotions & Offers': 'العروض والتخفيضات',
  'Discount Codes & Coupons': 'أكواد الخصم والكوبونات',
  'Email Campaigns': 'حملات البريد الإلكتروني',
  'SMS Campaigns': 'حملات الرسائل النصية',
  'Social Media Integration': 'تكامل وسائل التواصل',
  'Booking Calendar & Dashboard': 'تقويم الحجوزات واللوحة',
  'Service Providers / Staff': 'مقدمو الخدمة / الموظفون',
  'Services Catalog': 'كتالوج الخدمات',
  'Rooms / Chairs / Units': 'غرف / كراسي / وحدات',
  'Customer/Patient Records': 'سجلات العملاء/المرضى',
  'Activity-Specific Inventory': 'مخزون خاص بالنشاط',
  'Restaurant Table Management': 'إدارة طاولات المطعم',
  'Employee Directory': 'دليل الموظفين',
  'Attendance Tracking': 'تتبع الحضور',
  'Payroll Management': 'إدارة الرواتب',
  'Shift Scheduling': 'جدولة الورديات',
  'Performance Reviews': 'تقييمات الأداء',
  'Page Builder & Theme Designer': 'منشئ الصفحات ومصمم الثيم',
  'Image Gallery': 'معرض الصور',
  'Custom Pages': 'صفحات مخصصة',
  'Custom CSS': 'CSS مخصص',
  'SEO Tools': 'أدوات تحسين محركات البحث',
  'Shopping Mode': 'وضع التسوق',
  'Sales & Revenue Reports': 'تقارير المبيعات والإيرادات',
  'Cashier Reports': 'تقارير الكاشير',
  'Customer Insights': 'رؤى العملاء',
  'Product Performance': 'أداء المنتجات',
  'Orders': 'الطلبات',
  'Quotations': 'عروض الأسعار',
  'Invoices': 'الفواتير',
  'Payments': 'المدفوعات',
  'Customers': 'العملاء',
  'Returns': 'المرتجع',
  'Loyalty Points': 'نقاط الولاء',
  'Subscriptions': 'الاشتراكات',
  'Quick Sales (POS)': 'المبيعات السريعة (POS)',
  'E-Payment': 'الدفع الإلكتروني',
  'Order Status': 'حالات الطلب',
  'Products': 'المنتجات',
  'Categories': 'الفئات',
  'Variants': 'المتغيرات',
  'Warehouses': 'المخازن',
  'Stocktake': 'الجرد',
  'Suppliers': 'الموردين',
  'Purchase Orders': 'أوامر الشراء',
  'Transfers': 'النقل بين المخازن',
  'Barcode': 'الباركود',
  'QR Code': 'QR Code',
  'Stock Tracking': 'تتبع الكميات',
  'Revenue': 'الإيرادات',
  'Expenses': 'المصروفات',
  'Profits': 'الأرباح',
  'Taxes': 'الضرائب',
  'Journal Entries': 'القيود اليومية',
  'Cash Flow': 'التدفقات النقدية',
  'Accounts': 'الحسابات',
  'Wallets': 'المحافظ',
  'Financial Reports': 'التقارير المالية',
  'Chats': 'المحادثات',
  'Tickets': 'التذاكر',
  'Complaints': 'الشكاوى',
  'Reviews': 'التقييمات',
  'Notes': 'الملاحظات',
  'Follow-ups': 'المتابعة',
  'Contact Log': 'سجل التواصل',
  'Campaigns': 'الحملات',
  'Coupons': 'الكوبونات',
  'Discounts': 'الخصومات',
  'Messages': 'الرسائل',
  'Push Notifications': 'الإشعارات الفورية',
  'Loyalty Programs': 'برامج الولاء',
  'Seasonal Offers': 'العروض الموسمية',
  'Appointments': 'المواعيد',
  'Calendar': 'التقويم',
  'Doctors': 'الأطباء',
  'Booking Confirmation': 'تأكيد الحجز',
  'Booking Cancellation': 'إلغاء الحجز',
  'Booking Reminders': 'تذكير الحجز',
  'Permissions': 'الصلاحيات',
  'Check-out': 'الانصراف',
  'Leaves': 'الإجازات',
  'Tasks': 'المهام',
  'Pages': 'الصفحات',
  'Templates': 'القوالب',
  'SEO': 'SEO',
  'Blog': 'المدونة',
  'Forms': 'النماذج',
  'Media': 'الوسائط',
  'Domains': 'الدومينات',
  'Publishing': 'النشر',
  'KPI': 'مؤشرات الأداء',
  'Charts': 'الرسوم البيانية',
  'Sales Performance': 'أداء المبيعات',
  'Visitors': 'الزوار',
  'Conversions': 'التحويلات',
  'AI Theme Generator': 'مولد الثيم بالذكاء الاصطناعي',
  'AI Page Schema Generator': 'مولد الصفحات بالذكاء الاصطناعي',
  'AI Brand Identity': 'هوية العلامة بالذكاء الاصطناعي',
  'AI Design Chat Assistant': 'مساعد التصميم بالذكاء الاصطناعي',
  'AI Content Writer': 'كتابة المحتوى بالذكاء الاصطناعي',
  'AI Image Generator': 'إنشاء الصور بالذكاء الاصطناعي',
  'AI SEO Optimizer': 'تحسين SEO بالذكاء الاصطناعي',
  'AI Activity Analysis': 'تحليل النشاط بالذكاء الاصطناعي',
  'AI Auto Replies': 'الردود التلقائية بالذكاء الاصطناعي',
  'AI Suggestions': 'اقتراحات الذكاء الاصطناعي',
  'AI Page Builder': 'بناء الصفحات بالذكاء الاصطناعي',
  'AI Data Analysis': 'تحليل البيانات بالذكاء الاصطناعي',
  'Trend Analysis & Forecasting': 'تحليل الاتجاهات والتنبؤ',
  'AI Theme Generator': 'مولد الثيم بالذكاء الاصطناعي',
  'AI Page Schema Generator': 'مولد مخطط الصفحات بالذكاء الاصطناعي',
  'AI Brand Identity': 'هوية العلامة بالذكاء الاصطناعي',
  'AI Design Chat Assistant': 'مساعد تصميم المحادثة بالذكاء الاصطناعي',
  'AI Business Insights': 'رؤى أعمال بالذكاء الاصطناعي',
};

const PAGE_LABEL_AR: Record<string, string> = {
  'Overview': 'نظرة عامة',
  'Notifications': 'الإشعارات',
  'Settings': 'الإعدادات',
  'Profile': 'الملف الشخصي',
  'Orders': 'الطلبات',
  'POS System': 'نظام نقطة البيع',
  'Abandoned Cart': 'السلة المتروكة',
  'Products': 'المنتجات',
  'Invoices': 'الفواتير',
  'Expenses': 'المصروفات',
  'Customers': 'العملاء',
  'Promotions': 'العروض',
  'Marketing Center': 'مركز التسويق',
  'Reservations': 'الحجوزات',
  'Providers': 'مقدمو الخدمة',
  'Services': 'الخدمات',
  'Rooms / Units': 'الغرف / الوحدات',
  'Customer Records': 'سجلات العملاء',
  'Activity Inventory': 'مخزون النشاط',
  'Restaurant Tables': 'طاولات المطعم',
  'Employees': 'الموظفون',
  'Attendance': 'الحضور',
  'Payroll': 'الرواتب',
  'Page Builder': 'منشئ الصفحات',
  'Gallery': 'المعرض',
  'Reports': 'التقارير',
  'AI Builder': 'منشئ الذكاء الاصطناعي',
  'Quotes': 'عروض الأسعار',
  'Payments': 'المدفوعات',
  'Returns': 'المرتجع',
  'Loyalty': 'الولاء',
  'Subscriptions': 'الاشتراكات',
  'E-Payment': 'الدفع الإلكتروني',
  'Order Status': 'حالات الطلب',
  'Categories': 'الفئات',
  'Variants': 'المتغيرات',
  'Warehouses': 'المخازن',
  'Stocktake': 'الجرد',
  'Suppliers': 'الموردين',
  'Purchase Orders': 'أوامر الشراء',
  'Transfers': 'النقل بين المخازن',
  'Barcode': 'الباركود',
  'QR Code': 'QR Code',
  'Stock Tracking': 'تتبع الكميات',
  'Low Stock Alerts': 'تنبيهات النفاد',
  'Revenue': 'الإيرادات',
  'Profits': 'الأرباح',
  'Taxes': 'الضرائب',
  'Journal': 'القيود اليومية',
  'Cash Flow': 'التدفقات النقدية',
  'Accounts': 'الحسابات',
  'Wallets': 'المحافظ',
  'Financial Reports': 'التقارير المالية',
  'Chats': 'المحادثات',
  'Tickets': 'التذاكر',
  'Complaints': 'الشكاوى',
  'Reviews': 'التقييمات',
  'Notes': 'الملاحظات',
  'Follow-ups': 'المتابعة',
  'Contact Log': 'سجل التواصل',
  'Campaigns': 'الحملات',
  'Coupons': 'الكوبونات',
  'Discounts': 'الخصومات',
  'Messages': 'الرسائل',
  'Email Campaigns': 'حملات البريد الإلكتروني',
  'Push Notifications': 'الإشعارات الفورية',
  'SMS Campaigns': 'حملات SMS',
  'Loyalty Programs': 'برامج الولاء',
  'Seasonal Offers': 'العروض الموسمية',
  'Appointments': 'المواعيد',
  'Calendar': 'التقويم',
  'Rooms': 'الغرف',
  'Doctors': 'الأطباء',
  'Booking Confirm': 'تأكيد الحجز',
  'Booking Cancel': 'إلغاء الحجز',
  'Booking Reminder': 'تذكير الحجز',
  'Permissions': 'الصلاحيات',
  'Check-out': 'الانصراف',
  'Leaves': 'الإجازات',
  'Tasks': 'المهام',
  'Pages': 'الصفحات',
  'Templates': 'القوالب',
  'SEO': 'SEO',
  'Blog': 'المدونة',
  'Forms': 'النماذج',
  'Media': 'الوسائط',
  'Domains': 'الدومينات',
  'Publishing': 'النشر',
  'KPI': 'مؤشرات الأداء',
  'Charts': 'الرسوم البيانية',
  'Sales Performance': 'أداء المبيعات',
  'Product Performance': 'أداء المنتجات',
  'Visitors': 'الزوار',
  'Conversions': 'التحويلات',
  'AI Content': 'محتوى AI',
  'AI Images': 'صور AI',
  'AI SEO': 'SEO بالذكاء الاصطناعي',
  'AI Analysis': 'تحليل AI',
  'AI Replies': 'ردود AI',
  'AI Suggestions': 'اقتراحات AI',
  'AI Pages': 'صفحات AI',
  'AI Data Analysis': 'تحليل بيانات AI',
};

const REASON_AR: Record<string, string> = {
  'Menu items and food categories': 'عناصر القائمة وفئات الطعام',
  'Order management and POS for dine-in/takeaway': 'إدارة الطلبات ونقاط البيع للجلوب/تيك أواي',
  'Table reservations and booking management': 'حجوزات الطاولات وإدارة الحجوزات',
  'Track daily revenue and expenses': 'تتبع الإيرادات اليومية والمصروفات',
  'Promote daily specials and meal deals': 'ترويج العروض اليومية ووجبات الصفقات',
  'Customer loyalty and repeat orders': 'ولاء العملاء والطلبات المتكررة',
  'Sales trends and peak hours analysis': 'تحليل اتجاهات المبيعات وساعات الذروة',
  'Online menu and storefront': 'قائمة إلكترونية وواجهة متجر',
  'Staff scheduling for shifts': 'جدولة الموظفين للورديات',
  'Product catalog with categories and stock': 'كتالوج منتجات بفئات ومخزون',
  'POS checkout and order management': 'دفع نقطة البيع وإدارة الطلبات',
  'Track expenses and supplier payments': 'تتبع المصروفات ومدفوعات الموردين',
  'Bundle offers and weekly promotions': 'عروض الباقات والترويج الأسبوعي',
  'Inventory turnover and sales reports': 'معدل دوران المخزون وتقارير المبيعات',
  'Customer tracking for loyalty': 'تتبع العملاء للولاء',
  'Online store with delivery': 'متجر إلكتروني مع توصيل',
  'Staff management for multiple shifts': 'إدارة الموظفين لورديات متعددة',
  'Product variants: sizes, colors, collections': 'متغيرات المنتج: مقاسات، ألوان، مجموعات',
  'Orders, exchanges, and returns': 'الطلبات، التبديل، والاسترجاع',
  'Seasonal sales and collection launches': 'عروض موسمية وإطلاق مجموعات',
  'Customer profiles and purchase history': 'ملفات العملاء وسجل الشراء',
  'Best-selling products and trends': 'المنتجات الأكثر مبيعاً والاتجاهات',
  'Online store with product catalog': 'متجر إلكتروني مع كتالوج منتجات',
  'Track revenue and expenses': 'تتبع الإيرادات والمصروفات',
  'Product catalog with measurements': 'كتالوج منتجات بالمقاسات',
  'Custom orders and sales tracking': 'طلبات مخصصة وتتبع المبيعات',
  'Installation visits and measurement appointments': 'زيارات تركيب ومواعيد قياس',
  'Gallery and product catalog': 'معرض وكتالوج منتجات',
  'Seasonal promotions': 'عروض موسمية',
  'Showroom catalog and custom products': 'كتالوج المعارض ومنتجات مخصصة',
  'Orders with delivery and installation': 'طلبات مع توصيل وتركيب',
  'Delivery and installation scheduling': 'جدولة التوصيل والتركيب',
  'Showroom gallery and catalog': 'معرض وكتالوج المعارض',
  'Installation and delivery teams': 'فرق التركيب والتوصيل',
  'Jewelry catalog with karat pricing': 'كتالوج مجوهرات بأسعار العيار',
  'Sales with gold price tracking': 'مبيعات مع تتبع أسعار الذهب',
  'Track revenue, expenses, and gold inventory value': 'تتبع الإيرادات والمصروفات وقيمة مخزون الذهب',
  'VIP customer profiles and purchase history': 'ملفات عملاء VIP وسجل الشراء',
  'Showcase gallery': 'معرض الصور',
  'Sales trends and gold price analysis': 'تحليل اتجاهات المبيعات وأسعار الذهب',
  'Special occasion promotions': 'عروض المناسبات الخاصة',
  'Watch catalog with brands': 'كتالوج ساعات بالعلامات التجارية',
  'Sales with warranty tracking': 'مبيعات مع تتبع الضمان',
  'Customer profiles and warranty records': 'ملفات العملاء وسجلات الضمان',
  'Seasonal gift promotions': 'عروض هدايا موسمية',
  'Property listings with details': 'قوائم عقارات بالتفاصيل',
  'Sales and rental transactions': 'معاملات البيع والإيجار',
  'Property viewing appointments': 'مواعيد معاينة العقارات',
  'Buyer/seller/tenant profiles': 'ملفات المشترين/البائعين/المستأجرين',
  'Property showcase website': 'موقع عرض العقارات',
  'Track commissions and expenses': 'تتبع العمولات والمصروفات',
  'Market trends and sales analysis': 'اتجاهات السوق وتحليل المبيعات',
  'Quotations, project tracking, and contracts': 'عروض أسعار، تتبع المشاريع، وعقود',
  'Site visits and project scheduling': 'زيارات الموقع وجدولة المشاريع',
  'Client management and project history': 'إدارة العملاء وسجل المشاريع',
  'Project costs and expense tracking': 'تكاليف المشاريع وتتبع المصروفات',
  'Crew management and labor scheduling': 'إدارة الطاقم وجدولة العمال',
  'Portfolio and project showcase': 'معرض الأعمال والمشاريع',
  'Materials and supplies tracking': 'تتبع المواد والمستلزمات',
  'Vehicle listings with specifications': 'قوائم مركبات بالمواصفات',
  'Sales with financing and installments': 'مبيعات بتمويل وتقسيط',
  'Test drive appointments': 'مواعيد القيادة التجريبية',
  'Buyer profiles and follow-ups': 'ملفات المشترين والمتابعة',
  'Track sales and commissions': 'تتبع المبيعات والعمولات',
  'Online showroom': 'معرض إلكتروني',
  'Sales performance analysis': 'تحليل أداء المبيعات',
  'Service appointments and job orders': 'مواعيد الخدمة وأوامر العمل',
  'Service invoices and payments': 'فواتير الخدمة والمدفوعات',
  'Parts and supplies catalog': 'كتالوج قطع ومستلزمات',
  'Technician scheduling and assignments': 'جدولة الفنيين والمهام',
  'Customer vehicle history': 'سجل عملاء المركبات',
  'Track revenue and workshop expenses': 'تتبع الإيرادات ومصروفات الورشة',
  'Service catalog and gallery': 'كتالوج الخدمات والمعرض',
  'Sales and POS': 'المبيعات ونقطة البيع',
  'Track revenue and supplier payments': 'تتبع الإيرادات ومدفوعات الموردين',
  'Online store': 'متجر إلكتروني',
  'Sales reports': 'تقارير المبيعات',
  'Service scheduling and team dispatch': 'جدولة الخدمة وإرسال الفريق',
  'Service contracts and invoices': 'عقود الخدمة والفواتير',
  'Team management and shift scheduling': 'إدارة الفريق وجدولة الورديات',
  'Client contracts and service history': 'عقود العملاء وسجل الخدمة',
  'Track revenue and operational costs': 'تتبع الإيرادات والتكاليف التشغيلية',
  'Service catalog and portfolio': 'كتالوج الخدمات ومعرض الأعمال',
  'Performance and revenue analysis': 'تحليل الأداء والإيرادات',
  'Visit scheduling and appointment management': 'جدولة الزيارات وإدارة المواعيد',
  'Service invoices and payment tracking': 'فواتير الخدمة وتتبع المدفوعات',
  'Customer profiles and service history': 'ملفات العملاء وسجل الخدمة',
  'Track income and expenses': 'تتبع الدخل والمصروفات',
  'Service showcase and gallery': 'عرض الخدمات والمعرض',
  'Promote services': 'ترويج الخدمات',
  'Device catalog with specs and warranty': 'كتالوج أجهزة بالمواصفات والضمان',
  'Repair service appointments': 'مواعيد خدمة التصليح',
  'Promotions and new arrivals': 'عروض ووصولات جديدة',
  'Sales and repair revenue analysis': 'تحليل مبيعات وإيرادات التصليح',
  'Medicine catalog with expiry tracking': 'كتالوج أدوية مع تتبع الصلاحية',
  'Customer profiles and prescription history': 'ملفات العملاء وسجل الوصفات',
  'Sales reports and inventory analysis': 'تقارير المبيعات وتحليل المخزون',
  'Online ordering for refills': 'طلب إلكتروني للتعبئة',
  'Health awareness promotions': 'عروض التوعية الصحية',
  'Raw materials and finished goods tracking': 'تتبع الخامات والمنتجات النهائية',
  'Order management and B2B sales': 'إدارة الطلبات ومبيعات B2B',
  'Track production costs and revenue': 'تتبع تكاليف الإنتاج والإيرادات',
  'Worker management and shift scheduling': 'إدارة العمال وجدولة الورديات',
  'Production and sales analysis': 'تحليل الإنتاج والمبيعات',
  'Product catalog': 'كتالوج المنتجات',
  'B2B promotions': 'عروض B2B',
  'Product catalog and warehouse management': 'كتالوج المنتجات وإدارة المخازن',
  'B2B orders and wholesale': 'طلبات B2B وبيع بالجملة',
  'Track revenue, shipping costs, and expenses': 'تتبع الإيرادات وتكاليف الشحن والمصروفات',
  'Supplier and distributor management': 'إدارة الموردين والموزعين',
  'Sales and inventory analysis': 'تحليل المبيعات والمخزون',
  'Wholesale catalog': 'كتالوج بيع بالجملة',
  'Trade promotions': 'عروض تجارية',
  'Tour, hotel, and flight bookings': 'حجوزات جولات وفنادق وطيران',
  'Booking payments and invoices': 'مدفوعات الحجوزات والفواتير',
  'Customer profiles and booking history': 'ملفات العملاء وسجل الحجوزات',
  'Tour packages showcase': 'عرض باقات سياحية',
  'Seasonal travel promotions': 'عروض سفر موسمية',
  'Booking trends analysis': 'تحليل اتجاهات الحجوزات',
  'Product and supply catalog': 'كتالوج منتجات ومستلزمات',
  'Track revenue and export costs': 'تتبع الإيرادات وتكاليف التصدير',
  'Product and equipment catalog': 'كتالوج منتجات ومعدات',
  'Equipment catalog with specs': 'كتالوج معدات بالمواصفات',
  'Sales and installation contracts': 'مبيعات وعقود تركيب',
  'Installation and maintenance appointments': 'مواعيد التركيب والصيانة',
  'Installation team management': 'إدارة فريق التركيب',
  'Product catalog and services': 'كتالوج منتجات وخدمات',
  'Appointment scheduling': 'جدولة المواعيد',
  'Service invoices and contracts': 'فواتير الخدمة والعقود',
  'Client management and case history': 'إدارة العملاء وسجل القضايا',
  'Portfolio and service showcase': 'معرض الأعمال وعرض الخدمات',
  'Promote professional services': 'ترويج الخدمات المهنية',
  'Visit scheduling and booking management': 'جدولة الزيارات وإدارة الحجوزات',
  'Service showcase and before/after gallery': 'عرض الخدمات ومعرض قبل/بعد',
  'Technician management': 'إدارة الفنيين',
  'Product or service catalog': 'كتالوج منتجات أو خدمات',
  'Order and payment management': 'إدارة الطلبات والمدفوعات',
  'Storefront and page builder': 'واجهة المتجر ومنشئ الصفحات',
  'Business reports': 'تقارير الأعمال',
  'Customer management': 'إدارة العملاء',
  'Patient appointments and scheduling': 'مواعيد المرضى والجدولة',
  'Session payments and invoices': 'مدفوعات الجلسات والفواتير',
  'Patient records and medical history': 'سجلات المرضى والتاريخ الطبي',
  'Clinic website with services': 'موقع العيادة بالخدمات',
  'Doctor and staff scheduling': 'جدولة الأطباء والموظفين',
  'Patient flow and revenue analysis': 'تحليل تدفق المرضى والإيرادات',
  'Appointment scheduling with chairs': 'جدولة المواعيد بالكراسي',
  'Service payments and POS': 'مدفوعات الخدمة ونقطة البيع',
  'Service menu and gallery': 'قائمة الخدمات والمعرض',
  'Stylist scheduling': 'جدولة المصففين',
  'Promotions and loyalty': 'عروض وولاء',
  'Session booking with room management': 'حجز الجلسات وإدارة الغرف',
  'Service payments and packages': 'مدفوعات الخدمة والباقات',
  'Customer profiles and preferences': 'ملفات العملاء والتفضيلات',
  'Wellness packages and promotions': 'باقات العافية والعروض',
  'Therapist scheduling': 'جدولة المعالجين',
  'Unit booking and availability calendar': 'حجز الوحدات وتقويم التوفر',
  'Guest profiles and booking history': 'ملفات الضيوف وسجل الحجوزات',
  'Track revenue and maintenance costs': 'تتبع الإيرادات وتكاليف الصيانة',
  'Unit showcase and booking': 'عرض الوحدات والحجز',
  'Staff and housekeeping scheduling': 'جدولة الموظفين والتدبير',
  'Occupancy and revenue analysis': 'تحليل الإشغال والإيرادات',
  'Room booking and check-in/out': 'حجز الغرف وتسجيل الدخول/الخروج',
  'Guest profiles and preferences': 'ملفات الضيوف والتفضيلات',
  'Room showcase and online booking': 'عرض الغرف والحجز الإلكتروني',
  'Staff shift management': 'إدارة ورديات الموظفين',
  'Occupancy rates and revenue analysis': 'تحليل معدلات الإشغال والإيرادات',
  'Venue booking and event scheduling': 'حجز القاعات وجدولة الفعاليات',
  'Booking payments and catering invoices': 'مدفوعات الحجوزات وفواتير التموين',
  'Client profiles and event history': 'ملفات العملاء وسجل الفعاليات',
  'Track revenue and event costs': 'تتبع الإيرادات وتكاليف الفعاليات',
  'Venue showcase and gallery': 'عرض القاعات والمعرض',
  'Event staff scheduling': 'جدولة موظفي الفعاليات',
  'Event packages and promotions': 'باقات الفعاليات والعروض',
  'Session and facility booking': 'حجز الجلسات والمرافق',
  'Session payments and memberships': 'مدفوعات الجلسات والعضويات',
  'Member profiles and progress tracking': 'ملفات الأعضاء وتتبع التقدم',
  'Membership promotions': 'عروض العضوية',
  'Class scheduling and enrollment': 'جدولة الفصول والتسجيل',
  'Course payments and invoices': 'مدفوعات الدورات والفواتير',
  'Student profiles and progress': 'ملفات الطلاب والتقدم',
  'Course catalog and showcase': 'كتالوج الدورات والعرض',
  'Instructor scheduling': 'جدولة المدربين',
  'Enrollment and revenue analysis': 'تحليل التسجيل والإيرادات',
  'Service call scheduling and dispatch': 'جدولة مكالمات الخدمة والإرسال',
  'Track revenue and costs': 'تتبع الإيرادات والتكاليف',
  'Appointment scheduling and calendar': 'جدولة المواعيد والتقويم',
  'Customer profiles and history': 'ملفات العملاء والسجل',
  'Service showcase': 'عرض الخدمات',
};

const SPECIALTY_AR: Record<string, string> = {
  'Family Restaurant': 'مطعم عائلي',
  'Cafe': 'مقهى',
  'Fast Food': 'وجبات سريعة',
  'Grill House': 'مشاوي',
  'Seafood': 'مأكولات بحرية',
  'Healthy/Diet': 'صحي/دايت',
  'Street Food': 'طعام شارع',
  'Buffet': 'بوفيه',
  'Bakery & Sweets': 'مخبز وحلويات',
  'Halal/Kosher': 'حلال/كوشير',
  'Supermarket': 'سوبر ماركت',
  'Grocery': 'بقالة',
  'Herbs & Spices': 'أعشاب وبهارات',
  'Fruits & Vegetables': 'خضار وفواكه',
  'Canned Goods': 'معلبات',
  'Dairy & Fish': 'ألبان وأسماك',
  'Bakery': 'مخبز',
  'Home Supply': 'مستلزمات منزلية',
  'Online Grocery': 'بقالة أونلاين',
  'Wholesale': 'بيع بالجملة',
  'Men Clothing': 'ملابس رجالي',
  'Women Clothing': 'ملابس حريمي',
  'Kids Clothing': 'ملابس أطفال',
  'Shoes': 'أحذية',
  'Accessories': 'إكسسوارات',
  'Bags': 'حقائب',
  'Sportswear': 'ملابس رياضية',
  'Wedding Wear': 'ملابس أفراح',
  'Plus Size': 'مقاسات كبيرة',
  'Modest Fashion': 'أزياء محتشمة',
  'Carpets': 'سجاد',
  'Curtains': 'ستائر',
  'Bedding': 'مفروشات',
  'Quilts & Blankets': 'ألحفة وبطانيات',
  'Towels': 'مناشف',
  'Sofa Covers': 'أغطية كنبات',
  'Prayer Rugs': 'سجاد صلاة',
  'Tents': 'خيام',
  'Tablecloths': 'مفارش طاولات',
  'Floor Coverings': 'أغطية أرضيات',
  'Bedrooms': 'غرف نوم',
  'Living Rooms': 'غرف معيشة',
  'Offices': 'مكاتب',
  'Kitchens': 'مطابخ',
  'Outdoor': 'خارجي',
  'Hotel Furniture': 'أثاث فنادق',
  'Interior Decor': 'ديكور داخلي',
  'Custom Manufacturing': 'تصنيع حسب الطلب',
  'Furniture Showroom': 'معرض أثاث',
  'Installation': 'تركيب',
  '18K Gold': 'ذهب 18',
  '21K Gold': 'ذهب 21',
  '24K Gold': 'ذهب 24',
  'Diamonds': 'ماس',
  'Sets': 'أطقم',
  'Rings & Couples': 'خواتم وأزواج',
  'Bullion': 'سبائك',
  'Gold Coins': 'عملات ذهبية',
  'Maintenance & Polishing': 'صيانة وتلميع',
  'Custom Design': 'تصميم حسب الطلب',
  'Men Watches': 'ساعات رجالي',
  'Women Watches': 'ساعات حريمي',
  'Kids Watches': 'ساعات أطفال',
  'Global Brands': 'علامات عالمية',
  'Sport Watches': 'ساعات رياضية',
  'Classic Watches': 'ساعات كلاسيك',
  'Perfumes': 'عطور',
  'Gift Sets': 'أطقم هدايا',
  'Straps & Batteries': 'أحزمة وبطاريات',
  'Watch Repair': 'تصليح ساعات',
  'Apartments': 'شقق',
  'Villas': 'فلل',
  'Shops': 'محلات',
  'Commercial': 'تجاري',
  'Luxury': 'فاخر',
  'Furnished': 'مفروش',
  'Installments': 'تقسيط',
  'Viewings': 'معاينات',
  'Consultations': 'استشارات',
  'Apartment Finishing': 'تشطيب شقق',
  'Villa Finishing': 'تشطيب فلل',
  'Interior Design': 'تصميم داخلي',
  'Electrical': 'كهرباء',
  'Plumbing': 'سباكة',
  'Painting & Decor': 'دهان وديكور',
  'Carpentry': 'نجارة',
  'Engineering Supervision': 'إشراف هندسي',
  'General Contracting': 'مقاولات عامة',
  'Restoration': 'ترميم',
  'New Cars': 'سيارات جديدة',
  'Used Cars': 'سيارات مستعملة',
  'Test Drives': 'قيادة تجريبية',
  'Technical Inspection': 'فحص فني',
  'Luxury Cars': 'سيارات فاخرة',
  'Economy Cars': 'سيارات اقتصادية',
  'SUV': 'دفع رباعي',
  'Electric Cars': 'سيارات كهربائية',
  'Trade-in': 'تبديل',
  'General Mechanics': 'ميكانيكا عامة',
  'Auto Electrical': 'كهرباء سيارات',
  'Body & Paint': 'هياكل ودهان',
  'Periodic Maintenance': 'صيانة دورية',
  'Full Inspection': 'فحص شامل',
  'Wash & Polish': 'غسيل وتلميع',
  'Oil Change': 'تغيير زيت',
  'Tires & Batteries': 'كوات وبطاريات',
  'Computer Diagnostics': 'تشخيص كمبيوتر',
  'AC Service': 'خدمة تكييف',
  'Seeds': 'بذور',
  'Seedlings': 'شتلات',
  'Fertilizers': 'أسمدة',
  'Pesticides': 'مبيدات',
  'Irrigation Tools': 'أدوات ري',
  'Soil & Compost': 'تربة وسماد عضوي',
  'Animal Feed': 'أعلاف',
  'Farm Equipment': 'معدات زراعية',
  'Pest Control': 'مكافحة آفات',
  'Agricultural Consulting': 'استشارات زراعية',
  'General Maintenance': 'صيانة عامة',
  'Cleaning': 'تنظيف',
  'Security': 'أمن',
  'Transport': 'نقل',
  'Facility Management': 'إدارة مرافق',
  'Real Estate Services': 'خدمات عقارية',
  'Landscaping': 'تنسيق حدائق',
  'Annual Contracts': 'عقود سنوية',
  'Corporate Services': 'خدمات شركات',
  'Plumber': 'سباك',
  'Electrician': 'كهربائي',
  'Carpenter': 'نجار',
  'Painter': 'دهان',
  'AC Technician': 'فني تكييف',
  'Appliance Repair': 'تصليح أجهزة',
  'Welding': 'لحام',
  'Aluminum': 'ألمنيوم',
  'Painting': 'دهان',
  'Computers': 'حواسيب',
  'Mobiles': 'جوالات',
  'Tablets': 'تابلت',
  'Gaming': 'ألعاب',
  'Smart Home': 'منزل ذكي',
  'Cameras': 'كاميرات',
  'Networks': 'شبكات',
  'Sales': 'مبيعات',
  'Repairs': 'تصليح',
  'Pharmacy': 'صيدلية',
  'Medicines': 'أدوية',
  'Cosmetics': 'مستحضرات تجميل',
  'Medical Devices': 'أجهزة طبية',
  'Supplements': 'مكملات غذائية',
  'Baby Care': 'رعاية طفل',
  'First Aid': 'إسعافات أولية',
  'Herbal': 'عشبي',
  'Personal Care': 'رعاية شخصية',
  'Factory Outlet': 'مصنع مباشر',
  'Production Line': 'خط إنتاج',
  'Wholesale Trade': 'تجارة جملة',
  'Import/Export': 'استيراد/تصدير',
  'Distribution': 'توزيع',
  'Raw Materials': 'خامات',
  'Packaging': 'تعبئة وتغليف',
  'Logistics': 'لوجستيات',
  'Manufacturing': 'تصنيع',
  'Retail': 'بيع بالتجزئة',
  'B2B Trade': 'تجارة B2B',
  'Import': 'استيراد',
  'Export': 'تصدير',
  'Trading Companies': 'شركات تجارية',
  'Suppliers': 'موردون',
  'Distributors': 'موزعون',
  'Warehousing': 'تخزين',
  'Shipping': 'شحن',
  'Clearance': 'تخليص جمركي',
  'Domestic Tours': 'جولات محلية',
  'International Tours': 'جولات دولية',
  'Hajj & Umrah': 'حج وعمرة',
  'Flight Booking': 'حجز طيران',
  'Hotel Booking': 'حجز فنادق',
  'Visa Services': 'خدمات تأشيرات',
  'Tour Guides': 'مرشدون سياحيون',
  'Travel Insurance': 'تأمين سفر',
  'Cattle': 'ماشية',
  'Sheep & Goats': 'أغنام وماعز',
  'Poultry': 'دواجن',
  'Feed': 'أعلاف',
  'Veterinary': 'بيطري',
  'Fish Farming': 'تربية أسماك',
  'Hatcheries': 'مفرخات',
  'Dairy': 'ألبان',
  'Meat': 'لحوم',
  'Eggs': 'بيض',
  'Solar Panels': 'ألواح شمسية',
  'Batteries': 'بطاريات',
  'Generators': 'مولدات',
  'Inverters': 'إنفرترات',
  'Electrical Supplies': 'مستلزمات كهربائية',
  'Lighting': 'إضاءة',
  'Wiring': 'أسلاك',
  'Maintenance': 'صيانة',
  'Accounting': 'محاسبة',
  'Legal': 'قانوني',
  'Translation': 'ترجمة',
  'Consulting': 'استشارات',
  'Freelance': 'عمل حر',
  'Audit': 'مراجعة حسابات',
  'Tax': 'ضرائب',
  'Corporate': 'شركات',
  'Notary': 'توثيق',
  'Web Design': 'تصميم ويب',
  'Gardening': 'بستنة',
  'Moving': 'نقل أثاث',
  'Handyman': 'عامل ماهر',
  'General Clinics': 'عيادات عامة',
  'Dental': 'أسنان',
  'Dermatology': 'جلدية',
  'Pediatrics': 'أطفال',
  'Ophthalmology': 'رمد',
  'ENT': 'أنف وأذن وحنجرة',
  'Orthopedics': 'عظام',
  'Cardiology': 'قلب',
  'Psychiatry': 'نفسية',
  'Hair Salon': 'صالون شعر',
  'Barbershop': 'حلاقة',
  'Nails': 'أظافر',
  'Makeup': 'مكياج',
  'Spa': 'سبا',
  'Massage': 'مساج',
  'Skincare': 'عناية بالبشرة',
  'Henna': 'حنة',
  'Hair Removal': 'إزالة شعر',
  'Wellness Center': 'مركز عافية',
  'Yoga': 'يوجا',
  'Meditation': 'تأمل',
  'Nutrition': 'تغذية',
  'Fitness': 'لياقة',
  'Physical Therapy': 'علاج طبيعي',
  'Alternative Medicine': 'طب بديل',
  'Holistic Healing': 'شفاء شمولي',
  'Aromatherapy': 'علاج بالروائح',
  'Reflexology': 'انعكاسي',
  'Hotel Rooms': 'غرف فندق',
  'Suites': 'أجنحة',
  'Resort': 'منتجع',
  'Hostel': 'نزل',
  'Boutique Hotel': 'فندق بوتيك',
  'Serviced Apartments': 'شقق مفروشة',
  'Conference Rooms': 'قاعات مؤتمرات',
  'Banquet Halls': 'قاعات بنكيه',
  'Wedding Halls': 'قاعات أفراح',
  'Event Halls': 'قاعات فعاليات',
  'Meeting Rooms': 'قاعات اجتماعات',
  'Exhibition Halls': 'قاعات معارض',
  'Outdoor Venues': 'أماكن خارجية',
  'Catering': 'تموين',
  'Event Planning': 'تنظيم فعاليات',
  'Audio/Visual': 'صوت/صورة',
  'Decorations': 'ديكورات',
  'Gym': 'جيم',
  'Fitness Center': 'مركز لياقة',
  'Yoga Studio': 'استوديو يوجا',
  'Martial Arts': 'فنون قتالية',
  'Swimming': 'سباحة',
  'Tennis': 'تنس',
  'Football': 'كرة قدم',
  'Basketball': 'كرة سلة',
  'Personal Training': 'تدريب شخصي',
  'Nursery': 'حضانة',
  'Primary School': 'مدرسة ابتدائية',
  'Middle School': 'مدرسة إعدادية',
  'High School': 'مدرسة ثانوية',
  'Tutoring': 'دروس خصوصية',
  'Language Courses': 'دورات لغات',
  'Computer Courses': 'دورات حاسب',
  'Music Classes': 'دروس موسيقى',
  'Art Classes': 'دروس فن',
  'Online Courses': 'دورات أونلاين',
  'IT Support': 'دعم تقني',
  'Software': 'برمجيات',
  'Web Development': 'تطوير ويب',
  'Mobile Apps': 'تطبيقات جوال',
  'Cloud Services': 'خدمات سحابية',
  'Cybersecurity': 'أمن سيبراني',
  'Data Recovery': 'استعادة بيانات',
  'System Setup': 'إعداد أنظمة',
  'Network Setup': 'إعداد شبكات',
  'Custom Specialty': 'تخصص مخصص',
};

const STORAGE_KEY = 'ray_merchant_onboarding_v2';

const MerchantOnboarding: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const navigate = useNavigate();
  const location = useLocation();

  const [step, setStep] = useState<Step>('category');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedTypeId, setSelectedTypeId] = useState<string>('');
  const [selectedSpecialties, setSelectedSpecialties] = useState<Set<string>>(new Set());
  const [customSpecialtyInput, setCustomSpecialtyInput] = useState('');
  const [enabledModuleIds, setEnabledModuleIds] = useState<ModuleId[]>([]);
  const [moduleFeatures, setModuleFeatures] = useState<Record<string, string[]>>({});
  const [expandedModuleId, setExpandedModuleId] = useState<ModuleId | null>(null);
  const [dependencyError, setDependencyError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    shopName: '',
    shopPhone: '',
    address: '',
    description: '',
    workingHours: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const shouldStoreBearerToken =
    String(((import.meta as any)?.env?.VITE_ENABLE_BEARER_TOKEN as any) || '').trim().toLowerCase() === 'true';

  const selectedCategory = useMemo(
    () => BUSINESS_CATEGORIES.find((c) => c.id === selectedCategoryId),
    [selectedCategoryId],
  );

  const selectedType = useMemo(
    () => getBusinessTypeById(selectedTypeId),
    [selectedTypeId],
  );

  const availableTypes = useMemo(
    () => selectedCategoryId ? getBusinessTypesByCategory(selectedCategoryId) : [],
    [selectedCategoryId],
  );

  const recommendations = useMemo(
    () => selectedTypeId ? getRecommendedModules(selectedTypeId) : [],
    [selectedTypeId],
  );

  const summary = useMemo(
    () => computeSystemSummary(enabledModuleIds),
    [enabledModuleIds],
  );

  const getRecPriority = (moduleId: ModuleId): 'required' | 'recommended' | 'optional' | 'none' => {
    const rec = recommendations.find((r) => r.moduleId === moduleId);
    return rec?.priority || 'none';
  };

  const getRecReason = (moduleId: ModuleId): string => {
    const rec = recommendations.find((r) => r.moduleId === moduleId);
    if (!rec) return '';
    return isArabic ? (REASON_AR[rec.reason] || rec.reason) : rec.reason;
  };

  const selectCategory = (cat: BusinessCategoryDef) => {
    setSelectedCategoryId(cat.id);
    setSelectedTypeId('');
    setSelectedSpecialties(new Set());
    setCustomSpecialtyInput('');
    setError('');
  };

  const selectType = (type: BusinessTypeDef) => {
    setSelectedTypeId(type.id);
    const initialModules = getInitialModules(type.id);
    setEnabledModuleIds(initialModules);

    // Initialize feature selections based on module defaults
    const initialFeatures: Record<string, string[]> = {};
    MODULE_DEFINITIONS.forEach((mod) => {
      initialFeatures[mod.id] = mod.features
        .filter((f) => f.defaultEnabled !== false)
        .map((f) => f.id);
    });
    setModuleFeatures(initialFeatures);

    setExpandedModuleId(null);
    setError('');
  };

  const handleToggleModule = useCallback((moduleId: ModuleId) => {
    setDependencyError('');
    setEnabledModuleIds((prev) => {
      const result = toggleModule(prev, moduleId);
      if (result.blocked.length > 0) {
        const mod = MODULE_MAP[moduleId];
        if (mod && !mod.optional) {
          setDependencyError(isArabic
            ? `${mod.nameAr || mod.name}: ${mod.nameAr ? 'وحدة أساسية لا يمكن تعطيلها' : 'Core module cannot be disabled'}`
            : `${mod.name}: Core module cannot be disabled`);
        } else {
          const blockedNames = result.blocked
            .map((id) => MODULE_MAP[id]?.name || id)
            .join(', ');
          setDependencyError(isArabic
            ? `لا يمكن التعديل — مطلوب بواسطة: ${blockedNames}`
            : `Cannot disable — required by: ${blockedNames}`);
        }
        return prev;
      }
      if (result.removed.length > 1) {
        const removedNames = result.removed
          .map((id) => {
            const m = MODULE_MAP[id];
            return isArabic ? (m?.nameAr || m?.name || id) : (m?.name || id);
          })
          .join(', ');
        setDependencyError(isArabic
          ? `تم تعطيل: ${removedNames}`
          : `Disabled: ${removedNames}`);
      }
      return result.next;
    });
  }, [isArabic]);

  const handleToggleFeature = (moduleId: string, featureId: string) => {
    setModuleFeatures((prev) => {
      const current = prev[moduleId] || [];
      const next = current.includes(featureId)
        ? current.filter((id) => id !== featureId)
        : [...current, featureId];
      return { ...prev, [moduleId]: next };
    });
  };

  const toggleSpecialty = (specialty: string) => {
    setSelectedSpecialties((prev) => {
      const next = new Set(prev);
      if (next.has(specialty)) next.delete(specialty);
      else next.add(specialty);
      return next;
    });
  };

  const addCustomSpecialty = () => {
    const value = customSpecialtyInput.trim();
    if (!value) return;
    setSelectedSpecialties((prev) => new Set([...Array.from(prev), value]));
    setCustomSpecialtyInput('');
  };

  const removeCustomSpecialty = (value: string) => {
    setSelectedSpecialties((prev) => {
      const next = new Set(prev);
      next.delete(value);
      return next;
    });
  };

  const getOnboardingPayload = () => {
    if (!selectedType) return null;
    const themeActivityId = selectedType.themeActivityId || selectedType.id;
    const themePatch = getBusinessActivityThemePatch(themeActivityId);
    return {
      activityId: selectedType.id,
      category: selectedType.category as Category,
      enabledModules: Array.from(resolveDependencies(enabledModuleIds)),
      pageDesign: {
        ...themePatch,
        businessActivityId: selectedType.id,
        businessActivityTitle: selectedType.title,
        businessActivityCategoryId: selectedType.categoryId,
        specialties: Array.from(selectedSpecialties),
        moduleConfig: {
          enabledModules: Array.from(resolveDependencies(enabledModuleIds)),
          moduleFeatures: MODULE_DEFINITIONS.filter((m) =>
            resolveDependencies(enabledModuleIds).includes(m.id),
          ).map((m) => ({
            moduleId: m.id,
            features: m.features.map((f) => ({
            id: f.id,
            label: f.label,
            enabled: (moduleFeatures[m.id] || []).includes(f.id)
          })),
          })),
        },
      },
      ts: Date.now(),
    };
  };

  const submitSignup = async () => {
    if (!selectedType) {
      setError(t('business.onboarding.chooseActivityFirst'));
      setStep('category');
      return;
    }

    if (!formData.name || !formData.email || !formData.password || !formData.phone || !formData.shopName) {
      setError(t('business.onboarding.fillRequiredFields'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const cfg = getOnboardingPayload();
      const q = new URLSearchParams(String(location?.search || ''));
      const returnTo = normalizeSafeReturnTo(q.get('returnTo'));
      const followShopId = q.get('followShopId');

      const payload: any = {
        ...formData,
        role: 'merchant',
        category: selectedType.category,
      };

      if (cfg) {
        const activityId = String(cfg.activityId || '').trim();
        if (activityId) payload.activityId = activityId;
        const enabledModules = Array.isArray(cfg.enabledModules)
          ? cfg.enabledModules.map((x: any) => String(x || '').trim()).filter(Boolean)
          : [];
        if (enabledModules.length > 0) payload.enabledModules = enabledModules;
        if (cfg.pageDesign && typeof cfg.pageDesign === 'object') payload.pageDesign = cfg.pageDesign;
      }

      const response = await ApiService.signup(payload);
      const isPending = Boolean((response as any)?.pending);
      if (isPending) {
        clearSession('signup-pending');
        navigate('/business/pending');
        return;
      }

      persistSession({
        user: (response as any).user,
        accessToken: (response as any).session?.access_token,
        persistBearer: shouldStoreBearerToken,
      }, 'signup');

      if (returnTo) {
        try {
          if (followShopId) {
            await ApiService.followShop(followShopId);
            window.dispatchEvent(new Event('ray-db-update'));
          }
        } catch { }
        navigate(returnTo);
        return;
      }

      const normalizedRole = String((response as any)?.user?.role || 'merchant').trim().toLowerCase();
      if (normalizedRole === 'merchant') {
        const responseShop = (response as any)?.shop;
        const responseShopStatus = String(responseShop?.status || '').trim().toLowerCase();
        if (responseShopStatus) {
          persistMerchantContext({
            shopId: responseShop?.id ? String(responseShop.id) : undefined,
            status: responseShopStatus,
          });
        } else {
          try {
            await syncMerchantContextFromBackend((response as any)?.user);
          } catch {
            const fallbackStatus = String(((response as any)?.user?.shop?.status) || '').trim().toLowerCase();
            if (fallbackStatus) {
              persistMerchantContext({
                shopId: (response as any)?.user?.shopId ? String((response as any)?.user?.shopId) : undefined,
                status: fallbackStatus,
              });
            }
          }
        }
      }

      const targetRoute = await resolvePostAuthDestination({
        role: normalizedRole,
        user: (response as any)?.user,
        returnTo,
        merchantStatus: (response as any)?.shop?.status,
      });

      navigate(targetRoute, { replace: true } as any);
    } catch (err: any) {
      setError(err.message || t('auth.signup.signupFailed'));
    } finally {
      setLoading(false);
    }
  };

  const goNext = () => {
    setError('');
    setDependencyError('');
    if (step === 'category') {
      if (!selectedCategoryId) {
        setError(isArabic ? 'يرجى اختيار فئة النشاط' : 'Please select a business category');
        return;
      }
      setStep('type');
      return;
    }
    if (step === 'type') {
      if (!selectedTypeId) {
        setError(isArabic ? 'يرجى اختيار نوع النشاط' : 'Please select a business type');
        return;
      }
      setStep(selectedType && selectedType.specialties.length > 0 ? 'specialty' : 'modules');
      return;
    }
    if (step === 'specialty') {
      setStep('modules');
      return;
    }
    if (step === 'modules') {
      setStep('data');
      return;
    }
    if (step === 'data') {
      submitSignup();
      return;
    }
  };

  const goBack = () => {
    setError('');
    setDependencyError('');
    if (step === 'type') setStep('category');
    else if (step === 'specialty') setStep('type');
    else if (step === 'modules') setStep(selectedType && selectedType.specialties.length > 0 ? 'specialty' : 'type');
    else if (step === 'data') setStep('modules');
  };

  const goHome = () => navigate('/');

  const steps: { key: Step; label: string; num: number }[] = [
    { key: 'category', label: isArabic ? 'الفئة' : 'Category', num: 1 },
    { key: 'type', label: isArabic ? 'النشاط' : 'Business Type', num: 2 },
    { key: 'modules', label: isArabic ? 'الوحدات' : 'Modules', num: 3 },
    { key: 'data', label: isArabic ? 'البيانات' : 'Your Info', num: 4 },
  ];

  const activeStepNum = steps.find((s) => s.key === step)?.num || 1;

  const filteredCategories = useMemo(() => {
    const raw = searchQuery.trim().toLowerCase();
    if (!raw) return BUSINESS_CATEGORIES;
    return BUSINESS_CATEGORIES.filter((c) =>
      c.title.toLowerCase().includes(raw) ||
      c.description.toLowerCase().includes(raw) ||
      (c.titleAr || '').toLowerCase().includes(raw) ||
      (c.descriptionAr || '').toLowerCase().includes(raw),
    );
  }, [searchQuery]);

  const filteredTypes = useMemo(() => {
    const raw = searchQuery.trim().toLowerCase();
    if (!raw) return availableTypes;
    return availableTypes.filter((type) =>
      type.title.toLowerCase().includes(raw) ||
      type.description.toLowerCase().includes(raw) ||
      (type.titleAr || '').toLowerCase().includes(raw) ||
      (type.descriptionAr || '').toLowerCase().includes(raw) ||
      type.specialties.some((s) => s.toLowerCase().includes(raw)),
    );
  }, [availableTypes, searchQuery]);

  const optionalModules = MODULE_DEFINITIONS.filter((m) => m.optional);

  return (
    <div
      className="min-h-screen bg-slate-50 flex flex-col"
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center">
              <Store className="w-5 h-5 text-[#00E5FF]" />
            </div>
            <div>
              <span className="font-black text-slate-900 text-sm">{isArabic ? 'إعداد النشاط' : 'Business Setup'}</span>
              <span className="text-slate-300 text-xs font-bold mx-2">/</span>
              <span className="text-slate-400 text-xs font-bold">
                {isArabic ? 'إعداد النشاط التجاري' : 'Enterprise Onboarding'}
              </span>
            </div>
          </div>
          <button
            onClick={goHome}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all text-xs font-bold"
          >
            <Home className="w-4 h-4" />
            <span>{isArabic ? 'الرئيسية' : 'Home'}</span>
          </button>
        </div>
      </header>

      {/* Stepper */}
      <div className="bg-white border-b border-slate-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center gap-2 flex-wrap">
            {steps.map((s, idx) => (
              <React.Fragment key={s.key}>
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black transition-all ${
                    activeStepNum === s.num
                      ? 'bg-slate-900 text-white'
                      : activeStepNum > s.num
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-50 text-slate-400'
                  }`}
                >
                  {activeStepNum > s.num ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
                      {s.num}
                    </span>
                  )}
                  <span>{s.label}</span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`w-6 h-px ${activeStepNum > s.num ? 'bg-emerald-300' : 'bg-slate-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
          <AnimatePresence mode="wait">
            {/* Step 1: Category */}
            {step === 'category' && (
              <MotionDiv
                key="category"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-8">
                  <h1 className="text-2xl md:text-3xl font-black text-slate-900 mb-2">
                    {isArabic ? 'اختر فئة نشاطك' : 'Choose Your Business Category'}
                  </h1>
                  <p className="text-slate-400 font-bold text-sm">
                    {isArabic ? 'حدد الفئة الأقرب لنشاطك للبدء' : 'Select the category closest to your business to get started'}
                  </p>
                </div>

                <div className="max-w-md mx-auto mb-8">
                  <div className="relative">
                    <Search className="absolute top-1/2 -translate-y-1/2 left-3 w-4 h-4 text-slate-300" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={isArabic ? 'بحث عن فئة...' : 'Search categories...'}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-100 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-300 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredCategories.map((cat) => {
                    const isSelected = selectedCategoryId === cat.id;
                    const IconComp = CATEGORY_ICON_MAP[cat.icon] || Store;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => selectCategory(cat)}
                        className={`group relative p-5 rounded-2xl border-2 text-left transition-all ${
                          isSelected
                            ? 'border-slate-900 bg-white shadow-lg'
                            : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-md'
                        }`}
                      >
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
                          style={{ backgroundColor: `${cat.color}15` }}
                        >
                          <IconComp className="w-6 h-6" style={{ color: cat.color }} />
                        </div>
                        <h3 className="font-black text-slate-900 text-sm mb-1">{isArabic ? (cat.titleAr || cat.title) : cat.title}</h3>
                        <p className="text-xs text-slate-400 font-bold leading-relaxed line-clamp-2">{isArabic ? (cat.descriptionAr || cat.description) : cat.description}</p>
                        {isSelected && (
                          <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </MotionDiv>
            )}

            {/* Step 2: Business Type */}
            {step === 'type' && (
              <MotionDiv
                key="type"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-8">
                  <h1 className="text-2xl md:text-3xl font-black text-slate-900 mb-2">
                    {isArabic ? 'اختر نوع نشاطك' : 'Select Your Business Type'}
                  </h1>
                  <p className="text-slate-400 font-bold text-sm">
                    {isArabic ? `ضمن فئة: ${selectedCategory?.titleAr || selectedCategory?.title}` : `Within: ${selectedCategory?.title}`}
                  </p>
                </div>

                <div className="max-w-md mx-auto mb-8">
                  <div className="relative">
                    <Search className="absolute top-1/2 -translate-y-1/2 left-3 w-4 h-4 text-slate-300" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={isArabic ? 'بحث عن نشاط...' : 'Search business types...'}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-100 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-300 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTypes.map((type) => {
                    const isSelected = selectedTypeId === type.id;
                    return (
                      <button
                        key={type.id}
                        onClick={() => selectType(type)}
                        className={`group relative p-5 rounded-2xl border-2 text-left transition-all ${
                          isSelected
                            ? 'border-slate-900 bg-white shadow-lg'
                            : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-md'
                        }`}
                      >
                        <h3 className="font-black text-slate-900 text-sm mb-1">{isArabic ? (type.titleAr || type.title) : type.title}</h3>
                        <p className="text-xs text-slate-400 font-bold leading-relaxed mb-3 line-clamp-2">{isArabic ? (type.descriptionAr || type.description) : type.description}</p>
                        {type.specialties.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {type.specialties.slice(0, 3).map((s) => (
                              <span key={s} className="px-2 py-0.5 rounded-md bg-slate-50 text-[10px] font-bold text-slate-400">
                                {isArabic ? (SPECIALTY_AR[s] || s) : s}
                              </span>
                            ))}
                            {type.specialties.length > 3 && (
                              <span className="px-2 py-0.5 rounded-md bg-slate-50 text-[10px] font-bold text-slate-300">
                                +{type.specialties.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                        {isSelected && (
                          <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </MotionDiv>
            )}

            {/* Step 2.5: Specialty */}
            {step === 'specialty' && selectedType && (
              <MotionDiv
                key="specialty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-8">
                  <h1 className="text-2xl md:text-3xl font-black text-slate-900 mb-2">
                    {isArabic ? 'حدد تخصصك' : 'Define Your Specialty'}
                  </h1>
                  <p className="text-slate-400 font-bold text-sm">
                    {isArabic ? `اختر التخصصات الأقرب لعملك ضمن: ${selectedType.titleAr || selectedType.title}` : `Select specialties closest to your business in: ${selectedType.title}`}
                  </p>
                </div>

                <div className="max-w-3xl mx-auto">
                  <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8">
                    <div className="flex flex-wrap gap-2 mb-6">
                      {selectedType.specialties.map((specialty) => {
                        const checked = selectedSpecialties.has(specialty);
                        return (
                          <button
                            key={specialty}
                            type="button"
                            onClick={() => toggleSpecialty(specialty)}
                            className={`px-4 py-2.5 rounded-xl text-xs font-black border transition-all ${
                              checked
                                ? 'bg-slate-900 border-slate-900 text-white'
                                : 'bg-white border-slate-100 text-slate-600 hover:border-slate-200'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              {checked && <CheckCircle2 className="w-3.5 h-3.5" />}
                              {isArabic ? (SPECIALTY_AR[specialty] || specialty) : specialty}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="border-t border-slate-50 pt-6">
                      <div className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">
                        {isArabic ? 'إضافة تخصص مخصص' : 'Add Custom Specialty'}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={customSpecialtyInput}
                          onChange={(e) => setCustomSpecialtyInput(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomSpecialty(); } }}
                          placeholder={isArabic ? 'اكتب تخصص مخصص...' : 'Type a custom specialty...'}
                          className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-300 transition-all"
                        />
                        <button
                          type="button"
                          onClick={addCustomSpecialty}
                          className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-black hover:bg-slate-800 transition-all flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          {isArabic ? 'إضافة' : 'Add'}
                        </button>
                      </div>
                      {Array.from(selectedSpecialties).filter((s) => !selectedType.specialties.includes(s)).map((s) => (
                        <div key={s} className="inline-flex items-center gap-2 mt-3 mr-2 px-3 py-1.5 rounded-lg bg-cyan-50 text-cyan-800 text-xs font-bold">
                          {s}
                          <button onClick={() => removeCustomSpecialty(s)} className="hover:text-cyan-600">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </MotionDiv>
            )}

            {/* Step 3: Modules */}
            {step === 'modules' && (
              <MotionDiv
                key="modules"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-8">
                  <h1 className="text-2xl md:text-3xl font-black text-slate-900 mb-2">
                    {isArabic ? 'تكوين الوحدات' : 'Configure Your Modules'}
                  </h1>
                  <p className="text-slate-400 font-bold text-sm">
                    {isArabic ? `وحدات موصى بها لـ: ${selectedType?.titleAr || selectedType?.title}` : `Recommended modules for: ${selectedType?.title}`}
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Modules List */}
                  <div className="lg:col-span-2 space-y-3">
                    {dependencyError && (
                      <div className={`flex items-start gap-3 p-4 rounded-xl border text-xs font-bold mb-3 ${
                        dependencyError.startsWith('Cannot disable') || dependencyError.startsWith('لا يمكن') || dependencyError.includes('Core module') || dependencyError.includes('أساسية')
                          ? 'bg-amber-50 border-amber-200 text-amber-800'
                          : 'bg-sky-50 border-sky-200 text-sky-700'
                      }`}>
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{dependencyError}</span>
                      </div>
                    )}

                    {optionalModules.map((mod) => {
                      const isEnabled = enabledModuleIds.includes(mod.id);
                      const priority = getRecPriority(mod.id);
                      const reason = getRecReason(mod.id);
                      const isExpanded = expandedModuleId === mod.id;
                      const IconComp = mod.icon;

                      const priorityBadge = priority === 'required'
                        ? { label: isArabic ? 'مطلوب' : 'Required', cls: 'bg-red-50 text-red-600' }
                        : priority === 'recommended'
                          ? { label: isArabic ? 'موصى به' : 'Recommended', cls: 'bg-emerald-50 text-emerald-600' }
                          : priority === 'optional'
                            ? { label: isArabic ? 'اختياري' : 'Optional', cls: 'bg-slate-50 text-slate-400' }
                            : null;

                      return (
                        <div
                          key={mod.id}
                          className={`rounded-2xl border-2 transition-all overflow-hidden ${
                            isEnabled
                              ? 'border-slate-200 bg-white'
                              : 'border-slate-100 bg-white/50'
                          }`}
                        >
                          <div className="p-4 flex items-start gap-4">
                            <button
                              onClick={() => handleToggleModule(mod.id)}
                              className={`relative w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                                isEnabled ? 'text-white' : 'bg-slate-50 text-slate-300 hover:bg-slate-100'
                              }`}
                              style={isEnabled ? { backgroundColor: mod.color } : {}}
                            >
                              <IconComp className="w-6 h-6" />
                              {isEnabled && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white border-2 flex items-center justify-center" style={{ borderColor: mod.color }}>
                                  <Check className="w-2.5 h-2.5" style={{ color: mod.color }} />
                                </div>
                              )}
                            </button>

                            <div
                              className="flex-1 min-w-0 cursor-pointer"
                              onClick={() => handleToggleModule(mod.id)}
                            >
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <h3 className={`font-black text-sm ${isEnabled ? 'text-slate-900' : 'text-slate-500'}`}>
                                  {isArabic ? (mod.nameAr || mod.name) : mod.name}
                                </h3>
                                {priorityBadge && (
                                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${priorityBadge.cls}`}>
                                    {priorityBadge.label}
                                  </span>
                                )}
                              </div>
                              <p className={`text-xs font-bold leading-relaxed mb-2 ${isEnabled ? 'text-slate-400' : 'text-slate-300'}`}>
                                {isArabic ? (mod.descriptionAr || mod.description) : mod.description}
                              </p>
                              {reason && (
                                <div className="flex items-start gap-1.5 text-[11px] text-slate-400 font-bold">
                                  <Info className="w-3 h-3 shrink-0 mt-0.5 text-slate-300" />
                                  <span>{reason}</span>
                                </div>
                              )}

                              {mod.dependencies.length > 0 && (
                                <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-300 font-bold">
                                  <span>{isArabic ? 'يعتمد على:' : 'Depends on:'}</span>
                                  {mod.dependencies.map((dep) => {
                                    const depMod = MODULE_MAP[dep];
                                    return depMod ? (
                                      <span key={dep} className={`px-1.5 py-0.5 rounded ${enabledModuleIds.includes(dep) ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                                        {isArabic ? (depMod.nameAr || depMod.name) : depMod.name}
                                      </span>
                                    ) : null;
                                  })}
                                </div>
                              )}
                            </div>

                            <button
                              onClick={() => setExpandedModuleId(isExpanded ? null : mod.id)}
                              className="p-2 rounded-lg hover:bg-slate-50 transition-all shrink-0"
                            >
                              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                            </button>
                          </div>

                          <AnimatePresence>
                            {isExpanded && (
                              <MotionDiv
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="px-4 pb-4 border-t border-slate-50 pt-3">
                                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                                    {isArabic ? 'الميزات' : 'Features'}
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {mod.features.map((feature) => {
                                      const featureEnabled = (moduleFeatures[mod.id] || []).includes(feature.id);
                                      return (
                                        <button
                                          key={feature.id}
                                          type="button"
                                          onClick={() => handleToggleFeature(mod.id, feature.id)}
                                          className={`flex items-center gap-2 p-2 rounded-lg transition-all text-right ${
                                            featureEnabled ? 'bg-emerald-50 text-emerald-900' : 'bg-slate-50 text-slate-400'
                                          }`}
                                        >
                                          <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                                            featureEnabled ? 'bg-emerald-100' : 'bg-slate-100'
                                          }`}>
                                            {featureEnabled && <Check className="w-2.5 h-2.5 text-emerald-600" />}
                                          </div>
                                          <span className="text-xs font-bold">
                                            {isArabic ? (feature.labelAr || feature.label) : feature.label}
                                          </span>
                                        </button>
                                      );
                                    })}
                                  </div>

                                  {mod.pages.length > 0 && (
                                    <>
                                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 mt-4">
                                        {isArabic ? 'الصفحات' : 'Pages'}
                                      </div>
                                      <div className="flex flex-wrap gap-2">
                                        {mod.pages.map((page) => (
                                          <span key={page.id} className="px-2.5 py-1 rounded-lg bg-slate-50 text-[11px] font-bold text-slate-500">
                                            {isArabic ? (PAGE_LABEL_AR[page.label] || page.label) : page.label}
                                          </span>
                                        ))}
                                      </div>
                                    </>
                                  )}
                                </div>
                              </MotionDiv>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>

                  {/* System Summary Sidebar */}
                  <div className="lg:sticky lg:top-24 self-start">
                    <SystemSummary enabledModuleIds={enabledModuleIds} />
                  </div>
                </div>
              </MotionDiv>
            )}

            {/* Step 4: Data */}
            {step === 'data' && (
              <MotionDiv
                key="data"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-8">
                  <h1 className="text-2xl md:text-3xl font-black text-slate-900 mb-2">
                    {isArabic ? 'بياناتك' : 'Your Information'}
                  </h1>
                  <p className="text-slate-400 font-bold text-sm">
                    {isArabic ? 'أدخل بياناتك وبيانات المتجر لإكمال الإعداد' : 'Enter your details to complete the setup'}
                  </p>
                </div>

                <div className="max-w-2xl mx-auto">
                  <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 space-y-5">
                    {/* Personal Info */}
                    <div>
                      <div className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">
                        {isArabic ? 'بيانات الحساب' : 'Account Details'}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          icon={<User className="w-4 h-4" />}
                          label={isArabic ? 'الاسم' : 'Full Name'}
                          value={formData.name}
                          onChange={(v) => setFormData({ ...formData, name: v })}
                          required
                        />
                        <FormField
                          icon={<Mail className="w-4 h-4" />}
                          label={isArabic ? 'البريد الإلكتروني' : 'Email'}
                          type="email"
                          value={formData.email}
                          onChange={(v) => setFormData({ ...formData, email: v })}
                          required
                        />
                        <FormField
                          icon={<Lock className="w-4 h-4" />}
                          label={isArabic ? 'كلمة المرور' : 'Password'}
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={(v) => setFormData({ ...formData, password: v })}
                          required
                          trailing={
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="text-slate-300 hover:text-slate-500"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          }
                        />
                        <FormField
                          icon={<Phone className="w-4 h-4" />}
                          label={isArabic ? 'رقم الهاتف' : 'Phone Number'}
                          type="tel"
                          value={formData.phone}
                          onChange={(v) => setFormData({ ...formData, phone: v })}
                          required
                        />
                      </div>
                    </div>

                    {/* Store Info */}
                    <div className="border-t border-slate-50 pt-5">
                      <div className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">
                        {isArabic ? 'بيانات المتجر' : 'Store Details'}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          icon={<Store className="w-4 h-4" />}
                          label={isArabic ? 'اسم المتجر' : 'Store Name'}
                          value={formData.shopName}
                          onChange={(v) => setFormData({ ...formData, shopName: v })}
                          required
                        />
                        <FormField
                          icon={<Phone className="w-4 h-4" />}
                          label={isArabic ? 'هاتف المتجر' : 'Store Phone'}
                          type="tel"
                          value={formData.shopPhone}
                          onChange={(v) => setFormData({ ...formData, shopPhone: v })}
                        />
                        <FormField
                          icon={<Store className="w-4 h-4" />}
                          label={isArabic ? 'العنوان' : 'Address'}
                          value={formData.address}
                          onChange={(v) => setFormData({ ...formData, address: v })}
                        />
                        <FormField
                          icon={<Store className="w-4 h-4" />}
                          label={isArabic ? 'ساعات العمل' : 'Working Hours'}
                          value={formData.workingHours}
                          onChange={(v) => setFormData({ ...formData, workingHours: v })}
                        />
                      </div>
                      <div className="mt-4">
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder={isArabic ? 'وصف المتجر...' : 'Store description...'}
                          rows={3}
                          className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-300 transition-all resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Summary Recap */}
                  <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span>{isArabic ? (selectedType?.titleAr || selectedType?.title) : selectedType?.title}</span>
                        <span className="text-slate-300">·</span>
                        <span>{summary.moduleCount} {isArabic ? 'وحدات' : 'modules'}</span>
                        <span className="text-slate-300">·</span>
                        <span>{summary.totalFeatures} {isArabic ? 'ميزات' : 'features'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </MotionDiv>
            )}
          </AnimatePresence>

          {/* Error */}
          {error && (
            <div className="max-w-2xl mx-auto mt-6 flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-bold">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Navigation */}
          <div className="max-w-2xl mx-auto mt-8 flex items-center justify-between">
            <button
              onClick={goBack}
              disabled={step === 'category'}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-black transition-all ${
                step === 'category'
                  ? 'bg-slate-50 text-slate-200 cursor-not-allowed'
                  : 'bg-white border border-slate-100 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{isArabic ? 'السابق' : 'Back'}</span>
            </button>

            <button
              onClick={goNext}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white text-sm font-black hover:bg-slate-800 transition-all shadow-lg disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isArabic ? 'جاري الإرسال...' : 'Submitting...'}</span>
                </>
              ) : step === 'data' ? (
                <>
                  <span>{isArabic ? 'إكمال الإعداد' : 'Complete Setup'}</span>
                  <Check className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>{isArabic ? 'التالي' : 'Continue'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const FormField: React.FC<{
  icon?: React.ReactNode;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  trailing?: React.ReactNode;
}> = ({ icon, label, value, onChange, type = 'text', required, trailing }) => (
  <div>
    <label className="block text-xs font-black text-slate-500 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {icon && (
        <div className="absolute top-1/2 -translate-y-1/2 left-3 text-slate-300">
          {icon}
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full ${icon ? 'pl-10' : 'pl-4'} ${trailing ? 'pr-10' : 'pr-4'} py-3 rounded-xl bg-slate-50 border border-slate-100 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-300 transition-all`}
      />
      {trailing && (
        <div className="absolute top-1/2 -translate-y-1/2 right-3">
          {trailing}
        </div>
      )}
    </div>
  </div>
);

export default MerchantOnboarding;
