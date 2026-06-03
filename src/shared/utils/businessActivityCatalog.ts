import { Category } from '@/types';

export type ActivityButtonDef = {
  id: string;
  label: string;
  description?: string;
};

export type BusinessActivityThemePatch = {
  quickTheme: string;
  primaryColor: string;
  secondaryColor: string;
  headerBackgroundColor: string;
  headerTextColor: string;
  footerBackgroundColor: string;
  footerTextColor: string;
  pageBackgroundColor: string;
  backgroundColor?: string;
  productDisplay?: 'cards' | 'list' | 'minimal';
  productsLayout?: 'vertical' | 'horizontal';
  imageAspectRatio?: 'square' | 'portrait' | 'landscape';
  homeLayoutMode?: string;
  productCardOverlayBgColor?: string;
};

export type BusinessActivityDef = {
  id: string;
  title: string;
  description: string;
  category: Category;
  primaryModuleLabel: string;
  secondaryModuleLabel: string;
  privateButtons: ActivityButtonDef[];
  bookingActivityType?: string;
};

export type BusinessActivityGroupDef = {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: Category;
  activities: BusinessActivityDef[];
};

const makeButton = (id: string, label: string, description?: string): ActivityButtonDef => ({ id, label, description });

const makeTheme = (
  quickTheme: string,
  primaryColor: string,
  secondaryColor: string,
  headerBackgroundColor: string,
  headerTextColor: string,
  footerBackgroundColor: string,
  footerTextColor: string,
  pageBackgroundColor: string,
  extras: Partial<BusinessActivityThemePatch> = {},
): BusinessActivityThemePatch => ({
  quickTheme,
  primaryColor,
  secondaryColor,
  headerBackgroundColor,
  headerTextColor,
  footerBackgroundColor,
  footerTextColor,
  pageBackgroundColor,
  backgroundColor: pageBackgroundColor,
  productDisplay: 'cards',
  productsLayout: 'vertical',
  imageAspectRatio: 'square',
  homeLayoutMode: 'banner_ads_story',
  productCardOverlayBgColor: secondaryColor,
  ...extras,
});

