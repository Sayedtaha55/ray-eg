'use client';

import { useState } from 'react';
import {
  Globe, ShieldCheck, Bell, CreditCard, XCircle, Lock,
  Settings as SettingsIcon, Check,
} from 'lucide-react';

const SETTINGS_TABS = [
  { id: 'booking-site', label: 'الموقع العام للحجوزات', icon: Globe },
  { id: 'booking-security', label: 'الأمان والصلاحيات', icon: ShieldCheck },
  { id: 'booking-notifications', label: 'إشعارات وتأكيدات', icon: Bell },
  { id: 'booking-payments', label: 'مدفوعات وتأمين', icon: CreditCard },
  { id: 'booking-cancellation', label: 'سياسات الإلغاء', icon: XCircle },
  { id: 'booking-privacy', label: 'الخصوصية وبيانات العملاء', icon: Lock },
] as const;

type TabId = typeof SETTINGS_TABS[number]['id'];

export default function BookingsSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('booking-site');

  return (
    <div className="p-4 sm:p-6 md:p-8" dir="rtl">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center">
            <SettingsIcon size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">إعدادات الحجوزات</h1>
            <p className="text-sm font-bold text-slate-400">تخصيص نظام الحجوزات والتحكم الكامل في الإعدادات</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-6">
          {SETTINGS_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                  isActive
                    ? 'border-slate-900 bg-slate-50'
                    : 'border-slate-100 bg-white hover:border-slate-200'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  isActive ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-400'
                }`}>
                  <Icon size={20} />
                </div>
                <span className={`text-[10px] font-black text-center leading-tight ${
                  isActive ? 'text-slate-900' : 'text-slate-400'
                }`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8">
          {activeTab === 'booking-site' && <BookingSiteSettings />}
          {activeTab === 'booking-security' && <BookingSecuritySettings />}
          {activeTab === 'booking-notifications' && <BookingNotificationsSettings />}
          {activeTab === 'booking-payments' && <BookingPaymentsSettings />}
          {activeTab === 'booking-cancellation' && <BookingCancellationSettings />}
          {activeTab === 'booking-privacy' && <BookingPrivacySettings />}
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-black text-slate-900 mb-1">{title}</h2>
      <p className="text-sm font-bold text-slate-400">{desc}</p>
    </div>
  );
}

function ToggleRow({ title, desc, defaultOn }: { title: string; desc: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(!!defaultOn);
  return (
    <div className="flex items-center justify-between py-4 border-b border-slate-50 last:border-0">
      <div className="flex-1">
        <div className="text-sm font-black text-slate-800">{title}</div>
        <div className="text-xs font-bold text-slate-400 mt-0.5">{desc}</div>
      </div>
      <button
        onClick={() => setOn(!on)}
        className={`w-12 h-7 rounded-full transition-all relative shrink-0 ${
          on ? 'bg-emerald-500' : 'bg-slate-200'
        }`}
      >
        <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-all ${
          on ? 'right-1' : 'right-6'
        }`} />
      </button>
    </div>
  );
}

function InputRow({ label, placeholder, type }: { label: string; placeholder: string; type?: string }) {
  return (
    <div className="py-4 border-b border-slate-50 last:border-0">
      <label className="text-sm font-black text-slate-800 block mb-2">{label}</label>
      <input
        type={type || 'text'}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 focus:outline-none focus:border-slate-400"
      />
    </div>
  );
}

function BookingSiteSettings() {
  return (
    <div>
      <SectionTitle title="الموقع العام للحجوزات" desc="إعدادات الصفحة العامة التي يراها العملاء عند الحجز" />
      <InputRow label="اسم النشاط" placeholder="مثال: عيادة الدكتور أحمد" />
      <InputRow label="رقم التواصل" placeholder="مثال: 05xxxxxxxx" type="tel" />
      <InputRow label="عنوان الموقع" placeholder="مثال: الرياض، حي العليا" />
      <InputRow label="رابط الحجز المخصص" placeholder="mnmknk.com/booking/your-store" />
      <ToggleRow title="تفعيل الصفحة العامة" desc="إتاحة الحجز للعملاء عبر رابط عام" defaultOn />
      <ToggleRow title="إظهار الأسعار" desc="عرض أسعار الخدمات في الصفحة العامة" defaultOn />
      <ToggleRow title="إظهار أوقات التوفر" desc="عرض المواعيد المتاحة للعملاء" defaultOn />
    </div>
  );
}

