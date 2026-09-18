'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Label, Input } from '../ui';
import { useToast } from '../ToastProvider';
import { apiRequest } from '@/lib/auth';
import { Calculator } from 'lucide-react';

interface AccountingSettingsTabProps {
  shop: any;
  onSaved: () => void;
}

const MONTHS = [
  { value: '01', label: 'يناير' },
  { value: '02', label: 'فبراير' },
  { value: '03', label: 'مارس' },
  { value: '04', label: 'أبريل' },
  { value: '05', label: 'مايو' },
  { value: '06', label: 'يونيو' },
  { value: '07', label: 'يوليو' },
  { value: '08', label: 'أغسطس' },
  { value: '09', label: 'سبتمبر' },
  { value: '10', label: 'أكتوبر' },
  { value: '11', label: 'نوفمبر' },
  { value: '12', label: 'ديسمبر' },
];

export default function AccountingSettingsTab({ shop, onSaved }: AccountingSettingsTabProps) {
  const { toast } = useToast();
  const pd = shop?.pageDesign || {};

  const initial = useMemo(
    () => ({
      autoJournal: Boolean(pd.accAutoJournal ?? true),
      fiscalStartMonth: String(pd.accFiscalStartMonth || '01'),
      lockClosedPeriods: Boolean(pd.accLockPeriods ?? true),
      expenseReceiptThreshold: String(pd.accExpenseReceiptThreshold ?? 1000),
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
          detail: { sectionId: 'accounting_settings', count: isChanged ? 1 : 0 },
        })
      );
    } catch {}
  }, [form, initial]);

  const saveAccountingSettings = useCallback(async () => {
    setSaving(true);
    try {
      const current = formRef.current;
      await apiRequest('/shops/me', {
        method: 'PATCH',
        body: JSON.stringify({
          pageDesign: {
            ...pd,
            accAutoJournal: current.autoJournal,
            accFiscalStartMonth: current.fiscalStartMonth,
            accLockPeriods: current.lockClosedPeriods,
            accExpenseReceiptThreshold: Number(current.expenseReceiptThreshold) || 0,
          },
        }),
      });

      toast({ title: 'تم الحفظ', description: 'تم حفظ إعدادات المحاسبة بنجاح' });
      onSaved();
      return true;
    } catch (e: any) {
      toast({
        title: 'خطأ',
        description: e?.message || 'فشل حفظ إعدادات المحاسبة',
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
          detail: { sectionId: 'accounting_settings', handler: saveAccountingSettings },
        })
      );
    } catch {}
  }, [saveAccountingSettings]);

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
            <Calculator className="w-4 h-4" /> إعدادات المحاسبة
          </CardTitle>
          <CardDescription>القيود التلقائية والسنة المالية وضوابط المصروفات</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <ToggleRow
              title="قيود يومية تلقائية"
              desc="توليد قيد محاسبي تلقائيًا مع كل فاتورة مدفوعة"
              value={form.autoJournal}
              onChange={(v) => setForm((f) => ({ ...f, autoJournal: v }))}
            />
            <ToggleRow
              title="قفل الفترات المغلقة"
              desc="منع تعديل القيود في الشهور المقفلة"
              value={form.lockClosedPeriods}
              onChange={(v) => setForm((f) => ({ ...f, lockClosedPeriods: v }))}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <Label className="font-bold text-sm text-slate-900">بداية السنة المالية</Label>
              <div className="text-xs text-slate-400 font-medium mt-0.5">
                الشهر الذي تبدأ عنده دورة التقارير السنوية
              </div>
            </div>
            <select
              value={form.fiscalStartMonth}
              onChange={(e) => setForm((f) => ({ ...f, fiscalStartMonth: e.target.value }))}
              className="w-36 shrink-0 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-800 bg-white"
            >
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between gap-4 pt-1">
            <div>
              <Label className="font-bold text-sm text-slate-900">إلزام إيصال للمصروفات فوق</Label>
              <div className="text-xs text-slate-400 font-medium mt-0.5">
                بالجنيه — اكتب 0 لتعطيل الإلزام
              </div>
            </div>
            <Input
              type="number"
              min={0}
              value={form.expenseReceiptThreshold}
              onChange={(e) => setForm((f) => ({ ...f, expenseReceiptThreshold: e.target.value }))}
              className="w-28 text-center shrink-0"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
