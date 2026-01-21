import React, { useState } from 'react';
import { Settings as SettingsIcon, User, Shield, Store, CreditCard, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import Overview from './Overview';
import Account from './Account';
import Security from './Security';
import StoreSettings from './StoreSettings';
import Payments from './Payments';

type SettingsTab = 'overview' | 'account' | 'security' | 'store' | 'payments';

const SettingsTabs = [
  { id: 'overview' as const, label: 'نظرة عامة', icon: <Home className="w-5 h-5" /> },
  { id: 'account' as const, label: 'الحساب', icon: <User className="w-5 h-5" /> },
  { id: 'security' as const, label: 'الأمان', icon: <Shield className="w-5 h-5" /> },
  { id: 'store' as const, label: 'إعدادات المتجر', icon: <Store className="w-5 h-5" /> },
  { id: 'payments' as const, label: 'المدفوعات', icon: <CreditCard className="w-5 h-5" /> },
];

interface SettingsProps {
  shop: any;
  onSaved: () => void;
  adminShopId?: string;
}

const Settings: React.FC<SettingsProps> = ({ shop, onSaved, adminShopId }) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('overview');

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
