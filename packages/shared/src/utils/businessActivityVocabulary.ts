// ═══════════════════════════════════════════
// المعجم اللغوي لكل نشاط تجاري (عربي + إنجليزي)
// يحتوي على كل النصوص التي تظهر في لوحة التحكم
// مخصصة لكل نشاط (سيارات، عقارات، مطاعم، إلخ)
// ═══════════════════════════════════════════

export type BusinessActivityVocabulary = {
  dashboardTitle: string;
  dashboardSubtitle: string;
  productSingular: string;
  productPlural: string;
  customerSingular: string;
  customerPlural: string;
  productsTabLabel: string;
  galleryTabLabel: string;
  addProductButton: string;
  emptyProductsMessage: string;
  searchProductsPlaceholder: string;
  defaultShopName: string;
  defaultShopDescription: string;
  salesTabLabel: string;
  promotionsTabLabel: string;
  reportsTabLabel: string;
  customersTabLabel: string;
  overviewTabLabel: string;
  settingsTabLabel: string;
};

const makeVocab = (
  dashboardTitle: string,
  dashboardSubtitle: string,
  productSingular: string,
  productPlural: string,
  customerSingular: string,
  customerPlural: string,
  productsTabLabel: string,
  galleryTabLabel: string,
  addProductButton: string,
  emptyProductsMessage: string,
  searchProductsPlaceholder: string,
  defaultShopName: string,
  defaultShopDescription: string,
  extras: Partial<BusinessActivityVocabulary> = {},
): BusinessActivityVocabulary => ({
  dashboardTitle,
  dashboardSubtitle,
  productSingular,
  productPlural,
  customerSingular,
  customerPlural,
  productsTabLabel,
  galleryTabLabel,
  addProductButton,
  emptyProductsMessage,
  searchProductsPlaceholder,
  defaultShopName,
  defaultShopDescription,
  salesTabLabel: 'المبيعات',
  promotionsTabLabel: 'العروض',
  reportsTabLabel: 'التقارير',
  customersTabLabel: customerPlural,
  overviewTabLabel: 'نظرة عامة',
  settingsTabLabel: 'الإعدادات',
  ...extras,
});

const makeVocabEn = (
  dashboardTitle: string,
  dashboardSubtitle: string,
  productSingular: string,
  productPlural: string,
  customerSingular: string,
  customerPlural: string,
  productsTabLabel: string,
  galleryTabLabel: string,
  addProductButton: string,
  emptyProductsMessage: string,
  searchProductsPlaceholder: string,
  defaultShopName: string,
  defaultShopDescription: string,
  extras: Partial<BusinessActivityVocabulary> = {},
): BusinessActivityVocabulary => ({
  dashboardTitle,
  dashboardSubtitle,
  productSingular,
  productPlural,
  customerSingular,
  customerPlural,
  productsTabLabel,
  galleryTabLabel,
  addProductButton,
  emptyProductsMessage,
  searchProductsPlaceholder,
  defaultShopName,
  defaultShopDescription,
  salesTabLabel: 'Sales',
  promotionsTabLabel: 'Promotions',
  reportsTabLabel: 'Reports',
  customersTabLabel: customerPlural,
  overviewTabLabel: 'Overview',
  settingsTabLabel: 'Settings',
  ...extras,
});

