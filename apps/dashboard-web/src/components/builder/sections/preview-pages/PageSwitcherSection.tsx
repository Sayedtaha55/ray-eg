'use client';

import React from 'react';
import { Home, ShoppingBag, Rocket, Stethoscope, Check } from 'lucide-react';

interface PageSwitcherSectionProps {
  currentValue: string;
  onChange: (value: string) => void;
}

const PAGES = [
  { id: 'home', label: 'الرئيسية', icon: Home, color: 'text-sky-500', bg: 'bg-sky-50' },
  { id: 'products', label: 'المنتجات', icon: ShoppingBag, color: 'text-amber-500', bg: 'bg-amber-50' },
  { id: 'landing', label: 'صفحة الهبوط', icon: Rocket, color: 'text-rose-500', bg: 'bg-rose-50' },
  { id: 'clinic', label: 'العيادة', icon: Stethoscope, color: 'text-emerald-500', bg: 'bg-emerald-50' },
];

export default function PageSwitcherSection({ currentValue, onChange }: PageSwitcherSectionProps) {
  return (
    <div className="space-y-4">
      <p className="text-xs font-bold text-slate-500 leading-relaxed">
        اختر الصفحة التي تريد معاينتها وتعديلها الآن.
      </p>
      
      <div className="grid grid-cols-1 gap-2">
        {PAGES.map((page) => {
          const Icon = page.icon;
          const isActive = currentValue === page.id;
          
          return (
            <button
              key={page.id}
              onClick={() => onChange(page.id)}
              className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all active:scale-[0.98] ${
                isActive 
                  ? 'border-brand-cyan bg-brand-cyan/5 shadow-sm' 
                  : 'border-slate-100 bg-white hover:border-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${isActive ? 'bg-brand-cyan text-white' : page.bg + ' ' + page.color}`}>
                  <Icon size={20} />
                </div>
                <div className="text-right">
                  <span className={`block text-sm font-black ${isActive ? 'text-slate-900' : 'text-slate-700'}`}>
                    {page.label}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">عرض وتعديل {page.label}</span>
                </div>
              </div>
              
              {isActive && (
                <div className="w-6 h-6 rounded-full bg-brand-cyan flex items-center justify-center">
                  <Check size={14} className="text-white" strokeWidth={3} />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
