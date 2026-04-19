import React, { lazy, Suspense } from 'react';
import { Loader2, RefreshCw, Store, Palette, Bell, Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import BrandLogo from '@/components/common/BrandLogo';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const NotificationPanel = lazy(() => import('./NotificationPanel'));

interface DashboardHeaderProps {
  hasPosTab: boolean;
  unreadCount: number;
  isNotifOpen: boolean;
  setNotifOpen: (val: boolean) => void;
  setSidebarOpen: (val: boolean) => void;
  handleMarkRead: () => void;
  buildDashboardUrl: (tab?: string) => string;
  buildBuilderIndexUrl: () => string;
  navigate: (url: string) => void;
  notifications: any[];
}

const DashboardHeader: React.FC<DashboardHeaderProps> = (props) => {
  const { t } = useTranslation();
  return (
    <header className="md:hidden min-h-20 bg-white/95 backdrop-blur text-slate-900 flex items-center justify-between gap-3 px-4 py-3 sticky top-0 z-[200] border-b border-slate-100">
      <Link to="/" className="flex min-w-0 items-center gap-2.5">
        <BrandLogo variant="business" iconOnly />
        <span className="truncate text-sm font-black tracking-tight">{t('dashboardHeader.brandTitle')}</span>
      </Link>

      <div className="flex shrink-0 items-center gap-2">
        <button
          onClick={() => window.location.reload()}
          className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-900 transition-all"
          title={t('dashboardHeader.refresh')}
        >
          <RefreshCw className="w-6 h-6" />
        </button>
        {props.hasPosTab && (
          <button
            onClick={() => props.navigate(props.buildDashboardUrl('pos'))}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-900 transition-all"
            title={t('dashboardHeader.posSystem')}
          >
            <Store className="w-6 h-6" />
          </button>
        )}
        <button
          onClick={() => props.navigate(props.buildBuilderIndexUrl())}
          className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-900 transition-all"
          title={t('dashboardHeader.storeIdentity')}
        >
          <Palette className="w-6 h-6" />
        </button>
        <div className="relative" onClick={() => { props.setNotifOpen(true); props.handleMarkRead(); }}>
          <motion.div animate={props.unreadCount > 0 ? { scale: [1, 1.2, 1] } : {}} transition={{ repeat: Infinity, duration: 1.5 }}>
            <Bell className={`w-6 h-6 ${props.unreadCount > 0 ? 'text-[#00E5FF]' : 'text-slate-700'}`} />
          </motion.div>
          {props.unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white text-[8px] flex items-center justify-center font-black text-white">
              {props.unreadCount}
            </span>
          )}
        </div>
        <button onClick={() => props.setSidebarOpen(true)} className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-900 transition-all">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <Suspense fallback={null}>
        <NotificationPanel
          isOpen={props.isNotifOpen}
          onClose={() => props.setNotifOpen(false)}
          notifications={props.notifications}
          onMarkRead={props.handleMarkRead}
        />
      </Suspense>
    </header>
  );
};

export default React.memo(DashboardHeader);
