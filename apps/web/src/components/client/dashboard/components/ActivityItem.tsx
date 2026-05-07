'use client';

import React from 'react';
import { Bell, ShoppingBag, User, Star } from 'lucide-react';

const ActivityItem: React.FC<{ n: any }> = ({ n }) => {
  const getIcon = () => {
    switch (n.type) {
      case 'ORDER': return <ShoppingBag size={18} />;
      case 'CUSTOMER': return <User size={18} />;
      case 'REVIEW': return <Star size={18} />;
      default: return <Bell size={18} />;
    }
  };

  return (
    <div className="flex items-center gap-4 flex-row-reverse">
      <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
        {getIcon()}
      </div>
      <div className="flex-1 text-right">
        <div className="text-sm font-black text-slate-900">{n.title}</div>
        <div className="text-xs font-bold text-slate-400">{n.content}</div>
      </div>
    </div>
  );
};

export default ActivityItem;
