import React from 'react';
import { CalendarCheck, Clock, Palette, Settings } from 'lucide-react';

type Props = {
  bookingRoute: string;
  navigate: (path: string) => void;
};

const BookingCoreActionsPanel: React.FC<Props> = ({ bookingRoute, navigate }) => (
  <div className="rounded-[2rem] border border-emerald-100 bg-emerald-50/60 p-5 text-right">
    <div className="text-sm font-black text-emerald-900">الهيكل الأساسي للحجوزات</div>
    <p className="mt-1 text-xs font-bold text-emerald-700/80 leading-6">
      زر حجوزات يعرض الأزرار الأساسية فقط: النظرة العامة، الحجوزات، التصميم، والإعدادات.
    </p>
    <div className="mt-4 grid grid-cols-2 gap-3">
      <button type="button" onClick={() => navigate(`/business/${bookingRoute}/overview`)} className="rounded-2xl bg-white px-4 py-3 text-xs font-black text-slate-800 border border-emerald-100 hover:border-emerald-300 transition-all flex items-center justify-center gap-2">
        <CalendarCheck size={15} /> نظرة عامة الحجوزات
      </button>
      <button type="button" onClick={() => navigate(`/business/${bookingRoute}/bookings`)} className="rounded-2xl bg-white px-4 py-3 text-xs font-black text-slate-800 border border-emerald-100 hover:border-emerald-300 transition-all flex items-center justify-center gap-2">
        <Clock size={15} /> حجوزات
      </button>
      <button type="button" onClick={() => navigate(`/business/${bookingRoute}/design`)} className="rounded-2xl bg-white px-4 py-3 text-xs font-black text-slate-800 border border-emerald-100 hover:border-emerald-300 transition-all flex items-center justify-center gap-2">
        <Palette size={15} /> التصميم
      </button>
      <button type="button" onClick={() => navigate(`/business/${bookingRoute}/settings`)} className="rounded-2xl bg-white px-4 py-3 text-xs font-black text-slate-800 border border-emerald-100 hover:border-emerald-300 transition-all flex items-center justify-center gap-2">
        <Settings size={15} /> الإعدادات
      </button>
    </div>
  </div>
);

export default BookingCoreActionsPanel;
