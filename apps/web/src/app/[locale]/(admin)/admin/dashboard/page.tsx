'use client';

import { useEffect, useState } from 'react';
import { Users, Store, CreditCard, TrendingUp, Loader2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useT } from '@/i18n/useT';
import { useLocale } from '@/i18n/LocaleProvider';
import { adminGetDashboardStats, adminGetRecentActivity } from '@/lib/api/admin';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  change?: number;
  color: string;
  bgColor: string;
}

function StatCard({ icon, label, value, change, color, bgColor }: StatCardProps) {
  return (
    <div className="bg-slate-900 border border-white/5 rounded-[2rem] p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className={`p-3 ${bgColor} ${color} rounded-2xl`}>{icon}</div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-black ${change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {change >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <div>
        <p className="text-3xl font-black text-white">{value}</p>
        <p className="text-slate-500 text-xs font-bold mt-1">{label}</p>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const t = useT();
  const { dir } = useLocale();
  const [stats, setStats] = useState<any>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, a] = await Promise.all([adminGetDashboardStats(), adminGetRecentActivity()]);
        setStats(s);
        setActivity(Array.isArray(a) ? a : []);
      } catch {
        // stats endpoint may not exist yet – show placeholders
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <Loader2 className="animate-spin text-[#00E5FF] w-10 h-10" />
      </div>
    );
  }

  const usersCount = stats?.usersCount ?? stats?.totalUsers ?? 0;
  const shopsCount = stats?.shopsCount ?? stats?.totalShops ?? 0;
  const ordersCount = stats?.ordersCount ?? stats?.totalOrders ?? 0;
  const revenue = stats?.revenue ?? stats?.totalRevenue ?? 0;

  return (
    <div className="space-y-8" dir={dir}>
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-[#00E5FF]/10 text-[#00E5FF] rounded-2xl">
          <TrendingUp size={24} />
        </div>
        <div>
          <h2 className="text-3xl font-black text-white">{t('admin.dashboard.title', 'لوحة التحكم')}</h2>
          <p className="text-slate-500 text-sm font-bold">{t('admin.dashboard.subtitle', 'نظرة عامة على المنصة')}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Users size={24} />}
          label={t('admin.dashboard.totalUsers', 'إجمالي المستخدمين')}
          value={Number(usersCount).toLocaleString()}
          change={stats?.usersChange}
          color="text-purple-400"
          bgColor="bg-purple-500/10"
        />
        <StatCard
          icon={<Store size={24} />}
          label={t('admin.dashboard.totalShops', 'إجمالي المتاجر')}
          value={Number(shopsCount).toLocaleString()}
          change={stats?.shopsChange}
          color="text-blue-400"
          bgColor="bg-blue-500/10"
        />
        <StatCard
          icon={<CreditCard size={24} />}
          label={t('admin.dashboard.totalOrders', 'إجمالي الطلبات')}
          value={Number(ordersCount).toLocaleString()}
          change={stats?.ordersChange}
          color="text-amber-400"
          bgColor="bg-amber-500/10"
        />
        <StatCard
          icon={<TrendingUp size={24} />}
          label={t('admin.dashboard.revenue', 'الإيرادات')}
          value={`${t('admin.dashboard.egp', 'ج.م')} ${Number(revenue).toLocaleString()}`}
          change={stats?.revenueChange}
          color="text-emerald-400"
          bgColor="bg-emerald-500/10"
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-slate-900 border border-white/5 rounded-[3rem] overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <h3 className="text-lg font-black text-white">{t('admin.dashboard.recentActivity', 'النشاط الأخير')}</h3>
        </div>
        {activity.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-slate-500 font-bold">{t('admin.dashboard.noActivity', 'لا يوجد نشاط حتى الآن')}</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {activity.slice(0, 10).map((item: any, i: number) => (
              <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-xs font-black text-[#00E5FF]">
                    {String(item.type || '?').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">{item.title || item.message || '-'}</p>
                    <p className="text-slate-500 text-xs font-bold">{item.description || ''}</p>
                  </div>
                </div>
                <span className="text-slate-600 text-xs font-bold">
                  {item.createdAt ? new Date(item.createdAt).toLocaleString('ar-EG') : ''}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