export const BUSINESS_ACTIVITY_VOCABULARY: Record<string, BusinessActivityVocabulary> = {
  // ═══════════════════════════════════════════
  // مطاعم وأغذية
  // ═══════════════════════════════════════════
  restaurant: makeVocab(
    'لوحة تحكم المطعم', 'تابع الطلبات، المنيو، الطاولات وأداء المطعم اليوم.',
    'طبق', 'الأطباق', 'عميل', 'العملاء',
    'المنيو', 'صور الأطباق', 'إضافة طبق جديد',
    'لا توجد أطباق في المنيو بعد', 'ابحث عن طبق...',
    'مطعم الذواقة', 'أكل بيتي أصيل بنكهة مصرية',
    { productsTabLabel: 'المنيو', salesTabLabel: 'الطلبات', promotionsTabLabel: 'عروض الوجبات' },
  ),
  grocery: makeVocab(
    'لوحة تحكم البقالة', 'تابع المنتجات، الأقسام، المخزون والعروض اليومية.',
    'منتج', 'المنتجات', 'عميل', 'العملاء',
    'المنتجات', 'صور المنتجات', 'إضافة منتج جديد',
    'لا توجد منتجات بعد', 'ابحث عن منتج...',
    'بقالة الخير', 'كل احتياجاتك اليومية في مكان واحد',
    { promotionsTabLabel: 'عروض الأقسام' },
  ),

  // ═══════════════════════════════════════════
  // ملابس ومفروشات وأثاث
  // ═══════════════════════════════════════════
  fashion: makeVocab(
    'لوحة تحكم الملابس والأزياء', 'تابع الموديلات، المقاسات، المبيعات والعروض الموسمية.',
    'موديل', 'الموديلات', 'عميل', 'العملاء',
    'الموديلات', 'صور الموديلات', 'إضافة موديل جديد',
    'لا توجد موديلات بعد', 'ابحث عن موديل...',
    'بوتيك الأناقة', 'أحدث صيحات الموضة والملابس',
    { promotionsTabLabel: 'عروض الكوليكشن' },
  ),
  homeTextiles: makeVocab(
    'لوحة تحكم المفروشات والسجاد', 'تابع المفروشات، السجاد، الستائر والطلبات المخصصة.',
    'قطعة', 'المفروشات', 'عميل', 'العملاء',
    'المفروشات', 'صور المفروشات', 'إضافة قطعة جديدة',
    'لا توجد مفروشات بعد', 'ابحث عن قطعة مفروشات...',
    'مفروشات النخبة', 'مفروشات وسجاد وستائر بجودة عالية',
  ),
  fabricStore: makeVocab(
    'لوحة تحكم الأقمشة والتفصيل', 'تابع الأقمشة، الخامات، الطلبات المترية والتفصيل.',
    'قماش', 'الأقمشة', 'عميل', 'العملاء',
    'الأقمشة', 'صور الأقمشة', 'إضافة قماش جديد',
    'لا توجد أقمشة بعد', 'ابحث عن قماش...',
    'محل الأقمشة', 'أقمشة ملابس ومفروشات وتفصيل حسب الطلب',
  ),
  curtainsBlinds: makeVocab(
    'لوحة تحكم الستائر والبراقع', 'تابع الستائر، المقاسات، التفصيل وخدمات التركيب.',
    'ستارة', 'الستائر', 'عميل', 'العملاء',
    'الستائر', 'صور الستائر', 'إضافة ستارة جديدة',
    'لا توجد ستائر بعد', 'ابحث عن ستارة...',
    'ستائر الأناقة', 'ستائر وبراقع وبلاك أوت بتفصيل وتركيب',
  ),
  sofasUpholstery: makeVocab(
    'لوحة تحكم الكنب والتنجيد', 'تابع موديلات الكنب، التنجيد، التصنيع والصيانة.',
    'كنبة', 'الكنب', 'عميل', 'العملاء',
    'الكنب والركنات', 'صور الكنب', 'إضافة موديل كنب جديد',
    'لا توجد موديلات كنب بعد', 'ابحث عن موديل كنب...',
    'معرض الكنب', 'كنب وانتريهات وتنجيد بتصنيع حسب المقاس',
  ),
  mattressesBedding: makeVocab(
    'لوحة تحكم المراتب والمستلزمات', 'تابع المراتب، الملايات، المفارش والطلبات.',
    'مرتبة', 'المراتب', 'عميل', 'العملاء',
    'المراتب', 'صور المراتب', 'إضافة مرتبة جديدة',
    'لا توجد مراتب بعد', 'ابحث عن مرتبة...',
    'مراتب الراحة', 'مراتب وملايات ومستلزمات نوم',
  ),
  furniture: makeVocab(
    'لوحة تحكم الأثاث والديكور', 'تابع الغرف، المعروضات، التصنيع والتركيب.',
    'قطعة أثاث', 'الأثاث', 'عميل', 'العملاء',
    'الأثاث', 'صور الأثاث', 'إضافة قطعة أثاث جديدة',
    'لا توجد قطع أثاث بعد', 'ابحث عن قطعة أثاث...',
    'معرض الأثاث', 'أثاث وديكور وتصنيع حسب الطلب',
  ),
  homeGoods: makeVocab(
    'لوحة تحكم مستلزمات المنزل', 'تابع المنتجات، الأقسام، الضمان والاستبدال.',
    'منتج', 'المنتجات', 'عميل', 'العملاء',
    'المنتجات', 'صور المنتجات', 'إضافة منتج جديد',
    'لا توجد منتجات بعد', 'ابحث عن منتج...',
    'مستلزمات المنزل', 'أدوات منزلية ومطبخ وتنظيم',
  ),

  // ═══════════════════════════════════════════
  // دهب ومجوهرات وساعات
  // ═══════════════════════════════════════════
  goldJewelry: makeVocab(
    'لوحة تحكم الذهب والمجوهرات', 'تابع المشغولات، العيارات، المصنعية والصيانة.',
    'قطعة ذهب', 'الذهب والمجوهرات', 'عميل', 'العملاء',
    'المشغولات', 'صور المشغولات', 'إضافة قطعة ذهب جديدة',
    'لا توجد مشغولات بعد', 'ابحث عن قطعة ذهب...',
    'مجوهرات النخبة', 'ذهب ومجوهرات وألماس بضمان',
  ),
  silverAccessories: makeVocab(
    'لوحة تحكم الفضة والإكسسوارات', 'تابع الفضة، الإكسسوارات، النقش والهدايا.',
    'قطعة', 'الإكسسوارات', 'عميل', 'العملاء',
    'الفضة والإكسسوارات', 'صور الإكسسوارات', 'إضافة قطعة جديدة',
    'لا توجد إكسسوارات بعد', 'ابحث عن قطعة...',
    'فضة وأناقة', 'فضة وإكسسوارات وهدايا بنقش مخصص',
  ),
  watchesGifts: makeVocab(
    'لوحة تحكم الساعات والهدايا', 'تابع الساعات، الأطقم، الضمان والصيانة.',
    'ساعة', 'الساعات', 'عميل', 'العملاء',
    'الساعات', 'صور الساعات', 'إضافة ساعة جديدة',
    'لا توجد ساعات بعد', 'ابحث عن ساعة...',
    'ساعات وهدايا', 'ساعات فاخرة وهدايا وضمان',
  ),

  // ═══════════════════════════════════════════
  // عقارات ومقاولات
  // ═══════════════════════════════════════════
  realEstate: makeVocab(
    'لوحة تحكم العقارات', 'تابع الوحدات، الطلبات، المعاينات والعملاء.',
    'عقار', 'العقارات', 'عميل', 'العملاء',
    'العقارات', 'صور العقارات', 'إضافة عقار جديد',
    'لا توجد عقارات بعد', 'ابحث عن عقار...',
    'العقارات الذهبية', 'شقق وفيلات ومحلات للبيع والإيجار',
    { addProductButton: 'إضافة عقار جديد', salesTabLabel: 'الصفقات' },
  ),
  lands: makeVocab(
    'لوحة تحكم الأراضي', 'تابع قطع الأراضي، المستندات، المرافق والطلبات.',
    'قطعة أرض', 'الأراضي', 'مستثمر', 'المستثمرين',
    'الأراضي', 'صور الأراضي', 'إضافة قطعة أرض جديدة',
    'لا توجد أراضي بعد', 'ابحث عن قطعة أرض...',
    'أراضي الاستثمار', 'أراضي سكنية وتجارية وزراعية',
    { addProductButton: 'إضافة قطعة أرض', salesTabLabel: 'الصفقات' },
  ),
  contractors: makeVocab(
    'لوحة تحكم المقاولات والتشطيبات', 'تابع المشروعات، المقايسات، الفرق والخامات.',
    'مشروع', 'المشروعات', 'عميل', 'العملاء',
    'المشروعات', 'صور المشروعات', 'إضافة مشروع جديد',
    'لا توجد مشروعات بعد', 'ابحث عن مشروع...',
    'مقاولات النخبة', 'تشطيبات ومقاولات وتصميم داخلي',
  ),
  building_supplies: makeVocab(
    'لوحة تحكم مواد البناء', 'تابع الأسمنت، الحديد، الدهانات والتوريد.',
    'صنف', 'الأصناف', 'عميل', 'العملاء',
    'مواد البناء', 'صور المنتجات', 'إضافة صنف جديد',
    'لا توجد أصناف بعد', 'ابحث عن صنف...',
    'مواد البناء', 'أسمنت وحديد ودهانات وأدوات بناء',
  ),

  // ═══════════════════════════════════════════
  // سيارات ومعارض وورش
  // ═══════════════════════════════════════════
  carShowroom: makeVocab(
    'لوحة تحكم معرض السيارات', 'تابع السيارات، المعاينات، التقسيط والعملاء.',
    'سيارة', 'السيارات', 'عميل', 'العملاء',
    'السيارات', 'صور السيارات', 'إضافة سيارة جديدة',
    'لا توجد سيارات في المعرض بعد', 'ابحث عن سيارة...',
    'معرض السيارات', 'سيارات جديدة ومستعملة بتقسيط وتمويل',
    { salesTabLabel: 'صفقات السيارات', promotionsTabLabel: 'عروض السيارات' },
  ),
  auto_services: makeVocab(
    'لوحة تحكم ورشة السيارات', 'تابع أوامر الصيانة، الفنيين، المواعيد والفحص.',
    'خدمة', 'الخدمات', 'عميل', 'العملاء',
    'الخدمات', 'صور الورشة', 'إضافة خدمة جديدة',
    'لا توجد خدمات بعد', 'ابحث عن خدمة...',
    'ورشة السيارات', 'ميكانيكا وكهرباء وسمكرة ودهان وصيانة',
  ),
  auto_parts: makeVocab(
    'لوحة تحكم قطع الغيار', 'تابع القطع، الإطارات، البطاريات والتوافق.',
    'قطعة غيار', 'قطع الغيار', 'عميل', 'العملاء',
    'قطع الغيار', 'صور القطع', 'إضافة قطعة غيار جديدة',
    'لا توجد قطع غيار بعد', 'ابحث عن قطعة غيار...',
    'قطع غيار السيارات', 'قطع غيار وإطارات وبطاريات وإكسسوارات',
  ),

  // ═══════════════════════════════════════════
  // زراعة ومستلزمات
  // ═══════════════════════════════════════════
  agri_supplies: makeVocab(
    'لوحة تحكم المستلزمات الزراعية', 'تابع البذور، الشتلات، الأسمدة والمبيدات.',
    'منتج زراعي', 'المنتجات الزراعية', 'عميل', 'العملاء',
    'المنتجات الزراعية', 'صور المنتجات', 'إضافة منتج زراعي جديد',
    'لا توجد منتجات زراعية بعد', 'ابحث عن منتج زراعي...',
    'المستلزمات الزراعية', 'بذور وشتلات وأسمدة ومبيدات',
  ),
  nurseries_landscaping: makeVocab(
    'لوحة تحكم المشتل والحدائق', 'تابع النباتات، تصميم الحدائق، الصيانة والري.',
    'نبتة', 'النباتات', 'عميل', 'العملاء',
    'النباتات', 'صور النباتات', 'إضافة نبتة جديدة',
    'لا توجد نباتات بعد', 'ابحث عن نبتة...',
    'مشتل الحدائق', 'نباتات وتنسيق حدائق وري وصيانة',
  ),

  // ═══════════════════════════════════════════
  // خدمات شركات وأفراد
  // ═══════════════════════════════════════════
  serviceCompanies: makeVocab(
    'لوحة تحكم شركة الخدمات', 'تابع الخدمات، الباقات، الفرق ومناطق الخدمة.',
    'خدمة', 'الخدمات', 'عميل', 'العملاء',
    'الخدمات', 'صور الخدمات', 'إضافة خدمة جديدة',
    'لا توجد خدمات بعد', 'ابحث عن خدمة...',
    'شركة الخدمات', 'صيانة وتنظيف وأمن ونقل وخدمات',
  ),
  individualTechnicians: makeVocab(
    'لوحة تحكم الفني المستقل', 'تابع المهارات، المواعيد، الزيارات والمناطق.',
    'خدمة', 'الخدمات', 'عميل', 'العملاء',
    'الخدمات', 'صور الأعمال', 'إضافة خدمة جديدة',
    'لا توجد خدمات بعد', 'ابحث عن خدمة...',
    'الفني المحترف', 'سباك وكهربائي ونجار ونقاش وتكييف',
  ),
  workshops: makeVocab(
    'لوحة تحكم الورشة', 'تابع أوامر الشغل، التصنيع، الإصلاح والخامات.',
    'عمل', 'أعمال الورشة', 'عميل', 'العملاء',
    'أعمال الورشة', 'صور الأعمال', 'إضافة عمل جديد',
    'لا توجد أعمال بعد', 'ابحث عن عمل...',
    'الورشة', 'نجارة وحدادة وألوميتال وزجاج وتصنيع',
  ),

  // ═══════════════════════════════════════════
  // إلكترونيات وصحة
  // ═══════════════════════════════════════════
  electronics: makeVocab(
    'لوحة تحكم الإلكترونيات', 'تابع الأجهزة، الإكسسوارات، الصيانة والضمان.',
    'جهاز', 'الأجهزة', 'عميل', 'العملاء',
    'الأجهزة', 'صور الأجهزة', 'إضافة جهاز جديد',
    'لا توجد أجهزة بعد', 'ابحث عن جهاز...',
    'إلكترونيات تك', 'موبايلات وكمبيوترات وإكسسوارات وصيانة',
  ),
  health: makeVocab(
    'لوحة تحكم الصيدلية', 'تابع الأدوية، المستحضرات، الروشتات والطلبات المتكررة.',
    'دواء', 'الأدوية', 'عميل', 'العملاء',
    'الأدوية والمنتجات', 'صور المنتجات', 'إضافة دواء/منتج جديد',
    'لا توجد أدوية أو منتجات بعد', 'ابحث عن دواء أو منتج...',
    'الصيدلية', 'أدوية ومستحضرات وأجهزة طبية',
  ),

  // ═══════════════════════════════════════════
  // حجوزات
  // ═══════════════════════════════════════════
  bookings: makeVocab(
    'لوحة تحكم الحجوزات', 'تابع المواعيد، الحجوزات ومقدمي الخدمة.',
    'خدمة', 'الخدمات', 'عميل', 'العملاء',
    'الخدمات', 'صور الخدمات', 'إضافة خدمة جديدة',
    'لا توجد خدمات بعد', 'ابحث عن خدمة...',
    'مركز الحجوزات', 'حجوزات ومواعيد متخصصة',
  ),

  // ═══════════════════════════════════════════
  // مصانع وتجارة
  // ═══════════════════════════════════════════
  factories: makeVocab(
    'لوحة تحكم المصنع', 'تابع المنتجات، الخامات، خطوط الإنتاج والمخازن.',
    'منتج', 'المنتجات', 'عميل', 'العملاء',
    'المنتجات', 'صور المنتجات', 'إضافة منتج جديد',
    'لا توجد منتجات بعد', 'ابحث عن منتج...',
    'المصنع', 'خامات وخطوط إنتاج وتصنيع وتغليف',
  ),
  tradeCompanies: makeVocab(
    'لوحة تحكم شركة التجارة', 'تابع المنتجات، الموردين، الشحن والاستيراد.',
    'منتج', 'المنتجات', 'عميل', 'العملاء',
    'المنتجات', 'صور المنتجات', 'إضافة منتج جديد',
    'لا توجد منتجات بعد', 'ابحث عن منتج...',
    'شركة التجارة', 'استيراد وتصدير وتوزيع وشحن',
  ),

  // ═══════════════════════════════════════════
  // سياحة وطاقة وثروة حيوانية
  // ═══════════════════════════════════════════
  tourismTravel: makeVocab(
    'لوحة تحكم شركة السياحة', 'تابع البرامج، الحجوزات، الرحلات والعملاء.',
    'برنامج سياحي', 'البرامج السياحية', 'عميل', 'العملاء',
    'البرامج السياحية', 'صور الرحلات', 'إضافة برنامج سياحي جديد',
    'لا توجد برامج سياحية بعد', 'ابحث عن برنامج سياحي...',
    'شركة السياحة', 'رحلات وحجوزات فنادق وتذاكر طيران',
    { salesTabLabel: 'الحجوزات' },
  ),
  livestock: makeVocab(
    'لوحة تحكم الثروة الحيوانية', 'تابع الأعلاف، الأدوية، المعدات والمذابح.',
    'منتج', 'المنتجات', 'عميل', 'العملاء',
    'المنتجات', 'صور المنتجات', 'إضافة منتج جديد',
    'لا توجد منتجات بعد', 'ابحث عن منتج...',
    'الثروة الحيوانية', 'أعلاف وأدوية بيطرية ومعدات ومذابح',
  ),
  fisheries: makeVocab(
    'لوحة تحكم الثروة السمكية', 'تابع الزريعة، الأعلاف، المعدات والتصدير.',
    'منتج', 'المنتجات', 'عميل', 'العملاء',
    'المنتجات', 'صور المنتجات', 'إضافة منتج جديد',
    'لا توجد منتجات بعد', 'ابحث عن منتج...',
    'الثروة السمكية', 'زريعة وأعلاف ومعدات وتبريد وتصدير',
  ),
  energy: makeVocab(
    'لوحة تحكم الطاقة والكهرباء', 'تابع الألواح، البطاريات، المولدات والتركيب.',
    'منتج', 'المنتجات', 'عميل', 'العملاء',
    'المنتجات والأنظمة', 'صور المنتجات', 'إضافة منتج جديد',
    'لا توجد منتجات بعد', 'ابحث عن منتج...',
    'الطاقة والكهرباء', 'ألواح شمسية وبطاريات ومولدات وتركيب',
  ),

  // ═══════════════════════════════════════════
  // خدمات مهنية ومنزلية
  // ═══════════════════════════════════════════
  professionalServices: makeVocab(
    'لوحة تحكم الخدمات المهنية', 'تابع الاستشارات، المواعيد، المستندات والأعمال.',
    'خدمة', 'الخدمات', 'عميل', 'العملاء',
    'الخدمات', 'صور الأعمال', 'إضافة خدمة جديدة',
    'لا توجد خدمات بعد', 'ابحث عن خدمة...',
    'الخدمات المهنية', 'محاسبة ومحاماة وترجمة واستشارات',
  ),
  homeServices: makeVocab(
    'لوحة تحكم الخدمات المنزلية', 'تابع الخدمات، المواعيد، الزيارات والمناطق.',
    'خدمة', 'الخدمات', 'عميل', 'العملاء',
    'الخدمات', 'صور الأعمال', 'إضافة خدمة جديدة',
    'لا توجد خدمات بعد', 'ابحث عن خدمة...',
    'الخدمات المنزلية', 'سباك وكهربائي ونجار وتكييف وتنظيف',
  ),

  // ═══════════════════════════════════════════
  // نشاط آخر
  // ═══════════════════════════════════════════
  other: makeVocab(
    'لوحة التحكم', 'تابع منتجاتك، خدماتك، المبيعات والعملاء.',
    'منتج', 'المنتجات', 'عميل', 'العملاء',
    'المنتجات', 'المعرض', 'إضافة منتج جديد',
    'لا توجد منتجات بعد', 'ابحث عن منتج...',
    'متجري', 'منتجات وخدمات متنوعة',
  ),
};

