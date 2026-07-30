import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as ReactRouterDOM from 'react-router-dom';
import {
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  Search,
  Home,
  ArrowRight,
  MapPin,
  Sparkles,
  LayoutDashboard,
  Package,
  Calendar,
  CreditCard,
  BarChart3,
  Users,
  Settings,
  Image as ImageIcon,
  Receipt,
  ShoppingCart,
  Monitor,
  Wrench,
  Tag,
  LucideIcon,
  Plus,
  X,
  User,
  Store,
  Mail,
  Lock,
  Phone,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  LayoutGrid,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ApiService } from '@/services/api.service';
import { Category } from '@/types';
import { clearSession, persistMerchantContext, persistSession, syncMerchantContextFromBackend } from '@/services/authStorage';
import { normalizeSafeReturnTo, resolvePostAuthDestination } from '@/services/authRedirect';
import { BOOKING_ACTIVITY_DEFINITIONS, BookingActivityType, getBookingActivityDefinition } from './bookings/config';
import { BUSINESS_ACTIVITIES, BusinessActivityWithGroup, getBusinessActivityThemePatch, getActivityPageRoute } from '@/utils/businessActivityCatalog';

const { useNavigate, useLocation } = ReactRouterDOM as any;
const MotionDiv = motion.div as any;

type ActivityDef = BusinessActivityWithGroup;

type ModuleId = string;

type ModuleDef = {
  id: ModuleId;
  label: string;
  fixed?: boolean;
};

const CORE_MODULES: ModuleDef[] = [
  { id: 'overview', label: '' },
  { id: 'apps', label: '' },
  { id: 'settings', label: '' },
];

const BOOKING_GENERAL_MODULES: ModuleDef[] = [
  { id: 'overview', label: 'نظرة عامة الحجوزات', fixed: true },
  { id: 'apps', label: 'التطبيقات', fixed: true },
  { id: 'settings', label: 'إعدادات الحجوزات', fixed: true },
];

const OPTIONAL_MODULES: ModuleDef[] = [
  { id: 'products', label: '' },
  { id: 'promotions', label: '' },
  { id: 'builder', label: '' },
  { id: 'gallery', label: '' },
  { id: 'reservations', label: '' },
  { id: 'invoice', label: '' },
  { id: 'pos', label: '' },
  { id: 'sales', label: '' },
  { id: 'customers', label: '' },
  { id: 'reports', label: '' },
];

type Step = 'activity' | 'specialty' | 'modules' | 'data';

const ACTIVITIES: ActivityDef[] = BUSINESS_ACTIVITIES;
const STORAGE_KEY = 'ray_merchant_onboarding';

const moduleIcons: Record<string, LucideIcon> = {
  overview: LayoutDashboard,
  apps: LayoutGrid,
  products: Package,
  promotions: Tag,
  builder: Monitor,
  settings: Settings,
  gallery: ImageIcon,
  reservations: Calendar,
  invoice: Receipt,
  pos: ShoppingCart,
  sales: CreditCard,
  customers: Users,
  reports: BarChart3,
};

const groupAccentColors: Record<string, string> = {
  food_market: 'from-orange-600 to-amber-500',
  fashion_home: 'from-pink-600 to-rose-400',
  jewelry_luxury: 'from-yellow-600 to-amber-400',
  real_estate: 'from-emerald-600 to-teal-500',
  vehicles: 'from-red-600 to-orange-500',
  agriculture: 'from-green-600 to-lime-500',
  services: 'from-cyan-600 to-blue-500',
  electronics_health: 'from-blue-600 to-indigo-500',
  bookings: 'from-sky-600 to-cyan-500',
  other: 'from-slate-600 to-slate-400',
};

