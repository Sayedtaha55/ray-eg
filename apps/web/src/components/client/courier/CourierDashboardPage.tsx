'use client';

import React, { useState } from 'react';
import { Package, Truck, Settings, Bell, LogOut } from 'lucide-react';
import { useT } from '@/i18n/useT';
import CourierOrdersTab from './tabs/CourierOrdersTab';
import CourierOffersTab from './tabs/CourierOffersTab';
import CourierSettingsTab from './tabs/CourierSettingsTab';

const CourierDashboardPage = () => {
  const t = useT();
  const [activeTab, setActiveTab] = useState('orders');

  const menuItems = [
    { id: 'orders', label: t('courier.dashboard.orders', 'الطلبات'), icon: <Package size={20} /> },
    { id: 'offers', label: t('courier.dashboard.offers', 'العروض'), icon: <Truck size={20} /> },
    { id: 'settings', label: t('courier.dashboard.settings', 'الإعدادات'), icon: <Settings size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row-reverse">
      {/* Courier Sidebar */}
      <aside className="w-full md:w-80 bg-white border-l border-slate-100 p-8 flex flex-col gap-8">
        <div className="flex items-center gap-3 flex-row-reverse mb-8">
          <div className="w-10 h-10 bg-[#00E5FF] rounded-2xl flex items-center justify-center text-black font-black">C</div>
          <h1 className="text-xl font-black text-slate-900">{t('courier.title', 'لوحة المندوب')}</h1>
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
      <main className="flex-1 p-6 md:p-12 overflow-auto text-right">
        <header className="mb-12 flex items-center justify-between flex-row-reverse">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900">
            {menuItems.find(i => i.id === activeTab)?.label}
          </h2>
        </header>
        <div className="bg-white rounded-[2.5rem] md:rounded-[3rem] border border-slate-100 p-8 md:p-12 shadow-sm min-h-[500px]">
           {activeTab === 'orders' && <CourierOrdersTab />}
           {activeTab === 'offers' && <CourierOffersTab />}
           {activeTab === 'settings' && <CourierSettingsTab />}
           {!['orders', 'offers', 'settings'].includes(activeTab) && (
             <p className="text-slate-400 font-bold">{t('common.loading')}</p>
           )}
        </div>
      </main>
    </div>
  );
};

export default CourierDashboardPage;
