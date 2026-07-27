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
  titleEn?: string;
  description: string;
  descriptionEn?: string;
  folderName: string;
  primaryTabLabel: string;
  primaryTabLabelEn?: string;
  secondaryTabLabel: string;
  secondaryTabLabelEn?: string;
  extraButtons: string[];
  extraButtonsEn?: string[];
  specialties: string[];
  specialtiesEn?: string[];
};

export const BOOKING_ACTIVITIES: BookingActivityDefinition[] = [
  {
    id: 'clinic',
    title: 'عيادات',
    titleEn: 'Clinics',
    description: 'أطباء، تخصصات، كشف، عيادات فرعية، مواعيد وملفات مرضى.',
    descriptionEn: 'Doctors, specialties, check-ups, branch clinics, appointments and patient files.',
    folderName: 'clinic',
    primaryTabLabel: 'الأطباء والكادر',
    primaryTabLabelEn: 'Doctors & Staff',
    secondaryTabLabel: 'التخصصات والخدمات',
    secondaryTabLabelEn: 'Specialties & Services',
    extraButtons: ['غرف/عيادات فرعية', 'ملفات المرضى', 'مواعيد اليوم'],
    extraButtonsEn: ['Rooms / Branch Clinics', 'Patient Files', "Today's Appointments"],
    specialties: ['أسنان', 'باطنة', 'جلدية', 'عظام', 'أطفال', 'نساء وتوليد', 'أنف وأذن', 'عيون', 'قلب وأوعية', 'مسالك بولية', 'مخ وأعصاب', 'جراحة عامة', 'علاج طبيعي', 'نفسي'],
    specialtiesEn: ['Dentistry', 'Internal Medicine', 'Dermatology', 'Orthopedics', 'Pediatrics', 'OB/GYN', 'ENT', 'Ophthalmology', 'Cardiology', 'Urology', 'Neurology', 'General Surgery', 'Physiotherapy', 'Psychiatry'],
  },
  {
    id: 'salon_barber',
    title: 'صالونات وحلاقة',
    titleEn: 'Salons & Barbers',
    description: 'خبراء، خدمات تجميل، كراسي عمل، وباقات العناية.',
    descriptionEn: 'Experts, beauty services, work chairs, and care packages.',
    folderName: 'salon',
    primaryTabLabel: 'المصففين والخبراء',
    primaryTabLabelEn: 'Stylists & Experts',
    secondaryTabLabel: 'خدمات الصالون',
    secondaryTabLabelEn: 'Salon Services',
    extraButtons: ['الكراسي والغرف', 'باقات العناية', 'جدول المواعيد'],
    extraButtonsEn: ['Chairs & Rooms', 'Care Packages', 'Appointment Schedule'],
    specialties: ['حلاقة رجالي', 'تصفيف شعر', 'صبغة وتلوين', 'باديكير ومانيكير', 'عناية بالبشرة', 'مكياج', 'تسريحات عرائس', 'سشوار ومعالجة', 'قصات أطفال', 'حواجب ورموش'],
    specialtiesEn: ['Men\'s Haircut', 'Hair Styling', 'Coloring & Dye', 'Pedicure & Manicure', 'Skincare', 'Makeup', 'Bridal Hairstyles', 'Blowdry & Treatment', 'Kids Cuts', 'Brows & Lashes'],
  },
  {
    id: 'wellness_spa',
    title: 'سبا وعناية صحية',
    titleEn: 'Wellness & Spa',
    description: 'معالجون، جلسات، غرف، ومدد راحة.',
    descriptionEn: 'Therapists, sessions, rooms, and relaxation periods.',
    folderName: 'spa',
    primaryTabLabel: 'المعالجون',
    primaryTabLabelEn: 'Therapists',
    secondaryTabLabel: 'الجلسات',
    secondaryTabLabelEn: 'Sessions',
    extraButtons: ['غرف الجلسات', 'الباقات', 'جدول المعالجين'],
    extraButtonsEn: ['Session Rooms', 'Packages', 'Therapist Schedule'],
    specialties: ['مساج سويدي', 'مساج استرخائي', 'مساج رياضي', 'مساج حجارة', 'عناية بالوجه', 'علاج بالأعشاب', 'حمام مغربي', 'حمام تركي', 'جاكوزي وساونا', 'تقشير وعناية'],
    specialtiesEn: ['Swedish Massage', 'Relaxation Massage', 'Sports Massage', 'Hot Stone Massage', 'Facial Care', 'Herbal Treatment', 'Moroccan Bath', 'Turkish Bath', 'Jacuzzi & Sauna', 'Exfoliation & Care'],
  },
  {
    id: 'chalets_resorts',
    title: 'شاليهات ومنتجعات',
    titleEn: 'Chalets & Resorts',
    description: 'وحدات إقامة، أيام متاحة، مواسم وأسعار، مرافق، وسياسات دخول.',
    descriptionEn: 'Accommodation units, available days, seasonal pricing, facilities, and entry policies.',
    folderName: 'chalets',
    primaryTabLabel: 'الشاليهات والوحدات',
    primaryTabLabelEn: 'Chalets & Units',
    secondaryTabLabel: 'المرافق والباقات',
    secondaryTabLabelEn: 'Facilities & Packages',
    extraButtons: ['المواسم والأسعار', 'سياسات الدخول', 'التوافر'],
    extraButtonsEn: ['Seasons & Pricing', 'Entry Policies', 'Availability'],
    specialties: ['شاليه عائلي', 'شاليه شبابي', 'فيلا خاصة', 'منتجع كامل', 'مسبح خاص', 'شاطئ وبحيرة', 'ب barbecue', 'تجهيزات مناسبات', 'إقامة ليلة', 'إقامة نهارية'],
    specialtiesEn: ['Family Chalet', 'Youth Chalet', 'Private Villa', 'Full Resort', 'Private Pool', 'Beach & Lake', 'BBQ', 'Event Setup', 'Overnight Stay', 'Day Stay'],
  },
  {
    id: 'hotels_rooms',
    title: 'فنادق وغرف إقامة',
    titleEn: 'Hotels & Rooms',
    description: 'غرف، أجنحة، سعة، ليالي إقامة، ومرافق الفندقة.',
    descriptionEn: 'Rooms, suites, capacity, nights, and hotel facilities.',
    folderName: 'hotels',
    primaryTabLabel: 'الغرف والأجنحة',
    primaryTabLabelEn: 'Rooms & Suites',
    secondaryTabLabel: 'المرافق والخدمات',
    secondaryTabLabelEn: 'Facilities & Services',
    extraButtons: ['التوافر الليلي', 'سياسات الوصول', 'قائمة المرافق'],
    extraButtonsEn: ['Nightly Availability', 'Check-in Policies', 'Facilities List'],
    specialties: ['غرفة فردية', 'غرفة مزدوجة', 'جناح عائلي', 'جناح تنفيذي', 'غرفة بإطلالة', 'غرفة لذوي الاحتياجات', 'إقامة فطور', 'نصف إقامة', 'إقامة كاملة', 'مكيفة/غير مكيفة'],
    specialtiesEn: ['Single Room', 'Double Room', 'Family Suite', 'Executive Suite', 'View Room', 'Accessible Room', 'Bed & Breakfast', 'Half Board', 'Full Board', 'AC / Non-AC'],
  },
  {
    id: 'restaurants_tables',
    title: 'مطاعم وحجز طاولات',
    titleEn: 'Restaurants & Tables',
    description: 'طاولات، قاعات، مدد حجز، مناسبات، وطلبات خاصة.',
    descriptionEn: 'Tables, halls, booking durations, events, and special requests.',
    folderName: 'restaurants',
    primaryTabLabel: 'الطاولات والقاعات',
    primaryTabLabelEn: 'Tables & Halls',
    secondaryTabLabel: 'باقات الحجز',
    secondaryTabLabelEn: 'Booking Packages',
    extraButtons: ['قواعد السعة', 'جدول الحجوزات'],
    extraButtonsEn: ['Capacity Rules', 'Booking Schedule'],
    specialties: ['طاولة داخلية', 'طاولة خارجية', 'قاعة مناسبات', 'فاميلي زون', 'VIP', 'حجز فطور', 'حجز غداء', 'حجز عشاء', 'بوفيه مفتوح', 'عائلات فقط'],
    specialtiesEn: ['Indoor Table', 'Outdoor Table', 'Event Hall', 'Family Zone', 'VIP', 'Breakfast Booking', 'Lunch Booking', 'Dinner Booking', 'Open Buffet', 'Families Only'],
  },
  {
    id: 'events_venues',
    title: 'فعاليات وقاعات',
    titleEn: 'Events & Venues',
    description: 'قاعات، مناسبات، تذاكر، سعات، وتجهيزات.',
    descriptionEn: 'Halls, events, tickets, capacities, and setups.',
    folderName: 'events',
    primaryTabLabel: 'القاعات/الفعاليات',
    primaryTabLabelEn: 'Venues / Events',
    secondaryTabLabel: 'الباقات والتجهيزات',
    secondaryTabLabelEn: 'Packages & Setup',
    extraButtons: ['التذاكر والسعات', 'جدول الفعاليات', 'التجهيزات'],
    extraButtonsEn: ['Tickets & Capacity', 'Event Schedule', 'Setup'],
    specialties: ['قاعة أفراح', 'قاعة مؤتمرات', 'قاعة اجتماعات', 'حفلات تخرج', 'حفلات عيد ميلاد', 'معارض', 'ورش عمل', 'سهرات رمضانية', 'فعالية موسيقية', 'فعالية رياضية'],
    specialtiesEn: ['Wedding Hall', 'Conference Hall', 'Meeting Room', 'Graduation Parties', 'Birthday Parties', 'Exhibitions', 'Workshops', 'Ramadan Nights', 'Music Event', 'Sports Event'],
  },
  {
    id: 'vehicle_rental',
    title: 'تأجير سيارات ومركبات',
    titleEn: 'Vehicle Rental',
    description: 'سيارات، مدد تأجير، استلام وتسليم، وتأمين.',
    descriptionEn: 'Cars, rental durations, pickup and drop-off, and insurance.',
    folderName: 'rental',
    primaryTabLabel: 'المركبات المتاحة',
    primaryTabLabelEn: 'Available Vehicles',
    secondaryTabLabel: 'باقات التأجير',
    secondaryTabLabelEn: 'Rental Packages',
    extraButtons: ['التأمين والشروط', 'مواقع الاستلام', 'العقود النشطة'],
    extraButtonsEn: ['Insurance & Terms', 'Pickup Locations', 'Active Contracts'],
    specialties: ['سيارات اقتصادية', 'سيارات فاخرة', 'سيارات عائلية', 'SUV', 'ميكروباص', 'تأجير يومي', 'تأجير أسبوعي', 'تأجير شهري', 'سائق خاص', 'تأمين شامل'],
    specialtiesEn: ['Economy Cars', 'Luxury Cars', 'Family Cars', 'SUV', 'Minibus', 'Daily Rental', 'Weekly Rental', 'Monthly Rental', 'Private Driver', 'Full Insurance'],
  },
  {
    id: 'sports_trainers',
    title: 'ملاعب ومدربين',
    titleEn: 'Sports & Trainers',
    description: 'ملاعب، مدربين، حصص تدريب، وسعات.',
    descriptionEn: 'Courts, trainers, training sessions, and capacities.',
    folderName: 'sports',
    primaryTabLabel: 'الملاعب والمدربون',
    primaryTabLabelEn: 'Courts & Trainers',
    secondaryTabLabel: 'الحصص والباقات',
    secondaryTabLabelEn: 'Sessions & Packages',
    extraButtons: ['قواعد السعة', 'اشتراكات التدريب', 'جدول الحصص'],
    extraButtonsEn: ['Capacity Rules', 'Training Subscriptions', 'Session Schedule'],
    specialties: ['ملعب كرة قدم', 'ملعب تنس', 'ملعب سلة', 'ملعب اسكواش', 'حمام سباحة', 'جيم', 'مدرب شخصي', 'تدريب جماعي', 'تدريب أطفال', 'تأهيل رياضي'],
    specialtiesEn: ['Football Court', 'Tennis Court', 'Basketball Court', 'Squash Court', 'Swimming Pool', 'Gym', 'Personal Trainer', 'Group Training', 'Kids Training', 'Sports Rehab'],
  },
  {
    id: 'education_courses',
    title: 'دورات وحصص تعليمية',
    titleEn: 'Education & Courses',
    description: 'مدرسون، كورسات، حصص، مستويات، ومواعيد.',
    descriptionEn: 'Instructors, courses, classes, levels, and schedules.',
    folderName: 'education',
    primaryTabLabel: 'المدرسون/المحاضرون',
    primaryTabLabelEn: 'Instructors / Lecturers',
    secondaryTabLabel: 'الكورسات والحصص',
    secondaryTabLabelEn: 'Courses & Classes',
    extraButtons: ['المستويات', 'خطط الاشتراك', 'جدول المحاضرات'],
    extraButtonsEn: ['Levels', 'Subscription Plans', 'Lecture Schedule'],
    specialties: ['لغات', 'رياضيات', 'علوم', 'حاسوب وتقنية', 'برمجة', 'تصميم', 'تسويق', 'إدارة أعمال', 'موسيقى', 'رياضة', 'تربية خاصة', 'تحضير امتحانات'],
    specialtiesEn: ['Languages', 'Mathematics', 'Sciences', 'Computing & Tech', 'Programming', 'Design', 'Marketing', 'Business Admin', 'Music', 'Sports', 'Special Education', 'Exam Prep'],
  },
  {
    id: 'maintenance_services',
    title: 'صيانة وزيارات منزلية',
    titleEn: 'Maintenance & Home Visits',
    description: 'فنيون، زيارات، مناطق خدمة، ورسوم انتقال.',
    descriptionEn: 'Technicians, visits, service zones, and travel fees.',
    folderName: 'maintenance',
    primaryTabLabel: 'الفنيون والفرق',
    primaryTabLabelEn: 'Technicians & Teams',
    secondaryTabLabel: 'أنواع الزيارات',
    secondaryTabLabelEn: 'Visit Types',
    extraButtons: ['مناطق الخدمة', 'رسوم الانتقال', 'جدول الفنيين'],
    extraButtonsEn: ['Service Zones', 'Travel Fees', 'Technician Schedule'],
    specialties: ['سباكة', 'كهرباء', 'نجارة', 'دهانات', 'تكييف', 'أجهزة منزلية', 'سيراميك ورخام', 'حدادة', 'ألوميتال', 'تنظيف مكيفات', 'تسليك مجاري', 'صيانة عامة'],
    specialtiesEn: ['Plumbing', 'Electrical', 'Carpentry', 'Painting', 'AC', 'Home Appliances', 'Tiling & Marble', 'Welding', 'Aluminum', 'AC Cleaning', 'Drain Cleaning', 'General Maintenance'],
  },
  {
    id: 'general_appointments',
    title: 'مواعيد عامة',
    titleEn: 'General Appointments',
    description: 'استشارات وخدمات عامة بإعدادات مرنة.',
    descriptionEn: 'General consultations and services with flexible settings.',
    folderName: 'general',
    primaryTabLabel: 'مقدمو الخدمة',
    primaryTabLabelEn: 'Service Providers',
    secondaryTabLabel: 'أنواع الخدمة',
    secondaryTabLabelEn: 'Service Types',
    extraButtons: ['الفروع/المواقع', 'قواعد المواعيد', 'الإعدادات'],
    extraButtonsEn: ['Branches / Locations', 'Appointment Rules', 'Settings'],
    specialties: ['استشارة قانونية', 'استشارة مالية', 'استشارة تسويقية', 'استشارة تكنولوجيا', 'استشارة تعليمية', 'استشارة عقارية', 'استشارة نفسية', 'موعد إداري', 'مقابلة عمل', 'خدمة زيارة'],
    specialtiesEn: ['Legal Consultation', 'Financial Consultation', 'Marketing Consultation', 'Tech Consultation', 'Educational Consultation', 'Real Estate Consultation', 'Psychological Consultation', 'Admin Appointment', 'Job Interview', 'Visit Service'],
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
  labelEn?: string;
  route: string;
  icon: string;
};

export const SHARED_BOOKING_BUTTONS: BookingButton[] = [
  { id: 'overview',   label: 'نظرة عامة',  labelEn: 'Overview',  route: 'overview',   icon: 'LayoutDashboard' },
  { id: 'bookings',   label: 'الحجوزات',   labelEn: 'Bookings',  route: 'bookings',   icon: 'CalendarCheck' },
  { id: 'design',     label: 'التصميم',    labelEn: 'Design',    route: 'design',     icon: 'Palette' },
  { id: 'settings',   label: 'الإعدادات',  labelEn: 'Settings',  route: 'settings',   icon: 'Settings' },
];

// ============================================
// الأزرار الخاصة بكل نشاط
// ============================================
export type ActivityModule = {
  id: string;
  label: string;
  labelEn?: string;
  icon: string;
  route: string;
  isExtra?: boolean;
};

export const ACTIVITY_MODULES: Record<BookingActivityType, ActivityModule[]> = {
  clinic: [
    { id: 'doctors', label: 'الأطباء والكادر',      labelEn: 'Doctors & Staff',      icon: 'Stethoscope', route: 'doctors', isExtra: true },
    { id: 'services', label: 'التخصصات والخدمات',    labelEn: 'Specialties & Services', icon: 'ListChecks',  route: 'services', isExtra: true },
    { id: 'rooms', label: 'غرف/عيادات فرعية',       labelEn: 'Rooms / Branch Clinics', icon: 'DoorOpen',    route: 'activity/rooms', isExtra: true },
    { id: 'patients', label: 'ملفات المرضى',         labelEn: 'Patient Files',          icon: 'FileText',    route: 'activity/patients' },
    { id: 'inventory', label: 'المخزون الطبي',        labelEn: 'Medical Inventory',      icon: 'Package',     route: 'activity/inventory' },
  ],
  salon_barber: [
    { id: 'experts', label: 'المصففين والخبراء',    labelEn: 'Stylists & Experts',  icon: 'Users',       route: 'experts' },
    { id: 'services', label: 'خدمات الصالون',        labelEn: 'Salon Services',       icon: 'ListChecks',  route: 'services' },
    { id: 'chairs', label: 'الكراسي والغرف',        labelEn: 'Chairs & Rooms',       icon: 'Armchair',    route: 'activity/chairs', isExtra: true },
    { id: 'packages', label: 'باقات العناية',       labelEn: 'Care Packages',        icon: 'Sparkles',    route: 'activity/packages', isExtra: true },
  ],
  wellness_spa: [
    { id: 'therapists', label: 'المعالجون',          labelEn: 'Therapists',     icon: 'Users',       route: 'therapists' },
    { id: 'services', label: 'الجلسات',              labelEn: 'Sessions',       icon: 'ListChecks',  route: 'services' },
    { id: 'rooms', label: 'غرف الجلسات',            labelEn: 'Session Rooms',  icon: 'DoorOpen',    route: 'activity/rooms', isExtra: true },
    { id: 'packages', label: 'الباقات',              labelEn: 'Packages',       icon: 'Sparkles',    route: 'activity/packages', isExtra: true },
  ],
  chalets_resorts: [
    { id: 'units', label: 'الشاليهات والوحدات',     labelEn: 'Chalets & Units',      icon: 'Building2',   route: 'units' },
    { id: 'services', label: 'المرافق والباقات',    labelEn: 'Facilities & Packages', icon: 'ListChecks',  route: 'services' },
    { id: 'seasons', label: 'المواسم والأسعار',     labelEn: 'Seasons & Pricing',     icon: 'CalendarDays', route: 'activity/seasons', isExtra: true },
    { id: 'policies', label: 'سياسات الدخول',       labelEn: 'Entry Policies',        icon: 'ShieldAlert', route: 'activity/policies', isExtra: true },
  ],
  hotels_rooms: [
    { id: 'rooms', label: 'الغرف والأجنحة',         labelEn: 'Rooms & Suites',        icon: 'Hotel',       route: 'rooms' },
    { id: 'services', label: 'المرافق والخدمات',    labelEn: 'Facilities & Services', icon: 'ListChecks',  route: 'services' },
    { id: 'availability', label: 'التوافر الليلي',  labelEn: 'Nightly Availability',  icon: 'Moon',        route: 'activity/availability', isExtra: true },
    { id: 'rules', label: 'سياسات الوصول',          labelEn: 'Check-in Policies',     icon: 'ClipboardCheck', route: 'activity/rules', isExtra: true },
  ],
  restaurants_tables: [
    { id: 'tables', label: 'الطاولات والقاعات',     labelEn: 'Tables & Halls',     icon: 'UtensilsCrossed', route: 'tables' },
    { id: 'services', label: 'باقات الحجز',          labelEn: 'Booking Packages',   icon: 'ListChecks',  route: 'services' },
    { id: 'capacity', label: 'قواعد السعة',          labelEn: 'Capacity Rules',     icon: 'Users',       route: 'activity/capacity', isExtra: true },
  ],
  events_venues: [
    { id: 'venues', label: 'القاعات/الفعاليات',     labelEn: 'Venues / Events',       icon: 'PartyPopper', route: 'venues' },
    { id: 'services', label: 'الباقات والتجهيزات',  labelEn: 'Packages & Setup',       icon: 'ListChecks',  route: 'services' },
    { id: 'tickets', label: 'التذاكر والسعات',      labelEn: 'Tickets & Capacity',     icon: 'Ticket',      route: 'activity/tickets', isExtra: true },
    { id: 'schedule', label: 'جدول الفعاليات',      labelEn: 'Event Schedule',         icon: 'CalendarDays', route: 'activity/schedule', isExtra: true },
  ],
  vehicle_rental: [
    { id: 'vehicles', label: 'المركبات المتاحة',    labelEn: 'Available Vehicles',  icon: 'Car',         route: 'vehicles' },
    { id: 'services', label: 'باقات التأجير',       labelEn: 'Rental Packages',     icon: 'ListChecks',  route: 'services' },
    { id: 'insurance', label: 'التأمين والشروط',    labelEn: 'Insurance & Terms',   icon: 'ShieldCheck', route: 'activity/insurance', isExtra: true },
    { id: 'locations', label: 'مواقع الاستلام',     labelEn: 'Pickup Locations',    icon: 'MapPin',      route: 'activity/locations', isExtra: true },
  ],
  sports_trainers: [
    { id: 'coaches', label: 'الملاعب والمدربون',    labelEn: 'Courts & Trainers',         icon: 'Dumbbell',    route: 'coaches' },
    { id: 'services', label: 'الحصص والباقات',      labelEn: 'Sessions & Packages',       icon: 'ListChecks',  route: 'services' },
    { id: 'capacity', label: 'قواعد السعة',          labelEn: 'Capacity Rules',            icon: 'Users',       route: 'activity/capacity', isExtra: true },
    { id: 'subscriptions', label: 'اشتراكات التدريب', labelEn: 'Training Subscriptions',   icon: 'CalendarHeart', route: 'activity/subscriptions', isExtra: true },
  ],
  education_courses: [
    { id: 'instructors', label: 'المدرسون/المحاضرون', labelEn: 'Instructors / Lecturers', icon: 'GraduationCap', route: 'instructors' },
    { id: 'services', label: 'الكورسات والحصص',      labelEn: 'Courses & Classes',        icon: 'ListChecks',  route: 'services' },
    { id: 'levels', label: 'المستويات',              labelEn: 'Levels',                   icon: 'Sliders',     route: 'activity/levels', isExtra: true },
    { id: 'subscriptions', label: 'خطط الاشتراك',    labelEn: 'Subscription Plans',       icon: 'CreditCard',  route: 'activity/subscriptions', isExtra: true },
  ],
  maintenance_services: [
    { id: 'technicians', label: 'الفنيون والفرق',    labelEn: 'Technicians & Teams', icon: 'Wrench',      route: 'technicians' },
    { id: 'services', label: 'أنواع الزيارات',       labelEn: 'Visit Types',         icon: 'ListChecks',  route: 'services' },
    { id: 'zones', label: 'مناطق الخدمة',            labelEn: 'Service Zones',       icon: 'Map',         route: 'activity/zones', isExtra: true },
    { id: 'fees', label: 'رسوم الانتقال',            labelEn: 'Travel Fees',         icon: 'Coins',       route: 'activity/fees', isExtra: true },
  ],
  general_appointments: [
    { id: 'providers', label: 'مقدمو الخدمة',        labelEn: 'Service Providers',    icon: 'UserSquare',  route: 'providers' },
    { id: 'services', label: 'أنواع الخدمة',          labelEn: 'Service Types',         icon: 'ListChecks',  route: 'services' },
    { id: 'branches', label: 'الفروع/المواقع',       labelEn: 'Branches / Locations',  icon: 'Building',    route: 'activity/branches', isExtra: true },
    { id: 'rules', label: 'قواعد المواعيد',           labelEn: 'Appointment Rules',     icon: 'CalendarDays', route: 'activity/rules', isExtra: true },
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
  // English fields
  customerSingularEn?: string;
  customerPluralEn?: string;
  providerSingularEn?: string;
  providerPluralEn?: string;
  serviceSingularEn?: string;
  servicePluralEn?: string;
  dashboardTitleEn?: string;
  dashboardSubtitleEn?: string;
  addProviderButtonEn?: string;
  providerLabelEn?: string;
  providerTitleLabelEn?: string;
  providerNextSlotLabelEn?: string;
  providerImageLabelEn?: string;
  providerImagePlaceholderEn?: string;
  providerDefaultTitleEn?: string;
  customerNamePlaceholderEn?: string;
  customerEmailPlaceholderEn?: string;
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
    customerSingularEn: 'Patient', customerPluralEn: 'Patients',
    providerSingularEn: 'Doctor', providerPluralEn: 'Doctors',
    serviceSingularEn: 'Medical Service', servicePluralEn: 'Medical Services',
    dashboardTitleEn: 'Clinic Dashboard', dashboardSubtitleEn: 'Track appointments, patient files and clinic performance.',
    addProviderButtonEn: 'Add Doctor / Staff',
    providerLabelEn: 'Doctor / Staff', providerTitleLabelEn: 'Specialty', providerNextSlotLabelEn: 'Next available slot',
    providerImageLabelEn: 'Doctor photo URL (optional)', providerImagePlaceholderEn: 'https://example.com/doctor.jpg',
    providerDefaultTitleEn: 'Specialist Doctor',
    customerNamePlaceholderEn: 'e.g. John Doe', customerEmailPlaceholderEn: 'patient@gmail.com',
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
    customerSingularEn: 'Client', customerPluralEn: 'Clients',
    providerSingularEn: 'Stylist / Expert', providerPluralEn: 'Stylists & Experts',
    serviceSingularEn: 'Salon Service', servicePluralEn: 'Salon Services',
    dashboardTitleEn: 'Salon & Barber Dashboard', dashboardSubtitleEn: 'Track chair bookings, stylists and salon performance.',
    addProviderButtonEn: 'Add Stylist / Expert',
    providerLabelEn: 'Stylist / Expert', providerTitleLabelEn: 'Title & Experience', providerNextSlotLabelEn: 'Next available slot',
    providerImageLabelEn: 'Stylist photo URL (optional)', providerImagePlaceholderEn: 'https://example.com/stylist.jpg',
    providerDefaultTitleEn: 'Salon Expert',
    customerNamePlaceholderEn: 'e.g. Sarah Smith', customerEmailPlaceholderEn: 'customer@gmail.com',
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
    customerSingularEn: 'Guest', customerPluralEn: 'Guests',
    providerSingularEn: 'Therapist', providerPluralEn: 'Therapists',
    serviceSingularEn: 'Session / Package', servicePluralEn: 'Wellness & Spa Sessions',
    dashboardTitleEn: 'Wellness & Spa Dashboard', dashboardSubtitleEn: 'Track session appointments, massage rooms and relaxation status.',
    addProviderButtonEn: 'Add Therapist',
    providerLabelEn: 'Therapist', providerTitleLabelEn: 'Expertise Type', providerNextSlotLabelEn: 'Next available session',
    providerImageLabelEn: 'Therapist photo URL (optional)', providerImagePlaceholderEn: 'https://example.com/therapist.jpg',
    providerDefaultTitleEn: 'Specialist Therapist',
    customerNamePlaceholderEn: 'e.g. Noor Ahmed', customerEmailPlaceholderEn: 'guest@gmail.com',
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
    customerSingularEn: 'Guest', customerPluralEn: 'Guests',
    providerSingularEn: 'Chalet / Unit', providerPluralEn: 'Chalets & Units',
    serviceSingularEn: 'Facility / Package', servicePluralEn: 'Facilities & Packages',
    dashboardTitleEn: 'Chalets & Resorts Dashboard', dashboardSubtitleEn: 'Track unit bookings, seasonal availability and daily check-in.',
    addProviderButtonEn: 'Add Chalet / Unit',
    providerLabelEn: 'Chalet / Unit', providerTitleLabelEn: 'Unit Type', providerNextSlotLabelEn: 'Next available date',
    providerImageLabelEn: 'Chalet photo URL (optional)', providerImagePlaceholderEn: 'https://example.com/unit.jpg',
    providerDefaultTitleEn: 'Accommodation Unit',
    customerNamePlaceholderEn: 'e.g. Mohamed Khaled', customerEmailPlaceholderEn: 'guest@gmail.com',
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
    customerSingularEn: 'Guest', customerPluralEn: 'Guests',
    providerSingularEn: 'Room / Suite', providerPluralEn: 'Rooms & Suites',
    serviceSingularEn: 'Facility / Service', servicePluralEn: 'Facilities & Services',
    dashboardTitleEn: 'Hotels & Rooms Dashboard', dashboardSubtitleEn: 'Track hotel guests, vacant rooms and check-in/out operations.',
    addProviderButtonEn: 'Add Room / Suite',
    providerLabelEn: 'Room / Suite', providerTitleLabelEn: 'Room Type', providerNextSlotLabelEn: 'Next available night',
    providerImageLabelEn: 'Room photo URL (optional)', providerImagePlaceholderEn: 'https://example.com/room.jpg',
    providerDefaultTitleEn: 'Guest Room',
    customerNamePlaceholderEn: 'e.g. Mahmoud Ali', customerEmailPlaceholderEn: 'guest@gmail.com',
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
    customerSingularEn: 'Customer', customerPluralEn: 'Customers',
    providerSingularEn: 'Table / Hall', providerPluralEn: 'Tables & Halls',
    serviceSingularEn: 'Booking Package', servicePluralEn: 'Table Booking Packages',
    dashboardTitleEn: 'Restaurant Table Booking Dashboard', dashboardSubtitleEn: 'Track table occupancy, events and meal requests.',
    addProviderButtonEn: 'Add Table / Hall',
    providerLabelEn: 'Table / Hall', providerTitleLabelEn: 'Table Type', providerNextSlotLabelEn: 'Next available time',
    providerImageLabelEn: 'Table photo URL (optional)', providerImagePlaceholderEn: 'https://example.com/table.jpg',
    providerDefaultTitleEn: 'Booking Space',
    customerNamePlaceholderEn: 'e.g. Mona Hassan', customerEmailPlaceholderEn: 'customer@gmail.com',
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
    customerSingularEn: 'Attendee', customerPluralEn: 'Attendees',
    providerSingularEn: 'Venue / Event', providerPluralEn: 'Venues & Events',
    serviceSingularEn: 'Setup Package', servicePluralEn: 'Event Setup Packages',
    dashboardTitleEn: 'Events & Venues Dashboard', dashboardSubtitleEn: 'Track ticket sales, attendance capacity and event schedule.',
    addProviderButtonEn: 'Add Venue / Event',
    providerLabelEn: 'Venue / Event', providerTitleLabelEn: 'Event Type', providerNextSlotLabelEn: 'Next event date',
    providerImageLabelEn: 'Venue photo URL (optional)', providerImagePlaceholderEn: 'https://example.com/event.jpg',
    providerDefaultTitleEn: 'Event / Venue',
    customerNamePlaceholderEn: 'e.g. Omar Sami', customerEmailPlaceholderEn: 'attendee@gmail.com',
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
    customerSingularEn: 'Renter', customerPluralEn: 'Renters',
    providerSingularEn: 'Vehicle / Car', providerPluralEn: 'Vehicles & Cars',
    serviceSingularEn: 'Rental Package', servicePluralEn: 'Car Rental Packages',
    dashboardTitleEn: 'Vehicle Rental Dashboard', dashboardSubtitleEn: 'Track rental contracts, pickup/drop-off and insurance status.',
    addProviderButtonEn: 'Add Vehicle / Car',
    providerLabelEn: 'Vehicle / Car', providerTitleLabelEn: 'Vehicle Type', providerNextSlotLabelEn: 'Next pickup date',
    providerImageLabelEn: 'Vehicle photo URL (optional)', providerImagePlaceholderEn: 'https://example.com/car.jpg',
    providerDefaultTitleEn: 'Rental Vehicle',
    customerNamePlaceholderEn: 'e.g. Karim Adel', customerEmailPlaceholderEn: 'renter@gmail.com',
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
    customerSingularEn: 'Trainee', customerPluralEn: 'Trainees',
    providerSingularEn: 'Court / Trainer', providerPluralEn: 'Courts & Trainers',
    serviceSingularEn: 'Session / Package', servicePluralEn: 'Court Sessions & Subscriptions',
    dashboardTitleEn: 'Sports & Trainers Dashboard', dashboardSubtitleEn: 'Track court bookings, trainer schedules and training sessions.',
    addProviderButtonEn: 'Add Court / Trainer',
    providerLabelEn: 'Court / Trainer', providerTitleLabelEn: 'Court Type', providerNextSlotLabelEn: 'Next available session',
    providerImageLabelEn: 'Court photo URL (optional)', providerImagePlaceholderEn: 'https://example.com/training.jpg',
    providerDefaultTitleEn: 'Court / Trainer',
    customerNamePlaceholderEn: 'e.g. Youssef Ahmed', customerEmailPlaceholderEn: 'trainee@gmail.com',
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
    customerSingularEn: 'Student', customerPluralEn: 'Students',
    providerSingularEn: 'Instructor / Lecturer', providerPluralEn: 'Instructors & Lecturers',
    serviceSingularEn: 'Course / Class', servicePluralEn: 'Educational Courses & Classes',
    dashboardTitleEn: 'Courses & Education Dashboard', dashboardSubtitleEn: 'Track student attendance, lecture classes and education levels.',
    addProviderButtonEn: 'Add Instructor / Lecturer',
    providerLabelEn: 'Instructor / Lecturer', providerTitleLabelEn: 'Subject', providerNextSlotLabelEn: 'Next available class',
    providerImageLabelEn: 'Instructor photo URL (optional)', providerImagePlaceholderEn: 'https://example.com/instructor.jpg',
    providerDefaultTitleEn: 'Instructor / Lecturer',
    customerNamePlaceholderEn: 'e.g. Laila Mahmoud', customerEmailPlaceholderEn: 'student@gmail.com',
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
    customerSingularEn: 'Customer', customerPluralEn: 'Customers',
    providerSingularEn: 'Technician / Team', providerPluralEn: 'Technicians & Maintenance Teams',
    serviceSingularEn: 'Visit Type', servicePluralEn: 'Maintenance Service Types',
    dashboardTitleEn: 'Maintenance & Home Visits Dashboard', dashboardSubtitleEn: 'Track technician visits, maintenance requests and travel fees.',
    addProviderButtonEn: 'Add Technician / Team',
    providerLabelEn: 'Technician / Team', providerTitleLabelEn: 'Specialty', providerNextSlotLabelEn: 'Next available visit',
    providerImageLabelEn: 'Technician photo URL (optional)', providerImagePlaceholderEn: 'https://example.com/technician.jpg',
    providerDefaultTitleEn: 'Maintenance Technician',
    customerNamePlaceholderEn: 'e.g. Hana Mostafa', customerEmailPlaceholderEn: 'customer@gmail.com',
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
    customerSingularEn: 'Client', customerPluralEn: 'Clients',
    providerSingularEn: 'Service Provider', providerPluralEn: 'Service Providers',
    serviceSingularEn: 'Service Type', servicePluralEn: 'General Service Types',
    dashboardTitleEn: 'Appointments & Consultations Dashboard', dashboardSubtitleEn: 'Track consultation appointments, service branches and booking rules.',
    addProviderButtonEn: 'Add Service Provider',
    providerLabelEn: 'Service Provider', providerTitleLabelEn: 'Expertise Type', providerNextSlotLabelEn: 'Next available slot',
    providerImageLabelEn: 'Provider photo URL (optional)', providerImagePlaceholderEn: 'https://example.com/provider.jpg',
    providerDefaultTitleEn: 'Service Provider',
    customerNamePlaceholderEn: 'e.g. Ahmed Samir', customerEmailPlaceholderEn: 'customer@gmail.com',
  },
};

export const getVocabulary = (activityType: BookingActivityType): ActivityVocabulary =>
  VOCABULARY[activityType] || VOCABULARY.clinic;

// ============================================
// Helper: localized labels (using i18n keys from business.json)
// ============================================
const isEn = (lang?: string) => String(lang || '').toLowerCase().startsWith('en');

export const getLocalizedActivityTitle = (activity: BookingActivityDefinition, lang?: string): string =>
  isEn(lang) ? (activity.titleEn || activity.title) : activity.title;

export const getLocalizedActivityDescription = (activity: BookingActivityDefinition, lang?: string): string =>
  isEn(lang) ? (activity.descriptionEn || activity.description) : activity.description;

export const getLocalizedButtonLabel = (btn: BookingButton, lang?: string): string =>
  isEn(lang) ? (btn.labelEn || btn.label) : btn.label;

export const getLocalizedModuleLabel = (mod: ActivityModule, lang?: string): string =>
  isEn(lang) ? (mod.labelEn || mod.label) : mod.label;

export const getLocalizedVocabulary = (activityType: BookingActivityType, lang?: string): ActivityVocabulary => {
  const vocab = getVocabulary(activityType);
  if (!isEn(lang)) return vocab;
  return {
    ...vocab,
    customerSingular: vocab.customerSingularEn || vocab.customerSingular,
    customerPlural: vocab.customerPluralEn || vocab.customerPlural,
    providerSingular: vocab.providerSingularEn || vocab.providerSingular,
    providerPlural: vocab.providerPluralEn || vocab.providerPlural,
    serviceSingular: vocab.serviceSingularEn || vocab.serviceSingular,
    servicePlural: vocab.servicePluralEn || vocab.servicePlural,
    dashboardTitle: vocab.dashboardTitleEn || vocab.dashboardTitle,
    dashboardSubtitle: vocab.dashboardSubtitleEn || vocab.dashboardSubtitle,
    addProviderButton: vocab.addProviderButtonEn || vocab.addProviderButton,
    providerLabel: vocab.providerLabelEn || vocab.providerLabel,
    providerTitleLabel: vocab.providerTitleLabelEn || vocab.providerTitleLabel,
    providerNextSlotLabel: vocab.providerNextSlotLabelEn || vocab.providerNextSlotLabel,
    providerImageLabel: vocab.providerImageLabelEn || vocab.providerImageLabel,
    providerImagePlaceholder: vocab.providerImagePlaceholderEn || vocab.providerImagePlaceholder,
    providerDefaultTitle: vocab.providerDefaultTitleEn || vocab.providerDefaultTitle,
    customerNamePlaceholder: vocab.customerNamePlaceholderEn || vocab.customerNamePlaceholder,
    customerEmailPlaceholder: vocab.customerEmailPlaceholderEn || vocab.customerEmailPlaceholder,
  };
};

export const getLocalizedActivityButtons = (activityType: BookingActivityType, lang?: string): BookingButton[] => {
  const modules = ACTIVITY_MODULES[activityType] || [];
  return modules.map((mod) => ({
    id: mod.id,
    label: getLocalizedModuleLabel(mod, lang),
    route: mod.route,
    icon: mod.icon,
  }));
};

export const getLocalizedDashboardButtons = (
  activityType: BookingActivityType,
  context: 'sidebar' | 'overview' | 'all',
  lang?: string
): BookingButton[] => {
  const shared = SHARED_BOOKING_BUTTONS;
  const specific = getLocalizedActivityButtons(activityType, lang);
  if (context === 'sidebar') {
    return [...shared.slice(0, 2), ...specific, ...shared.slice(2)];
  }
  if (context === 'overview') {
    return specific;
  }
  return [...shared, ...specific];
};

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

export const BOOKING_SETTINGS_PAGE_BUTTONS = [
  { id: 'booking-site', label: 'الموقع العام للحجوزات', labelEn: 'Booking Site' },
  { id: 'booking-security', label: 'الأمان والصلاحيات', labelEn: 'Security & Permissions' },
  { id: 'booking-notifications', label: 'إشعارات وتأكيدات', labelEn: 'Notifications & Confirmations' },
  { id: 'booking-payments', label: 'مدفوعات وتأمين', labelEn: 'Payments & Insurance' },
  { id: 'booking-cancellation', label: 'سياسات الإلغاء', labelEn: 'Cancellation Policies' },
  { id: 'booking-privacy', label: 'الخصوصية وبيانات العملاء', labelEn: 'Privacy & Customer Data' },
];

// الأزرار المشتركة للـ BusinessLayout
export type SharedDashboardButton = { id: string; label: string; route: string; icon: string };

export const SHARED_DASHBOARD_BUTTONS: SharedDashboardButton[] = [
  { id: 'overview', label: 'نظرة عامة', route: 'overview', icon: 'LayoutDashboard' },
  { id: 'bookings', label: 'الحجوزات', route: 'bookings', icon: 'CalendarCheck' },
  { id: 'design', label: 'التصميم', route: 'design', icon: 'Palette' },
  { id: 'settings', label: 'الإعدادات', route: 'settings', icon: 'Settings' },
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

// Helper: determine if a shop is a real booking activity.
// A shop is a booking activity ONLY if it has an explicit bookingActivityType
// that matches a known booking activity.
// The Category alone (e.g. SERVICE) is NOT enough — non-booking shops (أثاث، عقارات...)
// may also use SERVICE category and must NOT be treated as booking activities.
// businessActivityId is intentionally NOT checked here to keep regular activities
// completely separate from booking activities.
export const isShopBookingActivity = (shop?: any): boolean => {
  if (!shop) return false;
  const bookingActivityType = String(shop?.pageDesign?.bookingActivityType || '').trim();
  if (bookingActivityType) return !!getBookingActivityById(bookingActivityType);
  // Dev override: allow dev merchant switcher to preview a booking activity.
  if (import.meta.env?.DEV) {
    try {
      const devActivityId = String(localStorage.getItem('ray_dev_activity_id') || '').trim();
      if (devActivityId) return !!getBookingActivityById(devActivityId);
    } catch {}
  }
  // No explicit booking activity type found → NOT a booking activity.
  return false;
};

// Helper: get the effective booking activity type for a shop.
// Returns undefined for non-booking shops.
export const getShopBookingActivityType = (shop?: any): BookingActivityType | undefined => {
  if (!isShopBookingActivity(shop)) return undefined;
  const bookingActivityType = String(shop?.pageDesign?.bookingActivityType || '').trim() as BookingActivityType;
  if (getBookingActivityById(bookingActivityType)) return bookingActivityType;
  if (import.meta.env?.DEV) {
    try {
      const devActivityId = String(localStorage.getItem('ray_dev_activity_id') || '').trim() as BookingActivityType;
      if (getBookingActivityById(devActivityId)) return devActivityId;
    } catch {}
  }
  return undefined;
};
