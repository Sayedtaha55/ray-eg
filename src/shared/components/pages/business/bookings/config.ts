// ═══════════════════════════════════════════
// هذا الملف موحد - يدمج bookings/config.ts القديم مع
// clinic/bookingActivityConfig.ts
// ═══════════════════════════════════════════

// ============================================
// الأنواع
// ============================================
export type BookingActivityType =
  | 'clinic'          // عيادات
  | 'salon_barber'    // صالونات وحلاقة
  | 'wellness_spa'    // سبا وعناية
  | 'chalets_resorts' // شاليهات ومنتجعات
  | 'hotels_rooms'    // فنادق وغرف
  | 'restaurants_tables' // مطاعم وطاولات
  | 'events_venues'   // فعاليات وقاعات
  | 'vehicle_rental'  // تأجير سيارات
  | 'sports_trainers' // ملاعب ومدربين
  | 'education_courses' // دورات تعليمية
  | 'maintenance_services' // صيانة وزيارات
  | 'general_appointments'; // مواعيد عامة

// ============================================
// تعريف النشاط
// ============================================
export type BookingActivityDefinition = {
  id: BookingActivityType;
  title: string;
  description: string;
  folderName: string; // اسم الفولدر (clinic, salon, chalets, ...)
  primaryTabLabel: string;     // تبويب مقدمي الخدمة
  secondaryTabLabel: string;   // تبويب الخدمات
  extraButtons: string[];      // أزرار إضافية خاصة
};

export const BOOKING_ACTIVITIES: BookingActivityDefinition[] = [
  {
    id: 'clinic',
    title: 'عيادات',
    description: 'أطباء، تخصصات، كشف، عيادات فرعية، مواعيد وملفات مرضى.',
    folderName: 'clinic',
    primaryTabLabel: 'الأطباء والكادر',
    secondaryTabLabel: 'التخصصات والخدمات',
    extraButtons: ['غرف/عيادات فرعية', 'ملفات المرضى', 'مواعيد اليوم'],
  },
  {
    id: 'salon_barber',
    title: 'صالونات وحلاقة',
    description: 'خبراء، خدمات تجميل، كراسي عمل، وباقات العناية.',
    folderName: 'salon',
    primaryTabLabel: 'المصففين والخبراء',
    secondaryTabLabel: 'خدمات الصالون',
    extraButtons: ['الكراسي والغرف', 'باقات العناية', 'جدول المواعيد'],
  },
  {
    id: 'wellness_spa',
    title: 'سبا وعناية صحية',
    description: 'معالجون، جلسات، غرف، ومدد راحة.',
    folderName: 'spa',
    primaryTabLabel: 'المعالجون',
    secondaryTabLabel: 'الجلسات',
    extraButtons: ['غرف الجلسات', 'الباقات', 'جدول المعالجين'],
  },
  {
    id: 'chalets_resorts',
    title: 'شاليهات ومنتجعات',
    description: 'وحدات إقامة، أيام متاحة، مواسم وأسعار، مرافق، وسياسات دخول.',
    folderName: 'chalets',
    primaryTabLabel: 'الشاليهات والوحدات',
    secondaryTabLabel: 'المرافق والباقات',
    extraButtons: ['المواسم والأسعار', 'سياسات الدخول', 'التوافر'],
  },
  {
    id: 'hotels_rooms',
    title: 'فنادق وغرف إقامة',
    description: 'غرف، أجنحة، سعة، ليالي إقامة، ومرافق الفندقة.',
    folderName: 'hotels',
    primaryTabLabel: 'الغرف والأجنحة',
    secondaryTabLabel: 'المرافق والخدمات',
    extraButtons: ['التوافر الليلي', 'سياسات الوصول', 'قائمة المرافق'],
  },
  {
    id: 'restaurants_tables',
    title: 'مطاعم وحجز طاولات',
    description: 'طاولات، قاعات، مدد حجز، مناسبات، وطلبات خاصة.',
    folderName: 'restaurants',
    primaryTabLabel: 'الطاولات والقاعات',
    secondaryTabLabel: 'باقات الحجز',
    extraButtons: ['قواعد السعة', 'طلبات العملاء', 'جدول الحجوزات'],
  },
  {
    id: 'events_venues',
    title: 'فعاليات وقاعات',
    description: 'قاعات، مناسبات، تذاكر، سعات، وتجهيزات.',
    folderName: 'events',
    primaryTabLabel: 'القاعات/الفعاليات',
    secondaryTabLabel: 'الباقات والتجهيزات',
    extraButtons: ['التذاكر والسعات', 'جدول الفعاليات', 'التجهيزات'],
  },
  {
    id: 'vehicle_rental',
    title: 'تأجير سيارات ومركبات',
    description: 'سيارات، مدد تأجير، استلام وتسليم، وتأمين.',
    folderName: 'rental',
    primaryTabLabel: 'المركبات المتاحة',
    secondaryTabLabel: 'باقات التأجير',
    extraButtons: ['التأمين والشروط', 'مواقع الاستلام', 'العقود النشطة'],
  },
  {
    id: 'sports_trainers',
    title: 'ملاعب ومدربين',
    description: 'ملاعب، مدربين، حصص تدريب، وسعات.',
    folderName: 'sports',
    primaryTabLabel: 'الملاعب والمدربون',
    secondaryTabLabel: 'الحصص والباقات',
    extraButtons: ['قواعد السعة', 'اشتراكات التدريب', 'جدول الحصص'],
  },
  {
    id: 'education_courses',
    title: 'دورات وحصص تعليمية',
    description: 'مدرسون، كورسات، حصص، مستويات، ومواعيد.',
    folderName: 'education',
    primaryTabLabel: 'المدرسون/المحاضرون',
    secondaryTabLabel: 'الكورسات والحصص',
    extraButtons: ['المستويات', 'خطط الاشتراك', 'جدول المحاضرات'],
  },
  {
    id: 'maintenance_services',
    title: 'صيانة وزيارات منزلية',
    description: 'فنيون، زيارات، مناطق خدمة، ورسوم انتقال.',
    folderName: 'maintenance',
    primaryTabLabel: 'الفنيون والفرق',
    secondaryTabLabel: 'أنواع الزيارات',
    extraButtons: ['مناطق الخدمة', 'رسوم الانتقال', 'جدول الفنيين'],
  },
  {
    id: 'general_appointments',
    title: 'مواعيد عامة',
    description: 'استشارات وخدمات عامة بإعدادات مرنة.',
    folderName: 'general',
    primaryTabLabel: 'مقدمو الخدمة',
    secondaryTabLabel: 'أنواع الخدمة',
    extraButtons: ['الفروع/المواقع', 'قواعد المواعيد', 'الإعدادات'],
  },
];

