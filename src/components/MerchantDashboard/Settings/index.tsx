import React, { useEffect, useState } from 'react';
import { Settings as SettingsIcon, User, Shield, Store, CreditCard, Home, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RayDB } from '@/constants';
import Overview from './Overview';
import Account from './Account';
import Security from './Security';
import StoreSettings from './StoreSettings';
import Payments from './Payments';

type SettingsTab = 'overview' | 'account' | 'security' | 'store' | 'payments' | 'notifications';

const SettingsTabs = [
  { id: 'overview' as const, label: 'نظرة عامة', icon: <Home className="w-5 h-5" /> },
  { id: 'account' as const, label: 'الحساب', icon: <User className="w-5 h-5" /> },
  { id: 'security' as const, label: 'الأمان', icon: <Shield className="w-5 h-5" /> },
  { id: 'store' as const, label: 'إعدادات المتجر', icon: <Store className="w-5 h-5" /> },
  { id: 'payments' as const, label: 'المدفوعات', icon: <CreditCard className="w-5 h-5" /> },
  { id: 'notifications' as const, label: 'التنبيهات', icon: <Bell className="w-5 h-5" /> },
];

interface SettingsProps {
  shop: any;
  onSaved: () => void;
  adminShopId?: string;
}

const Settings: React.FC<SettingsProps> = ({ shop, onSaved, adminShopId }) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('overview');
  const [sounds, setSounds] = useState(RayDB.getNotificationSounds());
  const [savedSoundId, setSavedSoundId] = useState(RayDB.getSelectedNotificationSoundId());
  const [pendingSoundId, setPendingSoundId] = useState(RayDB.getSelectedNotificationSoundId());

  useEffect(() => {
    const onSoundsUpdate = () => {
      setSounds(RayDB.getNotificationSounds());
      const current = RayDB.getSelectedNotificationSoundId();
      setSavedSoundId(current);
      setPendingSoundId((prev) => (prev ? prev : current));
    };
    window.addEventListener('notification-sounds-update', onSoundsUpdate);
    RayDB.syncNotificationSoundsFromPublic();
    return () => window.removeEventListener('notification-sounds-update', onSoundsUpdate);
  }, []);

  useEffect(() => {
    if (activeTab !== 'notifications') return;
    RayDB.syncNotificationSoundsFromPublic();
  }, [activeTab]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview shop={shop} />;
      case 'account':
        return <Account shop={shop} onSaved={onSaved} adminShopId={adminShopId} />;
      case 'security':
        return <Security shop={shop} onSaved={onSaved} />;
      case 'store':
        return <StoreSettings shop={shop} onSaved={onSaved} adminShopId={adminShopId} />;
      case 'payments':
        return <Payments shop={shop} onSaved={onSaved} />;
      case 'notifications':
        return (
          <div className="space-y-6 text-right" dir="rtl">
            <h3 className="text-2xl font-black">التنبيهات</h3>
            <div className="space-y-6">
              <h3 className="text-2xl font-black">أصوات التنبيهات</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-4">اختيار الصوت</label>
                  <div className="space-y-3">
                    {sounds.map((s: any) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          setPendingSoundId(String(s.id));
                        }}
                        className={`w-full px-6 py-4 rounded-2xl border font-black text-sm flex items-center justify-between ${pendingSoundId === String(s.id) ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-900 border-slate-100 hover:bg-slate-100'}`}
                      >
                        <span>{String(s.name || 'صوت')}</span>
                        <span className="text-[10px] opacity-70">
                          {savedSoundId === String(s.id) ? 'محفوظ' : pendingSoundId === String(s.id) ? 'محدد' : ''}
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-3 mt-3">
                    <button
                      onClick={() => {
                        const url = pendingSoundId
                          ? (sounds.find((s: any) => String(s.id) === String(pendingSoundId))?.url || '')
                          : '';
                        if (!url) return;
                        const audio = new Audio(String(url));
                        audio.play().catch(() => {});
                      }}
                      className="flex-1 py-4 bg-[#00E5FF] text-slate-900 rounded-2xl font-black text-sm"
                    >
                      تجربة الصوت
                    </button>
                    <button
                      onClick={() => {
                        const idToSave = String(pendingSoundId || '').trim();
                        if (!idToSave) return;
                        RayDB.setSelectedNotificationSoundId(idToSave);
                        setSavedSoundId(idToSave);
                      }}
                      className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm"
                    >
                      حفظ
                    </button>
                  </div>
                </div>
                <div />
              </div>
            </div>
          </div>
        );
      default:
        return <Overview shop={shop} />;
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-full bg-gray-50 rounded-lg overflow-hidden">
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 bg-white border-r border-gray-200 p-4">
        <div className="flex items-center space-x-3 p-4 border-b border-gray-200 mb-4">
          <SettingsIcon className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold">الإعدادات</h2>
        </div>
        <nav className="space-y-1">
          {SettingsTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'w-full flex items-center space-x-3 px-4 py-3 text-right rounded-lg transition-colors',
                activeTab === tab.id
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              <span className="ml-2">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default Settings;
