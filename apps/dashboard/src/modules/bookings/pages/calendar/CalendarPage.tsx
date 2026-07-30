import React, { useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Props = { shopId: string; shop?: any };

type Booking = { id: string; customerName: string; service: string; date: string; time: string; status: 'confirmed' | 'pending' | 'cancelled' };

const CalendarPage: React.FC<Props> = ({ shopId, shop }) => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 6, 1));

  const [bookings] = useState<Booking[]>([
    { id: '1', customerName: 'Ahmed', service: isArabic ? 'كشف' : 'Checkup', date: '2026-07-28', time: '10:00', status: 'confirmed' },
    { id: '2', customerName: 'Sara', service: isArabic ? 'استشارة' : 'Consultation', date: '2026-07-28', time: '14:00', status: 'pending' },
    { id: '3', customerName: 'Omar', service: isArabic ? 'متابعة' : 'Follow-up', date: '2026-07-15', time: '11:00', status: 'confirmed' },
  ]);

  const monthName = currentMonth.toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', { month: 'long', year: 'numeric' });
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const getBookingsForDay = (day: number) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return bookings.filter(b => b.date === dateStr);
  };

  const weekDays = isArabic ? ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white p-4 sm:p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div><h3 className="text-xl sm:text-2xl md:text-3xl font-black">{isArabic ? 'التقويم' : 'Calendar'}</h3><p className="mt-1 text-xs sm:text-sm font-bold text-slate-400">{isArabic ? 'عرض الحجوزات على التقويم' : 'View bookings on calendar'}</p></div>
        <div className="flex items-center gap-2">
          <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="p-2 rounded-xl hover:bg-slate-100 transition-colors"><ChevronLeft size={20} /></button>
          <span className="font-bold text-sm min-w-[120px] text-center">{monthName}</span>
          <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="p-2 rounded-xl hover:bg-slate-100 transition-colors"><ChevronRight size={20} /></button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(d => <div key={d} className="text-center text-xs font-bold text-slate-400 py-2">{d}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dayBookings = getBookingsForDay(day);
          return (
            <div key={day} className={`min-h-[80px] p-2 rounded-xl border ${dayBookings.length > 0 ? 'border-blue-200 bg-blue-50/30' : 'border-slate-100'}`}>
              <p className="text-xs font-bold text-slate-600 mb-1">{day}</p>
              {dayBookings.map(b => (
                <div key={b.id} className={`text-xs px-2 py-1 rounded-lg mb-1 ${b.status === 'confirmed' ? 'bg-green-100 text-green-600' : b.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'}`}>
                  <Clock size={8} className="inline mr-1" />{b.time} {b.customerName}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarPage;
