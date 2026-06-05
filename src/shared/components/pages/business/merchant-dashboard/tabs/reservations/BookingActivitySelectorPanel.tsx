import React from 'react';
import { Loader2 } from 'lucide-react';
import { BOOKING_ACTIVITY_DEFINITIONS, BookingActivityType, getBookingRouteFromActivityType } from '@/components/pages/business/clinic/bookingActivityConfig';

type Props = {
  activeRoute: string;
  savingActivity: string;
  saveError: string;
  onSelectActivity: (activityId: BookingActivityType) => void;
};

const BookingActivitySelectorPanel: React.FC<Props> = ({ activeRoute, savingActivity, saveError, onSelectActivity }) => (
  <div className="rounded-[2rem] border border-slate-100 bg-white p-5 text-right shadow-sm">
    <div className="text-sm font-black text-slate-900">اختر نشاط الحجوزات</div>
    <p className="mt-1 text-xs font-bold text-slate-400 leading-6">
      بعد اختيار النشاط تظهر أزراره الخاصة بين حجوزات والتصميم بدون تكرار لوحة حجوزات منفصلة.
    </p>
    {saveError && (
      <div className="mt-4 rounded-2xl bg-amber-50 border border-amber-100 px-4 py-3 text-[11px] font-black text-amber-700">
        ⚠️ {saveError}
      </div>
    )}
    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
      {BOOKING_ACTIVITY_DEFINITIONS.map((activity) => {
        const route = getBookingRouteFromActivityType(activity.id);
        return (
          <button
            key={activity.id}
            type="button"
            disabled={Boolean(savingActivity)}
            onClick={() => onSelectActivity(activity.id)}
            className={`rounded-2xl px-3 py-3 text-[11px] font-black border transition-all inline-flex items-center justify-center gap-1.5 ${route === activeRoute ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-50 text-slate-700 border-slate-100 hover:bg-emerald-50 hover:border-emerald-200'}`}
          >
            {savingActivity === activity.id && <Loader2 size={12} className="animate-spin" />}
            {activity.title}
          </button>
        );
      })}
    </div>
  </div>
);

export default BookingActivitySelectorPanel;
