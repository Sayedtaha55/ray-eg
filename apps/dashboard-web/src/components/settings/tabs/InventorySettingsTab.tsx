'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Label, Input } from '../ui';
import { useToast } from '../ToastProvider';
import { apiRequest } from '@/lib/auth';
import { Package } from 'lucide-react';

interface InventorySettingsTabProps {
  shop: any;
  onSaved: () => void;
}

export default function InventorySettingsTab({ shop, onSaved }: InventorySettingsTabProps) {
  const { toast } = useToast();
  const pd = shop?.pageDesign || {};

  const initial = useMemo(
    () => ({
      lowStockAlerts: Boolean(pd.invLowStockAlerts ?? true),
      lowStockThreshold: String(pd.invLowStockThreshold ?? 5),
      autoDeduct: Boolean(pd.invAutoDeduct ?? true),
      allowNegative: Boolean(pd.invAllowNegative ?? false),
      trackBatches: Boolean(pd.invTrackBatches ?? false),
      requirePoApproval: Boolean(pd.invRequirePoApproval ?? false),
      defaultUnit: String(pd.invDefaultUnit || 'قطعة'),
    }),
    [pd]
  );

  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const formRef = useRef(form);

  useEffect(() => {
    formRef.current = form;
  }, [form]);

  useEffect(() => {
    setForm(initial);
  }, [initial]);

  useEffect(() => {
    const isChanged = JSON.stringify(form) !== JSON.stringify(initial);
    try {
      window.dispatchEvent(
        new CustomEvent('merchant-settings-section-changes', {
          detail: { sectionId: 'inventory_settings', count: isChanged ? 1 : 0 },
        })
      );
    } catch {}
  }, [form, initial]);

  const saveInventorySettings = useCallback(async () => {
    setSaving(true);
    try {
      const current = formRef.current;
      await apiRequest('/shops/me', {
        method: 'PATCH',
        body: JSON.stringify({
          pageDesign: {
            ...pd,
            invLowStockAlerts: current.lowStockAlerts,
            invLowStockThreshold: Number(current.lowStockThreshold) || 5,
            invAutoDeduct: current.autoDeduct,
            invAllowNegative: current.allowNegative,
            invTrackBatches: current.trackBatches,
            invRequirePoApproval: current.requirePoApproval,
            invDefaultUnit: current.defaultUnit.trim() || 'قطعة',
          },
        }),
      });

      toast({ title: 'تم الحفظ', description: 'تم حفظ إعدادات المخزون بنجاح' });
      onSaved();
      return true;
    } catch (e: any) {
      toast({
        title: 'خطأ',
        description: e?.message || 'فشل حفظ إعدادات المخزون',
        variant: 'destructive',
      });
      return false;
    } finally {
      setSaving(false);
    }
  }, [pd, onSaved, toast]);

  useEffect(() => {
    try {
      window.dispatchEvent(
        new CustomEvent('merchant-settings-register-save-handler', {
          detail: { sectionId: 'inventory_settings', handler: saveInventorySettings },
        })
      );
    } catch {}
  }, [saveInventorySettings]);

  const ToggleRow = ({
    title,
    desc,
    value,
    onChange,
  }: {
    title: string;
    desc?: string;
    value: boolean;
    onChange: (v: boolean) => void;
  }) => (
    <div className="flex items-center justify-between gap-4 py-3.5 border-b border-slate-50 last:border-0">
      <div className="min-w-0">
        <div className="font-bold text-sm text-slate-900">{title}</div>
        {desc && <div className="text-xs text-slate-400 font-medium mt-0.5">{desc}</div>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${value ? 'bg-slate-900' : 'bg-slate-200'}`}
      >
        <div
          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${value ? 'right-0.5' : 'right-5.5'}`}
        />
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-4 h-4" /> إعدادات المخزون
          </CardTitle>
          <CardDescription>سلوك المخزون: الخصم التلقائي، تنبيهات النقص، والوحدات</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <ToggleRow
              title="تنبيهات نقص المخزون"
              desc="إشعار عند وصول منتج لحد التنبيه"
              value={form.lowStockAlerts}
              onChange={(v) => setForm((f) => ({ ...f, lowStockAlerts: v }))}
            />
            <div className="flex items-center justify-between gap-4 py-3.5 border-b border-slate-50">
              <div className="min-w-0">
                <div className="font-bold text-sm text-slate-900">حد التنبيه الافتراضي</div>
                <div className="text-xs text-slate-400 font-medium mt-0.5">
                  عدد الوحدات اللي يبدأ عندها التنبيه للمنتجات الجديدة
                </div>
              </div>
              <Input
                type="number"
                min={0}
                value={form.lowStockThreshold}
                onChange={(e) => setForm((f) => ({ ...f, lowStockThreshold: e.target.value }))}
                className="w-24 text-center shrink-0"
              />
            </div>
            <ToggleRow
              title="خصم المخزون تلقائيًا"
              desc="خصم الكميات المباعة من المخزون عند تأكيد الطلب"
              value={form.autoDeduct}
              onChange={(v) => setForm((f) => ({ ...f, autoDeduct: v }))}
            />
            <ToggleRow
              title="السماح بالبيع في السالب"
              desc="إتمام البيع حتى لو الكمية غير متوفرة"
              value={form.allowNegative}
              onChange={(v) => setForm((f) => ({ ...f, allowNegative: v }))}
            />
            <ToggleRow
              title="تتبع الدفعات وتواريخ الصلاحية"
              desc="تسجيل رقم الدفعة وتاريخ الانتهاء لكل استلام"
              value={form.trackBatches}
              onChange={(v) => setForm((f) => ({ ...f, trackBatches: v }))}
            />
            <ToggleRow
              title="الموافقة على أوامر الشراء"
              desc="لا يتم تنفيذ أمر شراء قبل موافقة المدير"
              value={form.requirePoApproval}
              onChange={(v) => setForm((f) => ({ ...f, requirePoApproval: v }))}
            />
          </div>

          <div className="flex items-center justify-between gap-4 pt-1">
            <div>
              <Label className="font-bold text-sm text-slate-900">وحدة القياس الافتراضية</Label>
              <div className="text-xs text-slate-400 font-medium mt-0.5">
                تُقترح تلقائيًا عند إضافة منتج جديد
              </div>
            </div>
            <Input
              value={form.defaultUnit}
              onChange={(e) => setForm((f) => ({ ...f, defaultUnit: e.target.value }))}
              className="w-32 text-center shrink-0"
              placeholder="قطعة"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