export const BUSINESS_ACTIVITY_THEME_PATCHES: Record<string, BusinessActivityThemePatch> = {
  restaurant: makeTheme('activity_restaurant_fire', '#EA580C', '#7C2D12', '#FFF7ED', '#7C2D12', '#431407', '#FED7AA', '#FFF7ED'),
  grocery: makeTheme('activity_grocery_fresh', '#16A34A', '#166534', '#F0FDF4', '#14532D', '#052E16', '#BBF7D0', '#F7FEE7'),
  fashion: makeTheme('activity_fashion_glow', '#BE185D', '#831843', '#FDF2F8', '#831843', '#500724', '#FBCFE8', '#FFF7FB', { imageAspectRatio: 'portrait', productsLayout: 'horizontal' }),
  homeTextiles: makeTheme('activity_home_textiles_warm', '#B45309', '#78350F', '#FFFBEB', '#78350F', '#451A03', '#FDE68A', '#FFFBEB', { imageAspectRatio: 'landscape' }),
  fabricStore: makeTheme('activity_fabric_palette', '#A21CAF', '#581C87', '#FAF5FF', '#581C87', '#3B0764', '#F5D0FE', '#FDF4FF', { imageAspectRatio: 'portrait', productsLayout: 'horizontal' }),
  curtainsBlinds: makeTheme('activity_curtains_soft', '#7C3AED', '#4C1D95', '#F5F3FF', '#4C1D95', '#2E1065', '#DDD6FE', '#FAF5FF', { imageAspectRatio: 'portrait' }),
  sofasUpholstery: makeTheme('activity_sofas_lounge', '#92400E', '#422006', '#FEF3C7', '#422006', '#1C1917', '#FDE68A', '#FFFBEB', { imageAspectRatio: 'landscape' }),
  mattressesBedding: makeTheme('activity_bedding_cloud', '#0284C7', '#0F172A', '#F0F9FF', '#0C4A6E', '#082F49', '#BAE6FD', '#F8FAFC', { imageAspectRatio: 'landscape' }),
  furniture: makeTheme('activity_furniture_wood', '#A16207', '#713F12', '#FEFCE8', '#713F12', '#422006', '#FEF08A', '#FFF7ED', { imageAspectRatio: 'landscape' }),
  homeGoods: makeTheme('activity_home_goods_clean', '#0F766E', '#134E4A', '#F0FDFA', '#134E4A', '#042F2E', '#99F6E4', '#FFFFFF'),
  goldJewelry: makeTheme('activity_gold_luxury', '#D97706', '#78350F', '#FFFBEB', '#78350F', '#111827', '#FDE68A', '#FEFCE8', { productCardOverlayBgColor: '#92400E' }),
  silverAccessories: makeTheme('activity_silver_elegance', '#64748B', '#334155', '#F8FAFC', '#0F172A', '#020617', '#CBD5E1', '#FFFFFF', { imageAspectRatio: 'portrait' }),
  watchesGifts: makeTheme('activity_watches_midnight', '#1D4ED8', '#111827', '#EFF6FF', '#172554', '#020617', '#BFDBFE', '#F8FAFC', { imageAspectRatio: 'portrait' }),
  realEstate: makeTheme('activity_real_estate_skyline', '#2563EB', '#1E3A8A', '#EFF6FF', '#172554', '#0F172A', '#BFDBFE', '#F8FAFC', { imageAspectRatio: 'landscape', productDisplay: 'list' }),
  lands: makeTheme('activity_lands_earth', '#65A30D', '#365314', '#F7FEE7', '#365314', '#1A2E05', '#D9F99D', '#FEFCE8', { imageAspectRatio: 'landscape', productDisplay: 'list' }),
  contractors: makeTheme('activity_contractors_build', '#F97316', '#7C2D12', '#FFF7ED', '#7C2D12', '#1C1917', '#FDBA74', '#FAFAF9', { imageAspectRatio: 'landscape' }),
  building_supplies: makeTheme('activity_building_supplies', '#475569', '#1E293B', '#F8FAFC', '#0F172A', '#020617', '#CBD5E1', '#FFFFFF', { productDisplay: 'list' }),
  carShowroom: makeTheme('activity_cars_showroom', '#DC2626', '#111827', '#FEF2F2', '#7F1D1D', '#020617', '#FECACA', '#FFFFFF', { imageAspectRatio: 'landscape', productsLayout: 'horizontal' }),
  auto_services: makeTheme('activity_auto_workshop', '#EA580C', '#1F2937', '#FFF7ED', '#7C2D12', '#111827', '#FDBA74', '#FAFAFA', { imageAspectRatio: 'landscape' }),
  auto_parts: makeTheme('activity_auto_parts', '#2563EB', '#1E293B', '#EFF6FF', '#172554', '#020617', '#BFDBFE', '#FFFFFF', { productDisplay: 'list' }),
  agri_supplies: makeTheme('activity_agri_supplies', '#16A34A', '#365314', '#F0FDF4', '#14532D', '#052E16', '#BBF7D0', '#F7FEE7'),
  nurseries_landscaping: makeTheme('activity_nursery_garden', '#059669', '#064E3B', '#ECFDF5', '#064E3B', '#022C22', '#A7F3D0', '#F6FFFB', { imageAspectRatio: 'portrait' }),
  serviceCompanies: makeTheme('activity_service_company', '#0891B2', '#164E63', '#ECFEFF', '#164E63', '#083344', '#A5F3FC', '#F8FAFC', { productDisplay: 'list' }),
  individualTechnicians: makeTheme('activity_technicians', '#CA8A04', '#713F12', '#FEFCE8', '#713F12', '#422006', '#FEF08A', '#FFFFFF', { productDisplay: 'list' }),
  workshops: makeTheme('activity_workshops_maker', '#B45309', '#44403C', '#FFFBEB', '#78350F', '#1C1917', '#FDE68A', '#FAFAF9', { imageAspectRatio: 'landscape' }),
  electronics: makeTheme('activity_electronics_neon', '#0EA5E9', '#0F172A', '#0F172A', '#E0F2FE', '#020617', '#7DD3FC', '#F8FAFC', { productsLayout: 'horizontal', imageAspectRatio: 'landscape' }),
  health: makeTheme('activity_health_care', '#0D9488', '#115E59', '#F0FDFA', '#134E4A', '#042F2E', '#99F6E4', '#FFFFFF'),
  bookings: makeTheme('activity_bookings_blue', '#0EA5E9', '#0369A1', '#FFFFFF', '#0F172A', '#FFFFFF', '#0F172A', '#FFFFFF', { quickTheme: 'clinic_elegant_blue' }),
  other: makeTheme('activity_other_flexible', '#334155', '#0F172A', '#F8FAFC', '#0F172A', '#0F172A', '#CBD5E1', '#FFFFFF', { productDisplay: 'list' }),
};