// ═══════════════════════════════════════════
// English Vocabulary (mirror of Arabic)
// ═══════════════════════════════════════════

export const BUSINESS_ACTIVITY_VOCABULARY_EN: Record<string, BusinessActivityVocabulary> = {
  restaurant: makeVocabEn(
    'Restaurant Dashboard', 'Track orders, menu, tables and daily performance.',
    'Dish', 'Dishes', 'Customer', 'Customers',
    'Menu', 'Dish Photos', 'Add new dish',
    'No dishes in the menu yet', 'Search for a dish...',
    'Gourmet Restaurant', 'Authentic home-cooked food with Egyptian flavor',
    { productsTabLabel: 'Menu', salesTabLabel: 'Orders', promotionsTabLabel: 'Meal Deals' },
  ),
  grocery: makeVocabEn(
    'Grocery Dashboard', 'Track products, sections, inventory and daily offers.',
    'Product', 'Products', 'Customer', 'Customers',
    'Products', 'Product Photos', 'Add new product',
    'No products yet', 'Search for a product...',
    'Good Grocery', 'All your daily needs in one place',
    { promotionsTabLabel: 'Section Offers' },
  ),
  fashion: makeVocabEn(
    'Fashion Dashboard', 'Track models, sizes, sales and seasonal offers.',
    'Model', 'Models', 'Customer', 'Customers',
    'Models', 'Model Photos', 'Add new model',
    'No models yet', 'Search for a model...',
    'Elegance Boutique', 'Latest fashion trends and clothing',
    { promotionsTabLabel: 'Collection Offers' },
  ),
  homeTextiles: makeVocabEn(
    'Home Textiles Dashboard', 'Track textiles, carpets, curtains and custom orders.',
    'Piece', 'Textiles', 'Customer', 'Customers',
    'Textiles', 'Textile Photos', 'Add new piece',
    'No textiles yet', 'Search for a textile piece...',
    'Premium Textiles', 'High-quality textiles, carpets and curtains',
  ),
  fabricStore: makeVocabEn(
    'Fabric Store Dashboard', 'Track fabrics, materials, meter orders and tailoring.',
    'Fabric', 'Fabrics', 'Customer', 'Customers',
    'Fabrics', 'Fabric Photos', 'Add new fabric',
    'No fabrics yet', 'Search for a fabric...',
    'Fabric Store', 'Clothing and upholstery fabrics with custom tailoring',
  ),
  curtainsBlinds: makeVocabEn(
    'Curtains & Blinds Dashboard', 'Track curtains, sizes, tailoring and installation services.',
    'Curtain', 'Curtains', 'Customer', 'Customers',
    'Curtains', 'Curtain Photos', 'Add new curtain',
    'No curtains yet', 'Search for a curtain...',
    'Elegance Curtains', 'Curtains, blinds and blackout with tailoring and installation',
  ),
  sofasUpholstery: makeVocabEn(
    'Sofas & Upholstery Dashboard', 'Track sofa models, upholstery, manufacturing and maintenance.',
    'Sofa', 'Sofas', 'Customer', 'Customers',
    'Sofas & Corners', 'Sofa Photos', 'Add new sofa model',
    'No sofa models yet', 'Search for a sofa model...',
    'Sofa Showroom', 'Custom-made sofas, lounges and upholstery',
  ),
  mattressesBedding: makeVocabEn(
    'Mattresses & Bedding Dashboard', 'Track mattresses, sheets, covers and orders.',
    'Mattress', 'Mattresses', 'Customer', 'Customers',
    'Mattresses', 'Mattress Photos', 'Add new mattress',
    'No mattresses yet', 'Search for a mattress...',
    'Comfort Mattresses', 'Mattresses, sheets and bedding accessories',
  ),
  furniture: makeVocabEn(
    'Furniture Dashboard', 'Track rooms, displays, manufacturing and installation.',
    'Furniture Piece', 'Furniture', 'Customer', 'Customers',
    'Furniture', 'Furniture Photos', 'Add new furniture piece',
    'No furniture pieces yet', 'Search for a furniture piece...',
    'Furniture Showroom', 'Furniture, decor and custom manufacturing',
  ),
  homeGoods: makeVocabEn(
    'Home Goods Dashboard', 'Track products, sections, warranty and exchanges.',
    'Product', 'Products', 'Customer', 'Customers',
    'Products', 'Product Photos', 'Add new product',
    'No products yet', 'Search for a product...',
    'Home Goods', 'Home and kitchen tools and organization',
  ),
  goldJewelry: makeVocabEn(
    'Gold & Jewelry Dashboard', 'Track pieces, karats, craftsmanship and maintenance.',
    'Gold Piece', 'Gold & Jewelry', 'Customer', 'Customers',
    'Pieces', 'Piece Photos', 'Add new gold piece',
    'No pieces yet', 'Search for a gold piece...',
    'Premium Jewelry', 'Gold, jewelry and diamonds with guarantee',
  ),
  silverAccessories: makeVocabEn(
    'Silver & Accessories Dashboard', 'Track silver, accessories, engraving and gifts.',
    'Piece', 'Accessories', 'Customer', 'Customers',
    'Silver & Accessories', 'Accessory Photos', 'Add new piece',
    'No accessories yet', 'Search for a piece...',
    'Silver & Elegance', 'Silver, accessories and gifts with custom engraving',
  ),
  watchesGifts: makeVocabEn(
    'Watches & Gifts Dashboard', 'Track watches, sets, warranty and maintenance.',
    'Watch', 'Watches', 'Customer', 'Customers',
    'Watches', 'Watch Photos', 'Add new watch',
    'No watches yet', 'Search for a watch...',
    'Watches & Gifts', 'Luxury watches and gifts with warranty',
  ),
  realEstate: makeVocabEn(
    'Real Estate Dashboard', 'Track units, requests, viewings and clients.',
    'Property', 'Properties', 'Customer', 'Customers',
    'Properties', 'Property Photos', 'Add new property',
    'No properties yet', 'Search for a property...',
    'Golden Properties', 'Apartments, villas and shops for sale and rent',
    { addProductButton: 'Add new property', salesTabLabel: 'Deals' },
  ),
  lands: makeVocabEn(
    'Lands Dashboard', 'Track land plots, documents, utilities and requests.',
    'Land Plot', 'Lands', 'Investor', 'Investors',
    'Lands', 'Land Photos', 'Add new land plot',
    'No lands yet', 'Search for a land plot...',
    'Investment Lands', 'Residential, commercial and agricultural lands',
    { addProductButton: 'Add land plot', salesTabLabel: 'Deals' },
  ),
  contractors: makeVocabEn(
    'Contracting Dashboard', 'Track projects, estimates, teams and materials.',
    'Project', 'Projects', 'Customer', 'Customers',
    'Projects', 'Project Photos', 'Add new project',
    'No projects yet', 'Search for a project...',
    'Premium Contracting', 'Finishing, contracting and interior design',
  ),
  building_supplies: makeVocabEn(
    'Building Supplies Dashboard', 'Track cement, steel, paints and supply.',
    'Item', 'Items', 'Customer', 'Customers',
    'Building Materials', 'Product Photos', 'Add new item',
    'No items yet', 'Search for an item...',
    'Building Materials', 'Cement, steel, paints and building tools',
  ),
  carShowroom: makeVocabEn(
    'Car Showroom Dashboard', 'Track cars, viewings, installments and clients.',
    'Car', 'Cars', 'Customer', 'Customers',
    'Cars', 'Car Photos', 'Add new car',
    'No cars in the showroom yet', 'Search for a car...',
    'Car Showroom', 'New and used cars with installment and financing',
    { salesTabLabel: 'Car Deals', promotionsTabLabel: 'Car Offers' },
  ),
  auto_services: makeVocabEn(
    'Auto Services Dashboard', 'Track maintenance orders, technicians, appointments and inspection.',
    'Service', 'Services', 'Customer', 'Customers',
    'Services', 'Workshop Photos', 'Add new service',
    'No services yet', 'Search for a service...',
    'Auto Workshop', 'Mechanics, electrical, bodywork, paint and maintenance',
  ),
  auto_parts: makeVocabEn(
    'Auto Parts Dashboard', 'Track parts, tires, batteries and compatibility.',
    'Part', 'Parts', 'Customer', 'Customers',
    'Parts', 'Part Photos', 'Add new part',
    'No parts yet', 'Search for a part...',
    'Auto Parts', 'Parts, tires, batteries and accessories',
  ),
  agri_supplies: makeVocabEn(
    'Agricultural Supplies Dashboard', 'Track seeds, seedlings, fertilizers and pesticides.',
    'Agri Product', 'Agri Products', 'Customer', 'Customers',
    'Agri Products', 'Product Photos', 'Add new agri product',
    'No agri products yet', 'Search for an agri product...',
    'Agri Supplies', 'Seeds, seedlings, fertilizers and pesticides',
  ),
  nurseries_landscaping: makeVocabEn(
    'Nursery & Landscaping Dashboard', 'Track plants, garden design, maintenance and irrigation.',
    'Plant', 'Plants', 'Customer', 'Customers',
    'Plants', 'Plant Photos', 'Add new plant',
    'No plants yet', 'Search for a plant...',
    'Garden Nursery', 'Plants, landscaping, irrigation and maintenance',
  ),
  serviceCompanies: makeVocabEn(
    'Service Company Dashboard', 'Track services, packages, teams and service areas.',
    'Service', 'Services', 'Customer', 'Customers',
    'Services', 'Service Photos', 'Add new service',
    'No services yet', 'Search for a service...',
    'Service Company', 'Maintenance, cleaning, security, moving and services',
  ),
  individualTechnicians: makeVocabEn(
    'Independent Technician Dashboard', 'Track skills, appointments, visits and areas.',
    'Service', 'Services', 'Customer', 'Customers',
    'Services', 'Work Photos', 'Add new service',
    'No services yet', 'Search for a service...',
    'Pro Technician', 'Plumber, electrician, carpenter, painter and AC',
  ),
  workshops: makeVocabEn(
    'Workshop Dashboard', 'Track work orders, manufacturing, repair and materials.',
    'Job', 'Workshop Jobs', 'Customer', 'Customers',
    'Workshop Jobs', 'Work Photos', 'Add new job',
    'No jobs yet', 'Search for a job...',
    'The Workshop', 'Carpentry, blacksmithing, aluminum, glass and manufacturing',
  ),
  electronics: makeVocabEn(
    'Electronics Dashboard', 'Track devices, accessories, maintenance and warranty.',
    'Device', 'Devices', 'Customer', 'Customers',
    'Devices', 'Device Photos', 'Add new device',
    'No devices yet', 'Search for a device...',
    'Tech Electronics', 'Mobiles, computers, accessories and maintenance',
  ),
  health: makeVocabEn(
    'Pharmacy Dashboard', 'Track medicines, products, prescriptions and recurring orders.',
    'Medicine', 'Medicines', 'Customer', 'Customers',
    'Medicines & Products', 'Product Photos', 'Add new medicine/product',
    'No medicines or products yet', 'Search for a medicine or product...',
    'The Pharmacy', 'Medicines, cosmetics and medical devices',
  ),
  bookings: makeVocabEn(
    'Bookings Dashboard', 'Track appointments, bookings and service providers.',
    'Service', 'Services', 'Customer', 'Customers',
    'Services', 'Service Photos', 'Add new service',
    'No services yet', 'Search for a service...',
    'Booking Center', 'Specialized bookings and appointments',
  ),
  factories: makeVocabEn(
    'Factory Dashboard', 'Track products, raw materials, production lines and warehouses.',
    'Product', 'Products', 'Customer', 'Customers',
    'Products', 'Product Photos', 'Add new product',
    'No products yet', 'Search for a product...',
    'The Factory', 'Raw materials, production lines, manufacturing and packaging',
  ),
  tradeCompanies: makeVocabEn(
    'Trading Company Dashboard', 'Track products, suppliers, shipping and import.',
    'Product', 'Products', 'Customer', 'Customers',
    'Products', 'Product Photos', 'Add new product',
    'No products yet', 'Search for a product...',
    'Trading Company', 'Import, export, distribution and shipping',
  ),
  tourismTravel: makeVocabEn(
    'Tourism & Travel Dashboard', 'Track programs, bookings, trips and clients.',
    'Tour Program', 'Tour Programs', 'Customer', 'Customers',
    'Tour Programs', 'Trip Photos', 'Add new tour program',
    'No tour programs yet', 'Search for a tour program...',
    'Tourism Company', 'Trips, hotel bookings and flight tickets',
    { salesTabLabel: 'Bookings' },
  ),
  livestock: makeVocabEn(
    'Livestock Dashboard', 'Track feed, medicines, equipment and slaughterhouses.',
    'Product', 'Products', 'Customer', 'Customers',
    'Products', 'Product Photos', 'Add new product',
    'No products yet', 'Search for a product...',
    'Livestock', 'Feed, veterinary medicines, equipment and slaughterhouses',
  ),
  fisheries: makeVocabEn(
    'Fisheries Dashboard', 'Track fry, feed, equipment and export.',
    'Product', 'Products', 'Customer', 'Customers',
    'Products', 'Product Photos', 'Add new product',
    'No products yet', 'Search for a product...',
    'Fisheries', 'Fry, feed, equipment, cooling and export',
  ),
  energy: makeVocabEn(
    'Energy Dashboard', 'Track panels, batteries, generators and installation.',
    'Product', 'Products', 'Customer', 'Customers',
    'Products & Systems', 'Product Photos', 'Add new product',
    'No products yet', 'Search for a product...',
    'Energy & Electricity', 'Solar panels, batteries, generators and installation',
  ),
  professionalServices: makeVocabEn(
    'Professional Services Dashboard', 'Track consultations, appointments, documents and work.',
    'Service', 'Services', 'Customer', 'Customers',
    'Services', 'Work Photos', 'Add new service',
    'No services yet', 'Search for a service...',
    'Professional Services', 'Accounting, legal, translation and consulting',
  ),
  homeServices: makeVocabEn(
    'Home Services Dashboard', 'Track services, appointments, visits and areas.',
    'Service', 'Services', 'Customer', 'Customers',
    'Services', 'Work Photos', 'Add new service',
    'No services yet', 'Search for a service...',
    'Home Services', 'Plumber, electrician, carpenter, AC and cleaning',
  ),
  other: makeVocabEn(
    'Dashboard', 'Track your products, services, sales and customers.',
    'Product', 'Products', 'Customer', 'Customers',
    'Products', 'Gallery', 'Add new product',
    'No products yet', 'Search for a product...',
    'My Store', 'Various products and services',
  ),
};