// ============================================
// Helper functions
// ============================================
export const getBookingActivityById = (id?: unknown): BookingActivityDefinition | undefined => {
  const normalized = String(id || '').trim() as BookingActivityType;
  return BOOKING_ACTIVITIES.find((a) => a.id === normalized);
};

export const getBookingActivityByFolder = (folder?: unknown): BookingActivityDefinition | undefined => {
  const normalized = String(folder || '').trim().toLowerCase();
  return BOOKING_ACTIVITIES.find((a) => a.folderName === normalized);
};

export const getDefaultActivity = (): BookingActivityDefinition => BOOKING_ACTIVITIES[0]; // clinic

// ============================================
// الأزرار المشتركة بين جميع الأنشطة
// ============================================
export type BookingButton = {
  id: string;
  label: string;
  route: string;
  icon: string;
};

export const SHARED_BOOKING_BUTTONS: BookingButton[] = [
  { id: 'overview',   label: 'نظرة عامة',     route: 'overview',   icon: 'LayoutDashboard' },
  { id: 'bookings',   label: 'الحجوزات',      route: 'bookings',   icon: 'CalendarCheck' },
  { id: 'design',     label: 'التصميم',       route: 'design',     icon: 'Palette' },
  { id: 'settings',   label: 'الإعدادات',     route: 'settings',   icon: 'Settings' },
];

// ============================================
// الأزرار الخاصة بكل نشاط
// ============================================
export type ActivityModule = {
  id: string;
  label: string;
  icon: string;
  route: string;
  isExtra?: boolean;
};

