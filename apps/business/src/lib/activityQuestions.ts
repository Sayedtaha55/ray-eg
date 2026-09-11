import type { ModuleId } from './moduleConfig';

/**
 * Onboarding question system: for each activity the merchant answers a few
 * plain questions, and every answer quietly turns on the right modules of
 * the dashboard. Merchants who skip the wizard get the activity defaults,
 * and can enable everything later from dashboard settings (upgrade path).
 */

export type QuestionOption = {
  id: string;
  label: string;
  desc?: string;
  modules?: ModuleId[];
  specialty?: string;
};

export type ActivityQuestion = {
  id: string;
  question: string;
  hint?: string;
  multi?: boolean;
  options: QuestionOption[];
};

const YES_NO = (modules: ModuleId[], specialty?: string): QuestionOption[] => [
  { id: 'yes', label: 'أيوه', modules, specialty },
  { id: 'no', label: 'لأ' },
];

const HOW_BRANCHES: ActivityQuestion = {
  id: 'branches',
  question: 'كام فرع عندك؟',
  hint: 'هنظبط إدارة الفروع على حجم مشروعك',
  options: [
    { id: 'one', label: 'فرع واحد', specialty: 'فرع واحد' },
    { id: 'few', label: 'من 2 لـ 4 فروع', modules: ['inventory'], specialty: 'متعدد الفروع' },
    { id: 'many', label: '5 فروع أو أكثر', modules: ['inventory', 'hr', 'analytics'], specialty: 'سلسلة فروع' },
  ],
};

const HR_QUESTION: ActivityQuestion = {
  id: 'employees',
  question: 'هتدير موظفين وورديات؟',
  hint: 'حضور وانصراف، رواتب، إجازات',
  options: YES_NO(['hr']),
};

const RESTAURANT_IDS = new Set(['restaurant']);

