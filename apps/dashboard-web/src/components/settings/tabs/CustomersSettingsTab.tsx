'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Label, Input } from '../ui';
import { useToast } from '../ToastProvider';
import { apiRequest } from '@/lib/auth';
import { Users } from 'lucide-react';

interface CustomersSettingsTabProps {
  shop: any;
  onSaved: () => void;
}

export default function CustomersSettingsTab({ shop, onSaved }: CustomersSettingsTabProps) {
  const { toast } = useToast();
  const pd = shop?.pageDesign || {};

  const initial = useMemo(
    () => ({
      loyaltyEnabled: Boolean(pd.custLoyaltyEnabled ?? true),
      loyaltyEarnPer100: String(pd.custLoyaltyEarnPer100 ?? 1),
      loyaltyPointValue: String(pd.custLoyaltyPointValue ?? 1),
      birthdayOffer: Boolean(pd.custBirthdayOffer ?? true),
      requirePhone: Boolean(pd.custRequirePhone ?? false),
      welcomeMessage: String(pd.custWelcomeMessage || 'أهلاً بيك في عائلتنا! 💙'),
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
          detail: { sectionId: 'customers_settings', count: isChanged ? 1 : 0 },
        })
      );
    } catch {}
  }, [form, initial]);

  const saveCustomersSettings = useCallback(async () => {
    setSaving(true);
    try {
      const current = formRef.current;
      await apiRequest('/shops/me', {
        method: 'PATCH',
        body: JSON.stringify({
          pageDesign: {
            ...pd,
            custLoyaltyEnabled: current.loyaltyEnabled,
            custLoyaltyEarnPer100: Number(current.loyaltyEarnPer100) || 1,
            custLoyaltyPointValue: Number(current.loyaltyPointValue) || 1,
            custBirthdayOffer: current.birthdayOffer,
            custRequirePhone: current.requirePhone,
            custWelcomeMessage: current.welcomeMessage.trim(),
          },
        }),
      });

      toast({ title: 'تم الحفظ', description: 'تم حفظ إعدادات العملاء بنجاح' });
      onSaved();
      return true;
    } catch (e: any) {
      toast({
        title: 'خطأ',
        description: e?.message || 'فشل حفظ إعدادات العملاء',
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
          detail: { sectionId: 'customers_settings', handler: saveCustomersSettings },
        })
      );
    } catch {}
  }, [saveCustomersSettings]);

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
            <Users className="w-4 h-4" /> إعدادات العملاء
          </CardTitle>
          <CardDescription>نقاط الولاء والعروض وبيانات العميل عند البيع</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <ToggleRow
              title="نقاط الولاء"
              desc="حساب نقاط للعميل مع كل عملية شراء"
              value={form.loyaltyEnabled}
              onChange={(v) => setForm((f) => ({ ...f, loyaltyEnabled: v }))}
            />
            <ToggleRow
              title="عرض عيد الميلاد"
              desc="إشعار العميل بعرض خاص في يوم ميلاده"
              value={form.birthdayOffer}
              onChange={(v) => setForm((f) => ({ ...f, birthdayOffer: v }))}
            />
            <ToggleRow
              title="إلزام رقم الهاتف عند البيع"
              desc="لا يمكن إتمام فاتورة بعميل بدون رقم موبايل"
              value={form.requirePhone}
              onChange={(v) => setForm((f) => ({ ...f, requirePhone: v }))}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <Label className="font-bold text-sm text-slate-900">نقاط لكل 100 جنيه</Label>
              <div className="text-xs text-slate-400 font-medium mt-0.5">
                معدل كسب النقاط من المشتريات
              </div>
            </div>
            <Input
              type="number"
              min={0}
              value={form.loyaltyEarnPer100}
              onChange={(e) => setForm((f) => ({ ...f, loyaltyEarnPer100: e.target.value }))}
              className="w-24 text-center shrink-0"
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <Label className="font-bold text-sm text-slate-900">قيمة النقطة (جنيه)</Label>
              <div className="text-xs text-slate-400 font-medium mt-0.5">
                قيمة كل نقطة عند الاستبدال
              </div>
            </div>
            <Input
              type="number"
              min={0}
              value={form.loyaltyPointValue}
              onChange={(e) => setForm((f) => ({ ...f, loyaltyPointValue: e.target.value }))}
              className="w-24 text-center shrink-0"
            />
          </div>

          <div className="flex items-center justify-between gap-4 pt-1">
            <div>
              <Label className="font-bold text-sm text-slate-900">رسالة ترحيب للعميل الجديد</Label>
              <div className="text-xs text-slate-400 font-medium mt-0.5">
                تُرسل عند تسجيل عميل لأول مرة
              </div>
            </div>
            <Input
              value={form.welcomeMessage}
              onChange={(e) => setForm((f) => ({ ...f, welcomeMessage: e.target.value }))}
              className="w-56 shrink-0"
              placeholder="أهلاً بيك!"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
