import React, { useState, useMemo, Suspense, lazy } from 'react';
import { ShoppingCart, Receipt, RotateCcw, Clock, BarChart3, Globe, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const POSSystem = lazy(() => import('./POSSystem'));
const POSInvoicesPage = lazy(() => import('./pos/POSInvoicesPage'));
const POSReturnsPage = lazy(() => import('./pos/POSReturnsPage'));
const POSShiftsPage = lazy(() => import('./pos/POSShiftsPage'));
const POSReportsPage = lazy(() => import('./pos/POSReportsPage'));
const WebsiteReturnsPage = lazy(() => import('./pos/WebsiteReturnsPage'));

type POSSubTab = 'checkout' | 'invoices' | 'returns' | 'shifts' | 'reports' | 'websiteReturns';

interface Props {
  shopId: string;
  shop?: any;
  onClose: () => void;
}

const POSSection: React.FC<Props> = ({ shopId, shop, onClose }) => {
  const { i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const [subTab, setSubTab] = useState<POSSubTab>('checkout');

  const tabs = useMemo(() => [
    { id: 'checkout' as POSSubTab, label: isArabic ? 'الكاشير' : 'Checkout', icon: ShoppingCart },
    { id: 'invoices' as POSSubTab, label: isArabic ? 'فواتير الكاشير' : 'POS Invoices', icon: Receipt },
    { id: 'returns' as POSSubTab, label: isArabic ? 'مرتجعات الكاشير' : 'POS Returns', icon: RotateCcw },
    { id: 'websiteReturns' as POSSubTab, label: isArabic ? 'مرتجعات الموقع' : 'Website Returns', icon: Globe },
    { id: 'shifts' as POSSubTab, label: isArabic ? 'الورديات' : 'Shifts', icon: Clock },
    { id: 'reports' as POSSubTab, label: isArabic ? 'تقارير الكاشير' : 'Reports', icon: BarChart3 },
  ], [isArabic]);

  const renderSubPage = () => {
    switch (subTab) {
      case 'checkout':
        return <POSSystem shopId={shopId} shop={shop} onClose={onClose} />;
      case 'invoices':
        return <POSInvoicesPage shopId={shopId} isArabic={isArabic} />;
      case 'returns':
        return <POSReturnsPage shopId={shopId} isArabic={isArabic} />;
      case 'websiteReturns':
        return <WebsiteReturnsPage shopId={shopId} isArabic={isArabic} />;
      case 'shifts':
        return <POSShiftsPage shopId={shopId} isArabic={isArabic} />;
      case 'reports':
        return <POSReportsPage shopId={shopId} isArabic={isArabic} />;
      default:
        return null;
    }
  };

  if (subTab === 'checkout') {
    // POS checkout is full-screen — header buttons navigate to sub-pages
    return (
      <Suspense fallback={<div className="flex items-center justify-center h-96"><Loader2 className="animate-spin text-slate-400" size={32} /></div>}>
        <POSSystem shopId={shopId} shop={shop} onClose={onClose} onNavigate={(tab) => setSubTab(tab as POSSubTab)} />
      </Suspense>
    );
  }

  // Non-checkout pages: show header + sub-tab bar + content
  return (
    <div className="bg-white p-4 sm:p-6 md:p-8 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm min-h-[60vh]">
      {/* Header */}
      <div className="flex flex-col gap-4 md:gap-6 mb-6 md:flex-row md:items-center md:justify-between md:flex-row-reverse">
        <div className="text-right">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-black flex items-center gap-2">
            <ShoppingCart size={24} className="text-[#BD00FF]" />
            {isArabic ? 'الكاشير' : 'Cashier / POS'}
          </h3>
          <p className="mt-1 text-xs sm:text-sm font-bold text-slate-400">
            {isArabic ? 'نقطة البيع وإدارة الكاشير' : 'Point of sale & cashier management'}
          </p>
        </div>
      </div>

      {/* Sub-tab navigation */}
      <div className="max-w-full sm:overflow-x-auto sm:touch-auto mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:whitespace-nowrap sm:w-max sm:min-w-full sm:pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} type="button" onClick={() => setSubTab(tab.id)}
                className={`w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 sm:px-4 md:px-6 py-2 rounded-full font-black text-[11px] sm:text-xs transition-all ${
                  subTab === tab.id ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}>
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sub-page content */}
      <Suspense fallback={<div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-slate-400" size={32} /></div>}>
        {renderSubPage()}
      </Suspense>
    </div>
  );
};

export default POSSection;
