export type BookingActivityType =
  | 'clinic_hospital'
  | 'salon_barber'
  | 'wellness_spa'
  | 'chalets_resorts'
  | 'hotels_rooms'
  | 'restaurants_tables'
  | 'events_venues'
  | 'vehicle_rental'
  | 'sports_trainers'
  | 'education_courses'
  | 'maintenance_services'
  | 'general_appointments';

export type BookingActivityDefinition = {
  id: BookingActivityType;
  title: string;
  description: string;
  primaryTabLabel: string;
  secondaryTabLabel: string;
  extraButtons: string[];
};

export const BOOKING_ACTIVITY_DEFINITIONS: BookingActivityDefinition[] = [
  {
    id: 'clinic_hospital',
    title: 'عيادات ومستشفيات',
    description: 'أطباء، تخصصات، مواعيد، متابعة حالات المرضى، ورسائل تأكيد طبية.',
    primaryTabLabel: 'الأطباء والكادر',
    secondaryTabLabel: 'التخصصات والخدمات',
    extraButtons: ['غرف/عيادات فرعية', 'ملفات المرضى'],
  },
  {
    id: 'salon_barber',
    title: 'صالونات وحلاقة',
    description: 'خبراء، خدمات تجميل، مدة الجلسة، كراسي العمل، وباقات العناية.',
    primaryTabLabel: 'المصففين والخبراء',
    secondaryTabLabel: 'خدمات الصالون',
    extraButtons: ['الكراسي والغرف', 'باقات العناية'],
  },
  {
    id: 'wellness_spa',
    title: 'سبا وعناية صحية',
    description: 'معالجون، جلسات، غرف، مدد راحة بين الحجوزات، وتجارب استرخاء.',
    primaryTabLabel: 'المعالجون',
    secondaryTabLabel: 'الجلسات',
    extraButtons: ['غرف الجلسات', 'الباقات'],
  },
  {
    id: 'chalets_resorts',
    title: 'شاليهات ومنتجعات',
    description: 'وحدات إقامة، أيام متاحة، مواسم وأسعار، مرافق، وتأمين/سياسات دخول.',
    primaryTabLabel: 'الشاليهات والوحدات',
    secondaryTabLabel: 'المرافق والباقات',
    extraButtons: ['المواسم والأسعار', 'سياسات الدخول والتأمين'],
  },
  {
    id: 'hotels_rooms',
    title: 'فنادق وغرف إقامة',
    description: 'غرف، أجنحة، سعة، ليالي إقامة، مرافق الفندق، وسياسات تسجيل الوصول.',
    primaryTabLabel: 'الغرف والأجنحة',
    secondaryTabLabel: 'المرافق والخدمات',
    extraButtons: ['التوافر الليلي', 'سياسات الوصول والمغادرة'],
  },
  {
    id: 'restaurants_tables',
    title: 'مطاعم وحجز طاولات',
    description: 'طاولات، قاعات، مدد حجز، مناسبات، وطلبات خاصة قبل الوصول.',
    primaryTabLabel: 'الطاولات والقاعات',
    secondaryTabLabel: 'باقات الحجز',
    extraButtons: ['قواعد السعة', 'طلبات العملاء الخاصة'],
  },
  {
    id: 'events_venues',
    title: 'فعاليات وقاعات',
    description: 'قاعات، مناسبات، تذاكر، سعات، تجهيزات، وتواريخ متاحة.',
    primaryTabLabel: 'القاعات/الفعاليات',
    secondaryTabLabel: 'الباقات والتجهيزات',
    extraButtons: ['التذاكر والسعات', 'جدول الفعاليات'],
  },
  {
    id: 'vehicle_rental',
    title: 'تأجير سيارات ومركبات',
    description: 'سيارات، مدد تأجير، مواعيد استلام وتسليم، تأمين، وشروط السائق.',
    primaryTabLabel: 'المركبات المتاحة',
    secondaryTabLabel: 'باقات التأجير',
    extraButtons: ['التأمين والشروط', 'مواقع الاستلام'],
  },
  {
    id: 'sports_trainers',
    title: 'ملاعب ومدربين',
    description: 'ملاعب، مدربين، حصص تدريب، سعات، ومواعيد ثابتة أو مرنة.',
    primaryTabLabel: 'الملاعب والمدربون',
    secondaryTabLabel: 'الحصص والباقات',
    extraButtons: ['قواعد السعة', 'اشتراكات التدريب'],
  },
  {
    id: 'education_courses',
    title: 'دورات وحصص تعليمية',
    description: 'مدرسون، كورسات، حصص، مستويات، ومواعيد جماعية أو فردية.',
    primaryTabLabel: 'المدرسون/المحاضرون',
    secondaryTabLabel: 'الكورسات والحصص',
    extraButtons: ['المستويات', 'خطط الاشتراك'],
  },
  {
    id: 'maintenance_services',
    title: 'صيانة وزيارات منزلية',
    description: 'فنيون، زيارات، مناطق خدمة، مدد تقديرية، ورسوم كشف/انتقال.',
    primaryTabLabel: 'الفنيون والفرق',
    secondaryTabLabel: 'أنواع الزيارات',
    extraButtons: ['مناطق الخدمة', 'رسوم الانتقال'],
  },
  {
    id: 'general_appointments',
    title: 'مواعيد عامة',
    description: 'استشارات وخدمات عامة بإعدادات مرنة بدون بيانات وهمية مسبقة.',
    primaryTabLabel: 'مقدمو الخدمة',
    secondaryTabLabel: 'أنواع الخدمة',
    extraButtons: ['الفروع/المواقع', 'قواعد المواعيد'],
  },
];


