import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { ReadinessItem } from './types';

type Props = {
  activityTitle: string;
  readinessItems: ReadinessItem[];
  readinessPercent: number;
  navigate: (path: string) => void;
};

const BookingLaunchReadinessPanel: React.FC<Props> = ({ activityTitle, readinessItems, readinessPercent, navigate }) => (
  <div className="mb-8 rounded-[2rem] border border-slate-100 bg-slate-50/60 p-5 text-right" dir="rtl">
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <div>
        <div className="text-sm font-black text-slate-900">جاهزية نشاط {activityTitle} قبل الإطلاق</div>
        <p className="mt-1 text-xs font-bold text-slate-400 leading-6">راجع العناصر الناقصة بسرعة قبل فتح الحجوزات للعملاء.</p>
      </div>
      <div className="h-14 w-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-sm font-black text-emerald-700">
        {readinessPercent}%
      </div>
    </div>
    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {readinessItems.map((item) => (
        <div key={item.label} className="rounded-2xl bg-white border border-slate-100 px-4 py-3 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-black text-slate-700">{item.label}</span>
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black ${item.done ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
              {item.done && <CheckCircle2 size={12} />}
              {item.value}
            </span>
          </div>
          {!item.done && (
            <button
              type="button"
              onClick={() => navigate(item.actionPath)}
              className="w-full rounded-xl bg-slate-900 px-3 py-2 text-[10px] font-black text-white hover:bg-black transition-all"
            >
              {item.actionLabel}
            </button>
          )}
        </div>
      ))}
    </div>
  </div>
);

export default BookingLaunchReadinessPanel;
