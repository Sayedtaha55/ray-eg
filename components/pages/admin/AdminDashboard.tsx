
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as ReactRouterDOM from 'react-router-dom';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { 
  Users, Store, ShoppingCart, DollarSign, Check, X, 
  Loader2, ShieldAlert, TrendingUp, Search, UserCheck, Eye,
  Bell, Settings, Filter, Edit, Plus
} from 'lucide-react';
import { ApiService } from '@/services/api.service';
import { useToast } from '@/components';

const { useLocation } = ReactRouterDOM as any;
const MotionDiv = motion.div as any;

const AdminDashboard: React.FC = () => {
  const location = useLocation();
  const [stats, setStats] = useState<any>(null);
  const [pendingShops, setPendingShops] = useState<any[]>([]);
  const [allShops, setAllShops] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stats' | 'approvals' | 'users' | 'shops'>('stats');
  const { addToast } = useToast();

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

  const getShopDeliveryFee = (shop: any): number | null => {
    const raw = (shop?.layoutConfig as any)?.deliveryFee;
    const n = typeof raw === 'number' ? raw : raw == null ? NaN : Number(raw);
    if (Number.isNaN(n) || n < 0) return null;
    return n;
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [s, p, allS, ts, acts] = await Promise.all([
        ApiService.getSystemAnalytics(),
        ApiService.getPendingShops(),
        ApiService.getShops('all'),
        (ApiService as any).getSystemAnalyticsTimeseries?.(7) || Promise.resolve([]),
        (ApiService as any).getSystemActivity?.(10) || Promise.resolve([]),
      ]);
      setStats(s);
      setPendingShops(p);
      setAllShops(allS);
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

  useEffect(() => {
    // Set active tab based on current route
    const path = location.pathname;
    if (path.includes('/admin/shops')) {
      setActiveTab('shops');
    } else if (path.includes('/admin/approvals')) {
      setActiveTab('approvals');
    } else if (path.includes('/admin/users')) {
      setActiveTab('users');
    } else {
      setActiveTab('stats');
    }
  }, [location.pathname]);

  const handleAction = async (id: string, action: 'approved' | 'rejected') => {
    try {
      await ApiService.updateShopStatus(id, action);
      addToast(action === 'approved' ? 'تمت الموافقة على المحل' : 'تم رفض الطلب', 'success');
      loadData();
    } catch (e) {
      addToast('فشلت العملية', 'error');
    }
  };

  const editShopDeliveryFee = async (shop: any) => {
    try {
      const current = getShopDeliveryFee(shop);
      const raw = window.prompt('رسوم التوصيل الثابتة (ج.م)', current != null ? String(current) : '');
      if (raw == null) return;
      const fee = Number(String(raw).trim());
      if (Number.isNaN(fee) || fee < 0) return;
      await ApiService.updateMyShop({ shopId: String(shop.id), deliveryFee: fee });
      addToast('تم تحديث رسوم التوصيل', 'success');
      loadData();
    } catch {
      addToast('فشل تحديث رسوم التوصيل', 'error');
    }
  };

  if (loading && !stats) return <div className="h-screen flex items-center justify-center bg-slate-950"><Loader2 className="animate-spin text-[#00E5FF] w-12 h-12" /></div>;

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-slate-900/50 p-8 rounded-[3rem] border border-white/5">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter">نظام إدارة <span className="text-[#00E5FF]">MNMKNK</span></h1>
          <p className="text-slate-400 font-bold mt-2">تحكم كامل في المنصة والتجار والمستخدمين.</p>
        </div>
        <div className="flex gap-4">
           <button onClick={loadData} className="px-6 py-3 bg-white/5 text-white rounded-2xl hover:bg-white/10 transition-all font-bold flex items-center gap-2">تحديث البيانات</button>
           <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-[#00E5FF] text-black font-black flex items-center justify-center">A</div>
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-slate-900" />
           </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
         <AdminStatCard label="إجمالي المبيعات" value={`ج.م ${stats.totalRevenue}`} icon={<DollarSign />} color="cyan" />
         <AdminStatCard label="المستخدمين" value={stats.totalUsers} icon={<Users />} color="purple" />
         <AdminStatCard label="المحلات النشطة" value={stats.totalShops} icon={<Store />} color="blue" />
         <AdminStatCard label="الطلبات" value={stats.totalOrders} icon={<ShoppingCart />} color="amber" />
         <AdminStatCard label="إجمالي الزيارات" value={(stats.totalVisits ?? 0)} icon={<Eye />} color="amber" />
      </div>

      {/* Tabs */}
      <div className="flex gap-4 p-2 bg-slate-900/30 rounded-[2rem] border border-white/5">
         <AdminTabBtn active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} icon={<TrendingUp size={18} />} label="تحليلات النظام" />
         <AdminTabBtn active={activeTab === 'approvals'} onClick={() => setActiveTab('approvals')} icon={<ShieldAlert size={18} />} label={`طلبات الموافقة (${pendingShops.length})`} />
         <AdminTabBtn active={activeTab === 'shops'} onClick={() => setActiveTab('shops')} icon={<Store size={18} />} label={`المتاجر (${allShops.length})`} />
         <AdminTabBtn active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<UserCheck size={18} />} label="إدارة المستخدمين" />
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
         {activeTab === 'approvals' && (
           <MotionDiv initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-slate-900 p-8 rounded-[3rem] border border-white/5 shadow-2xl">
              <h3 className="text-2xl font-black text-white mb-8">طلبات انضمام التجار</h3>
              {pendingShops.length === 0 ? (
                <div className="py-20 text-center text-slate-500 font-bold">لا توجد طلبات معلقة حالياً.</div>
              ) : (
                <div className="space-y-4">
                  {pendingShops.map(shop => (
                    <div key={shop.id} className="p-6 bg-white/5 rounded-[2rem] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-white/[0.08] transition-all">
                       <div className="flex items-center gap-6 flex-row-reverse">
                          <img src={shop.logo_url} className="w-16 h-16 rounded-2xl object-cover bg-slate-800" />
                          <div className="text-right">
                             <p className="font-black text-xl text-white">{shop.name}</p>
                             <p className="text-slate-400 font-bold text-xs">{shop.governorate} • {shop.city} • {shop.category}</p>
                          </div>
                       </div>
                       <div className="flex gap-3">
                          <button onClick={() => handleAction(shop.id, 'approved')} className="px-6 py-3 bg-green-500 text-white rounded-xl font-black text-sm flex items-center gap-2 hover:bg-green-600 transition-all"><Check size={18} /> موافقة</button>
                          <button onClick={() => handleAction(shop.id, 'rejected')} className="px-6 py-3 bg-red-500/10 text-red-500 rounded-xl font-black text-sm flex items-center gap-2 hover:bg-red-500/20 transition-all"><X size={18} /> رفض</button>
                       </div>
                    </div>
                  ))}
                </div>
              )}
           </MotionDiv>
         )}

         {activeTab === 'shops' && (
           <MotionDiv initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-slate-900 p-8 rounded-[3rem] border border-white/5 shadow-2xl">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black text-white">إدارة المتاجر</h3>
                <button className="px-6 py-3 bg-[#00E5FF] text-black rounded-xl font-black text-sm flex items-center gap-2 hover:scale-105 transition-all">
                  <Plus size={18} /> متجر جديد
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-right px-4 py-3 text-sm font-black text-slate-400">المتجر</th>
                      <th className="text-right px-4 py-3 text-sm font-black text-slate-400">الفئة</th>
                      <th className="text-right px-4 py-3 text-sm font-black text-slate-400">المدينة</th>
                      <th className="text-right px-4 py-3 text-sm font-black text-slate-400">رسوم التوصيل</th>
                      <th className="text-right px-4 py-3 text-sm font-black text-slate-400">الحالة</th>
                      <th className="text-right px-4 py-3 text-sm font-black text-slate-400">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allShops.map((shop) => (
                      <tr key={shop.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <img src={shop.logoUrl || '/default-shop.png'} className="w-10 h-10 rounded-xl object-cover" alt={shop.name} />
                            <div>
                              <p className="font-black text-white">{shop.name}</p>
                              <p className="text-xs text-slate-400">{shop.phone}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="px-3 py-1 bg-white/10 text-slate-300 rounded-xl text-xs font-black">
                            {shop.category}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-slate-300">{shop.city}</td>
                        <td className="px-4 py-4">
                          {(() => {
                            const fee = getShopDeliveryFee(shop);
                            return (
                              <button
                                onClick={() => editShopDeliveryFee(shop)}
                                className="px-3 py-1 bg-white/10 text-slate-200 rounded-xl text-xs font-black hover:bg-white/15"
                              >
                                {fee == null ? 'تحديد' : `ج.م ${fee}`}
                              </button>
                            );
                          })()}
                        </td>
                        <td className="px-4 py-4">
                          <span className={`px-3 py-1 rounded-xl text-xs font-black ${
                            shop.status === 'approved' 
                              ? 'bg-green-500/20 text-green-400'
                              : shop.status === 'pending'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {shop.status === 'approved' ? 'موافق عليه' : shop.status === 'pending' ? 'في الانتظار' : 'مرفوض'}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <button className="p-2 text-slate-400 hover:text-[#00E5FF] transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-slate-400 hover:text-[#BD00FF] transition-colors">
                              <Edit className="w-4 h-4" />
                            </button>
                            {shop.status === 'pending' && (
                              <>
                                <button onClick={() => handleAction(shop.id, 'approved')} className="px-3 py-1 bg-green-500 text-white rounded-xl text-xs font-black hover:bg-green-600">
                                  موافقة
                                </button>
                                <button onClick={() => handleAction(shop.id, 'rejected')} className="px-3 py-1 bg-red-500 text-white rounded-xl text-xs font-black hover:bg-red-600">
                                  رفض
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
           </MotionDiv>
         )}

         {activeTab === 'stats' && (
           <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-slate-900 p-10 rounded-[3rem] border border-white/5 shadow-2xl h-[400px] flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-white">إيراد آخر 7 أيام</h3>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">System</span>
              </div>

              <div className="flex-1">
                {(() => {
                  const hasNonZero = Array.isArray(chartData)
                    ? chartData.some((p: any) => Number(p?.revenue || 0) > 0)
                    : false;

                  if (!hasNonZero) {
                    return (
                      <div className="h-full flex items-center justify-center text-slate-500 font-bold">
                        لا توجد إيرادات خلال آخر 7 أيام.
                      </div>
                    );
                  }

                  return (
                    <ResponsiveContainer width="100%" height={360}>
                      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="#00E5FF" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="name" stroke="#64748b" tickLine={false} axisLine={false} />
                        <YAxis
                          stroke="#64748b"
                          tickLine={false}
                          axisLine={false}
                          width={40}
                          tickFormatter={(v) => (Number(v) === 0 ? '' : String(v))}
                        />
                        <Tooltip />
                        <Area type="monotone" dataKey="revenue" stroke="#00E5FF" fillOpacity={1} fill="url(#colorRevenue)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  );
                })()}
              </div>
            </div>

            <div className="bg-slate-900 p-10 rounded-[3rem] border border-white/5 shadow-2xl">
              <h3 className="text-xl font-black text-white mb-8">أحدث العمليات</h3>
              <div className="space-y-6">
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
        )}
      </AnimatePresence>
    </div>
  );
};

const AdminStatCard = ({label, value, icon, color}: any) => (
  <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-white/5 shadow-xl">
     <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white mb-6 ${color === 'cyan' ? 'bg-[#00E5FF]/20 text-[#00E5FF]' : color === 'purple' ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-800 text-slate-400'}`}>
        {icon}
     </div>
     <p className="text-slate-500 font-black text-[10px] uppercase tracking-widest mb-1">{label}</p>
     <p className="text-3xl font-black text-white tracking-tighter">{value}</p>
  </div>
);

const AdminTabBtn = ({active, onClick, icon, label}: any) => (
  <button onClick={onClick} className={`flex items-center gap-3 px-8 py-4 rounded-[1.5rem] font-black text-xs transition-all ${active ? 'bg-[#00E5FF] text-black shadow-[0_0_30px_rgba(0,229,255,0.3)]' : 'text-slate-500 hover:text-white'}`}>
    {icon} <span>{label}</span>
  </button>
);

const ActivityItem = ({title, time, color}: any) => (
  <div className="flex items-center gap-4 flex-row-reverse border-b border-white/5 pb-4">
     <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
     <div className="flex-1 text-right">
        <p className="text-white font-bold text-sm leading-none mb-1">{title}</p>
        <p className="text-slate-500 text-[10px]">{time}</p>
     </div>
  </div>
);

export default AdminDashboard;
