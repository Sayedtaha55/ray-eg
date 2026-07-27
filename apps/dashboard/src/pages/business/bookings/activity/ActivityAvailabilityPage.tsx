/**
 * ═══════════════════════════════════════════
 * activity/ActivityAvailabilityPage.tsx
 * إدارة التوافر الليلي / اليومي
 * يُستخدم في: فنادق وغرف
 * ═══════════════════════════════════════════
 */
import React, { useState } from 'react';
import { Moon, Calendar, ChevronRight, ChevronLeft, CheckCircle2, XCircle, MinusCircle } from 'lucide-react';
import type { BookingActivityType } from '../config';
import { useTranslation } from 'react-i18next';

type Props = { activityType: BookingActivityType };

const DAYS_AR = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
const DAYS_EN = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const MONTHS_AR = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
const MONTHS_EN = ['January','February','March','April','May','June','July','August','September','October','November','December'];

type DayStatus = 'available' | 'booked' | 'blocked';

const ActivityAvailabilityPage: React.FC<Props> = ({ activityType }) => {
  const { i18n } = useTranslation();
  const isEn = String(i18n.language || '').toLowerCase().startsWith('en');
  const DAYS = isEn ? DAYS_EN : DAYS_AR;
  const MONTHS = isEn ? MONTHS_EN : MONTHS_AR;
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [statuses, setStatuses] = useState<Record<string, DayStatus>>({});

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  // Adjust so Saturday = 0
  const offset = (firstDay + 1) % 7;

  const getKey = (day: number) => `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const getStatus = (day: number): DayStatus => statuses[getKey(day)] || 'available';

  const cycleStatus = (day: number) => {
    const key = getKey(day);
    const order: DayStatus[] = ['available', 'booked', 'blocked'];
    const cur = statuses[key] || 'available';
    const next = order[(order.indexOf(cur) + 1) % order.length];
    setStatuses(prev => ({ ...prev, [key]: next }));
  };

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const statusStyle: Record<DayStatus, { bg: string; text: string; icon: React.ReactNode }> = {
    available: { bg: 'bg-emerald-50 hover:bg-emerald-100', text: 'text-emerald-700', icon: <CheckCircle2 size={10} /> },
    booked:    { bg: 'bg-amber-50 hover:bg-amber-100',    text: 'text-amber-700',   icon: <MinusCircle size={10} /> },
    blocked:   { bg: 'bg-red-50 hover:bg-red-100',        text: 'text-red-700',      icon: <XCircle size={10} /> },
  };

  const counts = {
    available: Array.from({ length: daysInMonth }, (_, i) => getStatus(i + 1)).filter(s => s === 'available').length,
    booked: Array.from({ length: daysInMonth }, (_, i) => getStatus(i + 1)).filter(s => s === 'booked').length,
    blocked: Array.from({ length: daysInMonth }, (_, i) => getStatus(i + 1)).filter(s => s === 'blocked').length,
  };

  return (
    <div className="space-y-5 text-right" dir={isEn ? 'ltr' : 'rtl'}>
      <div className="flex items-center justify-between flex-row-reverse">
        <div className="flex items-center gap-3">
          <Moon className="w-7 h-7 text-[#00E5FF]" />
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900">{isEn ? 'Nightly Availability' : 'التوافر الليلي'}</h2>
            <p className="text-xs text-slate-400 font-bold mt-0.5">{isEn ? 'Click on a day to change its status' : 'اضغط على اليوم لتغيير حالته'}</p>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-emerald-50 rounded-2xl p-4 text-center">
          <div className="text-2xl font-black text-emerald-700">{counts.available}</div>
          <div className="text-xs font-bold text-emerald-600 mt-1">{isEn ? 'Available' : 'متاح'}</div>
        </div>
        <div className="bg-amber-50 rounded-2xl p-4 text-center">
          <div className="text-2xl font-black text-amber-700">{counts.booked}</div>
          <div className="text-xs font-bold text-amber-600 mt-1">{isEn ? 'Booked' : 'محجوز'}</div>
        </div>
        <div className="bg-red-50 rounded-2xl p-4 text-center">
          <div className="text-2xl font-black text-red-700">{counts.blocked}</div>
          <div className="text-xs font-bold text-red-600 mt-1">{isEn ? 'Blocked' : 'مغلق'}</div>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <button type="button" onClick={nextMonth} title={isEn ? 'Next month' : 'الشهر التالي'} className="p-2 rounded-xl hover:bg-slate-50"><ChevronLeft size={18} /></button>
          <h3 className="font-black text-slate-900 text-lg">{MONTHS[month]} {year}</h3>
          <button type="button" onClick={prevMonth} title={isEn ? 'Previous month' : 'الشهر السابق'} className="p-2 rounded-xl hover:bg-slate-50"><ChevronRight size={18} /></button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {DAYS.map(d => <div key={d} className="text-center text-[10px] font-black text-slate-400 py-1">{d}</div>)}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: offset }, (_, i) => <div key={`e${i}`} />)}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const st = getStatus(day);
            const style = statusStyle[st];
            const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
            return (
              <button key={day} type="button" onClick={() => cycleStatus(day)} title={`${day} ${MONTHS[month]}`}
                className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${style.bg} ${isToday ? 'ring-2 ring-cyan-400' : ''}`}>
                <span className={`text-sm font-black ${style.text}`}>{day}</span>
                <span className={style.text}>{style.icon}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-4 justify-center mt-4 text-xs font-bold text-slate-500">
          <span className="flex items-center gap-1"><CheckCircle2 size={12} className="text-emerald-500" /> {isEn ? 'Available' : 'متاح'}</span>
          <span className="flex items-center gap-1"><MinusCircle size={12} className="text-amber-500" /> {isEn ? 'Booked' : 'محجوز'}</span>
          <span className="flex items-center gap-1"><XCircle size={12} className="text-red-500" /> {isEn ? 'Blocked' : 'مغلق'}</span>
        </div>
      </div>
    </div>
  );
};

export default ActivityAvailabilityPage;