export const BUSINESS_ACTIVITY_GROUPS: BusinessActivityGroupDef[] = [
  {
    id: 'food_market',
    title: 'مطاعم وأغذية ومحلات تموين',
    description: 'مطاعم، كافيهات، بقالة، سوبر ماركت، عطارة، مخابز وحلويات.',
    icon: 'م',
    category: Category.RESTAURANT,
    activities: [
      {
        id: 'restaurant',
        title: 'مطعم / كافيه',
        description: 'منيو، طاولات، طلبات، دليفري، عروض ووجبات.',
        category: Category.RESTAURANT,
        primaryModuleLabel: 'المنيو والأقسام',
        secondaryModuleLabel: 'الطاولات والقاعات',
        privateButtons: [
          makeButton('tables', 'الطاولات والقاعات'),
          makeButton('delivery_zones', 'مناطق التوصيل'),
          makeButton('meal_combos', 'الوجبات والباقات'),
          makeButton('kitchen_queue', 'تجهيزات المطبخ'),
        ],
      },
      {
        id: 'grocery',
        title: 'سوبر ماركت / بقالة / عطارة',
        description: 'منتجات يومية، أقسام، مخزون سريع، عروض وتموين.',
        category: Category.FOOD,
        primaryModuleLabel: 'الأقسام والبضائع',
        secondaryModuleLabel: 'الموردون والمخزون',
        privateButtons: [
          makeButton('fresh_sections', 'الأقسام الطازجة'),
          makeButton('suppliers', 'الموردون'),
          makeButton('expiry_batches', 'الصلاحيات والتشغيلات'),
          makeButton('bundle_offers', 'باقات التوفير'),
        ],
      },
    ],
  },
  {
    id: 'fashion_home',
    title: 'ملابس ومفروشات وأثاث وديكور',
    description: 'ملابس، أحذية، أقمشة، ستائر، كنب، مفروشات، سجاد، أثاث، ديكور ومستلزمات المنزل.',
    icon: 'ف',
    category: Category.FASHION,
    activities: [
      {
        id: 'fashion',
        title: 'ملابس / أحذية / إكسسوارات',
        description: 'مقاسات، ألوان، موديلات، مواسم، عروض وتبديل.',
        category: Category.FASHION,
        primaryModuleLabel: 'المقاسات والألوان',
        secondaryModuleLabel: 'الموديلات والمواسم',
        privateButtons: [
          makeButton('sizes_colors', 'المقاسات والألوان'),
          makeButton('collections', 'الكوليكشنات'),
          makeButton('try_exchange', 'التبديل والاسترجاع'),
          makeButton('tailoring', 'تفصيل وتعديلات'),
        ],
      },
      {
        id: 'homeTextiles',
        title: 'مفروشات وسجاد وستائر',
        description: 'مقاسات، خامات، تفصيل، تركيب، كتالوجات ومعرض صور.',
        category: Category.RETAIL,
        primaryModuleLabel: 'المقاسات والخامات',
        secondaryModuleLabel: 'التفصيل والتركيب',
        privateButtons: [
          makeButton('measurements', 'المقاسات والقياسات'),
          makeButton('fabric_catalog', 'كتالوج الخامات'),
          makeButton('installation', 'خدمات التركيب'),
          makeButton('custom_orders', 'طلبات التفصيل'),
        ],
      },
      {
        id: 'fabricStore',
        title: 'أقمشة وخامات وتفصيل',
        description: 'أقمشة ملابس ومفروشات، خامات، باترونات، تفصيل وطلبات مترية.',
        category: Category.FASHION,
        primaryModuleLabel: 'كتالوج الأقمشة',
        secondaryModuleLabel: 'التفصيل والطلبات المترية',
        privateButtons: [
          makeButton('fabric_types', 'أنواع الأقمشة والخامات'),
          makeButton('meter_pricing', 'سعر المتر والقصات'),
          makeButton('patterns_tailoring', 'باترونات وتفصيل'),
          makeButton('wholesale_rolls', 'رولات وجملة'),
        ],
      },
      {
        id: 'curtainsBlinds',
        title: 'ستاير وبرقع وبلاك أوت',
        description: 'ستائر، بلاك أوت، شيفون، قضبان، قياسات، تفصيل وتركيب.',
        category: Category.RETAIL,
        primaryModuleLabel: 'أنواع الستائر',
        secondaryModuleLabel: 'القياسات والتركيب',
        privateButtons: [
          makeButton('curtain_catalog', 'كتالوج الستائر'),
          makeButton('window_measurements', 'مقاسات الشبابيك'),
          makeButton('rails_accessories', 'قضبان وإكسسوارات'),
          makeButton('installation_visits', 'زيارات التركيب'),
        ],
      },
      {
        id: 'sofasUpholstery',
        title: 'كنب وانتريهات وتنجيد',
        description: 'كنب، انتريهات، ركنات، تنجيد، تغيير أقمشة، صيانة وتصنيع حسب المقاس.',
        category: Category.SERVICE,
        primaryModuleLabel: 'موديلات الكنب والركنات',
        secondaryModuleLabel: 'التنجيد والصيانة',
        privateButtons: [
          makeButton('sofa_models', 'موديلات الكنب والركنات'),
          makeButton('upholstery_fabrics', 'أقمشة التنجيد'),
          makeButton('custom_sizes', 'تصنيع بمقاسات خاصة'),
          makeButton('repair_renewal', 'إصلاح وتجديد'),
        ],
      },
      {
        id: 'mattressesBedding',
        title: 'مراتب وملايات ومستلزمات نوم',
        description: 'مراتب، مخدات، ملايات، لحاف، مفارش وحماية مراتب.',
        category: Category.RETAIL,
        primaryModuleLabel: 'المراتب والمقاسات',
        secondaryModuleLabel: 'الملايات والمفارش',
        privateButtons: [
          makeButton('mattress_sizes', 'مقاسات المراتب'),
          makeButton('bedding_sets', 'أطقم ملايات ومفارش'),
          makeButton('pillows_duvets', 'مخدات ولحاف'),
          makeButton('comfort_levels', 'درجات الراحة والضمان'),
        ],
      },
      {
        id: 'furniture',
        title: 'أثاث / معارض / ديكور',
        description: 'معارض أثاث، غرف، ديكور، تصنيع، تسليم وتركيب.',
        category: Category.SERVICE,
        primaryModuleLabel: 'المعارض والغرف',
        secondaryModuleLabel: 'التصنيع والتركيب',
        privateButtons: [
          makeButton('showroom_sets', 'غرف ومعروضات'),
          makeButton('custom_furniture', 'تصنيع حسب الطلب'),
          makeButton('delivery_installation', 'التوصيل والتركيب'),
          makeButton('materials_finishes', 'الخامات والتشطيبات'),
        ],
      },
      {
        id: 'homeGoods',
        title: 'مستلزمات المنزل',
        description: 'أدوات منزلية، أجهزة صغيرة، تنظيم، تنظيف ومطبخ.',
        category: Category.RETAIL,
        primaryModuleLabel: 'أقسام المنزل',
        secondaryModuleLabel: 'الضمان والاستبدال',
        privateButtons: [
          makeButton('home_sections', 'أقسام المنزل'),
          makeButton('warranty', 'الضمان والاستبدال'),
          makeButton('kitchen_tools', 'أدوات المطبخ'),
          makeButton('cleaning_tools', 'أدوات التنظيف'),
        ],
      },
    ],
  },
  {
    id: 'jewelry_luxury',
    title: 'دهب ومجوهرات وساعات وهدايا',
    description: 'محلات دهب، فضة، مجوهرات، ساعات، إكسسوارات فاخرة، هدايا وتغليف.',
    icon: 'د',
    category: Category.RETAIL,
    activities: [
      {
        id: 'goldJewelry',
        title: 'محلات دهب ومجوهرات',
        description: 'ذهب، ألماس، أطقم، سبائك، عيارات، مصنعية، صيانة وتلميع.',
        category: Category.RETAIL,
        primaryModuleLabel: 'المشغولات والعيارات',
        secondaryModuleLabel: 'المصنعية والخدمات',
        privateButtons: [
          makeButton('karats_pricing', 'العيارات وسعر الجرام'),
          makeButton('sets_rings', 'أطقم وخواتم ودبل'),
          makeButton('bullion_coins', 'سبائك وجنيهات'),
          makeButton('maintenance_polish', 'صيانة وتلميع'),
        ],
      },
      {
        id: 'silverAccessories',
        title: 'فضة وإكسسوارات',
        description: 'فضة، إكسسوارات، هدايا شخصية، نقش، تغليف وطلبات خاصة.',
        category: Category.RETAIL,
        primaryModuleLabel: 'الفضة والإكسسوارات',
        secondaryModuleLabel: 'النقش والهدايا',
        privateButtons: [
          makeButton('silver_catalog', 'كتالوج الفضة'),
          makeButton('custom_engraving', 'نقش وتخصيص'),
          makeButton('gift_wrapping', 'تغليف هدايا'),
          makeButton('repair_resize', 'تصليح وتعديل مقاس'),
        ],
      },
      {
        id: 'watchesGifts',
        title: 'ساعات وهدايا فاخرة',
        description: 'ساعات، عطور هدايا، أطقم رجالي وحريمي، ضمان وخدمات ما بعد البيع.',
        category: Category.RETAIL,
        primaryModuleLabel: 'الساعات والهدايا',
        secondaryModuleLabel: 'الضمان والصيانة',
        privateButtons: [
          makeButton('watch_brands', 'ماركات الساعات'),
          makeButton('gift_sets', 'أطقم وهدايا'),
          makeButton('warranty_cards', 'الضمان والشهادات'),
          makeButton('battery_straps', 'بطاريات وسيور'),
        ],
      },
    ],
  },
  {
    id: 'real_estate',
    title: 'عقارات ومقاولات وخدمات عقارية',
    description: 'بيع وإيجار عقارات وأراضٍ، مقاولون، تشطيبات، وسطاء وخدمات عقارية.',
    icon: 'ع',
    category: Category.SERVICE,
    activities: [
      {
        id: 'realEstate',
        title: 'عقارات بيع وإيجار',
        description: 'شقق، فيلات، محلات، إداري، تجاري، بيع وإيجار.',
        category: Category.SERVICE,
        primaryModuleLabel: 'الوحدات والعروض',
        secondaryModuleLabel: 'طلبات العملاء والمعاينات',
        privateButtons: [
          makeButton('properties_sale', 'عقارات للبيع'),
          makeButton('properties_rent', 'عقارات للإيجار'),
          makeButton('viewing_requests', 'طلبات المعاينة'),
          makeButton('brokers_owners', 'ملاك ووسطاء'),
        ],
      },
      {
        id: 'lands',
        title: 'أراضي بيع وإيجار',
        description: 'أراضي سكنية، زراعية، تجارية، صناعية وتخصيص.',
        category: Category.SERVICE,
        primaryModuleLabel: 'قطع الأراضي',
        secondaryModuleLabel: 'المستندات والمرافق',
        privateButtons: [
          makeButton('lands_sale', 'أراضي للبيع'),
          makeButton('lands_rent', 'أراضي للإيجار'),
          makeButton('utilities', 'المرافق والتراخيص'),
          makeButton('land_documents', 'المستندات والخرائط'),
        ],
      },
      {
        id: 'contractors',
        title: 'مقاولون وتشطيبات',
        description: 'مقاولات، تشطيب، تصميم داخلي، أعمال كهرباء وسباكة ودهانات.',
        category: Category.SERVICE,
        primaryModuleLabel: 'الخدمات والمقايسات',
        secondaryModuleLabel: 'الفرق والمشروعات',
        privateButtons: [
          makeButton('quotations', 'المقايسات وعروض الأسعار'),
          makeButton('projects', 'المشروعات السابقة'),
          makeButton('crews', 'الفرق والعمالة'),
          makeButton('materials', 'الخامات والموردون'),
        ],
      },
      {
        id: 'building_supplies',
        title: 'محلات مواد بناء ودهانات',
        description: 'أسمنت، حديد، دهانات، أدوات صحية وكهرباء وتشطيب.',
        category: Category.RETAIL,
        primaryModuleLabel: 'مواد البناء',
        secondaryModuleLabel: 'التوريد والنقل',
        privateButtons: [
          makeButton('cement_steel', 'أسمنت وحديد'),
          makeButton('paint_finishing', 'دهانات وتشطيبات'),
          makeButton('sanitary_electric', 'صحي وكهرباء'),
          makeButton('bulk_delivery', 'توريد ونقل'),
        ],
      },
    ],
  },
  {
    id: 'vehicles',
    title: 'سيارات ومعارض وورش',
    description: 'معارض سيارات، إيجار، قطع غيار، ورش، إطارات، غسيل وإكسسوارات.',
    icon: 'س',
    category: Category.RETAIL,
    activities: [
      {
        id: 'carShowroom',
        title: 'معارض سيارات بيع وتقسيط',
        description: 'سيارات جديدة ومستعملة، تقسيط، معاينات وتجارب قيادة.',
        category: Category.RETAIL,
        primaryModuleLabel: 'السيارات المتاحة',
        secondaryModuleLabel: 'التمويل والمعاينات',
        privateButtons: [
          makeButton('new_cars', 'سيارات جديدة'),
          makeButton('used_cars', 'سيارات مستعملة'),
          makeButton('finance_installments', 'تقسيط وتمويل'),
          makeButton('test_drives', 'تجارب قيادة'),
        ],
      },
      {
        id: 'auto_services',
        title: 'ورش وخدمات سيارات',
        description: 'ميكانيكا، كهرباء، سمكرة، دهان، صيانة دورية وغسيل.',
        category: Category.SERVICE,
        primaryModuleLabel: 'خدمات الورشة',
        secondaryModuleLabel: 'الفنيون والمواعيد',
        privateButtons: [
          makeButton('maintenance_jobs', 'أوامر الصيانة'),
          makeButton('mechanics', 'الفنيون والفرق'),
          makeButton('inspection', 'فحص وتشخيص'),
          makeButton('service_packages', 'باقات الصيانة'),
        ],
      },
      {
        id: 'auto_parts',
        title: 'قطع غيار وإطارات وإكسسوارات',
        description: 'قطع غيار، كاوتش، زيوت، بطاريات، إكسسوارات وتركيب.',
        category: Category.RETAIL,
        primaryModuleLabel: 'قطع الغيار',
        secondaryModuleLabel: 'التوافق والتركيب',
        privateButtons: [
          makeButton('parts_catalog', 'كتالوج القطع'),
          makeButton('vehicle_fitment', 'توافق الموديلات'),
          makeButton('tires_batteries', 'إطارات وبطاريات'),
          makeButton('installation_services', 'خدمات التركيب'),
        ],
      },
    ],
  },
  {
    id: 'agriculture',
    title: 'زراعة ومستلزمات زراعية',
    description: 'مشاتل، بذور، أسمدة، مبيدات، معدات، أعلاف وخدمات مزارع.',
    icon: 'ز',
    category: Category.RETAIL,
    activities: [
      {
        id: 'agri_supplies',
        title: 'محلات زراعة وبذور وأسمدة',
        description: 'بذور، شتلات، أسمدة، مبيدات، أدوات ري ومستلزمات مزارع.',
        category: Category.RETAIL,
        primaryModuleLabel: 'الأصناف الزراعية',
        secondaryModuleLabel: 'الإرشادات والمواسم',
        privateButtons: [
          makeButton('seeds_seedlings', 'بذور وشتلات'),
          makeButton('fertilizers', 'أسمدة ومغذيات'),
          makeButton('pesticides', 'مبيدات ومكافحة'),
          makeButton('irrigation_tools', 'ري ومعدات'),
        ],
      },
      {
        id: 'nurseries_landscaping',
        title: 'مشاتل وتنسيق حدائق',
        description: 'نباتات، نجيلة، تصميم حدائق، صيانة وري.',
        category: Category.SERVICE,
        primaryModuleLabel: 'النباتات والخدمات',
        secondaryModuleLabel: 'فرق التنسيق والصيانة',
        privateButtons: [
          makeButton('plants_catalog', 'كتالوج النباتات'),
          makeButton('garden_design', 'تصميم حدائق'),
          makeButton('maintenance_visits', 'زيارات صيانة'),
          makeButton('irrigation_systems', 'شبكات الري'),
        ],
      },
    ],
  },
  {
    id: 'services',
    title: 'خدمات شركات وأفراد وصيانة',
    description: 'شركات خدمات، فنيون مستقلون، سباكة، كهرباء، نجارة، تكييف وتنظيف.',
    icon: 'خ',
    category: Category.SERVICE,
    activities: [
      {
        id: 'serviceCompanies',
        title: 'شركات تقدم خدمات',
        description: 'شركات صيانة، تنظيف، أمن، نقل، إدارة مرافق وخدمات عقارية.',
        category: Category.SERVICE,
        primaryModuleLabel: 'الخدمات والباقات',
        secondaryModuleLabel: 'الفرق ومناطق الخدمة',
        privateButtons: [
          makeButton('service_packages', 'الخدمات والباقات'),
          makeButton('service_teams', 'الفرق والمشرفون'),
          makeButton('coverage_areas', 'مناطق الخدمة'),
          makeButton('contracts', 'العقود والاشتراكات'),
        ],
      },
      {
        id: 'individualTechnicians',
        title: 'أفراد ومعلمين وفنيين',
        description: 'سباك، كهربائي، نجار، نقاش، تكييف، أجهزة منزلية وزيارات منزلية.',
        category: Category.SERVICE,
        primaryModuleLabel: 'المهارات والخدمات',
        secondaryModuleLabel: 'المواعيد ومناطق الزيارة',
        privateButtons: [
          makeButton('skills', 'المهارات والتخصصات'),
          makeButton('visit_fees', 'رسوم الزيارة'),
          makeButton('available_areas', 'المناطق المتاحة'),
          makeButton('before_after', 'صور قبل وبعد'),
        ],
      },
      {
        id: 'workshops',
        title: 'ورش تصنيع وإصلاح',
        description: 'ورش نجارة، حدادة، ألوميتال، زجاج، صيانة معدات وتصنيع حسب الطلب.',
        category: Category.SERVICE,
        primaryModuleLabel: 'أعمال الورشة',
        secondaryModuleLabel: 'طلبات التصنيع والإصلاح',
        privateButtons: [
          makeButton('work_orders', 'أوامر الشغل'),
          makeButton('custom_manufacturing', 'تصنيع حسب الطلب'),
          makeButton('repair_requests', 'طلبات الإصلاح'),
          makeButton('materials_stock', 'خامات الورشة'),
        ],
      },
    ],
  },
  {
    id: 'electronics_health',
    title: 'إلكترونيات وصحة وصيدليات',
    description: 'موبايلات، كمبيوتر، صيانة أجهزة، صيدليات، مستحضرات وتجهيزات طبية.',
    icon: 'ص',
    category: Category.ELECTRONICS,
    activities: [
      {
        id: 'electronics',
        title: 'كمبيوترات وموبايلات',
        description: 'أجهزة، إكسسوارات، صيانة، ضمان، قطع ومستلزمات.',
        category: Category.ELECTRONICS,
        primaryModuleLabel: 'الأجهزة والإكسسوارات',
        secondaryModuleLabel: 'الصيانة والضمان',
        privateButtons: [
          makeButton('devices', 'الأجهزة'),
          makeButton('accessories', 'الإكسسوارات'),
          makeButton('repairs', 'الصيانة'),
          makeButton('warranty_claims', 'الضمان'),
        ],
      },
      {
        id: 'health',
        title: 'صيدلية / مستحضرات / أجهزة طبية',
        description: 'أدوية، مستحضرات، أجهزة طبية، روشتات وطلبات متكررة.',
        category: Category.HEALTH,
        primaryModuleLabel: 'الأدوية والمنتجات',
        secondaryModuleLabel: 'الروشتات والمتابعة',
        privateButtons: [
          makeButton('prescriptions', 'الروشتات'),
          makeButton('cosmetics', 'مستحضرات العناية'),
          makeButton('medical_devices', 'أجهزة طبية'),
          makeButton('repeat_orders', 'طلبات متكررة'),
        ],
      },
    ],
  },
  {
    id: 'bookings',
    title: 'الحجوزات والمواعيد',
    description: 'عيادات، صالونات، فنادق، قاعات، مدربين، دورات، زيارات وخدمات بمواعيد.',
    icon: 'ح',
    category: Category.SERVICE,
    activities: [
      {
        id: 'bookings',
        title: 'لوحة حجوزات متخصصة',
        description: 'اختر نوع الحجز الداخلي في الخطوة التالية لإظهار أزراره الخاصة.',
        category: Category.SERVICE,
        primaryModuleLabel: 'مقدمو الخدمة',
        secondaryModuleLabel: 'أنواع الحجز',
        privateButtons: [],
      },
    ],
  },
  {
    id: 'other',
    title: 'أنشطة أخرى',
    description: 'أي نشاط غير موجود مع أزرار مرنة قابلة للتخصيص.',
    icon: 'أ',
    category: Category.OTHER,
    activities: [
      {
        id: 'other',
        title: 'نشاط آخر',
        description: 'ابدأ بالأزرار العامة ثم أضف أزرار خاصة حسب احتياجك.',
        category: Category.OTHER,
        primaryModuleLabel: 'خدمات/منتجات النشاط',
        secondaryModuleLabel: 'طلبات العملاء',
        privateButtons: [
          makeButton('custom_services', 'خدمات مخصصة'),
          makeButton('custom_requests', 'طلبات خاصة'),
          makeButton('branches_locations', 'الفروع والمواقع'),
          makeButton('team_members', 'الفريق'),
        ],
      },
    ],
  },
];