export const ACTIVITY_QUESTIONS: Record<string, ActivityQuestion[]> = {
  restaurant: [
    {
      id: 'selling_channels',
      question: 'بتقدّم إزاي؟',
      hint: 'اختار كل اللي ينطبق عليك',
      multi: true,
      options: [
        { id: 'dinein', label: 'طاولات صالة', modules: [], specialty: 'صالة' },
        { id: 'delivery', label: 'ديليفري', modules: ['sales'], specialty: 'ديليفري' },
        { id: 'takeaway', label: 'تيك أواي', specialty: 'تيك أواي' },
        { id: 'online', label: 'طلب أونلاين', modules: ['website'], specialty: 'طلب أونلاين' },
      ],
    },
    {
      id: 'pos',
      question: 'محتاج كاشير (نقطة بيع)؟',
      hint: 'فاتورة كاشير سريعة وورديات',
      options: YES_NO(['pos'], 'كاشير'),
    },
    {
      id: 'reservations',
      question: 'بتستقبل حجز طاولات مسبق؟',
      options: YES_NO(['bookings'], 'حجز طاولات'),
    },
    {
      id: 'inventory',
      question: 'بتدير مخزون خامات؟',
      hint: 'متابعة الخامات والمستلزمات',
      options: YES_NO(['inventory'], 'إدارة مخزون'),
    },
    HR_QUESTION,
    HOW_BRANCHES,
  ],
  grocery: [
    {
      id: 'pos',
      question: 'بتبيع كاشير في المحل؟',
      options: YES_NO(['pos'], 'كاشير'),
    },
    {
      id: 'online',
      question: 'عاوز العملاء يطلبوا أونلاين؟',
      options: YES_NO(['website'], 'بيع أونلاين'),
    },
    {
      id: 'delivery',
      question: 'بتوصّل طلبات للبيوت؟',
      options: YES_NO(['sales'], 'ديليفري'),
    },
    {
      id: 'inventory',
      question: 'عاوز تتابع المخزون والكميات؟',
      options: YES_NO(['inventory'], 'إدارة مخزون'),
    },
    HR_QUESTION,
    HOW_BRANCHES,
  ],
  fashion: [
    {
      id: 'online',
      question: 'عاوز متجر أونلاين تعرض فيه المنتجات؟',
      options: YES_NO(['website'], 'بيع أونلاين'),
    },
    {
      id: 'pos',
      question: 'عندك معرض/محل بكاشير؟',
      options: YES_NO(['pos'], 'كاشير'),
    },
    {
      id: 'inventory',
      question: 'محتاج تدير مقاسات وألوان ومخزون؟',
      hint: 'الأنواع (variants) والكميات',
      options: YES_NO(['inventory'], 'إدارة مخزون'),
    },
    {
      id: 'marketing',
      question: 'مهتم بعروض وكوبونات وبرنامج ولاء؟',
      options: YES_NO(['marketing'], 'عروض وولاء'),
    },
    HR_QUESTION,
    HOW_BRANCHES,
  ],
  goldJewelry: [
    {
      id: 'pos',
      question: 'بتبيع كاشير في المعرض؟',
      options: YES_NO(['pos'], 'كاشير'),
    },
    {
      id: 'quotes',
      question: 'بتقدم عروض أسعار لعملاء الذهب والمناسبات؟',
      options: YES_NO(['sales'], 'عروض أسعار'),
    },
    {
      id: 'inventory',
      question: 'عاوز جرد دقيق للقطع والأوزان؟',
      options: YES_NO(['inventory'], 'جرد ومعادن'),
    },
    HOW_BRANCHES,
  ],
  electronics: [
    {
      id: 'online',
      question: 'عاوز تبيع أونلاين؟',
      options: YES_NO(['website'], 'بيع أونلاين'),
    },
    {
      id: 'pos',
      question: 'عندك محل بكاشير؟',
      options: YES_NO(['pos'], 'كاشير'),
    },
    {
      id: 'inventory',
      question: 'محتاج تتبع السيريالات والضمانات والمخزون؟',
      options: YES_NO(['inventory'], 'ضمانات وسيريالات'),
    },
    {
      id: 'marketing',
      question: 'مهتم بعروض وبرنامج ولاء؟',
      options: YES_NO(['marketing'], 'عروض وولاء'),
    },
    HR_QUESTION,
    HOW_BRANCHES,
  ],
  health: [
    {
      id: 'pos',
      question: 'بتبيع كاشير في الصيدلية/المحل؟',
      options: YES_NO(['pos'], 'كاشير'),
    },
    {
      id: 'inventory',
      question: 'عاوز تتابع تواريخ الصلاحية والمخزون؟',
      options: YES_NO(['inventory'], 'صلاحية ومخزون'),
    },
    {
      id: 'bookings',
      question: 'بتستقبل حجوزات أو استشارات؟',
      options: YES_NO(['bookings'], 'حجوزات'),
    },
    HOW_BRANCHES,
  ],
};

// Activities built around appointments (clinics, salons, offices...)
const BOOKING_QUESTION_SET: ActivityQuestion[] = [
  {
    id: 'booking_types',
    question: 'بتستقبل حجوزات إزاي؟',
    hint: 'اختار كل اللي ينطبق',
    multi: true,
    options: [
      { id: 'appointments', label: 'مواعيد أفراد', specialty: 'مواعيد' },
      { id: 'groups', label: 'مجموعات أو قاعات', specialty: 'قاعات ومجموعات' },
      { id: 'online', label: 'حجز أونلاين من العملاء', modules: ['website'], specialty: 'حجز أونلاين' },
    ],
  },
  {
    id: 'pos',
    question: 'بتحصّل فودية كاشير؟',
    options: YES_NO(['pos'], 'كاشير'),
  },
  {
    id: 'inventory',
    question: 'بتستخدم مستلزمات ومخزون؟',
    options: YES_NO(['inventory'], 'إدارة مخزون'),
  },
  HR_QUESTION,
  HOW_BRANCHES,
];

