'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Label, Input } from '../ui';
import { useToast } from '../ToastProvider';
import { apiRequest } from '@/lib/auth';
import { MapPin } from 'lucide-react';

interface BranchesSettingsTabProps {
  shop: any;
  onSaved: () => void;
}

export default function BranchesSettingsTab({ shop, onSaved }: BranchesSettingsTabProps) {
  const { toast } = useToast();
  const pd = shop?.pageDesign || {};

  const initial = useMemo(
    () => ({
      showOnInvoices: Boolean(pd.branchShowOnInvoices ?? true),
      enforceSelection: Boolean(pd.branchEnforceSelection ?? false),
      allowTransfers: Boolean(pd.branchAllowTransfers ?? true),
      defaultHours: String(pd.branchDefaultHours || 'يوميًا 10 ص - 10 م'),
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
          detail: { sectionId: 'branches_settings', count: isChanged ? 1 : 0 },
        })
      );
    } catch {}
  }, [form, initial]);

  const saveBranchesSettings = useCallback(async () => {
    setSaving(true);
    try {
      const current = formRef.current;
      await apiRequest('/shops/me', {
        method: 'PATCH',
        body: JSON.stringify({
          pageDesign: {
            ...pd,
            branchShowOnInvoices: current.showOnInvoices,
            branchEnforceSelection: current.enforceSelection,
            branchAllowTransfers: current.allowTransfers,
            branchDefaultHours: current.defaultHours.trim(),
          },
        }),
      });

      toast({ title: 'تم الحفظ', description: 'تم حفظ إعدادات الفروع بنجاح' });
      onSaved();
      return true;
    } catch (e: any) {
      toast({
        title: 'خطأ',
        description: e?.message || 'فشل حفظ إعدادات الفروع',
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
          detail: { sectionId: 'branches_settings', handler: saveBranchesSettings },
        })
      );
    } catch {}
  }, [saveBranchesSettings]);

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
            <MapPin className="w-4 h-4" /> إعدادات الفروع
          </CardTitle>
          <CardDescription>سلوك الفروع في البيع والفواتير والمخزون</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <ToggleRow
              title="إظهار الفرع على الفواتير"
              desc="اسم وفرع البيع يظهر في الفاتورة المطبوعة"
              value={form.showOnInvoices}
              onChange={(v) => setForm((f) => ({ ...f, showOnInvoices: v }))}
            />
            <ToggleRow
              title="إلزام اختيار الفرع قبل البيع"
              desc="لا يمكن إتمام الفاتورة بدون تحديد الفرع (للمتاجر متعددة الفروع)"
              value={form.enforceSelection}
              onChange={(v) => setForm((f) => ({ ...f, enforceSelection: v }))}
            />
            <ToggleRow
              title="السماح بالتحويل بين الفروع"
              desc="تفعيل أوامر تحويل المخزون من فرع لآخر"
              value={form.allowTransfers}
              onChange={(v) => setForm((f) => ({ ...f, allowTransfers: v }))}
            />
          </div>

          <div className="flex items-center justify-between gap-4 pt-1">
            <div>
              <Label className="font-bold text-sm text-slate-900">مواعيد عمل افتراضية</Label>
              <div className="text-xs text-slate-400 font-medium mt-0.5">
                تُقترح تلقائيًا عند إضافة فرع جديد
              </div>
            </div>
            <Input
              value={form.defaultHours}
              onChange={(e) => setForm((f) => ({ ...f, defaultHours: e.target.value }))}
              className="w-52 text-center shrink-0"
              placeholder="يوميًا 10 ص - 10 م"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
