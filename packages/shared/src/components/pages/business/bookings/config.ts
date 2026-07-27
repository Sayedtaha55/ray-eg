export type BookingActivityType =
  | 'clinic'
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

export interface BookingActivityDefinition {
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
}

export interface ActivityVocabulary {
  dashboardTitle: string;
  dashboardTitleEn?: string;
  dashboardSubtitle: string;
  dashboardSubtitleEn?: string;
  serviceSingular: string;
  serviceSingularEn?: string;
  servicePlural: string;
  servicePluralEn?: string;
  customerSingular: string;
  customerSingularEn?: string;
  customerPlural: string;
  customerPluralEn?: string;
  providerSingular: string;
  providerSingularEn?: string;
  providerPlural: string;
  providerPluralEn?: string;
  addProviderButton: string;
  addProviderButtonEn?: string;
  providerLabel: string;
  providerLabelEn?: string;
  providerTitleLabel: string;
  providerTitleLabelEn?: string;
  providerNextSlotLabel: string;
  providerNextSlotLabelEn?: string;
  providerImageLabel: string;
  providerImageLabelEn?: string;
  providerImagePlaceholder: string;
  providerImagePlaceholderEn?: string;
  providerDefaultTitle: string;
  providerDefaultTitleEn?: string;
  customerNamePlaceholder: string;
  customerNamePlaceholderEn?: string;
  customerEmailPlaceholder: string;
  customerEmailPlaceholderEn?: string;
}

const buildVocabulary = (params: {
  dashboardTitle: string;
  dashboardTitleEn: string;
  dashboardSubtitle: string;
  dashboardSubtitleEn: string;
  serviceSingular: string;
  serviceSingularEn: string;
  servicePlural: string;
  servicePluralEn: string;
  customerSingular: string;
  customerSingularEn: string;
  customerPlural: string;
  customerPluralEn: string;
  providerSingular: string;
  providerSingularEn: string;
  providerPlural: string;
  providerPluralEn: string;
  addProviderButton: string;
  addProviderButtonEn: string;
  providerLabel: string;
  providerLabelEn: string;
  providerTitleLabel: string;
  providerTitleLabelEn: string;
  providerNextSlotLabel: string;
  providerNextSlotLabelEn: string;
  providerImageLabel: string;
  providerImageLabelEn: string;
  providerImagePlaceholder: string;
  providerImagePlaceholderEn: string;
  providerDefaultTitle: string;
  providerDefaultTitleEn: string;
  customerNamePlaceholder: string;
  customerNamePlaceholderEn: string;
  customerEmailPlaceholder: string;
  customerEmailPlaceholderEn: string;
}): ActivityVocabulary => ({
  ...params,
});

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
    specialties: ['شاليه عائلي', 'شاليه شبابي', 'فيلا خاصة', 'منتجع كامل', 'مسبح خاص', 'شاطئ وبحيرة', 'BBQ', 'تجهيزات مناسبات', 'إقامة ليلة', 'إقامة نهارية'],
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
    description: 'حجوزات مرنة للخدمات التي تحتاج مواعيد فقط.',
    descriptionEn: 'Flexible reservations for services that only need appointments.',
    folderName: 'appointments',
    primaryTabLabel: 'المواعيد',
    primaryTabLabelEn: 'Appointments',
    secondaryTabLabel: 'الخدمات',
    secondaryTabLabelEn: 'Services',
    extraButtons: ['مواعيد اليوم', 'سياسات الحجز'],
    extraButtonsEn: ['Today\'s Appointments', 'Booking Policies'],
    specialties: ['استشارات', 'حجوزات عامة', 'جلسات فردية'],
    specialtiesEn: ['Consultations', 'General Reservations', 'One-on-One Sessions'],
  },
];

const isEn = (lang?: string) => String(lang || '').toLowerCase().startsWith('en');

