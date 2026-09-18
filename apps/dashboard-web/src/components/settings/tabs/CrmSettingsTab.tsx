'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Label, Input } from '../ui';
import { useToast } from '../ToastProvider';
import { apiRequest } from '@/lib/auth';
import { Headset } from 'lucide-react';

interface CrmSettingsTabProps {
  shop: any;
  onSaved: () => void;
}

export default function CrmSettingsTab({ shop, onSaved }: CrmSettingsTabProps) {
  const { toast } = useToast();
  const pd = shop?.pageDesign || {};

  const initial = useMemo(
    () => ({
      autoAssign: Boolean(pd.crmAutoAssign ?? true),
      responseTargetHours: String(pd.crmResponseTargetHours ?? 4),
      escalationHours: String(pd.crmEscalationHours ?? 24),
      satisfactionSurvey: Boolean(pd.crmSatisfactionSurvey ?? true),
      autoCloseDays: String(pd.crmAutoCloseDays ?? 0),
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
          detail: { sectionId: 'crm_settings', count: isChanged ? 1 : 0 },
        })
      );
    } catch {}
  }, [form, initial]);

  const saveCrmSettings = useCallback(async () => {
    setSaving(true);
    try {
      const current = formRef.current;
      await apiRequest('/shops/me', {
        method: 'PATCH',
        body: JSON.stringify({
          pageDesign: {
            ...pd,
            crmAutoAssign: current.autoAssign,
            crmResponseTargetHours: Number(current.responseTargetHours) || 4,
            crmEscalationHours: Number(current.escalationHours) || 24,
            crmSatisfactionSurvey: current.satisfactionSurvey,
            crmAutoCloseDays: Number(current.autoCloseDays) || 0,
          },
        }),
      });

      toast({ title: 'تم الحفظ', description: 'تم حفظ إعدادات خدمة العملاء بنجاح' });
      onSaved();
      return true;
    } catch (e: any) {
      toast({
        title: 'خطأ',
        description: e?.message || 'فشل حفظ إعدادات خدمة العملاء',
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
          detail: { sectionId: 'crm_settings', handler: saveCrmSettings },
        })
      );
    } catch {}
  }, [saveCrmSettings]);

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
            <Headset className="w-4 h-4" /> إعدادات خدمة العملاء (CRM)
          </CardTitle>
          <CardDescription>توزيع المحادثات، أهداف الرد، والتصعيد التلقائي</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <ToggleRow
              title="توزيع تلقائي للمحادثات"
              desc="توجيه المحادثات الجديدة لأقل عضو في الأعباء"
              value={form.autoAssign}
              onChange={(v) => setForm((f) => ({ ...f, autoAssign: v }))}
            />
            <ToggleRow
              title="استبيان الرضا بعد الإغلاق"
              desc="إرسال تقييم للعميل بعد إغلاق تذكرته"
              value={form.satisfactionSurvey}
              onChange={(v) => setForm((f) => ({ ...f, satisfactionSurvey: v }))}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <Label className="font-bold text-sm text-slate-900">هدف أول رد (ساعات)</Label>
              <div className="text-xs text-slate-400 font-medium mt-0.5">
                الحد الأقصى المستهدف للرد على محادثة جديدة
              </div>
            </div>
            <Input
              type="number"
              min={1}
              value={form.responseTargetHours}
              onChange={(e) => setForm((f) => ({ ...f, responseTargetHours: e.target.value }))}
              className="w-24 text-center shrink-0"
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <Label className="font-bold text-sm text-slate-900">التصعيد بعد (ساعات)</Label>
              <div className="text-xs text-slate-400 font-medium mt-0.5">
                تحويل التذكرة غير المردودة للمدير تلقائيًا
              </div>
            </div>
            <Input
              type="number"
              min={1}
              value={form.escalationHours}
              onChange={(e) => setForm((f) => ({ ...f, escalationHours: e.target.value }))}
              className="w-24 text-center shrink-0"
            />
          </div>

          <div className="flex items-center justify-between gap-4 pt-1">
            <div>
              <Label className="font-bold text-sm text-slate-900">
                إغلاق تلقائي للمحلولة بعد (أيام)
              </Label>
              <div className="text-xs text-slate-400 font-medium mt-0.5">
                اكتب 0 لتعطيل الإغلاق التلقائي
              </div>
            </div>
            <Input
              type="number"
              min={0}
              value={form.autoCloseDays}
              onChange={(e) => setForm((f) => ({ ...f, autoCloseDays: e.target.value }))}
              className="w-24 text-center shrink-0"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
