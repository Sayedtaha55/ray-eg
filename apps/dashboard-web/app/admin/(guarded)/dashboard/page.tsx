'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Store, ShoppingCart, DollarSign, Loader2, Eye, RefreshCw } from 'lucide-react';
import { apiRequest } from '@/lib/auth';

type Stats = {
  totalRevenue?: number;
  totalUsers?: number;
  totalShops?: number;
  totalOrders?: number;
  totalVisits?: number;
};

type ChartPoint = { name: string; revenue: number; orders: number };
type ActivityItem = { id: string; title: string; createdAt: string; color: string };

const timeAgo = (input: any) => {
  const d = input ? new Date(String(input)) : new Date();
  const ms = Date.now() - d.getTime();
  if (!Number.isFinite(ms) || ms < 0) return 'الآن';
  const sec = Math.floor(ms / 1000);
  if (sec < 60) return 'منذ لحظات';
  const min = Math.floor(sec / 60);
  if (min < 60) return `منذ ${min} دقيقة`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `منذ ${hr} ساعة`;
  const day = Math.floor(hr / 24);
  return `منذ ${day} يوم`;
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [s, ts, acts] = await Promise.all([
        apiRequest('/analytics/system').catch(() => null),
        apiRequest('/analytics/system/timeseries?days=7').catch(() => null),
        apiRequest('/analytics/system/activity?limit=10').catch(() => null),
      ]);

      setStats(s || {});

      const mapped: ChartPoint[] = (Array.isArray(ts) ? ts : []).map((row: any) => {
        const date = String(row?.date || '').trim();
        const d = date ? new Date(date) : new Date();
        return {
          name: d.toLocaleDateString('ar-EG', { weekday: 'short' }),
          revenue: Math.round(Number(row?.revenue || 0)),
          orders: Number(row?.orders || 0),
        };
      });
      setChartData(mapped);

      const actMapped: ActivityItem[] = (Array.isArray(acts) ? acts : []).map((a: any) => ({
        id: String(a?.id || ''),
        title: String(a?.title || ''),
        createdAt: a?.createdAt,
        color: String(a?.color || '#00E5FF'),
      }));
      setActivity(actMapped);
    } catch {
      // ignore
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading && !stats) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="animate-spin text-[#00E5FF] w-12 h-12" />
      </div>
    );
  }

  const hasRevenue = chartData.some((p) => p.revenue > 0);
  const maxRevenue = Math.max(...chartData.map((p) => p.revenue), 1);

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col gap-4 p-6 md:p-8 bg-slate-900/50 rounded-[2rem] md:rounded-[3rem] border border-white/5">
        <div>
          <h1 className="text-2xl md:text-4xl font-black text-white tracking-tighter">
            لوحة التحكم <span className="text-[#00E5FF]">MNMKNK</span>
          </h1>
          <p className="text-slate-400 font-bold mt-2 text-sm md:text-base">نظرة شاملة على المنصة</p>
        </div>
        <div className="flex items-center justify-between w-full">
          <button
            onClick={() => loadData()}
            className="px-4 py-2 md:px-6 md:py-3 bg-white/5 text-white rounded-xl md:rounded-2xl hover:bg-white/10 transition-all font-bold text-sm md:text-base flex items-center gap-2"
          >
            <RefreshCw size={16} /> تحديث البيانات
          </button>
          <div className="relative">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-[#00E5FF] text-black font-black flex items-center justify-center text-sm md:text-base">
              A
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-red-500 rounded-full border-2 border-slate-900" />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-6">
        <StatCard
          label="إجمالي المبيعات"
          value={`${stats?.totalRevenue ?? 0}`}
          icon={<DollarSign size={20} />}
          color="cyan"
        />
        <StatCard
          label="المستخدمون"
          value={stats?.totalUsers ?? 0}
          icon={<Users size={20} />}
          color="purple"
        />
        <StatCard
          label="المتاجر النشطة"
          value={stats?.totalShops ?? 0}
          icon={<Store size={20} />}
          color="blue"
        />
        <StatCard
          label="الطلبات"
          value={stats?.totalOrders ?? 0}
          icon={<ShoppingCart size={20} />}
          color="amber"
        />
        <StatCard
          label="إجمالي الزيارات"
          value={stats?.totalVisits ?? 0}
          icon={<Eye size={20} />}
          color="amber"
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8"
        >
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-slate-900 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-white/5 shadow-2xl h-[300px] md:h-[400px] flex flex-col">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-black text-white">الإيرادات (7 أيام)</h3>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">System</span>
            </div>

            <div className="flex-1">
              {!hasRevenue ? (
                <div className="h-full flex items-center justify-center text-slate-500 font-bold text-sm md:text-base">
                  لا توجد بيانات إيرادات للأيام السبعة الماضية
                </div>
              ) : (
                <div className="h-full flex items-end gap-2 md:gap-3 pb-4">
                  {chartData.map((point, i) => {
                    const height = maxRevenue > 0 ? (point.revenue / maxRevenue) * 100 : 0;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                        <div
                          className="w-full rounded-t-lg bg-gradient-to-t from-[#00E5FF]/20 to-[#00E5FF] transition-all hover:from-[#00E5FF]/40"
                          style={{ height: `${Math.max(height, 2)}%`, minHeight: '4px' }}
                          title={`${point.revenue} EGP`}
                        />
                        <span className="text-[9px] md:text-[10px] font-bold text-slate-500">{point.name}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-slate-900 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-white/5 shadow-2xl">
            <h3 className="text-lg md:text-xl font-black text-white mb-6 md:mb-8">آخر العمليات</h3>
            <div className="space-y-4 md:space-y-6">
              {activity.length > 0 ? (
                activity.slice(0, 6).map((a) => (
                  <ActivityRow key={a.id} title={a.title} time={timeAgo(a.createdAt)} color={a.color} />
                ))
              ) : (
                <div className="text-slate-500 font-bold text-sm">لا توجد عمليات حديثة</div>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

const StatCard = ({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: any;
  icon: React.ReactNode;
  color: string;
}) => (
  <div className="bg-slate-900 p-4 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-white/5 shadow-xl">
    <div
      className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center mb-4 md:mb-6 ${
        color === 'cyan'
          ? 'bg-[#00E5FF]/20 text-[#00E5FF]'
          : color === 'purple'
            ? 'bg-purple-500/20 text-purple-400'
            : color === 'blue'
              ? 'bg-blue-500/20 text-blue-400'
              : color === 'amber'
                ? 'bg-amber-500/20 text-amber-400'
                : 'bg-slate-800 text-slate-400'
      }`}
    >
      {icon}
    </div>
    <p className="text-slate-500 font-black text-[9px] md:text-[10px] uppercase tracking-widest mb-1">{label}</p>
    <p className="text-xl md:text-3xl font-black text-white tracking-tighter">{value}</p>
  </div>
);

const ActivityRow = ({ title, time, color }: { title: string; time: string; color: string }) => (
  <div className="flex items-center gap-3 md:gap-4 flex-row-reverse border-b border-white/5 pb-3 md:pb-4">
    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
    <div className="flex-1 text-right min-w-0">
      <p className="text-white font-bold text-sm leading-none mb-1 truncate">{title}</p>
      <p className="text-slate-500 text-[9px] md:text-[10px]">{time}</p>
    </div>
  </div>
);
