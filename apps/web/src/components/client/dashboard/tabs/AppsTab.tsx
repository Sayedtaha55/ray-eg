'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Loader2, Download, Trash2, Power, PowerOff, Store, CheckCircle2 } from 'lucide-react';
import { clientFetch } from '@/lib/api/client';
import { useT } from '@/i18n/useT';

type AppWithStatus = {
  id: string;
  key: string;
  name: string;
  version: string;
  description?: string;
  installed?: boolean;
  isActive?: boolean;
  shopAppId?: string;
};

const AppsTab: React.FC = () => {
  const t = useT();
  const [apps, setApps] = useState<AppWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  const loadData = useCallback(async () => {
    try {
      const [allApps, myApps] = await Promise.all([
        clientFetch<any[]>('/v1/apps'),
        clientFetch<any[]>('/v1/apps/mine'),
      ]);
      const installedMap = new Map<string, any>();
      for (const sa of Array.isArray(myApps) ? myApps : []) {
        if (sa?.status === 'INSTALLED') installedMap.set(sa.appId, sa);
      }
      const merged: AppWithStatus[] = (Array.isArray(allApps) ? allApps : []).map((app: any) => {
        const shopApp = installedMap.get(app.id);
        return { ...app, installed: !!shopApp, isActive: shopApp?.isActive ?? false, shopAppId: shopApp?.id };
      });
      setApps(merged);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const setAction = (key: string, val: boolean) => setActionLoading(prev => ({ ...prev, [key]: val }));

  const handleInstall = async (app: AppWithStatus) => {
    setAction(app.key, true);
    try { await clientFetch<any>(`/v1/apps/${app.key}/install`, { method: 'POST' }); await loadData(); }
    catch {} finally { setAction(app.key, false); }
  };

  const handleUninstall = async (app: AppWithStatus) => {
    setAction(app.key, true);
    try { await clientFetch<any>(`/v1/apps/${app.key}/uninstall`, { method: 'POST' }); await loadData(); }
    catch {} finally { setAction(app.key, false); }
  };

  const handleToggle = async (app: AppWithStatus) => {
    setAction(app.key, true);
    try {
      if (app.isActive) await clientFetch<any>(`/v1/apps/${app.key}/disable`, { method: 'POST' });
      else await clientFetch<any>(`/v1/apps/${app.key}/enable`, { method: 'POST' });
      await loadData();
    } catch {} finally { setAction(app.key, false); }
  };

  if (loading) return <div className="py-20 flex flex-col items-center justify-center gap-4"><Loader2 className="animate-spin text-[#00E5FF] w-10 h-10" /><p className="font-bold text-slate-400">{t('business.dashboard.loadingSection', 'جاري التحميل')}</p></div>;

  return (
    <div className="space-y-6 text-right" dir="rtl">
      <div className="flex items-center gap-3 mb-2"><Store size={24} className="text-[#00E5FF]" /><h2 className="text-xl sm:text-2xl font-black text-slate-900">{t('business.apps.title', 'التطبيقات')}</h2></div>
      <p className="text-slate-500 text-sm mb-6">{t('business.apps.subtitle', 'إدارة التطبيقات المتصلة بالمتجر')}</p>
      {apps.length === 0 ? (
        <div className="text-center py-16"><Store size={48} className="mx-auto text-slate-300 mb-4" /><p className="text-slate-400 font-bold">{t('business.apps.noApps', 'لا توجد تطبيقات')}</p></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {apps.map(app => {
            const busy = !!actionLoading[app.key];
            return (
              <div key={app.id} className="relative bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3">
                {app.installed && app.isActive && <div className="absolute top-3 left-3 rtl:right-3 rtl:left-auto"><CheckCircle2 size={18} className="text-green-500" /></div>}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-50 to-slate-100 flex items-center justify-center text-[#00E5FF] shrink-0"><Store size={20} /></div>
                  <div className="min-w-0 flex-1"><h3 className="font-bold text-slate-900 text-sm truncate">{app.name}</h3><span className="text-[10px] text-slate-400 font-mono">v{app.version}</span></div>
                </div>
                {app.description && <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{app.description}</p>}
                <div className="mt-auto flex items-center gap-2 pt-2">
                  {!app.installed ? (
                    <button onClick={() => handleInstall(app)} disabled={busy} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#00E5FF] text-black font-bold text-xs hover:brightness-110 transition-all disabled:opacity-50">
                      {busy ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}{t('business.apps.install', 'تثبيت')}
                    </button>
                  ) : (
                    <>
                      <button onClick={() => handleToggle(app)} disabled={busy} className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs transition-all disabled:opacity-50 ${app.isActive ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}>
                        {busy ? <Loader2 size={14} className="animate-spin" /> : app.isActive ? <PowerOff size={14} /> : <Power size={14} />}{app.isActive ? t('business.apps.disable', 'تعطيل') : t('business.apps.enable', 'تفعيل')}
                      </button>
                      <button onClick={() => handleUninstall(app)} disabled={busy} className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 text-red-600 font-bold text-xs hover:bg-red-100 transition-all disabled:opacity-50">
                        {busy ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}{t('business.apps.uninstall', 'إزالة')}
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AppsTab;
