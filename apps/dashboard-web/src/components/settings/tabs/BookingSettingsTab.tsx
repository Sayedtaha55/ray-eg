'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Label } from '../ui';
import { useToast } from '../ToastProvider';
import { apiRequest } from '@/lib/auth';
import { Clock, Shield, Bell } from 'lucide-react';

interface BookingSettingsTabProps {
  shop: any;
  onSaved: () => void;
}

export default function BookingSettingsTab({ shop, onSaved }: BookingSettingsTabProps) {
  const { toast } = useToast();
  const pd = shop?.pageDesign || {};

  const initial = useMemo(() => ({
    bookingSlotDuration: pd.bookingSlotDuration || 30,
    bookingAdvanceDays: pd.bookingAdvanceDays || 14,
    bookingAutoConfirm: pd.bookingAutoConfirm ?? false,
    bookingNotifyOwner: pd.bookingNotifyOwner ?? true,
    bookingNotifyCustomer: pd.bookingNotifyCustomer ?? true,
    bookingWorkStart: pd.bookingWorkStart || '09:00',
    bookingWorkEnd: pd.bookingWorkEnd || '21:00',
    bookingMaxPerSlot: pd.bookingMaxPerSlot || 1,
  }), [pd]);

  const [slotDuration, setSlotDuration] = useState<number>(initial.bookingSlotDuration);
  const [advanceDays, setAdvanceDays] = useState<number>(initial.bookingAdvanceDays);
  const [autoConfirm, setAutoConfirm] = useState<boolean>(initial.bookingAutoConfirm);
  const [notifyOwner, setNotifyOwner] = useState<boolean>(initial.bookingNotifyOwner);
  const [notifyCustomer, setNotifyCustomer] = useState<boolean>(initial.bookingNotifyCustomer);
  const [workStart, setWorkStart] = useState<string>(initial.bookingWorkStart);
  const [workEnd, setWorkEnd] = useState<string>(initial.bookingWorkEnd);
  const [maxPerSlot, setMaxPerSlot] = useState<number>(initial.bookingMaxPerSlot);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSlotDuration(initial.bookingSlotDuration);
    setAdvanceDays(initial.bookingAdvanceDays);
    setAutoConfirm(initial.bookingAutoConfirm);
    setNotifyOwner(initial.bookingNotifyOwner);
    setNotifyCustomer(initial.bookingNotifyCustomer);
    setWorkStart(initial.bookingWorkStart);
    setWorkEnd(initial.bookingWorkEnd);
    setMaxPerSlot(initial.bookingMaxPerSlot);
  }, [shop?.id, initial]);

  // Emit changes
  useEffect(() => {
    const count =
      (slotDuration !== initial.bookingSlotDuration ? 1 : 0) +
      (advanceDays !== initial.bookingAdvanceDays ? 1 : 0) +
      (autoConfirm !== initial.bookingAutoConfirm ? 1 : 0) +
      (notifyOwner !== initial.bookingNotifyOwner ? 1 : 0) +
      (notifyCustomer !== initial.bookingNotifyCustomer ? 1 : 0) +
      (workStart !== initial.bookingWorkStart ? 1 : 0) +
      (workEnd !== initial.bookingWorkEnd ? 1 : 0) +
      (maxPerSlot !== initial.bookingMaxPerSlot ? 1 : 0);
    try {
      window.dispatchEvent(new CustomEvent('merchant-settings-section-changes', { detail: { sectionId: 'booking_settings', count } }));
    } catch {}
  }, [slotDuration, advanceDays, autoConfirm, notifyOwner, notifyCustomer, workStart, workEnd, maxPerSlot, initial]);

  const saveBookingSettings = useCallback(async () => {
    setSaving(true);
    try {
      await apiRequest('/shops/me', {
        method: 'PATCH',
        body: JSON.stringify({
          pageDesign: {
            ...pd,
            bookingSlotDuration: slotDuration,
            bookingAdvanceDays: advanceDays,
            bookingAutoConfirm: autoConfirm,
            bookingNotifyOwner: notifyOwner,
            bookingNotifyCustomer: notifyCustomer,
            bookingWorkStart: workStart,
            bookingWorkEnd: workEnd,
            bookingMaxPerSlot: maxPerSlot,
          },
        }),
      });
      toast({ title: 'تم الحفظ', description: 'تم حفظ إعدادات الحجوزات بنجاح' });
      onSaved();
      return true;
    } catch (e: any) {
      toast({ title: 'خطأ', description: 'فشل حفظ إعدادات الحجوزات', variant: 'destructive' });
      return false;
    } finally {
      setSaving(false);
    }
  }, [shop?.id, pd, slotDuration, advanceDays, autoConfirm, notifyOwner, notifyCustomer, workStart, workEnd, maxPerSlot, toast, onSaved]);

  useEffect(() => {
    try {
      window.dispatchEvent(new CustomEvent('merchant-settings-register-save-handler', { detail: { sectionId: 'booking_settings', handler: saveBookingSettings } }));
    } catch {}
  }, [saveBookingSettings]);

  const Toggle = ({ value, onChange, label, description }: { value: boolean; onChange: (v: boolean) => void; label: string; description?: string }) => (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-slate-50 last:border-0">
      <div>
        <div className="font-bold text-sm text-slate-900">{label}</div>
        {description && <div className="text-xs text-slate-400 font-bold mt-0.5">{description}</div>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ${value ? 'bg-[#00E5FF]' : 'bg-slate-200'}`}
      >
        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${value ? 'left-6' : 'left-0.5'}`} />
      </button>
    </div>
  );

  return (
    <div className="space-y-6 text-right" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold">إعدادات الحجوزات</h1>
        <p className="text-slate-500 text-sm mt-1">ضبط سلوك ومواعيد الحجوزات لمتجرك</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <Clock className="w-5 h-5 text-[#00E5FF]" />
          <div>
            <CardTitle className="text-lg">الجدول الزمني</CardTitle>
            <CardDescription>إعداد الفترات الزمنية ومواعيد العمل</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>مدة كل موعد (دقيقة)</Label>
              <select
                value={slotDuration}
                onChange={(e) => setSlotDuration(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300"
              >
                {[15, 20, 30, 45, 60, 90, 120].map((d) => (
                  <option key={d} value={d}>{d} دقيقة</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>أقصى حجوزات في نفس الموعد</Label>
              <input
                type="number"
                min={1}
                max={20}
                value={maxPerSlot}
                onChange={(e) => setMaxPerSlot(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300"
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>بداية وقت العمل</Label>
              <input
                type="time"
                value={workStart}
                onChange={(e) => setWorkStart(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300"
              />
            </div>
            <div className="space-y-2">
              <Label>نهاية وقت العمل</Label>
              <input
                type="time"
                value={workEnd}
                onChange={(e) => setWorkEnd(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300"
              />
            </div>
          </div>
          <div className="space-y-2 pt-2">
            <Label>الحجز المسبق بـ (أيام)</Label>
            <div className="flex items-center gap-3">
              <input type="range" min={1} max={60} value={advanceDays} onChange={(e) => setAdvanceDays(Number(e.target.value))} className="flex-1" />
              <span className="font-bold text-slate-900 text-sm w-16 text-center">{advanceDays} يوم</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <Shield className="w-5 h-5 text-[#00E5FF]" />
          <div>
            <CardTitle className="text-lg">الأتمتة والتأكيد</CardTitle>
            <CardDescription>تحديد آلية تأكيد الحجوزات</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Toggle value={autoConfirm} onChange={setAutoConfirm} label="تأكيد تلقائي للحجوزات" description="يتم تأكيد الحجوزات فور استلامها بدون مراجعة يدوية" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <Bell className="w-5 h-5 text-[#00E5FF]" />
          <div>
            <CardTitle className="text-lg">الإشعارات</CardTitle>
            <CardDescription>التحكم في تنبيهات الحجوزات</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Toggle value={notifyOwner} onChange={setNotifyOwner} label="إشعار صاحب المتجر" description="تلقي إشعار عند كل حجز جديد" />
          <Toggle value={notifyCustomer} onChange={setNotifyCustomer} label="إشعار العميل" description="إرسال تأكيد تلقائي للعميل بعد الحجز" />
        </CardContent>
      </Card>
    </div>
  );
}
