import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as ReactRouterDOM from 'react-router-dom';
import { CheckCircle2, AlertTriangle, ChevronLeft } from 'lucide-react';
import { Category } from '@/types';

const { useNavigate, useLocation } = ReactRouterDOM as any;
const MotionDiv = motion.div as any;

type ActivityDef = {
  id: string;
  label: string;
  category: Category;
};

type ModuleId =
  | 'overview'
  | 'products'
  | 'reservations'
  | 'invoice'
  | 'sales'
  | 'pos'
  | 'promotions'
  | 'reports'
  | 'customers'
  | 'gallery'
  | 'builder'
  | 'settings';

type ModuleDef = {
  id: ModuleId;
  label: string;
};

const MODULE_EXPLANATIONS: Record<ModuleId, string> = {
  overview: 'ملخص سريع لأهم الأرقام والحالة العامة للمحل (نظرة واحدة على كل شيء).',
  products: 'إضافة وتعديل المنتجات والأسعار والمخزون والصور.',
  reservations:
    'حجز المنتج لمدة 24 ساعة: المشتري بيحجز المنتج أونلاين ويستلمه/يشتريه من المحل خلال 24 ساعة (مش دفع ولا توصيل).',
  invoice:
    'فاتورة حسابات (مش POS): تعمل فاتورة مرنة لما السعر يتغير/في فِصال — تضيف أصناف وتحدد خصم وتطلع إجمالي + طباعة/نسخة إلكترونية بنفس ثيم الفاتورة.',
  sales: 'إدارة الطلبات والمدفوعات والمبيعات والشحن/التوصيل (لو موجود).',
  pos: 'الكاشير (POS): نقطة بيع لإدارة عمليات البيع داخل المحل.',
  promotions: 'إنشاء عروض وكوبونات وخصومات لزيادة المبيعات.',
  reports: 'تقارير وتحليلات عن المبيعات والمنتجات والأداء.',
  customers: 'إدارة العملاء وبياناتهم وسجل الشراء والتواصل معهم.',
  gallery: 'عرض صور للمنتجات/الأعمال داخل صفحة المحل (معرض).',
  builder: 'تخصيص شكل الصفحة/الواجهة: ترتيب الأقسام وإظهار/إخفاء عناصر.',
  settings: 'إعدادات الحساب والمحل ووسائل الدفع/التوصيل والتنبيهات.',
};

const CORE_MODULES: ModuleDef[] = [
  { id: 'overview', label: 'نظرة عامة' },
  { id: 'products', label: 'المنتجات' },
  { id: 'promotions', label: 'العروض' },
  { id: 'builder', label: 'التصميم' },
  { id: 'settings', label: 'الإعدادات' },
];

const OPTIONAL_MODULES: ModuleDef[] = [
  { id: 'gallery', label: 'معرض الصور' },
  { id: 'reservations', label: 'الحجوزات' },
  { id: 'invoice', label: 'فاتورة' },
  { id: 'pos', label: 'الكاشير' },
  { id: 'sales', label: 'الطلبات / المبيعات' },
  { id: 'customers', label: 'العملاء' },
  { id: 'reports', label: 'التقارير' },
];

type Step = 'activity' | 'modules';

const ACTIVITIES: ActivityDef[] = [
  {
    id: 'restaurant',
    label: 'مطعم',
    category: Category.RESTAURANT,
  },
  {
    id: 'grocery',
    label: 'سوبر ماركت / بقالة / عطارة',
    category: Category.FOOD,
  },
  {
    id: 'fashion',
    label: 'ملابس / أحذية',
    category: Category.FASHION,
  },
  {
    id: 'home-textiles',
    label: 'المفروشات والسجاد',
    category: Category.RETAIL,
  },
  {
    id: 'furniture',
    label: 'أثاث / معارض',
    category: Category.SERVICE,
  },
  {
    id: 'electronics',
    label: 'إلكترونيات',
    category: Category.ELECTRONICS,
  },
  {
    id: 'health',
    label: 'صيدلية / مستحضرات',
    category: Category.HEALTH,
  },
  {
    id: 'service',
    label: 'خدمات / ورش / صيانة',
    category: Category.SERVICE,
  },
];

const STORAGE_KEY = 'ray_merchant_onboarding';

const MerchantOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [step, setStep] = useState<Step>('activity');
  const [activityId, setActivityId] = useState<string>('');
  const [enabledModules, setEnabledModules] = useState<Set<ModuleId>>(
    new Set(CORE_MODULES.map((m) => m.id)),
  );
  const [previewActiveTab, setPreviewActiveTab] = useState<ModuleId>('overview');
  const [error, setError] = useState('');

  const selectedActivity = useMemo(
    () => ACTIVITIES.find((a) => a.id === activityId) || null,
    [activityId],
  );

  const applyActivity = (a: ActivityDef) => {
    setActivityId(a.id);
  };

  const previewModules = useMemo(() => {
    const list: ModuleDef[] = [];
    for (const m of CORE_MODULES) list.push(m);
    for (const m of OPTIONAL_MODULES) {
      if (enabledModules.has(m.id)) list.push(m);
    }
    return list;
  }, [enabledModules]);

  const activePreviewLabel = useMemo(() => {
    const all = [...CORE_MODULES, ...OPTIONAL_MODULES];
    return all.find((m) => m.id === previewActiveTab)?.label || '';
  }, [previewActiveTab]);

  const ensureValidActiveTab = (modules: ModuleDef[]) => {
    if (modules.some((m) => m.id === previewActiveTab)) return;
    const next = modules[0]?.id;
    if (next) setPreviewActiveTab(next);
  };

  const toggleOptional = (id: ModuleId) => {
    setError('');

    if (CORE_MODULES.some((m) => m.id === id)) return;

    setEnabledModules((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        if (id === 'sales') {
          next.delete('customers');
          next.delete('reports');
        }
        return next;
      }

      if ((id === 'customers' || id === 'reports') && !next.has('sales')) {
        setError('لا يمكن تفعيل العملاء أو التقارير قبل تفعيل الطلبات / المبيعات.');
        return prev;
      }

      next.add(id);
      return next;
    });
  };

  const goNext = () => {
    setError('');

    if (step === 'activity') {
      if (!selectedActivity) {
        setError('اختر نشاطك أولاً');
        return;
      }
      setStep('modules');
      return;
    }

    if (!selectedActivity) {
      setError('اختر نشاطك أولاً');
      setStep('activity');
      return;
    }

    const payload = {
      activityId: selectedActivity.id,
      category: selectedActivity.category,
      enabledModules: Array.from(enabledModules),
      ts: Date.now(),
    };

    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
    }

    const q = new URLSearchParams(String(location?.search || ''));
    const returnTo = q.get('returnTo');
    const followShopId = q.get('followShopId');

    const qs = new URLSearchParams();
    qs.set('role', 'merchant');
    qs.set('category', String(selectedActivity.category));
    if (returnTo) qs.set('returnTo', returnTo);
    if (followShopId) qs.set('followShopId', followShopId);

    navigate(`/signup?${qs.toString()}`);
  };

  const goBack = () => {
    setError('');
    if (step === 'modules') {
      setStep('activity');
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-16" dir="rtl">
      <MotionDiv
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl mx-auto bg-white border border-slate-100 rounded-[3rem] p-8 md:p-12 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)]"
      >
        <div className="flex items-center justify-between mb-8">
          <div className="text-right">
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter">ابدأ مشروعك</h1>
            <p className="text-slate-900 font-black text-sm mt-2">
              {step === 'activity' ? 'اختر نشاطك أولاً — ثم اختر الأزرار.' : 'اختار الأزرار الإضافية — وشوف المعاينة على الشمال.'}
            </p>
          </div>
          <div>
            {step === 'modules' ? (
              <button
                type="button"
                onClick={goBack}
                className="px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 font-black text-sm flex items-center gap-2"
              >
                <ChevronLeft size={18} />
                رجوع
              </button>
            ) : (
              <div />
            )}
          </div>
        </div>

        <AnimatePresence>
          {error ? (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-amber-50 border-r-4 border-amber-500 p-4 mb-6 flex items-center gap-3 flex-row-reverse text-slate-900 font-black text-sm"
            >
              <AlertTriangle size={18} /> {error}
            </motion.div>
          ) : null}
        </AnimatePresence>

        {step === 'activity' ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {ACTIVITIES.map((a) => {
                const active = a.id === activityId;
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => applyActivity(a)}
                    className={`text-right p-5 rounded-[2rem] border transition-all hover:shadow-lg ${active ? 'border-[#00E5FF] bg-[#00E5FF]/5' : 'border-slate-100 bg-white'}`}
                  >
                    <div className="flex items-center justify-between gap-4 flex-row-reverse">
                      <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black">
                        {a.label.slice(0, 1)}
                      </div>
                      {active ? <CheckCircle2 className="text-[#00E5FF]" /> : null}
                    </div>
                    <div className="mt-4 font-black text-lg text-slate-900">{a.label}</div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {step === 'modules' ? (
          <div className="grid grid-cols-12 gap-6 min-h-[70vh]">
            <div className="col-span-12 lg:col-span-8">
              <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden h-full">
                <div className="h-16 bg-slate-900 text-white flex items-center justify-between px-6">
                  <div className="font-black tracking-tight">معاينة لوحة التاجر</div>
                  <div className="text-xs font-black text-slate-200">
                    {selectedActivity?.label || ''}
                  </div>
                </div>

                <div className="grid grid-cols-12 h-[calc(70vh-4rem)]">
                  <div className="col-span-5 md:col-span-4 bg-slate-50 border-l border-slate-100 p-4 overflow-auto">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                      القائمة
                    </div>
                    <div className="space-y-2">
                      {(() => {
                        ensureValidActiveTab(previewModules);
                        return previewModules.map((m) => {
                          const active = m.id === previewActiveTab;
                          return (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => setPreviewActiveTab(m.id)}
                              className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border transition-all ${active ? 'bg-white border-[#00E5FF]' : 'bg-white/70 border-slate-100 hover:bg-white'}`}
                            >
                              <span className="font-black text-slate-900 text-sm">{m.label}</span>
                              <span className={`w-2.5 h-2.5 rounded-full ${active ? 'bg-[#00E5FF]' : 'bg-slate-300'}`} />
                            </button>
                          );
                        });
                      })()}
                    </div>
                  </div>

                  <div className="col-span-7 md:col-span-8 bg-white p-6 overflow-auto">
                    <div className="text-right">
                      <div className="text-2xl font-black text-slate-900">{activePreviewLabel}</div>
                      <div className="mt-2 text-sm font-black text-slate-500">
                        دي معاينة للشكل — المحتوى الحقيقي هيتملأ بعد ما تكمل التسجيل.
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="h-28 rounded-2xl bg-slate-50 border border-slate-100" />
                      <div className="h-28 rounded-2xl bg-slate-50 border border-slate-100" />
                      <div className="h-28 rounded-2xl bg-slate-50 border border-slate-100" />
                      <div className="h-28 rounded-2xl bg-slate-50 border border-slate-100" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-4">
              <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 h-full">
                <div className="font-black text-lg text-slate-900 mb-2">الأزرار الإضافية</div>
                <div className="text-xs font-black text-slate-500 mb-5">
                  الأزرار الأساسية موجودة تلقائيًا. فعّل الإضافي اللي تحتاجه.
                </div>

                <div className="space-y-3">
                  {OPTIONAL_MODULES.map((m) => {
                    const checked = enabledModules.has(m.id);
                    const disabled =
                      (m.id === 'customers' || m.id === 'reports') && !enabledModules.has('sales');

                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => (disabled ? null : toggleOptional(m.id))}
                        className={`w-full flex items-center justify-between gap-4 px-5 py-4 rounded-2xl border transition-all ${checked ? 'border-[#00E5FF] bg-[#00E5FF]/5' : 'border-slate-100 bg-slate-50'} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
                      >
                        <span className="font-black text-slate-900">{m.label}</span>
                        <span className={`w-6 h-6 rounded-lg border ${checked ? 'bg-[#00E5FF] border-[#00E5FF]' : 'bg-white border-slate-200'}`} />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <div className="mt-10 flex flex-col md:flex-row gap-3">
          <button
            type="button"
            onClick={goNext}
            className="flex-1 py-4 rounded-2xl bg-slate-900 text-white font-black hover:bg-black transition-all"
          >
            {step === 'activity' ? 'التالي' : 'متابعة للتسجيل'}
          </button>
        </div>

        <div className="mt-10 bg-slate-50 border border-slate-100 rounded-[2.5rem] p-6">
          <div className="font-black text-lg text-slate-900 mb-2">شرح الأزرار</div>
          <div className="text-xs font-black text-slate-500 mb-5">
            الهدف إن كل زر يكون معناه واضح من دلوقتي — خصوصًا الفرق بين الحجوزات والطلبات/المبيعات.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...CORE_MODULES, ...OPTIONAL_MODULES].map((m) => (
              <div key={m.id} className="bg-white border border-slate-100 rounded-2xl p-4">
                <div className="font-black text-slate-900">{m.label}</div>
                <div className="mt-2 text-sm font-black text-slate-600 leading-relaxed">
                  {MODULE_EXPLANATIONS[m.id]}
                </div>
              </div>
            ))}
          </div>
        </div>
      </MotionDiv>
    </div>
  );
};

export default MerchantOnboarding;