export const ACTIVITY_MODULES: Record<BookingActivityType, ActivityModule[]> = {
  clinic: [
    { id: 'doctors', label: 'الأطباء والكادر',      icon: 'Stethoscope', route: 'doctors' },
    { id: 'services', label: 'التخصصات والخدمات',    icon: 'ListChecks',  route: 'services' },
    { id: 'rooms', label: 'غرف/عيادات فرعية',       icon: 'DoorOpen',    route: 'activity/rooms', isExtra: true },
    { id: 'patients', label: 'ملفات المرضى',         icon: 'FileText',    route: 'activity/patients', isExtra: true },
  ],
  salon_barber: [
    { id: 'experts', label: 'المصففين والخبراء',    icon: 'Users',       route: 'experts' },
    { id: 'services', label: 'خدمات الصالون',        icon: 'ListChecks',  route: 'services' },
    { id: 'chairs', label: 'الكراسي والغرف',        icon: 'Armchair',    route: 'activity/chairs', isExtra: true },
    { id: 'packages', label: 'باقات العناية',       icon: 'Sparkles',    route: 'activity/packages', isExtra: true },
  ],
  wellness_spa: [
    { id: 'therapists', label: 'المعالجون',          icon: 'Users',       route: 'therapists' },
    { id: 'services', label: 'الجلسات',              icon: 'ListChecks',  route: 'services' },
    { id: 'rooms', label: 'غرف الجلسات',            icon: 'DoorOpen',    route: 'activity/rooms', isExtra: true },
    { id: 'packages', label: 'الباقات',              icon: 'Sparkles',    route: 'activity/packages', isExtra: true },
  ],
  chalets_resorts: [
    { id: 'units', label: 'الشاليهات والوحدات',     icon: 'Building2',   route: 'units' },
    { id: 'services', label: 'المرافق والباقات',    icon: 'ListChecks',  route: 'services' },
    { id: 'seasons', label: 'المواسم والأسعار',     icon: 'CalendarDays', route: 'activity/seasons', isExtra: true },
    { id: 'policies', label: 'سياسات الدخول',       icon: 'ShieldAlert', route: 'activity/policies', isExtra: true },
  ],
  hotels_rooms: [
    { id: 'rooms', label: 'الغرف والأجنحة',         icon: 'Hotel',       route: 'rooms' },
    { id: 'services', label: 'المرافق والخدمات',    icon: 'ListChecks',  route: 'services' },
    { id: 'availability', label: 'التوافر الليلي',  icon: 'Moon',        route: 'activity/availability', isExtra: true },
    { id: 'rules', label: 'سياسات الوصول',          icon: 'ClipboardCheck', route: 'activity/rules', isExtra: true },
  ],
  restaurants_tables: [
    { id: 'tables', label: 'الطاولات والقاعات',     icon: 'UtensilsCrossed', route: 'tables' },
    { id: 'services', label: 'باقات الحجز',          icon: 'ListChecks',  route: 'services' },
    { id: 'capacity', label: 'قواعد السعة',          icon: 'Users',       route: 'activity/capacity', isExtra: true },
    { id: 'special', label: 'طلبات العملاء',         icon: 'MessageSquare', route: 'activity/special', isExtra: true },
  ],
  events_venues: [
    { id: 'venues', label: 'القاعات/الفعاليات',     icon: 'PartyPopper', route: 'venues' },
    { id: 'services', label: 'الباقات والتجهيزات',  icon: 'ListChecks',  route: 'services' },
    { id: 'tickets', label: 'التذاكر والسعات',      icon: 'Ticket',      route: 'activity/tickets', isExtra: true },
    { id: 'schedule', label: 'جدول الفعاليات',      icon: 'CalendarDays', route: 'activity/schedule', isExtra: true },
  ],
  vehicle_rental: [
    { id: 'vehicles', label: 'المركبات المتاحة',    icon: 'Car',         route: 'vehicles' },
    { id: 'services', label: 'باقات التأجير',       icon: 'ListChecks',  route: 'services' },
    { id: 'insurance', label: 'التأمين والشروط',    icon: 'ShieldCheck', route: 'activity/insurance', isExtra: true },
    { id: 'locations', label: 'مواقع الاستلام',     icon: 'MapPin',      route: 'activity/locations', isExtra: true },
  ],
  sports_trainers: [
    { id: 'coaches', label: 'الملاعب والمدربون',    icon: 'Dumbbell',    route: 'coaches' },
    { id: 'services', label: 'الحصص والباقات',      icon: 'ListChecks',  route: 'services' },
    { id: 'capacity', label: 'قواعد السعة',          icon: 'Users',       route: 'activity/capacity', isExtra: true },
    { id: 'subscriptions', label: 'اشتراكات التدريب', icon: 'CalendarHeart', route: 'activity/subscriptions', isExtra: true },
  ],
  education_courses: [
    { id: 'instructors', label: 'المدرسون/المحاضرون', icon: 'GraduationCap', route: 'instructors' },
    { id: 'services', label: 'الكورسات والحصص',      icon: 'ListChecks',  route: 'services' },
    { id: 'levels', label: 'المستويات',              icon: 'Sliders',     route: 'activity/levels', isExtra: true },
    { id: 'subscriptions', label: 'خطط الاشتراك',    icon: 'CreditCard',  route: 'activity/subscriptions', isExtra: true },
  ],
  maintenance_services: [
    { id: 'technicians', label: 'الفنيون والفرق',    icon: 'Wrench',      route: 'technicians' },
    { id: 'services', label: 'أنواع الزيارات',       icon: 'ListChecks',  route: 'services' },
    { id: 'zones', label: 'مناطق الخدمة',            icon: 'Map',         route: 'activity/zones', isExtra: true },
    { id: 'fees', label: 'رسوم الانتقال',            icon: 'Coins',       route: 'activity/fees', isExtra: true },
  ],
  general_appointments: [
    { id: 'providers', label: 'مقدمو الخدمة',        icon: 'UserSquare',  route: 'providers' },
    { id: 'services', label: 'أنواع الخدمة',          icon: 'ListChecks',  route: 'services' },
    { id: 'branches', label: 'الفروع/المواقع',       icon: 'Building',    route: 'activity/branches', isExtra: true },
    { id: 'rules', label: 'قواعد المواعيد',           icon: 'CalendarDays', route: 'activity/rules', isExtra: true },
  ],
};

