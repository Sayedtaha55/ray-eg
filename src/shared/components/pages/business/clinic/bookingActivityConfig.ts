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

export const getBookingActivityDefinition = (raw?: unknown): BookingActivityDefinition => {
  const id = String(raw || '').trim() as BookingActivityType;
  return BOOKING_ACTIVITY_DEFINITIONS.find((activity) => activity.id === id) || BOOKING_ACTIVITY_DEFINITIONS[0];
};

export const getBookingPrivateButtons = (raw?: unknown): string[] => {
  const definition = getBookingActivityDefinition(raw);
  return [definition.primaryTabLabel, definition.secondaryTabLabel, ...definition.extraButtons];
};
