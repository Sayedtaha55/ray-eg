
import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Store, ShoppingCart, DollarSign, Loader2, Eye } from 'lucide-react';
import { ApiService } from '@/services/api.service';
import { useToast } from '@/components/common/feedback/Toaster';

const MotionDiv = motion.div as any;

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [recharts, setRecharts] = useState<any>(null);
  
  const { addToast } = useToast();

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

  const timeAgoAr = (input: any) => {
    const t = input ? new Date(String(input)) : new Date();
    const ms = Date.now() - t.getTime();
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

  const loadData = async () => {
    setLoading(true);
    try {
      const [s, ts, acts] = await Promise.all([
        ApiService.getSystemAnalytics(),
        (ApiService as any).getSystemAnalyticsTimeseries?.(7) || Promise.resolve([]),
        (ApiService as any).getSystemActivity?.(10) || Promise.resolve([]),
      ]);
      setStats(s);
      const mapped = (Array.isArray(ts) ? ts : []).map((row: any) => {
        const date = String(row?.date || '').trim();
        const d = date ? new Date(date) : new Date();
        return {
          name: d.toLocaleDateString('ar-EG', { weekday: 'short' }),
          revenue: Math.round(Number(row?.revenue || 0)),
          orders: Number(row?.orders || 0),
        };
      });
      setChartData(mapped);

      const actMapped = (Array.isArray(acts) ? acts : []).map((a: any) => ({
        id: String(a?.id || ''),
        title: String(a?.title || ''),
        createdAt: a?.createdAt,
        color: String(a?.color || '#00E5FF'),
      }));
      setActivity(actMapped);
    } catch (e) {
      addToast('خطأ في جلب البيانات السحابية', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading && !stats) return <div className="h-screen flex items-center justify-center bg-slate-950"><Loader2 className="animate-spin text-[#00E5FF] w-12 h-12" /></div>;

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col gap-4 p-6 md:p-8 bg-slate-900/50 rounded-[2rem] md:rounded-[3rem] border border-white/5">
        <div>
          <h1 className="text-2xl md:text-4xl font-black text-white tracking-tighter">نظام إدارة <span className="text-[#00E5FF]">MNMKNK</span></h1>
          <p className="text-slate-400 font-bold mt-2 text-sm md:text-base">تحكم كامل في المنصة والتجار والمستخدمين.</p>
        </div>
        <div className="flex items-center justify-between w-full">
           <button onClick={loadData} className="px-4 py-2 md:px-6 md:py-3 bg-white/5 text-white rounded-xl md:rounded-2xl hover:bg-white/10 transition-all font-bold text-sm md:text-base flex items-center gap-2">تحديث البيانات</button>
           <div className="relative">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-[#00E5FF] text-black font-black flex items-center justify-center text-sm md:text-base">A</div>
              <span className="absolute -top-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-red-500 rounded-full border-2 border-slate-900" />
           </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-6">
         <AdminStatCard label="إجمالي المبيعات" value={`ج.م ${stats.totalRevenue}`} icon={<DollarSign />} color="cyan" />
         <AdminStatCard label="المستخدمين" value={stats.totalUsers} icon={<Users />} color="purple" />
         <AdminStatCard label="المحلات النشطة" value={stats.totalShops} icon={<Store />} color="blue" />
         <AdminStatCard label="الطلبات" value={stats.totalOrders} icon={<ShoppingCart />} color="amber" />
         <AdminStatCard label="إجمالي الزيارات" value={(stats.totalVisits ?? 0)} icon={<Eye />} color="amber" />
      </div>

      <AnimatePresence mode="wait">
        <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            <div className="lg:col-span-2 bg-slate-900 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-white/5 shadow-2xl h-[300px] md:h-[400px] flex flex-col">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h3 className="text-lg md:text-xl font-black text-white">إيراد آخر 7 أيام</h3>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">System</span>
              </div>

              <div className="flex-1">
                {(() => {
                  const hasNonZero = Array.isArray(chartData)
                    ? chartData.some((p: any) => Number(p?.revenue || 0) > 0)
                    : false;

                  if (!hasNonZero) {
                    return (
                      <div className="h-full flex items-center justify-center text-slate-500 font-bold text-sm md:text-base">
                        لا توجد إيرادات خلال آخر 7 أيام.
                      </div>
                    );
                  }

                  if (!recharts) return null;

                  const { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } = recharts;

                  return (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="#00E5FF" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="name" stroke="#64748b" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                        <YAxis
                          stroke="#64748b"
                          tickLine={false}
                          axisLine={false}
                          width={40}
                          tickFormatter={(v: any) => (Number(v) === 0 ? '' : String(v))}
                          tick={{ fontSize: 10 }}
                        />
                        <Tooltip />
                        <Area type="monotone" dataKey="revenue" stroke="#00E5FF" fillOpacity={1} fill="url(#colorRevenue)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  );
                })()}
              </div>
            </div>

            <div className="bg-slate-900 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-white/5 shadow-2xl">
              <h3 className="text-lg md:text-xl font-black text-white mb-6 md:mb-8">أحدث العمليات</h3>
              <div className="space-y-4 md:space-y-6">
                {Array.isArray(activity) && activity.length ? (
                  activity.slice(0, 6).map((a: any) => (
                    <ActivityItem key={a.id} title={a.title} time={timeAgoAr(a.createdAt)} color={a.color} />
                  ))
                ) : (
                  <div className="text-slate-500 font-bold text-sm">لا توجد عمليات حديثة حالياً.</div>
                )}
              </div>
            </div>
          </MotionDiv>
      </AnimatePresence>
    </div>
  );
};

const AdminStatCard = ({label, value, icon, color}: any) => (
  <div className="bg-slate-900 p-4 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-white/5 shadow-xl">
     <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-white mb-4 md:mb-6 ${color === 'cyan' ? 'bg-[#00E5FF]/20 text-[#00E5FF]' : color === 'purple' ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-800 text-slate-400'}`}>
        {icon}
     </div>
     <p className="text-slate-500 font-black text-[9px] md:text-[10px] uppercase tracking-widest mb-1">{label}</p>
     <p className="text-xl md:text-3xl font-black text-white tracking-tighter">{value}</p>
  </div>
);

const ActivityItem = ({title, time, color}: any) => (
  <div className="flex items-center gap-3 md:gap-4 flex-row-reverse border-b border-white/5 pb-3 md:pb-4">
     <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
     <div className="flex-1 text-right min-w-0">
        <p className="text-white font-bold text-sm leading-none mb-1 truncate">{title}</p>
        <p className="text-slate-500 text-[9px] md:text-[10px]">{time}</p>
     </div>
  </div>
);

export default AdminDashboard;
