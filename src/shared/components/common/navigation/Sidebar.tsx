import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
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
  CreditCard,
  Truck
} from 'lucide-react';
import { ApiService } from '@/services/api.service';
import { clearSession } from '@/services/authStorage';

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
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const adminNavItems: NavItem[] = [
    { icon: <LayoutDashboard size={20} />, label: t('sidebar.admin.dashboard'), href: '/admin/dashboard' },
    { icon: <ShieldAlert size={20} />, label: t('sidebar.admin.approvals'), href: '/admin/approvals' },
    { icon: <Store size={20} />, label: t('sidebar.admin.shopMgmt'), href: '/admin/shops' },
    { icon: <Users size={20} />, label: t('sidebar.admin.userMgmt'), href: '/admin/users' },
    { icon: <CreditCard size={20} />, label: t('sidebar.admin.allOperations'), href: '/admin/orders' },
    { icon: <Truck size={20} />, label: t('sidebar.admin.deliveryMgmt'), href: '/admin/delivery' },
    { icon: <MessageSquare size={20} />, label: t('sidebar.admin.feedback'), href: '/admin/feedback' },
    { icon: <Settings size={20} />, label: t('sidebar.admin.systemSettings'), href: '/admin/settings' },
  ];

  const merchantNavItems: NavItem[] = [
    { icon: <LayoutDashboard size={20} />, label: t('sidebar.merchant.dashboard'), href: '/business/dashboard' },
    { icon: <Store size={20} />, label: t('sidebar.merchant.shopMgmt'), href: '/business/shop' },
    { icon: <Palette size={20} />, label: t('sidebar.merchant.appearance'), href: '/business/appearance' },
    { icon: <CreditCard size={20} />, label: t('sidebar.merchant.orders'), href: '/business/orders' },
    { icon: <MessageSquare size={20} />, label: t('sidebar.merchant.messages'), href: '/business/messages' },
    { icon: <Settings size={20} />, label: t('sidebar.merchant.settings'), href: '/business/settings' },
  ];

  const customerNavItems: NavItem[] = [
    { icon: <LayoutDashboard size={20} />, label: t('sidebar.customer.home'), href: '/' },
    { icon: <CreditCard size={20} />, label: t('sidebar.customer.myOrders'), href: '/orders' },
    { icon: <MessageSquare size={20} />, label: t('sidebar.customer.messages'), href: '/messages' },
    { icon: <Settings size={20} />, label: t('sidebar.customer.settings'), href: '/settings' },
  ];

  const navItems = userRole === 'admin' ? adminNavItems : 
                   userRole === 'merchant' ? merchantNavItems : 
                   customerNavItems;

  const handleLogout = async () => {
    try {
      await ApiService.logout();
    } catch {
    }
    clearSession('sidebar-logout');
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
                <h2 className="text-xl font-black text-white">MNMKNK</h2>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                  {userRole === 'admin' ? t('sidebar.adminPanel') : 
                   userRole === 'merchant' ? t('sidebar.merchantPanel') : 
                   t('sidebar.controlPanel')}
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
              <span className="font-bold">{t('common.logout')}</span>
            </motion.button>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
