'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Label, Input } from '../ui';
import { useToast } from '../ToastProvider';
import { apiRequest } from '@/lib/auth';
import { UserCog } from 'lucide-react';

interface HrSettingsTabProps {
  shop: any;
  onSaved: () => void;
}

export default function HrSettingsTab({ shop, onSaved }: HrSettingsTabProps) {
  const { toast } = useToast();
  const pd = shop?.pageDesign || {};

  const initial = useMemo(
    () => ({
      shiftStart: String(pd.hrShiftStart || '09:00'),
      shiftEnd: String(pd.hrShiftEnd || '17:00'),
      lateGraceMinutes: String(pd.hrLateGraceMinutes ?? 15),
      allowCashierDiscount: Boolean(pd.hrAllowCashierDiscount ?? true),
      maxDiscountPercent: String(pd.hrMaxDiscountPercent ?? 10),
      autoApproveLeaves: Boolean(pd.hrAutoApproveLeaves ?? false),
      payrollDay: String(pd.hrPayrollDay ?? 1),
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
          detail: { sectionId: 'hr_settings', count: isChanged ? 1 : 0 },
        })
      );
    } catch {}
  }, [form, initial]);

  const saveHrSettings = useCallback(async () => {
    setSaving(true);
    try {
      const current = formRef.current;
      await apiRequest('/shops/me', {
        method: 'PATCH',
        body: JSON.stringify({
          pageDesign: {
            ...pd,
            hrShiftStart: current.shiftStart.trim() || '09:00',
            hrShiftEnd: current.shiftEnd.trim() || '17:00',
            hrLateGraceMinutes: Number(current.lateGraceMinutes) || 0,
            hrAllowCashierDiscount: current.allowCashierDiscount,
            hrMaxDiscountPercent: Number(current.maxDiscountPercent) || 0,
            hrAutoApproveLeaves: current.autoApproveLeaves,
            hrPayrollDay: Number(current.payrollDay) || 1,
          },
        }),
      });

      toast({ title: 'تم الحفظ', description: 'تم حفظ إعدادات الفريق بنجاح' });
      onSaved();
      return true;
    } catch (e: any) {
      toast({
        title: 'خطأ',
        description: e?.message || 'فشل حفظ إعدادات الفريق',
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
          detail: { sectionId: 'hr_settings', handler: saveHrSettings },
        })
      );
    } catch {}
  }, [saveHrSettings]);

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
            <UserCog className="w-4 h-4" /> إعدادات الفريق
          </CardTitle>
          <CardDescription>الشيفتات الافتراضية، صلاحيات الخصم، وإجازات الفريق</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="font-bold text-sm text-slate-900">بداية الشيفت الافتراضية</Label>
              <Input
                type="time"
                value={form.shiftStart}
                onChange={(e) => setForm((f) => ({ ...f, shiftStart: e.target.value }))}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label className="font-bold text-sm text-slate-900">نهاية الشيفت الافتراضية</Label>
              <Input
                type="time"
                value={form.shiftEnd}
                onChange={(e) => setForm((f) => ({ ...f, shiftEnd: e.target.value }))}
                className="mt-1.5"
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <Label className="font-bold text-sm text-slate-900">سماحية التأخير (دقائق)</Label>
              <div className="text-xs text-slate-400 font-medium mt-0.5">
                الفترة التي لا تُحتسب تأخيرًا بعد بداية الشيفت
              </div>
            </div>
            <Input
              type="number"
              min={0}
              value={form.lateGraceMinutes}
              onChange={(e) => setForm((f) => ({ ...f, lateGraceMinutes: e.target.value }))}
              className="w-24 text-center shrink-0"
            />
          </div>

          <div>
            <ToggleRow
              title="سماح الكاشير بالخصم"
              desc="تفعيل زر الخصم للكاشير على فواتير نقاط البيع"
              value={form.allowCashierDiscount}
              onChange={(v) => setForm((f) => ({ ...f, allowCashierDiscount: v }))}
            />
            <div className="flex items-center justify-between gap-4 py-3.5 border-b border-slate-50">
              <div className="min-w-0">
                <div className="font-bold text-sm text-slate-900">أقصى نسبة خصم للكاشير (%)</div>
                <div className="text-xs text-slate-400 font-medium mt-0.5">
                  الخصم الأكبر يتطلب موافقة المدير
                </div>
              </div>
              <Input
                type="number"
                min={0}
                max={100}
                value={form.maxDiscountPercent}
                onChange={(e) => setForm((f) => ({ ...f, maxDiscountPercent: e.target.value }))}
                className="w-24 text-center shrink-0"
              />
            </div>
            <ToggleRow
              title="موافقة تلقائية على الإجازات"
              desc="قبول طلبات الإجازة بدون مراجعة المدير"
              value={form.autoApproveLeaves}
              onChange={(v) => setForm((f) => ({ ...f, autoApproveLeaves: v }))}
            />
          </div>

          <div className="flex items-center justify-between gap-4 pt-1">
            <div>
              <Label className="font-bold text-sm text-slate-900">يوم صرف الرواتب</Label>
              <div className="text-xs text-slate-400 font-medium mt-0.5">يوم الشهر (1 - 31)</div>
            </div>
            <Input
              type="number"
              min={1}
              max={31}
              value={form.payrollDay}
              onChange={(e) => setForm((f) => ({ ...f, payrollDay: e.target.value }))}
              className="w-24 text-center shrink-0"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
