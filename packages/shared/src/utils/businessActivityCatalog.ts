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
  themeLabelAr?: string;
  themeLabelEn?: string;
};

export type BusinessActivityDef = {
  id: string;
  title: string;
  description: string;
  category: Category;
  primaryModuleLabel: string;
  secondaryModuleLabel: string;
  privateButtons: ActivityButtonDef[];
  specialties: string[];
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
  restaurant: makeTheme('activity_restaurant_fire', '#EA580C', '#7C2D12', '#FFF7ED', '#7C2D12', '#431407', '#FED7AA', '#FFF7ED', { themeLabelAr: 'مطعم — نار', themeLabelEn: 'Restaurant — Fire' }),
  grocery: makeTheme('activity_grocery_fresh', '#16A34A', '#166534', '#F0FDF4', '#14532D', '#052E16', '#BBF7D0', '#F7FEE7', { themeLabelAr: 'بقالة — طازج', themeLabelEn: 'Grocery — Fresh' }),
  fashion: makeTheme('activity_fashion_glow', '#BE185D', '#831843', '#FDF2F8', '#831843', '#500724', '#FBCFE8', '#FFF7FB', { imageAspectRatio: 'portrait', productsLayout: 'horizontal', themeLabelAr: 'موضة — تألق', themeLabelEn: 'Fashion — Glow' }),
  homeTextiles: makeTheme('activity_home_textiles_warm', '#B45309', '#78350F', '#FFFBEB', '#78350F', '#451A03', '#FDE68A', '#FFFBEB', { imageAspectRatio: 'landscape', themeLabelAr: 'مفروشات — دفء', themeLabelEn: 'Home Textiles — Warm' }),
  fabricStore: makeTheme('activity_fabric_palette', '#A21CAF', '#581C87', '#FAF5FF', '#581C87', '#3B0764', '#F5D0FE', '#FDF4FF', { imageAspectRatio: 'portrait', productsLayout: 'horizontal', themeLabelAr: 'أقمشة — لوحة ألوان', themeLabelEn: 'Fabric — Palette' }),
  curtainsBlinds: makeTheme('activity_curtains_soft', '#7C3AED', '#4C1D95', '#F5F3FF', '#4C1D95', '#2E1065', '#DDD6FE', '#FAF5FF', { imageAspectRatio: 'portrait', themeLabelAr: 'ستائر — نعومة', themeLabelEn: 'Curtains — Soft' }),
  sofasUpholstery: makeTheme('activity_sofas_lounge', '#92400E', '#422006', '#FEF3C7', '#422006', '#1C1917', '#FDE68A', '#FFFBEB', { imageAspectRatio: 'landscape', themeLabelAr: 'كنب — استرخاء', themeLabelEn: 'Sofas — Lounge' }),
  mattressesBedding: makeTheme('activity_bedding_cloud', '#0284C7', '#0F172A', '#F0F9FF', '#0C4A6E', '#082F49', '#BAE6FD', '#F8FAFC', { imageAspectRatio: 'landscape', themeLabelAr: 'مراتب — سحابة', themeLabelEn: 'Bedding — Cloud' }),
  furniture: makeTheme('activity_furniture_wood', '#A16207', '#713F12', '#FEFCE8', '#713F12', '#422006', '#FEF08A', '#FFF7ED', { imageAspectRatio: 'landscape', themeLabelAr: 'أثاث — خشب', themeLabelEn: 'Furniture — Wood' }),
  homeGoods: makeTheme('activity_home_goods_clean', '#0F766E', '#134E4A', '#F0FDFA', '#134E4A', '#042F2E', '#99F6E4', '#FFFFFF', { themeLabelAr: 'مستلزمات منزل — نظافة', themeLabelEn: 'Home Goods — Clean' }),
  goldJewelry: makeTheme('activity_gold_luxury', '#D97706', '#78350F', '#FFFBEB', '#78350F', '#111827', '#FDE68A', '#FEFCE8', { productCardOverlayBgColor: '#92400E', themeLabelAr: 'ذهب — فخامة', themeLabelEn: 'Gold — Luxury' }),
  silverAccessories: makeTheme('activity_silver_elegance', '#64748B', '#334155', '#F8FAFC', '#0F172A', '#020617', '#CBD5E1', '#FFFFFF', { imageAspectRatio: 'portrait', themeLabelAr: 'فضة — أناقة', themeLabelEn: 'Silver — Elegance' }),
  watchesGifts: makeTheme('activity_watches_midnight', '#1D4ED8', '#111827', '#EFF6FF', '#172554', '#020617', '#BFDBFE', '#F8FAFC', { imageAspectRatio: 'portrait', themeLabelAr: 'ساعات — منتصف الليل', themeLabelEn: 'Watches — Midnight' }),
  realEstate: makeTheme('activity_real_estate_skyline', '#2563EB', '#1E3A8A', '#EFF6FF', '#172554', '#0F172A', '#BFDBFE', '#F8FAFC', { imageAspectRatio: 'landscape', productDisplay: 'list', themeLabelAr: 'عقارات — أفق المدينة', themeLabelEn: 'Real Estate — Skyline' }),
  lands: makeTheme('activity_lands_earth', '#65A30D', '#365314', '#F7FEE7', '#365314', '#1A2E05', '#D9F99D', '#FEFCE8', { imageAspectRatio: 'landscape', productDisplay: 'list', themeLabelAr: 'أراضي — تراب', themeLabelEn: 'Lands — Earth' }),
  contractors: makeTheme('activity_contractors_build', '#F97316', '#7C2D12', '#FFF7ED', '#7C2D12', '#1C1917', '#FDBA74', '#FAFAF9', { imageAspectRatio: 'landscape', themeLabelAr: 'مقاولات — بناء', themeLabelEn: 'Contractors — Build' }),
  building_supplies: makeTheme('activity_building_supplies', '#475569', '#1E293B', '#F8FAFC', '#0F172A', '#020617', '#CBD5E1', '#FFFFFF', { productDisplay: 'list', themeLabelAr: 'مواد بناء — صلب', themeLabelEn: 'Building Supplies — Steel' }),
  carShowroom: makeTheme('activity_cars_showroom', '#DC2626', '#111827', '#FEF2F2', '#7F1D1D', '#020617', '#FECACA', '#FFFFFF', { imageAspectRatio: 'landscape', productsLayout: 'horizontal', themeLabelAr: 'سيارات — المعرض', themeLabelEn: 'Cars — Showroom' }),
  auto_services: makeTheme('activity_auto_workshop', '#EA580C', '#1F2937', '#FFF7ED', '#7C2D12', '#111827', '#FDBA74', '#FAFAFA', { imageAspectRatio: 'landscape', themeLabelAr: 'ورشة سيارات — احتراف', themeLabelEn: 'Auto Workshop — Pro' }),
  auto_parts: makeTheme('activity_auto_parts', '#2563EB', '#1E293B', '#EFF6FF', '#172554', '#020617', '#BFDBFE', '#FFFFFF', { productDisplay: 'list', themeLabelAr: 'قطع غيار — دقة', themeLabelEn: 'Auto Parts — Precision' }),
  agri_supplies: makeTheme('activity_agri_supplies', '#16A34A', '#365314', '#F0FDF4', '#14532D', '#052E16', '#BBF7D0', '#F7FEE7', { themeLabelAr: 'مستلزمات زراعية — أخضر', themeLabelEn: 'Agri Supplies — Green' }),
  nurseries_landscaping: makeTheme('activity_nursery_garden', '#059669', '#064E3B', '#ECFDF5', '#064E3B', '#022C22', '#A7F3D0', '#F6FFFB', { imageAspectRatio: 'portrait', themeLabelAr: 'مشتل — حديقة', themeLabelEn: 'Nursery — Garden' }),
  serviceCompanies: makeTheme('activity_service_company', '#0891B2', '#164E63', '#ECFEFF', '#164E63', '#083344', '#A5F3FC', '#F8FAFC', { productDisplay: 'list', themeLabelAr: 'شركة خدمات — ثقة', themeLabelEn: 'Service Company — Trust' }),
  individualTechnicians: makeTheme('activity_technicians', '#CA8A04', '#713F12', '#FEFCE8', '#713F12', '#422006', '#FEF08A', '#FFFFFF', { productDisplay: 'list', themeLabelAr: 'فني مستقل — محترف', themeLabelEn: 'Technician — Pro' }),
  workshops: makeTheme('activity_workshops_maker', '#B45309', '#44403C', '#FFFBEB', '#78350F', '#1C1917', '#FDE68A', '#FAFAF9', { imageAspectRatio: 'landscape', themeLabelAr: 'ورشة — صناع', themeLabelEn: 'Workshop — Maker' }),
  electronics: makeTheme('activity_electronics_neon', '#0EA5E9', '#0F172A', '#0F172A', '#E0F2FE', '#020617', '#7DD3FC', '#F8FAFC', { productsLayout: 'horizontal', imageAspectRatio: 'landscape', themeLabelAr: 'إلكترونيات — نيون', themeLabelEn: 'Electronics — Neon' }),
  health: makeTheme('activity_health_care', '#0D9488', '#115E59', '#F0FDFA', '#134E4A', '#042F2E', '#99F6E4', '#FFFFFF', { themeLabelAr: 'صحة — رعاية', themeLabelEn: 'Health — Care' }),
  factories: makeTheme('activity_factory_steel', '#475569', '#1E293B', '#F8FAFC', '#0F172A', '#020617', '#CBD5E1', '#FFFFFF', { productDisplay: 'list', imageAspectRatio: 'landscape', themeLabelAr: 'مصنع — صلب', themeLabelEn: 'Factory — Steel' }),
  tradeCompanies: makeTheme('activity_trade_corporate', '#1E40AF', '#1E3A8A', '#EFF6FF', '#172554', '#0F172A', '#BFDBFE', '#F8FAFC', { productDisplay: 'list', themeLabelAr: 'تجارة — مؤسسي', themeLabelEn: 'Trade — Corporate' }),
  tourismTravel: makeTheme('activity_tourism_sky', '#0EA5E9', '#0369A1', '#F0F9FF', '#0C4A6E', '#082F49', '#BAE6FD', '#F8FAFC', { imageAspectRatio: 'landscape', productsLayout: 'horizontal', themeLabelAr: 'سياحة — سماء', themeLabelEn: 'Tourism — Sky' }),
  livestock: makeTheme('activity_livestock_earth', '#A16207', '#713F12', '#FEFCE8', '#713F12', '#422006', '#FEF08A', '#FFF7ED', { imageAspectRatio: 'landscape', themeLabelAr: 'ثروة حيوانية — تراب', themeLabelEn: 'Livestock — Earth' }),
  fisheries: makeTheme('activity_fisheries_ocean', '#0891B2', '#164E63', '#ECFEFF', '#164E63', '#083344', '#A5F3FC', '#F8FAFC', { imageAspectRatio: 'landscape', themeLabelAr: 'ثروة سمكية — محيط', themeLabelEn: 'Fisheries — Ocean' }),
  energy: makeTheme('activity_energy_solar', '#F59E0B', '#B45309', '#FFFBEB', '#78350F', '#451A03', '#FDE68A', '#FFFBEB', { imageAspectRatio: 'landscape', productsLayout: 'horizontal', themeLabelAr: 'طاقة — شمسية', themeLabelEn: 'Energy — Solar' }),
  professionalServices: makeTheme('activity_professional_navy', '#1E3A8A', '#1E293B', '#F8FAFC', '#0F172A', '#020617', '#BFDBFE', '#FFFFFF', { productDisplay: 'list', themeLabelAr: 'خدمات مهنية — كحلي', themeLabelEn: 'Professional — Navy' }),
  homeServices: makeTheme('activity_home_services_warm', '#DC2626', '#991B1B', '#FEF2F2', '#7F1D1D', '#450A0A', '#FECACA', '#FFFFFF', { productDisplay: 'list', themeLabelAr: 'خدمات منزلية — دفء', themeLabelEn: 'Home Services — Warm' }),
  other: makeTheme('activity_other_flexible', '#334155', '#0F172A', '#F8FAFC', '#0F172A', '#0F172A', '#CBD5E1', '#FFFFFF', { productDisplay: 'list', themeLabelAr: 'مرن — عام', themeLabelEn: 'Flexible — General' }),
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
          makeButton('table_bookings', 'حجز الطاولات'),
        ],
        specialties: ['مطعم عائلي', 'كافيه', 'مطعم وجبات سريعة', 'مطعم مشويات', 'مطعم سمك', 'مطعم صحي/دايت', 'كشك Street Food', 'بوفيه مفتوح', 'مخبوزات وحلويات', 'مطعم حلال/كوشر'],
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
        specialties: ['سوبر ماركت', 'بقالة', 'عطارة وأعشاب', 'خضار وفاكهة', 'معلبات', 'ألبان وأسماك', 'مخبوزات', 'تموين المنازل', 'بقالة أونلاين', 'أغراض جملة'],
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
        specialties: ['ملابس رجالي', 'ملابس حريمي', 'ملابس أطفال', 'أحذية', 'إكسسوارات', 'شنط', 'ملابس رياضية', 'ملابس أفراح', 'ملابس أحجام كبيرة', 'أزياء محجبات'],
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
        specialties: ['سجاد', 'ستائر', 'مفروشات', 'لحاف ومدافئ', 'مناشف', 'أغطية كنب', 'سجاد صلاة', 'خيام', 'مفارش طعام', 'تلبيسات أرضيات'],
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
        specialties: ['أقمشة ملابس', 'أقمشة مفروشات', 'خيام وستائر', 'تطريز', 'تفصيل ملابس', 'تفصيل أفراح', 'باترونات', 'خيامية', 'قماش بالمتر', 'رولات جملة'],
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
        specialties: ['ستائر شيفون', 'بلاك أوت', 'ستائر رول', 'ستائر رأسية', 'برقع', 'قضبان وكرانيش', 'ستائر أبواب', 'ستائر مطبخ', 'خيام', 'تلبيس نوافذ'],
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
        specialties: ['كنب', 'انتريهات', 'ركنات', 'تنجيد', 'تغيير قماش', 'إصلاح كراسي', 'تصنيع حسب الطلب', 'وسائد', 'كنب مكتبي', 'صيانة أثاث'],
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
        specialties: ['مراتب طبية', 'مراتب اسفنج', 'مراتب طبيعية', 'ملايات قطن', 'لحاف', 'مخدات', 'واقي مرتبة', 'مفارش', 'أطقم سرير', 'بياضات فندقية'],
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
        specialties: ['غرف نوم', 'غرف معيشة', 'مكاتب', 'مطابخ', 'أثاث خارجي', 'أثاث فنادق', 'ديكور داخلي', 'تصنيع حسب الطلب', 'معارض أثاث', 'تركيب أثاث'],
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
        specialties: ['أدوات مطبخ', 'أواني', 'تنظيف', 'تنظيم', 'أجهزة صغيرة', 'إكسسوارات منزل', 'ديكورات', 'حمام', 'مستلزمات أطفال', 'منظمات'],
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
        specialties: ['ذهب عيار 18', 'ذهب عيار 21', 'ذهب عيار 24', 'ألماس', 'أطقم', 'خواتم ودبل', 'سبائك', 'جنيهات ذهب', 'صيانة وتلميع', 'تفصيل حسب الطلب'],
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
        specialties: ['فضة عيار 925', 'إكسسوارات نسائية', 'إكسسوارات رجالي', 'هدايا شخصية', 'نقش أسماء', 'تعليقات ودلايات', 'أساور وخواتم', 'ساعات', 'نظارات', 'تغليف هدايا'],
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
        specialties: ['ساعات رجالي', 'ساعات حريمي', 'ساعات أطفال', 'ماركات عالمية', 'ساعات رياضية', 'ساعات كلاسيك', 'عطور', 'أطقم هدايا', 'سيور وبطاريات', 'صيانة ساعات'],
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
        specialties: ['شقق', 'فيلات', 'محلات', 'مكاتب إدارية', 'وحدات تجارية', 'عقارات فاخرة', 'وحدات مفروشة', 'تقسيط', 'معاينات', 'استشارات عقارية'],
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
        specialties: ['أراضي سكنية', 'أراضي تجارية', 'أراضي صناعية', 'أراضي زراعية', 'أراضي استثمارية', 'تقسيم أراضي', 'تراخيص', 'خرائط', 'بيع نقدي', 'تقسيط'],
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
        specialties: ['تشطيب شقق', 'تشطيب فلل', 'تصميم داخلي', 'أعمال كهرباء', 'أعمال سباكة', 'دهانات وديكور', 'أعمال نجارة', 'إشراف هندسي', 'مقاولات عامة', 'ترميم'],
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
        specialties: ['أسمنت', 'حديد', 'دهانات', 'صحي', 'كهرباء', 'أدوات بناء', 'بلاط وسيراميك', 'مواد عزل', 'خشب و plywood', 'توريد ونقل'],
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
        specialties: ['سيارات جديدة', 'سيارات مستعملة', 'تقسيط', 'تجارب قيادة', 'معاينة فنية', 'سيارات فاخرة', 'سيارات اقتصادية', 'SUV', 'سيارات كهربائية', 'استبدال سيارات'],
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
        specialties: ['ميكانيكا عامة', 'كهرباء سيارات', 'سمكرة ودهان', 'صيانة دورية', 'فحص شامل', 'غسيل وتلميع', 'تغيير زيت', 'إطارات وبطاريات', 'برمجة كمبيوتر', 'تكييف سيارات'],
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
        specialties: ['قطع غيار أصلية', 'قطع غيار تجارية', 'إطارات', 'بطاريات', 'زيوت ومحركات', 'إكسسوارات سيارات', 'كماليات', 'تركيب قطع', 'توافق الموديلات', 'قطع جملة'],
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
        specialties: ['بذور', 'شتلات', 'أسمدة', 'مبيدات', 'أدوات ري', 'تربة ومخلفات', 'أعلاف', 'معدات زراعية', 'مكافحة آفات', 'استشارات زراعية'],
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
        specialties: ['نباتات داخلية', 'نباتات خارجية', 'أشجار', 'نجيلة صناعي/طبيعي', 'تصميم حدائق', 'صيانة دورية', 'شبكات ري', 'أزهار وزهور', 'زراعة أسطح', 'تنسيق فلل'],
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
        specialties: ['صيانة عامة', 'تنظيف', 'أمن وحراسة', 'نقل ورفع', 'إدارة مرافق', 'خدمات عقارية', 'تنسيق حدائق', 'تعقيم آفات', 'عقود سنوية', 'خدمات شركات'],
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
        specialties: ['سباك', 'كهربائي', 'نجار', 'نقاش', 'تكييف', 'أجهزة منزلية', 'حدادة', 'ألوميتال', 'دهانات', 'صيانة عامة'],
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
        specialties: ['نجارة', 'حدادة', 'ألوميتال', 'زجاج ومرايا', 'تصنيع أثاث', 'تصليح معدات', 'أعمال ستانلس', 'خامات معدنية', 'تشغيل CNC', 'دهانات صناعية'],
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
        specialties: ['موبايلات', 'لابتوب', 'تابلت', 'إكسسوارات', 'صيانة موبايل', 'صيانة كمبيوتر', 'شاشات', 'سماعات', 'كاميرات', 'ألعاب وأجهزة محمولة'],
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
        specialties: ['صيدلية', 'أدوية', 'مستحضرات تجميل', 'أجهزة طبية', 'مكملات غذائية', 'عناية شخصية', 'أدوية أطفال', 'أدوية مزمنة', 'روشتات', 'توصيل أدوية'],
      },
    ],
  },
  {
    id: 'factories',
    title: 'مصانع وورش إنتاج',
    description: 'خامات، موردين، مخازن، نقل، تغليف، طباعة وتصنيع.',
    icon: 'ص',
    category: Category.RETAIL,
    activities: [
      {
        id: 'factories',
        title: 'مصنع / خط إنتاج',
        description: 'خامات، موردين، مخازن، خطوط إنتاج، جودة وتغليف.',
        category: Category.RETAIL,
        primaryModuleLabel: 'المنتجات والخطوط',
        secondaryModuleLabel: 'الموردون والمخازن',
        privateButtons: [
          makeButton('raw_materials', 'الخامات والمكونات'),
          makeButton('suppliers', 'الموردون'),
          makeButton('production_lines', 'خطوط الإنتاج'),
          makeButton('warehouses', 'المخازن والكتالوج'),
        ],
        specialties: ['غذائي', 'بلاستيك', 'معدني', 'كيماوي', 'نسيج', 'أخشاب', 'ورق وطباعة', 'تغليف', 'مياه ومرطبات', 'أدوات منزلية'],
      },
    ],
  },
  {
    id: 'trade_companies',
    title: 'تجارة وشركات واستيراد',
    description: 'موردين، موزعين، شحن، مخازن، تغليف، استيراد وتصدير.',
    icon: 'ت',
    category: Category.RETAIL,
    activities: [
      {
        id: 'tradeCompanies',
        title: 'شركة تجارة / استيراد / تصدير',
        description: 'موردين، موزعين، شحن، مخازن، استيراد وتصدير.',
        category: Category.RETAIL,
        primaryModuleLabel: 'المنتجات والكاتالوج',
        secondaryModuleLabel: 'الموردون والشحن',
        privateButtons: [
          makeButton('suppliers_distributors', 'موردين وموزعين'),
          makeButton('shipping_logistics', 'شحن ولوجستيات'),
          makeButton('import_export', 'استيراد وتصدير'),
          makeButton('wholesale_catalog', 'كتالوج الجملة'),
        ],
        specialties: ['استيراد', 'تصدير', 'توزيع جملة', 'شحن دولي', 'شحن محلي', 'مخازن', 'تغليف', 'نياشن وتوكيلات', 'تجارة إلكترونية', 'تجارة عامة'],
      },
    ],
  },
  {
    id: 'tourism_travel',
    title: 'سياحة ورحلات وضيافة',
    description: 'فنادق، شقق، مرشدين، سيارات، طيران، تأمين سفر وبرامج سياحية.',
    icon: 'س',
    category: Category.SERVICE,
    activities: [
      {
        id: 'tourismTravel',
        title: 'شركة سياحة وسفر',
        description: 'فنادق، رحلات، طيران، تأمين سفر، برامج ومرشدين.',
        category: Category.SERVICE,
        primaryModuleLabel: 'البرامج والرحلات',
        secondaryModuleLabel: 'الحجوزات والعملاء',
        privateButtons: [
          makeButton('tour_packages', 'برامج سياحية'),
          makeButton('hotel_bookings', 'حجوزات فنادق'),
          makeButton('flight_tickets', 'تذاكر طيران'),
          makeButton('travel_insurance', 'تأمين سفر'),
        ],
        specialties: ['رحلات داخلية', 'رحلات خارجية', 'عمرة وحج', 'حجوزات فنادق', 'تذاكر طيران', 'تأمين سفر', 'مرشد سياحي', 'تأجير سيارات', 'برامج عائلية', 'برامج شهر عسل'],
      },
    ],
  },
  {
    id: 'livestock',
    title: 'الثروة الحيوانية',
    description: 'أعلاف، أدوية، بيطري، معدات، نقل ومذابح.',
    icon: 'ح',
    category: Category.RETAIL,
    activities: [
      {
        id: 'livestock',
        title: 'مشروع ثروة حيوانية',
        description: 'أعلاف، أدوية بيطرية، معدات، مذابح ونقل حيواني.',
        category: Category.RETAIL,
        primaryModuleLabel: 'المنتجات والخدمات',
        secondaryModuleLabel: 'البيطري والمذابح',
        privateButtons: [
          makeButton('feed_supplies', 'أعلاف ومكملات'),
          makeButton('vet_medicine', 'أدوية بيطرية'),
          makeButton('livestock_equipment', 'معدات ومزارع'),
          makeButton('transport_slaughter', 'نقل ومذابح'),
        ],
        specialties: ['دواجن', 'أبقار', 'أغنام', 'ماعز', 'خيول', 'أعلاف', 'أدوية بيطرية', 'مذابح', 'نقل حيواني', 'معدات مزارع'],
      },
    ],
  },
  {
    id: 'fisheries',
    title: 'الثروة السمكية',
    description: 'زريعة، أعلاف، معدات، تبريد، نقل وتصدير.',
    icon: 'س',
    category: Category.RETAIL,
    activities: [
      {
        id: 'fisheries',
        title: 'مشروع ثروة سمكية',
        description: 'زريعة، أعلاف، معدات تبريد، نقل وتصدير أسماك.',
        category: Category.RETAIL,
        primaryModuleLabel: 'المنتجات والمعدات',
        secondaryModuleLabel: 'التصدير والتبريد',
        privateButtons: [
          makeButton('fry_seed', 'زريعة وبيض أسماك'),
          makeButton('fish_feed', 'أعلاف أسماك'),
          makeButton('fishing_equipment', 'معدات وصيد'),
          makeButton('cooling_export', 'تبريد وتصدير'),
        ],
        specialties: ['استزراع سمكي', 'زريعة', 'أعلاف أسماك', 'معدات صيد', 'تبريد', 'نقل أسماك', 'تصدير أسماك', 'أسماك طازجة', 'روبيان', 'مأكولات بحرية'],
      },
    ],
  },
  {
    id: 'energy',
    title: 'الطاقة والكهرباء',
    description: 'ألواح شمسية، بطاريات، مولدات، كهربائي، تركيب وصيانة.',
    icon: 'ط',
    category: Category.SERVICE,
    activities: [
      {
        id: 'energy',
        title: 'طاقة وكهرباء وصيانة',
        description: 'ألواح شمسية، بطاريات، مولدات، تركيب، صيانة وكهرباء.',
        category: Category.SERVICE,
        primaryModuleLabel: 'المنتجات والأنظمة',
        secondaryModuleLabel: 'التركيب والصيانة',
        privateButtons: [
          makeButton('solar_panels', 'ألواح شمسية وإنفرتر'),
          makeButton('batteries_storage', 'بطاريات وتخزين'),
          makeButton('generators', 'مولدات كهرباء'),
          makeButton('installation_maintenance', 'تركيب وصيانة'),
        ],
        specialties: ['طاقة شمسية', 'بطاريات', 'مولدات', 'إنفرتر', 'كهرباء منازل', 'كهرباء مصانع', 'صيانة طاقة', 'تركيب ألواح', 'كابلات ومفاتيح', 'تأريض وحماية'],
      },
    ],
  },
  {
    id: 'professional_services',
    title: 'الخدمات المهنية',
    description: 'محاسب، محامي، مترجم، مصمم، مبرمج، مستشار وخبراء.',
    icon: 'ه',
    category: Category.SERVICE,
    activities: [
      {
        id: 'professionalServices',
        title: 'خدمات مهنية واستشارات',
        description: 'محاسبة، محاماة، ترجمة، تصميم، برمجة، استشارات وخبراء.',
        category: Category.SERVICE,
        primaryModuleLabel: 'الخدمات والاستشارات',
        secondaryModuleLabel: 'المواعيد والعملاء',
        privateButtons: [
          makeButton('consulting', 'استشارات وخدمات'),
          makeButton('appointments', 'مواعيد وحجوزات'),
          makeButton('documents', 'مستندات وعقود'),
          makeButton('portfolio', 'أعمال سابقة'),
        ],
        specialties: ['محاسب', 'محامي', 'مترجم', 'مصمم جرافيك', 'مبرمج', 'مستشار مالي', 'مستشار إداري', 'خبير تسويق', 'مستشار عقاري', 'مدرب أعمال'],
      },
    ],
  },
  {
    id: 'home_services',
    title: 'الخدمات المنزلية',
    description: 'سباك، كهربائي، نجار، نقاش، تكييف، تنظيف وزيارات منزلية.',
    icon: 'خ',
    category: Category.SERVICE,
    activities: [
      {
        id: 'homeServices',
        title: 'خدمات منزلية وصيانة',
        description: 'سباكة، كهرباء، نجارة، دهانات، تكييف، تنظيف وزيارات.',
        category: Category.SERVICE,
        primaryModuleLabel: 'الخدمات والمواعيد',
        secondaryModuleLabel: 'المناطق والرسوم',
        privateButtons: [
          makeButton('home_services_list', 'قائمة الخدمات'),
          makeButton('visit_booking', 'حجز زيارة'),
          makeButton('service_areas', 'مناطق الخدمة'),
          makeButton('before_after_photos', 'صور قبل وبعد'),
        ],
        specialties: ['سباك', 'كهربائي', 'نجار', 'نقاش', 'تكييف', 'تنظيف', 'صيانة أجهزة', 'تركيب أثاث', 'تنظيف خزانات', 'كشف تسربات'],
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
        specialties: [],
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

export const getBusinessActivityThemePreset = (activityId?: unknown, lang?: string) => {
  const activity = getBusinessActivityById(activityId) || getDefaultActivityForCategory(undefined);
  const patch = getBusinessActivityThemePatch(activity.id);
  const isEn = String(lang || '').toLowerCase().startsWith('en');
  const themeLabel = isEn ? (patch.themeLabelEn || patch.quickTheme) : (patch.themeLabelAr || patch.quickTheme);
  return {
    id: patch.quickTheme,
    name: isEn ? themeLabel : `ثيم ${activity.title}`,
    subtitle: isEn
      ? `Pre-built theme with colors and layout suited for ${activity.title}.`
      : `ثيم جاهز بألوان وتخطيط مناسب لنشاط ${activity.title}.`,
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

const BUSINESS_ACTIVITY_TO_ACTIVITY_ROUTE: Record<string, string> = {
  restaurant: '/activity/trade',
  grocery: '/activity/trade',
  fashion: '/activity/trade',
  homeTextiles: '/activity/home',
  fabricStore: '/activity/home',
  curtainsBlinds: '/activity/home',
  sofasUpholstery: '/activity/home',
  mattressesBedding: '/activity/home',
  furniture: '/activity/home',
  homeGoods: '/activity/home',
  goldJewelry: '/activity/trade',
  silverAccessories: '/activity/trade',
  watchesGifts: '/activity/trade',
  realEstate: '/activity/real-estate',
  lands: '/activity/real-estate',
  contractors: '/activity/construction',
  building_supplies: '/activity/construction',
  carShowroom: '/activity/cars',
  auto_services: '/activity/cars',
  auto_parts: '/activity/cars',
  agri_supplies: '/activity/agriculture',
  nurseries_landscaping: '/activity/agriculture',
  serviceCompanies: '/activity/professional',
  individualTechnicians: '/activity/home',
  workshops: '/activity/professional',
  electronics: '/activity/trade',
  health: '/activity/medical',
  factories: '/activity/professional',
  tradeCompanies: '/activity/trade',
  tourismTravel: '/activity/professional',
  livestock: '/activity/agriculture',
  fisheries: '/activity/agriculture',
  energy: '/activity/professional',
  professionalServices: '/activity/professional',
  homeServices: '/activity/home',
  other: '/activity/professional',
};

export const getActivityPageRoute = (activityId?: unknown): string | undefined => {
  const id = String(activityId || '').trim();
  return BUSINESS_ACTIVITY_TO_ACTIVITY_ROUTE[id];
};
