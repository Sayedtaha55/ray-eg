import React from 'react';

type Props = {
  title: string;
  subtitle: string;
  pendingCount: number;
  completedCount: number;
  expiredCount: number;
  pendingLabel: string;
  completedLabel: string;
  rejectedLabel: string;
};

const ReservationsHeader: React.FC<Props> = ({
  title,
  subtitle,
  pendingCount,
  completedCount,
  expiredCount,
  pendingLabel,
  completedLabel,
  rejectedLabel,
}) => (
  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 flex-row-reverse">
    <div>
      <h3 className="text-2xl md:text-3xl font-black">{title}</h3>
      <p className="text-slate-400 font-black text-xs md:text-sm mt-2">{subtitle}</p>
    </div>
    <div className="flex items-center gap-2 flex-wrap justify-end">
      <span className="bg-amber-100 text-amber-600 px-4 md:px-6 py-1.5 md:py-2 rounded-full font-black text-[11px] md:text-xs uppercase tracking-normal md:tracking-widest whitespace-nowrap">
        {pendingCount} {pendingLabel}
      </span>
      <span className="bg-green-100 text-green-600 px-4 md:px-6 py-1.5 md:py-2 rounded-full font-black text-[11px] md:text-xs uppercase tracking-normal md:tracking-widest whitespace-nowrap">
        {completedCount} {completedLabel}
      </span>
      <span className="bg-red-100 text-red-600 px-4 md:px-6 py-1.5 md:py-2 rounded-full font-black text-[11px] md:text-xs uppercase tracking-normal md:tracking-widest whitespace-nowrap">
        {expiredCount} {rejectedLabel}
      </span>
    </div>
  </div>
);

export default ReservationsHeader;
