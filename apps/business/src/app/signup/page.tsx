'use client';

import { useMemo, useState, useCallback, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, AlertTriangle, ChevronLeft, Search, Home, ArrowRight,
  Sparkles, LayoutDashboard, Calendar, Plus, X, User, Store, Mail, Lock, Phone,
  Loader2, Eye, EyeOff, Check, ChevronDown,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  BUSINESS_ACTIVITIES, groupAccentColors, ActivityWithGroup,
} from '@/lib/activities';
import {
  MODULE_DEFINITIONS, MODULE_MAP, OPTIONAL_MODULES,
  toggleModule, resolveDependencies, computeSystemSummary,
  PAGE_LABEL_AR, type ModuleId,
} from '@/lib/moduleConfig';
import SystemSummary from '@/components/SystemSummary';

const MotionDiv = motion.div as any;

type Step = 'activity' | 'specialty' | 'modules' | 'data';

const ACTIVITIES: ActivityWithGroup[] = BUSINESS_ACTIVITIES;

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.mnmknk.com';

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '';

  const [step, setStep] = useState<Step>('activity');
  const [activityId, setActivityId] = useState<string>('');
  const [selectedSpecialties, setSelectedSpecialties] = useState<Set<string>>(new Set());
  const [customSpecialtyInput, setCustomSpecialtyInput] = useState('');
  const [enabledModuleIds, setEnabledModuleIds] = useState<ModuleId[]>([]);
  const [moduleFeatures, setModuleFeatures] = useState<Record<string, string[]>>({});
  const [expandedModuleId, setExpandedModuleId] = useState<ModuleId | null>(null);
  const [dependencyError, setDependencyError] = useState('');
  const [error, setError] = useState('');
  const [activitySearch, setActivitySearch] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '',
    shopName: '', governorate: '', city: '',
    shopPhone: '', openingHours: '', shopEmail: '',
    addressDetailed: '', shopDescription: '',
  });

  const selectedActivity = useMemo(
    () => ACTIVITIES.find((a) => a.id === activityId) || null,
    [activityId],
  );

  const getActivityLabel = (activity: ActivityWithGroup) => activity.title;

  const groupedActivities = useMemo(() => {
    const raw = activitySearch.trim().toLowerCase();
    return BUSINESS_ACTIVITIES.reduce<Record<string, ActivityWithGroup[]>>((acc, activity) => {
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
  }, [activitySearch]);

  const groupIds = useMemo(() => Object.keys(groupedActivities), [groupedActivities]);

  const applyActivity = (a: ActivityWithGroup) => {
    setActivityId(a.id);
    const initialModules = MODULE_DEFINITIONS.filter((m) => m.defaultEnabled).map((m) => m.id);
    setEnabledModuleIds(initialModules);
    const initialFeatures: Record<string, string[]> = {};
    MODULE_DEFINITIONS.forEach((mod) => {
      initialFeatures[mod.id] = mod.features
        .filter((f) => f.defaultEnabled !== false)
        .map((f) => f.id);
    });
    setModuleFeatures(initialFeatures);
    setExpandedModuleId(null);
    setSelectedSpecialties(new Set());
    setCustomSpecialtyInput('');
    setError('');
    setDependencyError('');
  };

  const hasSpecialties = selectedActivity && selectedActivity.specialties.length > 0;

  const summary = useMemo(
    () => computeSystemSummary(enabledModuleIds),
    [enabledModuleIds],
  );

  const handleToggleModule = useCallback((moduleId: ModuleId) => {
    setDependencyError('');
    setEnabledModuleIds((prev) => {
      const result = toggleModule(prev, moduleId);
      if (result.blocked.length > 0) {
        const mod = MODULE_MAP[moduleId];
        if (mod && !mod.optional) {
          setDependencyError(`${mod.nameAr || mod.name}: وحدة أساسية لا يمكن تعطيلها`);
        } else {
          const blockedNames = result.blocked
            .map((id) => MODULE_MAP[id]?.nameAr || MODULE_MAP[id]?.name || id)
            .join(', ');
          setDependencyError(`لا يمكن التعديل — مطلوب بواسطة: ${blockedNames}`);
        }
        return prev;
      }
      if (result.removed.length > 1) {
        const removedNames = result.removed
          .map((id) => {
            const m = MODULE_MAP[id];
            return m?.nameAr || m?.name || id;
          })
          .join(', ');
        setDependencyError(`تم تعطيل: ${removedNames}`);
      }
      return result.next;
    });
  }, []);

  const handleToggleFeature = (moduleId: string, featureId: string) => {
    setModuleFeatures((prev) => {
      const current = prev[moduleId] || [];
      const next = current.includes(featureId)
        ? current.filter((id) => id !== featureId)
        : [...current, featureId];
      return { ...prev, [moduleId]: next };
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

  const submitSignup = async () => {
    if (!selectedActivity) {
      setError('اختر نشاطك أولاً');
      setStep('activity');
      return;
    }
    if (!formData.name || !formData.email || !formData.password || !formData.phone || !formData.shopName) {
      setError('يرجى ملء الحقول المطلوبة');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const payload: any = {
        ...formData,
        role: 'merchant',
        category: selectedActivity.category,
        activityId: selectedActivity.id,
        enabledModules: Array.from(resolveDependencies(enabledModuleIds)),
        specialties: Array.from(selectedSpecialties),
        moduleConfig: {
          enabledModules: Array.from(resolveDependencies(enabledModuleIds)),
          moduleFeatures: MODULE_DEFINITIONS.filter((m) =>
            resolveDependencies(enabledModuleIds).includes(m.id),
          ).map((m) => ({
            moduleId: m.id,
            features: m.features.map((f) => ({
              id: f.id,
              label: f.label,
              enabled: (moduleFeatures[m.id] || []).includes(f.id),
            })),
          })),
        },
      };
      const res = await fetch(`${API_URL}/api/v1/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'حدث خطأ أثناء التسجيل');
      if (data?.pending) {
        router.push('/pending');
        return;
      }
      localStorage.setItem('ray_session', JSON.stringify({
        user: data.user,
        accessToken: data.session?.access_token,
      }));
      router.push(returnTo || '/business/dashboard');
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء التسجيل');
    } finally {
      setLoading(false);
    }
  };

  const goNext = () => {
    setError('');
    setDependencyError('');
    if (step === 'activity') {
      if (!selectedActivity) { setError('اختر نشاطك أولاً'); return; }
      setStep(hasSpecialties ? 'specialty' : 'modules');
      return;
    }
    if (step === 'specialty') { setStep('modules'); return; }
    if (step === 'modules') { setStep('data'); return; }
    if (step === 'data') { submitSignup(); return; }
  };

  const goBack = () => {
    setError('');
    setDependencyError('');
    if (step === 'modules') setStep(hasSpecialties ? 'specialty' : 'activity');
    else if (step === 'specialty') setStep('activity');
    else if (step === 'data') setStep('modules');
  };

  const goHome = () => router.push('/');

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  };

  const Stepper = () => {
    const steps = [
      { key: 'activity', label: 'النشاط', num: 1 },
      { key: 'specialty', label: 'التخصص', num: 2 },
      { key: 'modules', label: 'الوحدات', num: 3 },
      { key: 'data', label: 'البيانات', num: 4 },
    ];
    const activeNum = step === 'activity' ? 1 : step === 'specialty' ? 2 : step === 'modules' ? 3 : 4;
    return (
      <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
        {steps.map((s, idx) => (
          <div key={s.key} className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-black transition-all ${s.num <= activeNum ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}>
              <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs">{s.num}</span>
              {s.label}
            </div>
            {idx < steps.length - 1 && <div className="w-8 h-px bg-slate-200" />}
          </div>
        ))}
      </div>
    );
  };

  const SpecialtyChip = ({ label, checked, onClick }: { label: string; checked: boolean; onClick: () => void }) => (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2.5 rounded-xl text-xs font-black border transition-all ${checked ? 'bg-cyan-50 border-cyan-400 text-cyan-800' : 'bg-white border-slate-100 text-slate-600 hover:border-slate-200'}`}
    >
      <span className="flex items-center gap-2">
        {checked && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600" />}
        {label}
      </span>
    </button>
  );

  const ActivityCard = ({ activity }: { activity: ActivityWithGroup }) => {
    const active = activity.id === activityId;
    const group = activity.groupId;
    const gradient = groupAccentColors[group] || groupAccentColors.other;
    const isPopular = ['restaurant', 'grocery', 'fashion', 'carShowroom', 'realEstate', 'bookings'].includes(activity.id);
    return (
      <button
        type="button"
        onClick={() => applyActivity(activity)}
        className={`relative text-right p-5 rounded-[2rem] border transition-all hover:shadow-xl ${active ? 'border-cyan-400 bg-cyan-50/40 shadow-cyan-100/50 shadow-lg' : 'border-slate-100 bg-white hover:border-slate-200'}`}
      >
        {active && <span className="absolute top-4 left-4"><CheckCircle2 className="w-5 h-5 text-cyan-600" /></span>}
        {isPopular && !active && (
          <span className="absolute top-4 left-4 px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-black flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> شائع
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
          placeholder="دور على نشاط..."
          className="w-full pr-12 pl-4 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 font-bold outline-none focus:border-cyan-300 transition-colors text-sm"
        />
      </div>

      {!activitySearch && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-black text-slate-900">الأكثر اختياراً</span>
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
          <span className="text-sm font-black text-slate-900">كل الأنشطة</span>
        </div>
        {groupIds.length === 0 ? (
          <div className="text-center py-10"><p className="text-slate-400 font-bold">لا توجد أنشطة مطابقة لبحثك.</p></div>
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
                    <button type="button" onClick={() => toggleGroup(groupId)} className="text-xs font-black text-cyan-700 hover:text-cyan-800 transition-colors">
                      {expanded ? 'عرض أقل' : 'عرض المزيد'}
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {visible.map((activity) => <ActivityCard key={activity.id} activity={activity} />)}
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
    return (
      <div className="space-y-8">
        <div className="text-center">
          <div className="text-2xl md:text-3xl font-black text-slate-900 mb-2">
            اختار تخصص {selectedActivity.title}
          </div>
          <p className="text-slate-500 font-bold text-sm md:text-base">
            حدد التخصص الدقيق لنشاطك. لو مش موجود اكتبه عشان نضيفه.
          </p>
        </div>

        {selectedActivity.specialties.length > 0 && (
          <div className="rounded-[2.5rem] border border-slate-100 bg-slate-50/40 p-6">
            <div className="font-black text-slate-900 text-base mb-4">التخصصات الشائعة</div>
            <div className="flex flex-wrap gap-2">
              {selectedActivity.specialties.map((specialty) => (
                <SpecialtyChip key={specialty} label={specialty} checked={selectedSpecialties.has(specialty)} onClick={() => toggleSpecialty(specialty)} />
              ))}
            </div>
          </div>
        )}

        <div className="rounded-[2.5rem] border border-slate-100 bg-slate-50/40 p-6">
          <div className="font-black text-slate-900 text-base mb-3">تخصص غير موجود؟ اكتبه</div>
          <div className="flex gap-2 max-w-md mx-auto flex-row-reverse">
            <input
              type="text"
              value={customSpecialtyInput}
              onChange={(e) => setCustomSpecialtyInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') addCustomSpecialty(); }}
              placeholder="مثال: مطعم سمك مشوي"
              className="flex-1 px-4 py-3 rounded-2xl bg-white border border-slate-100 text-slate-900 font-bold outline-none focus:border-cyan-300 text-sm"
            />
            <button type="button" onClick={addCustomSpecialty} className="px-4 py-3 rounded-2xl bg-slate-900 text-white hover:bg-black transition-colors">
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {Array.from(selectedSpecialties).filter((s) => !selectedActivity.specialties.includes(s)).map((specialty) => (
              <span key={specialty} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-black">
                {specialty}
                <button type="button" onClick={() => removeCustomSpecialty(specialty)}><X className="w-3.5 h-3.5" /></button>
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
      <div className="space-y-6">
        <div className="text-center mb-4">
          <div className="text-2xl md:text-3xl font-black text-slate-900 mb-2">تكوين الوحدات</div>
          <p className="text-slate-500 font-bold text-sm">
            وحدات موصى بها لـ: {selectedActivity ? getActivityLabel(selectedActivity) : ''}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {dependencyError && (
              <div className={`flex items-start gap-3 p-4 rounded-xl border text-xs font-bold mb-3 ${
                dependencyError.startsWith('لا يمكن') || dependencyError.includes('أساسية')
                  ? 'bg-amber-50 border-amber-200 text-amber-800'
                  : 'bg-sky-50 border-sky-200 text-sky-700'
              }`}>
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{dependencyError}</span>
              </div>
            )}

            {OPTIONAL_MODULES.map((mod) => {
              const isEnabled = enabledModuleIds.includes(mod.id);
              const isExpanded = expandedModuleId === mod.id;
              const IconComp = mod.icon;

              return (
                <div
                  key={mod.id}
                  className={`rounded-2xl border-2 transition-all overflow-hidden ${
                    isEnabled
                      ? 'border-slate-200 bg-white'
                      : 'border-slate-100 bg-white/50'
                  }`}
                >
                  <div className="p-4 flex items-start gap-4">
                    <button
                      onClick={() => handleToggleModule(mod.id)}
                      className={`relative w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                        isEnabled ? 'text-white' : 'bg-slate-50 text-slate-300 hover:bg-slate-100'
                      }`}
                      style={isEnabled ? { backgroundColor: mod.color } : {}}
                    >
                      <IconComp className="w-6 h-6" />
                      {isEnabled && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white border-2 flex items-center justify-center" style={{ borderColor: mod.color }}>
                          <Check className="w-2.5 h-2.5" style={{ color: mod.color }} />
                        </div>
                      )}
                    </button>

                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => handleToggleModule(mod.id)}
                    >
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className={`font-black text-sm ${isEnabled ? 'text-slate-900' : 'text-slate-500'}`}>
                          {mod.nameAr || mod.name}
                        </h3>
                      </div>
                      <p className={`text-xs font-bold leading-relaxed mb-2 ${isEnabled ? 'text-slate-400' : 'text-slate-300'}`}>
                        {mod.descriptionAr || mod.description}
                      </p>

                      {mod.dependencies.length > 0 && (
                        <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-300 font-bold">
                          <span>يعتمد على:</span>
                          {mod.dependencies.map((dep) => {
                            const depMod = MODULE_MAP[dep];
                            return depMod ? (
                              <span key={dep} className={`px-1.5 py-0.5 rounded ${enabledModuleIds.includes(dep) ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                                {depMod.nameAr || depMod.name}
                              </span>
                            ) : null;
                          })}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => setExpandedModuleId(isExpanded ? null : mod.id)}
                      className="p-2 rounded-lg hover:bg-slate-50 transition-all shrink-0"
                    >
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <MotionDiv
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 border-t border-slate-50 pt-3">
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                            الميزات
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {mod.features.map((feature) => {
                              const featureEnabled = (moduleFeatures[mod.id] || []).includes(feature.id);
                              return (
                                <button
                                  key={feature.id}
                                  type="button"
                                  onClick={() => handleToggleFeature(mod.id, feature.id)}
                                  className={`flex items-center gap-2 p-2 rounded-lg transition-all text-right ${
                                    featureEnabled ? 'bg-emerald-50 text-emerald-900' : 'bg-slate-50 text-slate-400'
                                  }`}
                                >
                                  <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                                    featureEnabled ? 'bg-emerald-100' : 'bg-slate-100'
                                  }`}>
                                    {featureEnabled && <Check className="w-2.5 h-2.5 text-emerald-600" />}
                                  </div>
                                  <span className="text-xs font-bold">
                                    {feature.labelAr || feature.label}
                                  </span>
                                </button>
                              );
                            })}
                          </div>

                          {mod.pages.length > 0 && (
                            <>
                              <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 mt-4">
                                الصفحات
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {mod.pages.map((page) => (
                                  <span key={page.id} className="px-2.5 py-1 rounded-lg bg-slate-50 text-[11px] font-bold text-slate-500">
                                    {PAGE_LABEL_AR[page.label] || page.label}
                                  </span>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      </MotionDiv>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          <div className="lg:sticky lg:top-24 self-start">
            <SystemSummary enabledModuleIds={enabledModuleIds} />
          </div>
        </div>
      </div>
    );
  };

  const FormField = ({ id, label, value, onChange, type = 'text', required, icon: Icon, placeholder, multiline }: {
    id: string; label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean;
    icon?: React.ComponentType<{ className?: string }>; placeholder?: string; multiline?: boolean;
  }) => (
    <div className="space-y-2">
      <label htmlFor={id} className="text-xs font-black text-slate-600 uppercase tracking-widest mr-4 flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-cyan-600" />}
        <span className="text-slate-800">{label}</span>
        {required && <span className="text-red-500">*</span>}
      </label>
      {multiline ? (
        <textarea id={id} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={3}
          className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 font-black text-right text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-cyan-400 transition-all outline-none resize-none" />
      ) : (
        <input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={required}
          className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 font-black text-right text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-cyan-400 transition-all outline-none" />
      )}
    </div>
  );

  const renderDataStep = () => (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="text-center mb-4">
        <div className="text-2xl md:text-3xl font-black text-slate-900 mb-2">بياناتك وبيانات المتجر</div>
        <p className="text-slate-500 font-bold text-sm">أدخل بياناتك وبيانات المتجر</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-[2.5rem] p-6 md:p-8 space-y-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField id="merchant-name" label="الاسم الكامل" value={formData.name} onChange={(v) => setFormData((p) => ({ ...p, name: v }))} required icon={User} placeholder="محمد أحمد" />
          <FormField id="merchant-phone" label="رقم الجوال" value={formData.phone} onChange={(v) => setFormData((p) => ({ ...p, phone: v }))} required type="tel" icon={Phone} placeholder="01234567890" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField id="merchant-email" label="البريد الإلكتروني" value={formData.email} onChange={(v) => setFormData((p) => ({ ...p, email: v }))} required type="email" icon={Mail} placeholder="name@example.com" />
          <div className="space-y-2">
            <label htmlFor="merchant-password" className="text-xs font-black text-slate-600 uppercase tracking-widest mr-4 flex items-center gap-2">
              <Lock className="w-4 h-4 text-cyan-600" />
              <span className="text-slate-800">كلمة المرور</span>
              <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input id="merchant-password" type={showPassword ? 'text' : 'password'} value={formData.password}
                onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))} placeholder="••••••••" required
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pr-6 pl-14 font-black text-right text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-cyan-400 transition-all outline-none" />
              <button type="button" onClick={() => setShowPassword((p) => !p)} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Store className="w-4 h-4 text-[#00E5FF]" />
            <span className="font-black text-slate-900">بيانات المتجر</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <FormField id="shop-name" label="اسم المتجر" value={formData.shopName} onChange={(v) => setFormData((p) => ({ ...p, shopName: v }))} required icon={Store} placeholder="متجر ري" />
            <FormField id="shop-phone" label="هاتف المتجر" value={formData.shopPhone} onChange={(v) => setFormData((p) => ({ ...p, shopPhone: v }))} type="tel" icon={Phone} placeholder="01234567890" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <FormField id="shop-governorate" label="المحافظة" value={formData.governorate} onChange={(v) => setFormData((p) => ({ ...p, governorate: v }))} icon={Search} placeholder="القاهرة" />
            <FormField id="shop-city" label="المدينة" value={formData.city} onChange={(v) => setFormData((p) => ({ ...p, city: v }))} icon={Search} placeholder="مدينة نصر" />
          </div>
          <FormField id="shop-email" label="بريد المتجر" value={formData.shopEmail} onChange={(v) => setFormData((p) => ({ ...p, shopEmail: v }))} type="email" icon={Mail} placeholder="shop@example.com" />
          <div className="mt-6"><FormField id="shop-address" label="العنوان التفصيلي" value={formData.addressDetailed} onChange={(v) => setFormData((p) => ({ ...p, addressDetailed: v }))} multiline icon={Search} placeholder="شارع ... عمارة ... دور ..." /></div>
          <div className="mt-6"><FormField id="shop-description" label="وصف المتجر" value={formData.shopDescription} onChange={(v) => setFormData((p) => ({ ...p, shopDescription: v }))} multiline icon={Sparkles} placeholder="نبذة مختصرة عن نشاطك..." /></div>
          <div className="mt-6"><FormField id="shop-hours" label="مواعيد العمل" value={formData.openingHours} onChange={(v) => setFormData((p) => ({ ...p, openingHours: v }))} icon={Calendar} placeholder="9 ص - 10 م" /></div>
        </div>
      </div>
    </div>
  );

  const renderSummary = () => {
    if (step !== 'data') return null;
    return (
      <div className="mt-8 bg-slate-50 border border-slate-100 rounded-[2.5rem] p-6">
        <div className="font-black text-lg text-slate-900 mb-2">ملخص اختياراتك</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white border border-slate-100 rounded-2xl p-4">
            <div className="text-slate-400 text-xs font-black mb-1">النشاط</div>
            <div className="font-black text-slate-900">{selectedActivity ? getActivityLabel(selectedActivity) : '-'}</div>
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl p-4">
            <div className="text-slate-400 text-xs font-black mb-1">التخصصات</div>
            <div className="font-black text-slate-900">{selectedSpecialties.size || 'غير محدد'}</div>
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl p-4">
            <div className="text-slate-400 text-xs font-black mb-1">الوحدات المفعّلة</div>
            <div className="font-black text-slate-900">
              {summary.moduleCount} وحدة · {summary.totalFeatures} ميزة
            </div>
          </div>
        </div>
      </div>
    );
  };

  const stepHint = {
    activity: 'اختر نشاطك أولاً — ثم اضبط الوحدات.',
    specialty: 'حدد التخصص الدقيق لنشاطك',
    modules: 'فعّل أو عطّل الوحدات حسب احتياج نشاطك — ووسّع أي وحدة لضبط الميزات.',
    data: 'أدخل بياناتك وبيانات المتجر',
  }[step];

  return (
    <div className="min-h-screen bg-slate-50/60" dir="rtl">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-10 md:py-16">
        <MotionDiv initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button type="button" onClick={goHome} className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 font-black text-sm transition-colors">
              <Home className="w-4 h-4" /> العودة للرئيسية
            </button>
            <div className="text-xs font-black text-slate-400">
              الخطوة {step === 'activity' ? 1 : step === 'specialty' ? 2 : step === 'modules' ? 3 : 4} من 4
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 mb-3">ابدأ مشروعك</h1>
            <p className="text-slate-500 font-bold text-sm md:text-base max-w-xl mx-auto">{stepHint}</p>
          </div>

          <Stepper />

          <div className="bg-white border border-slate-100 rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)]">
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="bg-amber-50 border-r-4 border-amber-500 p-4 mb-6 rounded-2xl flex items-center gap-3 flex-row-reverse text-slate-900 font-black text-sm">
                  <AlertTriangle size={18} /> {error}
                </motion.div>
              )}
            </AnimatePresence>

            {step === 'activity' && renderActivityStep()}
            {step === 'specialty' && renderSpecialtyStep()}
            {step === 'modules' && renderModulesStep()}
            {step === 'data' && renderDataStep()}

            <div className="mt-10 flex flex-col md:flex-row gap-3">
              {step !== 'activity' && (
                <button type="button" disabled={loading} onClick={goBack}
                  className="md:w-40 py-4 rounded-2xl bg-white border border-slate-200 text-slate-700 font-black hover:bg-slate-50 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                  <ChevronLeft size={18} /> رجوع
                </button>
              )}
              <button type="button" disabled={loading} onClick={goNext}
                className="flex-1 py-4 rounded-2xl bg-slate-900 text-white font-black hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-70">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : step === 'data' ? 'إنشاء الحساب' : <>{'التالي'} <ArrowRight size={18} /></>}
              </button>
            </div>

            {renderSummary()}

            {step === 'activity' && (
              <div className="mt-8 bg-slate-50 border border-slate-100 rounded-[2.5rem] p-6">
                <div className="font-black text-lg text-slate-900 mb-2">شرح الوحدات</div>
                <div className="text-xs font-black text-slate-500 mb-5">الهدف إن كل وحدة يكون معناها واضح من دلوقتي — خصوصًا الفرق بين الحجوزات والطلبات/المبيعات.</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {MODULE_DEFINITIONS.map((m) => {
                    const Icon = m.icon;
                    return (
                      <div key={m.id} className="bg-white border border-slate-100 rounded-2xl p-4 flex gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${m.color}15` }}>
                          <Icon className="w-5 h-5" style={{ color: m.color }} />
                        </div>
                        <div>
                          <div className="font-black text-slate-900">{m.nameAr || m.name}</div>
                          <div className="text-[11px] font-bold text-slate-400 mt-0.5">{m.descriptionAr || m.description}</div>
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
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center"><Loader2 className="animate-spin text-slate-400" size={32} /></div>}>
      <SignupContent />
    </Suspense>
  );
}
