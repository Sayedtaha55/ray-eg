'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Hammer, HelpCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/* ============================================================
 * AnalyticsPlaceholder — هيكل مبدئي موحّد لصفحات التحليلات
 * اللي لسه تحت التطوير (مشاركة، مالية، تسويق، عمليات، مدفوعات، لوجستيات)
 * ============================================================ */

type AnalyticsPlaceholderProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  /** tailwind text color class for the icon tile, e.g. 'text-fuchsia-500' */
  accent?: string;
  bullets: string[];
  related?: { label: string; href: string }[];
};

export default function AnalyticsPlaceholder({
  title,
  description,
  icon: Icon,
  accent = 'text-fuchsia-500',
  bullets,
  related = [],
}: AnalyticsPlaceholderProps) {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 max-w-[1400px] mx-auto">
      {/* ===== Header ===== */}
      <div className="flex items-center gap-4">
        <div
          className={`w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 ${accent}`}
        >
          <Icon size={24} />
        </div>
        <div className="text-right">
          <h1 className="text-xl font-black text-slate-900">{title}</h1>
          <p className="text-xs text-slate-400 mt-1 font-semibold">{description}</p>
        </div>
      </div>

      {/* ===== Notice: قيد التطوير ===== */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 text-right">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Hammer size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-block text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 leading-none">
                قيد التطوير
              </span>
              <h2 className="text-sm font-bold text-slate-900">الصفحة جاهزة كهيكل مبدئي</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              هذه الصفحة جاهزة كهيكل مبدئي — البيانات والرسوم البيانية هتُضاف هنا
            </p>
          </div>
        </div>
      </div>

      {/* ===== ماذا ستجد هنا؟ ===== */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
          <HelpCircle size={15} className="text-slate-400" />
          <h3 className="text-sm font-bold text-slate-800">ماذا ستجد هنا؟</h3>
        </div>
        <ul className="p-4 space-y-2.5">
          {bullets.map((b) => (
            <li key={b} className="flex items-start gap-2 text-slate-600 text-sm leading-relaxed">
              <ChevronRight size={14} className="text-slate-300 mt-1 shrink-0" />
              {b}
            </li>
          ))}
        </ul>
      </div>

      {/* ===== روابط ذات صلة ===== */}
      <div className="flex flex-wrap gap-2">
        <Link
          href="/dashboard/analytics"
          className="px-3 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
        >
          كل التحليلات
        </Link>
        {related.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
          >
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
