import React from 'react';
import { CalendarCheck, ChevronRight, Clock, ShoppingCart, Users } from 'lucide-react';

type Props = { n: any };

const ActivityItem: React.FC<Props> = ({ n }) => (
  <div className="flex items-center gap-6 flex-row-reverse group cursor-pointer">
    <div
      className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${
        n.type === 'sale'
          ? 'bg-green-50 text-green-500'
          : n.type === 'reservation'
            ? 'bg-amber-50 text-amber-500'
            : 'bg-cyan-50 text-cyan-500'
      }`}
    >
      {n.type === 'sale' ? (
        <ShoppingCart size={24} />
      ) : n.type === 'reservation' ? (
        <CalendarCheck size={24} />
      ) : (
        <Users size={24} />
      )}
    </div>
    <div className="flex-1 text-right">
      <p className="font-black text-base text-slate-800 mb-1 leading-tight">{n.title}</p>
      <div className="flex items-center justify-end gap-2 text-[11px] text-slate-400 font-black uppercase">
        <Clock size={12} /> {new Date(n.created_at).toLocaleTimeString('ar-EG')}
      </div>
    </div>
    <ChevronRight size={16} className="text-slate-200 rotate-180" />
  </div>
);

export default ActivityItem;