const makeVocab = (params: {
  dashboardTitle: string;
  dashboardTitleEn: string;
  dashboardSubtitle: string;
  dashboardSubtitleEn: string;
  serviceSingular: string;
  serviceSingularEn: string;
  servicePlural: string;
  servicePluralEn: string;
  customerSingular: string;
  customerSingularEn: string;
  customerPlural: string;
  customerPluralEn: string;
  providerSingular: string;
  providerSingularEn: string;
  providerPlural: string;
  providerPluralEn: string;
}): ActivityVocabulary => ({
  ...params,
  addProviderButton: `إضافة ${params.providerSingular}`,
  addProviderButtonEn: `Add ${params.providerSingularEn}`,
  providerLabel: params.providerSingular,
  providerLabelEn: params.providerSingularEn,
  providerTitleLabel: `اسم ${params.providerSingular}`,
  providerTitleLabelEn: `${params.providerSingularEn} Name`,
  providerNextSlotLabel: 'أقرب موعد',
  providerNextSlotLabelEn: 'Next Slot',
  providerImageLabel: `صورة ${params.providerSingular}`,
  providerImageLabelEn: `${params.providerSingularEn} Image`,
  providerImagePlaceholder: `اختر صورة ${params.providerSingular}`,
  providerImagePlaceholderEn: `Choose ${params.providerSingularEn} image`,
  providerDefaultTitle: `${params.providerSingular} جديد`,
  providerDefaultTitleEn: `New ${params.providerSingularEn}`,
  customerNamePlaceholder: `اسم ${params.customerSingular}`,
  customerNamePlaceholderEn: `${params.customerSingularEn} name`,
  customerEmailPlaceholder: `بريد ${params.customerSingular}`,
  customerEmailPlaceholderEn: `${params.customerSingularEn} email`,
});

