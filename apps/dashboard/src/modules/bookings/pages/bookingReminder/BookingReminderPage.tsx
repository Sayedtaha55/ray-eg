import React, { useState } from 'react';
import { BellRing, Search, Send, Clock, Calendar, Check, X, Bell } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Props = { shopId: string; shop?: any };

type Reminder = { id: string; customerName: string; service: string; date: string; time: string; channel: 'sms' | 'email' | 'push'; status: 'sent' | 'pending' | 'failed'; sentAt: string };

const CHANNEL_STYLES: Record<string, { ar: string; en: string; color: string; bg: string }> = {
  sms: { ar: 'رسالة', en: 'SMS', color: 'text-blue-600', bg: 'bg-blue-100' },
  email: { ar: 'بريد', en: 'Email', color: 'text-purple-600', bg: 'bg-purple-100' },
  push: { ar: 'إشعار', en: 'Push', color: 'text-amber-600', bg: 'bg-amber-100' },
};

const STATUS_STYLES: Record<string, { ar: string; en: string; color: string; bg: string }> = {
  sent: { ar: 'مرسل', en: 'Sent', color: 'text-green-600', bg: 'bg-green-100' },
  pending: { ar: 'قيد الانتظار', en: 'Pending', color: 'text-amber-600', bg: 'bg-amber-100' },
  failed: { ar: 'فشل', en: 'Failed', color: 'text-red-600', bg: 'bg-red-100' },
};

const BookingReminderPage: React.FC<Props> = ({ shopId, shop }) => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const [search, setSearch] = useState('');
  const [reminders, setReminders] = useState<Reminder[]>([
    { id: '1', customerName: 'Ahmed', service: isArabic ? 'كشف عام' : 'General checkup', date: '2026-07-30', time: '10:00', channel: 'sms', status: 'sent', sentAt: '2026-07-29' },
    { id: '2', customerName: 'Sara', service: isArabic ? 'استشارة' : 'Consultation', date: '2026-07-30', time: '11:30', channel: 'email', status: 'pending', sentAt: '' },
    { id: '3', customerName: 'Omar', service: isArabic ? 'متابعة' : 'Follow-up', date: '2026-07-31', time: '14:00', channel: 'push', status: 'failed', sentAt: '2026-07-30' },
  ]);

  const filtered = reminders.filter(r => r.customerName.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="bg-white p-4 sm:p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm">
      <div className="mb-6"><h3 className="text-xl sm:text-2xl md:text-3xl font-black">{isArabic ? 'تذكير الحجوزات' : 'Booking Reminders'}</h3><p className="mt-1 text-xs sm:text-sm font-bold text-slate-400">{isArabic ? 'تذكير العملاء بالمواعيد' : 'Remind customers of appointments'}</p></div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: isArabic ? 'إجمالي التذكيرات' : 'Total Reminders', value: reminders.length, color: 'bg-blue-50 text-blue-600' },
          { label: isArabic ? 'مرسلة' : 'Sent', value: reminders.filter(r => r.status === 'sent').length, color: 'bg-green-50 text-green-600' },
          { label: isArabic ? 'قيد الانتظار' : 'Pending', value: reminders.filter(r => r.status === 'pending').length, color: 'bg-amber-50 text-amber-600' },
          { label: isArabic ? 'فشل' : 'Failed', value: reminders.filter(r => r.status === 'failed').length, color: 'bg-red-50 text-red-600' },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100">
            <div className={`p-2 rounded-xl ${s.color}`}><BellRing size={20} /></div>
            <div><p className="text-xs font-bold text-slate-400">{s.label}</p><p className="text-lg font-black">{s.value}</p></div>
          </div>
        ))}
      </div>

      <div className="relative mb-4">
        <Search className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-300" size={18} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={isArabic ? 'بحث...' : 'Search...'} className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200" />
      </div>

      <div className="space-y-2">
        {filtered.map((r) => {
          const ch = CHANNEL_STYLES[r.channel] || CHANNEL_STYLES.sms;
          const st = STATUS_STYLES[r.status] || STATUS_STYLES.pending;
          return (
            <div key={r.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600"><Bell size={20} /></div>
                <div>
                  <p className="font-bold text-sm">{r.customerName} · {r.service}</p>
                  <p className="text-xs text-slate-400 flex items-center gap-2"><Calendar size={10} /> {new Date(r.date).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US')} <Clock size={10} /> {r.time}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-lg text-xs font-bold ${ch.bg} ${ch.color}`}>{isArabic ? ch.ar : ch.en}</span>
                <span className={`px-2 py-1 rounded-lg text-xs font-bold ${st.bg} ${st.color}`}>{isArabic ? st.ar : st.en}</span>
                {r.status === 'pending' && <button className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"><Send size={14} className="text-slate-600" /></button>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BookingReminderPage;
