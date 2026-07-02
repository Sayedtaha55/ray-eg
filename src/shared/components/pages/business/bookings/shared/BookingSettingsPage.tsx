/**
 * ═══════════════════════════════════════════
 * bookings/shared/BookingSettingsPage.tsx
 * صفحة إعدادات الحجوزات الحقيقية
 * ═══════════════════════════════════════════
 */
import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, Loader2, Check, Clock, Bell, Globe, Shield } from 'lucide-react';
import type { BookingActivityType } from '../config';
import { getVocabulary } from '../config';
import { ApiService } from '@/services/api.service';

type Props = {
  activityType: BookingActivityType;
  shop?: any;
};

const BookingSettingsPage: React.FC<Props> = ({ activityType, shop }) => {
  const vocab = getVocabulary(activityType);
  const effectiveShop = shop || (() => {
    try {
      return JSON.parse(localStorage.getItem('ray_last_shop') || '{}');
    } catch { return {}; }
  })();
  const pd = effectiveShop?.pageDesign || {};

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Settings state
  const [slotDuration, setSlotDuration] = useState<number>(pd.bookingSlotDuration || 30);
  const [advanceDays, setAdvanceDays] = useState<number>(pd.bookingAdvanceDays || 14);
  const [autoConfirm, setAutoConfirm] = useState<boolean>(pd.bookingAutoConfirm ?? false);
  const [notifyOwner, setNotifyOwner] = useState<boolean>(pd.bookingNotifyOwner ?? true);
  const [notifyCustomer, setNotifyCustomer] = useState<boolean>(pd.bookingNotifyCustomer ?? true);
  const [workingHoursStart, setWorkingHoursStart] = useState(pd.bookingWorkStart || '09:00');
  const [workingHoursEnd, setWorkingHoursEnd] = useState(pd.bookingWorkEnd || '21:00');
  const [maxBookingsPerSlot, setMaxBookingsPerSlot] = useState<number>(pd.bookingMaxPerSlot || 1);

  const handleSave = async () => {
    setSaving(true);
    try {
      await ApiService.updateMyShop({
        pageDesign: {
          ...pd,
          bookingSlotDuration: slotDuration,
          bookingAdvanceDays: advanceDays,
          bookingAutoConfirm: autoConfirm,
          bookingNotifyOwner: notifyOwner,
          bookingNotifyCustomer: notifyCustomer,
          bookingWorkStart: workingHoursStart,
          bookingWorkEnd: workingHoursEnd,
          bookingMaxPerSlot: maxBookingsPerSlot,
        },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch { /* silent */ }
    finally { setSaving(false); }
  };

  const Toggle = ({ value, onChange, label, description }: { value: boolean; onChange: (v: boolean) => void; label: string; description?: string }) => (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <div className="font-black text-sm text-slate-900">{label}</div>
        {description && <div className="text-xs text-slate-400 font-bold mt-0.5">{description}</div>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ${value ? 'bg-[#00E5FF]' : 'bg-slate-200'}`}
      >
        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${value ? 'right-0.5' : 'left-0.5'}`} />
      </button>
    </div>
  );

  return (
    <div className="space-y-5 text-right" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <SettingsIcon className="w-7 h-7 text-[#00E5FF]" />
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900">إعدادات {vocab.dashboardTitle}</h2>
          <p className="text-xs text-slate-400 font-bold mt-0.5">ضبط سلوك نظام الحجوزات</p>
        </div>
      </div>

      {/* Time & Schedule */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-4 h-4 text-[#00E5FF]" />
          <h3 className="font-black text-slate-900 text-sm">الجدول الزمني</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-black text-slate-600 mb-1.5">مدة كل موعد (دقيقة)</label>
            <select
              value={slotDuration}
              onChange={e => setSlotDuration(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300"
            >
              {[15, 20, 30, 45, 60, 90, 120].map(d => (
                <option key={d} value={d}>{d} دقيقة</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-black text-slate-600 mb-1.5">أقصى حجوزات في نفس الموعد</label>
            <input
              type="number"
              min={1}
              max={20}
              value={maxBookingsPerSlot}
              onChange={e => setMaxBookingsPerSlot(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300"
            />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-600 mb-1.5">بداية وقت العمل</label>
            <input
              type="time"
              value={workingHoursStart}
              onChange={e => setWorkingHoursStart(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300"
            />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-600 mb-1.5">نهاية وقت العمل</label>
            <input
              type="time"
              value={workingHoursEnd}
              onChange={e => setWorkingHoursEnd(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-black text-slate-600 mb-1.5">الحجز المسبق بـ (أيام)</label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={1}
                max={60}
                value={advanceDays}
                onChange={e => setAdvanceDays(Number(e.target.value))}
                className="flex-1"
              />
              <span className="font-black text-slate-900 text-sm w-16 text-center">{advanceDays} يوم</span>
            </div>
          </div>
        </div>
      </div>

      {/* Automation */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-4 h-4 text-[#00E5FF]" />
          <h3 className="font-black text-slate-900 text-sm">الأتمتة والتأكيد</h3>
        </div>
        <div className="divide-y divide-slate-50">
          <Toggle
            value={autoConfirm}
            onChange={setAutoConfirm}
            label="تأكيد تلقائي للحجوزات"
            description="يتم تأكيد الحجوزات فور استلامها بدون مراجعة"
          />
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-1">
          <Bell className="w-4 h-4 text-[#00E5FF]" />
          <h3 className="font-black text-slate-900 text-sm">الإشعارات</h3>
        </div>
        <div className="divide-y divide-slate-50">
          <Toggle
            value={notifyOwner}
            onChange={setNotifyOwner}
            label="إشعار صاحب المتجر"
            description="تلقي إشعار عند كل حجز جديد"
          />
          <Toggle
            value={notifyCustomer}
            onChange={setNotifyCustomer}
            label="إشعار العميل"
            description="إرسال تأكيد تلقائي للعميل بعد الحجز"
          />
        </div>
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-sm hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
        {saved ? 'تم حفظ الإعدادات ✓' : saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
      </button>
    </div>
  );
};

export default BookingSettingsPage;