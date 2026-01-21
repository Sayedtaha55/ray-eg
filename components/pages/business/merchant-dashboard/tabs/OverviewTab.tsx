import React from 'react';
import { Bell, DollarSign, Eye, ShoppingCart, TrendingUp, Users } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import ActivityItem from '../components/ActivityItem';
import StatCard from '../components/StatCard';

type Props = {
  shop: any;
  analytics: any;
  notifications: any[];
};

const OverviewTab: React.FC<Props> = ({ shop, analytics, notifications }) => {
  const safeAnalytics = analytics || {};
  const salesCountToday = safeAnalytics.salesCountToday ?? 0;
  const revenueToday = safeAnalytics.revenueToday ?? 0;
  const chartData = Array.isArray(safeAnalytics.chartData) ? safeAnalytics.chartData : [];

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
        <StatCard label="المتابعين" value={shop.followers?.toLocaleString() || '0'} icon={<Users size={32} />} color="cyan" />
        <StatCard label="زيارات المتجر" value={shop.visitors?.toLocaleString() || '0'} icon={<Eye size={32} />} color="cyan" />
        <StatCard label="مبيعات اليوم" value={`${salesCountToday}`} icon={<ShoppingCart size={32} />} color="slate" />
        <StatCard label="إيرادات اليوم" value={`ج.م ${revenueToday}`} icon={<DollarSign size={32} />} color="cyan" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-12 flex-row-reverse">
            <h3 className="text-3xl font-black text-slate-900">رادار المبيعات</h3>
            <div className="flex items-center gap-2 text-green-500 font-black text-sm px-4 py-1 bg-green-50 rounded-full">
              <TrendingUp size={16} /> نمو مستمر
            </div>
          </div>
          <div className="h-[450px] w-full min-w-[300px] min-h-[400px]">
            <ResponsiveContainer width="100%" height={450} minWidth={300} minHeight={400}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#00E5FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 'bold', fill: '#94a3b8' }} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    borderRadius: '24px',
                    border: 'none',
                    boxShadow: '0 30px 60px rgba(0,0,0,0.15)',
                    direction: 'rtl',
                    padding: '20px',
                  }}
                />
                <Area type="monotone" dataKey="sales" stroke="#00E5FF" strokeWidth={6} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-10 flex-row-reverse">
            <h3 className="text-2xl font-black text-slate-900">آخر التنبيهات</h3>
            <div className="w-10 h-10 bg-cyan-50 rounded-full flex items-center justify-center text-[#00E5FF]">
              <Bell size={20} />
            </div>
          </div>
          <div className="space-y-8">
            {notifications.length === 0 ? (
              <div className="py-24 text-center text-slate-200">
                <Bell size={48} className="mx-auto mb-4 opacity-10" />
                <p className="font-bold">لا توجد عمليات مؤخراً.</p>
              </div>
            ) : (
              notifications.map((n) => <ActivityItem key={n.id} n={n} />)
            )}
          </div>
          <button className="w-full mt-10 py-5 bg-slate-50 text-slate-400 font-black text-xs rounded-2xl hover:bg-slate-100 transition-all">
            مشاهدة كافة الإشعارات
          </button>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