// ═══════════════════════════════════════════
// Helper functions
// ═══════════════════════════════════════════

export const getBusinessActivityVocabulary = (activityId?: unknown, lang?: string): BusinessActivityVocabulary => {
  const id = String(activityId || '').trim();
  const isEn = String(lang || '').toLowerCase().startsWith('en');
  const dict = isEn ? BUSINESS_ACTIVITY_VOCABULARY_EN : BUSINESS_ACTIVITY_VOCABULARY;
  return dict[id] || dict.other;
};

// ─────────────────────────────────────────────
// Booking activity → BusinessActivityVocabulary mapping
// Instead of duplicating booking vocab entries here, we delegate
// to bookings/config.ts VOCABULARY and map the fields.
// ─────────────────────────────────────────────
import { getVocabulary as getBookingVocabulary, isShopBookingActivity, getShopBookingActivityType } from '@/components/pages/business/bookings/config';

const bookingVocabToBusinessVocab = (bookingType: string, lang?: string): BusinessActivityVocabulary => {
  const bv = getBookingVocabulary(bookingType as any) as any;
  const isEn = String(lang || '').toLowerCase().startsWith('en');
  if (isEn) {
    return {
      dashboardTitle: bv.dashboardTitleEn || bv.dashboardTitle,
      dashboardSubtitle: bv.dashboardSubtitleEn || bv.dashboardSubtitle,
      productSingular: bv.serviceSingularEn || bv.serviceSingular,
      productPlural: bv.servicePluralEn || bv.servicePlural,
      customerSingular: bv.customerSingularEn || bv.customerSingular,
      customerPlural: bv.customerPluralEn || bv.customerPlural,
      productsTabLabel: bv.servicePluralEn || bv.servicePlural,
      galleryTabLabel: 'Activity Photos',
      addProductButton: `Add new ${bv.serviceSingularEn || bv.serviceSingular}`,
      emptyProductsMessage: `No ${bv.servicePluralEn || bv.servicePlural} yet`,
      searchProductsPlaceholder: `Search for a ${bv.serviceSingularEn || bv.serviceSingular}...`,
      defaultShopName: 'Booking Center',
      defaultShopDescription: bv.dashboardSubtitleEn || bv.dashboardSubtitle,
      salesTabLabel: 'Bookings',
      promotionsTabLabel: 'Promotions',
      reportsTabLabel: 'Reports',
      customersTabLabel: bv.customerPluralEn || bv.customerPlural,
      overviewTabLabel: 'Overview',
      settingsTabLabel: 'Settings',
    };
  }
  return {
    dashboardTitle: bv.dashboardTitle,
    dashboardSubtitle: bv.dashboardSubtitle,
    productSingular: bv.serviceSingular,
    productPlural: bv.servicePlural,
    customerSingular: bv.customerSingular,
    customerPlural: bv.customerPlural,
    productsTabLabel: bv.servicePlural,
    galleryTabLabel: 'صور النشاط',
    addProductButton: `إضافة ${bv.serviceSingular} جديدة`,
    emptyProductsMessage: `لا توجد ${bv.servicePlural} بعد`,
    searchProductsPlaceholder: `ابحث عن ${bv.serviceSingular}...`,
    defaultShopName: 'مركز الحجوزات',
    defaultShopDescription: bv.dashboardSubtitle,
    salesTabLabel: 'الحجوزات',
    promotionsTabLabel: 'العروض',
    reportsTabLabel: 'التقارير',
    customersTabLabel: bv.customerPlural,
    overviewTabLabel: 'نظرة عامة',
    settingsTabLabel: 'الإعدادات',
  };
};