function BookingSecuritySettings() {
  return (
    <div>
      <SectionTitle title="الأمان والصلاحيات" desc="تحكم في وصول الموظفين وإدارة الحجوزات" />
      <ToggleRow title="تأكيد الحجز يدوياً" desc="يتطلب موافقة المسؤول قبل تأكيد أي حجز" defaultOn />
      <ToggleRow title="منع الحجز المكرر" desc="منع نفس العميل من حجز أكثر من موعد في نفس الوقت" defaultOn />
      <ToggleRow title="تحقق رقم الهاتف" desc="إرسال رمز تحقق عبر SMS قبل تأكيد الحجز" />
      <ToggleRow title="تقييد الحجز بالعملاء المسجلين" desc="السماح بالحجز للعملاء المسجلين فقط" />
      <ToggleRow title="حد أقصى للحجوزات اليومية" desc="تحديد عدد الحجوزات المسموح به في اليوم" />
    </div>
  );
}

function BookingNotificationsSettings() {
  return (
    <div>
      <SectionTitle title="إشعارات وتأكيدات" desc="إعدادات إشعارات الحجز للعملاء والمسؤولين" />
      <ToggleRow title="إشعار تأكيد الحجز" desc="إرسال رسالة تأكيد للعميل بعد الحجز" defaultOn />
      <ToggleRow title="تذكير قبل الموعد" desc="إرسال تذكير للعميل قبل الموعد بساعة" defaultOn />
      <ToggleRow title="إشعار الإلغاء" desc="إشعار المسؤول عند إلغاء حجز" defaultOn />
      <ToggleRow title="إشعار حجز جديد" desc="إشعار المسؤول فور وصول حجز جديد" defaultOn />
      <ToggleRow title="إشعار عبر SMS" desc="إرسال الإشعارات عبر رسائل نصية" />
      <ToggleRow title="إشعار عبر WhatsApp" desc="إرسال الإشعارات عبر واتساب" />
      <ToggleRow title="إشعار عبر البريد الإلكتروني" desc="إرسال الإشعارات عبر البريد الإلكتروني" defaultOn />
    </div>
  );
}

function BookingPaymentsSettings() {
  return (
    <div>
      <SectionTitle title="مدفوعات وتأمين" desc="إعدادات الدفع والتأمين على الحجوزات" />
      <ToggleRow title="تفعيل الدفع الإلكتروني" desc="السماح للعملاء بالدفع عبر الإنترنت" />
      <ToggleRow title="دفع مقدم" desc="طلب دفع مقدم لتأكيد الحجز" />
      <ToggleRow title="تأمين الحجز" desc="خصم مبلغ تأمين قابل للاسترداد" />
      <ToggleRow title="الدفع عند الاستلام" desc="السماح بالدفع حضورياً" defaultOn />
      <ToggleRow title="استرداد تلقائي" desc="استرداد المبلغ تلقائياً عند الإلغاء" />
      <InputRow label="نسبة المقدم (%)" placeholder="مثال: 30" type="number" />
    </div>
  );
}

function BookingCancellationSettings() {
  return (
    <div>
      <SectionTitle title="سياسات الإلغاء" desc="قواعد إلغاء الحجوزات والاسترداد" />
      <ToggleRow title="السماح بالإلغاء" desc="السماح للعملاء بإلغاء حجوزاتهم" defaultOn />
      <ToggleRow title="إلغاء مجاني" desc="إلغاء بدون رسوم" />
      <InputRow label="مهلة الإلغاء المجاني (ساعات)" placeholder="مثال: 24" type="number" />
      <InputRow label="رسوم الإلغاء المتأخر (%)" placeholder="مثال: 50" type="number" />
      <ToggleRow title="منع الإلغاء يوم الحجز" desc="لا يمكن إلغاء الحجز في يوم الموعد" />
      <ToggleRow title="إلغاء تلقائي للحجوزات غير المؤكدة" desc="إلغاء الحجوزات غير المؤكدة بعد فترة محددة" defaultOn />
    </div>
  );
}

function BookingPrivacySettings() {
  return (
    <div>
      <SectionTitle title="الخصوصية وبيانات العملاء" desc="حماية بيانات العملاء وخصوصية الحجوزات" />
      <ToggleRow title="إخفاء بيانات العميل" desc="إخفاء رقم الهاتف والبريد عن الموظفين" />
      <ToggleRow title="حفظ سجل الحجوزات" desc="الاحتفاظ بسجل كامل للحجوزات للمراجعة" defaultOn />
      <ToggleRow title="مشاركة البيانات مع طرف ثالث" desc="السماح بمشاركة بيانات الحجز مع خدمات خارجية" />
      <ToggleRow title="طلب موافقة الخصوصية" desc="طلب موافقة العميل على سياسة الخصوصية قبل الحجز" defaultOn />
      <ToggleRow title="حذف البيانات تلقائياً" desc="حذف بيانات الحجوزات القديمة تلقائياً" />
      <InputRow label="مدة حفظ البيانات (أشهر)" placeholder="مثال: 12" type="number" />
    </div>
  );
}
