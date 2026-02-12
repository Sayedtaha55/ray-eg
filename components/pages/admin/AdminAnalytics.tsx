import React, { useEffect, useMemo, useState } from 'react';
import { BarChart3, Loader2, RefreshCw, TrendingUp, Users, Store, ShoppingBag, Eye, Clock } from 'lucide-react';
import { ApiService } from '@/services/api.service';
import { useToast } from '@/components/common/feedback/Toaster';

const AdminAnalytics: React.FC = () => {
  const { addToast } = useToast();
  const [recharts, setRecharts] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [days, setDays] = useState<number>(14);
  const [kpis, setKpis] = useState<any>(null);
  const [series, setSeries] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const mod = await import('recharts');
        if (cancelled) return;
        setRecharts(mod);
      } catch {
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const loadData = async (quiet = false) => {
    if (!quiet) setLoading(true);
    else setRefreshing(true);
    try {
      const [a, s, act] = await Promise.all([
        ApiService.getSystemAnalytics(),
        ApiService.getSystemAnalyticsTimeseries(days),
        ApiService.getSystemActivity(12),
      ]);
      setKpis(a || null);
      setSeries(Array.isArray(s) ? s : []);
      setActivity(Array.isArray(act) ? act : []);
    } catch (e: any) {
      addToast(e?.message || 'فشل تحميل بيانات التحليلات', 'error');
      setKpis(null);
      setSeries([]);
      setActivity([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  const chartData = useMemo(() => {
    const safe = Array.isArray(series) ? series : [];
    return safe.map((x: any) => ({
      name: String(x?.date || '').slice(5),
      revenue: Math.round(Number(x?.revenue || 0)),
      orders: Math.round(Number(x?.orders || 0)),
    }));
  }, [series]);

  const formatEGP = (n: any) => {
    const v = Number(n || 0);
    return `ج.م ${Math.round(Number.isFinite(v) ? v : 0).toLocaleString('ar-EG')}`;
  };

  const chartBody = useMemo(() => {
    if (!recharts) return null;
    const { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } = recharts;
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#64748b' }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#64748b' }} />
          <Tooltip
            cursor={{ fill: 'rgba(255,255,255,0.04)' }}
            contentStyle={{ borderRadius: '18px', border: '1px solid rgba(255,255,255,0.08)', background: '#0b1220', color: '#fff' }}
            labelStyle={{ color: '#94a3b8', fontWeight: 800 }}
          />
          <Bar dataKey="revenue" fill="#00E5FF" radius={[8, 8, 0, 0]} barSize={18} />
        </BarChart>
      </ResponsiveContainer>
    );
  }, [recharts, chartData]);

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
            <h2 className="text-3xl font-black text-white">التحليلات</h2>
            <p className="text-slate-500 text-sm font-bold">نظرة عامة على أداء النظام</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="flex gap-2">
            <button
              onClick={() => setDays(7)}
              className={`px-4 py-2 rounded-2xl text-xs font-black border ${days === 7 ? 'bg-white text-slate-900 border-white/10' : 'bg-slate-900 text-slate-200 border-white/5'}`}
            >
              ٧ أيام
            </button>
            <button
              onClick={() => setDays(14)}
              className={`px-4 py-2 rounded-2xl text-xs font-black border ${days === 14 ? 'bg-white text-slate-900 border-white/10' : 'bg-slate-900 text-slate-200 border-white/5'}`}
            >
              ١٤ يوم
            </button>
            <button
              onClick={() => setDays(30)}
              className={`px-4 py-2 rounded-2xl text-xs font-black border ${days === 30 ? 'bg-white text-slate-900 border-white/10' : 'bg-slate-900 text-slate-200 border-white/5'}`}
            >
              ٣٠ يوم
            </button>
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
          جاري تحميل البيانات...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <KpiCard
              icon={<TrendingUp size={20} />}
              label="إجمالي الإيرادات"
              value={formatEGP(kpis?.totalRevenue)}
              accent="bg-[#00E5FF]/10 text-[#00E5FF]"
            />
            <KpiCard
              icon={<ShoppingBag size={20} />}
              label="إجمالي الطلبات"
              value={Math.round(Number(kpis?.totalOrders || 0)).toLocaleString('ar-EG')}
              accent="bg-emerald-500/10 text-emerald-400"
            />
            <KpiCard
              icon={<Users size={20} />}
              label="إجمالي المستخدمين"
              value={Math.round(Number(kpis?.totalUsers || 0)).toLocaleString('ar-EG')}
              accent="bg-indigo-500/10 text-indigo-300"
            />
            <KpiCard
              icon={<Store size={20} />}
              label="إجمالي المتاجر"
              value={Math.round(Number(kpis?.totalShops || 0)).toLocaleString('ar-EG')}
              accent="bg-amber-500/10 text-amber-400"
            />
            <KpiCard
              icon={<Eye size={20} />}
              label="إجمالي الزيارات"
              value={Math.round(Number(kpis?.totalVisits || 0)).toLocaleString('ar-EG')}
              accent="bg-purple-500/10 text-purple-300"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-slate-900 border border-white/5 rounded-[2.5rem] p-6">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h3 className="text-white font-black text-lg">إيرادات آخر {days} يوم</h3>
                <div className="text-slate-500 text-xs font-black uppercase tracking-widest">Daily</div>
              </div>
              <div className="h-[280px] w-full">
                {chartBody}
              </div>
            </div>

            <div className="bg-slate-900 border border-white/5 rounded-[2.5rem] p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-black text-lg">آخر النشاطات</h3>
                <Clock size={16} className="text-slate-500" />
              </div>

              <div className="space-y-3">
                {activity.length === 0 ? (
                  <div className="text-slate-500 font-bold text-sm">لا يوجد نشاطات حالياً.</div>
                ) : (
                  activity.slice(0, 10).map((e: any) => (
                    <div key={String(e?.id)} className="flex items-start gap-3">
                      <div
                        className="w-2 h-2 rounded-full mt-2"
                        style={{ backgroundColor: String(e?.color || '#00E5FF') }}
                      />
                      <div className="flex-1">
                        <div className="text-slate-200 font-bold text-sm leading-6">{String(e?.title || '')}</div>
                        <div className="text-slate-500 font-bold text-xs mt-1">
                          {(() => {
                            const dt = new Date(e?.createdAt || 0);
                            const ok = !Number.isNaN(dt.getTime());
                            return ok ? dt.toLocaleString('ar-EG') : '';
                          })()}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminAnalytics;