// ============================================
// تجميع الأزرار حسب السياق
// ============================================
export const getActivitySpecificButtons = (activityType: BookingActivityType): BookingButton[] => {
  const modules = ACTIVITY_MODULES[activityType] || [];
  return modules.map((mod) => ({
    id: mod.id,
    label: mod.label,
    route: mod.route,
    icon: mod.icon,
  }));
};

export const getDashboardButtonsForContext = (
  activityType: BookingActivityType,
  context: 'sidebar' | 'overview' | 'all'
): BookingButton[] => {
  const shared = SHARED_BOOKING_BUTTONS;
  const specific = getActivitySpecificButtons(activityType);

  if (context === 'sidebar') {
    return [...shared.slice(0, 2), ...specific, ...shared.slice(2)];
  }
  if (context === 'overview') {
    return specific;
  }
  return [...shared, ...specific];
};

// ============================================
// المعجم اللغوي لكل نشاط
// ============================================
export type ActivityVocabulary = {
  customerSingular: string;
  customerPlural: string;
  providerSingular: string;
  providerPlural: string;
  serviceSingular: string;
  servicePlural: string;
  dashboardTitle: string;
  dashboardSubtitle: string;
  addProviderButton: string;
  providerLabel: string;
  providerTitleLabel: string;
  providerNextSlotLabel: string;
  providerImageLabel: string;
  providerImagePlaceholder: string;
  providerDefaultTitle: string;
  customerNamePlaceholder: string;
  customerEmailPlaceholder: string;
  defaultItemPrice: number;
};

