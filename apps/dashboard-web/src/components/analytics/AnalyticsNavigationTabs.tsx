'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3, Target, LineChart, TrendingUp, Package, Users,
  Activity, ShoppingCart, DollarSign, ArrowRightLeft, Layers
} from 'lucide-react';

const ANALYTICS_TABS = [
  { href: '/dashboard/analytics', label: 'نظرة عامة', icon: BarChart3 },
  { href: '/dashboard/analytics/kpi', label: 'المؤشرات (KPIs)', icon: Target },
  { href: '/dashboard/analytics/charts', label: 'الرسوم البيانية', icon: LineChart },
  { href: '/dashboard/analytics/sales-performance', label: 'أداء المبيعات', icon: TrendingUp },
  { href: '/dashboard/analytics/product-performance', label: 'أداء المنتجات', icon: Package },
  { href: '/dashboard/analytics/visitors', label: 'الزوار وحركة المرور', icon: Users },
  { href: '/dashboard/analytics/conversions', label: 'معدل التحويل (Funnel)', icon: Activity },
];

export function AnalyticsNavigationTabs() {
  const pathname = usePathname();

  return (
    <div className="space-y-3">
      {/* Sub-navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200 scrollbar-none">
        {ANALYTICS_TABS.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon size={14} className={isActive ? 'text-[#00E5FF]' : 'text-slate-400'} />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Quick links to related operations */}
      <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50/70 px-3.5 py-2 rounded-xl border border-slate-100 flex-wrap gap-2">
        <span className="font-bold text-slate-400">انتقال سريع للأقسام المرتبطة:</span>
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/dashboard/sales"
            className="flex items-center gap-1 text-slate-600 hover:text-slate-900 font-bold hover:underline"
          >
            <ShoppingCart size={13} className="text-blue-500" />
            <span>سجل الطلبات</span>
          </Link>
          <span className="text-slate-300">•</span>
          <Link
            href="/dashboard/inventory"
            className="flex items-center gap-1 text-slate-600 hover:text-slate-900 font-bold hover:underline"
          >
            <Package size={13} className="text-purple-500" />
            <span>إدارة المخزون</span>
          </Link>
          <span className="text-slate-300">•</span>
          <Link
            href="/dashboard/finance"
            className="flex items-center gap-1 text-slate-600 hover:text-slate-900 font-bold hover:underline"
          >
            <DollarSign size={13} className="text-emerald-500" />
            <span>الفواتير والمالية</span>
          </Link>
          <span className="text-slate-300">•</span>
          <Link
            href="/dashboard/finance/financial-reports"
            className="flex items-center gap-1 text-slate-600 hover:text-slate-900 font-bold hover:underline"
          >
            <Layers size={13} className="text-cyan-500" />
            <span>التقارير المالية</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