export const VOCABULARY: Record<BookingActivityType, ActivityVocabulary> = {
  clinic: makeVocab({ dashboardTitle: 'لوحة العيادات', dashboardTitleEn: 'Clinics Dashboard', dashboardSubtitle: 'إدارة العيادات والأطباء والمواعيد', dashboardSubtitleEn: 'Manage clinics, doctors, and appointments', serviceSingular: 'خدمة', serviceSingularEn: 'Service', servicePlural: 'الخدمات', servicePluralEn: 'Services', customerSingular: 'مريض', customerSingularEn: 'Patient', customerPlural: 'المرضى', customerPluralEn: 'Patients', providerSingular: 'طبيب', providerSingularEn: 'Doctor', providerPlural: 'الأطباء', providerPluralEn: 'Doctors' }),
  salon_barber: makeVocab({ dashboardTitle: 'لوحة الصالون', dashboardTitleEn: 'Salon Dashboard', dashboardSubtitle: 'إدارة الخبراء والمواعيد والخدمات', dashboardSubtitleEn: 'Manage experts, appointments, and services', serviceSingular: 'خدمة', serviceSingularEn: 'Service', servicePlural: 'الخدمات', servicePluralEn: 'Services', customerSingular: 'عميل', customerSingularEn: 'Client', customerPlural: 'العملاء', customerPluralEn: 'Clients', providerSingular: 'خبير', providerSingularEn: 'Expert', providerPlural: 'الخبراء', providerPluralEn: 'Experts' }),
  wellness_spa: makeVocab({ dashboardTitle: 'لوحة السبا', dashboardTitleEn: 'Spa Dashboard', dashboardSubtitle: 'إدارة الجلسات والمعالجين', dashboardSubtitleEn: 'Manage sessions and therapists', serviceSingular: 'جلسة', serviceSingularEn: 'Session', servicePlural: 'الجلسات', servicePluralEn: 'Sessions', customerSingular: 'ضيف', customerSingularEn: 'Guest', customerPlural: 'الضيوف', customerPluralEn: 'Guests', providerSingular: 'معالج', providerSingularEn: 'Therapist', providerPlural: 'المعالجون', providerPluralEn: 'Therapists' }),
  chalets_resorts: makeVocab({ dashboardTitle: 'لوحة الشاليهات', dashboardTitleEn: 'Chalets Dashboard', dashboardSubtitle: 'إدارة الوحدات والتوافر والحجوزات', dashboardSubtitleEn: 'Manage units, availability, and bookings', serviceSingular: 'وحدة', serviceSingularEn: 'Unit', servicePlural: 'الوحدات', servicePluralEn: 'Units', customerSingular: 'ضيف', customerSingularEn: 'Guest', customerPlural: 'الضيوف', customerPluralEn: 'Guests', providerSingular: 'مدير', providerSingularEn: 'Manager', providerPlural: 'المدراء', providerPluralEn: 'Managers' }),
  hotels_rooms: makeVocab({ dashboardTitle: 'لوحة الفنادق', dashboardTitleEn: 'Hotels Dashboard', dashboardSubtitle: 'إدارة الغرف والأجنحة والخدمات', dashboardSubtitleEn: 'Manage rooms, suites, and services', serviceSingular: 'غرفة', serviceSingularEn: 'Room', servicePlural: 'الغرف', servicePluralEn: 'Rooms', customerSingular: 'نزيل', customerSingularEn: 'Guest', customerPlural: 'النزلاء', customerPluralEn: 'Guests', providerSingular: 'موظف', providerSingularEn: 'Staff Member', providerPlural: 'الموظفون', providerPluralEn: 'Staff Members' }),
  restaurants_tables: makeVocab({ dashboardTitle: 'لوحة المطعم', dashboardTitleEn: 'Restaurant Dashboard', dashboardSubtitle: 'إدارة الطاولات والحجوزات', dashboardSubtitleEn: 'Manage tables and bookings', serviceSingular: 'طاولة', serviceSingularEn: 'Table', servicePlural: 'الطاولات', servicePluralEn: 'Tables', customerSingular: 'زبون', customerSingularEn: 'Customer', customerPlural: 'الزبائن', customerPluralEn: 'Customers', providerSingular: 'مشرف', providerSingularEn: 'Host', providerPlural: 'المشرفون', providerPluralEn: 'Hosts' }),
  events_venues: makeVocab({ dashboardTitle: 'لوحة الفعاليات', dashboardTitleEn: 'Events Dashboard', dashboardSubtitle: 'إدارة القاعات والفعاليات', dashboardSubtitleEn: 'Manage venues and events', serviceSingular: 'فعالية', serviceSingularEn: 'Event', servicePlural: 'الفعاليات', servicePluralEn: 'Events', customerSingular: 'حضور', customerSingularEn: 'Attendee', customerPlural: 'الحضور', customerPluralEn: 'Attendees', providerSingular: 'منظم', providerSingularEn: 'Organizer', providerPlural: 'المنظمون', providerPluralEn: 'Organizers' }),
  vehicle_rental: makeVocab({ dashboardTitle: 'لوحة التأجير', dashboardTitleEn: 'Rental Dashboard', dashboardSubtitle: 'إدارة المركبات والحجوزات', dashboardSubtitleEn: 'Manage vehicles and bookings', serviceSingular: 'مركبة', serviceSingularEn: 'Vehicle', servicePlural: 'المركبات', servicePluralEn: 'Vehicles', customerSingular: 'مستأجر', customerSingularEn: 'Renter', customerPlural: 'المستأجرون', customerPluralEn: 'Renters', providerSingular: 'موظف', providerSingularEn: 'Agent', providerPlural: 'الموظفون', providerPluralEn: 'Agents' }),
  sports_trainers: makeVocab({ dashboardTitle: 'لوحة الرياضة', dashboardTitleEn: 'Sports Dashboard', dashboardSubtitle: 'إدارة الملاعب والمدربين', dashboardSubtitleEn: 'Manage courts and trainers', serviceSingular: 'حصة', serviceSingularEn: 'Session', servicePlural: 'الحصص', servicePluralEn: 'Sessions', customerSingular: 'لاعب', customerSingularEn: 'Player', customerPlural: 'اللاعبون', customerPluralEn: 'Players', providerSingular: 'مدرب', providerSingularEn: 'Trainer', providerPlural: 'المدربون', providerPluralEn: 'Trainers' }),
  education_courses: makeVocab({ dashboardTitle: 'لوحة التعليم', dashboardTitleEn: 'Education Dashboard', dashboardSubtitle: 'إدارة الدورات والحصص', dashboardSubtitleEn: 'Manage courses and classes', serviceSingular: 'حصة', serviceSingularEn: 'Class', servicePlural: 'الحصص', servicePluralEn: 'Classes', customerSingular: 'طالب', customerSingularEn: 'Student', customerPlural: 'الطلاب', customerPluralEn: 'Students', providerSingular: 'مدرس', providerSingularEn: 'Instructor', providerPlural: 'المدرسون', providerPluralEn: 'Instructors' }),
  maintenance_services: makeVocab({ dashboardTitle: 'لوحة الصيانة', dashboardTitleEn: 'Maintenance Dashboard', dashboardSubtitle: 'إدارة الخدمات والزيارات المنزلية', dashboardSubtitleEn: 'Manage services and home visits', serviceSingular: 'زيارة', serviceSingularEn: 'Visit', servicePlural: 'الزيارات', servicePluralEn: 'Visits', customerSingular: 'عميل', customerSingularEn: 'Customer', customerPlural: 'العملاء', customerPluralEn: 'Customers', providerSingular: 'فني', providerSingularEn: 'Technician', providerPlural: 'الفنيون', providerPluralEn: 'Technicians' }),
  general_appointments: makeVocab({ dashboardTitle: 'لوحة المواعيد', dashboardTitleEn: 'Appointments Dashboard', dashboardSubtitle: 'إدارة المواعيد العامة', dashboardSubtitleEn: 'Manage general appointments', serviceSingular: 'موعد', serviceSingularEn: 'Appointment', servicePlural: 'المواعيد', servicePluralEn: 'Appointments', customerSingular: 'عميل', customerSingularEn: 'Customer', customerPlural: 'العملاء', customerPluralEn: 'Customers', providerSingular: 'مقدم خدمة', providerSingularEn: 'Provider', providerPlural: 'مقدمو الخدمة', providerPluralEn: 'Providers' }),
};