export const VOCABULARY: Record<BookingActivityType, ActivityVocabulary> = {
  clinic: {
    customerSingular: 'مريض', customerPlural: 'المرضى',
    providerSingular: 'طبيب', providerPlural: 'الأطباء',
    serviceSingular: 'خدمة طبية', servicePlural: 'الخدمات الطبية',
    dashboardTitle: 'لوحة تحكم العيادات', dashboardSubtitle: 'تابع مواعيد الكشف، ملفات المرضى وأداء العيادة.',
    addProviderButton: 'إضافة طبيب/كادر جديد',
    providerLabel: 'الطبيب/الكادر', providerTitleLabel: 'التخصص', providerNextSlotLabel: 'أقرب موعد متاح',
    providerImageLabel: 'رابط صورة الطبيب (اختياري)', providerImagePlaceholder: 'https://example.com/doctor.jpg',
    providerDefaultTitle: 'طبيب مختص',
    customerNamePlaceholder: 'مثال: أحمد محمد', customerEmailPlaceholder: 'patient@gmail.com',
    defaultItemPrice: 300,
  },
  salon_barber: {
    customerSingular: 'عميل', customerPlural: 'العملاء',
    providerSingular: 'خبير/مصفف', providerPlural: 'المصففين والخبراء',
    serviceSingular: 'خدمة صالون', servicePlural: 'خدمات الصالون',
    dashboardTitle: 'لوحة تحكم الصالونات والحلاقة', dashboardSubtitle: 'تابع حجوزات الكراسي، المصففين وأداء الصالون اليوم.',
    addProviderButton: 'إضافة خبير/مصفف جديد',
    providerLabel: 'الخبير/المصفف', providerTitleLabel: 'المسمى والخبرة', providerNextSlotLabel: 'أقرب موعد متاح',
    providerImageLabel: 'رابط صورة الخبير (اختياري)', providerImagePlaceholder: 'https://example.com/stylist.jpg',
    providerDefaultTitle: 'خبير صالون',
    customerNamePlaceholder: 'مثال: سارة محمد', customerEmailPlaceholder: 'customer@gmail.com',
    defaultItemPrice: 250,
  },
  wellness_spa: {
    customerSingular: 'عميل', customerPlural: 'العملاء',
    providerSingular: 'معالج', providerPlural: 'المعالجين',
    serviceSingular: 'جلسة/باقة', servicePlural: 'جلسات العناية والسبا',
    dashboardTitle: 'لوحة تحكم السبا والعناية', dashboardSubtitle: 'تابع مواعيد الجلسات، غرف المساج وحالات الاسترخاء.',
    addProviderButton: 'إضافة معالج جديد',
    providerLabel: 'المعالج', providerTitleLabel: 'نوع الخبرة', providerNextSlotLabel: 'أقرب جلسة متاحة',
    providerImageLabel: 'رابط صورة المعالج (اختياري)', providerImagePlaceholder: 'https://example.com/therapist.jpg',
    providerDefaultTitle: 'معالج متخصص',
    customerNamePlaceholder: 'مثال: نور أحمد', customerEmailPlaceholder: 'guest@gmail.com',
    defaultItemPrice: 400,
  },
  chalets_resorts: {
    customerSingular: 'نزيل', customerPlural: 'النزلاء',
    providerSingular: 'شاليه/وحدة', providerPlural: 'الشاليهات والوحدات',
    serviceSingular: 'مرفق/باقة', servicePlural: 'المرافق والباقات',
    dashboardTitle: 'لوحة تحكم الشاليهات والمنتجعات', dashboardSubtitle: 'تابع حجوزات الوحدات، التوافر الموسمي والدخول اليومي.',
    addProviderButton: 'إضافة شاليه/وحدة جديدة',
    providerLabel: 'الشاليه/الوحدة', providerTitleLabel: 'نوع الوحدة', providerNextSlotLabel: 'أقرب تاريخ متاح',
    providerImageLabel: 'رابط صورة الشاليه (اختياري)', providerImagePlaceholder: 'https://example.com/unit.jpg',
    providerDefaultTitle: 'وحدة إقامة',
    customerNamePlaceholder: 'مثال: محمد خالد', customerEmailPlaceholder: 'guest@gmail.com',
    defaultItemPrice: 1200,
  },
  hotels_rooms: {
    customerSingular: 'نزيل', customerPlural: 'النزلاء',
    providerSingular: 'غرفة/جناح', providerPlural: 'الغرف والأجنحة',
    serviceSingular: 'مرفق/خدمة', servicePlural: 'المرافق والخدمات',
    dashboardTitle: 'لوحة تحكم الفنادق والغرف', dashboardSubtitle: 'تابع نزلاء الفندق، الغرف الشاغرة وعمليات الدخول والخروج.',
    addProviderButton: 'إضافة غرفة/جناح جديد',
    providerLabel: 'الغرفة/الجناح', providerTitleLabel: 'نوع الغرفة', providerNextSlotLabel: 'أقرب ليلة متاحة',
    providerImageLabel: 'رابط صورة الغرفة (اختياري)', providerImagePlaceholder: 'https://example.com/room.jpg',
    providerDefaultTitle: 'غرفة إقامة',
    customerNamePlaceholder: 'مثال: محمود علي', customerEmailPlaceholder: 'guest@gmail.com',
    defaultItemPrice: 900,
  },
  restaurants_tables: {
    customerSingular: 'عميل', customerPlural: 'العملاء',
    providerSingular: 'طاولة/صالة', providerPlural: 'الطاولات والقاعات',
    serviceSingular: 'باقة حجز', servicePlural: 'باقات الطاولات',
    dashboardTitle: 'لوحة تحكم حجز طاولات المطاعم', dashboardSubtitle: 'تابع إشغال الطاولات، الحفلات وطلبات الوجبات.',
    addProviderButton: 'إضافة طاولة/قاعة جديدة',
    providerLabel: 'الطاولة/القاعة', providerTitleLabel: 'نوع الطاولة', providerNextSlotLabel: 'أقرب وقت حجز',
    providerImageLabel: 'رابط صورة الطاولة (اختياري)', providerImagePlaceholder: 'https://example.com/table.jpg',
    providerDefaultTitle: 'مساحة حجز',
    customerNamePlaceholder: 'مثال: منى حسن', customerEmailPlaceholder: 'customer@gmail.com',
    defaultItemPrice: 150,
  },
  events_venues: {
    customerSingular: 'حاضر', customerPlural: 'الحاضرين',
    providerSingular: 'قاعة/فعالية', providerPlural: 'القاعات والفعاليات',
    serviceSingular: 'باقة تجهيز', servicePlural: 'باقات وتجهيزات الفعاليات',
    dashboardTitle: 'لوحة تحكم الفعاليات والقاعات', dashboardSubtitle: 'تابع مبيعات التذاكر، سعة الحضور وجدول الحفلات.',
    addProviderButton: 'إضافة قاعة/فعالية جديدة',
    providerLabel: 'القاعة/الفعالية', providerTitleLabel: 'نوع الفعالية', providerNextSlotLabel: 'أقرب موعد فعالية',
    providerImageLabel: 'رابط صورة القاعة (اختياري)', providerImagePlaceholder: 'https://example.com/event.jpg',
    providerDefaultTitle: 'فعالية/قاعة',
    customerNamePlaceholder: 'مثال: عمر سامي', customerEmailPlaceholder: 'attendee@gmail.com',
    defaultItemPrice: 500,
  },
  vehicle_rental: {
    customerSingular: 'مستأجر', customerPlural: 'المستأجرين',
    providerSingular: 'مركبة/سيارة', providerPlural: 'المركبات والسيارات',
    serviceSingular: 'باقة تأجير', servicePlural: 'باقات تأجير السيارات',
    dashboardTitle: 'لوحة تحكم تأجير السيارات', dashboardSubtitle: 'تابع عقود الإيجار، استلام وتسليم السيارات وحالة التأمين.',
    addProviderButton: 'إضافة مركبة/سيارة جديدة',
    providerLabel: 'المركبة/السيارة', providerTitleLabel: 'نوع المركبة', providerNextSlotLabel: 'أقرب موعد استلام',
    providerImageLabel: 'رابط صورة المركبة (اختياري)', providerImagePlaceholder: 'https://example.com/car.jpg',
    providerDefaultTitle: 'مركبة للإيجار',
    customerNamePlaceholder: 'مثال: كريم عادل', customerEmailPlaceholder: 'renter@gmail.com',
    defaultItemPrice: 700,
  },
  sports_trainers: {
    customerSingular: 'متدرب', customerPlural: 'المتدربين',
    providerSingular: 'ملعب/مدرب', providerPlural: 'الملاعب والمدربين',
    serviceSingular: 'حصة/باقة', servicePlural: 'حصص واشتراكات الملاعب',
    dashboardTitle: 'لوحة تحكم الملاعب والمدربين', dashboardSubtitle: 'تابع حجوزات الملاعب، جداول المدربين وحصص التدريب.',
    addProviderButton: 'إضافة ملعب/مدرب جديد',
    providerLabel: 'الملعب/المدرب', providerTitleLabel: 'نوع الملعب', providerNextSlotLabel: 'أقرب حصة متاحة',
    providerImageLabel: 'رابط صورة الملعب (اختياري)', providerImagePlaceholder: 'https://example.com/training.jpg',
    providerDefaultTitle: 'ملعب/مدرب',
    customerNamePlaceholder: 'مثال: يوسف أحمد', customerEmailPlaceholder: 'trainee@gmail.com',
    defaultItemPrice: 300,
  },
  education_courses: {
    customerSingular: 'طالب', customerPlural: 'الطلاب',
    providerSingular: 'معلم/محاضر', providerPlural: 'المعلمين والمحاضرين',
    serviceSingular: 'كورس/حصة', servicePlural: 'الكورسات والحصص التعليمية',
    dashboardTitle: 'لوحة تحكم الكورسات والدورات', dashboardSubtitle: 'تابع حضور الطلاب، فصول المحاضرات ومستويات التعليم.',
    addProviderButton: 'إضافة معلم/محاضر جديد',
    providerLabel: 'المعلم/المحاضر', providerTitleLabel: 'المادة', providerNextSlotLabel: 'أقرب حصة متاحة',
    providerImageLabel: 'رابط صورة المعلم (اختياري)', providerImagePlaceholder: 'https://example.com/instructor.jpg',
    providerDefaultTitle: 'معلم/محاضر',
    customerNamePlaceholder: 'مثال: ليلى محمود', customerEmailPlaceholder: 'student@gmail.com',
    defaultItemPrice: 250,
  },
  maintenance_services: {
    customerSingular: 'عميل', customerPlural: 'العملاء',
    providerSingular: 'فني/فريق', providerPlural: 'الفنيين وفرق الصيانة',
    serviceSingular: 'نوع زيارة', servicePlural: 'أنواع خدمات الصيانة',
    dashboardTitle: 'لوحة تحكم الصيانة والزيارات المنزلية', dashboardSubtitle: 'تابع زيارات الفنيين، طلبات الصيانة ورسوم الانتقال.',
    addProviderButton: 'إضافة فني/فريق جديد',
    providerLabel: 'الفني/الفريق', providerTitleLabel: 'التخصص', providerNextSlotLabel: 'أقرب زيارة متاحة',
    providerImageLabel: 'رابط صورة الفني (اختياري)', providerImagePlaceholder: 'https://example.com/technician.jpg',
    providerDefaultTitle: 'فني/فريق صيانة',
    customerNamePlaceholder: 'مثال: هند مصطفى', customerEmailPlaceholder: 'customer@gmail.com',
    defaultItemPrice: 200,
  },
  general_appointments: {
    customerSingular: 'عميل', customerPlural: 'العملاء',
    providerSingular: 'مقدم خدمة', providerPlural: 'مقدمي الخدمة',
    serviceSingular: 'نوع خدمة', servicePlural: 'أنواع الخدمات العامة',
    dashboardTitle: 'لوحة تحكم المواعيد والاستشارات', dashboardSubtitle: 'تابع مواعيد الاستشارات، فروع الخدمة وقواعد الحجز.',
    addProviderButton: 'إضافة مقدم خدمة جديد',
    providerLabel: 'مقدم الخدمة', providerTitleLabel: 'نوع الخبرة', providerNextSlotLabel: 'أقرب موعد متاح',
    providerImageLabel: 'رابط صورة مقدم الخدمة (اختياري)', providerImagePlaceholder: 'https://example.com/provider.jpg',
    providerDefaultTitle: 'مقدم خدمة',
    customerNamePlaceholder: 'مثال: أحمد سمير', customerEmailPlaceholder: 'customer@gmail.com',
    defaultItemPrice: 250,
  },
};

