'use client';

import { Suspense, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  CheckCircle2, 
  AlertTriangle, 
  ChevronLeft, 
  Store, 
  ChevronRight,
  Info
} from 'lucide-react';
import { useLocale } from '@/i18n/LocaleProvider';
import { useT } from '@/i18n/useT';

type ActivityId = 
  | 'restaurant'
  | 'grocery'
  | 'fashion'
  | 'homeTextiles'
  | 'furniture'
  | 'electronics'
  | 'health'
  | 'homeGoods'
  | 'realEstate'
  | 'carShowroom'
  | 'other';

interface ActivityDef {
  id: ActivityId;
  category: string;
}

const ACTIVITIES: ActivityDef[] = [
  { id: 'restaurant', category: 'RESTAURANT' },
  { id: 'grocery', category: 'FOOD' },
  { id: 'fashion', category: 'FASHION' },
  { id: 'homeTextiles', category: 'RETAIL' },
  { id: 'furniture', category: 'SERVICE' },
  { id: 'electronics', category: 'ELECTRONICS' },
  { id: 'health', category: 'HEALTH' },
  { id: 'homeGoods', category: 'RETAIL' },
  { id: 'realEstate', category: 'SERVICE' },
  { id: 'carShowroom', category: 'RETAIL' },
  { id: 'other', category: 'OTHER' },
];

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

interface ModuleDef {
  id: ModuleId;
}

const CORE_MODULES: ModuleDef[] = [
  { id: 'overview' },
  { id: 'products' },
  { id: 'promotions' },
  { id: 'builder' },
  { id: 'settings' },
];

const OPTIONAL_MODULES: ModuleDef[] = [
  { id: 'gallery' },
  { id: 'reservations' },
  { id: 'invoice' },
  { id: 'pos' },
  { id: 'sales' },
  { id: 'customers' },
  { id: 'reports' },
];

const STORAGE_KEY = 'ray_merchant_onboarding';

