'use client';

import React, { memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, ChevronRight, ChevronLeft, X } from 'lucide-react';
import { useT } from '@/i18n/useT';
import { useLocale } from '@/i18n/LocaleProvider';
import { MerchantDashboardTabId } from '@/lib/dashboard/activity-config';

const MotionDiv = motion.div as any;

interface NavItemProps {
  icon?: React.ReactNode;
  label: string;
  active: boolean;
  onClick?: () => void;
  showIcon?: boolean;
  hideLabel?: boolean;
  badge?: number;
  upgradeRequired?: boolean;
}

const NavItem = memo(({ icon, label, active, onClick, showIcon = true, hideLabel = false, badge, upgradeRequired }: NavItemProps) => (
  <button
    type="button"
    onClick={onClick}
    className={`relative flex items-center justify-between w-full px-4 py-3 rounded-2xl transition-all duration-300 group border ${
      active
        ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200'
        : upgradeRequired
          ? 'bg-white text-slate-400 border-transparent hover:border-amber-100 hover:bg-amber-50/50 hover:text-amber-600'
          : 'bg-white text-slate-600 border-transparent hover:border-slate-100 hover:bg-slate-50 hover:text-slate-900'
    }`}
  >
    <div className={`flex items-center gap-3 flex-row-reverse ${hideLabel ? 'w-full justify-center' : ''}`}>
      {showIcon && icon ? (
        <span className={`${active ? 'text-[#00E5FF]' : upgradeRequired ? 'text-amber-300 group-hover:text-amber-500' : 'text-slate-400 group-hover:text-slate-900'} transition-colors`}>
          {icon}
        </span>
      ) : null}
      {!hideLabel && <span className={`font-black text-sm leading-none ${upgradeRequired && !active ? 'opacity-60' : ''}`}>{label}</span>}
    </div>
    {upgradeRequired && !badge ? (
      <span className="text-amber-400 group-hover:text-amber-500 transition-colors" title="ترقية مطلوبة">🔒</span>
    ) : badge ? (
      <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full min-w-[20px] text-center">
        {badge}
      </span>
    ) : (
      <span className={`text-[10px] opacity-0 group-hover:opacity-100 transition-opacity ${active ? 'text-white/40' : 'text-slate-300'}`}>
        ←
      </span>
    )}
  </button>
));

NavItem.displayName = 'NavItem';

interface DashboardSidebarProps {
  visibleTabs: Array<{ id: MerchantDashboardTabId; icon: React.ReactNode; label: string; upgradeRequired?: boolean }>;
  effectiveTab: string;
  onTabChange: (id: MerchantDashboardTabId) => void;
  isSidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (v: boolean) => void;
  onLogout?: () => void;
  shopName?: string;
  notifUnreadCount?: number;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  visibleTabs, effectiveTab, onTabChange,
  isSidebarOpen, setSidebarOpen,
  isCollapsed, setIsCollapsed,
  onLogout, shopName, notifUnreadCount = 0,
}) => {
  const t = useT();
  const { dir } = useLocale();
  const isArabic = dir === 'rtl';

  const sidebarNavSections = useMemo(() => {
    const byId = new Map<string, any>();
    for (const tab of visibleTabs) byId.set(String(tab.id), tab);
    const pick = (...ids: MerchantDashboardTabId[]) =>
      ids.map((id) => byId.get(String(id))).filter(Boolean);

    return [
      { title: t('dashboard.sections.dashboard', 'لوحة التحكم'), items: pick('overview') },
      { title: t('dashboard.sections.operations', 'العمليات'), items: pick('products', 'pos', 'reservations', 'invoice') },
      { title: t('dashboard.sections.sales', 'المبيعات'), items: pick('sales', 'abandonedCart') },
      { title: t('dashboard.sections.growth', 'النمو'), items: pick('promotions', 'customers', 'reports', 'gallery') },
      { title: t('dashboard.sections.setup', 'الإعداد'), items: pick('builder', 'settings') },
    ].filter((s) => Array.isArray(s.items) && s.items.length > 0);
  }, [visibleTabs, t]);

  const widthClass = isCollapsed ? 'md:w-24' : 'md:w-80';

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[300] md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`bg-white text-slate-900 flex flex-col fixed inset-y-0 z-[310] shadow-2xl transition-all duration-500 ease-in-out overflow-hidden min-h-0 md:translate-x-0 border-slate-100 ${
          isArabic ? 'right-0 border-l' : 'left-0 border-r'
        } ${widthClass} ${
          isSidebarOpen
            ? 'translate-x-0'
            : isArabic
              ? 'translate-x-full'
              : '-translate-x-full'
        } md:translate-x-0`}
      >
        {/* Header */}
        <div className={`${isCollapsed ? 'p-4' : 'p-6 md:p-8'} flex items-center justify-between gap-3`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#00E5FF] to-[#BD00FF] flex items-center justify-center text-white font-black text-lg shrink-0">
              {shopName ? shopName.charAt(0) : 'R'}
            </div>
            {!isCollapsed && (
              <span className="text-lg font-black tracking-tighter uppercase truncate">{shopName || t('brand.nameBusiness', 'Ray')}</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:flex shrink-0 p-2 hover:bg-slate-100 rounded-full"
              aria-label={isCollapsed ? t('sidebar.expand', 'توسيع القائمة') : t('sidebar.collapse', 'طي القائمة')}
            >
              {isArabic ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden p-2 hover:bg-slate-100 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Nav sections */}
        <nav className="flex-1 px-4 md:px-6 py-2 overflow-y-auto no-scrollbar min-h-0">
          <div className="space-y-6">
            {sidebarNavSections.map((section) => (
              <div key={section.title} className="space-y-2">
                {!isCollapsed && (
                  <div className={`px-2 text-[10px] font-black tracking-[0.22em] uppercase text-slate-400 ${isArabic ? 'text-right' : 'text-left'}`}>
                    {section.title}
                  </div>
                )}
                <div className="space-y-1">
                  {section.items.map((tab: any) => (
                    <NavItem
                      key={tab.id}
                      icon={tab.icon}
                      label={tab.label}
                      active={effectiveTab === tab.id}
                      onClick={() => onTabChange(tab.id)}
                      showIcon={true}
                      hideLabel={isCollapsed}
                      badge={tab.id === 'notifications' && notifUnreadCount > 0 ? notifUnreadCount : undefined}
                      upgradeRequired={tab.upgradeRequired}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="px-4 md:px-6 py-4 border-t border-slate-100">
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-100 ${isCollapsed ? 'justify-center' : 'flex-row-reverse'}`}
            >
              <LogOut size={18} />
              {!isCollapsed && <span className="font-black text-sm">{t('dashboard.logout', 'تسجيل الخروج')}</span>}
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

export default memo(DashboardSidebar);