export const getShopActivityVocabulary = (shop?: any, lang?: string): BusinessActivityVocabulary => {
  const isEn = String(lang || '').toLowerCase().startsWith('en');
  const fallbackDict = isEn ? BUSINESS_ACTIVITY_VOCABULARY_EN : BUSINESS_ACTIVITY_VOCABULARY;
  if (!shop) return fallbackDict.other;

  // Booking activities — delegate to bookings/config.ts
  if (isShopBookingActivity(shop)) {
    const bookingType = getShopBookingActivityType(shop);
    if (bookingType) return bookingVocabToBusinessVocab(bookingType, lang);
  }

  const activityId = shop?.pageDesign?.businessActivityId || shop?.businessActivityId || '';
  if (activityId) return getBusinessActivityVocabulary(activityId, lang);

  // Check dev activity ID from localStorage (used by dev merchant switcher)
  try {
    const devActId = String(localStorage.getItem('ray_dev_activity_id') || '').trim();
    const dict = isEn ? BUSINESS_ACTIVITY_VOCABULARY_EN : BUSINESS_ACTIVITY_VOCABULARY;
    if (devActId && dict[devActId]) {
      return getBusinessActivityVocabulary(devActId, lang);
    }
  } catch {}

  // Fallback: try category-based lookup
  const category = String(shop?.category || '').toUpperCase();
  const categoryMap: Record<string, string> = {
    'RESTAURANT': 'restaurant',
    'FOOD': 'grocery',
    'FASHION': 'fashion',
    'RETAIL': 'other',
    'ELECTRONICS': 'electronics',
    'HEALTH': 'health',
    'SERVICE': 'other',
    'HOTEL': 'other',
    'CAFE': 'restaurant',
    'OTHER': 'other',
  };
  return getBusinessActivityVocabulary(categoryMap[category] || 'other', lang);
};
