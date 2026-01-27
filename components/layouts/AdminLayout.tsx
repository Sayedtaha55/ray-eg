
import React, { useEffect, useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { LayoutDashboard, ShieldAlert, Users, Settings, LogOut, ChevronRight, Bell, Zap, Menu, X, MessageSquare, CreditCard, Store } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BrandLogo from '@/components/common/BrandLogo';
import { ApiService } from '@/services/api.service';

const { Link, Outlet, useNavigate, useLocation } = ReactRouterDOM as any;
const MotionDiv = motion.div as any;

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('ray_user');
    let role = '';
    try {
      const user = userStr ? JSON.parse(userStr) : {};
      role = String(user?.role || '');
    } catch {
      role = '';
    }
    if (role.toLowerCase() !== 'admin') {
      const returnTo = `${location.pathname}${location.search || ''}`;
      navigate(`/admin/gate?returnTo=${encodeURIComponent(returnTo)}`, { replace: true });
    }
  }, [navigate, location.pathname, location.search]);

  const handleLogout = async () => {
    try {
      await ApiService.logout();
    } catch {
    }
    localStorage.clear();
    window.dispatchEvent(new Event('auth-change'));
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row-reverse text-right font-sans" dir="rtl">
      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <MotionDiv 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`w-80 bg-slate-900 text-white flex flex-col fixed inset-y-0 right-0 z-[110] shadow-2xl transition-transform duration-500 md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-10 flex items-center gap-3">
          <BrandLogo variant="admin" iconOnly />
          <span className="text-2xl font-black tracking-tighter uppercase">MNMKNK <span className="text-[#BD00FF]">ROOT</span></span>
        </div>

        <nav className="flex-1 px-6 space-y-2 py-6 overflow-y-auto no-scrollbar">
           <AdminNavItem to="/admin/dashboard" icon={<LayoutDashboard size={20} />} label="لوحة التحكم" active={location.pathname === '/admin/dashboard'} />
           <AdminNavItem to="/admin/approvals" icon={<ShieldAlert size={20} />} label="طلبات الموافقة" active={location.pathname === '/admin/approvals'} />
           <AdminNavItem to="/admin/shops" icon={<Store size={20} />} label="إدارة المتاجر" active={location.pathname === '/admin/shops'} />
           <AdminNavItem to="/admin/users" icon={<Users size={20} />} label="إدارة المستخدمين" active={location.pathname === '/admin/users'} />
           <AdminNavItem to="/admin/orders" icon={<CreditCard size={20} />} label="كافة العمليات" active={location.pathname === '/admin/orders'} />
           <AdminNavItem to="/admin/feedback" icon={<MessageSquare size={20} />} label="مركز الاقتراحات" active={location.pathname === '/admin/feedback'} />
           <AdminNavItem to="/admin/settings" icon={<Settings size={20} />} label="إعدادات النظام" active={location.pathname === '/admin/settings'} />
        </nav>

        <div className="p-8 border-t border-white/5">
           <button onClick={handleLogout} className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-red-400 hover:bg-red-500/10 transition-all font-bold">
             <LogOut size={20} />
             <span>خروج الآدمن</span>
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:mr-80 overflow-x-hidden min-h-screen">
         <header className="h-24 bg-slate-900/50 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-8 sticky top-0 z-40">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden p-3 bg-white/5 rounded-xl text-white">
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-6">
               <div className="relative cursor-pointer"><Bell className="w-6 h-6 text-slate-500" /></div>
               <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center font-black text-[#00E5FF]">S</div>
            </div>
            <div className="hidden md:block">
               <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">MNMKNK سيستم v1.1 - Root Access</p>
            </div>
         </header>

         <div className="p-6 md:p-12">
            <Outlet />
         </div>
      </main>
    </div>
  );
};

const AdminNavItem = ({to, icon, label, active}: any) => (
  <Link to={to} className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold ${active ? 'bg-[#00E5FF] text-black shadow-[0_10px_30px_rgba(0,229,255,0.2)]' : 'text-slate-400 hover:bg-white/5'}`}>
     {icon}
     <span className="text-sm">{label}</span>
  </Link>
);

export default AdminLayout;