export const getBookingActivityById = (id?: unknown): BookingActivityDefinition | undefined => {
  const normalized = String(id || '').trim() as BookingActivityType;
  return BOOKING_ACTIVITIES.find((a) => a.id === normalized);
};

export const getBookingActivityDefinition = (raw?: unknown): BookingActivityDefinition => {
  const id = String(raw || '').trim() as BookingActivityType;
  return BOOKING_ACTIVITIES.find((activity) => activity.id === id) || BOOKING_ACTIVITIES[0];
};

export const getVocabulary = (activityType: BookingActivityType): ActivityVocabulary => VOCABULARY[activityType] || VOCABULARY.clinic;

export const getLocalizedVocabulary = (activityType: BookingActivityType, lang?: string): ActivityVocabulary => {
  const vocab = getVocabulary(activityType);
  if (!isEn(lang)) return vocab;
  return {
    ...vocab,
    dashboardTitle: vocab.dashboardTitleEn || vocab.dashboardTitle,
    dashboardSubtitle: vocab.dashboardSubtitleEn || vocab.dashboardSubtitle,
    serviceSingular: vocab.serviceSingularEn || vocab.serviceSingular,
    servicePlural: vocab.servicePluralEn || vocab.servicePlural,
    customerSingular: vocab.customerSingularEn || vocab.customerSingular,
    customerPlural: vocab.customerPluralEn || vocab.customerPlural,
    providerSingular: vocab.providerSingularEn || vocab.providerSingular,
    providerPlural: vocab.providerPluralEn || vocab.providerPlural,
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

export const getLocalizedActivityTitle = (activity: BookingActivityDefinition, lang?: string): string =>
  isEn(lang) ? (activity.titleEn || activity.title) : activity.title;

export const getLocalizedActivityDescription = (activity: BookingActivityDefinition, lang?: string): string =>
  isEn(lang) ? (activity.descriptionEn || activity.description) : activity.description;

export const getLocalizedActivityButtons = (activityType: BookingActivityType, lang?: string) => {
  const activity = getBookingActivityById(activityType);
  if (!activity) return [];
  const buttons = isEn(lang) ? (activity.extraButtonsEn || activity.extraButtons) : activity.extraButtons;
  return buttons.map((label, index) => ({ id: `${activityType}-${index + 1}`, label, route: '', icon: '' }));
};

export const getLocalizedDashboardButtons = (
  activityType: BookingActivityType,
  context: 'sidebar' | 'overview' | 'all',
  lang?: string,
) => {
  const buttons = getLocalizedActivityButtons(activityType, lang);
  if (context === 'overview') return buttons;
  return buttons;
};

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

export const BOOKING_ROUTE_ACTIVITY_MAP: Record<string, BookingActivityType> = Object.entries(BOOKING_ACTIVITY_ROUTE_MAP)
  .reduce((acc, [activityType, route]) => {
    acc[route] = activityType as BookingActivityType;
    return acc;
  }, {} as Record<string, BookingActivityType>);

export const getBookingRouteFromActivityType = (raw?: unknown): string => {
  const id = String(raw || '').trim() as BookingActivityType;
  const activity = getBookingActivityById(id);
  return BOOKING_ACTIVITY_ROUTE_MAP[activity?.id || 'clinic'] || 'clinic';
};

export const isBookingActivityRoute = (pathSegment?: unknown): boolean => Boolean(BOOKING_ROUTE_ACTIVITY_MAP[String(pathSegment || '').trim().toLowerCase()]);

export const getBookingActivityTypeFromPath = (pathSegment: string): BookingActivityType =>
  BOOKING_ROUTE_ACTIVITY_MAP[String(pathSegment || '').trim().toLowerCase()] || 'clinic';

export const getBookingActivityTypeFromParam = (param: string): BookingActivityType => {
  const normalized = String(param || '').trim().toLowerCase();
  const map: Record<string, BookingActivityType> = {
    clinic: 'clinic', clinics: 'clinic',
    salon: 'salon_barber', salons: 'salon_barber',
    spa: 'wellness_spa', wellness: 'wellness_spa',
    chalets: 'chalets_resorts', chalet: 'chalets_resorts',
    hotels: 'hotels_rooms', hotel: 'hotels_rooms',
    restaurants: 'restaurants_tables', restaurant: 'restaurants_tables',
    events: 'events_venues', event: 'events_venues',
    rental: 'vehicle_rental',
    sports: 'sports_trainers', sport: 'sports_trainers',
    education: 'education_courses', courses: 'education_courses',
    maintenance: 'maintenance_services',
    appointments: 'general_appointments',
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

export const getBookingActivityExtraPageId = (label: string, index = 0): string => {
  const normalized = String(label || '')
    .trim()
    .replace(/[ً-ٰٟ]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
  return normalized || `extra-${index + 1}`;
};

export const getBookingActivityScopedList = (
  pageDesign: any,
  activityType: BookingActivityType,
  scope: 'providers' | 'services',
): any[] => {
  const activityData = pageDesign?.bookingActivityData?.[activityType];
  if (!activityData) return [];
  if (scope === 'providers') return activityData.providers || [];
  return activityData.services || [];
};

export const BOOKING_ACTIVITY_DEFINITIONS = BOOKING_ACTIVITIES;

export const isShopBookingActivity = (shop?: any): boolean => {
  if (!shop) return false;
  const bookingActivityType = String(shop?.pageDesign?.bookingActivityType || '').trim();
  if (bookingActivityType) return !!getBookingActivityById(bookingActivityType);
  if (import.meta.env?.DEV) {
    try {
      const devActivityId = String(localStorage.getItem('ray_dev_activity_id') || '').trim();
      if (devActivityId) return !!getBookingActivityById(devActivityId);
    } catch {
    }
  }
  return false;
};

export const getShopBookingActivityType = (shop?: any): BookingActivityType | undefined => {
  if (!isShopBookingActivity(shop)) return undefined;
  const bookingActivityType = String(shop?.pageDesign?.bookingActivityType || '').trim() as BookingActivityType;
  if (getBookingActivityById(bookingActivityType)) return bookingActivityType;
  if (import.meta.env?.DEV) {
    try {
      const devActivityId = String(localStorage.getItem('ray_dev_activity_id') || '').trim() as BookingActivityType;
      if (getBookingActivityById(devActivityId)) return devActivityId;
    } catch {
    }
  }
  return undefined;
};

export const getDefaultActivity = (): BookingActivityDefinition => BOOKING_ACTIVITIES[0];

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
