import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { ApiService } from '@/services/api.service';
import { useTranslation } from 'react-i18next';
import { BUSINESS_ACTIVITY_GROUPS, getBusinessActivityById, getBusinessActivityThemePatch, getDefaultActivityForCategory } from '@/utils/businessActivityCatalog';

type ModuleId = string;

type ModuleDef = {
  id: ModuleId;
  label: string;
  kind: 'core' | 'optional';
};

const CORE_IDS: ModuleId[] = ['overview', 'products', 'promotions', 'builder', 'settings'];

type SaveHandler = () => Promise<boolean>;

type SectionChangesHandlerDetail = { sectionId: string; count: number };

type Props = {
  shop: any;
  onSaved: () => void;
  adminShopId?: string;
};

const ModulesSettings: React.FC<Props> = ({ shop, onSaved, adminShopId }) => {
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');

  const MODULES: ModuleDef[] = useMemo(() => [
    { id: 'overview', label: t('modulesSettings.moduleOverview'), kind: 'core' },
    { id: 'products', label: t('modulesSettings.moduleProducts'), kind: 'core' },
    { id: 'promotions', label: t('modulesSettings.modulePromotions'), kind: 'core' },
    { id: 'builder', label: t('modulesSettings.moduleBuilder'), kind: 'core' },
    { id: 'settings', label: t('modulesSettings.moduleSettings'), kind: 'core' },
    { id: 'gallery', label: t('modulesSettings.moduleGallery'), kind: 'optional' },
    { id: 'reservations', label: t('modulesSettings.moduleReservations'), kind: 'optional' },
    { id: 'invoice', label: t('modulesSettings.moduleInvoice'), kind: 'optional' },
    { id: 'pos', label: t('modulesSettings.modulePos'), kind: 'optional' },
    { id: 'sales', label: t('modulesSettings.moduleSales'), kind: 'optional' },
    { id: 'customers', label: t('modulesSettings.moduleCustomers'), kind: 'optional' },
    { id: 'reports', label: t('modulesSettings.moduleReports'), kind: 'optional' },
    { id: 'abandonedCart', label: t('modulesSettings.moduleAbandonedCart'), kind: 'optional' },
  ], [t]);

  const baselineRef = useRef<string[]>([]);
  const activityBaselineRef = useRef<string[]>([]);

  const activeEnabled = useMemo(() => {
    const raw = (shop as any)?.layoutConfig?.enabledModules;
    if (!Array.isArray(raw)) {
      const coreOnly = Array.from(new Set(CORE_IDS));
      coreOnly.sort();
      return coreOnly;
    }
    const list = raw.map((x: any) => String(x || '').trim()).filter(Boolean) as ModuleId[];
    const merged = Array.from(new Set([...list, ...CORE_IDS]));
    merged.sort();
    return merged;
  }, [shop]);

  const initialEnabled = useMemo(() => {
    return activeEnabled;
  }, [activeEnabled]);

  const initialActivity = getBusinessActivityById((shop as any)?.pageDesign?.businessActivityId) || getDefaultActivityForCategory((shop as any)?.category);
  const [selectedActivityId, setSelectedActivityId] = useState<string>(initialActivity.id);
  const selectedActivityBaselineRef = useRef<string>(initialActivity.id);
  const [enabledActivityButtons, setEnabledActivityButtons] = useState<Set<string>>(() => new Set(Array.isArray((shop as any)?.pageDesign?.activityEnabledButtons) ? (shop as any).pageDesign.activityEnabledButtons.map((x: any) => String(x || '').trim()).filter(Boolean) : []));
  const [pendingRequestedButtons, setPendingRequestedButtons] = useState<Set<string>>(() => new Set());
  const [enabled, setEnabled] = useState<Set<ModuleId>>(() => new Set(initialEnabled as any));
  const [saving, setSaving] = useState(false);
  const [pendingFromAdmin, setPendingFromAdmin] = useState<Set<string>>(new Set());
  const [loadingRequests, setLoadingRequests] = useState(false);

  const fetchMyRequests = useCallback(async () => {
    if (adminShopId) return;
    setLoadingRequests(true);
    try {
      const requests = await ApiService.listMyModuleUpgradeRequests();
      const pendingSet = new Set<string>();
      if (Array.isArray(requests)) {
        for (const req of requests) {
          if (req.status === 'PENDING') {
            let modules: string[] = [];
            if (Array.isArray(req.requestedModules)) {
              modules = req.requestedModules;
            } else if (typeof req.requestedModules === 'string') {
              try {
                modules = JSON.parse(req.requestedModules);
              } catch {}
            }
            if (Array.isArray(modules)) {
              modules.forEach((m) => pendingSet.add(String(m).trim()));
            }
          }
        }
      }
      setPendingFromAdmin(pendingSet);
    } catch (err) {
      console.error('Failed to load upgrade requests:', err);
    } finally {
      setLoadingRequests(false);
    }
  }, [adminShopId]);

  useEffect(() => {
    fetchMyRequests();
  }, [fetchMyRequests]);

  useEffect(() => {
    const s = new Set<ModuleId>(initialEnabled as any);
    setEnabled(s);
    baselineRef.current = Array.from(s).map(String).sort();
    fetchMyRequests();
  }, [initialEnabled, fetchMyRequests]);

  useEffect(() => {
    const nextActivity = getBusinessActivityById((shop as any)?.pageDesign?.businessActivityId) || getDefaultActivityForCategory((shop as any)?.category);
    setSelectedActivityId(nextActivity.id);
    selectedActivityBaselineRef.current = nextActivity.id;
    const rawButtons = (shop as any)?.pageDesign?.activityEnabledButtons;
    const nextButtons = Array.isArray(rawButtons) ? rawButtons.map((x: any) => String(x || '').trim()).filter(Boolean) : [];
    setEnabledActivityButtons(new Set(nextButtons));
    activityBaselineRef.current = nextButtons.sort();
  }, [shop]);

  const toSortedArray = (s: Set<ModuleId>) => Array.from(s).map(String).sort();

  const emitChanges = (count: number) => {
    try {
      window.dispatchEvent(
        new CustomEvent('merchant-settings-section-changes', {
          detail: { sectionId: 'modules', count } satisfies SectionChangesHandlerDetail,
        }),
      );
    } catch {
    }
  };

  useEffect(() => {
    const current = toSortedArray(enabled);
    const baseline = baselineRef.current || [];
    const hasPendingButtons = pendingRequestedButtons.size > 0;
    const activityCurrent = Array.from(enabledActivityButtons).map(String).sort();
    const activityBaseline = activityBaselineRef.current || [];
    const activityChanged = selectedActivityId !== selectedActivityBaselineRef.current;
    
    const changed = 
      JSON.stringify(current) !== JSON.stringify(baseline) || 
      (adminShopId && JSON.stringify(activityCurrent) !== JSON.stringify(activityBaseline)) || 
      (adminShopId && activityChanged) ||
      (!adminShopId && hasPendingButtons);

    emitChanges(changed ? 1 : 0);
  }, [enabled, enabledActivityButtons, selectedActivityId, pendingRequestedButtons, adminShopId]);

  const canEnableCustomersOrReports = (next: Set<ModuleId>) => next.has('sales');

  const buildRemovalWarning = (id: ModuleId) => {
    const label = MODULES.find((m) => m.id === id)?.label || id;

    const details = (() => {
      switch (id) {
        case 'invoice':
          return t('modulesSettings.removeInvoiceDetail');
        case 'reservations':
          return t('modulesSettings.removeReservationsDetail');
        case 'gallery':
          return t('modulesSettings.removeGalleryDetail');
        case 'customers':
          return t('modulesSettings.removeCustomersDetail');
        case 'reports':
          return t('modulesSettings.removeReportsDetail');
        case 'pos':
          return t('modulesSettings.removePosDetail');
        case 'sales':
          return t('modulesSettings.removeSalesDetail');
        default:
          return t('modulesSettings.removeDefaultDetail');
      }
    })();

    return t('modulesSettings.removeConfirm', { label, details });
  };

  const removeActiveModule = useCallback(
    async (id: ModuleId) => {
      if (CORE_IDS.includes(id)) return;
      if (!activeEnabled.includes(id)) return;

      const ok = typeof window !== 'undefined' ? window.confirm(buildRemovalWarning(id)) : false;
      if (!ok) return;

      setSaving(true);
      try {
        const next = new Set<ModuleId>(activeEnabled as any);
        next.delete(id);
        if (id === 'sales') {
          next.delete('customers');
          next.delete('reports');
        }

        const list = toSortedArray(next as any);
        await ApiService.updateMyShop(adminShopId ? { shopId: adminShopId, enabledModules: list } : { enabledModules: list });
        baselineRef.current = list;
        emitChanges(0);
        setEnabled(new Set(list as any));
        toast({ title: t('modulesSettings.deleted'), description: t('modulesSettings.moduleDeletedDesc') });
        onSaved();
      } catch (e: any) {
        const msg = e?.message ? String(e.message) : '';
        toast({
          title: t('modulesSettings.error'),
          description: msg ? t('modulesSettings.removeModuleFailed', { msg }) : t('modulesSettings.removeModuleFailedShort'),
          variant: 'destructive',
        });
      } finally {
        setSaving(false);
      }
    },
    [activeEnabled, adminShopId, onSaved, toast],
  );

  const selectedActivity = getBusinessActivityById(selectedActivityId) || getDefaultActivityForCategory((shop as any)?.category);

  const toggleActivityButton = (id: string) => {
    setEnabledActivityButtons((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleRequestedButton = (buttonId: string) => {
    setPendingRequestedButtons((prev) => {
      const next = new Set(prev);
      if (next.has(buttonId)) {
        next.delete(buttonId);
      } else {
        next.add(buttonId);
      }
      return next;
    });
  };

  const removeActiveActivityButton = useCallback(
    async (buttonId: string) => {
      const activeButtons = Array.from(enabledActivityButtons);
      if (!activeButtons.includes(buttonId)) return;

      const ok = typeof window !== 'undefined' ? window.confirm('هل أنت متأكد من رغبتك في حذف هذا الزر الخاص؟') : false;
      if (!ok) return;

      setSaving(true);
      try {
        const next = new Set<string>(activeButtons);
        next.delete(buttonId);

        const list = Array.from(next).sort();
        const previousPageDesign = ((shop as any)?.pageDesign && typeof (shop as any).pageDesign === 'object') ? (shop as any).pageDesign : {};
        const nextPageDesign = {
          ...previousPageDesign,
          activityEnabledButtons: list,
        };

        await ApiService.updateMyShop(adminShopId ? { shopId: adminShopId, pageDesign: nextPageDesign } : { pageDesign: nextPageDesign });
        activityBaselineRef.current = list;
        setEnabledActivityButtons(next);
        emitChanges(0);
        toast({ title: t('modulesSettings.deleted'), description: 'تم حذف الزر الخاص بنجاح.' });
        onSaved();
      } catch (e: any) {
        const msg = e?.message ? String(e.message) : '';
        toast({
          title: t('modulesSettings.error'),
          description: msg ? `فشل في حذف الزر الخاص: ${msg}` : 'فشل في حذف الزر الخاص.',
          variant: 'destructive',
        });
      } finally {
        setSaving(false);
      }
    },
    [enabledActivityButtons, adminShopId, shop, onSaved, toast, t],
  );

  const toggleOptional = (id: ModuleId) => {
    if (CORE_IDS.includes(id)) return;

    setEnabled((prev) => {
      const next = new Set(prev);

      if (activeEnabled.includes(id)) {
        return prev;
      }

      if (next.has(id)) {
        next.delete(id);
        if (id === 'sales') {
          next.delete('customers');
          next.delete('reports');
        }
        return next;
      }

      if ((id === 'customers' || id === 'reports') && !canEnableCustomersOrReports(next)) {
        try {
          toast({
            title: t('modulesSettings.notAllowed'),
            description: t('modulesSettings.customersRequiresSales'),
            variant: 'destructive',
          });
        } catch {
        }
        return prev;
      }

      next.add(id);
      return next;
    });
  };

  const saveModules: SaveHandler = useCallback(async () => {
    setSaving(true);
    try {
      const list = toSortedArray(enabled);
      const activityButtonList = Array.from(enabledActivityButtons).map(String).sort();
      const previousPageDesign = ((shop as any)?.pageDesign && typeof (shop as any).pageDesign === 'object') ? (shop as any).pageDesign : {};
      const nextPageDesign = {
        ...previousPageDesign,
        activityEnabledButtons: activityButtonList,
        activityPrivateButtonLabels: Object.fromEntries((selectedActivity.privateButtons || []).map((button) => [button.id, button.label])),
      };

      if (adminShopId) {
        await ApiService.updateMyShop({
          shopId: adminShopId,
          enabledModules: list,
          pageDesign: nextPageDesign,
        });

        baselineRef.current = list;
        activityBaselineRef.current = activityButtonList;
        selectedActivityBaselineRef.current = selectedActivity.id;
        emitChanges(0);
        toast({ title: t('modulesSettings.saved'), description: t('modulesSettings.modulesSavedDesc') });
        onSaved();
        return true;
      }

      const latestActiveSet = await (async () => {
        try {
          const fresh = await ApiService.getMyShop();
          const raw = (fresh as any)?.layoutConfig?.enabledModules;
          const next = Array.isArray(raw)
            ? (raw.map((x: any) => String(x || '').trim()).filter(Boolean) as ModuleId[])
            : ([] as ModuleId[]);
          return new Set<ModuleId>(Array.from(new Set([...next, ...CORE_IDS])) as any);
        } catch {
          return new Set<ModuleId>(activeEnabled as any);
        }
      })();

      const requestedModules = list
        .filter((id) => !latestActiveSet.has(id as any))
        .filter((id) => !CORE_IDS.includes(id as any));

      const requestedButtons = Array.from(pendingRequestedButtons);
      const allRequested = [...requestedModules, ...requestedButtons];

      if (allRequested.length === 0) {
        toast({ title: t('modulesSettings.nothingNew'), description: t('modulesSettings.noNewModulesSelected') });
        baselineRef.current = toSortedArray(latestActiveSet as any);
        emitChanges(0);
        setEnabled(new Set(latestActiveSet as any));
        return true;
      }

      await (ApiService as any).createMyModuleUpgradeRequest?.({
        requestedModules: allRequested,
      });

      toast({
        title: t('modulesSettings.requestSent'),
        description: t('modulesSettings.requestSentDesc'),
      });

      setPendingRequestedButtons(new Set());
      const baseline = toSortedArray(latestActiveSet as any);
      baselineRef.current = baseline;
      emitChanges(0);
      setEnabled(new Set(latestActiveSet as any));
      await fetchMyRequests();
      onSaved();
      return true;
    } catch (e: any) {
      const status = typeof e?.status === 'number' ? e.status : undefined;
      const msg = e?.message ? String(e.message) : '';

      if (status === 400 && (msg.includes('مفعلة بالفعل') || msg.toLowerCase().includes('already enabled'))) {
        toast({
          title: t('modulesSettings.nothingNew'),
          description: t('modulesSettings.alreadyEnabled'),
        });
        try {
          const fresh = await ApiService.getMyShop();
          const raw = (fresh as any)?.layoutConfig?.enabledModules;
          const next = Array.isArray(raw)
            ? (raw.map((x: any) => String(x || '').trim()).filter(Boolean) as ModuleId[])
            : ([] as ModuleId[]);
          const merged = Array.from(new Set([...next, ...CORE_IDS]));
          merged.sort();
          baselineRef.current = merged;
          emitChanges(0);
          setEnabled(new Set(merged as any));
        } catch {
        }
        onSaved();
        return true;
      }

      toast({
        title: t('modulesSettings.error'),
        description: msg ? t('modulesSettings.saveModulesFailed', { msg }) : t('modulesSettings.saveModulesFailedShort'),
        variant: 'destructive',
      });
      throw e;
    } finally {
      setSaving(false);
    }
  }, [activeEnabled, adminShopId, enabled, enabledActivityButtons, pendingRequestedButtons, onSaved, selectedActivity, shop, toast, t, fetchMyRequests]);

  useEffect(() => {
    try {
      window.dispatchEvent(
        new CustomEvent('merchant-settings-register-save-handler', {
          detail: { sectionId: 'modules', handler: saveModules },
        }),
      );
    } catch {
    }
  }, [saveModules]);

  const coreModules = useMemo(() => MODULES.filter((m) => m.kind === 'core'), []);
  const optionalModules = useMemo(() => MODULES.filter((m) => m.kind === 'optional'), []);

  return (
    <div className={`space-y-6 ${isArabic ? 'text-right' : 'text-left'}`} dir={isArabic ? 'rtl' : 'ltr'}>
      <div>
        <h3 className="text-2xl font-black">{t('modulesSettings.upgrade')}</h3>
        <p className="text-sm font-black text-slate-500 mt-2">
          {t('modulesSettings.upgradeDesc')}
        </p>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl p-5">
        <div className="font-black text-slate-900 mb-4">{t('modulesSettings.coreModules')}</div>
        <div className="space-y-2">
          {coreModules.map((m) => (
            <div
              key={m.id}
              className="w-full flex items-center justify-between gap-4 px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50"
            >
              <span className="font-black text-slate-900">{m.label}</span>
              <span className="text-[10px] font-black text-slate-400">{t('modulesSettings.core')}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl p-5">
        <div className="font-black text-slate-900 mb-2">أزرار النشاط الخاص</div>
        {adminShopId ? (
          <>
            <p className="text-xs font-black text-slate-500 mb-4">اختر النشاط الدقيق ثم فعّل الأزرار الخاصة التي تظهر للتاجر بجانب الأزرار العامة.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
              {BUSINESS_ACTIVITY_GROUPS.map((group) => (
                <div key={group.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                  <div className="font-black text-slate-900 text-sm mb-2">{group.title}</div>
                  <div className="flex flex-wrap gap-2">
                    {group.activities.map((activity) => {
                      const checked = selectedActivityId === activity.id;
                      return (
                        <button
                          key={activity.id}
                          type="button"
                          onClick={() => {
                            setSelectedActivityId(activity.id);
                            setEnabledActivityButtons(new Set());
                          }}
                          className={`px-3 py-2 rounded-xl border text-xs font-black transition-all ${checked ? 'border-[#00E5FF] bg-white text-slate-900' : 'border-slate-100 bg-white/70 text-slate-500'}`}
                        >
                          {activity.title}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-xs font-black text-slate-500 mb-4">تفقد وفعّل الأزرار الخاصة بنشاطك التجاري الحالي لتسهيل إدارة أعمالك.</p>
        )}

        <div className="rounded-3xl bg-slate-50 border border-slate-100 p-4">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <div className="font-black text-slate-900">{selectedActivity.title}</div>
              <div className="text-xs font-bold text-slate-500 mt-1">{selectedActivity.description}</div>
            </div>
            <div className="text-[11px] font-black text-cyan-700 bg-white border border-cyan-100 rounded-full px-3 py-1">نشاطك الحالي</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {selectedActivity.privateButtons.map((button) => {
              const isActive = enabledActivityButtons.has(button.id);
              
              if (adminShopId) {
                // Admin Mode: Direct toggle
                return (
                  <button
                    key={button.id}
                    type="button"
                    onClick={() => toggleActivityButton(button.id)}
                    className={`w-full flex items-center justify-between gap-4 px-4 py-3 rounded-2xl border transition-all ${isActive ? 'border-[#00E5FF] bg-[#00E5FF]/5' : 'border-slate-100 bg-white'}`}
                  >
                    <span className="font-black text-slate-900 text-sm">{button.label}</span>
                    <span className={`w-6 h-6 rounded-lg border ${isActive ? 'bg-[#00E5FF] border-[#00E5FF]' : 'bg-white border-slate-200'}`} />
                  </button>
                );
              }

              // Merchant Mode: Upgrade Request & Delete flow
              const isChecked = pendingRequestedButtons.has(button.id);
              const isPendingApproval = pendingFromAdmin.has(button.id);
              
              return (
                <div
                  key={button.id}
                  className={`w-full flex items-center justify-between gap-4 px-5 py-4 rounded-2xl border transition-all ${
                    isActive ? 'border-[#00E5FF] bg-[#00E5FF]/5' :
                    isPendingApproval ? 'border-amber-200 bg-amber-50/50 animate-pulse' :
                    isChecked ? 'border-[#00E5FF] bg-[#00E5FF]/5' :
                    'border-slate-100 bg-white'
                  }`}
                >
                  {isActive ? (
                    <>
                      <div className="flex flex-col text-right">
                        <span className="font-black text-slate-900 text-sm">{button.label}</span>
                        <span className="text-[10px] text-emerald-600 font-black mt-1">مفعل</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeActiveActivityButton(button.id)}
                        disabled={saving}
                        className="shrink-0 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-black text-xs hover:bg-slate-50 disabled:opacity-60"
                      >
                        {t('modulesSettings.delete')}
                      </button>
                    </>
                  ) : isPendingApproval ? (
                    <>
                      <div className="flex flex-col text-right">
                        <span className="font-black text-slate-900 text-sm">{button.label}</span>
                        <span className="text-[10px] text-amber-600 font-black mt-1">جاري المراجعة من الأدمن</span>
                      </div>
                      <span className="shrink-0 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black">
                        قيد الانتظار
                      </span>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => toggleRequestedButton(button.id)}
                      className="flex-1 flex items-center justify-between gap-4 text-right"
                    >
                      <span className="font-black text-slate-900 text-sm">{button.label}</span>
                      <span
                        className={`w-6 h-6 rounded-lg border ${
                          isChecked ? 'bg-[#00E5FF] border-[#00E5FF]' : 'bg-white border-slate-200'
                        }`}
                      />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl p-5">
        <div className="font-black text-slate-900 mb-4">{t('modulesSettings.optionalModules')}</div>
        <div className="space-y-3">
          {optionalModules.map((m) => {
            const checked = enabled.has(m.id);
            const isActive = activeEnabled.includes(m.id);
            const isPendingApproval = pendingFromAdmin.has(m.id);
            
            const disabled =
              isActive ||
              isPendingApproval ||
              ((m.id === 'customers' || m.id === 'reports') && !enabled.has('sales'));

            return (
              <div
                key={m.id}
                className={`w-full flex items-center justify-between gap-4 px-5 py-4 rounded-2xl border transition-all ${
                  isActive ? 'border-[#00E5FF] bg-[#00E5FF]/5' :
                  isPendingApproval ? 'border-amber-200 bg-amber-50/50 animate-pulse' :
                  checked ? 'border-[#00E5FF] bg-[#00E5FF]/5' :
                  'border-slate-100 bg-slate-50'
                } ${disabled && !isPendingApproval ? 'opacity-60' : ''}`}
              >
                {isPendingApproval ? (
                  <div className="flex-1 flex items-center justify-between gap-4">
                    <div className="flex flex-col text-right">
                      <span className="font-black text-slate-900">{m.label}</span>
                      <span className="text-[10px] text-amber-600 font-black mt-1">جاري المراجعة من الأدمن</span>
                    </div>
                    <span className="shrink-0 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black">
                      قيد الانتظار
                    </span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => (disabled ? null : toggleOptional(m.id))}
                    className={`flex-1 flex items-center justify-between gap-4 ${disabled ? 'cursor-not-allowed' : ''}`}
                  >
                    <span className="font-black text-slate-900">{m.label}</span>
                    <span
                      className={`w-6 h-6 rounded-lg border ${
                        checked ? 'bg-[#00E5FF] border-[#00E5FF]' : 'bg-white border-slate-200'
                      }`}
                    />
                  </button>
                )}

                {isActive ? (
                  <button
                    type="button"
                    onClick={() => removeActiveModule(m.id)}
                    disabled={saving}
                    className="shrink-0 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-black text-xs hover:bg-slate-50 disabled:opacity-60"
                  >
                    {t('modulesSettings.delete')}
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="mt-4">
          <button
            type="button"
            disabled={saving}
            onClick={() => {
              saveModules().catch(() => {});
            }}
            className="w-full py-4 rounded-2xl bg-slate-900 text-white font-black hover:bg-black transition-all disabled:opacity-60"
          >
            {saving ? t('modulesSettings.saving') : t('modulesSettings.saveModules')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModulesSettings;
