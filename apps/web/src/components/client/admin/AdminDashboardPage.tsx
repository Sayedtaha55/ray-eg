'use client';

import React, { useState } from 'react';
import {
  LayoutDashboard, ShoppingBag, Store, Users, Truck,
  MessageSquare, Bell, BarChart3, Settings, ShieldCheck, FileText
} from 'lucide-react';
import { useT } from '@/i18n/useT';
import AdminApprovals from './tabs/AdminApprovals';
import AdminShops from './tabs/AdminShops';
import AdminUsers from './tabs/AdminUsers';
import AdminOrders from './tabs/AdminOrders';
import AdminSettings from './tabs/AdminSettings';
import AdminDelivery from './tabs/AdminDelivery';
import AdminAnalytics from './tabs/AdminAnalytics';
import AdminFeedback from './tabs/AdminFeedback';
import AdminNotifications from './tabs/AdminNotifications';
import AdminContent from './tabs/AdminContent';

const AdminDashboardPage = () => {
  const t = useT();
  const [activeTab, setActiveTab] = useState('overview');

  const menuItems = [
    { id: 'overview', label: t('admin.dashboard.overview'), icon: <LayoutDashboard size={20} /> },
    { id: 'approvals', label: t('admin.dashboard.approvals'), icon: <ShieldCheck size={20} /> },
    { id: 'shops', label: t('admin.dashboard.shops'), icon: <Store size={20} /> },
    { id: 'users', label: t('admin.dashboard.users'), icon: <Users size={20} /> },
    { id: 'orders', label: t('admin.dashboard.orders'), icon: <ShoppingBag size={20} /> },
    { id: 'delivery', label: t('admin.dashboard.delivery'), icon: <Truck size={20} /> },
    { id: 'feedback', label: t('admin.dashboard.feedback'), icon: <MessageSquare size={20} /> },
    { id: 'analytics', label: t('admin.dashboard.analytics'), icon: <BarChart3 size={20} /> },
    { id: 'notifications', label: t('admin.dashboard.notifications'), icon: <Bell size={20} /> },
    { id: 'content', label: t('admin.dashboard.content'), icon: <FileText size={20} /> },
    { id: 'settings', label: t('admin.dashboard.settings'), icon: <Settings size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-row-reverse">
      {/* Admin Sidebar */}
      <aside className="w-80 bg-white border-l border-slate-100 p-8 flex flex-col gap-8">
        <div className="flex items-center gap-3 flex-row-reverse mb-8">
          <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black">A</div>
          <h1 className="text-xl font-black text-slate-900">{t('admin.title', 'لوحة المشرف')}</h1>
        </div>
        <nav className="flex flex-col gap-2">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-black text-sm transition-all flex-row-reverse ${
                activeTab === item.id
                  ? 'bg-slate-900 text-white shadow-xl'
                  : 'text-slate-400 hover:bg-slate-50'
              }`}
            >
              {item.icon}
              <span className="flex-1 text-right">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-12 overflow-auto text-right">
        <header className="mb-12 flex items-center justify-between flex-row-reverse">
          <h2 className="text-4xl font-black text-slate-900">
            {menuItems.find(i => i.id === activeTab)?.label}
          </h2>
        </header>
        <div className="bg-white rounded-[3rem] border border-slate-100 p-12 shadow-sm min-h-[600px]">
           {activeTab === 'overview' && <p className="text-slate-400 font-bold">{t('admin.dashboard.subtitle')}</p>}
           {activeTab === 'approvals' && <AdminApprovals />}
           {activeTab === 'shops' && <AdminShops />}
           {activeTab === 'users' && <AdminUsers />}
           {activeTab === 'orders' && <AdminOrders />}
           {activeTab === 'delivery' && <AdminDelivery />}
           {activeTab === 'analytics' && <AdminAnalytics />}
           {activeTab === 'feedback' && <AdminFeedback />}
           {activeTab === 'notifications' && <AdminNotifications />}
           {activeTab === 'content' && <AdminContent />}
           {activeTab === 'settings' && <AdminSettings />}
           {!['overview', 'approvals', 'shops', 'users', 'orders', 'delivery', 'analytics', 'feedback', 'notifications', 'content', 'settings'].includes(activeTab) && (
             <p className="text-slate-400 font-bold">{t('common.loading')}</p>
           )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboardPage;
