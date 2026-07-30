import React, { useState } from 'react';
import { XCircle, Search, Calendar, Clock, User, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Props = { shopId: string; shop?: any };

type CancelledBooking = { id: string; customerName: string; service: string; date: string; time: string; reason: string; cancelledAt: string };

const BookingCancelPage: React.FC<Props> = ({ shopId, shop }) => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const [search, setSearch] = useState('');
  const [bookings, setBookings] = useState<CancelledBooking[]>([
    { id: '1', customerName: 'Ahmed', service: isArabic ? 'كشف عام' : 'General checkup', date: '2026-07-28', time: '10:00', reason: isArabic ? 'ظرف طارئ' : 'Emergency', cancelledAt: '2026-07-27' },
    { id: '2', customerName: 'Sara', service: isArabic ? 'استشارة' : 'Consultation', date: '2026-07-25', time: '14:00', reason: isArabic ? 'تعارض موعد' : 'Schedule conflict', cancelledAt: '2026-07-24' },
  ]);

  const filtered = bookings.filter(b => b.customerName.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="bg-white p-4 sm:p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm">
      <div className="mb-6"><h3 className="text-xl sm:text-2xl md:text-3xl font-black">{isArabic ? 'إلغاء الحجوزات' : 'Booking Cancellations'}</h3><p className="mt-1 text-xs sm:text-sm font-bold text-slate-400">{isArabic ? 'الحجوزات الملغية' : 'Cancelled bookings'}</p></div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: isArabic ? 'إجمالي الإلغاءات' : 'Total Cancellations', value: bookings.length, color: 'bg-red-50 text-red-600' },
          { label: isArabic ? 'هذا الأسبوع' : 'This Week', value: bookings.filter(b => { const d = new Date(b.cancelledAt); const w = new Date(); return d > new Date(w.getTime() - 7 * 86400000); }).length, color: 'bg-amber-50 text-amber-600' },
          { label: isArabic ? 'معدل الإلغاء' : 'Cancel Rate', value: '5%', color: 'bg-blue-50 text-blue-600' },
          { label: isArabic ? 'أسباب مختلفة' : 'Different Reasons', value: new Set(bookings.map(b => b.reason)).size, color: 'bg-purple-50 text-purple-600' },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100">
            <div className={`p-2 rounded-xl ${s.color}`}><XCircle size={20} /></div>
            <div><p className="text-xs font-bold text-slate-400">{s.label}</p><p className="text-lg font-black">{s.value}</p></div>
          </div>
        ))}
      </div>

      <div className="relative mb-4">
        <Search className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-300" size={18} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={isArabic ? 'بحث...' : 'Search...'} className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200" />
      </div>

      <div className="space-y-2">
        {filtered.map((b) => (
          <div key={b.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-red-50 text-red-600"><XCircle size={20} /></div>
              <div>
                <p className="font-bold text-sm">{b.customerName} · {b.service}</p>
                <p className="text-xs text-slate-400 flex items-center gap-2"><Calendar size={10} /> {new Date(b.date).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US')} <Clock size={10} /> {b.time}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right"><p className="text-xs text-slate-400">{isArabic ? 'السبب' : 'Reason'}</p><p className="text-sm font-bold text-slate-600">{b.reason}</p></div>
              <button className="px-3 py-1.5 rounded-lg bg-blue-100 text-blue-600 text-xs font-bold hover:bg-blue-200 transition-colors flex items-center gap-1"><RotateCcw size={14} /> {isArabic ? 'إعادة' : 'Restore'}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookingCancelPage;
