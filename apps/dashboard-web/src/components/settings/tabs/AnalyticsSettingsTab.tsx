'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Label } from '../ui';
import { useToast } from '../ToastProvider';
import { apiRequest } from '@/lib/auth';
import { BarChart3 } from 'lucide-react';

interface AnalyticsSettingsTabProps {
  shop: any;
  onSaved: () => void;
}

const RANGES = [
  { value: '7', label: 'آخر 7 أيام' },
  { value: '30', label: 'آخر 30 يوم' },
  { value: '90', label: 'آخر 90 يوم' },
];

export default function AnalyticsSettingsTab({ shop, onSaved }: AnalyticsSettingsTabProps) {
  const { toast } = useToast();
  const pd = shop?.pageDesign || {};

  const initial = useMemo(
    () => ({
      defaultRangeDays: String(pd.anaDefaultRangeDays || '7'),
      trackVisits: Boolean(pd.anaTrackVisits ?? true),
      excludeStaff: Boolean(pd.anaExcludeStaff ?? true),
      anonymizeIp: Boolean(pd.anaAnonymizeIp ?? false),
      weeklySummary: Boolean(pd.anaWeeklySummary ?? false),
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
          detail: { sectionId: 'analytics_settings', count: isChanged ? 1 : 0 },
        })
      );
    } catch {}
  }, [form, initial]);

  const saveAnalyticsSettings = useCallback(async () => {
    setSaving(true);
    try {
      const current = formRef.current;
      await apiRequest('/shops/me', {
        method: 'PATCH',
        body: JSON.stringify({
          pageDesign: {
            ...pd,
            anaDefaultRangeDays: current.defaultRangeDays,
            anaTrackVisits: current.trackVisits,
            anaExcludeStaff: current.excludeStaff,
            anaAnonymizeIp: current.anonymizeIp,
            anaWeeklySummary: current.weeklySummary,
          },
        }),
      });

      toast({ title: 'تم الحفظ', description: 'تم حفظ إعدادات التحليلات بنجاح' });
      onSaved();
      return true;
    } catch (e: any) {
      toast({
        title: 'خطأ',
        description: e?.message || 'فشل حفظ إعدادات التحليلات',
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
          detail: { sectionId: 'analytics_settings', handler: saveAnalyticsSettings },
        })
      );
    } catch {}
  }, [saveAnalyticsSettings]);

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
            <BarChart3 className="w-4 h-4" /> إعدادات التحليلات
          </CardTitle>
          <CardDescription>تتبع الزيارات، الخصوصية، ونطاق التقارير الافتراضي</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label className="font-bold text-sm text-slate-900">النطاق الزمني الافتراضي</Label>
              <div className="text-xs text-slate-400 font-medium mt-0.5">
                الفترة التي تُفتح بها صفحة التقارير
              </div>
            </div>
            <select
              value={form.defaultRangeDays}
              onChange={(e) => setForm((f) => ({ ...f, defaultRangeDays: e.target.value }))}
              className="w-36 shrink-0 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-800 bg-white"
            >
              {RANGES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <ToggleRow
              title="تتبع زيارات الموقع"
              desc="تسجيل زيارات الزوار لصفحات متجرك العام"
              value={form.trackVisits}
              onChange={(v) => setForm((f) => ({ ...f, trackVisits: v }))}
            />
            <ToggleRow
              title="استثناء زيارات الفريق"
              desc="عدم احتساب تصفحك أنت وموظفيك في الإحصائيات"
              value={form.excludeStaff}
              onChange={(v) => setForm((f) => ({ ...f, excludeStaff: v }))}
            />
            <ToggleRow
              title="إخفاء عناوين IP"
              desc="خصوصية أعلى للزوار — يُخزن جزء فقط من العنوان"
              value={form.anonymizeIp}
              onChange={(v) => setForm((f) => ({ ...f, anonymizeIp: v }))}
            />
            <ToggleRow
              title="ملخص أسبوعي"
              desc="تقرير ملخص لأداء المتجر يصلك كل أسبوع"
              value={form.weeklySummary}
              onChange={(v) => setForm((f) => ({ ...f, weeklySummary: v }))}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
