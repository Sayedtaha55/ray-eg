'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  BarChart3, Loader2, RefreshCw, TrendingUp, Users, Store, ShoppingBag, Eye, Clock,
} from 'lucide-react';
import { apiRequest } from '@/lib/auth';
import { useToast } from '@/components/settings/ToastProvider';

export default function AdminAnalyticsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [days, setDays] = useState(14);
  const [kpis, setKpis] = useState<any>(null);
  const [series, setSeries] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);

  const loadData = async (quiet = false) => {
    if (!quiet) setLoading(true);
    else setRefreshing(true);
    try {
      const [a, s, act] = await Promise.all([
        apiRequest('/analytics/system'),
        apiRequest(`/analytics/system/timeseries?days=${days}`).catch(() => []),
        apiRequest('/analytics/system/activity?take=12').catch(() => []),
      ]);
      setKpis(a || null);
      setSeries(Array.isArray(s) ? s : []);
      setActivity(Array.isArray(act) ? act : []);
    } catch (e: any) {
      toast({ title: e?.message || 'فشل تحميل التحليلات', variant: 'destructive' });
      setKpis(null); setSeries([]); setActivity([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadData(); }, [days]);

  const chartData = useMemo(() => {
    return (Array.isArray(series) ? series : []).map((x) => ({
      name: String(x?.date || '').slice(5),
      revenue: Math.round(Number(x?.revenue || 0)),
      orders: Math.round(Number(x?.orders || 0)),
    }));
  }, [series]);

  const maxRevenue = useMemo(() => Math.max(...chartData.map((d) => d.revenue), 1), [chartData]);

  const formatEGP = (n: any) => {
    const v = Number(n || 0);
    return `ج.م ${Math.round(Number.isFinite(v) ? v : 0).toLocaleString('ar-EG')}`;
  };

  const KpiCard = ({ icon, label, value, accent }: any) => (
    <div className="bg-slate-900 border border-white/5 rounded-[2.5rem] p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-slate-500 text-xs font-black uppercase tracking-widest">{label}</p>
          <p className="text-white text-2xl font-black mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-2xl ${accent}`}>{icon}</div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#00E5FF]/10 text-[#00E5FF] rounded-2xl">
            <BarChart3 size={24} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white">تحليلات المنصة</h2>
            <p className="text-slate-500 text-sm font-bold">إحصائيات ومؤشرات الأداء</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="flex gap-2">
            {[7, 14, 30].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-4 py-2 rounded-2xl text-xs font-black border ${
                  days === d ? 'bg-white text-slate-900 border-white/10' : 'bg-slate-900 text-slate-200 border-white/5'
                }`}
              >
                {d} يوم
              </button>
            ))}
          </div>
          <button
            onClick={() => loadData(true)}
            disabled={refreshing || loading}
            className="px-4 py-2 rounded-2xl text-xs font-black bg-slate-900 border border-white/5 text-slate-200 hover:bg-slate-800 disabled:opacity-60 flex items-center gap-2"
          >
            {refreshing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            تحديث
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-slate-900 border border-white/5 rounded-[2.5rem] p-10 text-slate-400 font-bold flex items-center gap-3">
          <Loader2 className="animate-spin" size={18} />
          جاري التحميل...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <KpiCard icon={<TrendingUp size={20} />} label="إجمالي الإيرادات" value={formatEGP(kpis?.totalRevenue)} accent="bg-[#00E5FF]/10 text-[#00E5FF]" />
            <KpiCard icon={<ShoppingBag size={20} />} label="إجمالي الطلبات" value={Math.round(Number(kpis?.totalOrders || 0)).toLocaleString('ar-EG')} accent="bg-emerald-500/10 text-emerald-400" />
            <KpiCard icon={<Users size={20} />} label="إجمالي المستخدمين" value={Math.round(Number(kpis?.totalUsers || 0)).toLocaleString('ar-EG')} accent="bg-indigo-500/10 text-indigo-300" />
            <KpiCard icon={<Store size={20} />} label="إجمالي المتاجر" value={Math.round(Number(kpis?.totalShops || 0)).toLocaleString('ar-EG')} accent="bg-amber-500/10 text-amber-400" />
            <KpiCard icon={<Eye size={20} />} label="إجمالي الزيارات" value={Math.round(Number(kpis?.totalVisits || 0)).toLocaleString('ar-EG')} accent="bg-purple-500/10 text-purple-300" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-slate-900 border border-white/5 rounded-[2.5rem] p-6">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h3 className="text-white font-black text-lg">الإيرادات ({days} يوم)</h3>
                <div className="text-slate-500 text-xs font-black uppercase tracking-widest">يومي</div>
              </div>
              <div className="w-full min-h-[280px] flex items-end gap-2 pt-4">
                {chartData.length === 0 ? (
                  <div className="w-full text-center text-slate-500 font-bold py-20">لا توجد بيانات</div>
                ) : chartData.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="text-[10px] font-black text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      {d.revenue.toLocaleString()}
                    </div>
                    <div
                      className="w-full bg-gradient-to-t from-[#00E5FF]/40 to-[#00E5FF] rounded-t-lg transition-all hover:from-[#00E5FF]/60 hover:to-[#00E5FF]"
                      style={{ height: `${Math.max(4, (d.revenue / maxRevenue) * 240)}px` }}
                      title={`${d.name}: ${d.revenue.toLocaleString()} ج.م`}
                    />
                    <div className="text-[9px] font-bold text-slate-500">{d.name}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 border border-white/5 rounded-[2.5rem] p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-black text-lg">النشاط الأخير</h3>
                <Clock size={16} className="text-slate-500" />
              </div>
              <div className="space-y-3">
                {activity.length === 0 ? (
                  <div className="text-slate-500 font-bold text-sm">لا يوجد نشاط</div>
                ) : activity.slice(0, 10).map((e, i) => (
                  <div key={String(e?.id || i)} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full mt-2" style={{ backgroundColor: String(e?.color || '#00E5FF') }} />
                    <div className="flex-1">
                      <div className="text-slate-200 font-bold text-sm leading-6">{String(e?.title || '')}</div>
                      <div className="text-slate-500 font-bold text-xs mt-1">
                        {(() => {
                          const dt = new Date(e?.createdAt || 0);
                          return !Number.isNaN(dt.getTime()) ? dt.toLocaleString('ar-EG') : '';
                        })()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
