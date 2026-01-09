
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as ReactRouterDOM from 'react-router-dom';
import { 
  Users, Store, ShoppingCart, DollarSign, Check, X, 
  Loader2, ShieldAlert, TrendingUp, Search, UserCheck, Eye,
  LayoutDashboard, Bell, Settings, Filter, Palette, Edit, Plus
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
  const [themes, setThemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stats' | 'approvals' | 'users' | 'shops' | 'themes' | 'shop-management'>('stats');
  const { addToast } = useToast();

  const openShopPreview = (shop: any) => {
    window.open(`/#/shop/${shop.slug}`, '_blank');
  };

  const openMerchantDashboard = (shop: any) => {
    window.open(`/#/business/dashboard?impersonateShopId=${shop.id}`, '_blank');
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [s, p, allS, t] = await Promise.all([
        ApiService.getSystemAnalytics(),
        ApiService.getPendingShops(),
        ApiService.getShops('all'),
        ApiService.getThemeTemplates()
      ]);
      setStats(s);
      setPendingShops(p);
      setAllShops(allS);
      setThemes(t);
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
    } else if (path.includes('/admin/themes')) {
      setActiveTab('themes');
    } else if (path.includes('/admin/approvals')) {
      setActiveTab('approvals');
    } else if (path.includes('/admin/users')) {
      setActiveTab('users');
    } else if (path.includes('/admin/shop-management')) {
      setActiveTab('shop-management');
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
         <AdminTabBtn active={activeTab === 'shops'} onClick={() => setActiveTab('shops')} icon={<Store size={18} />} label={`المتاجر (${allShops.length})`} />
         <AdminTabBtn active={activeTab === 'shop-management'} onClick={() => setActiveTab('shop-management')} icon={<Eye size={18} />} label="لوحات المتاجر" />
         <AdminTabBtn active={activeTab === 'themes'} onClick={() => setActiveTab('themes')} icon={<Palette size={18} />} label={`الثيمات (${themes.length})`} />
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

         {activeTab === 'shop-management' && (
           <MotionDiv initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-slate-900 p-8 rounded-[3rem] border border-white/5 shadow-2xl">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black text-white">لوحات المتاجر والمطاعم</h3>
                <p className="text-slate-400 text-sm">لوحة التاجر (للإدارة) + صفحة العرض (للمعاينة)</p>
              </div>
              {(() => {
                const approved = allShops.filter((shop) => (shop.status ?? 'approved') === 'approved');
                const retail = approved.filter((shop) => shop.category === 'RETAIL');
                const restaurants = approved.filter((shop) => shop.category === 'RESTAURANT');

                const Section = ({ title, items }: any) => (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xl font-black text-white">{title}</h4>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{items.length} عنصر</span>
                    </div>
                    {items.length === 0 ? (
                      <div className="p-10 text-center text-slate-500 font-bold bg-white/5 rounded-[2rem] border border-white/5">
                        لا يوجد عناصر هنا حالياً.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {items.map((shop: any) => (
                          <motion.div
                            key={shop.id}
                            className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all"
                            whileHover={{ scale: 1.02 }}
                          >
                            <div className="flex items-center gap-4 mb-4">
                              <img src={shop.logoUrl || shop.logo_url || '/default-shop.png'} className="w-16 h-16 rounded-2xl object-cover" alt={shop.name} />
                              <div>
                                <h5 className="text-lg font-black text-white">{shop.name}</h5>
                                <p className="text-sm text-slate-400">{shop.city}</p>
                              </div>
                            </div>
                            <div className="space-y-2 mb-5">
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-400">المتابعين:</span>
                                <span className="text-white font-bold">{shop.followers || 0}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-400">الزيارات:</span>
                                <span className="text-white font-bold">{shop.visitors || 0}</span>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <button
                                onClick={() => openMerchantDashboard(shop)}
                                className="py-3 bg-[#00E5FF] text-black rounded-xl font-black text-sm hover:scale-105 transition-all flex items-center justify-center gap-2"
                              >
                                <LayoutDashboard size={16} /> لوحة التاجر
                              </button>
                              <button
                                onClick={() => openShopPreview(shop)}
                                className="py-3 bg-white/10 text-white rounded-xl font-black text-sm hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                              >
                                <Eye size={16} /> صفحة العرض
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                );

                if (approved.length === 0) {
                  return (
                    <div className="py-20 text-center text-slate-500 font-bold">
                      لا توجد متاجر نشطة حالياً. قم بالموافقة على بعض الطلبات أولاً.
                    </div>
                  );
                }

                return (
                  <div className="space-y-10">
                    <Section title="لوحات المحلات" items={retail} />
                    <Section title="لوحات المطاعم" items={restaurants} />
                  </div>
                );
              })()}
           </MotionDiv>
         )}

         {activeTab === 'themes' && (
           <MotionDiv initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-slate-900 p-8 rounded-[3rem] border border-white/5 shadow-2xl">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black text-white">إدارة الثيمات</h3>
                <button className="px-6 py-3 bg-[#00E5FF] text-black rounded-xl font-black text-sm flex items-center gap-2 hover:scale-105 transition-all">
                  <Plus size={18} /> ثيم جديد
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {themes.map((theme) => (
                  <div key={theme.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-black text-white">{theme.displayName}</h4>
                      <Palette className="w-5 h-5 text-[#BD00FF]" />
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-full border-2 border-white/20" style={{ backgroundColor: theme.primary }} />
                      <div className="w-8 h-8 rounded-full border-2 border-white/20" style={{ backgroundColor: theme.secondary }} />
                      <div className="w-8 h-8 rounded-full border-2 border-white/20" style={{ backgroundColor: theme.accent }} />
                    </div>
                    <p className="text-sm text-slate-400 mb-4">{theme.description}</p>
                    <div className="flex items-center gap-2">
                      <button className="flex-1 px-4 py-2 bg-[#00E5FF] text-black rounded-xl font-black text-sm hover:scale-105 transition-all">
                        معاينة
                      </button>
                      <button className="flex-1 px-4 py-2 bg-white/10 text-white rounded-xl font-black text-sm hover:bg-white/20 transition-all">
                        تعديل
                      </button>
                    </div>
                  </div>
                ))}
              </div>
           </MotionDiv>
         )}

         {activeTab === 'stats' && (
           <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-slate-900 p-10 rounded-[3rem] border border-white/5 shadow-2xl h-[400px] flex items-center justify-center text-slate-500 font-bold">
                 [رسم بياني حقيقي سيظهر هنا عند ربط Analytics]
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