export const getVocabulary = (activityType: BookingActivityType): ActivityVocabulary =>
  VOCABULARY[activityType] || VOCABULARY.clinic;

// ═══════════════════════════════════════════
// الدوال المدمجة من clinic/bookingActivityConfig.ts القديم
// ═══════════════════════════════════════════

// خريطة النشاط -> route
export const BOOKING_ACTIVITY_ROUTE_MAP: Record<BookingActivityType, string> = {
  clinic: 'clinic',
  salon_barber: 'salon',
  wellness_spa: 'spa',
  chalets_resorts: 'chalets',
  hotels_rooms: 'hotels',
  restaurants_tables: 'restaurants',
  events_venues: 'events',
  vehicle_rental: 'rental',
  sports_trainers: 'sports',
  education_courses: 'education',
  maintenance_services: 'maintenance',
  general_appointments: 'appointments',
};

// خريطة route -> النشاط
export const BOOKING_ROUTE_ACTIVITY_MAP: Record<string, BookingActivityType> = Object.entries(BOOKING_ACTIVITY_ROUTE_MAP)
  .reduce((acc, [activityType, route]) => {
    acc[route] = activityType as BookingActivityType;
    return acc;
  }, {} as Record<string, BookingActivityType>);

// دوال مساعدة
export const getBookingRouteFromActivityType = (raw?: unknown): string => {
  const id = String(raw || '').trim() as BookingActivityType;
  const activity = BOOKING_ACTIVITIES.find((a) => a.id === id);
  return BOOKING_ACTIVITY_ROUTE_MAP[activity?.id || 'clinic'] || 'clinic';
};

