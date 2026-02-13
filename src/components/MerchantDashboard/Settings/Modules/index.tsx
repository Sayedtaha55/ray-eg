import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { ApiService } from '@/services/api.service';

type ModuleId =
  | 'overview'
  | 'products'
  | 'reservations'
  | 'invoice'
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

const MODULES: ModuleDef[] = [
  { id: 'overview', label: 'نظرة عامة', kind: 'core' },
  { id: 'products', label: 'المنتجات', kind: 'core' },
  { id: 'promotions', label: 'العروض', kind: 'core' },
  { id: 'builder', label: 'التصميم', kind: 'core' },
  { id: 'settings', label: 'الإعدادات', kind: 'core' },

  { id: 'gallery', label: 'معرض الصور', kind: 'optional' },
  { id: 'reservations', label: 'الحجوزات', kind: 'optional' },
  { id: 'invoice', label: 'فاتورة', kind: 'optional' },
  { id: 'sales', label: 'الطلبات / المبيعات', kind: 'optional' },
  { id: 'customers', label: 'العملاء', kind: 'optional' },
  { id: 'reports', label: 'التقارير', kind: 'optional' },
];

const CORE_IDS: ModuleId[] = MODULES.filter((m) => m.kind === 'core').map((m) => m.id);

type SaveHandler = () => Promise<boolean>;

type SectionChangesHandlerDetail = { sectionId: string; count: number };

type Props = {
  shop: any;
  onSaved: () => void;
  adminShopId?: string;
};

const ModulesSettings: React.FC<Props> = ({ shop, onSaved, adminShopId }) => {
  const { toast } = useToast();

  const baselineRef = useRef<string[]>([]);

  const initialEnabled = useMemo(() => {
    const raw = (shop as any)?.layoutConfig?.enabledModules;
    const list = Array.isArray(raw) ? raw.map((x: any) => String(x || '').trim()).filter(Boolean) : [];
    const merged = Array.from(new Set([...list, ...CORE_IDS]));
    merged.sort();
    return merged;
  }, [shop]);

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

  const toggleOptional = (id: ModuleId) => {
    if (CORE_IDS.includes(id)) return;

    setEnabled((prev) => {
      const next = new Set(prev);

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
            title: 'غير مسموح',
            description: 'لا يمكن تفعيل العملاء أو التقارير قبل تفعيل الطلبات / المبيعات.',
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

      await ApiService.updateMyShop({
        ...(adminShopId ? { shopId: adminShopId } : {}),
        enabledModules: list,
      });

      baselineRef.current = list;
      emitChanges(0);
      toast({ title: 'تم الحفظ', description: 'تم حفظ الأزرار والإضافات بنجاح' });
      onSaved();
      return true;
    } catch (e: any) {
      const msg = e?.message ? String(e.message) : '';
      toast({
        title: 'خطأ',
        description: msg ? `فشل حفظ الأزرار: ${msg}` : 'فشل حفظ الأزرار',
        variant: 'destructive',
      });
      throw e;
    } finally {
      setSaving(false);
    }
  }, [adminShopId, enabled, onSaved, toast]);

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
        <h3 className="text-2xl font-black">ترقية</h3>
        <p className="text-sm font-black text-slate-500 mt-2">
          الأزرار الأساسية موجودة دائمًا. فعّل الإضافي اللي تحتاجه.
        </p>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl p-5">
        <div className="font-black text-slate-900 mb-4">الأزرار الأساسية</div>
        <div className="space-y-2">
          {coreModules.map((m) => (
            <div
              key={m.id}
              className="w-full flex items-center justify-between gap-4 px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50"
            >
              <span className="font-black text-slate-900">{m.label}</span>
              <span className="text-[10px] font-black text-slate-400">أساسي</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl p-5">
        <div className="font-black text-slate-900 mb-4">الأزرار الإضافية</div>
        <div className="space-y-3">
          {optionalModules.map((m) => {
            const checked = enabled.has(m.id);
            const disabled = (m.id === 'customers' || m.id === 'reports') && !enabled.has('sales');

            return (
              <button
                key={m.id}
                type="button"
                onClick={() => (disabled ? null : toggleOptional(m.id))}
                className={`w-full flex items-center justify-between gap-4 px-5 py-4 rounded-2xl border transition-all ${
                  checked ? 'border-[#00E5FF] bg-[#00E5FF]/5' : 'border-slate-100 bg-slate-50'
                } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                <span className="font-black text-slate-900">{m.label}</span>
                <span
                  className={`w-6 h-6 rounded-lg border ${
                    checked ? 'bg-[#00E5FF] border-[#00E5FF]' : 'bg-white border-slate-200'
                  }`}
                />
              </button>
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
            {saving ? 'جاري الحفظ...' : 'حفظ الأزرار'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModulesSettings;