export const BOOKING_ACTIVITY_ROUTE_MAP: Record<BookingActivityType, string> = {
  clinic_hospital: 'clinic',
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

export const BOOKING_ROUTE_ACTIVITY_MAP: Record<string, BookingActivityType> = Object.entries(BOOKING_ACTIVITY_ROUTE_MAP)
  .reduce((acc, [activityType, route]) => {
    acc[route] = activityType as BookingActivityType;
    return acc;
  }, {} as Record<string, BookingActivityType>);

export const getBookingRouteFromActivityType = (raw?: unknown): string => {
  const definition = getBookingActivityDefinition(raw);
  return BOOKING_ACTIVITY_ROUTE_MAP[definition.id] || 'clinic';
};

export const isBookingActivityRoute = (pathSegment?: unknown): boolean => {
  const normalized = String(pathSegment || '').trim().toLowerCase();
  return Boolean(BOOKING_ROUTE_ACTIVITY_MAP[normalized]);
};

export const getBookingActivityDefinition = (raw?: unknown): BookingActivityDefinition => {
  const id = String(raw || '').trim() as BookingActivityType;
  return BOOKING_ACTIVITY_DEFINITIONS.find((activity) => activity.id === id) || BOOKING_ACTIVITY_DEFINITIONS[0];
};

export const getBookingPrivateButtons = (raw?: unknown): string[] => {
  const definition = getBookingActivityDefinition(raw);
  return [definition.primaryTabLabel, definition.secondaryTabLabel, ...definition.extraButtons];
};



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

export const getBookingActivityTypeFromPath = (pathSegment: string): BookingActivityType => {
  const normalized = String(pathSegment || '').trim().toLowerCase();
  return BOOKING_ROUTE_ACTIVITY_MAP[normalized] || 'clinic_hospital';
};

export const getBookingActivityVocabulary = (pathSegment: string): ActivityVocabulary => {
  const type = getBookingActivityTypeFromPath(pathSegment);

  const vocabs: Record<BookingActivityType, ActivityVocabulary> = {
    clinic_hospital: {
      customerSingular: 'مريض',
      customerPlural: 'المرضى',
      providerSingular: 'طبيب',
      providerPlural: 'الأطباء',
      serviceSingular: 'تخصص/عيادة فرعية',
      servicePlural: 'التخصصات والعيادات الفرعية',
      dashboardTitle: 'لوحة تحكم العيادات والمستشفيات',
      dashboardSubtitle: 'تابع كشوفات اليوم، الأطباء والمواعيد الطبية بسرعة.',
      addProviderButton: 'إضافة طبيب جديد',
      providerLabel: 'الطبيب المعالج',
      providerTitleLabel: 'المسمى الطبي والتخصص',
      providerNextSlotLabel: 'ساعة أقرب كشف متاح',
      providerImageLabel: 'رابط صورة الطبيب (اختياري)',
      providerImagePlaceholder: 'https://example.com/doctor.jpg',
      providerDefaultTitle: 'طبيب متخصص',
      customerNamePlaceholder: 'مثال: أحمد عبد الله حسين',
      customerEmailPlaceholder: 'patient@gmail.com',
      defaultItemPrice: 300,
    },
    salon_barber: {
      customerSingular: 'عميل',
      customerPlural: 'العملاء',
      providerSingular: 'خبير/مصفف',
      providerPlural: 'المصففين والخبراء',
      serviceSingular: 'خدمة صالون',
      servicePlural: 'خدمات الصالون',
      dashboardTitle: 'لوحة تحكم الصالونات والحلاقة',
      dashboardSubtitle: 'تابع حجوزات الكراسي، المصففين وأداء الصالون اليوم.',
      addProviderButton: 'إضافة خبير/مصفف جديد',
      providerLabel: 'الخبير/المصفف',
      providerTitleLabel: 'المسمى والخبرة',
      providerNextSlotLabel: 'أقرب موعد متاح',
      providerImageLabel: 'رابط صورة الخبير/المصفف (اختياري)',
      providerImagePlaceholder: 'https://example.com/stylist.jpg',
      providerDefaultTitle: 'خبير صالون',
      customerNamePlaceholder: 'مثال: سارة محمد',
      customerEmailPlaceholder: 'customer@gmail.com',
      defaultItemPrice: 250,
    },
    wellness_spa: {
      customerSingular: 'عميل',
      customerPlural: 'العملاء',
      providerSingular: 'معالج',
      providerPlural: 'المعالجين والخبراء',
      serviceSingular: 'جلسة/باقة',
      servicePlural: 'جلسات العناية والسبا',
      dashboardTitle: 'لوحة تحكم السبا والعناية الصحية',
      dashboardSubtitle: 'تابع مواعيد الجلسات، غرف المساج وحالات الاسترخاء.',
      addProviderButton: 'إضافة معالج جديد',
      providerLabel: 'المعالج المختص',
      providerTitleLabel: 'نوع الخبرة أو العلاج',
      providerNextSlotLabel: 'أقرب جلسة متاحة',
      providerImageLabel: 'رابط صورة المعالج (اختياري)',
      providerImagePlaceholder: 'https://example.com/therapist.jpg',
      providerDefaultTitle: 'معالج متخصص',
      customerNamePlaceholder: 'مثال: نور أحمد',
      customerEmailPlaceholder: 'guest@gmail.com',
      defaultItemPrice: 400,
    },
    chalets_resorts: {
      customerSingular: 'نزيل',
      customerPlural: 'النزلاء',
      providerSingular: 'شاليه/وحدة',
      providerPlural: 'الشاليهات والوحدات',
      serviceSingular: 'مرفق/باقة',
      servicePlural: 'المرافق والباقات',
      dashboardTitle: 'لوحة تحكم الشاليهات والمنتجعات',
      dashboardSubtitle: 'تابع حجوزات الوحدات، التوافر الموسمي والدخول اليومي.',
      addProviderButton: 'إضافة شاليه/وحدة جديدة',
      providerLabel: 'الشاليه/الوحدة',
      providerTitleLabel: 'نوع الوحدة أو الإطلالة',
      providerNextSlotLabel: 'أقرب تاريخ متاح',
      providerImageLabel: 'رابط صورة الشاليه/الوحدة (اختياري)',
      providerImagePlaceholder: 'https://example.com/unit.jpg',
      providerDefaultTitle: 'وحدة إقامة',
      customerNamePlaceholder: 'مثال: محمد خالد',
      customerEmailPlaceholder: 'guest@gmail.com',
      defaultItemPrice: 1200,
    },
    hotels_rooms: {
      customerSingular: 'نزيل',
      customerPlural: 'النزلاء',
      providerSingular: 'غرفة/جناح',
      providerPlural: 'الغرف والأجنحة',
      serviceSingular: 'مرفق/خدمة',
      servicePlural: 'المرافق والخدمات',
      dashboardTitle: 'لوحة تحكم الفنادق والغرف',
      dashboardSubtitle: 'تابع نزلاء الفندق، الغرف الشاغرة وعمليات الدخول والخروج.',
      addProviderButton: 'إضافة غرفة/جناح جديد',
      providerLabel: 'الغرفة/الجناح',
      providerTitleLabel: 'نوع الغرفة أو الجناح',
      providerNextSlotLabel: 'أقرب ليلة متاحة',
      providerImageLabel: 'رابط صورة الغرفة/الجناح (اختياري)',
      providerImagePlaceholder: 'https://example.com/room.jpg',
      providerDefaultTitle: 'غرفة إقامة',
      customerNamePlaceholder: 'مثال: محمود علي',
      customerEmailPlaceholder: 'guest@gmail.com',
      defaultItemPrice: 900,
    },
    restaurants_tables: {
      customerSingular: 'عميل',
      customerPlural: 'العملاء',
      providerSingular: 'طاولة/صالة',
      providerPlural: 'الطاولات والقاعات',
      serviceSingular: 'باقة حجز',
      servicePlural: 'باقات الطاولات',
      dashboardTitle: 'لوحة تحكم حجز طاولات المطاعم',
      dashboardSubtitle: 'تابع إشغال الطاولات، الحفلات وطلبات الوجبات الخاصة.',
      addProviderButton: 'إضافة طاولة/قاعة جديدة',
      providerLabel: 'الطاولة/القاعة',
      providerTitleLabel: 'نوع الطاولة أو القاعة',
      providerNextSlotLabel: 'أقرب وقت حجز متاح',
      providerImageLabel: 'رابط صورة الطاولة/القاعة (اختياري)',
      providerImagePlaceholder: 'https://example.com/table.jpg',
      providerDefaultTitle: 'مساحة حجز',
      customerNamePlaceholder: 'مثال: منى حسن',
      customerEmailPlaceholder: 'customer@gmail.com',
      defaultItemPrice: 150,
    },
    events_venues: {
      customerSingular: 'حاضر',
      customerPlural: 'الحاضرين',
      providerSingular: 'قاعة/فعالية',
      providerPlural: 'القاعات والفعاليات',
      serviceSingular: 'باقة تجهيز',
      servicePlural: 'باقات وتجهيزات الفعاليات',
      dashboardTitle: 'لوحة تحكم الفعاليات والقاعات',
      dashboardSubtitle: 'تابع مبيعات التذاكر، سعة الحضور وجدول حفلات القاعات.',
      addProviderButton: 'إضافة قاعة/فعالية جديدة',
      providerLabel: 'القاعة/الفعالية',
      providerTitleLabel: 'نوع الفعالية أو القاعة',
      providerNextSlotLabel: 'أقرب موعد فعالية',
      providerImageLabel: 'رابط صورة القاعة/الفعالية (اختياري)',
      providerImagePlaceholder: 'https://example.com/event.jpg',
      providerDefaultTitle: 'فعالية/قاعة',
      customerNamePlaceholder: 'مثال: عمر سامي',
      customerEmailPlaceholder: 'attendee@gmail.com',
      defaultItemPrice: 500,
    },
    vehicle_rental: {
      customerSingular: 'مستأجر',
      customerPlural: 'المستأجرين',
      providerSingular: 'مركبة/سيارة',
      providerPlural: 'المركبات والسيارات',
      serviceSingular: 'باقة تأجير',
      servicePlural: 'باقات تأجير السيارات',
      dashboardTitle: 'لوحة تحكم تأجير السيارات والمركبات',
      dashboardSubtitle: 'تابع عقود الإيجار، استلام وتسليم السيارات وحالة التأمين.',
      addProviderButton: 'إضافة مركبة/سيارة جديدة',
      providerLabel: 'المركبة/السيارة',
      providerTitleLabel: 'نوع المركبة وفئتها',
      providerNextSlotLabel: 'أقرب موعد استلام',
      providerImageLabel: 'رابط صورة المركبة (اختياري)',
      providerImagePlaceholder: 'https://example.com/car.jpg',
      providerDefaultTitle: 'مركبة للإيجار',
      customerNamePlaceholder: 'مثال: كريم عادل',
      customerEmailPlaceholder: 'renter@gmail.com',
      defaultItemPrice: 700,
    },
    sports_trainers: {
      customerSingular: 'متدرب',
      customerPlural: 'المتدربين',
      providerSingular: 'ملعب/مدرب',
      providerPlural: 'الملاعب والمدربين',
      serviceSingular: 'حصة/باقة',
      servicePlural: 'حصص واشتراكات الملاعب',
      dashboardTitle: 'لوحة تحكم الملاعب والمدربين',
      dashboardSubtitle: 'تابع حجوزات الملاعب، جداول المدربين وحصص التدريب.',
      addProviderButton: 'إضافة ملعب/مدرب جديد',
      providerLabel: 'الملعب/المدرب',
      providerTitleLabel: 'نوع الملعب أو خبرة المدرب',
      providerNextSlotLabel: 'أقرب حصة متاحة',
      providerImageLabel: 'رابط صورة الملعب/المدرب (اختياري)',
      providerImagePlaceholder: 'https://example.com/training.jpg',
      providerDefaultTitle: 'ملعب/مدرب',
      customerNamePlaceholder: 'مثال: يوسف أحمد',
      customerEmailPlaceholder: 'trainee@gmail.com',
      defaultItemPrice: 300,
    },
    education_courses: {
      customerSingular: 'طالب',
      customerPlural: 'الطلاب',
      providerSingular: 'معلم/محاضر',
      providerPlural: 'المعلمين والمحاضرين',
      serviceSingular: 'كورس/حصة',
      servicePlural: 'الكورسات والحصص التعليمية',
      dashboardTitle: 'لوحة تحكم الكورسات والدورات',
      dashboardSubtitle: 'تابع حضور الطلاب، فصول المحاضرات ومستويات التعليم.',
      addProviderButton: 'إضافة معلم/محاضر جديد',
      providerLabel: 'المعلم/المحاضر',
      providerTitleLabel: 'المادة أو الخبرة التعليمية',
      providerNextSlotLabel: 'أقرب حصة متاحة',
      providerImageLabel: 'رابط صورة المعلم/المحاضر (اختياري)',
      providerImagePlaceholder: 'https://example.com/instructor.jpg',
      providerDefaultTitle: 'معلم/محاضر',
      customerNamePlaceholder: 'مثال: ليلى محمود',
      customerEmailPlaceholder: 'student@gmail.com',
      defaultItemPrice: 250,
    },
    maintenance_services: {
      customerSingular: 'عميل',
      customerPlural: 'العملاء',
      providerSingular: 'فني/فريق',
      providerPlural: 'الفنيين وفرق الصيانة',
      serviceSingular: 'نوع زيارة',
      servicePlural: 'أنواع خدمات الصيانة',
      dashboardTitle: 'لوحة تحكم الصيانة والزيارات المنزلية',
      dashboardSubtitle: 'تابع زيارات الفنيين، طلبات الصيانة ورسوم الانتقال الكشف.',
      addProviderButton: 'إضافة فني/فريق جديد',
      providerLabel: 'الفني/الفريق',
      providerTitleLabel: 'التخصص أو نوع الفريق',
      providerNextSlotLabel: 'أقرب زيارة متاحة',
      providerImageLabel: 'رابط صورة الفني/الفريق (اختياري)',
      providerImagePlaceholder: 'https://example.com/technician.jpg',
      providerDefaultTitle: 'فني/فريق صيانة',
      customerNamePlaceholder: 'مثال: هند مصطفى',
      customerEmailPlaceholder: 'customer@gmail.com',
      defaultItemPrice: 200,
    },
    general_appointments: {
      customerSingular: 'عميل',
      customerPlural: 'العملاء',
      providerSingular: 'مقدم خدمة',
      providerPlural: 'مقدمي الخدمة والخبراء',
      serviceSingular: 'نوع خدمة',
      servicePlural: 'أنواع الخدمات العامة',
      dashboardTitle: 'لوحة تحكم المواعيد والاستشارات',
      dashboardSubtitle: 'تابع مواعيد الاستشارات، فروع الخدمة وقواعد الحجز.',
      addProviderButton: 'إضافة مقدم خدمة جديد',
      providerLabel: 'مقدم الخدمة',
      providerTitleLabel: 'نوع الخبرة أو الخدمة',
      providerNextSlotLabel: 'أقرب موعد متاح',
      providerImageLabel: 'رابط صورة مقدم الخدمة (اختياري)',
      providerImagePlaceholder: 'https://example.com/provider.jpg',
      providerDefaultTitle: 'مقدم خدمة',
      customerNamePlaceholder: 'مثال: أحمد سمير',
      customerEmailPlaceholder: 'customer@gmail.com',
      defaultItemPrice: 250,
    },
  };

  return vocabs[type] || vocabs.clinic_hospital;
};


export const getBookingActivityScopedList = (
  pageDesign: any,
  activityType: BookingActivityType,
  listKey: 'providers' | 'services',
): any[] => {
  const activityData = pageDesign?.bookingActivityData?.[activityType];
  if (Array.isArray(activityData?.[listKey])) return activityData[listKey];

  if (activityType === 'clinic_hospital') {
    if (listKey === 'providers' && Array.isArray(pageDesign?.clinicDoctorsList)) return pageDesign.clinicDoctorsList;
    if (listKey === 'services' && Array.isArray(pageDesign?.clinicSpecialtiesList)) return pageDesign.clinicSpecialtiesList;
  }

  return [];
};

export const withBookingActivityScopedList = (
  pageDesign: any,
  activityType: BookingActivityType,
  listKey: 'providers' | 'services',
  nextList: any[],
) => {
  const nextPageDesign = {
    ...(pageDesign || {}),
    bookingActivityType: activityType,
    bookingActivityData: {
      ...((pageDesign || {}).bookingActivityData || {}),
      [activityType]: {
        ...(((pageDesign || {}).bookingActivityData || {})[activityType] || {}),
        [listKey]: nextList,
      },
    },
  };

  if (activityType === 'clinic_hospital') {
    if (listKey === 'providers') nextPageDesign.clinicDoctorsList = nextList;
    if (listKey === 'services') nextPageDesign.clinicSpecialtiesList = nextList;
  }

  return nextPageDesign;
};

export type SidebarItem = {
  id: string;
  label: string;
  icon: string;
  route: string;
  isExtra?: boolean;
};

export const ACTIVITY_MODULES: Record<BookingActivityType, SidebarItem[]> = {
  clinic_hospital: [
    { id: 'doctors', label: 'الأطباء والكادر', icon: 'Users', route: 'doctors' },
    { id: 'services', label: 'التخصصات والخدمات', icon: 'ListChecks', route: 'services' },
    { id: 'clinics', label: 'العيادات', icon: 'Building2', route: 'activity/clinics', isExtra: true },
    { id: 'schedule', label: 'الجدول الطبي', icon: 'CalendarClock', route: 'activity/medical-schedule', isExtra: true },
    { id: 'reports', label: 'التقارير الطبية', icon: 'FileText', route: 'activity/medical-reports', isExtra: true },
  ],
  salon_barber: [
    { id: 'doctors', label: 'المصففين والخبراء', icon: 'Users', route: 'doctors' },
    { id: 'services', label: 'خدمات الصالون', icon: 'ListChecks', route: 'services' },
    { id: 'chairs', label: 'الكراسي والغرف', icon: 'Armchair', route: 'activity/chairs-rooms', isExtra: true },
    { id: 'packages', label: 'باقات العناية', icon: 'Sparkles', route: 'activity/care-packages', isExtra: true },
  ],
  wellness_spa: [
    { id: 'doctors', label: 'المعالجين والخبراء', icon: 'Users', route: 'doctors' },
    { id: 'services', label: 'جلسات العناية والسبا', icon: 'ListChecks', route: 'services' },
    { id: 'rooms', label: 'غرف الجلسات', icon: 'DoorOpen', route: 'activity/treatment-rooms', isExtra: true },
    { id: 'packages', label: 'الباقات والبرامج', icon: 'Sparkles', route: 'activity/wellness-packages', isExtra: true },
  ],
  chalets_resorts: [
    { id: 'doctors', label: 'الشاليهات والوحدات', icon: 'Building2', route: 'doctors' },
    { id: 'services', label: 'المرافق والباقات', icon: 'ListChecks', route: 'services' },
    { id: 'seasons', label: 'المواسم والأسعار', icon: 'CalendarDays', route: 'activity/seasons-rates', isExtra: true },
    { id: 'policies', label: 'سياسات الدخول والتأمين', icon: 'ShieldAlert', route: 'activity/check-in-insurance', isExtra: true },
  ],
  hotels_rooms: [
    { id: 'doctors', label: 'الغرف والأجنحة', icon: 'Hotel', route: 'doctors' },
    { id: 'services', label: 'المرافق والخدمات', icon: 'ListChecks', route: 'services' },
    { id: 'availability', label: 'التوافر الليلي', icon: 'Moon', route: 'activity/nightly-availability', isExtra: true },
    { id: 'rules', label: 'سياسات تسجيل الوصول', icon: 'ClipboardCheck', route: 'activity/check-in-rules', isExtra: true },
  ],
  restaurants_tables: [
    { id: 'doctors', label: 'الطاولة والقاعة', icon: 'UtensilsCrossed', route: 'doctors' },
    { id: 'services', label: 'باقات الحجز', icon: 'ListChecks', route: 'services' },
    { id: 'capacity', label: 'قواعد السعة', icon: 'Users', route: 'activity/capacity-rules', isExtra: true },
    { id: 'special', label: 'طلبات العملاء الخاصة', icon: 'MessageSquareStar', route: 'activity/special-requests', isExtra: true },
  ],
  events_venues: [
    { id: 'doctors', label: 'القاعات/الفعاليات', icon: 'PartyPopper', route: 'doctors' },
    { id: 'services', label: 'الباقات والتجهيزات', icon: 'ListChecks', route: 'services' },
    { id: 'tickets', label: 'التذاكر والسعات', icon: 'Ticket', route: 'activity/tickets-capacity', isExtra: true },
    { id: 'schedule', label: 'جدول الفعاليات', icon: 'CalendarDays', route: 'activity/event-schedule', isExtra: true },
  ],
  vehicle_rental: [
    { id: 'doctors', label: 'المركبات المتاحة', icon: 'Car', route: 'doctors' },
    { id: 'services', label: 'باقات التأجير', icon: 'ListChecks', route: 'services' },
    { id: 'insurance', label: 'التأمين والشروط', icon: 'ShieldCheck', route: 'activity/insurance-terms', isExtra: true },
    { id: 'locations', label: 'مواقع الاستلام', icon: 'MapPin', route: 'activity/pickup-locations', isExtra: true },
  ],
  sports_trainers: [
    { id: 'doctors', label: 'الملاعب والمدربون', icon: 'Dumbbell', route: 'doctors' },
    { id: 'services', label: 'الحصص والباقات', icon: 'ListChecks', route: 'services' },
    { id: 'capacity', label: 'قواعد السعة', icon: 'Users', route: 'activity/capacity-rules', isExtra: true },
    { id: 'subscriptions', label: 'اشتراكات التدريب', icon: 'CalendarHeart', route: 'activity/training-subscriptions', isExtra: true },
  ],
  education_courses: [
    { id: 'doctors', label: 'المدرسون/المحاضرون', icon: 'GraduationCap', route: 'doctors' },
    { id: 'services', label: 'الكورسات والحصص', icon: 'ListChecks', route: 'services' },
    { id: 'levels', label: 'المستويات', icon: 'Sliders', route: 'activity/course-levels', isExtra: true },
    { id: 'subscriptions', label: 'خطط الاشتراك', icon: 'CreditCard', route: 'activity/education-subscriptions', isExtra: true },
  ],
  maintenance_services: [
    { id: 'doctors', label: 'الفنيون والفرق', icon: 'Wrench', route: 'doctors' },
    { id: 'services', label: 'أنواع الزيارات', icon: 'ListChecks', route: 'services' },
    { id: 'zones', label: 'مناطق الخدمة', icon: 'Map', route: 'activity/service-zones', isExtra: true },
    { id: 'fees', label: 'رسوم الانتقال', icon: 'Coins', route: 'activity/travel-fees', isExtra: true },
  ],
  general_appointments: [
    { id: 'doctors', label: 'مقدمو الخدمة', icon: 'UserSquare', route: 'doctors' },
    { id: 'services', label: 'أنواع الخدمة', icon: 'ListChecks', route: 'services' },
    { id: 'branches', label: 'الفروع/المواقع', icon: 'Building', route: 'activity/branches-locations', isExtra: true },
    { id: 'rules', label: 'قواعد المواعيد', icon: 'CalendarDays', route: 'activity/booking-rules', isExtra: true },
  ],
};

export const getBookingActivityTypeFromParam = (param: string): BookingActivityType => {
  const normalized = String(param || '').trim().toLowerCase();
  const map: Record<string, BookingActivityType> = {
    'clinic': 'clinic_hospital',
    'clinics': 'clinic_hospital',
    'clinic_hospital': 'clinic_hospital',
    
    'salon': 'salon_barber',
    'salons': 'salon_barber',
    'salon_barber': 'salon_barber',
    
    'spa': 'wellness_spa',
    'wellness': 'wellness_spa',
    'wellness_spa': 'wellness_spa',
    
    'chalets': 'chalets_resorts',
    'chalet': 'chalets_resorts',
    'chalets_resorts': 'chalets_resorts',
    
    'hotels': 'hotels_rooms',
    'hotel': 'hotels_rooms',
    'hotels_rooms': 'hotels_rooms',
    
    'restaurants': 'restaurants_tables',
    'restaurant': 'restaurants_tables',
    'restaurants_tables': 'restaurants_tables',
    
    'events': 'events_venues',
    'event': 'events_venues',
    'events_venues': 'events_venues',
    
    'rental': 'vehicle_rental',
    'vehicle_rental': 'vehicle_rental',
    'car_rentals': 'vehicle_rental',
    'car-rentals': 'vehicle_rental',
    
    'sports': 'sports_trainers',
    'sport': 'sports_trainers',
    'sports_trainers': 'sports_trainers',
    
    'education': 'education_courses',
    'courses': 'education_courses',
    'education_courses': 'education_courses',
    
    'maintenance': 'maintenance_services',
    'maintenance_services': 'maintenance_services',
    
    'appointments': 'general_appointments',
    'general_appointments': 'general_appointments',
  };
  return map[normalized] || 'clinic_hospital';
};