const MerchantOnboarding: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [step, setStep] = useState<Step>('activity');
  const [activityId, setActivityId] = useState<string>('');
  const [selectedSpecialties, setSelectedSpecialties] = useState<Set<string>>(new Set());
  const [customSpecialtyInput, setCustomSpecialtyInput] = useState('');
  const [enabledModules, setEnabledModules] = useState<Set<ModuleId>>(
    new Set(CORE_MODULES.map((m) => m.id)),
  );
  const [previewActiveTab, setPreviewActiveTab] = useState<ModuleId>('overview');
  const [selectedBookingActivityId, setSelectedBookingActivityId] = useState<BookingActivityType>('salon_barber');
  const [selectedBookingSpecialties, setSelectedBookingSpecialties] = useState<Set<string>>(new Set());
  const [enabledBookingButtons, setEnabledBookingButtons] = useState<Set<string>>(new Set());
  const [enabledActivityButtons, setEnabledActivityButtons] = useState<Set<string>>(new Set());
  const [error, setError] = useState('');
  const [activitySearch, setActivitySearch] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    shopName: '',
    governorate: '',
    city: '',
    shopPhone: '',
    openingHours: '',
    shopEmail: '',
    addressDetailed: '',
    shopDescription: '',
  });

  const shouldStoreBearerToken =
    String(((import.meta as any)?.env?.VITE_ENABLE_BEARER_TOKEN as any) || '').trim().toLowerCase() === 'true';

  const selectedActivity = useMemo(
    () => ACTIVITIES.find((a) => a.id === activityId) || null,
    [activityId],
  );

  const isBookingsActivity = selectedActivity?.id === 'bookings';

  const selectedBookingActivity = useMemo(
    () => getBookingActivityDefinition(selectedBookingActivityId),
    [selectedBookingActivityId],
  );

  const getActivityLabel = (activity: ActivityDef) => activity.title || t('business.onboarding.activities.' + activity.id);

  const groupedActivities = useMemo(() => {
    const raw = activitySearch.trim().toLowerCase();
    return BUSINESS_ACTIVITIES.reduce<Record<string, ActivityDef[]>>((acc, activity) => {
      const matchesSearch =
        !raw ||
        getActivityLabel(activity).toLowerCase().includes(raw) ||
        activity.description.toLowerCase().includes(raw) ||
        activity.groupTitle.toLowerCase().includes(raw);
      if (!matchesSearch) return acc;
      if (!acc[activity.groupId]) acc[activity.groupId] = [];
      acc[activity.groupId].push(activity);
      return acc;
    }, {});
  }, [activitySearch, t]);

  const groupIds = useMemo(() => Object.keys(groupedActivities), [groupedActivities]);

  const bookingPrivateModules = useMemo<ModuleDef[]>(() => {
    const activity = getBookingActivityDefinition(selectedBookingActivityId);
    return [activity.primaryTabLabel, activity.secondaryTabLabel, ...activity.extraButtons].map((label, index) => ({
      id: `booking:${activity.id}:${index}`,
      label,
    }));
  }, [selectedBookingActivityId]);

  const applyActivity = (a: ActivityDef) => {
    setActivityId(a.id);
    if (a.id === 'bookings') {
      setEnabledModules(new Set(BOOKING_GENERAL_MODULES.map((m) => m.id)));
    } else {
      setEnabledModules(new Set(CORE_MODULES.map((m) => m.id)));
    }
    setSelectedSpecialties(new Set());
    setCustomSpecialtyInput('');
    setPreviewActiveTab('overview');
    setEnabledBookingButtons(new Set());
    setEnabledActivityButtons(new Set());
    setSelectedBookingSpecialties(new Set());
    setError('');
  };

  const hasSpecialties = selectedActivity && selectedActivity.specialties.length > 0;
  const hasBookingSpecialties = isBookingsActivity && selectedBookingActivity.specialties.length > 0;

  const previewModules = useMemo(() => {
    if (isBookingsActivity) {
      return [
        ...BOOKING_GENERAL_MODULES,
        ...bookingPrivateModules.filter((m) => enabledBookingButtons.has(m.id)),
      ];
    }

    const activityPrivateModules = (selectedActivity?.privateButtons || [])
      .filter((button) => enabledActivityButtons.has(button.id))
      .map((button) => ({ id: `activity:${selectedActivity?.id}:${button.id}`, label: button.label }));

    const list: ModuleDef[] = [];
    for (const m of activityPrivateModules) list.push(m);
    for (const m of CORE_MODULES) list.push(m);
    for (const m of OPTIONAL_MODULES) {
      if (enabledModules.has(m.id)) list.push(m);
    }
    return list;
  }, [bookingPrivateModules, enabledActivityButtons, enabledBookingButtons, enabledModules, isBookingsActivity, selectedActivity]);

  const getModuleLabel = (m: ModuleDef | ModuleId) => {
    const id = typeof m === 'string' ? m : m.id;
    const explicit = typeof m === 'string' ? '' : m.label;
    if (explicit) return explicit;
    return t('business.onboarding.modules.' + id);
  };

  const activePreviewLabel = useMemo(() => {
    const found = previewModules.find((m) => m.id === previewActiveTab);
    return found ? getModuleLabel(found) : getModuleLabel(previewActiveTab);
  }, [previewActiveTab, previewModules, t]);

  const ensureValidActiveTab = (modules: ModuleDef[]) => {
    if (modules.some((m) => m.id === previewActiveTab)) return;
    const next = modules[0]?.id;
    if (next) setPreviewActiveTab(next);
  };

  const toggleBookingButton = (id: string) => {
    setEnabledBookingButtons((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        if (previewActiveTab === id) setPreviewActiveTab('overview');
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleActivityButton = (id: string) => {
    setEnabledActivityButtons((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        if (previewActiveTab === `activity:${selectedActivity?.id}:${id}`) setPreviewActiveTab('overview');
      } else {
        next.add(id);
      }
      return next;
    });
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
        setError(t('business.onboarding.enableCustomersReportsError'));
        return prev;
      }
      next.add(id);
      return next;
    });
  };

  const toggleSpecialty = (specialty: string) => {
    setSelectedSpecialties((prev) => {
      const next = new Set(prev);
      if (next.has(specialty)) next.delete(specialty);
      else next.add(specialty);
      return next;
    });
  };

  const toggleBookingSpecialty = (specialty: string) => {
    setSelectedBookingSpecialties((prev) => {
      const next = new Set(prev);
      if (next.has(specialty)) next.delete(specialty);
      else next.add(specialty);
      return next;
    });
  };

  const addCustomSpecialty = () => {
    const value = customSpecialtyInput.trim();
    if (!value) return;
    setSelectedSpecialties((prev) => new Set([...Array.from(prev), value]));
    setCustomSpecialtyInput('');
  };

  const removeCustomSpecialty = (value: string) => {
    setSelectedSpecialties((prev) => {
      const next = new Set(prev);
      next.delete(value);
      return next;
    });
  };

  const getOnboardingPayload = () => {
    if (!selectedActivity) return null;
    const allSpecialties = isBookingsActivity
      ? Array.from(selectedBookingSpecialties)
      : Array.from(selectedSpecialties);
    return {
      activityId: selectedActivity.id,
      category: selectedActivity.category,
      enabledModules: Array.from(enabledModules),
      pageDesign: {
        ...getBusinessActivityThemePatch(selectedActivity.id),
        businessActivityId: selectedActivity.id,
        businessActivityTitle: getActivityLabel(selectedActivity),
        businessActivityGroupId: selectedActivity.groupId,
        businessActivityGroupTitle: selectedActivity.groupTitle,
        specialties: allSpecialties,
        activityEnabledButtons: Array.from(enabledActivityButtons),
        activityPrivateButtonLabels: Object.fromEntries((selectedActivity.privateButtons || []).map((button) => [button.id, button.label])),
        ...(isBookingsActivity ? {
          bookingActivityType: selectedBookingActivityId,
          bookingEnabledButtons: Array.from(enabledBookingButtons),
          bookingSpecialties: Array.from(selectedBookingSpecialties),
          bookingDashboardScope: 'booking_only',
        } : {}),
      },
      ts: Date.now(),
    };
  };

  const submitSignup = async () => {
    if (!selectedActivity) {
      setError(t('business.onboarding.chooseActivityFirst'));
      setStep('activity');
      return;
    }

    if (!formData.name || !formData.email || !formData.password || !formData.phone || !formData.shopName) {
      setError(t('business.onboarding.fillRequiredFields'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const cfg = getOnboardingPayload();
      const q = new URLSearchParams(String(location?.search || ''));
      const returnTo = normalizeSafeReturnTo(q.get('returnTo'));
      const followShopId = q.get('followShopId');

      const payload: any = {
        ...formData,
        role: 'merchant',
        category: selectedActivity.category,
      };

      if (cfg) {
        const activityId = String(cfg.activityId || '').trim();
        if (activityId) payload.activityId = activityId;
        const enabledModules = Array.isArray(cfg.enabledModules)
          ? cfg.enabledModules.map((x: any) => String(x || '').trim()).filter(Boolean)
          : [];
        if (enabledModules.length > 0) payload.enabledModules = enabledModules;
        if (cfg.pageDesign && typeof cfg.pageDesign === 'object') payload.pageDesign = cfg.pageDesign;
      }

      const response = await ApiService.signup(payload);
      const isPending = Boolean((response as any)?.pending);
      if (isPending) {
        clearSession('signup-pending');
        navigate('/business/pending');
        return;
      }

      persistSession({
        user: (response as any).user,
        accessToken: (response as any).session?.access_token,
        persistBearer: shouldStoreBearerToken,
      }, 'signup');

      if (returnTo) {
        try {
          if (followShopId) {
            await ApiService.followShop(followShopId);
            window.dispatchEvent(new Event('ray-db-update'));
          }
        } catch {
          // ignore
        }
        navigate(returnTo);
        return;
      }

      const normalizedRole = String((response as any)?.user?.role || 'merchant').trim().toLowerCase();
      if (normalizedRole === 'merchant') {
        const responseShop = (response as any)?.shop;
        const responseShopStatus = String(responseShop?.status || '').trim().toLowerCase();
        if (responseShopStatus) {
          persistMerchantContext({
            shopId: responseShop?.id ? String(responseShop.id) : undefined,
            status: responseShopStatus,
          });
        } else {
          try {
            await syncMerchantContextFromBackend((response as any)?.user);
          } catch {
            const fallbackStatus = String(((response as any)?.user?.shop?.status) || '').trim().toLowerCase();
            if (fallbackStatus) {
              persistMerchantContext({
                shopId: (response as any)?.user?.shopId ? String((response as any)?.user?.shopId) : undefined,
                status: fallbackStatus,
              });
            }
          }
        }
      }

      const targetRoute = await resolvePostAuthDestination({
        role: normalizedRole,
        user: (response as any)?.user,
        returnTo,
        merchantStatus: (response as any)?.shop?.status,
      });

      if (normalizedRole === 'merchant' && !returnTo) {
        const activityRoute = getActivityPageRoute(selectedActivity.id);
        if (activityRoute) {
          navigate(activityRoute, { replace: true } as any);
          return;
        }
      }

      navigate(targetRoute, { replace: true } as any);
    } catch (err: any) {
      setError(err.message || t('auth.signup.signupFailed'));
    } finally {
      setLoading(false);
    }
  };

  const goNext = () => {
    setError('');

    if (step === 'activity') {
      if (!selectedActivity) {
        setError(t('business.onboarding.chooseActivityFirst'));
        return;
      }
      setStep(hasSpecialties || isBookingsActivity ? 'specialty' : 'modules');
      return;
    }

    if (step === 'specialty') {
      setStep('modules');
      return;
    }

    if (step === 'modules') {
      setStep('data');
      return;
    }

    if (step === 'data') {
      submitSignup();
      return;
    }
  };

  const goBack = () => {
    setError('');
    if (step === 'modules') setStep(hasSpecialties || isBookingsActivity ? 'specialty' : 'activity');
    else if (step === 'specialty') setStep('activity');
    else if (step === 'data') setStep('modules');
  };

  const goHome = () => navigate('/');

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  };

  const SpecialtyChip = ({
    label,
    checked,
    onClick,
  }: {
    label: string;
    checked: boolean;
    onClick: () => void;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2.5 rounded-xl text-xs font-black border transition-all ${
        checked
          ? 'bg-cyan-50 border-cyan-400 text-cyan-800'
          : 'bg-white border-slate-100 text-slate-600 hover:border-slate-200'
      }`}
    >
      <span className="flex items-center gap-2">
        {checked && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600" />}
        {label}
      </span>
    </button>
  );

  const selectedCount = isBookingsActivity
    ? enabledBookingButtons.size
    : enabledActivityButtons.size + Array.from(enabledModules).filter((id) => OPTIONAL_MODULES.some((m) => m.id === id)).length;

  const Stepper = () => {
    const steps = [
      { key: 'activity', label: t('business.onboarding.stepActivity'), num: 1 },
      { key: 'specialty', label: t('business.onboarding.stepSpecialty', 'التخصص'), num: 2 },
      { key: 'modules', label: t('business.onboarding.stepModules'), num: 3 },
      { key: 'data', label: t('business.onboarding.stepData', 'البيانات'), num: 4 },
    ];
    const activeNum = step === 'activity' ? 1 : step === 'specialty' ? 2 : step === 'modules' ? 3 : 4;
    return (
      <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
        {steps.map((s, idx) => (
          <React.Fragment key={s.key}>
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-black transition-all ${
                s.num <= activeNum ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'
              }`}
            >
              <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs">{s.num}</span>
              {s.label}
            </div>
            {idx < steps.length - 1 && <div className="w-8 h-px bg-slate-200" />}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const ActivityCard = ({ activity }: { activity: ActivityDef }) => {
    const active = activity.id === activityId;
    const group = activity.groupId;
    const gradient = groupAccentColors[group] || groupAccentColors.other;
    const isPopular = ['restaurant', 'grocery', 'fashion', 'carShowroom', 'realEstate', 'bookings'].includes(activity.id);
    return (
      <button
        key={activity.id}
        type="button"
        onClick={() => applyActivity(activity)}
        className={`relative text-right p-5 rounded-[2rem] border transition-all hover:shadow-xl ${
          active ? 'border-cyan-400 bg-cyan-50/40 shadow-cyan-100/50 shadow-lg' : 'border-slate-100 bg-white hover:border-slate-200'
        }`}
      >
        {active && (
          <span className="absolute top-4 left-4">
            <CheckCircle2 className="w-5 h-5 text-cyan-600" />
          </span>
        )}
        {isPopular && !active && (
          <span className="absolute top-4 left-4 px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-black flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            {t('business.onboarding.popular')}
          </span>
        )}
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} text-white flex items-center justify-center text-lg font-black shadow-md`}>
            {getActivityLabel(activity).charAt(0)}
          </div>
          <div className="text-[11px] font-black text-slate-400">{activity.groupTitle}</div>
        </div>
        <div className="font-black text-lg text-slate-900 mb-1">{getActivityLabel(activity)}</div>
        <p className="text-xs font-bold text-slate-500 leading-5 line-clamp-2">{activity.description}</p>
      </button>
    );
  };

  const renderActivityStep = () => (
    <div className="space-y-8">
      <div className="relative max-w-md mx-auto">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={activitySearch}
          onChange={(e) => setActivitySearch(e.target.value)}
          placeholder={t('business.onboarding.searchActivities')}
          className="w-full pr-12 pl-4 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 font-bold outline-none focus:border-cyan-300 transition-colors text-sm"
        />
      </div>

      {!activitySearch && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-black text-slate-900">{t('business.onboarding.recommended')}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {['restaurant', 'grocery', 'fashion', 'carShowroom', 'realEstate', 'bookings'].map((id) => {
              const activity = ACTIVITIES.find((a) => a.id === id);
              if (!activity) return null;
              return <ActivityCard key={activity.id} activity={activity} />;
            })}
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-black text-slate-900">{t('business.onboarding.allActivities')}</span>
        </div>

        {groupIds.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-slate-400 font-bold">{t('business.onboarding.noMatchingActivities')}</p>
          </div>
        ) : (
          groupIds.map((groupId) => {
            const activities = groupedActivities[groupId];
            const expanded = expandedGroups.has(groupId) || activitySearch.length > 0;
            const groupTitle = activities[0]?.groupTitle || groupId;
            const visible = expanded ? activities : activities.slice(0, 3);
            return (
              <div key={groupId} className="rounded-[2rem] border border-slate-100 p-5 md:p-6 bg-slate-50/40">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${groupAccentColors[groupId] || groupAccentColors.other} text-white flex items-center justify-center text-sm font-black`}>
                      {groupTitle.charAt(0)}
                    </div>
                    <span className="font-black text-slate-900">{groupTitle}</span>
                    <span className="text-xs font-black text-slate-400">({activities.length})</span>
                  </div>
                  {!activitySearch && activities.length > 3 && (
                    <button
                      type="button"
                      onClick={() => toggleGroup(groupId)}
                      className="text-xs font-black text-cyan-700 hover:text-cyan-800 transition-colors"
                    >
                      {expanded ? t('business.onboarding.showLess') : t('business.onboarding.showMore')}
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {visible.map((activity) => (
                    <ActivityCard key={activity.id} activity={activity} />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  const renderSpecialtyStep = () => {
    if (!selectedActivity) return null;

    if (isBookingsActivity) {
      return (
        <div className="space-y-8">
          <div className="rounded-[2.5rem] border border-cyan-100 bg-cyan-50/40 p-6">
            <div className="flex items-start justify-between gap-3 flex-wrap mb-5">
              <div className="text-right">
                <div className="font-black text-slate-900 text-lg">{t('business.onboarding.summaryBookingType')}</div>
                <p className="mt-1 text-xs font-bold text-slate-500">{t('business.onboarding.configureModulesHint')}</p>
              </div>
              <div className="px-4 py-2 rounded-2xl bg-white border border-cyan-100 text-cyan-800 text-xs font-black">
                {selectedBookingActivity.title}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {BOOKING_ACTIVITY_DEFINITIONS.map((activity) => {
                const active = activity.id === selectedBookingActivityId;
                return (
                  <button
                    key={activity.id}
                    type="button"
                    onClick={() => {
                      setSelectedBookingActivityId(activity.id);
                      setEnabledBookingButtons(new Set());
                      setSelectedBookingSpecialties(new Set());
                      setPreviewActiveTab('overview');
                    }}
                    className={`text-right p-4 rounded-2xl border transition-all ${active ? 'border-cyan-400 bg-white shadow-sm' : 'border-slate-100 bg-white/70 hover:bg-white'}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-black text-sm text-slate-900">{activity.title}</span>
                      {active ? <CheckCircle2 size={18} className="text-cyan-600" /> : null}
                    </div>
                    <p className="mt-2 text-[11px] font-bold text-slate-500 leading-5">{activity.description}</p>
                  </button>
                );
              })}
            </div>

            {selectedBookingActivity.specialties.length > 0 && (
              <div className="mt-6">
                <div className="font-black text-slate-900 text-base mb-3">
                  {t('business.onboarding.specialtiesTitle', 'التخصصات / الأنواق داخل النشاط')}
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedBookingActivity.specialties.map((specialty) => (
                    <SpecialtyChip
                      key={specialty}
                      label={specialty}
                      checked={selectedBookingSpecialties.has(specialty)}
                      onClick={() => toggleBookingSpecialty(specialty)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="rounded-[2.5rem] border border-slate-100 bg-slate-50/40 p-6">
            <div className="font-black text-slate-900 text-base mb-3">{t('business.onboarding.customSpecialtyTitle', 'تخصص غير موجود؟ اكتبه')}</div>
            <div className="flex gap-2 max-w-md mx-auto flex-row-reverse">
              <input
                type="text"
                value={customSpecialtyInput}
                onChange={(e) => setCustomSpecialtyInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addCustomSpecialty();
                }}
                placeholder={t('business.onboarding.customSpecialtyPlaceholder', 'مثال: عيادة جلدية أطفال')}
                className="flex-1 px-4 py-3 rounded-2xl bg-white border border-slate-100 text-slate-900 font-bold outline-none focus:border-cyan-300 text-sm"
              />
              <button
                type="button"
                onClick={addCustomSpecialty}
                className="px-4 py-3 rounded-2xl bg-slate-900 text-white hover:bg-black transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {Array.from(selectedSpecialties)
                .filter((s) => !selectedBookingActivity.specialties.includes(s))
                .map((specialty) => (
                  <span
                    key={specialty}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-black"
                  >
                    {specialty}
                    <button type="button" onClick={() => removeCustomSpecialty(specialty)}>
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        <div className="text-center">
          <div className="text-2xl md:text-3xl font-black text-slate-900 mb-2">
            {t('business.onboarding.specialtyTitle', 'اختار تخصص {{activity}}', { activity: selectedActivity.title })}
          </div>
          <p className="text-slate-500 font-bold text-sm md:text-base">
            {t('business.onboarding.specialtySubtitle', 'حدد التخصص الدقيق لنشاطك. لو مش موجود اكتبه عشان نضيفه.')}
          </p>
        </div>

        {selectedActivity.specialties.length > 0 && (
          <div className="rounded-[2.5rem] border border-slate-100 bg-slate-50/40 p-6">
            <div className="font-black text-slate-900 text-base mb-4">{t('business.onboarding.commonSpecialties', 'التخصصات الشائعة')}</div>
            <div className="flex flex-wrap gap-2">
              {selectedActivity.specialties.map((specialty) => (
                <SpecialtyChip
                  key={specialty}
                  label={specialty}
                  checked={selectedSpecialties.has(specialty)}
                  onClick={() => toggleSpecialty(specialty)}
                />
              ))}
            </div>
          </div>
        )}

        <div className="rounded-[2.5rem] border border-slate-100 bg-slate-50/40 p-6">
          <div className="font-black text-slate-900 text-base mb-3">{t('business.onboarding.customSpecialtyTitle', 'تخصص غير موجود؟ اكتبه')}</div>
          <div className="flex gap-2 max-w-md mx-auto flex-row-reverse">
            <input
              type="text"
              value={customSpecialtyInput}
              onChange={(e) => setCustomSpecialtyInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') addCustomSpecialty();
              }}
              placeholder={t('business.onboarding.customSpecialtyPlaceholder', 'مثال: مطعم سمك مشوي')}
              className="flex-1 px-4 py-3 rounded-2xl bg-white border border-slate-100 text-slate-900 font-bold outline-none focus:border-cyan-300 text-sm"
            />
            <button
              type="button"
              onClick={addCustomSpecialty}
              className="px-4 py-3 rounded-2xl bg-slate-900 text-white hover:bg-black transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {Array.from(selectedSpecialties)
              .filter((s) => !selectedActivity.specialties.includes(s))
              .map((specialty) => (
                <span
                  key={specialty}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-black"
                >
                  {specialty}
                  <button type="button" onClick={() => removeCustomSpecialty(specialty)}>
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
          </div>
        </div>
      </div>
    );
  };

  const renderModulesStep = () => {
    if (!selectedActivity) return null;
    return (
      <div className="grid grid-cols-12 gap-6 min-h-[70vh]">
        <div className="col-span-12 lg:col-span-7 xl:col-span-8 order-2 lg:order-1">
          <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden h-full shadow-sm">
            <div className="h-16 bg-slate-900 text-white flex items-center justify-between px-6">
              <div className="flex items-center gap-2 font-black tracking-tight">
                <LayoutDashboard className="w-4 h-4" />
                {t('business.onboarding.previewMerchantDashboard')}
              </div>
              <div className="text-xs font-black text-slate-300">{getActivityLabel(selectedActivity)}</div>
            </div>
            <div className="grid grid-cols-12 h-[calc(70vh-4rem)]">
              <div className="col-span-5 md:col-span-4 bg-slate-50 border-l border-slate-100 p-4 overflow-auto">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                  {t('business.onboarding.menu')}
                </div>
                <div className="space-y-2">
                  {(() => {
                    ensureValidActiveTab(previewModules);
                    return previewModules.map((m) => {
                      const active = m.id === previewActiveTab;
                      const Icon = moduleIcons[m.id.split(':')[0]] || Wrench;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setPreviewActiveTab(m.id)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all text-right ${active ? 'bg-white border-cyan-400' : 'bg-white/70 border-slate-100 hover:bg-white'}`}
                        >
                          <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-cyan-600' : 'text-slate-400'}`} />
                          <span className="font-black text-slate-900 text-sm truncate">{getModuleLabel(m)}</span>
                          <span className={`mr-auto w-2 h-2 rounded-full ${active ? 'bg-cyan-400' : 'bg-slate-300'}`} />
                        </button>
                      );
                    });
                  })()}
                </div>
              </div>

              <div className="col-span-7 md:col-span-8 bg-white p-6 overflow-auto">
                <div className="text-right">
                  <div className="text-2xl font-black text-slate-900">{activePreviewLabel}</div>
                  <div className="mt-2 text-sm font-black text-slate-500">{t('business.onboarding.previewHint')}</div>
                </div>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="h-28 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-100" />
                  <div className="h-28 rounded-2xl bg-gradient-to-br from-cyan-50 to-cyan-100 border border-cyan-100" />
                  <div className="h-28 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-100" />
                  <div className="h-28 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-100" />
                </div>
                <div className="mt-6 h-4 rounded-full bg-slate-100 w-3/4" />
                <div className="mt-3 h-4 rounded-full bg-slate-100 w-1/2" />
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-5 xl:col-span-4 order-1 lg:order-2">
          <div className="bg-slate-50 border border-slate-100 rounded-[2.5rem] p-6 h-full">
            <div className="flex items-center justify-between mb-2">
              <div className="font-black text-lg text-slate-900">{t('business.onboarding.configureModules')}</div>
              <span className="px-2.5 py-1 rounded-full bg-white border border-slate-100 text-xs font-black text-slate-500">
                {selectedCount} {t('business.onboarding.selected')}
              </span>
            </div>
            <p className="text-xs font-bold text-slate-500 mb-6">{t('business.onboarding.configureModulesHint')}</p>

            <div className="mb-6 rounded-2xl bg-cyan-50 border border-cyan-100 p-4 flex items-start gap-3">
              <LayoutGrid className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
              <p className="text-xs font-bold text-cyan-800 leading-relaxed">
                {t('business.onboarding.installLaterHint', 'يمكنك تركيب أي أزرار إضافية لاحقاً من قسم «التطبيقات» في لوحة التحكم في أي وقت. اختر ما تحتاجه الآن واكمل لاحقاً.')}
              </p>
            </div>

            {isBookingsActivity ? (
              <div className="space-y-6">
                <div className="rounded-3xl bg-white border border-slate-100 p-4">
                  <div className="text-[11px] font-black text-slate-400 mb-3">{t('business.onboarding.coreModules')}</div>
                  <div className="space-y-2">
                    {BOOKING_GENERAL_MODULES.map((m) => (
                      <div key={m.id} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border border-cyan-100 bg-white">
                        {(() => {
                          const Icon = moduleIcons[m.id] || Wrench;
                          return <Icon className="w-4 h-4 text-cyan-600" />;
                        })()}
                        <span className="font-black text-slate-900 text-sm">{getModuleLabel(m)}</span>
                        <span className="mr-auto px-2 py-0.5 rounded-md bg-cyan-50 text-cyan-700 text-[10px] font-black">{t('business.onboarding.fixed')}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-black text-slate-400 mb-3">{t('business.onboarding.bookingPrivateButtons')}</div>
                  <div className="space-y-3">
                    {bookingPrivateModules.map((m) => {
                      const checked = enabledBookingButtons.has(m.id);
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => toggleBookingButton(m.id)}
                          className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl border transition-all ${checked ? 'border-cyan-400 bg-cyan-50/40' : 'border-slate-100 bg-white'}`}
                        >
                          <span className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors ${checked ? 'bg-cyan-400 border-cyan-400' : 'bg-white border-slate-200'}`}>
                            {checked && <CheckCircle2 className="w-4 h-4 text-white" />}
                          </span>
                          <span className="font-black text-slate-900 text-sm text-right">{getModuleLabel(m)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="rounded-3xl bg-white border border-slate-100 p-4">
                  <div className="text-[11px] font-black text-slate-400 mb-3">{t('business.onboarding.coreModules')}</div>
                  <div className="text-[10px] font-black text-slate-300 mb-2">{t('business.onboarding.coreModulesHint')}</div>
                  <div className="space-y-2">
                    {CORE_MODULES.map((m) => {
                      const Icon = moduleIcons[m.id] || Wrench;
                      return (
                        <div key={m.id} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border border-cyan-100 bg-white">
                          <Icon className="w-4 h-4 text-cyan-600" />
                          <span className="font-black text-slate-900 text-sm">{getModuleLabel(m)}</span>
                          <span className="mr-auto px-2 py-0.5 rounded-md bg-cyan-50 text-cyan-700 text-[10px] font-black">{t('business.onboarding.fixed')}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-black text-slate-400 mb-3">{t('business.onboarding.optionalModules')}</div>
                  <div className="space-y-3">
                    {OPTIONAL_MODULES.map((m) => {
                      const checked = enabledModules.has(m.id);
                      const disabled = (m.id === 'customers' || m.id === 'reports') && !enabledModules.has('sales');
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => (disabled ? null : toggleOptional(m.id))}
                          className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl border transition-all text-right ${checked ? 'border-cyan-400 bg-cyan-50/40' : 'border-slate-100 bg-white'} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
                        >
                          <span className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors ${checked ? 'bg-cyan-400 border-cyan-400' : 'bg-white border-slate-200'}`}>
                            {checked && <CheckCircle2 className="w-4 h-4 text-white" />}
                          </span>
                          <div className="flex-1">
                            <div className="font-black text-slate-900 text-sm flex items-center gap-2">
                              {(() => {
                                const Icon = moduleIcons[m.id] || Wrench;
                                return <Icon className="w-4 h-4 text-slate-400" />;
                              })()}
                              {getModuleLabel(m)}
                            </div>
                            {disabled && (
                              <div className="text-[10px] font-black text-amber-500 mt-1">
                                {t('business.onboarding.requires', { module: t('business.onboarding.modules.sales') })}
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {(selectedActivity?.privateButtons || []).length > 0 && (
                  <div className="rounded-3xl bg-white border border-slate-100 p-4">
                    <div className="text-[11px] font-black text-slate-400 mb-3">{t('business.onboarding.activityPrivateButtons')}</div>
                    <div className="space-y-3">
                      {(selectedActivity?.privateButtons || []).map((button) => {
                        const checked = enabledActivityButtons.has(button.id);
                        return (
                          <button
                            key={button.id}
                            type="button"
                            onClick={() => toggleActivityButton(button.id)}
                            className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl border transition-all text-right ${checked ? 'border-cyan-400 bg-cyan-50/40' : 'border-slate-100 bg-white'}`}
                          >
                            <span className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors ${checked ? 'bg-cyan-400 border-cyan-400' : 'bg-white border-slate-200'}`}>
                              {checked && <CheckCircle2 className="w-4 h-4 text-white" />}
                            </span>
                            <span className="font-black text-slate-900 text-sm">{button.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const allSpecialties = isBookingsActivity ? selectedBookingSpecialties : selectedSpecialties;

  const FormField = ({
    id,
    label,
    value,
    onChange,
    type = 'text',
    required,
    icon: Icon,
    placeholder,
    multiline,
  }: {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    type?: string;
    required?: boolean;
    icon?: React.ComponentType<{ className?: string }>;
    placeholder?: string;
    multiline?: boolean;
  }) => (
    <div className="space-y-2">
      <label htmlFor={id} className="text-xs font-black text-slate-600 uppercase tracking-widest mr-4 flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-cyan-600" />}
        <span className="text-slate-800">{label}</span>
        {required && <span className="text-red-500">*</span>}
      </label>
      {multiline ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 font-black text-right text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-cyan-400 transition-all outline-none resize-none"
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 font-black text-right text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-cyan-400 transition-all outline-none"
        />
      )}
    </div>
  );

  const renderDataStep = () => (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="text-center mb-4">
        <div className="text-2xl md:text-3xl font-black text-slate-900 mb-2">{t('business.onboarding.stepDataTitle', 'بياناتك وبيانات المتجر')}</div>
        <p className="text-slate-500 font-bold text-sm">{t('business.onboarding.stepDataHint', 'أدخل بياناتك وبيانات المتجر')}</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-[2.5rem] p-6 md:p-8 space-y-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            id="merchant-name"
            label={t('business.onboarding.fullNameLabel', 'الاسم الكامل')}
            value={formData.name}
            onChange={(v) => setFormData((prev) => ({ ...prev, name: v }))}
            required
            icon={User}
            placeholder={t('business.onboarding.fullNamePlaceholder', 'محمد أحمد')}
          />
          <FormField
            id="merchant-phone"
            label={t('business.onboarding.mobileLabel', 'رقم الجوال')}
            value={formData.phone}
            onChange={(v) => setFormData((prev) => ({ ...prev, phone: v }))}
            required
            type="tel"
            icon={Phone}
            placeholder={t('business.onboarding.mobilePlaceholder', '01234567890')}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            id="merchant-email"
            label={t('business.onboarding.emailLabel', 'البريد الإلكتروني')}
            value={formData.email}
            onChange={(v) => setFormData((prev) => ({ ...prev, email: v }))}
            required
            type="email"
            icon={Mail}
            placeholder={t('business.onboarding.emailPlaceholder', 'name@example.com')}
          />
          <div className="space-y-2">
            <label htmlFor="merchant-password" className="text-xs font-black text-slate-600 uppercase tracking-widest mr-4 flex items-center gap-2">
              <Lock className="w-4 h-4 text-cyan-600" />
              <span className="text-slate-800">{t('business.onboarding.passwordLabel', 'كلمة المرور')}</span>
              <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="merchant-password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                placeholder="••••••••"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pr-6 pl-14 font-black text-right text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-cyan-400 transition-all outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Store className="w-4 h-4 text-[#00E5FF]" />
            <span className="font-black text-slate-900">{t('business.onboarding.shopDetails', 'بيانات المتجر')}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <FormField
              id="shop-name"
              label={t('business.onboarding.shopNameLabel', 'اسم المتجر')}
              value={formData.shopName}
              onChange={(v) => setFormData((prev) => ({ ...prev, shopName: v }))}
              required
              icon={Store}
              placeholder={t('business.onboarding.shopNamePlaceholder', 'متجر ري')}
            />
            <FormField
              id="shop-phone"
              label={t('business.onboarding.shopPhoneLabel', 'هاتف المتجر')}
              value={formData.shopPhone}
              onChange={(v) => setFormData((prev) => ({ ...prev, shopPhone: v }))}
              type="tel"
              icon={Phone}
              placeholder={t('business.onboarding.mobilePlaceholder', '01234567890')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <FormField
              id="shop-governorate"
              label={t('business.onboarding.governorateLabel', 'المحافظة')}
              value={formData.governorate}
              onChange={(v) => setFormData((prev) => ({ ...prev, governorate: v }))}
              icon={MapPin}
              placeholder={t('business.onboarding.governoratePlaceholder', 'القاهرة')}
            />
            <FormField
              id="shop-city"
              label={t('business.onboarding.cityLabel', 'المدينة')}
              value={formData.city}
              onChange={(v) => setFormData((prev) => ({ ...prev, city: v }))}
              icon={MapPin}
              placeholder={t('business.onboarding.cityPlaceholder', 'مدينة نصر')}
            />
          </div>

          <FormField
            id="shop-email"
            label={t('business.onboarding.shopEmailLabel', 'بريد المتجر')}
            value={formData.shopEmail}
            onChange={(v) => setFormData((prev) => ({ ...prev, shopEmail: v }))}
            type="email"
            icon={Mail}
            placeholder={t('business.onboarding.shopEmailPlaceholder', 'shop@example.com')}
          />

          <div className="mt-6">
            <FormField
              id="shop-address"
              label={t('business.onboarding.addressLabel', 'العنوان التفصيلي')}
              value={formData.addressDetailed}
              onChange={(v) => setFormData((prev) => ({ ...prev, addressDetailed: v }))}
              multiline
              icon={MapPin}
              placeholder={t('business.onboarding.addressPlaceholder', 'شارع ... عمارة ... دور ...')}
            />
          </div>

          <div className="mt-6">
            <FormField
              id="shop-description"
              label={t('business.onboarding.descriptionLabel', 'وصف المتجر')}
              value={formData.shopDescription}
              onChange={(v) => setFormData((prev) => ({ ...prev, shopDescription: v }))}
              multiline
              icon={Sparkles}
              placeholder={t('business.onboarding.descriptionPlaceholder', 'نبذة مختصرة عن نشاطك...')}
            />
          </div>

          <div className="mt-6">
            <FormField
              id="shop-hours"
              label={t('business.onboarding.openingHoursLabel', 'مواعيد العمل')}
              value={formData.openingHours}
              onChange={(v) => setFormData((prev) => ({ ...prev, openingHours: v }))}
              icon={Calendar}
              placeholder={t('business.onboarding.openingHoursPlaceholder', '9 ص - 10 م')}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderSummary = () => {
    if (step !== 'data') return null;
    return (
      <div className="mt-8 bg-slate-50 border border-slate-100 rounded-[2.5rem] p-6">
        <div className="font-black text-lg text-slate-900 mb-2">{t('business.onboarding.summary')}</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white border border-slate-100 rounded-2xl p-4">
            <div className="text-slate-400 text-xs font-black mb-1">{t('business.onboarding.summaryActivity')}</div>
            <div className="font-black text-slate-900">{selectedActivity ? getActivityLabel(selectedActivity) : '-'}</div>
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl p-4">
            <div className="text-slate-400 text-xs font-black mb-1">{t('business.onboarding.summarySpecialties', 'التخصصات')}</div>
            <div className="font-black text-slate-900">{allSpecialties.size || t('business.onboarding.none', 'غير محدد')}</div>
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl p-4">
            <div className="text-slate-400 text-xs font-black mb-1">{t('business.onboarding.summaryModules')}</div>
            <div className="font-black text-slate-900">
              {isBookingsActivity
                ? BOOKING_GENERAL_MODULES.length + enabledBookingButtons.size
                : CORE_MODULES.length + Array.from(enabledModules).filter((id) => OPTIONAL_MODULES.some((m) => m.id === id)).length}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const stepHint = {
    activity: t('business.onboarding.stepActivityHint'),
    specialty: t('business.onboarding.stepSpecialtyHint', 'حدد التخصص الدقيق لنشاطك'),
    modules: t('business.onboarding.stepModulesHint'),
    data: t('business.onboarding.stepDataHint', 'أدخل بياناتك وبيانات المتجر'),
  }[step];

  return (
    <div className="min-h-screen bg-slate-50/60" dir="rtl">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-10 md:py-16">
        <MotionDiv
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-5xl mx-auto"
        >
          <div className="flex items-center justify-between mb-6">
            <button
              type="button"
              onClick={goHome}
              className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 font-black text-sm transition-colors"
            >
              <Home className="w-4 h-4" />
              {t('business.onboarding.backToHome')}
            </button>
            <div className="text-xs font-black text-slate-400">
              {t('business.onboarding.step', { current: step === 'activity' ? 1 : step === 'specialty' ? 2 : step === 'modules' ? 3 : 4, total: 4 })}
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 mb-3">
              {t('business.onboarding.startProject')}
            </h1>
            <p className="text-slate-500 font-bold text-sm md:text-base max-w-xl mx-auto">{stepHint}</p>
          </div>

          <Stepper />

          <div className="bg-white border border-slate-100 rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)]">
            <AnimatePresence>
              {error ? (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="bg-amber-50 border-r-4 border-amber-500 p-4 mb-6 rounded-2xl flex items-center gap-3 flex-row-reverse text-slate-900 font-black text-sm"
                >
                  <AlertTriangle size={18} /> {error}
                </motion.div>
              ) : null}
            </AnimatePresence>

            {step === 'activity' && renderActivityStep()}
            {step === 'specialty' && renderSpecialtyStep()}
            {step === 'modules' && renderModulesStep()}
            {step === 'data' && renderDataStep()}

            <div className="mt-10 flex flex-col md:flex-row gap-3">
              {step !== 'activity' && (
                <button
                  type="button"
                  disabled={loading}
                  onClick={goBack}
                  className="md:w-40 py-4 rounded-2xl bg-white border border-slate-200 text-slate-700 font-black hover:bg-slate-50 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <ChevronLeft size={18} />
                  {t('business.onboarding.back')}
                </button>
              )}
              <button
                type="button"
                disabled={loading}
                onClick={goNext}
                className="flex-1 py-4 rounded-2xl bg-slate-900 text-white font-black hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : step === 'data' ? (
                  t('business.onboarding.createAccount', 'إنشاء الحساب')
                ) : (
                  <>
                    {t('business.onboarding.next')}
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>

            {renderSummary()}

            {step === 'activity' && (
              <div className="mt-8 bg-slate-50 border border-slate-100 rounded-[2.5rem] p-6">
                <div className="font-black text-lg text-slate-900 mb-2">{t('business.onboarding.buttonsGuideTitle')}</div>
                <div className="text-xs font-black text-slate-500 mb-5">
                  {t('business.onboarding.buttonsGuideSubtitle')}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {CORE_MODULES.map((m) => {
                    const Icon = moduleIcons[m.id] || Wrench;
                    return (
                      <div key={m.id} className="bg-white border border-slate-100 rounded-2xl p-4 flex gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                          <Icon className="w-5 h-5 text-slate-600" />
                        </div>
                        <div>
                          <div className="font-black text-slate-900">{t('business.onboarding.modules.' + m.id, m.id)}</div>
                          <div className="mt-1 text-xs font-bold text-slate-500 leading-relaxed">
                            {t('business.onboarding.moduleExplanations.' + m.id, '')}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </MotionDiv>
      </div>
    </div>
  );
};

export default MerchantOnboarding;
