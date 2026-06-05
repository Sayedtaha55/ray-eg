import React from 'react';
import { ReservationFilter } from './types';

type Props = {
  filter: ReservationFilter;
  counts: { pending: number; completed: number; expired: number; all: number };
  labels: {
    pending: string;
    completed: string;
    expired: string;
    all: string;
  };
  onChange: (filter: ReservationFilter) => void;
};

const ReservationFilterTabs: React.FC<Props> = ({ filter, counts, labels, onChange }) => {
  const tabs: Array<{ id: ReservationFilter; label: string; count: number; activeClass: string }> = [
    { id: 'pending', label: labels.pending, count: counts.pending, activeClass: 'bg-amber-500 text-white shadow-lg' },
    { id: 'completed', label: labels.completed, count: counts.completed, activeClass: 'bg-green-500 text-white shadow-lg' },
    { id: 'expired', label: labels.expired, count: counts.expired, activeClass: 'bg-red-500 text-white shadow-lg' },
    { id: 'all', label: labels.all, count: counts.all, activeClass: 'bg-slate-900 text-white shadow-lg' },
  ];

  return (
    <div className="flex gap-2 mb-8 bg-slate-50 p-1 rounded-2xl w-full overflow-x-auto no-scrollbar">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-4 md:px-6 py-2 md:py-3 rounded-xl font-black text-[12px] md:text-sm transition-all whitespace-nowrap ${
            filter === tab.id ? tab.activeClass : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          {tab.label} ({tab.count})
        </button>
      ))}
    </div>
  );
};

export default ReservationFilterTabs;