export const getBookingActivityDefinition = (raw?: unknown): BookingActivityDefinition => {
  const id = String(raw || '').trim() as BookingActivityType;
  return BOOKING_ACTIVITIES.find((activity) => activity.id === id) || BOOKING_ACTIVITIES[0];
};

export const isBookingActivityRoute = (pathSegment?: unknown): boolean => {
  const normalized = String(pathSegment || '').trim().toLowerCase();
  return Boolean(BOOKING_ROUTE_ACTIVITY_MAP[normalized]);
};

export const getBookingActivityTypeFromPath = (pathSegment: string): BookingActivityType => {
  const normalized = String(pathSegment || '').trim().toLowerCase();
  return BOOKING_ROUTE_ACTIVITY_MAP[normalized] || 'clinic';
};

export const getBookingActivityTypeFromParam = (param: string): BookingActivityType => {
  const normalized = String(param || '').trim().toLowerCase();
  const map: Record<string, BookingActivityType> = {
    'clinic': 'clinic', 'clinics': 'clinic',
    'salon': 'salon_barber', 'salons': 'salon_barber',
    'spa': 'wellness_spa', 'wellness': 'wellness_spa',
    'chalets': 'chalets_resorts', 'chalet': 'chalets_resorts',
    'hotels': 'hotels_rooms', 'hotel': 'hotels_rooms',
    'restaurants': 'restaurants_tables', 'restaurant': 'restaurants_tables',
    'events': 'events_venues', 'event': 'events_venues',
    'rental': 'vehicle_rental',
    'sports': 'sports_trainers', 'sport': 'sports_trainers',
    'education': 'education_courses', 'courses': 'education_courses',
    'maintenance': 'maintenance_services',
    'appointments': 'general_appointments',
  };
  return map[normalized] || 'clinic';
};

