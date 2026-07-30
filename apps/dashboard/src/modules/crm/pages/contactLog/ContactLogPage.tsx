import React, { useState } from 'react';
import { Phone, Search, PhoneIncoming, PhoneOutgoing, PhoneMissed, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Props = { shopId: string; shop?: any };

type LogEntry = { id: string; customerName: string; phone: string; direction: 'incoming' | 'outgoing' | 'missed'; duration: string; date: string; notes: string };

const DIRECTION_ICONS: Record<string, React.ReactNode> = {
  incoming: <PhoneIncoming size={20} />, outgoing: <PhoneOutgoing size={20} />, missed: <PhoneMissed size={20} />,
};

const DIRECTION_STYLES: Record<string, { color: string; bg: string; ar: string; en: string }> = {
  incoming: { color: 'text-green-600', bg: 'bg-green-50', ar: 'واردة', en: 'Incoming' },
  outgoing: { color: 'text-blue-600', bg: 'bg-blue-50', ar: 'صادرة', en: 'Outgoing' },
  missed: { color: 'text-red-600', bg: 'bg-red-50', ar: 'فائتة', en: 'Missed' },
};

const ContactLogPage: React.FC<Props> = ({ shopId, shop }) => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const [search, setSearch] = useState('');
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: '1', customerName: 'Ahmed', phone: '01000000000', direction: 'incoming', duration: '5:30', date: '2026-07-28', notes: isArabic ? 'استفسار عن منتج' : 'Product inquiry' },
    { id: '2', customerName: 'Sara', phone: '01100000000', direction: 'outgoing', duration: '2:15', date: '2026-07-28', notes: isArabic ? 'متابعة طلب' : 'Order follow-up' },
    { id: '3', customerName: 'Omar', phone: '01200000000', direction: 'missed', duration: '0:00', date: '2026-07-27', notes: '' },
  ]);

  const filtered = logs.filter(l => l.customerName.toLowerCase().includes(search.toLowerCase()) || l.phone.includes(search));

  return (
    <div className="bg-white p-4 sm:p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm">
      <div className="mb-6"><h3 className="text-xl sm:text-2xl md:text-3xl font-black">{isArabic ? 'سجل التواصل' : 'Contact Log'}</h3><p className="mt-1 text-xs sm:text-sm font-bold text-slate-400">{isArabic ? 'سجل مكالمات وتواصل العملاء' : 'Customer call and contact history'}</p></div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: isArabic ? 'إجمالي المكالمات' : 'Total Calls', value: logs.length, color: 'bg-blue-50 text-blue-600' },
          { label: isArabic ? 'واردة' : 'Incoming', value: logs.filter(l => l.direction === 'incoming').length, color: 'bg-green-50 text-green-600' },
          { label: isArabic ? 'صادرة' : 'Outgoing', value: logs.filter(l => l.direction === 'outgoing').length, color: 'bg-blue-50 text-blue-600' },
          { label: isArabic ? 'فائتة' : 'Missed', value: logs.filter(l => l.direction === 'missed').length, color: 'bg-red-50 text-red-600' },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100">
            <div className={`p-2 rounded-xl ${s.color}`}><Phone size={20} /></div>
            <div><p className="text-xs font-bold text-slate-400">{s.label}</p><p className="text-lg font-black">{s.value}</p></div>
          </div>
        ))}
      </div>

      <div className="relative mb-4">
        <Search className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-300" size={18} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={isArabic ? 'بحث...' : 'Search...'} className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200" />
      </div>

      <div className="space-y-2">
        {filtered.map((l) => {
          const di = DIRECTION_STYLES[l.direction] || DIRECTION_STYLES.incoming;
          return (
            <div key={l.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${di.bg} ${di.color}`}>{DIRECTION_ICONS[l.direction]}</div>
                <div>
                  <p className="font-bold text-sm">{l.customerName} <span className="text-xs font-normal text-slate-400">{l.phone}</span></p>
                  <p className="text-xs text-slate-500">{l.notes || (isArabic ? 'لا ملاحظات' : 'No notes')} · {new Date(l.date).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">{l.direction !== 'missed' ? l.duration : '---'}</span>
                <span className={`px-2 py-1 rounded-lg text-xs font-bold ${di.bg} ${di.color}`}>{isArabic ? di.ar : di.en}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ContactLogPage;