function OnboardingPageInner() {
  const t = useT();
  const router = useRouter();
  const params = useSearchParams();
  const { locale, dir } = useLocale();

  const [step, setStep] = useState<'activity' | 'modules'>('activity');
  const [activityId, setActivityId] = useState<ActivityId | ''>('');
  const [enabledModules, setEnabledModules] = useState<Set<ModuleId>>(
    new Set(CORE_MODULES.map((m) => m.id))
  );
  const [previewActiveTab, setPreviewActiveTab] = useState<ModuleId>('overview');
  const [error, setError] = useState('');

  const selectedActivity = useMemo(
    () => ACTIVITIES.find((a) => a.id === activityId) || null,
    [activityId]
  );

  const previewModules = useMemo(() => {
    const list: ModuleDef[] = [...CORE_MODULES];
    for (const m of OPTIONAL_MODULES) {
      if (enabledModules.has(m.id)) list.push(m);
    }
    return list;
  }, [enabledModules]);

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
        setError(t('business.onboarding.enableCustomersReportsError', "You can't enable customers or reports before enabling orders/sales."));
        return prev;
      }

      next.add(id);
      return next;
    });
  };

  const handleNext = () => {
    setError('');
    if (step === 'activity') {
      if (!activityId) {
        setError(t('business.onboarding.chooseActivityFirst', "Choose your activity first"));
        return;
      }
      setStep('modules');
      return;
    }

    // Prepare payload for signup
    const payload = {
      activityId,
      category: selectedActivity?.category,
      enabledModules: Array.from(enabledModules),
      ts: Date.now(),
    };

    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.error('Failed to save onboarding data', e);
    }

    const returnTo = params.get('returnTo') || '';
    const q = new URLSearchParams();
    q.set('role', 'merchant');
    q.set('category', selectedActivity?.category || 'OTHER');
    if (returnTo) q.set('returnTo', returnTo);

    router.push(`/${locale}/signup?${q.toString()}`);
  };

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-16 min-h-screen" dir={dir}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl mx-auto bg-white border border-slate-100 rounded-[3rem] p-8 md:p-12 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div className={dir === 'rtl' ? 'text-right' : 'text-left'}>
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-slate-900">
              {t('business.onboarding.startProject', 'Start your project')}
            </h1>
            <p className="text-slate-400 font-bold text-sm md:text-lg mt-3">
              {step === 'activity' 
                ? t('business.onboarding.stepActivityHint', 'Choose your activity first — then pick the buttons.') 
                : t('business.onboarding.stepModulesHint', 'Select optional buttons — and preview on the left.')}
            </p>
          </div>
          {step === 'modules' && (
            <button
              onClick={() => setStep('activity')}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-all"
            >
              {dir === 'rtl' ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
            </button>
          )}
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-red-50 border-r-4 border-red-500 p-4 mb-8 flex items-center gap-3 text-red-600 font-bold text-sm"
          >
            <AlertTriangle size={20} />
            <p>{error}</p>
          </motion.div>
        )}

        {/* Step 1: Activity Selection */}
        {step === 'activity' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ACTIVITIES.map((a) => {
              const active = a.id === activityId;
              const label = t('business.onboarding.activities.' + a.id, a.id);
              return (
                <button
                  key={a.id}
                  onClick={() => { setActivityId(a.id); setError(''); }}
                  className={`relative p-8 rounded-[2.5rem] border-2 transition-all text-right group ${
                    active 
                      ? 'border-[#00E5FF] bg-[#00E5FF]/5 shadow-xl shadow-cyan-500/10' 
                      : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-lg'
                  }`}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl transition-colors ${
                      active ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'
                    }`}>
                      {label.charAt(0)}
                    </div>
                    {active && <CheckCircle2 className="text-[#00E5FF] w-8 h-8" />}
                  </div>
                  <div className="font-black text-xl text-slate-900 leading-tight">
                    {label}
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          /* Step 2: Module Selection & Preview */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Preview */}
            <div className="lg:col-span-8 order-2 lg:order-1">
              <div className="bg-slate-900 rounded-[3rem] overflow-hidden shadow-2xl border border-slate-800">
                {/* Preview Header */}
                <div className="h-20 border-b border-white/10 flex items-center justify-between px-8 bg-slate-900/50 backdrop-blur-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#00E5FF] flex items-center justify-center">
                      <Store size={20} className="text-slate-900" />
                    </div>
                    <span className="font-black text-white tracking-tight">
                      {t('business.onboarding.previewMerchantDashboard', 'Merchant Dashboard Preview')}
                    </span>
                  </div>
                  <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-black text-slate-400">
                    {t('business.onboarding.activities.' + activityId)}
                  </div>
                </div>

                <div className="flex h-[500px]">
                  {/* Sidebar Preview */}
                  <div className="w-1/3 border-r border-white/5 bg-slate-900/30 p-4 space-y-2 overflow-y-auto">
                    {previewModules.map((m) => {
                      const active = m.id === previewActiveTab;
                      return (
                        <button
                          key={m.id}
                          onClick={() => setPreviewActiveTab(m.id)}
                          className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all border ${
                            active 
                              ? 'bg-white/10 border-[#00E5FF]/50 text-white' 
                              : 'border-transparent text-slate-500 hover:bg-white/5'
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full ${active ? 'bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]' : 'bg-slate-700'}`} />
                          <span className="font-black text-xs uppercase tracking-wider">
                            {t('business.onboarding.modules.' + m.id, m.id)}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Content Preview */}
                  <div className="flex-1 p-8 bg-slate-50/5 relative overflow-hidden">
                    <div className={dir === 'rtl' ? 'text-right' : 'text-left'}>
                      <h3 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">
                        {t('business.onboarding.modules.' + previewActiveTab)}
                      </h3>
                      <p className="text-slate-500 font-bold text-sm max-w-sm">
                        {t('business.onboarding.previewHint', 'This is a preview — the real content will be filled after you complete signup.')}
                      </p>
                    </div>
                    
                    {/* Skeleton Content */}
                    <div className="mt-8 grid grid-cols-2 gap-4 opacity-20">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-32 rounded-3xl bg-white/10 border border-white/10 shadow-inner" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Controls */}
            <div className="lg:col-span-4 order-1 lg:order-2 space-y-4">
              <div className="bg-slate-50 rounded-[2.5rem] p-6 border border-slate-100">
                <h4 className="font-black text-slate-900 text-lg mb-1 flex items-center gap-2">
                  <Info size={18} className="text-[#BD00FF]" />
                  {t('business.onboarding.optionalButtonsTitle', 'Optional buttons')}
                </h4>
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-6">
                  {t('business.onboarding.optionalButtonsSubtitle', 'Core buttons are enabled by default. Enable what you need.')}
                </p>

                <div className="space-y-3">
                  {OPTIONAL_MODULES.map((m) => {
                    const checked = enabledModules.has(m.id);
                    const disabled = (m.id === 'customers' || m.id === 'reports') && !enabledModules.has('sales');
                    return (
                      <button
                        key={m.id}
                        onClick={() => !disabled && toggleOptional(m.id)}
                        className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl border-2 transition-all ${
                          checked 
                            ? 'border-[#00E5FF] bg-white shadow-md' 
                            : 'border-white bg-white/50 hover:bg-white text-slate-400'
                        } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                      >
                        <span className="font-black text-sm">{t('business.onboarding.modules.' + m.id)}</span>
                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${
                          checked ? 'bg-[#00E5FF] border-[#00E5FF]' : 'border-slate-200'
                        }`}>
                          {checked && <CheckCircle2 className="text-white w-4 h-4" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-12 pt-8 border-t border-slate-50 flex justify-center">
          <button
            onClick={handleNext}
            className="group relative w-full max-w-md py-6 rounded-[2rem] bg-slate-900 text-white font-black text-xl hover:bg-black transition-all shadow-2xl flex items-center justify-center gap-4 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <span>
              {step === 'activity' 
                ? t('business.onboarding.next', 'Next') 
                : t('business.onboarding.continueToSignup', 'Continue to Signup')}
            </span>
            {dir === 'rtl' ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
          </button>
        </div>

        {/* Info Section */}
        <div className="mt-16 pt-12 border-t border-slate-50">
          <div className="text-center mb-10">
            <h4 className="text-2xl font-black text-slate-900">{t('business.onboarding.buttonsGuideTitle', 'Buttons guide')}</h4>
            <p className="text-slate-400 font-bold text-sm mt-2">{t('business.onboarding.buttonsGuideSubtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...CORE_MODULES, ...OPTIONAL_MODULES].map((m) => (
              <div key={m.id} className="p-6 rounded-3xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
                <div className="font-black text-slate-900 uppercase tracking-widest text-xs mb-3 text-[#BD00FF]">
                  {t('business.onboarding.modules.' + m.id)}
                </div>
                <p className="text-slate-600 font-bold text-sm leading-relaxed">
                  {t('business.onboarding.moduleExplanations.' + m.id)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense>
      <OnboardingPageInner />
    </Suspense>
  );
}
