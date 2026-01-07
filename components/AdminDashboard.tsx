
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Store, ShoppingCart, DollarSign, Check, X, 
  Loader2, ShieldAlert, TrendingUp, Search, UserCheck, Eye,
  LayoutDashboard, Bell, Settings, Filter
} from 'lucide-react';
import { ApiService } from '../services/api.service';
import { useToast } from './Toaster';

const MotionDiv = motion.div as any;

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [pendingShops, setPendingShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stats' | 'approvals' | 'users'>('stats');
  const { addToast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [s, p] = await Promise.all([
        ApiService.getSystemAnalytics(),
        ApiService.getPendingShops()
      ]);
      setStats(s);
      setPendingShops(p);
    } catch (e) {
      addToast('خطأ في جلب البيانات السحابية', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAction = async (id: string, action: 'approved' | 'rejected') => {
    try {
      await ApiService.updateShopStatus(id, action);
      addToast(action === 'approved' ? 'تمت الموافقة على المحل' : 'تم رفض الطلب', 'success');
      loadData();
    } catch (e) {
      addToast('فشلت العملية', 'error');
    }
  };

  if (loading && !stats) return <div className="h-screen flex items-center justify-center bg-slate-950"><Loader2 className="animate-spin text-[#00E5FF] w-12 h-12" /></div>;

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-slate-900/50 p-8 rounded-[3rem] border border-white/5">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter">نظام إدارة <span className="text-[#00E5FF]">تست</span></h1>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <AdminStatCard label="إجمالي المبيعات" value={`ج.م ${stats.totalRevenue}`} icon={<DollarSign />} color="cyan" />
         <AdminStatCard label="المستخدمين" value={stats.totalUsers} icon={<Users />} color="purple" />
         <AdminStatCard label="المحلات النشطة" value={stats.totalShops} icon={<Store />} color="blue" />
         <AdminStatCard label="الطلبات" value={stats.totalOrders} icon={<ShoppingCart />} color="amber" />
      </div>

      {/* Tabs */}
      <div className="flex gap-4 p-2 bg-slate-900/30 rounded-[2rem] border border-white/5">
         <AdminTabBtn active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} icon={<TrendingUp size={18} />} label="تحليلات النظام" />
         <AdminTabBtn active={activeTab === 'approvals'} onClick={() => setActiveTab('approvals')} icon={<ShieldAlert size={18} />} label={`طلبات الموافقة (${pendingShops.length})`} />
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

         {activeTab === 'stats' && (
           <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-slate-900 p-10 rounded-[3rem] border border-white/5 shadow-2xl h-[400px] flex items-center justify-center text-slate-500 font-bold">
                 [رسم بياني حقيقي سيظهر هنا عند ربط Supabase Analytics]
              </div>
              <div className="bg-slate-900 p-10 rounded-[3rem] border border-white/5 shadow-2xl">
                 <h3 className="text-xl font-black text-white mb-8">أحدث العمليات</h3>
                 <div className="space-y-6">
                    <ActivityItem title="تسجيل تاجر جديد" time="منذ قليل" color="#00E5FF" />
                    <ActivityItem title="طلب مكتمل" time="منذ ١٠ دقائق" color="#10b981" />
                    <ActivityItem title="حجز مؤكد" time="منذ ساعة" color="#f59e0b" />
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
