import React, { useCallback, useEffect, useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ApiService } from '@/services/api.service';
import type { AppItem, ShopAppItem } from '@/services/api/modules/apps';
import { Loader2, Download, Trash2, Power, PowerOff, Store, CheckCircle2, LayoutGrid, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/common/feedback/Toaster';

const { useSearchParams } = ReactRouterDOM as any;

const ModulesSettings = React.lazy(() => import('../../../components/MerchantDashboard/Settings/Modules'));

type AppWithStatus = AppItem & {
  installed?: boolean;
  isActive?: boolean;
  shopAppId?: string;
};

type AppsTabProps = {
  shop?: any;
  onSaved?: () => void;
  adminShopId?: string;
};

type InnerTab = 'apps' | 'upgrade';

const AppsTab: React.FC<AppsTabProps> = ({ shop, onSaved, adminShopId }) => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const { addToast } = useToast();

  const [apps, setApps] = useState<AppWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [searchParams] = useSearchParams();
  const sectionParam = searchParams.get('section');
  const [innerTab, setInnerTab] = useState<InnerTab>(sectionParam ? 'upgrade' : 'apps');

  const loadData = useCallback(async () => {
    try {
      const [allApps, myApps] = await Promise.all([
        ApiService.listApps(),
        ApiService.listMyApps(),
      ]);

      const installedMap = new Map<string, ShopAppItem>();
      for (const sa of Array.isArray(myApps) ? myApps : []) {
        if (sa.status === 'INSTALLED') {
          installedMap.set(sa.appId, sa);
        }
      }

      const merged: AppWithStatus[] = (Array.isArray(allApps) ? allApps : []).map((app: AppItem) => {
        const shopApp = installedMap.get(app.id);
        return {
          ...app,
          installed: !!shopApp,
          isActive: shopApp?.isActive ?? false,
          shopAppId: shopApp?.id,
        };
      });

      setApps(merged);
    } catch (e: any) {
      addToast(e?.message || t('business.dashboard.dataLoadError'), 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast, t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const setAction = (key: string, val: boolean) => {
    setActionLoading((prev) => ({ ...prev, [key]: val }));
  };

  const handleInstall = async (app: AppWithStatus) => {
    setAction(app.key, true);
    try {
      await ApiService.installApp(app.key);
      addToast(t('business.apps.installSuccess', { name: app.name }), 'success');
      await loadData();
    } catch (e: any) {
      addToast(e?.message || t('business.apps.installFailed'), 'error');
    } finally {
      setAction(app.key, false);
    }
  };

  const handleUninstall = async (app: AppWithStatus) => {
    setAction(app.key, true);
    try {
      await ApiService.uninstallApp(app.key);
      addToast(t('business.apps.uninstallSuccess', { name: app.name }), 'success');
      await loadData();
    } catch (e: any) {
      addToast(e?.message || t('business.apps.uninstallFailed'), 'error');
    } finally {
      setAction(app.key, false);
    }
  };

  const handleToggle = async (app: AppWithStatus) => {
    setAction(app.key, true);
    try {
      if (app.isActive) {
        await ApiService.disableApp(app.key);
        addToast(t('business.apps.disableSuccess', { name: app.name }), 'success');
      } else {
        await ApiService.enableApp(app.key);
        addToast(t('business.apps.enableSuccess', { name: app.name }), 'success');
      }
      await loadData();
    } catch (e: any) {
      addToast(e?.message || t('business.apps.actionFailed'), 'error');
    } finally {
      setAction(app.key, false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-cyan-500 w-10 h-10" />
        <p className="font-semibold text-slate-500">{t('business.dashboard.loadingSection')}</p>
      </div>
    );
  }

  const hasUpgradeAccess = Boolean(shop);

  return (
    <div className={`space-y-6 ${isArabic ? 'text-right' : 'text-left'}`} dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="flex items-center gap-3 mb-2">
        <Store size={24} className="text-cyan-500" />
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{t('business.apps.title')}</h2>
      </div>
      <p className="text-slate-500 text-sm mb-6">{t('business.apps.subtitle')}</p>

      {hasUpgradeAccess && (
        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => setInnerTab('apps')}
            className={`flex items-center gap-2 px-5 py-3 rounded-lg font-semibold text-sm transition-all ${
              innerTab === 'apps'
                ? 'bg-slate-900 text-white shadow-lg shadow-slate-200'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <LayoutGrid size={18} />
            {isArabic ? 'سوق التطبيقات' : 'Apps Marketplace'}
          </button>
          <button
            type="button"
            onClick={() => setInnerTab('upgrade')}
            className={`flex items-center gap-2 px-5 py-3 rounded-lg font-semibold text-sm transition-all ${
              innerTab === 'upgrade'
                ? 'bg-slate-900 text-white shadow-lg shadow-slate-200'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <RefreshCw size={18} />
            {isArabic ? 'ترقية الأقسام' : 'Upgrade Sections'}
          </button>
        </div>
      )}

      {innerTab === 'upgrade' && hasUpgradeAccess ? (
        <React.Suspense fallback={<div className="py-20 flex items-center justify-center"><Loader2 className="animate-spin text-cyan-500 w-10 h-10" /></div>}>
          <ModulesSettings shop={shop} onSaved={onSaved || (() => {})} adminShopId={adminShopId} defaultExpandedSection={sectionParam || undefined} />
        </React.Suspense>
      ) : (
        <>
      {apps.length === 0 ? (
        <div className="text-center py-16">
          <Store size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500 font-semibold">{t('business.apps.noApps')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {apps.map((app) => {
            const busy = !!actionLoading[app.key];
            return (
              <div
                key={app.id}
                className="relative bg-white rounded-lg border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3"
              >
                {app.installed && app.isActive && (
                  <div className="absolute top-3 left-3 rtl:right-3 rtl:left-auto">
                    <CheckCircle2 size={18} className="text-green-500" />
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-50 to-slate-100 flex items-center justify-center text-cyan-500 shrink-0">
                    <Store size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-slate-900 text-sm truncate">{app.name}</h3>
                    <span className="text-xs text-slate-500 font-mono">v{app.version}</span>
                  </div>
                </div>

                {app.description && (
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{app.description}</p>
                )}

                <div className="mt-auto flex items-center gap-2 pt-2">
                  {!app.installed ? (
                    <button
                      onClick={() => handleInstall(app)}
                      disabled={busy}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-cyan-500 text-black font-semibold text-xs hover:brightness-110 transition-all disabled:opacity-50"
                    >
                      {busy ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                      {t('business.apps.install')}
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleToggle(app)}
                        disabled={busy}
                        className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg font-semibold text-xs transition-all disabled:opacity-50 ${
                          app.isActive
                            ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                            : 'bg-green-50 text-green-700 hover:bg-green-100'
                        }`}
                      >
                        {busy ? <Loader2 size={14} className="animate-spin" /> : app.isActive ? <PowerOff size={14} /> : <Power size={14} />}
                        {app.isActive ? t('business.apps.disable') : t('business.apps.enable')}
                      </button>
                      <button
                        onClick={() => handleUninstall(app)}
                        disabled={busy}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-red-50 text-red-600 font-semibold text-xs hover:bg-red-100 transition-all disabled:opacity-50"
                      >
                        {busy ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        {t('business.apps.uninstall')}
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
        </>
      )}
    </div>
  );
};

export default AppsTab;