// Generic fallback for activities without a custom set
export const GENERIC_QUESTIONS: ActivityQuestion[] = [
  {
    id: 'online',
    question: 'عاوز تبيع أو تعرض خدماتك أونلاين؟',
    options: YES_NO(['website'], 'بيع أونلاين'),
  },
  {
    id: 'pos',
    question: 'محتاج كاشير (نقطة بيع)؟',
    options: YES_NO(['pos'], 'كاشير'),
  },
  {
    id: 'inventory',
    question: 'بتدير مخزون أو منتجات؟',
    options: YES_NO(['inventory'], 'إدارة مخزون'),
  },
  {
    id: 'quotes',
    question: 'بتقدم عروض أسعار للعملاء والمؤسسات؟',
    options: YES_NO(['sales'], 'عروض أسعار'),
  },
  HR_QUESTION,
  HOW_BRANCHES,
];

export function getQuestionsForActivity(activityId: string, isBookingActivity: boolean): ActivityQuestion[] {
  if (ACTIVITY_QUESTIONS[activityId]) return ACTIVITY_QUESTIONS[activityId];
  if (isBookingActivity) return BOOKING_QUESTION_SET;
  return GENERIC_QUESTIONS;
}

/**
 * The minimal module baseline per activity — what a merchant gets when he
 * skips the wizard ("manual" mode): the simple essentials of his trade.
 * Questions only ADD on top of this; nothing is enabled by default beyond it.
 */
export const ACTIVITY_BASE_MODULES: Record<string, ModuleId[]> = {
  restaurant: ['core', 'sales', 'pos', 'inventory'],
  grocery: ['core', 'sales', 'pos', 'inventory'],
  fashion: ['core', 'sales', 'inventory'],
  goldJewelry: ['core', 'sales', 'pos', 'inventory'],
  electronics: ['core', 'sales', 'pos', 'inventory'],
  health: ['core', 'sales', 'pos', 'inventory'],
};

export function getBaseModules(activityId: string, isBookingActivity: boolean): ModuleId[] {
  if (ACTIVITY_BASE_MODULES[activityId]) return ACTIVITY_BASE_MODULES[activityId];
  if (isBookingActivity) return ['core', 'sales', 'bookings'];
  return ['core', 'sales'];
}

/** Union of modules selected through answers, on top of activity defaults. */
export function modulesFromAnswers(
  defaults: ModuleId[],
  questions: ActivityQuestion[],
  answers: Record<string, string[]>,
): ModuleId[] {
  const set = new Set<ModuleId>(defaults);
  for (const q of questions) {
    for (const optId of answers[q.id] || []) {
      const opt = q.options.find((o) => o.id === optId);
      for (const m of opt?.modules || []) set.add(m);
    }
  }
  return Array.from(set);
}

/** Specialties implied by the answers (used for the shop profile). */
export function specialtiesFromAnswers(
  questions: ActivityQuestion[],
  answers: Record<string, string[]>,
): string[] {
  const out = new Set<string>();
  for (const q of questions) {
    for (const optId of answers[q.id] || []) {
      const opt = q.options.find((o) => o.id === optId);
      if (opt?.specialty) out.add(opt.specialty);
    }
  }
  return Array.from(out);
}

/**
 * Mapping from onboarding module ids to the dashboard-web sidebar feature
 * gates (layoutConfig.enabledFeatures). These are sent to the backend so the
 * dashboard really shows only what the merchant picked.
 */
const DASHBOARD_FEATURE_MAP: Record<string, string[]> = {
  sales: ['orders'],
  pos: ['posCheckout'],
  inventory: ['products'],
  finance: ['invoice'],
  bookings: ['reservations'],
  hr: ['employees'],
  website: ['website'],
  marketing: ['campaigns'],
  crm: ['customers'],
  customers: ['customers'],
  accounting: ['accounts'],
  analytics: ['reports'],
};

export function dashboardEnabledFeatures(moduleIds: ModuleId[]): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const id of moduleIds) {
    const features = DASHBOARD_FEATURE_MAP[id];
    if (!features) continue;
    const key = id === 'customers' ? 'crm' : id;
    out[key] = Array.from(new Set([...(out[key] || []), ...features]));
  }
  return out;
}
