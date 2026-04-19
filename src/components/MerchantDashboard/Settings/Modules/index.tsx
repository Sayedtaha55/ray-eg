import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { ApiService } from '@/services/api.service';
import { useTranslation } from 'react-i18next';

type ModuleId =
  | 'overview'
  | 'products'
  | 'reservations'
  | 'invoice'
  | 'pos'
  | 'sales'
  | 'promotions'
  | 'reports'
  | 'customers'
  | 'gallery'
  | 'builder'
  | 'settings';

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
  const { t } = useTranslation();

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
  ], [t]);

  const baselineRef = useRef<string[]>([]);

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

  const [enabled, setEnabled] = useState<Set<ModuleId>>(() => new Set(initialEnabled as any));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const s = new Set<ModuleId>(initialEnabled as any);
    setEnabled(s);
    baselineRef.current = Array.from(s).map(String).sort();
  }, [initialEnabled]);

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
    const changed = JSON.stringify(current) !== JSON.stringify(baseline);
    emitChanges(changed ? 1 : 0);
  }, [enabled]);

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

      if (adminShopId) {
        await ApiService.updateMyShop({
          shopId: adminShopId,
          enabledModules: list,
        });

        baselineRef.current = list;
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

      if (requestedModules.length === 0) {
        toast({ title: t('modulesSettings.nothingNew'), description: t('modulesSettings.noNewModulesSelected') });
        baselineRef.current = toSortedArray(latestActiveSet as any);
        emitChanges(0);
        setEnabled(new Set(latestActiveSet as any));
        return true;
      }

      await (ApiService as any).createMyModuleUpgradeRequest?.({
        requestedModules,
      });

      toast({
        title: t('modulesSettings.requestSent'),
        description: t('modulesSettings.requestSentDesc'),
      });

      const baseline = toSortedArray(latestActiveSet as any);
      baselineRef.current = baseline;
      emitChanges(0);
      setEnabled(new Set(latestActiveSet as any));
      onSaved();
      return true;
    } catch (e: any) {
      const status = typeof e?.status === 'number' ? e.status : undefined;
      const msg = e?.message ? String(e.message) : '';

      if (status === 400 && msg.includes('مفعلة بالفعل')) {
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
  }, [activeEnabled, adminShopId, enabled, onSaved, toast]);

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
    <div className="space-y-6 text-right" dir="rtl">
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
        <div className="font-black text-slate-900 mb-4">{t('modulesSettings.optionalModules')}</div>
        <div className="space-y-3">
          {optionalModules.map((m) => {
            const checked = enabled.has(m.id);
            const isActive = activeEnabled.includes(m.id);
            const disabled =
              isActive ||
              ((m.id === 'customers' || m.id === 'reports') && !enabled.has('sales'));

            return (
              <div
                key={m.id}
                className={`w-full flex items-center justify-between gap-4 px-5 py-4 rounded-2xl border transition-all ${
                  checked ? 'border-[#00E5FF] bg-[#00E5FF]/5' : 'border-slate-100 bg-slate-50'
                } ${disabled ? 'opacity-60' : ''}`}
              >
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
