import React from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShieldAlert, 
  Users, 
  Settings, 
  LogOut, 
  ChevronRight,
  Store,
  Palette,
  MessageSquare,
  CreditCard
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: 'admin' | 'merchant' | 'customer';
}

interface NavItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  badge?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, userRole = 'customer' }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const adminNavItems: NavItem[] = [
    { icon: <LayoutDashboard size={20} />, label: 'لوحة التحكم', href: '/admin/dashboard' },
    { icon: <ShieldAlert size={20} />, label: 'طلبات الموافقة', href: '/admin/approvals' },
    { icon: <Store size={20} />, label: 'إدارة المتاجر', href: '/admin/shops' },
    { icon: <Users size={20} />, label: 'إدارة المستخدمين', href: '/admin/users' },
    { icon: <CreditCard size={20} />, label: 'كافة العمليات', href: '/admin/orders' },
    { icon: <MessageSquare size={20} />, label: 'مركز الاقتراحات', href: '/admin/feedback' },
    { icon: <Settings size={20} />, label: 'إعدادات النظام', href: '/admin/settings' },
  ];

  const merchantNavItems: NavItem[] = [
    { icon: <LayoutDashboard size={20} />, label: 'لوحة التحكم', href: '/business/dashboard' },
    { icon: <Store size={20} />, label: 'إدارة المتجر', href: '/business/shop' },
    { icon: <Palette size={20} />, label: 'المظهر', href: '/business/appearance' },
    { icon: <CreditCard size={20} />, label: 'الطلبات', href: '/business/orders' },
    { icon: <MessageSquare size={20} />, label: 'الرسائل', href: '/business/messages' },
    { icon: <Settings size={20} />, label: 'الإعدادات', href: '/business/settings' },
  ];

  const customerNavItems: NavItem[] = [
    { icon: <LayoutDashboard size={20} />, label: 'الرئيسية', href: '/' },
    { icon: <Store size={20} />, label: 'المتاجر', href: '/shops' },
    { icon: <Store size={20} />, label: 'المطاعم', href: '/restaurants' },
    { icon: <CreditCard size={20} />, label: 'طلباتي', href: '/orders' },
    { icon: <MessageSquare size={20} />, label: 'الرسائل', href: '/messages' },
    { icon: <Settings size={20} />, label: 'الإعدادات', href: '/settings' },
  ];

  const navItems = userRole === 'admin' ? adminNavItems : 
                   userRole === 'merchant' ? merchantNavItems : 
                   customerNavItems;

  const handleLogout = () => {
    localStorage.removeItem('ray_user');
    localStorage.removeItem('ray_token');
    navigate('/login');
  };

  const NavItem: React.FC<{ item: NavItem }> = ({ item }) => {
    const isActive = location.pathname === item.href;
    
    return (
      <motion.a
        href={item.href}
        onClick={(e) => {
          e.preventDefault();
          navigate(item.href);
          onClose();
        }}
        className={`flex items-center justify-between p-4 rounded-xl transition-all ${
          isActive 
            ? 'bg-[#00E5FF] text-black' 
            : 'text-slate-400 hover:text-white hover:bg-white/5'
        }`}
        whileHover={{ x: 5 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="flex items-center gap-3">
          {item.icon}
          <span className="font-bold">{item.label}</span>
        </div>
        <div className="flex items-center gap-2">
          {item.badge && (
            <span className="px-2 py-1 bg-red-500 text-white text-xs font-black rounded-full">
              {item.badge}
            </span>
          )}
          <ChevronRight size={16} />
        </div>
      </motion.a>
    );
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: isOpen ? 0 : -300 }}
        exit={{ x: -300 }}
        className={`fixed top-0 left-0 h-full w-72 bg-slate-900 border-r border-white/10 z-50 ${
          isOpen ? 'block' : 'hidden'
        } lg:block lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-[#00E5FF] to-[#BD00FF] rounded-xl" />
              <div>
                <h2 className="text-xl font-black text-white">RAY</h2>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                  {userRole === 'admin' ? 'لوحة الإدارة' : 
                   userRole === 'merchant' ? 'لوحة التاجر' : 
                   'لوحة التحكم'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-6 py-6 overflow-y-auto no-scrollbar">
            <div className="space-y-2">
              {navItems.map((item, index) => (
                <NavItem key={index} item={item} />
              ))}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-6 border-t border-white/10">
            <motion.button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full p-4 text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <LogOut size={20} />
              <span className="font-bold">تسجيل الخروج</span>
            </motion.button>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