export const BUSINESS_ACTIVITIES = BUSINESS_ACTIVITY_GROUPS.flatMap((group) =>
  group.activities.map((activity) => ({ ...activity, groupId: group.id, groupTitle: group.title })),
);

export type BusinessActivityWithGroup = (typeof BUSINESS_ACTIVITIES)[number];

export const getBusinessActivityById = (id?: unknown): BusinessActivityWithGroup | undefined => {
  const normalized = String(id || '').trim();
  return BUSINESS_ACTIVITIES.find((activity) => activity.id === normalized);
};

export const getDefaultActivityForCategory = (category?: unknown): BusinessActivityWithGroup => {
  const cat = String(category || '').trim().toUpperCase();
  return BUSINESS_ACTIVITIES.find((activity) => String(activity.category).toUpperCase() === cat) || BUSINESS_ACTIVITIES[0];
};

export const getBusinessActivityThemePatch = (activityId?: unknown): BusinessActivityThemePatch => {
  const id = String(activityId || '').trim();
  return BUSINESS_ACTIVITY_THEME_PATCHES[id] || BUSINESS_ACTIVITY_THEME_PATCHES.other;
};

export const getBusinessActivityThemePreset = (activityId?: unknown) => {
  const activity = getBusinessActivityById(activityId) || getDefaultActivityForCategory(undefined);
  const patch = getBusinessActivityThemePatch(activity.id);
  return {
    id: patch.quickTheme,
    name: `ثيم ${activity.title}`,
    subtitle: `ثيم جاهز بألوان وتخطيط مناسب لنشاط ${activity.title}.`,
    activityId: activity.id,
    category: activity.category,
    patch,
  };
};

export const getActivityPrivateButtonLabel = (activityId?: unknown, buttonId?: unknown): string => {
  const activity = getBusinessActivityById(activityId);
  const id = String(buttonId || '').trim();
  return activity?.privateButtons.find((button) => button.id === id)?.label || id;
};
