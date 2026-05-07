'use client';

import React, { useState } from 'react';
import {
  LayoutDashboard, MapPin, GitBranch, BarChart3, User, LogOut
} from 'lucide-react';
import { useT } from '@/i18n/useT';

const PortalDashboardPage = () => {
  const t = useT();
  const [activeTab, setActiveTab] = useState('overview');

  const menuItems = [
    { id: 'overview', label: t('nav.dashboard', 'نظرة عامة'), icon: <LayoutDashboard size={20} /> },
    { id: 'listings', label: t('nav.directory', 'الإدراجات'), icon: <MapPin size={20} /> },
    { id: 'branches', label: t('map.branches', 'الفروع'), icon: <GitBranch size={20} /> },
    { id: 'analytics', label: t('nav.dashboard', 'التحليلات'), icon: <BarChart3 size={20} /> },
    { id: 'profile', label: t('nav.myAccount', 'الملف الشخصي'), icon: <User size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row-reverse">
      {/* Portal Sidebar */}
      <aside className="w-full md:w-80 bg-white border-l border-slate-100 p-8 flex flex-col gap-8">
        <div className="flex items-center gap-3 flex-row-reverse mb-8">
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black">P</div>
          <h1 className="text-xl font-black text-slate-900">{t('auth.portalTitle', 'بوابة الشركاء')}</h1>
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
           <p className="text-slate-400 font-bold">{t('common.loading')}</p>
        </div>
      </main>
    </div>
  );
};

export default PortalDashboardPage;
