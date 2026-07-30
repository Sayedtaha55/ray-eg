import React, { useState } from 'react';
import { CheckCircle2, Search, X, Clock, User, Calendar, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Props = { shopId: string; shop?: any };

type PendingBooking = { id: string; customerName: string; service: string; date: string; time: string; phone: string; waitingSince: string };

const BookingConfirmPage: React.FC<Props> = ({ shopId, shop }) => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const [search, setSearch] = useState('');
  const [bookings, setBookings] = useState<PendingBooking[]>([
    { id: '1', customerName: 'Ahmed', service: isArabic ? 'كشف عام' : 'General checkup', date: '2026-07-30', time: '10:00', phone: '01000000000', waitingSince: '5 min' },
    { id: '2', customerName: 'Sara', service: isArabic ? 'استشارة' : 'Consultation', date: '2026-07-30', time: '11:30', phone: '01100000000', waitingSince: '12 min' },
    { id: '3', customerName: 'Omar', service: isArabic ? 'متابعة' : 'Follow-up', date: '2026-07-31', time: '14:00', phone: '01200000000', waitingSince: '2 min' },
  ]);

  const filtered = bookings.filter(b => b.customerName.toLowerCase().includes(search.toLowerCase()));

  const confirm = (id: string) => setBookings(prev => prev.filter(b => b.id !== id));
  const reject = (id: string) => setBookings(prev => prev.filter(b => b.id !== id));

  return (
    <div className="bg-white p-4 sm:p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm">
      <div className="mb-6"><h3 className="text-xl sm:text-2xl md:text-3xl font-black">{isArabic ? 'تأكيد الحجوزات' : 'Booking Confirmation'}</h3><p className="mt-1 text-xs sm:text-sm font-bold text-slate-400">{isArabic ? 'تأكيد أو رفض الحجوزات المعلقة' : 'Confirm or reject pending bookings'}</p></div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: isArabic ? 'قيد الانتظار' : 'Pending', value: bookings.length, color: 'bg-amber-50 text-amber-600' },
          { label: isArabic ? 'تم التأكيد' : 'Confirmed', value: 0, color: 'bg-green-50 text-green-600' },
          { label: isArabic ? 'متوسط الانتظار' : 'Avg Wait', value: bookings.length ? Math.round(bookings.reduce((s, b) => s + parseInt(b.waitingSince), 0) / bookings.length) + ' min' : '0 min', color: 'bg-blue-50 text-blue-600' },
          { label: isArabic ? 'عاجلة' : 'Urgent', value: bookings.filter(b => parseInt(b.waitingSince) > 10).length, color: 'bg-red-50 text-red-600' },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100">
            <div className={`p-2 rounded-xl ${s.color}`}><CheckCircle2 size={20} /></div>
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
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600"><Clock size={20} /></div>
              <div>
                <p className="font-bold text-sm">{b.customerName} · {b.service}</p>
                <p className="text-xs text-slate-400 flex items-center gap-2"><Calendar size={10} /> {new Date(b.date).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US')} <Clock size={10} /> {b.time} <User size={10} /> {b.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-amber-500 font-bold">{b.waitingSince}</span>
              <button onClick={() => confirm(b.id)} className="px-3 py-1.5 rounded-lg bg-green-100 text-green-600 text-xs font-bold hover:bg-green-200 transition-colors flex items-center gap-1"><Check size={14} /> {isArabic ? 'تأكيد' : 'Confirm'}</button>
              <button onClick={() => reject(b.id)} className="px-3 py-1.5 rounded-lg bg-red-100 text-red-600 text-xs font-bold hover:bg-red-200 transition-colors"><X size={14} /></button>
            </div>
          </div>
        ))}
        {bookings.length === 0 && <div className="text-center py-12 text-slate-400 text-sm">{isArabic ? 'لا توجد حجوزات معلقة' : 'No pending bookings'}</div>}
      </div>
    </div>
  );
};

export default BookingConfirmPage;