// الأزرار المشتركة للـ BusinessLayout
export type SharedDashboardButton = {
  id: string;
  label: string;
  route: string;
  icon: string;
};

export const SHARED_DASHBOARD_BUTTONS: SharedDashboardButton[] = [
  { id: 'overview', label: 'نظرة عامة', route: 'overview', icon: 'LayoutDashboard' },
  { id: 'bookings', label: 'الحجوزات', route: 'bookings', icon: 'CalendarCheck' },
  { id: 'design', label: 'التصميم', route: 'design', icon: 'Palette' },
  { id: 'settings', label: 'الإعدادات', route: 'settings', icon: 'Settings' },
];

export const BOOKING_SETTINGS_PAGE_BUTTONS = [
  { id: 'booking-site', label: 'الموقع العام للحجوزات' },
  { id: 'booking-security', label: 'الأمان والصلاحيات' },
  { id: 'booking-notifications', label: 'إشعارات وتأكيدات' },
  { id: 'booking-payments', label: 'مدفوعات وتأمين' },
  { id: 'booking-cancellation', label: 'سياسات الإلغاء' },
  { id: 'booking-privacy', label: 'الخصوصية وبيانات العملاء' },
];

export const getBookingActivityExtraPageId = (label: string, index = 0): string => {
  const normalized = String(label || '')
    .trim()
    .replace(/[ً-ٰٟ]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
  return normalized || `extra-${index + 1}`;
};

// getBookingActivityScopedList - ترجع قائمة providers/services من pageDesign
export const getBookingActivityScopedList = (
  pageDesign: any,
  activityType: BookingActivityType,
  scope: 'providers' | 'services'
): any[] => {
  const activityData = pageDesign?.bookingActivityData?.[activityType];
  if (!activityData) return [];
  if (scope === 'providers') return activityData.providers || [];
  return activityData.services || [];
};

// اسم مستعار للتوافق مع الاستيرادات القديمة
export const BOOKING_ACTIVITY_DEFINITIONS = BOOKING_ACTIVITIES;
